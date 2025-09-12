#!/usr/bin/env bun
/**
 * PocketVex Incremental Migration Demo
 * Shows step-by-step schema evolution with real-time updates
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { SchemaDiff } from './src/utils/diff.js';
import { PocketBaseClient } from './src/utils/pocketbase.js';

// Live PocketBase configuration
const LIVE_CONFIG = {
  url: 'https://pocketvex.pockethost.io',
  adminEmail: process.env.PB_ADMIN_EMAIL || 'demo@example.com',
  adminPassword: process.env.PB_ADMIN_PASS || 'myPassword123',
};

console.log(chalk.blue('🚀 PocketVex Incremental Migration Demo\n'));

// Define progressive schema versions
const schemaVersions = [
  {
    name: 'Version 1: Basic User Collection',
    schema: {
      collections: [
        {
          name: 'users',
          schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'email', required: true, unique: true },
          ],
          rules: {
            list: '@request.auth.id != ""',
            view: '@request.auth.id != ""',
            create: '@request.auth.id != ""',
            update: '@request.auth.id = id',
            delete: '@request.auth.id = id',
          },
        },
      ],
    },
  },
  {
    name: 'Version 2: Add User Profile Fields',
    schema: {
      collections: [
        {
          name: 'users',
          schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'email', required: true, unique: true },
            { name: 'bio', type: 'editor', options: {} },
            { name: 'avatar', type: 'file', options: { maxSelect: 1, maxSize: 5242880 } },
            { name: 'role', type: 'select', options: { values: ['user', 'admin'], maxSelect: 1 } },
          ],
          rules: {
            list: '@request.auth.id != ""',
            view: '@request.auth.id != ""',
            create: '@request.auth.id != ""',
            update: '@request.auth.id = id',
            delete: '@request.auth.id = id',
          },
        },
      ],
    },
  },
  {
    name: 'Version 3: Add Posts Collection',
    schema: {
      collections: [
        {
          name: 'users',
          schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'email', required: true, unique: true },
            { name: 'bio', type: 'editor', options: {} },
            { name: 'avatar', type: 'file', options: { maxSelect: 1, maxSize: 5242880 } },
            { name: 'role', type: 'select', options: { values: ['user', 'admin'], maxSelect: 1 } },
          ],
          rules: {
            list: '@request.auth.id != ""',
            view: '@request.auth.id != ""',
            create: '@request.auth.id != ""',
            update: '@request.auth.id = id',
            delete: '@request.auth.id = id',
          },
        },
        {
          name: 'posts',
          schema: [
            { name: 'title', type: 'text', required: true },
            { name: 'content', type: 'editor', options: {} },
            { name: 'author', type: 'relation', options: { collectionId: 'users' } },
            { name: 'published', type: 'bool', options: {} },
            { name: 'created_at', type: 'date', required: true },
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
    },
  },
  {
    name: 'Version 4: Add Comments and Tags',
    schema: {
      collections: [
        {
          name: 'users',
          schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'email', required: true, unique: true },
            { name: 'bio', type: 'editor', options: {} },
            { name: 'avatar', type: 'file', options: { maxSelect: 1, maxSize: 5242880 } },
            { name: 'role', type: 'select', options: { values: ['user', 'admin'], maxSelect: 1 } },
          ],
          rules: {
            list: '@request.auth.id != ""',
            view: '@request.auth.id != ""',
            create: '@request.auth.id != ""',
            update: '@request.auth.id = id',
            delete: '@request.auth.id = id',
          },
        },
        {
          name: 'posts',
          schema: [
            { name: 'title', type: 'text', required: true },
            { name: 'content', type: 'editor', options: {} },
            { name: 'author', type: 'relation', options: { collectionId: 'users' } },
            { name: 'published', type: 'bool', options: {} },
            { name: 'created_at', type: 'date', required: true },
            { name: 'tags', type: 'select', options: { values: ['tech', 'life', 'work', 'tutorial'], maxSelect: 5 } },
            { name: 'featured', type: 'bool', options: {} },
          ],
          rules: {
            list: '@request.auth.id != ""',
            view: '@request.auth.id != ""',
            create: '@request.auth.id != ""',
            update: 'author = @request.auth.id',
            delete: 'author = @request.auth.id',
          },
        },
        {
          name: 'comments',
          schema: [
            { name: 'content', type: 'text', required: true },
            { name: 'author', type: 'relation', options: { collectionId: 'users' } },
            { name: 'post', type: 'relation', options: { collectionId: 'posts' } },
            { name: 'created_at', type: 'date', required: true },
            { name: 'approved', type: 'bool', options: {} },
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
    },
  },
];

async function runIncrementalDemo() {
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
      return;
    }
    
    spinner.succeed('Connected to live PocketBase instance');
    
    // Get current schema
    const currentSchema = await pbClient.fetchCurrentSchema();
    console.log(chalk.yellow(`\n📋 Current Schema: ${currentSchema.collections.length} collections`));
    
    // Show available schema versions
    console.log(chalk.yellow('\n📚 Available Schema Versions:'));
    schemaVersions.forEach((version, index) => {
      const collectionCount = version.schema.collections.length;
      console.log(chalk.gray(`  ${index + 1}. ${version.name} (${collectionCount} collections)`));
    });
    
    // Let user choose which version to migrate to
    const { versionChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'versionChoice',
        message: 'Which schema version would you like to migrate to?',
        choices: schemaVersions.map((v, i) => ({ name: v.name, value: i })),
      },
    ]);
    
    const selectedVersion = schemaVersions[versionChoice];
    console.log(chalk.blue(`\n🎯 Selected: ${selectedVersion.name}`));
    
    // Compare schemas
    console.log(chalk.yellow('\n📊 Analyzing Schema Differences...'));
    const plan = SchemaDiff.buildDiffPlan(selectedVersion.schema, currentSchema);
    
    console.log(chalk.green(`Safe operations: ${plan.safe.length}`));
    console.log(chalk.red(`Unsafe operations: ${plan.unsafe.length}`));
    
    if (plan.safe.length > 0) {
      console.log(chalk.green('\n✅ Safe operations that will be applied:'));
      plan.safe.forEach((op, index) => {
        console.log(chalk.green(`  ${index + 1}. ${op.summary}`));
      });
    }
    
    if (plan.unsafe.length > 0) {
      console.log(chalk.yellow('\n⚠️  Unsafe operations requiring migrations:'));
      plan.unsafe.forEach((op, index) => {
        console.log(chalk.yellow(`  ${index + 1}. ${op.summary}`));
      });
    }
    
    if (plan.safe.length === 0 && plan.unsafe.length === 0) {
      console.log(chalk.green('🎉 Schema is already at the selected version!'));
      return;
    }
    
    // Ask for confirmation
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: `Apply ${plan.safe.length} safe operations to migrate to ${selectedVersion.name}?`,
        default: true,
      },
    ]);
    
    if (proceed) {
      await applyIncrementalMigration(pbClient, plan, selectedVersion.name);
    } else {
      console.log(chalk.gray('Migration cancelled.'));
    }
    
  } catch (error) {
    spinner.fail('Demo failed');
    console.error(chalk.red('❌ Demo error:'), error.message);
  }
}

async function applyIncrementalMigration(pbClient: PocketBaseClient, plan: any, versionName: string) {
  console.log(chalk.yellow(`\n🔄 Applying Migration to ${versionName}...`));
  
  let successCount = 0;
  let failCount = 0;
  
  for (const operation of plan.safe) {
    const opSpinner = ora(`Applying: ${operation.summary}`).start();
    
    try {
      await pbClient.applyOperation(operation);
      await new Promise(resolve => setTimeout(resolve, 800)); // Delay for visibility
      opSpinner.succeed(`Applied: ${operation.summary}`);
      successCount++;
    } catch (error) {
      opSpinner.fail(`Failed: ${operation.summary}`);
      console.log(chalk.red(`   Error: ${error.message}`));
      failCount++;
    }
  }
  
  // Show results
  console.log(chalk.yellow('\n📊 Migration Results:'));
  console.log(chalk.green(`✅ Successful: ${successCount}`));
  if (failCount > 0) {
    console.log(chalk.red(`❌ Failed: ${failCount}`));
  }
  
  // Show updated schema
  console.log(chalk.yellow('\n📋 Updated Schema:'));
  const updatedSchema = await pbClient.fetchCurrentSchema();
  updatedSchema.collections.forEach((col, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${col.name} (${col.schema?.length || 0} fields)`));
  });
  
  console.log(chalk.green('\n✅ Incremental migration completed!'));
  console.log(chalk.blue('🎉 Your PocketBase schema has been updated in real-time!'));
  console.log(chalk.gray('Visit your admin panel to see the changes: https://pocketvex.pockethost.io/_/'));
  
  if (plan.unsafe.length > 0) {
    console.log(chalk.yellow('\n⚠️  Note: Some unsafe operations require manual migration files.'));
    console.log(chalk.gray('Run "pocketvex migrate generate" to create migration files for review.'));
  }
}

// Run the incremental demo
runIncrementalDemo().catch(console.error);
