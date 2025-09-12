/**
 * Common utilities for PocketVex demos
 * Provides shared functionality for demo scripts
 */

import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import inquirer from 'inquirer';

// Demo configuration types
export interface DemoConfig {
  url: string;
  adminEmail: string;
  adminPassword: string;
}

export interface DemoConfigs {
  live: DemoConfig;
  local: DemoConfig;
}

// Default demo configurations
export const DEFAULT_DEMO_CONFIGS: DemoConfigs = {
  live: {
    url: 'https://pocketvex.pockethost.io',
    adminEmail: process.env.PB_ADMIN_EMAIL || 'demo@example.com',
    adminPassword: process.env.PB_ADMIN_PASS || 'myPassword123',
  },
  local: {
    url: 'http://127.0.0.1:8090',
    adminEmail: 'admin@example.com',
    adminPassword: 'admin123',
  },
};

// Demo utilities class
export class DemoUtils {
  /**
   * Interactive demo mode selection
   */
  static async selectDemoMode(): Promise<string> {
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Select demo mode:',
        choices: [
          { name: '🏠 Basic Demo (Local/Schema Only)', value: 'basic' },
          { name: '🌐 Live Demo (Remote PocketBase)', value: 'live' },
          { name: '⚡ Real-time Migration Demo', value: 'realtime' },
          { name: '📈 Incremental Migration Demo', value: 'incremental' },
          { name: '🔧 JavaScript VM Features Demo', value: 'js-vm' },
          { name: '🧪 Test Connection Only', value: 'test' },
        ],
      },
    ]);
    return mode;
  }

  /**
   * Interactive PocketBase instance selection
   */
  static async selectPocketBaseInstance(
    configs: DemoConfigs = DEFAULT_DEMO_CONFIGS,
  ): Promise<DemoConfig> {
    const { instance } = await inquirer.prompt([
      {
        type: 'list',
        name: 'instance',
        message: 'Select PocketBase instance:',
        choices: [
          { name: '🌐 Live Instance (pocketvex.pockethost.io)', value: 'live' },
          { name: '🏠 Local Instance (127.0.0.1:8090)', value: 'local' },
          { name: '⚙️  Custom Instance', value: 'custom' },
        ],
      },
    ]);

    if (instance === 'custom') {
      return await this.collectCustomCredentials();
    }

    return configs[instance as keyof DemoConfigs];
  }

  /**
   * Collect custom PocketBase credentials
   */
  static async collectCustomCredentials(): Promise<DemoConfig> {
    this.printSection('Custom PocketBase Configuration');

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

    return { url, adminEmail: email, adminPassword: password };
  }

  /**
   * Print demo header
   */
  static printHeader(title: string, description?: string): void {
    console.log(chalk.blue(`\n🚀 ${title}\n`));
    if (description) {
      console.log(chalk.gray(description));
    }
  }

  /**
   * Print demo section
   */
  static printSection(title: string): void {
    console.log(chalk.yellow(`\n📋 ${title}`));
  }

  /**
   * Print success message
   */
  static printSuccess(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
  }

  /**
   * Print warning message
   */
  static printWarning(message: string): void {
    console.log(chalk.yellow(`⚠️  ${message}`));
  }

  /**
   * Print error message
   */
  static printError(message: string): void {
    console.log(chalk.red(`❌ ${message}`));
  }

  /**
   * Print info message
   */
  static printInfo(message: string): void {
    console.log(chalk.blue(`ℹ️  ${message}`));
  }

  /**
   * Print setup instructions for failed connections
   */
  static printSetupInstructions(): void {
    console.log(chalk.gray('\n💡 Setup instructions:'));
    console.log(chalk.gray('  1. Set environment variables:'));
    console.log(
      chalk.gray('     export PB_ADMIN_EMAIL="your-email@example.com"'),
    );
    console.log(chalk.gray('     export PB_ADMIN_PASS="your-password"'));
    console.log(chalk.gray('  2. Or update the config in this demo'));
  }

  /**
   * Print development workflow instructions
   */
  static printDevelopmentWorkflow(): void {
    console.log(chalk.gray('Development workflow:'));
    console.log(chalk.gray('  1. Start dev server: bun run dev --watch'));
    console.log(chalk.gray('  2. Edit schema files in schema/ directory'));
    console.log(chalk.gray('  3. Safe changes apply automatically'));
    console.log(chalk.gray('  4. Unsafe changes generate migration files'));
    console.log(chalk.gray('  5. Review and run migrations in production'));
  }

  /**
   * Print available commands
   */
  static printAvailableCommands(): void {
    console.log(chalk.gray('Available commands:'));
    console.log(
      chalk.gray('  bun run dev --watch     # Start development server'),
    );
    console.log(chalk.gray('  bun run schema:apply    # Apply safe changes'));
    console.log(chalk.gray('  bun run schema:diff     # Show differences'));
    console.log(chalk.gray('  bun run migrate generate # Generate migration'));
    console.log(chalk.gray('  bun run migrate up      # Run migrations'));
    console.log(chalk.gray('  bun run status          # Check connection'));
  }

  /**
   * Print environment setup instructions
   */
  static printEnvironmentSetup(): void {
    console.log(chalk.gray('Environment setup:'));
    console.log(chalk.gray('  export PB_URL="http://127.0.0.1:8090"'));
    console.log(chalk.gray('  export PB_ADMIN_EMAIL="admin@example.com"'));
    console.log(chalk.gray('  export PB_ADMIN_PASS="admin123"'));
  }

  /**
   * Create a spinner with consistent styling
   */
  static createSpinner(message: string): Ora {
    return ora(message);
  }

  /**
   * Handle connection errors consistently
   */
  static handleConnectionError(error: unknown, spinner: Ora): void {
    spinner.fail('Connection failed');
    this.printError(
      `Failed to connect: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
    this.printSetupInstructions();
  }

  /**
   * Handle operation errors consistently
   */
  static handleOperationError(
    error: unknown,
    spinner: Ora,
    operation: string,
  ): void {
    spinner.fail(`Failed to ${operation}`);
    this.printError(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  /**
   * Format collection information for display
   */
  static formatCollectionInfo(collections: any[]): void {
    console.log(chalk.gray(`Found ${collections.length} collections:`));
    collections.forEach((col) => {
      console.log(
        chalk.gray(`  • ${col.name} (${col.schema?.length || 0} fields)`),
      );
    });
  }

  /**
   * Format migration plan for display
   */
  static formatMigrationPlan(plan: any): void {
    console.log(chalk.gray(`Safe operations: ${plan.safe.length}`));
    console.log(chalk.gray(`Unsafe operations: ${plan.unsafe.length}`));

    if (plan.safe.length > 0) {
      console.log(chalk.gray('\nSafe operations that would be applied:'));
      plan.safe.forEach((op: any, i: number) => {
        console.log(chalk.green(`  ${i + 1}. ${op.summary || op.description}`));
      });
    }

    if (plan.unsafe.length > 0) {
      console.log(chalk.gray('\nUnsafe operations requiring migration:'));
      plan.unsafe.forEach((op: any, i: number) => {
        console.log(
          chalk.yellow(`  ${i + 1}. ${op.summary || op.description}`),
        );
        if (op.warning) {
          console.log(chalk.red(`     ⚠️  ${op.warning}`));
        }
      });
    }
  }

  /**
   * Ask for confirmation before proceeding
   */
  static async askConfirmation(
    message: string,
    defaultValue: boolean = false,
  ): Promise<boolean> {
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message,
        default: defaultValue,
      },
    ]);
    return proceed;
  }

  /**
   * Print demo completion message
   */
  static printDemoComplete(demoName: string): void {
    this.printSuccess(`${demoName} demo complete!`);
    console.log(chalk.gray('\n📖 See README.md for detailed documentation.'));
  }
}
