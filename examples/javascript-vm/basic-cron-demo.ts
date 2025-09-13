#!/usr/bin/env bun
/**
 * Basic CRON Job Demo
 * Simple demonstration of a basic CRON job that logs every 60 seconds
 */

import chalk from 'chalk';
import { DemoUtils } from '../../src/utils/demo-utils.js';

export class BasicCronDemo {
  static async run() {
    DemoUtils.printHeader(
      'Basic CRON Job Demo',
      'Simple logging every 60 seconds',
    );

    DemoUtils.printSection('What This Demo Shows');
    console.log(chalk.gray('This demo demonstrates a basic CRON job that:'));
    console.log(chalk.gray('  • Runs every 60 seconds'));
    console.log(chalk.gray('  • Logs timestamp and system information'));
    console.log(chalk.gray('  • Optionally saves logs to database'));
    console.log(chalk.gray('  • Shows basic error handling'));

    DemoUtils.printSection('CRON Job Code');
    console.log(chalk.blue("Here's the complete JavaScript code:"));
    console.log(
      chalk.gray(`
// Register a CRON job that runs every 60 seconds
$jobs.register('basic-logging', '*/60 * * * * *', async (cron) => {
  const timestamp = new Date().toISOString();
  console.log(\`🕐 Basic logging job executed at: \${timestamp}\`);

  // You can add more logic here
  console.log('📊 System status: Running normally');
  console.log('💾 Memory usage:', process.memoryUsage());
  console.log('⏱️  Uptime:', Math.floor(process.uptime()), 'seconds');

  // Optional: Store the log in the database
  try {
    await $app.db().create('job_logs', {
      jobName: 'basic-logging',
      message: 'Basic logging job executed successfully',
      timestamp: timestamp,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      created: new Date()
    });
    console.log('✅ Log entry saved to database');
  } catch (error) {
    console.log('⚠️  Could not save to database (table might not exist):', error.message);
  }

  console.log('✅ Basic logging job completed\\n');
});

console.log('✅ Basic logging CRON job registered (runs every 60 seconds)');
`),
    );

    DemoUtils.printSection('CRON Schedule Explanation');
    console.log(chalk.gray("Schedule: '*/60 * * * * *'"));
    console.log(chalk.gray('Format: second minute hour day month dayOfWeek'));
    console.log(chalk.gray('  • */60 = every 60 seconds'));
    console.log(chalk.gray('  • * = any minute'));
    console.log(chalk.gray('  • * = any hour'));
    console.log(chalk.gray('  • * = any day'));
    console.log(chalk.gray('  • * = any month'));
    console.log(chalk.gray('  • * = any day of week'));
    console.log(chalk.gray('Result: Runs every 60 seconds'));

    DemoUtils.printSection('Alternative Schedules');
    console.log(chalk.gray('For different intervals, use these schedules:'));
    console.log(chalk.gray("  • Every 30 seconds: '*/30 * * * * *'"));
    console.log(chalk.gray("  • Every 2 minutes: '0 */2 * * * *'"));
    console.log(chalk.gray("  • Every 5 minutes: '0 */5 * * * *'"));
    console.log(chalk.gray("  • Every 10 minutes: '0 */10 * * * *'"));
    console.log(chalk.gray("  • Every 15 minutes: '0 */15 * * * *'"));
    console.log(chalk.gray("  • Every 30 minutes: '0 */30 * * * *'"));

    DemoUtils.printSection('Expected Output');
    console.log(chalk.gray("When the job runs, you'll see output like:"));
    console.log(
      chalk.green(`
🕐 Basic logging job executed at: 2024-01-15T10:30:00.000Z
📊 System status: Running normally
💾 Memory usage: { rss: 45678912, heapTotal: 20971520, heapUsed: 12345678, external: 1234567 }
⏱️  Uptime: 3600 seconds
✅ Log entry saved to database
✅ Basic logging job completed
`),
    );

    DemoUtils.printSection('How to Deploy');
    console.log(chalk.gray('To use this CRON job in your PocketBase:'));
    console.log(
      chalk.gray('  1. Copy the code to a file in your pb_jobs/ directory'),
    );
    console.log(chalk.gray("  2. Name it something like 'basic-logging.js'"));
    console.log(chalk.gray('  3. Deploy to your PocketBase instance'));
    console.log(chalk.gray('  4. Check the PocketBase logs to see the output'));

    DemoUtils.printSection('File Location');
    console.log(chalk.gray('This example is available at:'));
    console.log(chalk.blue('  pb_jobs/basic-logging.js'));
    console.log(
      chalk.gray(
        'You can copy this file directly to your PocketBase instance.',
      ),
    );

    DemoUtils.printSection('Customization Ideas');
    console.log(chalk.gray('You can customize this basic job by:'));
    console.log(
      chalk.gray('  • Changing the schedule (e.g., every 30 seconds)'),
    );
    console.log(chalk.gray('  • Adding more system information'));
    console.log(chalk.gray('  • Logging to different database tables'));
    console.log(chalk.gray('  • Adding conditional logic'));
    console.log(chalk.gray('  • Sending notifications or alerts'));
    console.log(chalk.gray('  • Performing cleanup tasks'));

    DemoUtils.printDemoComplete('basic CRON job');
  }
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  BasicCronDemo.run().catch(console.error);
}
