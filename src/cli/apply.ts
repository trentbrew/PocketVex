#!/usr/bin/env bun
/**
 * Apply schema changes directly to PocketBase
 * For development use only - applies safe changes automatically
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { SchemaDiff } from '../utils/diff.js';
import { PocketBaseClient } from '../utils/pocketbase.js';
import { schema as exampleSchema } from '../pocketvex/schema/example.schema.ts';

const program = new Command();

program
  .name('pocketvex-apply')
  .description('Apply schema changes to PocketBase')
  .version('1.0.0');

program
  .command('safe')
  .description('Apply only safe schema changes')
  .option('--force', 'Skip confirmation prompts')
  .action(async (options) => {
    const spinner = ora('Analyzing schema changes...').start();

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

      if (plan.safe.length === 0) {
        spinner.succeed('No safe changes to apply');
        return;
      }

      if (plan.unsafe.length > 0) {
        spinner.warn(
          `Found ${plan.unsafe.length} unsafe changes that will be skipped`,
        );
        console.log(chalk.yellow('\n⚠️  Unsafe changes detected:'));
        plan.unsafe.forEach((op) => {
          console.log(chalk.red(`  ❌ ${op.summary}`));
        });
        console.log(
          chalk.gray(
            '\nUse "pocketvex migrate generate" to create a migration for these changes',
          ),
        );
      }

      spinner.succeed(`Found ${plan.safe.length} safe changes to apply`);

      // Show what will be applied
      console.log(chalk.blue('\n📋 Safe changes to apply:'));
      plan.safe.forEach((op, index) => {
        console.log(chalk.green(`  ${index + 1}. ${op.summary}`));
      });

      // Confirm before applying
      if (!options.force) {
        const { confirmed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: 'Apply these changes?',
            default: true,
          },
        ]);

        if (!confirmed) {
          console.log(chalk.yellow('Operation cancelled'));
          return;
        }
      }

      // Apply changes
      const applySpinner = ora('Applying changes...').start();

      for (const operation of plan.safe) {
        try {
          await pbClient.applyOperation(operation);
          console.log(chalk.green(`  ✅ ${operation.summary}`));
        } catch (error) {
          applySpinner.fail(`Failed to apply: ${operation.summary}`);
          console.error(chalk.red('Error:'), error);
          process.exit(1);
        }
      }

      applySpinner.succeed(`Applied ${plan.safe.length} changes successfully`);
    } catch (error) {
      spinner.fail('Failed to apply schema changes');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('all')
  .description('Apply all changes (safe + unsafe with confirmation)')
  .option('--force', 'Skip confirmation prompts')
  .action(async (options) => {
    const spinner = ora('Analyzing schema changes...').start();

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
        spinner.succeed('No changes to apply');
        return;
      }

      spinner.succeed(
        `Found ${plan.safe.length} safe and ${plan.unsafe.length} unsafe changes`,
      );

      // Show all changes
      if (plan.safe.length > 0) {
        console.log(chalk.blue('\n📋 Safe changes:'));
        plan.safe.forEach((op, index) => {
          console.log(chalk.green(`  ${index + 1}. ${op.summary}`));
        });
      }

      if (plan.unsafe.length > 0) {
        console.log(chalk.red('\n⚠️  Unsafe changes (may cause data loss):'));
        plan.unsafe.forEach((op, index) => {
          console.log(chalk.red(`  ${index + 1}. ${op.summary}`));
        });
      }

      // Confirm before applying
      if (!options.force) {
        const { confirmed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: 'Apply ALL changes (including unsafe ones)?',
            default: false,
          },
        ]);

        if (!confirmed) {
          console.log(chalk.yellow('Operation cancelled'));
          return;
        }
      }

      // Apply safe changes first
      if (plan.safe.length > 0) {
        const safeSpinner = ora('Applying safe changes...').start();

        for (const operation of plan.safe) {
          try {
            await pbClient.applyOperation(operation);
            console.log(chalk.green(`  ✅ ${operation.summary}`));
          } catch (error) {
            safeSpinner.fail(`Failed to apply: ${operation.summary}`);
            console.error(chalk.red('Error:'), error);
            process.exit(1);
          }
        }

        safeSpinner.succeed(`Applied ${plan.safe.length} safe changes`);
      }

      // Apply unsafe changes
      if (plan.unsafe.length > 0) {
        const unsafeSpinner = ora('Applying unsafe changes...').start();

        for (const operation of plan.unsafe) {
          try {
            await pbClient.applyOperation(operation);
            console.log(chalk.yellow(`  ⚠️  ${operation.summary}`));
          } catch (error) {
            unsafeSpinner.fail(`Failed to apply: ${operation.summary}`);
            console.error(chalk.red('Error:'), error);
            process.exit(1);
          }
        }

        unsafeSpinner.succeed(`Applied ${plan.unsafe.length} unsafe changes`);
      }

      console.log(chalk.green('\n✅ All changes applied successfully'));
    } catch (error) {
      spinner.fail('Failed to apply schema changes');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('diff')
  .description('Show schema differences without applying')
  .action(async () => {
    const spinner = ora('Analyzing schema changes...').start();

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

      spinner.succeed('Schema analysis complete');

      if (plan.safe.length === 0 && plan.unsafe.length === 0) {
        console.log(chalk.green('✅ Schema is up to date'));
        return;
      }

      if (plan.safe.length > 0) {
        console.log(chalk.blue(`\n📋 Safe changes (${plan.safe.length}):`));
        plan.safe.forEach((op, index) => {
          console.log(chalk.green(`  ${index + 1}. ${op.summary}`));
        });
      }

      if (plan.unsafe.length > 0) {
        console.log(chalk.red(`\n⚠️  Unsafe changes (${plan.unsafe.length}):`));
        plan.unsafe.forEach((op, index) => {
          console.log(chalk.red(`  ${index + 1}. ${op.summary}`));
          if (op.requiresDataMigration) {
            console.log(chalk.gray(`     ⚠️  Requires data migration`));
          }
        });
      }

      console.log(
        chalk.gray('\n💡 Use "pocketvex apply safe" to apply safe changes'),
      );
      console.log(
        chalk.gray(
          '💡 Use "pocketvex migrate generate" to create migration for unsafe changes',
        ),
      );
    } catch (error) {
      spinner.fail('Failed to analyze schema');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Run CLI
if (import.meta.main) {
  program.parse();
}
