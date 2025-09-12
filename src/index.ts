#!/usr/bin/env bun
/**
 * PocketVex - Schema migration system for PocketBase
 * Main entry point and CLI interface
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';

const program = new Command();

program
  .name('pocketvex')
  .description(
    'Schema migration system for PocketBase with real-time development workflow',
  )
  .version(version);

// Development server command
program
  .command('dev')
  .description('Start development server with file watching')
  .option('--watch', 'Watch for schema changes')
  .action(async (options) => {
    const { DevServer } = await import('./dev-server.js');

    if (options.watch) {
      // Start the dev server
      const config = {
        url: process.env.PB_URL || 'http://127.0.0.1:8090',
        adminEmail: process.env.PB_ADMIN_EMAIL || 'admin@example.com',
        adminPassword: process.env.PB_ADMIN_PASS || 'admin123',
        watchPaths: ['schema/**/*.ts', 'src/schema/**/*.ts'],
        autoApply: true,
        generateMigrations: true,
        migrationPath: './pb_migrations',
      };

      const server = new DevServer(config);
      await server.start();
    } else {
      // One-time sync
      console.log(chalk.blue('🔄 Running one-time schema sync...'));
      // This will be handled by the dev-server.ts file
    }
  });

// Schema commands
program
  .command('schema')
  .description('Schema management commands')
  .command('apply', 'Apply schema changes to PocketBase')
  .command('diff', 'Show schema differences')
  .command('watch', 'Watch for schema changes and apply automatically');

// Migration commands
program
  .command('migrate')
  .description('Migration management commands')
  .command('generate', 'Generate migration from schema changes')
  .command('up', 'Run pending migrations')
  .command('down', 'Rollback last migration')
  .command('status', 'Show migration status');

// Status command
program
  .command('status')
  .description('Show PocketBase connection status')
  .action(async () => {
    const { PocketBaseClient } = await import('./utils/pocketbase.js');

    const config = {
      url: process.env.PB_URL || 'http://127.0.0.1:8090',
      adminEmail: process.env.PB_ADMIN_EMAIL || 'admin@example.com',
      adminPassword: process.env.PB_ADMIN_PASS || 'admin123',
    };

    const pbClient = new PocketBaseClient(config);
    const isConnected = await pbClient.testConnection();

    if (isConnected) {
      console.log(chalk.green('✅ Connected to PocketBase'));
      console.log(chalk.gray(`  URL: ${config.url}`));
      console.log(chalk.gray(`  Admin: ${config.adminEmail}`));
    } else {
      console.log(chalk.red('❌ Failed to connect to PocketBase'));
      console.log(chalk.gray(`  URL: ${config.url}`));
      console.log(chalk.gray(`  Admin: ${config.adminEmail}`));
      process.exit(1);
    }
  });

// Help command
program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(
      chalk.blue('🚀 PocketVex - Schema Migration System for PocketBase\n'),
    );

    console.log(chalk.yellow('Quick Start:'));
    console.log(chalk.gray('  1. Set environment variables:'));
    console.log(chalk.gray('     export PB_URL="http://127.0.0.1:8090"'));
    console.log(chalk.gray('     export PB_ADMIN_EMAIL="admin@example.com"'));
    console.log(chalk.gray('     export PB_ADMIN_PASS="admin123"'));
    console.log(chalk.gray('  2. Start development server:'));
    console.log(chalk.gray('     bun run dev --watch'));
    console.log(
      chalk.gray(
        '  3. Edit schema files and see changes applied automatically\n',
      ),
    );

    console.log(chalk.yellow('Commands:'));
    console.log(
      chalk.gray(
        '  dev --watch     Start development server with file watching',
      ),
    );
    console.log(
      chalk.gray('  schema apply    Apply schema changes to PocketBase'),
    );
    console.log(chalk.gray('  schema diff     Show schema differences'));
    console.log(
      chalk.gray('  migrate generate Generate migration from schema changes'),
    );
    console.log(chalk.gray('  migrate up      Run pending migrations'));
    console.log(chalk.gray('  migrate down    Rollback last migration'));
    console.log(
      chalk.gray('  status          Show PocketBase connection status\n'),
    );

    console.log(chalk.yellow('Environment Variables:'));
    console.log(
      chalk.gray(
        '  PB_URL          PocketBase server URL (default: http://127.0.0.1:8090)',
      ),
    );
    console.log(chalk.gray('  PB_ADMIN_EMAIL  PocketBase admin email'));
    console.log(chalk.gray('  PB_ADMIN_PASS   PocketBase admin password\n'));

    console.log(chalk.yellow('Schema Files:'));
    console.log(chalk.gray('  schema/*.ts     Your schema definitions'));
    console.log(chalk.gray('  pb_migrations/  Generated migration files\n'));

    console.log(chalk.yellow('Examples:'));
    console.log(chalk.gray('  # Start development server'));
    console.log(chalk.gray('  bun run dev --watch'));
    console.log(chalk.gray('  # Apply safe changes only'));
    console.log(chalk.gray('  bun run schema:apply safe'));
    console.log(chalk.gray('  # Generate migration for unsafe changes'));
    console.log(chalk.gray('  bun run migrate generate'));
  });

// Error handling
program.on('command:*', () => {
  console.error(
    chalk.red('Invalid command. Use --help to see available commands.'),
  );
  process.exit(1);
});

// Run CLI
if (import.meta.main) {
  program.parse();
}
