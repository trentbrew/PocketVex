#!/usr/bin/env bun
/**
 * PocketVex Demo with Live PocketBase Integration
 * Shows how to use PocketVex with a real PocketBase instance
 */

import chalk from 'chalk';
import ora from 'ora';
import { SchemaDiff } from './src/utils/diff.js';
import { PocketBaseClient } from './src/utils/pocketbase.js';
import { schema as exampleSchema } from './src/schema/example.js';

console.log(chalk.blue('🚀 PocketVex Demo with Live PocketBase Integration\n'));

// Configuration for live PocketBase instance
const LIVE_PB_CONFIG = {
  url: 'https://pocketvex.pockethost.io/',
  adminEmail: process.env.PB_ADMIN_EMAIL || 'admin@pocketvex.com',
  adminPassword: process.env.PB_ADMIN_PASS || 'admin123',
};

async function runDemo() {
  console.log(chalk.yellow('📋 Demo 1: Configuration Setup'));
  console.log(chalk.gray('Live PocketBase URL: https://pocketvex.pockethost.io/'));
  console.log(chalk.gray('Admin Email: ' + LIVE_PB_CONFIG.adminEmail));
  console.log(chalk.gray('Admin Password: ' + (LIVE_PB_CONFIG.adminPassword ? '***' : 'Not set')));
  
  console.log(chalk.blue('\n💡 To use with your own credentials:'));
  console.log(chalk.gray('  export PB_ADMIN_EMAIL="your-email@example.com"'));
  console.log(chalk.gray('  export PB_ADMIN_PASS="your-password"'));
  console.log(chalk.gray('  bun run demo-with-live-pb.ts'));
  
  // Test connection
  console.log(chalk.yellow('\n🔗 Demo 2: Testing Connection'));
  const spinner = ora('Testing connection to live PocketBase...').start();
  
  try {
    const pbClient = new PocketBaseClient(LIVE_PB_CONFIG);
    const isConnected = await pbClient.testConnection();
    
    if (isConnected) {
      spinner.succeed('✅ Connected to live PocketBase instance!');
      
      // Fetch current schema
      console.log(chalk.yellow('\n📊 Demo 3: Fetching Current Schema'));
      const schemaSpinner = ora('Fetching current schema...').start();
      
      const currentSchema = await pbClient.fetchCurrentSchema();
      schemaSpinner.succeed(`Found ${currentSchema.collections.length} collections`);
      
      // Show current collections
      if (currentSchema.collections.length > 0) {
        console.log(chalk.gray('\nCurrent collections:'));
        currentSchema.collections.forEach((col, index) => {
          console.log(chalk.gray(`  ${index + 1}. ${col.name} (${col.schema?.length || 0} fields)`));
        });
      } else {
        console.log(chalk.blue('🎉 Fresh PocketBase instance - ready for schema migration!'));
      }
      
      // Compare schemas
      console.log(chalk.yellow('\n🔄 Demo 4: Schema Comparison'));
      const plan = SchemaDiff.buildDiffPlan(exampleSchema, currentSchema);
      
      console.log(chalk.green(`Safe operations: ${plan.safe.length}`));
      if (plan.safe.length > 0) {
        plan.safe.forEach((op, index) => {
          console.log(chalk.green(`  ${index + 1}. ${op.summary}`));
        });
      }
      
      console.log(chalk.red(`\nUnsafe operations: ${plan.unsafe.length}`));
      if (plan.unsafe.length > 0) {
        plan.unsafe.forEach((op, index) => {
          console.log(chalk.red(`  ${index + 1}. ${op.summary}`));
        });
      }
      
      // Show what would happen
      console.log(chalk.yellow('\n🎯 Demo 5: What Would Happen'));
      if (plan.safe.length > 0) {
        console.log(chalk.green('✅ Safe changes would be applied automatically:'));
        plan.safe.slice(0, 3).forEach((op) => {
          console.log(chalk.green(`  • ${op.summary}`));
        });
        if (plan.safe.length > 3) {
          console.log(chalk.gray(`  ... and ${plan.safe.length - 3} more`));
        }
      }
      
      if (plan.unsafe.length > 0) {
        console.log(chalk.yellow('\n⚠️  Unsafe changes would generate migrations:'));
        plan.unsafe.slice(0, 3).forEach((op) => {
          console.log(chalk.yellow(`  • ${op.summary}`));
        });
        if (plan.unsafe.length > 3) {
          console.log(chalk.gray(`  ... and ${plan.unsafe.length - 3} more`));
        }
      }
      
      if (plan.safe.length === 0 && plan.unsafe.length === 0) {
        console.log(chalk.green('🎉 Schema is already up to date!'));
      }
      
    } else {
      spinner.fail('❌ Connection failed');
      console.log(chalk.red('\nCould not connect to PocketBase. This might be because:'));
      console.log(chalk.gray('  • Admin credentials are incorrect'));
      console.log(chalk.gray('  • PocketBase instance is not accessible'));
      console.log(chalk.gray('  • Network connectivity issues'));
      
      console.log(chalk.blue('\n💡 To fix this:'));
      console.log(chalk.gray('  1. Get the correct admin credentials from your PocketBase instance'));
      console.log(chalk.gray('  2. Set environment variables:'));
      console.log(chalk.gray('     export PB_ADMIN_EMAIL="your-email@example.com"'));
      console.log(chalk.gray('     export PB_ADMIN_PASS="your-password"'));
      console.log(chalk.gray('  3. Run this demo again'));
    }
    
  } catch (error) {
    spinner.fail('Connection test failed');
    console.error(chalk.red('\n❌ Error:'), error.message);
    
    console.log(chalk.blue('\n💡 This demo shows how PocketVex would work with a live PocketBase instance.'));
    console.log(chalk.gray('Even without a connection, you can see the schema comparison logic in action.'));
  }
  
  // Show usage examples
  console.log(chalk.yellow('\n🛠️  Demo 6: Usage Examples'));
  console.log(chalk.gray('With proper credentials, you can:'));
  console.log(chalk.blue('  pocketvex dev --watch     # Start development server'));
  console.log(chalk.blue('  pocketvex schema apply    # Apply safe changes'));
  console.log(chalk.blue('  pocketvex migrate generate # Generate migrations'));
  
  console.log(chalk.gray('\nEnvironment variables needed:'));
  console.log(chalk.blue('  export PB_URL="https://pocketvex.pockethost.io/"'));
  console.log(chalk.blue('  export PB_ADMIN_EMAIL="your-admin@email.com"'));
  console.log(chalk.blue('  export PB_ADMIN_PASS="your-admin-password"'));
  
  console.log(chalk.green('\n✅ Demo complete!'));
  console.log(chalk.blue('📖 This demonstrates how PocketVex integrates with live PocketBase instances.'));
}

// Run the demo
runDemo().catch(console.error);
