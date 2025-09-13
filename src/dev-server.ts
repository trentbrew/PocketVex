/**
 * PocketVex Development Server
 * Real-time schema migration server similar to `npx convex dev`
 */

import { watch } from 'chokidar';
import { join, relative, basename } from 'path';
import { readFile, writeFile, mkdir, access, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import { SchemaDiff } from './utils/diff.js';
import { PocketBaseClient } from './utils/pocketbase.js';
import { TypeGenerator } from './utils/type-generator.js';
import { credentialStore } from './utils/credential-store.js';
import { DemoUtils } from './utils/demo-utils.js';
import { getPocketVexConfig } from './config/pocketvex-config.js';

export interface DevServerConfig {
  url: string;
  adminEmail: string;
  adminPassword: string;
  schemaDir: string;
  migrationsDir: string;
  generatedDir: string;
  watchPatterns: string[];
  autoApply: boolean;
  generateTypes: boolean;
  verbose: boolean;
}

export class DevServer {
  private config: DevServerConfig;
  private client: PocketBaseClient;
  private watcher: any;
  private spinner: Ora;
  private isRunning: boolean = false;
  private lastSchemaHash: string = '';
  private pocketVexConfig: ReturnType<typeof getPocketVexConfig>;

  constructor(config: DevServerConfig) {
    this.config = config;
    this.pocketVexConfig = getPocketVexConfig();
    this.client = new PocketBaseClient({
      url: config.url,
      adminEmail: config.adminEmail,
      adminPassword: config.adminPassword,
    });
    this.spinner = ora();
  }

  /**
   * Start the development server
   */
  async start(): Promise<void> {
    try {
      this.isRunning = true;

      DemoUtils.printHeader(
        'PocketVex Dev Server',
        'Real-time schema migration',
      );
      console.log(chalk.gray(`Watching: ${this.config.schemaDir}`));
      console.log(chalk.gray(`Target: ${this.config.url}`));
      console.log(
        chalk.gray(
          `Auto-apply: ${this.config.autoApply ? 'enabled' : 'disabled'}`,
        ),
      );
      console.log(
        chalk.gray(
          `Type generation: ${
            this.config.generateTypes ? 'enabled' : 'disabled'
          }`,
        ),
      );

      // Ensure directories exist
      await this.ensureDirectories();

      // Initial connection test
      await this.testConnection();

      // Initial schema sync
      await this.syncSchema();

      // Deploy existing JavaScript VM files
      await this.deployExistingJavaScriptFiles();

      // Start file watching
      await this.startWatching();

      console.log(chalk.green('\n✅ Dev server started successfully!'));
      console.log(chalk.gray('Press Ctrl+C to stop'));

      // Keep the process alive
      process.on('SIGINT', () => this.stop());
      process.on('SIGTERM', () => this.stop());
    } catch (error) {
      this.spinner.fail('Failed to start dev server');
      DemoUtils.printError(
        `Startup failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      process.exit(1);
    }
  }

  /**
   * Stop the development server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;
    console.log(chalk.gray('\n🛑 Stopping dev server...'));

    if (this.watcher) {
      await this.watcher.close();
    }

    console.log(chalk.green('✅ Dev server stopped'));
    process.exit(0);
  }

  /**
   * Test connection to PocketBase
   */
  private async testConnection(): Promise<void> {
    this.spinner.start('Testing connection...');

    try {
      await this.client.authenticate();
      this.spinner.succeed('Connected to PocketBase');
    } catch (error) {
      this.spinner.fail('Connection failed');
      throw new Error(
        `Failed to connect to PocketBase: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    const dirs = [
      this.config.schemaDir,
      this.config.migrationsDir,
      this.config.generatedDir,
    ];

    for (const dir of dirs) {
      try {
        await access(dir);
      } catch {
        await mkdir(dir, { recursive: true });
        if (this.config.verbose) {
          console.log(chalk.gray(`Created directory: ${dir}`));
        }
      }
    }
  }

  /**
   * Start watching for file changes
   */
  private async startWatching(): Promise<void> {
    this.spinner.start('Starting file watcher...');

    this.watcher = watch(this.config.watchPatterns, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher
      .on('add', (path: string) => this.handleFileChange('add', path))
      .on('change', (path: string) => this.handleFileChange('change', path))
      .on('unlink', (path: string) => this.handleFileChange('unlink', path))
      .on('error', (error: Error) => {
        console.error(chalk.red('Watcher error:'), error);
      });

    this.spinner.succeed('File watcher started');
  }

  /**
   * Handle file changes
   */
  private async handleFileChange(
    event: string,
    filePath: string,
  ): Promise<void> {
    if (!this.isRunning) return;

    const relativePath = relative(process.cwd(), filePath);
    const fileName = basename(filePath);

    if (this.config.verbose) {
      console.log(chalk.gray(`\n📁 ${event}: ${relativePath}`));
    }

    // Resolve configured directories once per call
    const schemaDir = this.pocketVexConfig.getSchemaDirectory();
    const jobsDir = this.pocketVexConfig.getJobsDirectory();
    const hooksDir = this.pocketVexConfig.getHooksDirectory();
    const commandsDir = this.pocketVexConfig.getCommandsDirectory();
    const queriesDir = this.pocketVexConfig.getQueriesDirectory();

    // Handle schema files (.ts or .js under schema directory)
    if (
      filePath.includes(schemaDir) &&
      (fileName.endsWith('.ts') || fileName.endsWith('.js'))
    ) {
      await this.handleSchemaChange(event, filePath);
      return;
    }

    // Handle JavaScript VM files (.js under jobs/hooks/commands/queries)
    const jsVmDirs = [jobsDir, hooksDir, commandsDir, queriesDir];
    if (fileName.endsWith('.js') && jsVmDirs.some((d) => filePath.includes(d))) {
      await this.handleJavaScriptVMChange(event, filePath);
      return;
    }
  }

  /**
   * Handle schema file changes
   */
  private async handleSchemaChange(
    event: string,
    filePath: string,
  ): Promise<void> {
    try {
      if (event === 'unlink') {
        console.log(
          chalk.yellow(`⚠️  Schema file removed: ${basename(filePath)}`),
        );
        return;
      }

      // Read the schema file
      const schemaContent = await readFile(filePath, 'utf8');
      const schemaHash = this.hashContent(schemaContent);

      // Skip if content hasn't changed
      if (schemaHash === this.lastSchemaHash) {
        return;
      }

      this.lastSchemaHash = schemaHash;

      console.log(chalk.blue(`\n🔄 Schema changed: ${basename(filePath)}`));

      // Parse and validate schema
      const schema = await this.parseSchemaFile(filePath, schemaContent);

      // Sync with PocketBase
      await this.syncSchema(schema);
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Schema sync failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        ),
      );
    }
  }

  /**
   * Handle JavaScript VM file changes
   */
  private async handleJavaScriptVMChange(
    event: string,
    filePath: string,
  ): Promise<void> {
    const fileName = basename(filePath);
    const relativePath = relative(process.cwd(), filePath);

    console.log(chalk.blue(`\n🔄 JS VM file ${event}: ${fileName}`));

    try {
      if (event === 'add' || event === 'change') {
        await this.deployJavaScriptFile(filePath);
      } else if (event === 'unlink') {
        await this.removeJavaScriptFile(filePath);
      }
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Failed to sync JS VM file: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        ),
      );
    }
  }

  /**
   * Handle JavaScript VM file changes (informational mode)
   */
  private async deployJavaScriptFile(filePath: string): Promise<void> {
    const fileName = basename(filePath);
    const relativePath = relative(process.cwd(), filePath);

    // Determine the target directory based on the file path
    let targetDir = '';
    const jobsDir = this.pocketVexConfig.getJobsDirectory();
    const hooksDir = this.pocketVexConfig.getHooksDirectory();
    const commandsDir = this.pocketVexConfig.getCommandsDirectory();
    const queriesDir = this.pocketVexConfig.getQueriesDirectory();

    if (filePath.includes(jobsDir)) {
      targetDir = 'jobs';
    } else if (filePath.includes(hooksDir)) {
      targetDir = 'hooks';
    } else if (filePath.includes(commandsDir)) {
      targetDir = 'commands';
    } else if (filePath.includes(queriesDir)) {
      targetDir = 'queries';
    } else {
      console.log(
        chalk.yellow(`⚠️  Unknown JS VM directory for: ${relativePath}`),
      );
      return;
    }

    // For now, just log the file change and provide deployment instructions
    console.log(chalk.blue(`📝 JS VM file ready: ${fileName}`));
    console.log(chalk.gray(`   Directory: ${targetDir}/`));
    console.log(chalk.gray(`   Path: ${relativePath}`));
    console.log(
      chalk.gray(`   📋 To deploy: Copy this file to your PocketBase instance`),
    );
    console.log(chalk.gray(`   📖 See README.md for deployment instructions`));
  }

  /**
   * Scan existing JavaScript VM files on startup
   */
  private async deployExistingJavaScriptFiles(): Promise<void> {
    console.log(chalk.blue('\n🔍 Scanning JavaScript VM files...'));

    const jsVmDirs = [
      this.pocketVexConfig.getJobsDirectory(),
      this.pocketVexConfig.getHooksDirectory(),
      this.pocketVexConfig.getCommandsDirectory(),
      this.pocketVexConfig.getQueriesDirectory(),
    ];
    let foundCount = 0;

    for (const dir of jsVmDirs) {
      const dirPath = join(process.cwd(), dir);

      if (existsSync(dirPath)) {
        try {
          const files = await readdir(dirPath);
          const jsFiles = files.filter((file) => file.endsWith('.js'));

          if (jsFiles.length > 0) {
            console.log(
              chalk.gray(`  📁 Found ${jsFiles.length} files in ${dir}/`),
            );

            for (const file of jsFiles) {
              const filePath = join(dirPath, file);
              console.log(chalk.blue(`  📝 ${file} (ready for deployment)`));
              foundCount++;
            }
          }
        } catch (error) {
          console.log(chalk.yellow(`  ⚠️  Could not read ${dir}/ directory`));
        }
      }
    }

    if (foundCount > 0) {
      console.log(chalk.green(`✅ Found ${foundCount} JavaScript VM files`));
      console.log(
        chalk.gray('   📋 Files are ready for manual deployment to PocketBase'),
      );
      console.log(
        chalk.gray('   📖 See README.md for deployment instructions'),
      );
    } else {
      console.log(chalk.gray('ℹ️  No JavaScript VM files found'));
    }
  }

  /**
   * Handle JavaScript VM file removal (informational mode)
   */
  private async removeJavaScriptFile(filePath: string): Promise<void> {
    const fileName = basename(filePath);
    const relativePath = relative(process.cwd(), filePath);

    // Determine the target directory
    let targetDir = '';
    const jobsDir = this.pocketVexConfig.getJobsDirectory();
    const hooksDir = this.pocketVexConfig.getHooksDirectory();
    const commandsDir = this.pocketVexConfig.getCommandsDirectory();
    const queriesDir = this.pocketVexConfig.getQueriesDirectory();

    if (filePath.includes(jobsDir)) {
      targetDir = 'jobs';
    } else if (filePath.includes(hooksDir)) {
      targetDir = 'hooks';
    } else if (filePath.includes(commandsDir)) {
      targetDir = 'commands';
    } else if (filePath.includes(queriesDir)) {
      targetDir = 'queries';
    } else {
      return;
    }

    console.log(chalk.yellow(`🗑️  JS VM file removed: ${fileName}`));
    console.log(chalk.gray(`   Directory: ${targetDir}/`));
    console.log(chalk.gray(`   Path: ${relativePath}`));
    console.log(
      chalk.gray(`   📋 Remember to remove from your PocketBase instance`),
    );
  }

  /**
   * Sync schema with PocketBase
   */
  private async syncSchema(desiredSchema?: any): Promise<void> {
    try {
      this.spinner.start('Syncing schema...');

      // Get current schema from PocketBase
      const currentSchema = await this.client.fetchCurrentSchema();

      // Use provided schema or load from files
      const targetSchema = desiredSchema || (await this.loadSchemaFromFiles());

      if (!targetSchema) {
        this.spinner.fail('No schema found to sync');
        return;
      }

      // Build diff plan
      const plan = SchemaDiff.buildDiffPlan(targetSchema, currentSchema);

      this.spinner.succeed('Schema analysis complete');

      // Display plan
      this.displayMigrationPlan(plan);

      // Apply safe changes automatically
      if (plan.safe.length > 0 && this.config.autoApply) {
        console.log(
          chalk.blue(`\n🔄 Applying ${plan.safe.length} safe changes...`),
        );
        await this.applySafeChanges(plan.safe);
      } else if (plan.safe.length > 0) {
        console.log(
          chalk.yellow(
            `\n⚠️  ${plan.safe.length} safe changes available but auto-apply is disabled`,
          ),
        );
      }

      // Generate migration files for unsafe changes
      if (plan.unsafe.length > 0) {
        await this.generateMigrationFiles(plan.unsafe);
      }

      // Generate types if enabled
      if (this.config.generateTypes) {
        await this.generateTypes(targetSchema);
      }
    } catch (error) {
      this.spinner.fail('Schema sync failed');
      throw error;
    }
  }

  /**
   * Load schema from files
   */
  private async loadSchemaFromFiles(): Promise<any> {
    // This would load schema from the schema directory
    // For now, return null to indicate no schema found
    return null;
  }

  /**
   * Parse schema file content
   */
  private async parseSchemaFile(
    filePath: string,
    content: string,
  ): Promise<any> {
    try {
      // Convert the file path to an absolute path for import
      const absolutePath = require.resolve(filePath);
      const module = await import(absolutePath);
      return module.schema || module.default;
    } catch (error) {
      // Fallback: try to parse the content directly
      try {
        // Remove imports and TypeScript-specific syntax and eval the content
        const jsContent = content
          // strip ESM/CJS imports for eval fallback
          .replace(/^\s*import[^\n]*\n/gm, '')
          .replace(/^\s*export\s+\{[^}]*\}\s*;?\s*$/gm, '')
          // normalize schema export
          .replace(/export\s+const\s+schema\s*=\s*/, 'const schema = ')
          .replace(/as\s+const/g, '')
          .replace(/;\s*$/, '');

        // Provide a minimal Rules helper prelude so schema can reference Rules without import
        const prelude = [
          "const __paren = (s) => '(' + s + ')';",
          "const __join = (ops, op) => ops.filter(Boolean).map(s => __paren(String(s))).join(' ' + op + ' ');",
          'const allow = {',
          "  public: () => '1=1',",
          "  deny: () => '1=2',",
          "  auth: () => '@request.auth.id != \"\"',",
          "  role: (name, field = 'role') => '@request.auth.' + field + ' = \"' + name + '\"',",
          "  anyRole: (names, field = 'role') => __join(names.map(n => '@request.auth.' + field + ' = \"' + n + '\"'), '||'),",
          "  owner: (field) => field + ' = @request.auth.id',",
          "  relatedOwner: (relation, ownerField = 'author') => relation + '.' + ownerField + ' = @request.auth.id',",
          "  published: (field = 'isPublished') => field + ' = true',",
          "  and: (...rules) => __join(rules, '&&'),",
          "  or: (...rules) => __join(rules, '||'),",
          "  not: (rule) => (rule ? '!(' + rule + ')' : undefined),",
          '};',
          'const Rules = allow;',
        ].join('\n');

        // Create a safe evaluation context
        const context = { schema: null };
        const func = new Function('context', `${prelude}\n${jsContent}; context.schema = schema;`);
        func(context);

        return context.schema;
      } catch (evalError) {
        throw new Error(
          `Failed to parse schema file: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }
  }

  /**
   * Display migration plan
   */
  private displayMigrationPlan(plan: any): void {
    console.log(chalk.gray('\n📋 Migration Plan:'));
    console.log(chalk.green(`  Safe operations: ${plan.safe.length}`));
    console.log(chalk.yellow(`  Unsafe operations: ${plan.unsafe.length}`));

    if (plan.safe.length > 0) {
      console.log(chalk.gray('\n  Safe changes:'));
      plan.safe.forEach((op: any, i: number) => {
        console.log(chalk.gray(`    ${i + 1}. ${op.summary}`));
      });
    }

    if (plan.unsafe.length > 0) {
      console.log(chalk.gray('\n  Unsafe changes (NOT APPLIED):'));
      plan.unsafe.forEach((op: any, i: number) => {
        console.log(chalk.yellow(`    ${i + 1}. ${op.summary}`));
        if (op.requiresDataMigration) {
          console.log(chalk.red(`       ⚠️  Requires data migration`));
        }
      });
    }
  }

  /**
   * Apply safe changes automatically
   */
  private async applySafeChanges(safeOperations: any[]): Promise<void> {
    if (safeOperations.length === 0) {
      console.log(chalk.gray('No safe operations to apply'));
      return;
    }

    console.log(
      chalk.blue(
        `\n🔧 Starting to apply ${safeOperations.length} safe operations...`,
      ),
    );
    const applySpinner = ora('Applying safe changes...').start();

    try {
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < safeOperations.length; i++) {
        const operation = safeOperations[i];
        try {
          console.log(chalk.gray(`  🔄 Applying: ${operation.summary}`));
          await this.client.applyOperation(operation);
          console.log(chalk.green(`  ✅ Applied: ${operation.summary}`));
          successCount++;
        } catch (error) {
          console.log(chalk.red(`  ❌ Failed: ${operation.summary}`));
          console.log(
            chalk.gray(
              `     Error: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
            ),
          );
          failureCount++;
        }

        // Small delay between operations to avoid server rate limits
        if (i < safeOperations.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }

      if (failureCount === 0) {
        applySpinner.succeed(
          `Successfully applied ${successCount} safe changes`,
        );
      } else {
        applySpinner.warn(
          `Applied ${successCount} changes, ${failureCount} failed`,
        );
      }
    } catch (error) {
      applySpinner.fail('Failed to apply safe changes');
      throw error;
    }
  }

  /**
   * Generate migration files for unsafe changes
   */
  private async generateMigrationFiles(unsafeOperations: any[]): Promise<void> {
    if (unsafeOperations.length === 0) return;

    const generateSpinner = ora('Generating migration files...').start();

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const migrationFile = join(
        this.config.migrationsDir,
        `${timestamp}_unsafe_changes.js`,
      );

      const migrationContent = this.generateMigrationContent(unsafeOperations);
      await writeFile(migrationFile, migrationContent);

      generateSpinner.succeed(
        `Generated migration file: ${basename(migrationFile)}`,
      );
      console.log(chalk.gray(`  File: ${migrationFile}`));
    } catch (error) {
      generateSpinner.fail('Failed to generate migration files');
      throw error;
    }
  }

  /**
   * Generate migration file content
   */
  private generateMigrationContent(operations: any[]): string {
    const timestamp = new Date().toISOString();

    return `/**
 * Migration: ${timestamp}
 * Generated by PocketVex Dev Server
 */

export const up = async (pb) => {
  // Unsafe operations requiring manual review
${operations.map((op, i) => `  // ${i + 1}. ${op.summary}`).join('\n')}

  // TODO: Implement migration logic
  console.log('Running migration: ${timestamp}');
};

