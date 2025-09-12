#!/usr/bin/env bun
/**
 * Development server for real-time schema migration
 * Watches schema files and applies changes automatically
 */

import chokidar from 'chokidar';
import chalk from 'chalk';
import ora from 'ora';
import { SchemaDiff } from './utils/diff.js';
import { PocketBaseClient } from './utils/pocketbase.js';
import type { DevServerConfig, MigrationOperation } from './types/schema.js';

// Load schema from the example file (in real usage, this would be configurable)
import { schema as exampleSchema } from './schema/example.js';

class DevServer {
  private config: DevServerConfig;
  public pbClient: PocketBaseClient;
  private watcher?: chokidar.FSWatcher;
  private isProcessing = false;

  constructor(config: DevServerConfig) {
    this.config = config;
    this.pbClient = new PocketBaseClient(config);
  }

  /**
   * Start the development server
   */
  async start(): Promise<void> {
    console.log(chalk.blue('🚀 Starting PocketVex Dev Server...'));

    // Test connection
    const spinner = ora('Testing PocketBase connection...').start();
    const isConnected = await this.pbClient.testConnection();

    if (!isConnected) {
      spinner.fail('Failed to connect to PocketBase');
      console.log(chalk.red('Please check your PocketBase configuration:'));
      console.log(chalk.gray(`  URL: ${this.config.url}`));
      console.log(chalk.gray(`  Admin Email: ${this.config.adminEmail}`));
      process.exit(1);
    }

    spinner.succeed('Connected to PocketBase');

    // Initial schema sync
    await this.syncSchema();

    // Start file watcher
    this.startWatcher();

    console.log(chalk.green('✅ Dev server started successfully!'));
    console.log(chalk.gray('Watching for schema changes...'));
    console.log(chalk.gray('Press Ctrl+C to stop'));
  }

