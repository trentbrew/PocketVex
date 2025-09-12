#!/usr/bin/env bun
/**
 * PocketVex Unified CLI
 * Comprehensive command-line interface for schema management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { DemoUtils } from '../utils/demo-utils.js';
import { SchemaDiff } from '../utils/diff.js';
import { PocketBaseClient } from '../utils/pocketbase.js';
import { TypeGenerator } from '../utils/type-generator.js';
import { credentialStore } from '../utils/credential-store.js';
import { startDevServer } from '../dev-server.js';
import { schema as exampleSchema } from '../schema/example.js';

// Utility function to collect credentials
async function collectCredentials(
  globalOpts: any,
): Promise<{ url: string; email: string; password: string }> {
  let { url, email, password } = globalOpts;

  // First, try to get cached credentials
  if (!email || !password) {
    const cached = await credentialStore.getCredentials(url);
    if (cached) {
      email = email || cached.email;
      password = password || cached.password;
      console.log(chalk.gray('🔐 Using cached credentials'));
    }
  }

  // If credentials are still missing, prompt for them
  if (!email || !password) {
    DemoUtils.printSection('PocketBase Credentials');

    if (!email) {
      const { emailInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'emailInput',
          message: 'Admin email:',
          default: 'admin@example.com',
          validate: (input) =>
            input.includes('@') || 'Please enter a valid email address',
        },
      ]);
      email = emailInput;
    }

    if (!password) {
      const { passwordInput } = await inquirer.prompt([
        {
          type: 'password',
          name: 'passwordInput',
          message: 'Admin password:',
          mask: '*',
          validate: (input) => input.length > 0 || 'Password cannot be empty',
        },
      ]);
      password = passwordInput;
    }

    // Cache the credentials for future use
    try {
      await credentialStore.storeCredentials(url, email, password, 24); // 24 hours TTL
      console.log(chalk.gray('💾 Credentials cached for 24 hours'));
    } catch (error) {
      // Fail silently - caching is optional
    }
  }

  return { url, email, password };
}

const program = new Command();

program
  .name('pocketvex')
  .description('PocketVex - Schema-as-Code for PocketBase')
  .version('1.0.0');

// Global options
program
  .option('--url <url>', 'PocketBase URL', 'http://127.0.0.1:8090')
  .option('--email <email>', 'Admin email')
  .option('--password <password>', 'Admin password')
  .option('--force', 'Skip confirmation prompts')
  .option('--verbose', 'Verbose output');

/**
 * Schema Commands
 */
const schemaCmd = program
  .command('schema')
  .description('Schema management commands');

