#!/usr/bin/env bun
/**
 * PocketVex Real-time Migration Demo
 * Demonstrates live schema migrations with the PocketBase instance
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { SchemaDiff } from './src/utils/diff.js';
import { PocketBaseClient } from './src/utils/pocketbase.js';
import { schema as exampleSchema } from './src/schema/example.js';

// Live PocketBase configuration
const LIVE_CONFIG = {
  url: 'https://pocketvex.pockethost.io',
  adminEmail: process.env.PB_ADMIN_EMAIL || 'demo@example.com',
  adminPassword: process.env.PB_ADMIN_PASS || 'myPassword123',
};

console.log(chalk.blue('🚀 PocketVex Real-time Migration Demo\n'));

async function runRealtimeDemo() {
  const spinner = ora('Connecting to live PocketBase instance...').start();
  
  try {
    // Initialize PocketBase client
    const pbClient = new PocketBaseClient(LIVE_CONFIG);
    
    // Test connection
    const isConnected = await pbClient.testConnection();
    
    if (!isConnected) {
      spinner.fail('Failed to connect to PocketBase');
      console.log(chalk.red('❌ Could not connect to the live PocketBase instance'));
      console.log(chalk.gray('Please check your credentials and try again.'));
      console.log(chalk.blue('\n💡 Set your credentials:'));
      console.log(chalk.gray('  export PB_ADMIN_EMAIL="your-email@example.com"'));
      console.log(chalk.gray('  export PB_ADMIN_PASS="your-password"'));
      return;
    }
    
    spinner.succeed('Connected to live PocketBase instance');
    
    // Fetch current schema
    console.log(chalk.yellow('\n📋 Current Schema Analysis'));
    const currentSchemaSpinner = ora('Fetching current schema...').start();
    
    const currentSchema = await pbClient.fetchCurrentSchema();
    currentSchemaSpinner.succeed(`Found ${currentSchema.collections.length} collections`);
    
    // Show current collections
    if (currentSchema.collections.length > 0) {
      console.log(chalk.gray('\nCurrent collections:'));
      currentSchema.collections.forEach((col, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${col.name} (${col.schema?.length || 0} fields)`));
        if (col.schema && col.schema.length > 0) {
          col.schema.slice(0, 3).forEach(field => {
            console.log(chalk.gray(`     - ${field.name} (${field.type})`));
          });
          if (col.schema.length > 3) {
            console.log(chalk.gray(`     ... and ${col.schema.length - 3} more fields`));
          }
        }
      });
    } else {
      console.log(chalk.blue('🎉 Fresh PocketBase instance - perfect for migration demo!'));
    }
    
    // Compare with example schema
    console.log(chalk.yellow('\n📊 Schema Comparison'));
    const plan = SchemaDiff.buildDiffPlan(exampleSchema, currentSchema);
    
    console.log(chalk.green(`Safe operations: ${plan.safe.length}`));
    console.log(chalk.red(`Unsafe operations: ${plan.unsafe.length}`));
    
    if (plan.safe.length === 0 && plan.unsafe.length === 0) {
      console.log(chalk.green('🎉 Schema is already up to date!'));
      console.log(chalk.blue('Let\'s create some new collections to demonstrate migrations...'));
      
      // Create a demo schema with new collections
      const demoSchema = {
        collections: [
          ...currentSchema.collections,
          {
            name: 'demo_users',
            schema: [
              { name: 'name', type: 'text', required: true },
              { name: 'email', type: 'email', required: true, unique: true },
              { name: 'bio', type: 'editor', options: {} },
              { name: 'created_at', type: 'date', required: true },
            ],
            rules: {
              list: '@request.auth.id != ""',
              view: '@request.auth.id != ""',
              create: '@request.auth.id != ""',
              update: '@request.auth.id = id',
              delete: '@request.auth.role = "admin"',
            },
          },
          {
            name: 'demo_posts',
            schema: [
              { name: 'title', type: 'text', required: true },
              { name: 'content', type: 'editor', options: {} },
              { name: 'author', type: 'relation', options: { collectionId: 'demo_users' } },
              { name: 'published', type: 'bool', options: {} },
              { name: 'tags', type: 'select', options: { values: ['tech', 'life', 'work'], maxSelect: 3 } },
            ],
            rules: {
              list: '@request.auth.id != ""',
              view: '@request.auth.id != ""',
              create: '@request.auth.id != ""',
              update: 'author = @request.auth.id',
              delete: 'author = @request.auth.id',
            },
          },
        ],
      };
      
      const demoPlan = SchemaDiff.buildDiffPlan(demoSchema, currentSchema);
      console.log(chalk.yellow(`\nDemo schema would create ${demoPlan.safe.length} new collections`));
      
      // Ask user if they want to proceed
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Would you like to create demo collections to show real-time migrations?',
          default: true,
        },
      ]);
      
      if (proceed) {
        await applyDemoMigrations(pbClient, demoPlan);
      }
    } else {
      // Show existing differences
      if (plan.safe.length > 0) {
        console.log(chalk.green('\n✅ Safe operations that can be applied:'));
        plan.safe.forEach((op, index) => {
          console.log(chalk.green(`  ${index + 1}. ${op.summary}`));
        });
        
        const { applySafe } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'applySafe',
            message: `Apply ${plan.safe.length} safe operations?`,
            default: true,
          },
        ]);
        
        if (applySafe) {
          await applySafeOperations(pbClient, plan.safe);
        }
      }
      
      if (plan.unsafe.length > 0) {
        console.log(chalk.yellow('\n⚠️  Unsafe operations requiring migrations:'));
        plan.unsafe.forEach((op, index) => {
          console.log(chalk.yellow(`  ${index + 1}. ${op.summary}`));
        });
        console.log(chalk.gray('These would generate migration files for review.'));
      }
    }
    
    // Show real-time migration capabilities
    console.log(chalk.yellow('\n🔄 Real-time Migration Capabilities'));
    console.log(chalk.gray('PocketVex can apply these changes in real-time:'));
    console.log(chalk.green('  ✅ Create new collections'));
    console.log(chalk.green('  ✅ Add new fields'));
    console.log(chalk.green('  ✅ Update field options'));
    console.log(chalk.green('  ✅ Modify collection rules'));
    console.log(chalk.green('  ✅ Add indexes'));
    console.log(chalk.yellow('  ⚠️  Field type changes (requires migration)'));
    console.log(chalk.yellow('  ⚠️  Delete operations (requires migration)'));
    
    console.log(chalk.green('\n✅ Real-time migration demo complete!'));
    console.log(chalk.blue('📖 This shows how PocketVex can safely migrate your schema in real-time.'));
    
  } catch (error) {
    spinner.fail('Demo failed');
    console.error(chalk.red('❌ Demo error:'), error.message);
  }
}

async function applySafeOperations(pbClient: PocketBaseClient, operations: any[]) {
  console.log(chalk.yellow('\n🔄 Applying Safe Operations...'));
  
  for (const operation of operations) {
    const opSpinner = ora(`Applying: ${operation.summary}`).start();
    
    try {
      await pbClient.applyOperation(operation);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for visibility
      opSpinner.succeed(`Applied: ${operation.summary}`);
    } catch (error) {
      opSpinner.fail(`Failed: ${operation.summary}`);
      console.log(chalk.red(`   Error: ${error.message}`));
    }
  }
  
  console.log(chalk.green('\n✅ Safe operations completed!'));
}

async function applyDemoMigrations(pbClient: PocketBaseClient, plan: any) {
  console.log(chalk.yellow('\n🔄 Creating Demo Collections...'));
  
  for (const operation of plan.safe) {
    const opSpinner = ora(`Creating: ${operation.summary}`).start();
    
    try {
      await pbClient.applyOperation(operation);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for visibility
      opSpinner.succeed(`Created: ${operation.summary}`);
    } catch (error) {
      opSpinner.fail(`Failed: ${operation.summary}`);
      console.log(chalk.red(`   Error: ${error.message}`));
    }
  }
  
  console.log(chalk.green('\n✅ Demo collections created successfully!'));
  
  // Show the new schema
  console.log(chalk.yellow('\n📋 Updated Schema:'));
  const updatedSchema = await pbClient.fetchCurrentSchema();
  updatedSchema.collections.forEach((col, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${col.name} (${col.schema?.length || 0} fields)`));
  });
  
  console.log(chalk.blue('\n🎉 You can now see these collections in your PocketBase admin panel!'));
  console.log(chalk.gray('Visit: https://pocketvex.pockethost.io/_/'));
}

// Run the real-time demo
runRealtimeDemo().catch(console.error);