  /**
   * Start file watcher for schema changes
   */
  private startWatcher(): void {
    this.watcher = chokidar.watch(this.config.watchPaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher.on('change', (path) => {
      console.log(chalk.yellow(`📝 Schema file changed: ${path}`));
      this.syncSchema();
    });

    this.watcher.on('add', (path) => {
      console.log(chalk.yellow(`➕ Schema file added: ${path}`));
      this.syncSchema();
    });
  }

  /**
   * Sync schema with PocketBase
   */
  private async syncSchema(): Promise<void> {
    if (this.isProcessing) {
      console.log(
        chalk.gray('⏳ Schema sync already in progress, skipping...'),
      );
      return;
    }

    this.isProcessing = true;
    const spinner = ora('Syncing schema...').start();

    try {
      // Authenticate
      await this.pbClient.authenticate();

      // Fetch current schema
      const currentSchema = await this.pbClient.fetchCurrentSchema();

      // Build diff plan
      const plan = SchemaDiff.buildDiffPlan(exampleSchema, currentSchema);

      if (plan.safe.length === 0 && plan.unsafe.length === 0) {
        spinner.succeed('Schema is up to date');
        return;
      }

      // Handle safe operations
      if (plan.safe.length > 0) {
        spinner.text = `Applying ${plan.safe.length} safe changes...`;

        for (const operation of plan.safe) {
          await this.pbClient.applyOperation(operation);
          console.log(chalk.green(`  ✅ ${operation.summary}`));
        }
      }

      // Handle unsafe operations
      if (plan.unsafe.length > 0) {
        spinner.warn(`Found ${plan.unsafe.length} unsafe changes`);

        console.log(chalk.red('\n⚠️  Unsafe changes detected:'));
        plan.unsafe.forEach((op) => {
          console.log(chalk.red(`  ❌ ${op.summary}`));
        });

        if (this.config.generateMigrations) {
          await this.generateMigration(plan.unsafe);
        } else {
          console.log(chalk.yellow('\n💡 To generate migration files, run:'));
          console.log(chalk.gray('  bun run schema:generate-migration'));
        }
      }

      if (plan.safe.length > 0) {
        spinner.succeed(`Applied ${plan.safe.length} safe changes`);
      }
    } catch (error) {
      spinner.fail('Schema sync failed');
      console.error(chalk.red('Error:'), error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Generate migration file for unsafe operations
   */
  private async generateMigration(
    unsafeOps: MigrationOperation[],
  ): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `migration-${timestamp}.js`;
    const filepath = `${this.config.migrationPath}/${filename}`;

    const migrationContent = this.generateMigrationContent(unsafeOps);

    try {
      await Bun.write(filepath, migrationContent);
      console.log(chalk.green(`📄 Generated migration: ${filepath}`));
    } catch (error) {
      console.error(chalk.red('Failed to generate migration:'), error);
    }
  }

  /**
   * Generate migration file content
   */
  private generateMigrationContent(operations: MigrationOperation[]): string {
    const timestamp = new Date().toISOString();

    return `/**
 * Generated migration - ${timestamp}
 * Contains ${operations.length} unsafe operations
 */

import PocketBase from 'pocketbase';

export const up = async (pb) => {
  // TODO: Implement migration logic
  console.log('Running migration with ${operations.length} operations:');
${operations.map((op) => `  // ${op.summary}`).join('\n')}

  // Example implementation:
${operations.map((op) => this.generateOperationCode(op)).join('\n\n')}
};

export const down = async (pb) => {
  // TODO: Implement rollback logic
  console.log('Rolling back migration...');

  // Implement reverse operations here
};

// Helper functions
${this.generateHelperFunctions()}
`;
  }

  /**
   * Generate code for a specific operation
   */
  private generateOperationCode(operation: MigrationOperation): string {
    switch (operation.kind) {
      case 'deleteCollection':
        return `  // Delete collection '${operation.collection}'
  // await pb.collections.delete('${operation.payload.id}');`;

      case 'deleteField':
        return `  // Delete field '${operation.field}' from '${operation.collection}'
  // const collection = await pb.collections.getOne('${operation.collection}');
  // collection.schema = collection.schema.filter(f => f.name !== '${operation.field}');
  // await pb.collections.update(collection.id, collection);`;

      case 'typeChange':
        return `  // Change field type for '${operation.field}' in '${operation.collection}'
  // WARNING: This may cause data loss
  // const collection = await pb.collections.getOne('${operation.collection}');
  // const field = collection.schema.find(f => f.name === '${operation.field}');
  // if (field) {
  //   // Implement data migration logic here
  //   field.type = '${operation.payload.desired.type}';
  //   await pb.collections.update(collection.id, collection);
  // }`;

      default:
        return `  // ${operation.summary}
  // TODO: Implement ${operation.kind} operation`;
    }
  }

  /**
   * Generate helper functions for migrations
   */
  private generateHelperFunctions(): string {
    return `
// Helper function to backup data before destructive operations
const backupData = async (pb, collectionName) => {
  const records = await pb.collection(collectionName).getFullList();
  const backup = {
    collection: collectionName,
    timestamp: new Date().toISOString(),
    records: records
  };

  // Save backup to file or another collection
  console.log(\`Backed up \${records.length} records from \${collectionName}\`);
  return backup;
};

// Helper function to migrate field data
const migrateFieldData = async (pb, collectionName, fieldName, transformer) => {
  const records = await pb.collection(collectionName).getFullList();

  for (const record of records) {
    if (record[fieldName] !== undefined) {
      const newValue = transformer(record[fieldName]);
      await pb.collection(collectionName).update(record.id, {
        [fieldName]: newValue
      });
    }
  }

  console.log(\`Migrated \${records.length} records in \${collectionName}.\${fieldName}\`);
};`;
  }

  /**
   * Stop the development server
   */
  async stop(): Promise<void> {
    console.log(chalk.yellow('\n🛑 Stopping dev server...'));

    if (this.watcher) {
      await this.watcher.close();
    }

    console.log(chalk.green('✅ Dev server stopped'));
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const isWatchMode = args.includes('--watch');

  const config: DevServerConfig = {
    url: process.env.PB_URL || 'http://127.0.0.1:8090',
    adminEmail: process.env.PB_ADMIN_EMAIL || 'admin@example.com',
    adminPassword: process.env.PB_ADMIN_PASS || 'admin123',
    watchPaths: ['schema/**/*.ts', 'src/schema/**/*.ts'],
    autoApply: true,
    generateMigrations: true,
    migrationPath: './pb_migrations',
  };

  const server = new DevServer(config);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });

  if (isWatchMode) {
    await server.start();
  } else {
    // One-time sync
    console.log(chalk.blue('🔄 Running one-time schema sync...'));
    await server.pbClient.authenticate();
    const currentSchema = await server.pbClient.fetchCurrentSchema();
    const plan = SchemaDiff.buildDiffPlan(exampleSchema, currentSchema);

    if (plan.safe.length > 0) {
      console.log(chalk.green(`Applying ${plan.safe.length} safe changes...`));
      for (const operation of plan.safe) {
        await server.pbClient.applyOperation(operation);
        console.log(chalk.green(`  ✅ ${operation.summary}`));
      }
    }

    if (plan.unsafe.length > 0) {
      console.log(chalk.yellow(`Found ${plan.unsafe.length} unsafe changes`));
      plan.unsafe.forEach((op) => console.log(chalk.red(`  ❌ ${op.summary}`)));
    }

    console.log(chalk.green('✅ Schema sync complete'));
  }
}

// Export the DevServer class
export { DevServer };

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}