export const down = async (pb) => {
  // Rollback operations
  console.log('Rolling back migration: ${timestamp}');

  // TODO: Implement rollback logic
};
`;
  }

  /**
   * Generate TypeScript types
   */
  private async generateTypes(schema: any): Promise<void> {
    const typeSpinner = ora('Generating TypeScript types...').start();

    try {
      const typesContent = TypeGenerator.generateTypes(schema);
      const typesFile = join(this.config.generatedDir, 'types.ts');
      await writeFile(typesFile, typesContent);

      typeSpinner.succeed('TypeScript types generated');
      console.log(chalk.gray(`  File: ${typesFile}`));
    } catch (error) {
      typeSpinner.fail('Failed to generate types');
      throw error;
    }
  }

  /**
   * Hash content for change detection
   */
  private hashContent(content: string): string {
    // Simple hash function for change detection
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

/**
 * Start development server with configuration
 */
export async function startDevServer(
  config: Partial<DevServerConfig> = {},
): Promise<void> {
  // If no URL is provided, ask for host selection
  if (!config.url) {
    config.url = await DemoUtils.selectHost();
  }

  const pocketVexConfig = getPocketVexConfig();
  const defaultConfig: DevServerConfig = {
    url: 'http://127.0.0.1:8090',
    adminEmail: 'admin@example.com',
    adminPassword: 'admin123',
    schemaDir: pocketVexConfig.getSchemaDirectory(),
    migrationsDir: pocketVexConfig.getMigrationsDirectory(),
    generatedDir: pocketVexConfig.getGeneratedDirectory(),
    watchPatterns: pocketVexConfig.getWatchPatterns(),
    autoApply: true,
    generateTypes: true,
    verbose: false,
    ...config,
  };

  // Try to get cached credentials for the selected host
  const cached = await credentialStore.getCredentials(defaultConfig.url);
  if (cached) {
    defaultConfig.adminEmail = cached.email;
    defaultConfig.adminPassword = cached.password;
  }

  const server = new DevServer(defaultConfig);
  await server.start();
}