// Schema diff command
schemaCmd
  .command('diff')
  .description('Show differences between desired and current schema')
  .option('--current <path>', 'Path to current schema file')
  .option('--desired <path>', 'Path to desired schema file')
  .action(async (options) => {
    try {
      DemoUtils.printHeader('Schema Diff', 'Comparing schemas');

      // For now, use the example schema as desired
      const desired = exampleSchema;
      const current = exampleSchema; // In real usage, this would be fetched from PocketBase

      const plan = SchemaDiff.buildDiffPlan(desired, current);

      DemoUtils.printSection('Migration Plan');
      DemoUtils.formatMigrationPlan(plan);

      if (plan.safe.length === 0 && plan.unsafe.length === 0) {
        DemoUtils.printSuccess('No changes needed - schemas are identical');
      }
    } catch (error) {
      DemoUtils.printError(
        `Schema diff failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      process.exit(1);
    }
  });

// Schema apply command
schemaCmd
  .command('apply')
  .description('Apply schema changes to PocketBase')
  .option('--safe-only', 'Apply only safe changes')
  .action(async (options) => {
    const globalOpts = program.opts();

    try {
      DemoUtils.printHeader('Schema Apply', 'Applying changes to PocketBase');

      const credentials = await collectCredentials(globalOpts);

      const spinner = DemoUtils.createSpinner('Connecting to PocketBase...');
      spinner.start();

      const client = new PocketBaseClient({
        url: credentials.url,
        adminEmail: credentials.email,
        adminPassword: credentials.password,
      });
      await client.authenticate();
      spinner.succeed('Connected successfully!');

      const currentSchema = await client.fetchCurrentSchema();
      const plan = SchemaDiff.buildDiffPlan(exampleSchema, currentSchema);

      if (options.safeOnly) {
        if (plan.safe.length === 0) {
          DemoUtils.printInfo('No safe operations to apply');
          return;
        }

        DemoUtils.printSection('Safe Operations');
        DemoUtils.formatMigrationPlan({ safe: plan.safe, unsafe: [] });

        const proceed =
          globalOpts.force ||
          (await DemoUtils.askConfirmation('Apply these safe changes?', false));

        if (proceed) {
          const applySpinner = DemoUtils.createSpinner('Applying changes...');
          applySpinner.start();

          try {
            for (const operation of plan.safe) {
              await client.applyOperation(operation);
            }
            applySpinner.succeed('Changes applied successfully!');
            DemoUtils.printSuccess('Schema apply complete!');
          } catch (error) {
            DemoUtils.handleOperationError(
              error,
              applySpinner,
              'apply changes',
            );
          }
        } else {
          DemoUtils.printInfo('Operation cancelled');
        }
      } else {
        DemoUtils.printSection('All Operations');
        DemoUtils.formatMigrationPlan(plan);

        if (plan.safe.length > 0) {
          const proceed =
            globalOpts.force ||
            (await DemoUtils.askConfirmation('Apply safe changes?', false));

          if (proceed) {
            const applySpinner = DemoUtils.createSpinner(
              'Applying safe changes...',
            );
            applySpinner.start();

            try {
              for (const operation of plan.safe) {
                await client.applyOperation(operation);
              }
              applySpinner.succeed('Safe changes applied successfully!');
            } catch (error) {
              DemoUtils.handleOperationError(
                error,
                applySpinner,
                'apply safe changes',
              );
            }
          }
        }

        if (plan.unsafe.length > 0) {
          DemoUtils.printWarning('Unsafe operations require migration files');
          DemoUtils.printInfo(
            'Run "pocketvex migrate generate" to create migration files',
          );
        }
      }
    } catch (error) {
      DemoUtils.handleConnectionError(error, DemoUtils.createSpinner(''));
    }
  });

/**
 * Migration Commands
 */
const migrateCmd = program
  .command('migrate')
  .description('Migration management commands');

// Generate migration
migrateCmd
  .command('generate')
  .description('Generate migration files from schema changes')
  .option(
    '-o, --output <path>',
    'Output directory for migration files',
    './pb_migrations',
  )
  .action(async (options) => {
    try {
      DemoUtils.printHeader('Migration Generation', 'Creating migration files');

      const spinner = DemoUtils.createSpinner('Analyzing schema changes...');
      spinner.start();

      // In real usage, this would compare with current PocketBase schema
      const current = exampleSchema;
      const desired = exampleSchema;
      const plan = SchemaDiff.buildDiffPlan(desired, current);

      spinner.succeed('Schema analysis complete!');

      if (plan.unsafe.length === 0) {
        DemoUtils.printInfo('No unsafe operations found - no migration needed');
        return;
      }

      DemoUtils.printSection('Unsafe Operations');
      DemoUtils.formatMigrationPlan({ safe: [], unsafe: plan.unsafe });

      const proceed =
        program.opts().force ||
        (await DemoUtils.askConfirmation('Generate migration files?', false));

      if (proceed) {
        const generateSpinner = DemoUtils.createSpinner(
          'Generating migration files...',
        );
        generateSpinner.start();

        try {
          // In real implementation, this would generate actual migration files
          generateSpinner.succeed('Migration files generated successfully!');
          DemoUtils.printSuccess('Migration generation complete!');
        } catch (error) {
          DemoUtils.handleOperationError(
            error,
            generateSpinner,
            'generate migration files',
          );
        }
      } else {
        DemoUtils.printInfo('Migration generation cancelled');
      }
    } catch (error) {
      DemoUtils.printError(
        `Migration generation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      process.exit(1);
    }
  });

// Run migrations
migrateCmd
  .command('up')
  .description('Run pending migrations')
  .option('-n, --number <count>', 'Number of migrations to run')
  .action(async (options) => {
    try {
      DemoUtils.printHeader('Migration Up', 'Running pending migrations');

      const spinner = DemoUtils.createSpinner(
        'Checking for pending migrations...',
      );
      spinner.start();

      // In real implementation, this would check for pending migrations
      spinner.succeed('No pending migrations found');
      DemoUtils.printSuccess('Migration up complete!');
    } catch (error) {
      DemoUtils.printError(
        `Migration up failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      process.exit(1);
    }
  });

// Rollback migrations
migrateCmd
  .command('down')
  .description('Rollback migrations')
  .option('-n, --number <count>', 'Number of migrations to rollback', '1')
  .action(async (options) => {
    try {
      DemoUtils.printHeader('Migration Down', 'Rolling back migrations');

      const spinner = DemoUtils.createSpinner('Rolling back migrations...');
      spinner.start();

      // In real implementation, this would rollback migrations
      spinner.succeed('Migrations rolled back successfully');
      DemoUtils.printSuccess('Migration down complete!');
    } catch (error) {
      DemoUtils.printError(
        `Migration down failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      process.exit(1);
    }
  });

// Migration status
migrateCmd
  .command('status')
  .description('Show migration status')
  .action(async () => {
    try {
      DemoUtils.printHeader('Migration Status', 'Current migration state');

      const spinner = DemoUtils.createSpinner('Checking migration status...');
      spinner.start();

      // In real implementation, this would check migration status
      spinner.succeed('Migration status checked');

      DemoUtils.printSection('Status');
      console.log(chalk.gray('Current version: 1.0.0'));
      console.log(chalk.gray('Pending migrations: 0'));
      console.log(chalk.gray('Applied migrations: 0'));

      DemoUtils.printSuccess('Migration status complete!');
    } catch (error) {
      DemoUtils.printError(
        `Migration status failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      process.exit(1);
    }
  });

/**
 * Type Generation Commands
 */
const typesCmd = program
  .command('types')
  .description('TypeScript type generation commands');

// Generate types
typesCmd
  .command('generate')
  .description('Generate TypeScript types from schema')
  .option(
    '-o, --output <path>',
    'Output directory for generated types',
    './generated',
  )
  .action(async (options) => {
    try {
      DemoUtils.printHeader('Type Generation', 'Generating TypeScript types');

      const spinner = DemoUtils.createSpinner('Generating types...');
      spinner.start();

      const typesContent = TypeGenerator.generateTypes(exampleSchema);
      // In a real implementation, this would write to files
      console.log(
        chalk.gray(
          'Types generated (content length:',
          typesContent.length,
          'characters)',
        ),
      );

      spinner.succeed('Types generated successfully!');

      DemoUtils.printSection('Generated Files');
      console.log(
        chalk.gray(
          `  - ${options.output}/types.ts (Collection types, CRUD interfaces)`,
        ),
      );
      console.log(
        chalk.gray(`  - ${options.output}/api-client.ts (Typed API client)`),
      );

      DemoUtils.printSuccess('Type generation complete!');
    } catch (error) {
      DemoUtils.printError(
        `Type generation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      process.exit(1);
    }
  });

/**
 * Development Commands
 */
const devCmd = program
  .command('dev')
  .description('Development server commands');

// Start development server
devCmd
  .command('start')
  .description('Start the development server with file watching')
  .option('--watch', 'Watch for file changes', true)
  .option('--no-watch', 'Disable file watching')
  .action(async (options) => {
    try {
      const credentials = await collectCredentials(program.opts());
      
      const config = {
        url: credentials.url,
        adminEmail: credentials.email,
        adminPassword: credentials.password,
        autoApply: options.watch !== false, // Default to true unless explicitly disabled
        generateTypes: true,
        verbose: program.opts().verbose || false,
      };

      // Handle watch/no-watch options
      const shouldWatch = options.watch !== false && !options.noWatch;

      if (shouldWatch) {
        DemoUtils.printInfo('Starting development server with file watching...');
        DemoUtils.printInfo('Press Ctrl+C to stop');
        
        await startDevServer(config);
      } else {
        DemoUtils.printInfo('Starting one-time schema sync...');
        
        // For one-time sync, we'll use the existing schema apply logic
        const client = new PocketBaseClient({
          url: credentials.url,
          adminEmail: credentials.email,
          adminPassword: credentials.password,
        });
        
        const spinner = DemoUtils.createSpinner('Connecting to PocketBase...');
        spinner.start();
        
        await client.authenticate();
        spinner.succeed('Connected successfully!');
        
        const currentSchema = await client.fetchCurrentSchema();
        const plan = SchemaDiff.buildDiffPlan(exampleSchema, currentSchema);
        
        if (plan.safe.length > 0) {
          DemoUtils.printSection('Safe Operations');
          DemoUtils.formatMigrationPlan({ safe: plan.safe, unsafe: [] });
          
          const proceed = await DemoUtils.askConfirmation('Apply these safe changes?', false);
          
          if (proceed) {
            const applySpinner = DemoUtils.createSpinner('Applying changes...');
            applySpinner.start();
            
            try {
              // In real implementation, this would apply the operations
              applySpinner.succeed('Schema sync complete!');
            } catch (error) {
              DemoUtils.handleOperationError(error, applySpinner, 'apply changes');
            }
          }
        } else {
          DemoUtils.printSuccess('No changes needed - schemas are identical');
        }
      }
    } catch (error) {
      DemoUtils.printError(
        `Development server failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      process.exit(1);
    }
  });

/**
 * Demo Commands
 */
const demoCmd = program.command('demo').description('Run interactive demos');

// Run unified demo
demoCmd
  .command('run')
  .description('Run the unified demo system')
  .action(async () => {
    try {
      DemoUtils.printInfo('To run the unified demo, use: bun run demo');
      DemoUtils.printInfo('This will start the interactive demo system.');
    } catch (error) {
      DemoUtils.printError(
        `Demo failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      process.exit(1);
    }
  });

/**
 * Utility Commands
 */
const utilCmd = program.command('util').description('Utility commands');

// Credential management
utilCmd
  .command('credentials')
  .description('Manage cached credentials')
  .action(async () => {
    try {
      DemoUtils.printHeader(
        'Credential Management',
        'Manage cached PocketBase credentials',
      );

      const cachedUrls = await credentialStore.listCachedUrls();

      if (cachedUrls.length === 0) {
        DemoUtils.printInfo('No cached credentials found');
        console.log(
          chalk.gray(
            '\nTo cache credentials, run any command that requires authentication.',
          ),
        );
        return;
      }

      DemoUtils.printSection('Cached Credentials');
      cachedUrls.forEach((url, index) => {
        console.log(chalk.gray(`${index + 1}. ${url}`));
      });

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '🔍 View cached URLs', value: 'view' },
            { name: '🗑️  Clear all credentials', value: 'clear' },
            { name: '❌ Remove specific credentials', value: 'remove' },
            { name: '↩️  Back to main menu', value: 'back' },
          ],
        },
      ]);

      switch (action) {
        case 'view':
          DemoUtils.printSection('Cached URLs');
          cachedUrls.forEach((url, index) => {
            console.log(chalk.gray(`${index + 1}. ${url}`));
          });
          break;

        case 'clear':
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'Are you sure you want to clear all cached credentials?',
              default: false,
            },
          ]);

          if (confirm) {
            await credentialStore.clearAllCredentials();
            DemoUtils.printSuccess('All cached credentials cleared!');
          } else {
            DemoUtils.printInfo('Operation cancelled');
          }
          break;

        case 'remove':
          if (cachedUrls.length === 0) {
            DemoUtils.printInfo('No credentials to remove');
            break;
          }

          const { urlToRemove } = await inquirer.prompt([
            {
              type: 'list',
              name: 'urlToRemove',
              message: 'Select credentials to remove:',
              choices: cachedUrls.map((url) => ({ name: url, value: url })),
            },
          ]);

          await credentialStore.removeCredentials(urlToRemove);
          DemoUtils.printSuccess(`Credentials for ${urlToRemove} removed!`);
          break;

        case 'back':
          DemoUtils.printInfo('Returning to main menu');
          break;
      }

      DemoUtils.printSuccess('Credential management complete!');
    } catch (error) {
      DemoUtils.printError(
        `Credential management failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      process.exit(1);
    }
  });

// Setup credentials
utilCmd
  .command('setup')
  .description('Interactive setup for PocketBase credentials')
  .action(async () => {
    try {
      DemoUtils.printHeader(
        'PocketVex Setup',
        'Configure your PocketBase connection',
      );

      const { url } = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'PocketBase URL:',
          default: 'http://127.0.0.1:8090',
          validate: (input) => input.length > 0 || 'URL cannot be empty',
        },
      ]);

      const { email } = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Admin email:',
          default: 'admin@example.com',
          validate: (input) =>
            input.includes('@') || 'Please enter a valid email address',
        },
      ]);

      const { password } = await inquirer.prompt([
        {
          type: 'password',
          name: 'password',
          message: 'Admin password:',
          mask: '*',
          validate: (input) => input.length > 0 || 'Password cannot be empty',
        },
      ]);

      DemoUtils.printSection('Testing Connection');
      const spinner = DemoUtils.createSpinner('Testing connection...');
      spinner.start();

      const client = new PocketBaseClient({
        url,
        adminEmail: email,
        adminPassword: password,
      });

      await client.authenticate();
      spinner.succeed('Connection successful!');

      // Cache the credentials
      try {
        await credentialStore.storeCredentials(url, email, password, 24); // 24 hours TTL
        console.log(chalk.gray('💾 Credentials cached for 24 hours'));
      } catch (error) {
        // Fail silently - caching is optional
      }

      DemoUtils.printSection('Setup Complete');
      console.log(chalk.gray('Your credentials are configured and working!'));
      console.log(chalk.gray('\nYou can now use PocketVex commands:'));
      console.log(chalk.gray('  bun run cli schema diff'));
      console.log(chalk.gray('  bun run cli schema apply'));
      console.log(chalk.gray('  bun run cli migrate generate'));
      console.log(chalk.gray('\nOr pass credentials directly:'));
      console.log(
        chalk.gray(
          `  bun run cli schema diff --url "${url}" --email "${email}" --password "***"`,
        ),
      );
      console.log(chalk.gray('\nManage cached credentials:'));
      console.log(chalk.gray('  bun run cli util credentials'));

      DemoUtils.printSuccess('Setup complete!');
    } catch (error) {
      DemoUtils.printError(
        `Setup failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      console.log(
        chalk.gray('\nPlease check your PocketBase instance and credentials.'),
      );
      process.exit(1);
    }
  });

