#!/usr/bin/env bun
/**
 * PocketVex JavaScript Features Demo
 * Demonstrates PocketBase JavaScript VM integration
 */

import chalk from 'chalk';
import ora from 'ora';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { TypeGenerator } from '../../src/utils/type-generator.js';
import { schema as exampleSchema } from '../../src/schema/example.js';

console.log(chalk.blue('🚀 PocketVex JavaScript Features Demo\n'));

async function runJSFeaturesDemo() {
  console.log(chalk.yellow('📋 Demo 1: PocketBase JavaScript VM Structure'));

  // Show the directory structure
  console.log(chalk.gray('PocketBase JavaScript files structure:'));
  console.log(chalk.gray('  pb_hooks/          # Event hooks'));
  console.log(chalk.gray('  pb_jobs/           # Scheduled jobs (CRON)'));
  console.log(chalk.gray('  pb_commands/       # Console commands'));
  console.log(chalk.gray('  pb_queries/        # Raw database queries'));
  console.log(chalk.gray('  schema/            # Schema definitions'));
  console.log(chalk.gray('  generated/         # Generated TypeScript types'));

  console.log(chalk.yellow('\n📋 Demo 2: Event Hooks Examples'));

  // Show hook examples
  const hookExamples = [
    'onBootstrap - App initialization',
    'onRecordCreate - New record creation',
    'onRecordAfterCreateSuccess - Post-creation actions',
    'onRecordValidate - Custom validation',
    'onRecordEnrich - Add computed fields',
    'onRequest/onResponse - API monitoring',
    'onMailerSend - Email interception',
    'onRealtimeConnectRequest - Realtime connections',
  ];

  hookExamples.forEach((hook, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${hook}`));
  });

  console.log(chalk.yellow('\n📋 Demo 3: Scheduled Jobs Examples'));

  const jobExamples = [
    'Daily cleanup - Remove old sessions and temp files',
    'Weekly analytics - Generate and send reports',
    'Health checks - Monitor system status',
    'Data sync - Sync with external APIs',
    'Cache warming - Pre-compute popular queries',
  ];

  jobExamples.forEach((job, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${job}`));
  });

  console.log(chalk.yellow('\n📋 Demo 4: Console Commands Examples'));

  const commandExamples = [
    'user:create - Create new user accounts',
    'user:list - List all users',
    'db:backup - Create database backups',
    'db:stats - Show database statistics',
    'content:seed - Seed with sample data',
    'system:optimize - Optimize database performance',
  ];

  commandExamples.forEach((cmd, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${cmd}`));
  });

  console.log(chalk.yellow('\n📋 Demo 5: Raw Database Queries Examples'));

  const queryExamples = [
    'User analytics - Registration and activity stats',
    'Content analytics - Posts, comments, engagement',
    'Advanced search - Full-text search across collections',
    'Data migration - Update existing records',
    'Performance optimization - Create indexes',
    'Data export - Export to JSON/CSV',
    'Data cleanup - Remove old records',
  ];

  queryExamples.forEach((query, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${query}`));
  });

  console.log(chalk.yellow('\n📋 Demo 6: TypeScript Type Generation'));

  const typeSpinner = ora('Generating TypeScript types from schema...').start();

  try {
    // Generate types from example schema
    const types = TypeGenerator.generateTypes(exampleSchema);
    const apiClient = TypeGenerator.generateApiClient(exampleSchema);

    // Ensure generated directory exists
    await mkdir('generated', { recursive: true });

    // Write generated files
    await writeFile('generated/types.ts', types);
    await writeFile('generated/api-client.ts', apiClient);

    typeSpinner.succeed('TypeScript types generated successfully');

    console.log(chalk.gray('\nGenerated files:'));
    console.log(
      chalk.gray('  - generated/types.ts (Collection types, CRUD interfaces)'),
    );
    console.log(chalk.gray('  - generated/api-client.ts (Typed API client)'));

    // Show a sample of the generated types
    console.log(chalk.blue('\n📝 Sample generated types:'));
    console.log(chalk.gray('```typescript'));
    console.log(chalk.gray('// Generated from your schema'));
    console.log(
      chalk.gray('export interface UsersRecord extends AuthRecord {'),
    );
    console.log(chalk.gray('  name: string;'));
    console.log(chalk.gray('  email: string;'));
    console.log(chalk.gray('  bio?: string;'));
    console.log(chalk.gray('  role?: string;'));
    console.log(chalk.gray('}'));
    console.log(chalk.gray(''));
    console.log(
      chalk.gray('export interface PostsRecord extends BaseRecord {'),
    );
    console.log(chalk.gray('  title: string;'));
    console.log(chalk.gray('  content: string;'));
    console.log(chalk.gray('  author: string;'));
    console.log(chalk.gray('  published: boolean;'));
    console.log(chalk.gray('}'));
    console.log(chalk.gray('```'));
  } catch (error) {
    typeSpinner.fail('Type generation failed');
    console.error(chalk.red('Error generating types:'), error);
  }

  console.log(chalk.yellow('\n📋 Demo 7: Development Workflow'));

  const workflowSteps = [
    'Define schema in TypeScript (schema/*.ts)',
    'Write event hooks (pb_hooks/*.js)',
    'Create scheduled jobs (pb_jobs/*.js)',
    'Add console commands (pb_commands/*.js)',
    'Write database queries (pb_queries/*.js)',
    'Run development server: bun run dev-js',
    'Types are auto-generated from schema',
    'Files are watched and synced in real-time',
  ];

  workflowSteps.forEach((step, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${step}`));
  });

  console.log(chalk.yellow('\n📋 Demo 8: PocketBase JavaScript VM Features'));

  const vmFeatures = [
    '$app - Main application instance',
    '$hooks - Event hook registration',
    '$jobs - Scheduled job registration',
    '$commands - Console command registration',
    '$http - HTTP request client',
    '$realtime - Realtime messaging',
    '$filesystem - File operations',
    '$log - Logging utilities',
    '$app.db() - Database operations',
    '$app.newMailClient() - Email client',
  ];

  vmFeatures.forEach((feature, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${feature}`));
  });

  console.log(chalk.yellow('\n📋 Demo 9: Integration with PocketVex'));

  const integrationFeatures = [
    'Schema-as-code with TypeScript definitions',
    'Real-time schema migration and sync',
    'Automatic TypeScript type generation',
    'File watching for JavaScript files',
    'Development server with hot reload',
    'Safe vs unsafe operation detection',
    'Migration file generation',
    'Live PocketBase instance integration',
  ];

  integrationFeatures.forEach((feature, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${feature}`));
  });

  console.log(chalk.green('\n✅ JavaScript Features Demo Complete!'));

  console.log(chalk.blue('\n🚀 Next Steps:'));
  console.log(chalk.gray('1. Start the JavaScript development server:'));
  console.log(chalk.blue('   bun run dev-js'));
  console.log(chalk.gray('2. Edit schema files and see real-time sync'));
  console.log(chalk.gray('3. Add event hooks for custom business logic'));
  console.log(chalk.gray('4. Create scheduled jobs for automation'));
  console.log(chalk.gray('5. Use generated TypeScript types in your frontend'));

  console.log(chalk.blue('\n📖 This makes PocketBase truly Convex-like with:'));
  console.log(chalk.gray('  - Schema-as-code with TypeScript'));
  console.log(chalk.gray('  - Real-time development workflow'));
  console.log(chalk.gray('  - Comprehensive JavaScript VM integration'));
  console.log(chalk.gray('  - Automatic type generation'));
  console.log(chalk.gray('  - Event-driven architecture'));
  console.log(chalk.gray('  - Background job processing'));
  console.log(chalk.gray('  - Console command interface'));
}

// Run the demo
runJSFeaturesDemo().catch(console.error);
