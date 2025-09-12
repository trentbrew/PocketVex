#!/usr/bin/env bun
/**
 * Test Connection to Live PocketBase Instance
 * Simple script to verify connection and show current schema
 */

import chalk from 'chalk';
import ora from 'ora';
import { PocketBaseClient } from './src/utils/pocketbase.js';

const LIVE_CONFIG = {
  url: 'https://pocketvex.pockethost.io/',
  adminEmail: 'admin@pocketvex.com', // Update with actual credentials
  adminPassword: 'admin123', // Update with actual password
};

async function testConnection() {
  console.log(chalk.blue('🔗 Testing Connection to Live PocketBase Instance\n'));
  
  const spinner = ora('Connecting...').start();
  
  try {
    const pbClient = new PocketBaseClient(LIVE_CONFIG);
    const isConnected = await pbClient.testConnection();
    
    if (!isConnected) {
      spinner.fail('Connection failed');
      console.log(chalk.red('❌ Could not connect to PocketBase'));
      console.log(chalk.gray('URL: https://pocketvex.pockethost.io/'));
      return;
    }
    
    spinner.succeed('Connected successfully!');
    
    // Fetch and display current schema
    console.log(chalk.yellow('\n📋 Current Schema:'));
    const schemaSpinner = ora('Fetching schema...').start();
    
    const schema = await pbClient.fetchCurrentSchema();
    schemaSpinner.succeed(`Found ${schema.collections.length} collections`);
    
    if (schema.collections.length === 0) {
      console.log(chalk.gray('No collections found in the database.'));
      console.log(chalk.blue('💡 This is a fresh PocketBase instance ready for schema migration!'));
    } else {
      console.log(chalk.gray('\nCollections:'));
      schema.collections.forEach((col, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${col.name}`));
        if (col.schema && col.schema.length > 0) {
          col.schema.forEach(field => {
            console.log(chalk.gray(`     - ${field.name} (${field.type})`));
          });
        }
      });
    }
    
    console.log(chalk.green('\n✅ Connection test successful!'));
    console.log(chalk.blue('🚀 Ready to run live demo: bun run live-demo.ts'));
    
  } catch (error) {
    spinner.fail('Connection test failed');
    console.error(chalk.red('❌ Error:'), error.message);
    console.log(chalk.gray('\nTroubleshooting:'));
    console.log(chalk.gray('  - Check if the URL is correct'));
    console.log(chalk.gray('  - Verify admin credentials'));
    console.log(chalk.gray('  - Ensure PocketBase instance is running'));
  }
}

testConnection().catch(console.error);
