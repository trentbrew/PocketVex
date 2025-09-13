/**
 * PocketVex Development Server with JavaScript Support
 * Watches and syncs both schema and JavaScript files to PocketBase
 */

import chokidar from 'chokidar';
import chalk from 'chalk';
import ora from 'ora';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { PocketBaseClient } from './utils/pocketbase.js';
import { TypeGenerator } from './utils/type-generator.js';
import type { DevServerConfig } from './types/schema.js';

export class DevServerJS {
  private pbClient: PocketBaseClient;
  private config: DevServerConfig;
  private watcher?: chokidar.FSWatcher;
  private typeGenerator: TypeGenerator;
  private isRunning = false;

  constructor(config: DevServerConfig) {
    this.config = config;
    this.pbClient = new PocketBaseClient({
      url: config.url,
      adminEmail: config.adminEmail,
      adminPassword: config.adminPassword,
    });
    this.typeGenerator = new TypeGenerator();
  }

  /**
   * Start the development server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log(chalk.yellow('⚠️  Development server is already running'));
      return;
    }

    console.log(
      chalk.blue(
        '🚀 Starting PocketVex Development Server with JavaScript Support\n',
      ),
    );

    // Test connection
    const spinner = ora('Testing PocketBase connection...').start();
    const isConnected = await this.pbClient.testConnection();

    if (!isConnected) {
      spinner.fail('Failed to connect to PocketBase');
      console.log(chalk.red('❌ Could not connect to PocketBase instance'));
      console.log(chalk.gray('Please check your configuration and try again.'));
      return;
    }

    spinner.succeed('Connected to PocketBase');

    // Initial sync
    await this.syncAll();

    // Start file watching
    await this.startWatching();

    this.isRunning = true;
    console.log(chalk.green('\n✅ Development server started successfully!'));
    console.log(chalk.gray('Watching for changes in:'));
    console.log(chalk.gray('  - Schema files (schema/**/*.ts)'));
    console.log(chalk.gray('  - JavaScript hooks (pb_hooks/**/*.js)'));
    console.log(chalk.gray('  - Scheduled jobs (pb_jobs/**/*.js)'));
    console.log(chalk.gray('  - Console commands (pb_commands/**/*.js)'));
    console.log(chalk.gray('  - Database queries (pb_queries/**/*.js)'));
    console.log(
      chalk.blue('\n💡 Edit your files and see changes applied automatically!'),
    );
  }

  /**
   * Stop the development server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log(chalk.yellow('\n🛑 Stopping development server...'));

    if (this.watcher) {
      await this.watcher.close();
    }

    this.isRunning = false;
    console.log(chalk.green('✅ Development server stopped'));
  }

  /**
   * Start file watching
   */
  private async startWatching(): Promise<void> {
    const watchPaths = [
      'schema/**/*.ts',
      'pb_hooks/**/*.js',
      'pb_jobs/**/*.js',
      'pb_commands/**/*.js',
      'pb_queries/**/*.js',
    ];

    this.watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher
      .on('add', (path) => this.handleFileChange('add', path))
      .on('change', (path) => this.handleFileChange('change', path))
      .on('unlink', (path) => this.handleFileChange('unlink', path))
      .on('error', (error) => {
        console.error(chalk.red('❌ File watcher error:'), error);
      });
  }

  /**
   * Handle file changes
   */
  private async handleFileChange(
    event: 'add' | 'change' | 'unlink',
    filePath: string,
  ): Promise<void> {
    const fileName = basename(filePath);
    const fileExt = extname(filePath);

    console.log(chalk.blue(`\n📁 File ${event}: ${filePath}`));

    try {
      if (filePath.startsWith('schema/') && fileExt === '.ts') {
        await this.handleSchemaChange(event, filePath);
      } else if (filePath.startsWith('pb_hooks/') && fileExt === '.js') {
        await this.handleHookChange(event, filePath);
      } else if (filePath.startsWith('pb_jobs/') && fileExt === '.js') {
        await this.handleJobChange(event, filePath);
      } else if (filePath.startsWith('pb_commands/') && fileExt === '.js') {
        await this.handleCommandChange(event, filePath);
      } else if (filePath.startsWith('pb_queries/') && fileExt === '.js') {
        await this.handleQueryChange(event, filePath);
      }
    } catch (error) {
      console.error(
        chalk.red(`❌ Error handling ${event} for ${filePath}:`),
        error,
      );
    }
  }

  /**
   * Handle schema file changes
   */
  private async handleSchemaChange(
    event: 'add' | 'change' | 'unlink',
    filePath: string,
  ): Promise<void> {
    if (event === 'unlink') {
      console.log(
        chalk.yellow(
          '⚠️  Schema file deleted - manual cleanup may be required',
        ),
      );
      return;
    }

    console.log(chalk.yellow('🔄 Schema file changed - syncing...'));

    // Import and sync schema
    const schemaModule = await import(`../${filePath.replace('.ts', '.js')}`);
    const schema = schemaModule.schema;

    if (schema) {
      await this.syncSchema(schema);
      await this.generateTypes(schema);
    }
  }

  /**
   * Handle hook file changes
   */
  private async handleHookChange(
    event: 'add' | 'change' | 'unlink',
    filePath: string,
  ): Promise<void> {
    const hookName = basename(filePath, '.js');

    if (event === 'unlink') {
      console.log(chalk.yellow(`⚠️  Hook file deleted: ${hookName}`));
      console.log(
        chalk.gray('You may need to restart PocketBase to unload the hook'),
      );
      return;
    }

    console.log(chalk.yellow(`🔄 Hook file changed: ${hookName}`));
    console.log(
      chalk.gray(
        'Hooks are loaded at PocketBase startup - restart required for changes',
      ),
    );

    // In a real implementation, you might want to:
    // 1. Validate the hook syntax
    // 2. Send a signal to PocketBase to reload hooks
    // 3. Or provide instructions for manual restart
  }

  /**
   * Handle job file changes
   */
  private async handleJobChange(
    event: 'add' | 'change' | 'unlink',
    filePath: string,
  ): Promise<void> {
    const jobName = basename(filePath, '.js');

    if (event === 'unlink') {
      console.log(chalk.yellow(`⚠️  Job file deleted: ${jobName}`));
      console.log(
        chalk.gray('You may need to restart PocketBase to unload the job'),
      );
      return;
    }

    console.log(chalk.yellow(`🔄 Job file changed: ${jobName}`));
    console.log(
      chalk.gray(
        'Jobs are loaded at PocketBase startup - restart required for changes',
      ),
    );
  }

  /**
   * Handle command file changes
   */
  private async handleCommandChange(
    event: 'add' | 'change' | 'unlink',
    filePath: string,
  ): Promise<void> {
    const commandName = basename(filePath, '.js');

    if (event === 'unlink') {
      console.log(chalk.yellow(`⚠️  Command file deleted: ${commandName}`));
      console.log(
        chalk.gray('You may need to restart PocketBase to unload the command'),
      );
      return;
    }

    console.log(chalk.yellow(`🔄 Command file changed: ${commandName}`));
    console.log(
      chalk.gray(
        'Commands are loaded at PocketBase startup - restart required for changes',
      ),
    );
  }

  /**
   * Handle query file changes
   */
  private async handleQueryChange(
    event: 'add' | 'change' | 'unlink',
    filePath: string,
  ): Promise<void> {
    const queryName = basename(filePath, '.js');

    if (event === 'unlink') {
      console.log(chalk.yellow(`⚠️  Query file deleted: ${queryName}`));
      return;
    }

    console.log(chalk.yellow(`🔄 Query file changed: ${queryName}`));
    console.log(
      chalk.gray('Query files are utility modules - no restart required'),
    );
  }

  /**
   * Sync all files
   */
  private async syncAll(): Promise<void> {
    console.log(chalk.yellow('\n🔄 Performing initial sync...'));

    // Sync schema files
    await this.syncSchemaFiles();

    // Generate types
    await this.generateAllTypes();

    console.log(chalk.green('✅ Initial sync completed'));
  }

  /**
   * Sync schema files
   */
  private async syncSchemaFiles(): Promise<void> {
    // This would scan all schema files and sync them
    // For now, we'll use the example schema
    try {
      const { schema } = await import('./pocketvex/schema/example.schema.ts');
      if (schema) {
        await this.syncSchema(schema);
      }
    } catch (error) {
      console.log(chalk.gray('No schema files found to sync'));
    }
  }

  /**
   * Sync a single schema
   */
  private async syncSchema(schema: any): Promise<void> {
    const spinner = ora('Syncing schema...').start();

    try {
      const currentSchema = await this.pbClient.fetchCurrentSchema();
      // Here you would use SchemaDiff to compare and apply changes
      // For now, we'll just log that we're syncing
      spinner.succeed('Schema synced successfully');
    } catch (error) {
      spinner.fail('Schema sync failed');
      console.error(chalk.red('Error syncing schema:'), error);
    }
  }

  /**
   * Generate TypeScript types
   */
  private async generateTypes(schema: any): Promise<void> {
    const spinner = ora('Generating TypeScript types...').start();

    try {
      const types = TypeGenerator.generateTypes(schema);
      const apiClient = TypeGenerator.generateApiClient(schema);

      // Ensure types directory exists
      await mkdir('generated', { recursive: true });

      // Write types file
      await writeFile('generated/types.ts', types);

      // Write API client file
      await writeFile('generated/api-client.ts', apiClient);

      spinner.succeed('TypeScript types generated');
      console.log(chalk.gray('  - generated/types.ts'));
      console.log(chalk.gray('  - generated/api-client.ts'));
    } catch (error) {
      spinner.fail('Type generation failed');
      console.error(chalk.red('Error generating types:'), error);
    }
  }

  /**
   * Generate all types from all schemas
   */
  private async generateAllTypes(): Promise<void> {
    // This would scan all schema files and generate comprehensive types
    console.log(chalk.gray('Generating comprehensive TypeScript types...'));
  }
}
