#!/usr/bin/env bun
/**
 * JavaScript VM Auto-Deployment Demo
 * Demonstrates how PocketVex automatically deploys JavaScript VM files
 */

import chalk from 'chalk';
import { DemoUtils } from '../../src/utils/demo-utils.js';

export class AutoDeploymentDemo {
  static async run() {
    DemoUtils.printHeader(
      'JavaScript VM Auto-Deployment Demo',
      'Convex-like automatic deployment for PocketBase',
    );

    DemoUtils.printSection('What This Demo Shows');
    console.log(chalk.gray('This demo demonstrates how PocketVex automatically deploys JavaScript VM files:'));
    console.log(chalk.gray('  • File watching in pb_jobs/, pb_hooks/, pb_commands/, pb_queries/'));
    console.log(chalk.gray('  • Automatic deployment when files change'));
    console.log(chalk.gray('  • Initial deployment of existing files'));
    console.log(chalk.gray('  • Real-time updates without PocketBase restart'));

    DemoUtils.printSection('How It Works');
    console.log(chalk.gray('1. Start the dev server:'));
    console.log(chalk.blue('   bun run dev'));
    console.log(chalk.gray('2. PocketVex automatically scans for existing JavaScript VM files'));
    console.log(chalk.gray('3. Deploys all found files to PocketBase'));
    console.log(chalk.gray('4. Starts watching for file changes'));
    console.log(chalk.gray('5. When you save a file, it\'s automatically deployed'));

    DemoUtils.printSection('Supported Directories');
    console.log(chalk.gray('PocketVex watches these directories:'));
    console.log(chalk.blue('  📁 pb_jobs/     - CRON jobs and scheduled tasks'));
    console.log(chalk.blue('  📁 pb_hooks/    - Event hooks and middleware'));
    console.log(chalk.blue('  📁 pb_commands/ - Console commands'));
    console.log(chalk.blue('  📁 pb_queries/  - Custom queries and utilities'));

    DemoUtils.printSection('Example Workflow');
    console.log(chalk.gray('1. Start the dev server:'));
    console.log(chalk.green('   $ bun run dev'));
    console.log(chalk.gray('   🚀 Deploying existing JavaScript VM files...'));
    console.log(chalk.gray('     📁 Found 2 files in pb_jobs/'));
    console.log(chalk.gray('   ✅ Deployed: basic-logging.js → pb_jobs/'));
    console.log(chalk.gray('   ✅ Deployed: example-jobs.js → pb_jobs/'));
    console.log(chalk.gray('   ✅ Deployed 2 JavaScript VM files'));

    console.log(chalk.gray('\n2. Edit a CRON job file:'));
    console.log(chalk.green('   $ echo \'$jobs.register("test", "*/60 * * * * *", () => console.log("Hello!"));\' > pb_jobs/test.js'));
    console.log(chalk.gray('   🔄 JS VM file change: test.js'));
    console.log(chalk.gray('   ✅ Deployed: test.js → pb_jobs/'));

    console.log(chalk.gray('\n3. Edit a hook file:'));
    console.log(chalk.green('   $ echo \'$app.onRecordCreate("users", (e) => console.log("New user:", e.record.id));\' > pb_hooks/user-hooks.js'));
    console.log(chalk.gray('   🔄 JS VM file change: user-hooks.js'));
    console.log(chalk.gray('   ✅ Deployed: user-hooks.js → pb_hooks/'));

    DemoUtils.printSection('File Operations');
    console.log(chalk.gray('PocketVex handles all file operations:'));
    console.log(chalk.gray('  • Add: New files are automatically deployed'));
    console.log(chalk.gray('  • Change: Modified files are redeployed'));
    console.log(chalk.gray('  • Delete: Removed files are cleaned up from PocketBase'));

    DemoUtils.printSection('Error Handling');
    console.log(chalk.gray('If deployment fails, you\'ll see clear error messages:'));
    console.log(chalk.red('   ❌ Failed to deploy test.js: Connection timeout'));
    console.log(chalk.gray('   The dev server continues running and will retry on the next change.'));

    DemoUtils.printSection('Comparison with Convex');
    console.log(chalk.gray('This provides the same experience as Convex:'));
    console.log(chalk.gray('  Convex: Edit files in /convex → Auto-deployed'));
    console.log(chalk.gray('  PocketVex: Edit files in pb_jobs/, pb_hooks/, etc. → Auto-deployed'));

    DemoUtils.printSection('Try It Yourself');
    console.log(chalk.gray('1. Start the dev server:'));
    console.log(chalk.blue('   bun run dev'));
    console.log(chalk.gray('2. Create a test file:'));
    console.log(chalk.blue('   echo \'console.log("Hello from PocketVex!");\' > pb_jobs/test.js'));
    console.log(chalk.gray('3. Watch it get deployed automatically!'));
    console.log(chalk.gray('4. Edit the file and see it redeploy'));

    DemoUtils.printDemoComplete('JavaScript VM auto-deployment');
  }
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  AutoDeploymentDemo.run().catch(console.error);
}
