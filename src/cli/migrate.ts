#!/usr/bin/env bun
/**
 * Migration CLI for PocketVex
 * Handles running, generating, and managing migrations
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { SchemaDiff } from '../utils/diff.js';
import { PocketBaseClient } from '../utils/pocketbase.js';
import { schema as exampleSchema } from '../pocketvex/schema/example.schema.ts';

const program = new Command();

program
  .name('pocketvex-migrate')
  .description('PocketVex migration management')
  .version('1.0.0');

/**
 * Generate a new migration file
 */
program
  .command('generate')
  .description('Generate a new migration file from schema changes')
  .option(
    '-o, --output <path>',
    'Output directory for migrations',
    './pb_migrations',
  )
  .option('-n, --name <name>', 'Migration name', 'auto-generated')
  .action(async (options) => {
    const spinner = ora('Generating migration...').start();

    try {
      const config = {
        url: process.env.PB_URL || 'http://127.0.0.1:8090',
        adminEmail: process.env.PB_ADMIN_EMAIL || 'admin@example.com',
        adminPassword: process.env.PB_ADMIN_PASS || 'admin123',
      };

      const pbClient = new PocketBaseClient(config);
      await pbClient.authenticate();

      const currentSchema = await pbClient.fetchCurrentSchema();
      const plan = SchemaDiff.buildDiffPlan(exampleSchema, currentSchema);

      if (plan.safe.length === 0 && plan.unsafe.length === 0) {
        spinner.succeed('No changes detected');
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${timestamp}-${options.name}.js`;
      const filepath = join(options.output, filename);

      const migrationContent = generateMigrationContent(plan, options.name);
      await writeFile(filepath, migrationContent);

      spinner.succeed(`Generated migration: ${filepath}`);

      console.log(chalk.green(`\n📊 Migration Summary:`));
      console.log(chalk.green(`  Safe operations: ${plan.safe.length}`));
      console.log(chalk.red(`  Unsafe operations: ${plan.unsafe.length}`));

      if (plan.unsafe.length > 0) {
        console.log(
          chalk.yellow(`\n⚠️  Unsafe operations require manual review:`),
        );
        plan.unsafe.forEach((op) => {
          console.log(chalk.red(`  - ${op.summary}`));
        });
      }
    } catch (error) {
      spinner.fail('Failed to generate migration');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

/**
 * Run pending migrations
 */
program
  .command('up')
  .description('Run pending migrations')
  .option('-d, --dir <path>', 'Migrations directory', './pb_migrations')
  .option('--dry-run', 'Show what would be executed without running')
  .action(async (options) => {
    const spinner = ora('Loading migrations...').start();

    try {
      const migrations = await loadMigrations(options.dir);

      if (migrations.length === 0) {
        spinner.succeed('No migrations found');
        return;
      }

      spinner.succeed(`Found ${migrations.length} migrations`);

      if (options.dryRun) {
        console.log(chalk.yellow('\n🔍 Dry run - would execute:'));
        migrations.forEach((migration) => {
          console.log(chalk.gray(`  - ${migration.name}`));
        });
        return;
      }

      const config = {
        url: process.env.PB_URL || 'http://127.0.0.1:8090',
        adminEmail: process.env.PB_ADMIN_EMAIL || 'admin@example.com',
        adminPassword: process.env.PB_ADMIN_PASS || 'admin123',
      };

      const pbClient = new PocketBaseClient(config);
      await pbClient.authenticate();

      for (const migration of migrations) {
        const migrationSpinner = ora(`Running ${migration.name}...`).start();

        try {
          await migration.up(pbClient.pb);
          migrationSpinner.succeed(`Completed ${migration.name}`);
        } catch (error) {
          migrationSpinner.fail(`Failed ${migration.name}`);
          console.error(chalk.red('Error:'), error);
          process.exit(1);
        }
      }

      console.log(chalk.green('\n✅ All migrations completed successfully'));
    } catch (error) {
      spinner.fail('Failed to run migrations');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

/**
 * Rollback the last migration
 */
program
  .command('down')
  .description('Rollback the last migration')
  .option('-d, --dir <path>', 'Migrations directory', './pb_migrations')
  .option('--dry-run', 'Show what would be rolled back without running')
  .action(async (options) => {
    const spinner = ora('Loading migrations...').start();

    try {
      const migrations = await loadMigrations(options.dir);

      if (migrations.length === 0) {
        spinner.succeed('No migrations found');
        return;
      }

      const lastMigration = migrations[migrations.length - 1];
      if (!lastMigration) {
        spinner.succeed('No migrations found to rollback');
        return;
      }
      spinner.succeed(`Found migration to rollback: ${lastMigration.name}`);

      if (options.dryRun) {
        console.log(chalk.yellow('\n🔍 Dry run - would rollback:'));
        console.log(chalk.gray(`  - ${lastMigration.name}`));
        return;
      }

      const config = {
        url: process.env.PB_URL || 'http://127.0.0.1:8090',
        adminEmail: process.env.PB_ADMIN_EMAIL || 'admin@example.com',
        adminPassword: process.env.PB_ADMIN_PASS || 'admin123',
      };

      const pbClient = new PocketBaseClient(config);
      await pbClient.authenticate();

      const migrationSpinner = ora(
        `Rolling back ${lastMigration.name}...`,
      ).start();

      try {
        await lastMigration.down(pbClient.pb);
        migrationSpinner.succeed(`Rolled back ${lastMigration.name}`);
      } catch (error) {
        migrationSpinner.fail(`Failed to rollback ${lastMigration.name}`);
        console.error(chalk.red('Error:'), error);
        process.exit(1);
      }

      console.log(chalk.green('\n✅ Migration rolled back successfully'));
    } catch (error) {
      spinner.fail('Failed to rollback migration');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

/**
 * Show migration status
 */
program
  .command('status')
  .description('Show migration status')
  .option('-d, --dir <path>', 'Migrations directory', './pb_migrations')
  .action(async (options) => {
    const spinner = ora('Loading migrations...').start();

    try {
      const migrations = await loadMigrations(options.dir);

      if (migrations.length === 0) {
        spinner.succeed('No migrations found');
        return;
      }

      spinner.succeed(`Found ${migrations.length} migrations`);

      console.log(chalk.blue('\n📋 Migration Status:'));
      migrations.forEach((migration, index) => {
        const status = chalk.green('✅ Ready');
        console.log(
          chalk.gray(`  ${index + 1}. ${migration.name} - ${status}`),
        );
      });
    } catch (error) {
      spinner.fail('Failed to load migrations');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

/**
 * Load migration files from directory
 */
async function loadMigrations(dir: string) {
  try {
    const files = await readdir(dir);
    const migrationFiles = files.filter((file) => file.endsWith('.js')).sort();

    const migrations = [];

    for (const file of migrationFiles) {
      const filepath = join(dir, file);
      const content = await readFile(filepath, 'utf-8');

      // Extract migration functions using dynamic import
      const module = await import(filepath);

      if (module.up && module.down) {
        migrations.push({
          name: file.replace('.js', ''),
          up: module.up,
          down: module.down,
        });
      }
    }

    return migrations;
  } catch (error) {
    throw new Error(`Failed to load migrations from ${dir}: ${error}`);
  }
}

/**
 * Generate migration file content
 */
function generateMigrationContent(
  plan: { safe: any[]; unsafe: any[] },
  name: string,
): string {
  const timestamp = new Date().toISOString();

  return `/**
 * Generated migration: ${name}
 * Created: ${timestamp}
 *
 * Safe operations: ${plan.safe.length}
 * Unsafe operations: ${plan.unsafe.length}
 */

import PocketBase from 'pocketbase';

export const up = async (pb) => {
  console.log('Running migration: ${name}');

  // Safe operations
${plan.safe.map((op) => `  // ${op.summary}`).join('\n')}

  // Unsafe operations (require manual implementation)
${plan.unsafe.map((op) => `  // ${op.summary}`).join('\n')}

  // TODO: Implement the actual migration logic
  console.log('Migration completed: ${name}');
};

export const down = async (pb) => {
  console.log('Rolling back migration: ${name}');

  // TODO: Implement rollback logic
  console.log('Rollback completed: ${name}');
};

// Helper functions
const backupData = async (pb, collectionName) => {
  const records = await pb.collection(collectionName).getFullList();
  const backup = {
    collection: collectionName,
    timestamp: new Date().toISOString(),
    records: records
  };

  console.log(\`Backed up \${records.length} records from \${collectionName}\`);
  return backup;
};

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
};
`;
}

// Run CLI
if (import.meta.main) {
  program.parse();
}