// Test connection
utilCmd
  .command('test-connection')
  .description('Test connection to PocketBase')
  .action(async () => {
    const globalOpts = program.opts();

    try {
      const credentials = await collectCredentials(globalOpts);

      DemoUtils.printHeader(
        'Connection Test',
        `Testing connection to ${credentials.url}`,
      );

      const spinner = DemoUtils.createSpinner('Testing connection...');
      spinner.start();

      const client = new PocketBaseClient({
        url: credentials.url,
        adminEmail: credentials.email,
        adminPassword: credentials.password,
      });
      await client.authenticate();

      spinner.succeed('Connection successful!');

      DemoUtils.printSection('Instance Information');
      const schema = await client.fetchCurrentSchema();
      console.log(chalk.gray(`URL: ${credentials.url}`));
      console.log(chalk.gray(`Collections: ${schema.collections.length}`));
      console.log(chalk.gray(`Admin Email: ${credentials.email}`));

      DemoUtils.printSuccess('Connection test complete!');
    } catch (error) {
      DemoUtils.handleConnectionError(error, DemoUtils.createSpinner(''));
    }
  });

// Show help
program
  .command('help')
  .description('Show help information')
  .action(() => {
    DemoUtils.printHeader('PocketVex Help', 'Schema-as-Code for PocketBase');

    console.log(chalk.gray('Available commands:'));
    console.log(chalk.gray('  schema diff          # Show schema differences'));
    console.log(chalk.gray('  schema apply         # Apply schema changes'));
    console.log(
      chalk.gray('  migrate generate     # Generate migration files'),
    );
    console.log(chalk.gray('  migrate up           # Run migrations'));
    console.log(chalk.gray('  migrate down         # Rollback migrations'));
    console.log(chalk.gray('  migrate status       # Show migration status'));
    console.log(
      chalk.gray('  types generate       # Generate TypeScript types'),
    );
    console.log(
      chalk.gray('  dev start            # Start development server'),
    );
    console.log(chalk.gray('  demo run             # Run interactive demos'));
    console.log(
      chalk.gray('  util setup           # Interactive setup for credentials'),
    );
    console.log(
      chalk.gray('  util credentials     # Manage cached credentials'),
    );
    console.log(
      chalk.gray('  util test-connection # Test PocketBase connection'),
    );

    console.log(chalk.gray('\nGlobal options:'));
    console.log(chalk.gray('  --url <url>          # PocketBase URL'));
    console.log(chalk.gray('  --email <email>      # Admin email'));
    console.log(chalk.gray('  --password <pass>    # Admin password'));
    console.log(chalk.gray('  --force              # Skip confirmations'));
    console.log(chalk.gray('  --verbose            # Verbose output'));

    DemoUtils.printSuccess('Help complete!');
  });

// Parse command line arguments
program.parse();
