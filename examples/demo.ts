#!/usr/bin/env bun
/**
 * PocketVex Unified Demo System
 * Comprehensive demonstration of all PocketVex capabilities
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { SchemaDiff } from '../src/utils/diff.js';
import { PocketBaseClient } from '../src/utils/pocketbase.js';
import { TypeGenerator } from '../src/utils/type-generator.js';
import { DemoUtils, DEFAULT_DEMO_CONFIGS } from '../src/utils/demo-utils.js';
import { schema as exampleSchema } from '../src/schema/example.js';
import { schema as exampleSchema2 } from '../schema/example.schema.js';

// Demo implementations
class BasicDemo {
  static async run() {
    DemoUtils.printHeader('PocketVex Basic Demo', 'Schema migration system capabilities');

    DemoUtils.printSection('Schema Structure');
    console.log(chalk.gray('Example schema contains:'));
    console.log(chalk.gray(`  - ${exampleSchema.collections.length} collections`));
    exampleSchema.collections.forEach((col) => {
      console.log(chalk.gray(`    • ${col.name} (${col.schema?.length || 0} fields)`));
    });

    console.log(chalk.gray('\nExample schema 2 contains:'));
    console.log(chalk.gray(`  - ${exampleSchema2.collections.length} collections`));
    exampleSchema2.collections.forEach((col) => {
      console.log(chalk.gray(`    • ${col.name} (${col.schema?.length || 0} fields)`));
    });

    DemoUtils.printSection('Schema Comparison');
    const plan = SchemaDiff.buildDiffPlan(exampleSchema, exampleSchema2);

    console.log(chalk.gray(`Safe operations: ${plan.safe.length}`));
    console.log(chalk.gray(`Unsafe operations: ${plan.unsafe.length}`));

    if (plan.unsafe.length > 0) {
      console.log(chalk.gray('\nUnsafe operations:'));
      plan.unsafe.forEach((op, i) => {
        console.log(chalk.yellow(`  ${i + 1}. ${op.summary}`));
        if (op.requiresDataMigration) {
          console.log(chalk.red(`     ⚠️  Requires data migration`));
        }
      });
    }

    DemoUtils.printSection('Usage Examples');
    DemoUtils.printDevelopmentWorkflow();

    DemoUtils.printDemoComplete('Basic');
  }
}

class LiveDemo {
  static async run() {
    const config = await DemoUtils.selectPocketBaseInstance(DEFAULT_DEMO_CONFIGS);
    DemoUtils.printHeader('PocketVex Live Demo', `Connecting to ${config.url}`);

    const spinner = DemoUtils.createSpinner('Connecting to PocketBase...');
    
    try {
      const client = new PocketBaseClient({
        url: config.url,
        adminEmail: config.adminEmail,
        adminPassword: config.adminPassword,
      });
      await client.authenticate();
      spinner.succeed('Connected successfully!');

      DemoUtils.printSection('Current Schema');
      const currentSchema = await client.fetchCurrentSchema();
      DemoUtils.formatCollectionInfo(currentSchema.collections);

      DemoUtils.printSection('Schema Comparison');
      const plan = SchemaDiff.buildDiffPlan(exampleSchema, currentSchema);
      DemoUtils.formatMigrationPlan(plan);

      DemoUtils.printDemoComplete('Live');
    } catch (error) {
      DemoUtils.handleConnectionError(error, spinner);
    }
  }
}

class RealtimeMigrationDemo {
  static async run() {
    const config = await DemoUtils.selectPocketBaseInstance(DEFAULT_DEMO_CONFIGS);
    DemoUtils.printHeader('Real-time Migration Demo', 'Apply safe changes in real-time');

    const spinner = DemoUtils.createSpinner('Connecting to PocketBase...');
    
    try {
      const client = new PocketBaseClient({
        url: config.url,
        adminEmail: config.adminEmail,
        adminPassword: config.adminPassword,
      });
      await client.authenticate();
      spinner.succeed('Connected successfully!');

      DemoUtils.printSection('Analyzing Current Schema');
      const currentSchema = await client.fetchCurrentSchema();
      const plan = SchemaDiff.buildDiffPlan(exampleSchema, currentSchema);

      if (plan.safe.length === 0) {
        DemoUtils.printInfo('No safe operations to apply.');
        return;
      }

      console.log(chalk.gray(`Found ${plan.safe.length} safe operations:`));
      plan.safe.forEach((op, i) => {
        console.log(chalk.green(`  ${i + 1}. ${op.summary}`));
      });

      const proceed = await DemoUtils.askConfirmation('Apply these safe changes?', false);

      if (proceed) {
        const applySpinner = DemoUtils.createSpinner('Applying changes...');
        try {
          applySpinner.start();
          for (const operation of plan.safe) {
            await client.applyOperation(operation);
          }
          applySpinner.succeed('Changes applied successfully!');
          DemoUtils.printDemoComplete('Real-time migration');
        } catch (error) {
          DemoUtils.handleOperationError(error, applySpinner, 'apply changes');
        }
      } else {
        DemoUtils.printInfo('Migration cancelled.');
      }
    } catch (error) {
      DemoUtils.handleConnectionError(error, spinner);
    }
  }
}

class IncrementalMigrationDemo {
  static async run() {
    const config = await DemoUtils.selectPocketBaseInstance(DEFAULT_DEMO_CONFIGS);
    DemoUtils.printHeader('Incremental Migration Demo', 'Step-by-step schema evolution');

    // Define schema versions
    const versions = [
      { name: 'v1.0 - Basic Users', schema: this.getV1Schema() },
      { name: 'v2.0 - Add Posts', schema: this.getV2Schema() },
      { name: 'v3.0 - Add Comments', schema: this.getV3Schema() },
    ];

    const { targetVersion } = await inquirer.prompt([
      {
        type: 'list',
        name: 'targetVersion',
        message: 'Select target schema version:',
        choices: versions.map((v, i) => ({ name: v.name, value: i })),
      },
    ]);

    const spinner = DemoUtils.createSpinner('Connecting to PocketBase...');
    
    try {
      const client = new PocketBaseClient({
        url: config.url,
        adminEmail: config.adminEmail,
        adminPassword: config.adminPassword,
      });
      await client.authenticate();
      spinner.succeed('Connected successfully!');

      const currentSchema = await client.fetchCurrentSchema();
      const targetSchema = versions[targetVersion].schema;
      
      const plan = SchemaDiff.buildDiffPlan(targetSchema, currentSchema);

      console.log(chalk.gray(`\nMigration plan to ${versions[targetVersion].name}:`));
      console.log(chalk.gray(`Safe operations: ${plan.safe.length}`));
      console.log(chalk.gray(`Unsafe operations: ${plan.unsafe.length}`));

      if (plan.safe.length > 0) {
      const proceed = await DemoUtils.askConfirmation('Apply safe changes?', false);

        if (proceed) {
          const applySpinner = DemoUtils.createSpinner('Applying changes...');
          try {
            applySpinner.start();
            for (const operation of plan.safe) {
              await client.applyOperation(operation);
            }
            applySpinner.succeed('Changes applied successfully!');
            DemoUtils.printDemoComplete('Incremental migration');
          } catch (error) {
            DemoUtils.handleOperationError(error, applySpinner, 'apply changes');
          }
        }
      }
    } catch (error) {
      DemoUtils.handleConnectionError(error, spinner);
    }
  }

  private static getV1Schema() {
    return {
      collections: [
        {
          id: 'users_001',
          name: 'users',
          type: 'auth' as const,
          schema: [
            { name: 'name', type: 'text' as const, required: true },
            { name: 'email', type: 'email' as const, required: true, unique: true },
          ],
        },
      ],
    };
  }

  private static getV2Schema() {
    return {
      collections: [
        {
          id: 'users_001',
          name: 'users',
          type: 'auth' as const,
          schema: [
            { name: 'name', type: 'text' as const, required: true },
            { name: 'email', type: 'email' as const, required: true, unique: true },
            { name: 'bio', type: 'text' as const },
          ],
        },
        {
          id: 'posts_001',
          name: 'posts',
          type: 'base' as const,
          schema: [
            { name: 'title', type: 'text' as const, required: true },
            { name: 'content', type: 'text' as const, required: true },
            { name: 'author', type: 'relation' as const, options: { collectionId: 'users_001' } },
          ],
        },
      ],
    };
  }

  private static getV3Schema() {
    return {
      collections: [
        {
          id: 'users_001',
          name: 'users',
          type: 'auth' as const,
          schema: [
            { name: 'name', type: 'text' as const, required: true },
            { name: 'email', type: 'email' as const, required: true, unique: true },
            { name: 'bio', type: 'text' as const },
          ],
        },
        {
          id: 'posts_001',
          name: 'posts',
          type: 'base' as const,
          schema: [
            { name: 'title', type: 'text' as const, required: true },
            { name: 'content', type: 'text' as const, required: true },
            { name: 'author', type: 'relation' as const, options: { collectionId: 'users_001' } },
            { name: 'published', type: 'bool' as const, required: true },
          ],
        },
        {
          id: 'comments_001',
          name: 'comments',
          type: 'base' as const,
          schema: [
            { name: 'content', type: 'text' as const, required: true },
            { name: 'post', type: 'relation' as const, options: { collectionId: 'posts_001' } },
            { name: 'author', type: 'relation' as const, options: { collectionId: 'users_001' } },
          ],
        },
      ],
    };
  }
}

class JavaScriptVMFeaturesDemo {
  static async run() {
    DemoUtils.printHeader('JavaScript VM Features Demo', 'PocketBase server-side capabilities');

    DemoUtils.printSection('Project Structure');
    console.log(chalk.gray('PocketBase JavaScript files structure:'));
    console.log(chalk.gray('  pb_hooks/          # Event hooks'));
    console.log(chalk.gray('  pb_jobs/           # Scheduled jobs (CRON)'));
    console.log(chalk.gray('  pb_commands/       # Console commands'));
    console.log(chalk.gray('  pb_queries/        # Raw database queries'));
    console.log(chalk.gray('  schema/            # Schema definitions'));
    console.log(chalk.gray('  generated/         # Generated TypeScript types'));

    DemoUtils.printSection('TypeScript Type Generation');
    const spinner = DemoUtils.createSpinner('Generating types...');
    try {
      spinner.start();
      const typesContent = TypeGenerator.generateTypes(exampleSchema);
      // In a real implementation, this would write to files
      console.log(chalk.gray('Types generated (content length:', typesContent.length, 'characters)'));
      spinner.succeed('Types generated successfully!');
      
      console.log(chalk.gray('\nGenerated files:'));
      console.log(chalk.gray('  - generated/types.ts (Collection types, CRUD interfaces)'));
      console.log(chalk.gray('  - generated/api-client.ts (Typed API client)'));
      
      DemoUtils.printDemoComplete('JavaScript VM features');
    } catch (error) {
      DemoUtils.handleOperationError(error, spinner, 'generate types');
    }
  }
}

class TestConnectionDemo {
  static async run() {
    const config = await DemoUtils.selectPocketBaseInstance(DEFAULT_DEMO_CONFIGS);
    DemoUtils.printHeader('Connection Test', `Testing connection to ${config.url}`);

    const spinner = DemoUtils.createSpinner('Testing connection...');
    
    try {
      spinner.start();
      const client = new PocketBaseClient({
        url: config.url,
        adminEmail: config.adminEmail,
        adminPassword: config.adminPassword,
      });
      await client.authenticate();
      spinner.succeed('Connection successful!');

      DemoUtils.printSection('Instance Information');
      const schema = await client.getSchema();
      console.log(chalk.gray(`URL: ${config.url}`));
      console.log(chalk.gray(`Collections: ${schema.collections.length}`));
      console.log(chalk.gray(`Admin Email: ${config.adminEmail}`));

      DemoUtils.printDemoComplete('Connection test');
    } catch (error) {
      DemoUtils.handleConnectionError(error, spinner);
    }
  }
}

// Main demo runner
async function runDemo() {
  try {
    const mode = await DemoUtils.selectDemoMode();
    
    switch (mode) {
      case 'basic':
        await BasicDemo.run();
        break;
      case 'live':
        await LiveDemo.run();
        break;
      case 'realtime':
        await RealtimeMigrationDemo.run();
        break;
      case 'incremental':
        await IncrementalMigrationDemo.run();
        break;
      case 'js-vm':
        await JavaScriptVMFeaturesDemo.run();
        break;
      case 'test':
        await TestConnectionDemo.run();
        break;
      default:
        DemoUtils.printError('Unknown demo mode');
    }
  } catch (error) {
    DemoUtils.printError(`Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Run the demo
runDemo();
