#!/usr/bin/env bun
/**
 * PocketVex Live Demo Script
 * Demonstrates real-time schema migration with live PocketBase instance
 */

import chalk from 'chalk';
import ora from 'ora';
import { SchemaDiff } from './src/utils/diff.js';
import { PocketBaseClient } from './src/utils/pocketbase.js';
import { schema as exampleSchema } from './src/schema/example.js';

// Live PocketBase configuration
const LIVE_CONFIG = {
  url: 'https://pocketvex.pockethost.io/',
  adminEmail: 'admin@pocketvex.com', // You'll need to provide the actual admin credentials
  adminPassword: 'admin123', // You'll need to provide the actual admin password
};

console.log(chalk.blue('🚀 PocketVex Live Demo with Real PocketBase Instance\n'));

async function runLiveDemo() {
  const spinner = ora('Connecting to live PocketBase instance...').start();
  
  try {
    // Initialize PocketBase client
    const pbClient = new PocketBaseClient(LIVE_CONFIG);
    
    // Test connection
    const isConnected = await pbClient.testConnection();
    
    if (!isConnected) {
      spinner.fail('Failed to connect to PocketBase');
      console.log(chalk.red('❌ Could not connect to the live PocketBase instance'));
      console.log(chalk.gray('Please check:'));
      console.log(chalk.gray('  - URL is correct: https://pocketvex.pockethost.io/'));
      console.log(chalk.gray('  - Admin credentials are correct'));
      console.log(chalk.gray('  - PocketBase instance is running'));
      return;
    }
    
    spinner.succeed('Connected to live PocketBase instance');
    
    // Fetch current schema
    console.log(chalk.yellow('\n📋 Fetching Current Schema...'));
    const currentSchemaSpinner = ora('Fetching current schema from PocketBase...').start();
    
    const currentSchema = await pbClient.fetchCurrentSchema();
    currentSchemaSpinner.succeed(`Found ${currentSchema.collections.length} collections`);
    
    // Show current collections
    console.log(chalk.gray('\nCurrent collections:'));
    currentSchema.collections.forEach((col, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${col.name} (${col.schema?.length || 0} fields)`));
    });
    
    // Compare with example schema
    console.log(chalk.yellow('\n📊 Comparing with Example Schema...'));
    const plan = SchemaDiff.buildDiffPlan(exampleSchema, currentSchema);
    
    console.log(chalk.green(`\nSafe operations: ${plan.safe.length}`));
    if (plan.safe.length > 0) {
      plan.safe.forEach((op, index) => {
        console.log(chalk.green(`  ${index + 1}. ${op.summary}`));
      });
    } else {
      console.log(chalk.gray('  No safe operations needed'));
    }
    
    console.log(chalk.red(`\nUnsafe operations: ${plan.unsafe.length}`));
    if (plan.unsafe.length > 0) {
      plan.unsafe.forEach((op, index) => {
        console.log(chalk.red(`  ${index + 1}. ${op.summary}`));
        if (op.requiresDataMigration) {
          console.log(chalk.gray(`     ⚠️  Requires data migration`));
        }
      });
    } else {
      console.log(chalk.gray('  No unsafe operations needed'));
    }
    
    // Show what would happen
    console.log(chalk.yellow('\n🔄 What Would Happen:'));
    
    if (plan.safe.length > 0) {
      console.log(chalk.green('✅ Safe changes would be applied automatically:'));
      plan.safe.forEach((op) => {
        console.log(chalk.green(`  • ${op.summary}`));
      });
    }
    
    if (plan.unsafe.length > 0) {
      console.log(chalk.yellow('\n⚠️  Unsafe changes would generate migration files:'));
      plan.unsafe.forEach((op) => {
        console.log(chalk.yellow(`  • ${op.summary}`));
      });
    }
    
    if (plan.safe.length === 0 && plan.unsafe.length === 0) {
      console.log(chalk.green('🎉 Schema is already up to date!'));
    }
    
    // Show example of applying safe changes (dry run)
    if (plan.safe.length > 0) {
      console.log(chalk.yellow('\n🧪 Demo: Applying Safe Changes (Dry Run)'));
      console.log(chalk.gray('In a real scenario, these would be applied automatically:'));
      
      for (const operation of plan.safe.slice(0, 3)) { // Show first 3 operations
        const opSpinner = ora(`Applying: ${operation.summary}`).start();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
        opSpinner.succeed(`Applied: ${operation.summary}`);
      }
      
      if (plan.safe.length > 3) {
        console.log(chalk.gray(`... and ${plan.safe.length - 3} more operations`));
      }
    }
    
    // Show migration generation example
    if (plan.unsafe.length > 0) {
      console.log(chalk.yellow('\n📝 Demo: Migration Generation'));
      console.log(chalk.gray('Unsafe changes would generate migration files like:'));
      
      const migrationExample = `// Migration: ${new Date().toISOString().split('T')[0]}_${plan.unsafe.length}_unsafe_changes.js
export const up = async (pb) => {
  // ${plan.unsafe[0].summary}
  // Implementation would go here
};

export const down = async (pb) => {
  // Rollback implementation
};`;
      
      console.log(chalk.gray(migrationExample));
    }
    
    // Show live usage examples
    console.log(chalk.yellow('\n🛠️  Live Usage Examples:'));
    console.log(chalk.gray('To use with this live instance:'));
    console.log(chalk.blue('  export PB_URL="https://pocketvex.pockethost.io/"'));
    console.log(chalk.blue('  export PB_ADMIN_EMAIL="your-admin@email.com"'));
    console.log(chalk.blue('  export PB_ADMIN_PASS="your-admin-password"'));
    console.log(chalk.gray('  pocketvex dev --watch'));
    
    console.log(chalk.green('\n✅ Live demo complete!'));
    console.log(chalk.blue('📖 This demonstrates real-time schema migration with a live PocketBase instance.'));
    
  } catch (error) {
    spinner.fail('Demo failed');
    console.error(chalk.red('❌ Demo error:'), error);
    console.log(chalk.gray('\nThis might be due to:'));
    console.log(chalk.gray('  - Network connectivity issues'));
    console.log(chalk.gray('  - Incorrect admin credentials'));
    console.log(chalk.gray('  - PocketBase instance not accessible'));
  }
}

// Run the live demo
runLiveDemo().catch(console.error);
