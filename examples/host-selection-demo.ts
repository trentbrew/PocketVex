#!/usr/bin/env bun
/**
 * Host Selection Demo
 * Demonstrates the new host selection feature
 */

import chalk from 'chalk';
import { DemoUtils } from '../src/utils/demo-utils.js';

export class HostSelectionDemo {
  static async run() {
    DemoUtils.printHeader(
      'Host Selection Demo',
      'Interactive PocketBase host selection',
    );

    DemoUtils.printSection('What This Demo Shows');
    console.log(chalk.gray('This demo shows the new host selection feature:'));
    console.log(chalk.gray('  • Interactive host selection menu'));
    console.log(chalk.gray('  • Cached hosts display'));
    console.log(chalk.gray('  • Custom URL input with validation'));
    console.log(chalk.gray('  • Credential integration per host'));

    DemoUtils.printSection('Host Selection Menu');
    console.log(chalk.gray('When you run PocketVex commands, you\'ll see:'));
    console.log(chalk.blue(`
? Select PocketBase host:
❯ 🌐 Live PocketBase (pocketvex.pockethost.io)
  🏠 Local PocketBase (127.0.0.1:8090)
  💾 https://my-pb.example.com
  ✏️  Enter custom URL
`));

    DemoUtils.printSection('Available Options');
    console.log(chalk.gray('1. 🌐 Live PocketBase:'));
    console.log(chalk.blue('   https://pocketvex.pockethost.io'));
    console.log(chalk.gray('   Pre-configured live demo instance'));

    console.log(chalk.gray('\n2. 🏠 Local PocketBase:'));
    console.log(chalk.blue('   http://127.0.0.1:8090'));
    console.log(chalk.gray('   Default local development instance'));

    console.log(chalk.gray('\n3. 💾 Cached Hosts:'));
    console.log(chalk.blue('   Previously used hosts'));
    console.log(chalk.gray('   Shows hosts you\'ve used before with cached credentials'));

    console.log(chalk.gray('\n4. ✏️ Custom URL:'));
    console.log(chalk.blue('   Enter any PocketBase URL'));
    console.log(chalk.gray('   Validates URL format and prompts for credentials'));

    DemoUtils.printSection('Credential Integration');
    console.log(chalk.gray('After selecting a host:'));
    console.log(chalk.gray('  • If credentials are cached → Uses cached credentials'));
    console.log(chalk.gray('  • If no cached credentials → Prompts for email/password'));
    console.log(chalk.gray('  • Credentials are cached per host for 24 hours'));

    DemoUtils.printSection('Example Workflow');
    console.log(chalk.gray('1. Run a PocketVex command:'));
    console.log(chalk.green('   bun run dev'));
    console.log(chalk.gray('2. Select host from menu'));
    console.log(chalk.gray('3. Enter credentials (if not cached)'));
    console.log(chalk.gray('4. Command proceeds with selected host'));

    DemoUtils.printSection('Benefits');
    console.log(chalk.gray('• 🚀 Faster setup: No need to remember URLs'));
    console.log(chalk.gray('• 🔐 Secure: Credentials cached per host'));
    console.log(chalk.gray('• 🎯 Convenient: Quick access to used hosts'));
    console.log(chalk.gray('• ✨ User-friendly: Interactive selection'));

    DemoUtils.printSection('Try It Yourself');
    console.log(chalk.gray('Run any PocketVex command to see host selection:'));
    console.log(chalk.blue('   bun run dev'));
    console.log(chalk.blue('   bun run cli schema diff'));
    console.log(chalk.blue('   bun run demo'));

    DemoUtils.printDemoComplete('Host selection');
  }
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  HostSelectionDemo.run().catch(console.error);
}
