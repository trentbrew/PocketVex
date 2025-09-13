/**
 * PocketVex CRON Job Demo
 * Interactive demonstration of PocketBase JavaScript VM scheduling capabilities
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { DemoUtils } from '../../src/utils/demo-utils.js';

export class CronJobDemo {
  static async run() {
    DemoUtils.printHeader(
      'PocketBase CRON Jobs Demo',
      'JavaScript VM scheduling capabilities',
    );

    DemoUtils.printSection('CRON Job Patterns');
    console.log(chalk.gray('PocketBase supports comprehensive job scheduling:'));
    console.log(chalk.gray('  • Every minute: 0 * * * * *'));
    console.log(chalk.gray('  • Every 5 minutes: 0 */5 * * * *'));
    console.log(chalk.gray('  • Every hour: 0 0 * * * *'));
    console.log(chalk.gray('  • Daily at midnight: 0 0 0 * * *'));
    console.log(chalk.gray('  • Weekly on Monday: 0 0 9 * * 1'));
    console.log(chalk.gray('  • Business hours: 0 */15 9-17 * * 1-5'));
    console.log(chalk.gray('  • High frequency: */30 * * * * *'));

    DemoUtils.printSection('Example Use Cases');
    console.log(chalk.gray('Common CRON job patterns:'));
    console.log(chalk.gray('  🔄 Session cleanup (every minute)'));
    console.log(chalk.gray('  📊 Analytics generation (hourly)'));
    console.log(chalk.gray('  🧹 Data archiving (daily)'));
    console.log(chalk.gray('  📧 Email processing (every 5 minutes)'));
    console.log(chalk.gray('  🏥 Health monitoring (business hours)'));
    console.log(chalk.gray('  📈 Weekly reports (Monday 9 AM)'));

    DemoUtils.printSection('CRON Syntax');
    console.log(chalk.gray('Format: second minute hour day month dayOfWeek'));
    console.log(chalk.gray('  • * = any value'));
    console.log(chalk.gray('  • */5 = every 5 units'));
    console.log(chalk.gray('  • 1-5 = range (1 to 5)'));
    console.log(chalk.gray('  • 1,3,5 = specific values'));
    console.log(chalk.gray('  • ? = no specific value (day/dayOfWeek)'));

    DemoUtils.printSection('Interactive Examples');
    const { example } = await inquirer.prompt([
      {
        type: 'list',
        name: 'example',
        message: 'Choose a CRON job example to explore:',
        choices: [
          { name: '🔄 Session Cleanup (Every Minute)', value: 'session-cleanup' },
          { name: '📊 Analytics Generation (Hourly)', value: 'analytics' },
          { name: '🧹 Data Archiving (Daily)', value: 'archiving' },
          { name: '📧 Email Processing (Every 5 Min)', value: 'email' },
          { name: '🏥 Health Monitoring (Business Hours)', value: 'health' },
          { name: '📈 Weekly Reports (Monday 9 AM)', value: 'reports' },
          { name: '⚡ High-Frequency Tasks (Every 30s)', value: 'high-freq' },
          { name: '🎯 Conditional Jobs (Every 6 Hours)', value: 'conditional' },
          { name: '🛡️ Robust Error Handling', value: 'robust' },
          { name: '📋 View All Examples', value: 'all' },
        ],
      },
    ]);

    await this.showExample(example);

    DemoUtils.printSection('Implementation Guide');
    console.log(chalk.gray('To implement CRON jobs in your PocketBase:'));
    console.log(chalk.gray('  1. Create JavaScript files in pb_jobs/ directory'));
    console.log(chalk.gray('  2. Use $jobs.register() to define jobs'));
    console.log(chalk.gray('  3. Deploy to your PocketBase instance'));
    console.log(chalk.gray('  4. Monitor job execution in logs'));

    console.log(chalk.gray('\nExample file structure:'));
    console.log(chalk.gray('  pb_jobs/'));
    console.log(chalk.gray('    ├── session-cleanup.js'));
    console.log(chalk.gray('    ├── analytics.js'));
    console.log(chalk.gray('    ├── archiving.js'));
    console.log(chalk.gray('    └── email-processing.js'));

    DemoUtils.printSection('Best Practices');
    console.log(chalk.gray('CRON job best practices:'));
    console.log(chalk.gray('  ✅ Always handle errors gracefully'));
    console.log(chalk.gray('  ✅ Log job execution and results'));
    console.log(chalk.gray('  ✅ Use appropriate scheduling intervals'));
    console.log(chalk.gray('  ✅ Avoid overlapping job executions'));
    console.log(chalk.gray('  ✅ Monitor job performance and failures'));
    console.log(chalk.gray('  ✅ Use conditional logic when appropriate'));

    DemoUtils.printDemoComplete('CRON jobs');
  }

  private static async showExample(example: string) {
    switch (example) {
      case 'session-cleanup':
        await this.showSessionCleanup();
        break;
      case 'analytics':
        await this.showAnalytics();
        break;
      case 'archiving':
        await this.showArchiving();
        break;
      case 'email':
        await this.showEmailProcessing();
        break;
      case 'health':
        await this.showHealthMonitoring();
        break;
      case 'reports':
        await this.showWeeklyReports();
        break;
      case 'high-freq':
        await this.showHighFrequency();
        break;
      case 'conditional':
        await this.showConditional();
        break;
      case 'robust':
        await this.showRobustErrorHandling();
        break;
      case 'all':
        await this.showAllExamples();
        break;
    }
  }

  private static async showSessionCleanup() {
    DemoUtils.printSection('Session Cleanup (Every Minute)');
    console.log(chalk.gray('CRON: 0 * * * * *'));
    console.log(chalk.gray('Purpose: Clean up expired user sessions'));

    console.log(chalk.blue('\nCode Example:'));
    console.log(chalk.gray(`
$jobs.register('session-cleanup', '0 * * * * *', async (cron) => {
  console.log('Cleaning up expired sessions...');
  
  const expiredSessions = await $app.db().newQuery('sessions')
    .filter('expires < {:now}', { now: new Date() })
    .all();
    
  if (expiredSessions.length > 0) {
    console.log(\`Cleaning up \${expiredSessions.length} expired sessions\`);
    for (const session of expiredSessions) {
      await $app.db().delete('sessions', session.id);
    }
  }
});
`));

    console.log(chalk.green('✅ Benefits:'));
    console.log(chalk.gray('  • Keeps database clean'));
    console.log(chalk.gray('  • Improves performance'));
    console.log(chalk.gray('  • Prevents session table bloat'));
  }

  private static async showAnalytics() {
    DemoUtils.printSection('Analytics Generation (Hourly)');
    console.log(chalk.gray('CRON: 0 0 * * * *'));
    console.log(chalk.gray('Purpose: Generate hourly analytics data'));

    console.log(chalk.blue('\nCode Example:'));
    console.log(chalk.gray(`
$jobs.register('hourly-analytics', '0 0 * * * *', async (cron) => {
  const hourStart = new Date();
  hourStart.setMinutes(0, 0, 0);
  
  const hourlyStats = await $app.db().newQuery('page_views')
    .filter('created >= {:start}', { start: hourStart })
    .count();
    
  await $app.db().create('analytics', {
    type: 'hourly_views',
    period: hourStart.toISOString(),
    value: hourlyStats,
    created: new Date()
  });
});
`));

    console.log(chalk.green('✅ Benefits:'));
    console.log(chalk.gray('  • Real-time analytics'));
    console.log(chalk.gray('  • Historical data tracking'));
    console.log(chalk.gray('  • Performance insights'));
  }

  private static async showArchiving() {
    DemoUtils.printSection('Data Archiving (Daily)');
    console.log(chalk.gray('CRON: 0 0 0 * * *'));
    console.log(chalk.gray('Purpose: Archive old data and clean up logs'));

    console.log(chalk.blue('\nCode Example:'));
    console.log(chalk.gray(`
$jobs.register('daily-archive', '0 0 0 * * *', async (cron) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const oldLogs = await $app.db().newQuery('logs')
    .filter('created < {:yesterday}', { yesterday })
    .all();
    
  if (oldLogs.length > 0) {
    const archive = await $app.db().create('log_archives', {
      date: yesterday.toISOString().split('T')[0],
      count: oldLogs.length
    });
    
    for (const log of oldLogs) {
      await $app.db().update('logs', log.id, {
        archived: true,
        archiveId: archive.id
      });
    }
  }
});
`));

    console.log(chalk.green('✅ Benefits:'));
    console.log(chalk.gray('  • Database size management'));
    console.log(chalk.gray('  • Historical data preservation'));
    console.log(chalk.gray('  • Performance optimization'));
  }

  private static async showEmailProcessing() {
    DemoUtils.printSection('Email Processing (Every 5 Minutes)');
    console.log(chalk.gray('CRON: 0 */5 * * * *'));
    console.log(chalk.gray('Purpose: Process queued email tasks'));

    console.log(chalk.blue('\nCode Example:'));
    console.log(chalk.gray(`
$jobs.register('email-processor', '0 */5 * * * *', async (cron) => {
  const emailQueue = await $app.db().newQuery('email_queue')
    .filter('status = "pending"')
    .filter('scheduledAt <= {:now}', { now: new Date() })
    .limit(50)
    .all();
    
  for (const email of emailQueue) {
    try {
      await $app.db().update('email_queue', email.id, {
        status: 'sending'
      });
      
      await $app.newMailClient().send({
        from: email.from,
        to: email.to,
        subject: email.subject,
        html: email.html
      });
      
      await $app.db().update('email_queue', email.id, {
        status: 'sent',
        sentAt: new Date()
      });
    } catch (error) {
      await $app.db().update('email_queue', email.id, {
        status: 'failed',
        error: error.message
      });
    }
  }
});
`));

    console.log(chalk.green('✅ Benefits:'));
    console.log(chalk.gray('  • Reliable email delivery'));
    console.log(chalk.gray('  • Error handling and retry logic'));
    console.log(chalk.gray('  • Batch processing efficiency'));
  }

  private static async showHealthMonitoring() {
    DemoUtils.printSection('Health Monitoring (Business Hours)');
    console.log(chalk.gray('CRON: 0 */15 9-17 * * 1-5'));
    console.log(chalk.gray('Purpose: Monitor system health during business hours'));

    console.log(chalk.blue('\nCode Example:'));
    console.log(chalk.gray(`
$jobs.register('health-monitor', '0 */15 9-17 * * 1-5', async (cron) => {
  const healthCheck = {
    timestamp: new Date(),
    database: 'healthy',
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  try {
    await $app.db().newQuery('users').limit(1).all();
    healthCheck.database = 'healthy';
  } catch (error) {
    healthCheck.database = 'error';
    console.error('Database health check failed:', error);
  }
  
  await $app.db().create('health_checks', healthCheck);
  
  if (healthCheck.database === 'error') {
    // Send alert to monitoring system
    console.error('CRITICAL: Database connectivity issue!');
  }
});
`));

    console.log(chalk.green('✅ Benefits:'));
    console.log(chalk.gray('  • Proactive issue detection'));
    console.log(chalk.gray('  • Business hours monitoring'));
    console.log(chalk.gray('  • System performance tracking'));
  }

  private static async showWeeklyReports() {
    DemoUtils.printSection('Weekly Reports (Monday 9 AM)');
    console.log(chalk.gray('CRON: 0 0 9 * * 1'));
    console.log(chalk.gray('Purpose: Generate and send weekly reports'));

    console.log(chalk.blue('\nCode Example:'));
    console.log(chalk.gray(`
$jobs.register('weekly-reports', '0 0 9 * * 1', async (cron) => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  
  const weeklyStats = {
    newUsers: await $app.db().newQuery('users')
      .filter('created >= {:weekStart}', { weekStart })
      .count(),
    totalPosts: await $app.db().newQuery('posts')
      .filter('created >= {:weekStart}', { weekStart })
      .count()
  };
  
  const report = await $app.db().create('reports', {
    type: 'weekly',
    period: weekStart.toISOString(),
    data: weeklyStats
  });
  
  // Send email notification
  await $app.newMailClient().send({
    from: 'noreply@yourapp.com',
    to: 'admin@yourapp.com',
    subject: 'Weekly Report',
    html: \`<h2>Weekly Report</h2>
           <p>New Users: \${weeklyStats.newUsers}</p>
           <p>New Posts: \${weeklyStats.totalPosts}</p>\`
  });
});
`));

    console.log(chalk.green('✅ Benefits:'));
    console.log(chalk.gray('  • Automated reporting'));
    console.log(chalk.gray('  • Stakeholder communication'));
    console.log(chalk.gray('  • Historical trend analysis'));
  }

  private static async showHighFrequency() {
    DemoUtils.printSection('High-Frequency Tasks (Every 30 Seconds)');
    console.log(chalk.gray('CRON: */30 * * * * *'));
    console.log(chalk.gray('Purpose: Process real-time tasks and queues'));

    console.log(chalk.blue('\nCode Example:'));
    console.log(chalk.gray(`
$jobs.register('task-processor', '*/30 * * * * *', async (cron) => {
  const queuedTasks = await $app.db().newQuery('task_queue')
    .filter('status = "pending"')
    .filter('scheduledAt <= {:now}', { now: new Date() })
    .limit(10)
    .all();
    
  for (const task of queuedTasks) {
    try {
      await $app.db().update('task_queue', task.id, {
        status: 'processing'
      });
      
      // Process task based on type
      switch (task.type) {
        case 'notification':
          await sendNotification(task.data);
          break;
        case 'data_export':
          await exportData(task.data);
          break;
      }
      
      await $app.db().update('task_queue', task.id, {
        status: 'completed'
      });
    } catch (error) {
      await $app.db().update('task_queue', task.id, {
        status: 'failed',
        error: error.message
      });
    }
  }
});
`));

    console.log(chalk.green('✅ Benefits:'));
    console.log(chalk.gray('  • Real-time task processing'));
    console.log(chalk.gray('  • Low-latency operations'));
    console.log(chalk.gray('  • Efficient queue management'));
  }

  private static async showConditional() {
    DemoUtils.printSection('Conditional Jobs (Every 6 Hours)');
    console.log(chalk.gray('CRON: 0 0 */6 * * *'));
    console.log(chalk.gray('Purpose: Run jobs only when conditions are met'));

    console.log(chalk.blue('\nCode Example:'));
    console.log(chalk.gray(`
$jobs.register('conditional-job', '0 0 */6 * * *', async (cron) => {
  // Check maintenance mode
  const settings = await $app.db().newQuery('settings')
    .filter('key = "maintenance_mode"')
    .one();
    
  if (settings && settings.value === 'true') {
    console.log('Skipping job - maintenance mode enabled');
    return;
  }
  
  // Check if we have work to do
  const pendingCount = await $app.db().newQuery('task_queue')
    .filter('status = "pending"')
    .count();
    
  if (pendingCount === 0) {
    console.log('Skipping job - no pending tasks');
    return;
  }
  
  console.log(\`Processing \${pendingCount} pending tasks...\`);
  // Process tasks...
});
`));

    console.log(chalk.green('✅ Benefits:'));
    console.log(chalk.gray('  • Smart resource usage'));
    console.log(chalk.gray('  • Maintenance mode support'));
    console.log(chalk.gray('  • Conditional execution logic'));
  }

  private static async showRobustErrorHandling() {
    DemoUtils.printSection('Robust Error Handling');
    console.log(chalk.gray('CRON: 0 0 2 * * * (Daily at 2 AM)'));
    console.log(chalk.gray('Purpose: Demonstrate comprehensive error handling'));

    console.log(chalk.blue('\nCode Example:'));
    console.log(chalk.gray(`
$jobs.register('robust-job', '0 0 2 * * *', async (cron) => {
  const jobId = \`robust-job-\${Date.now()}\`;
  
  try {
    // Log job start
    await $app.db().create('job_logs', {
      jobId,
      jobName: 'robust-job',
      status: 'started',
      startedAt: new Date()
    });
    
    // Perform work
    await performWork();
    
    // Log success
    await $app.db().create('job_logs', {
      jobId,
      status: 'completed',
      completedAt: new Date()
    });
    
  } catch (error) {
    // Log failure
    await $app.db().create('job_logs', {
      jobId,
      status: 'failed',
      failedAt: new Date(),
      error: error.message,
      stack: error.stack
    });
    
    throw error; // Re-throw to mark job as failed
  }
});
`));

    console.log(chalk.green('✅ Benefits:'));
    console.log(chalk.gray('  • Comprehensive logging'));
    console.log(chalk.gray('  • Error tracking and debugging'));
    console.log(chalk.gray('  • Job execution monitoring'));
  }

  private static async showAllExamples() {
    const examples = [
      'session-cleanup',
      'analytics',
      'archiving',
      'email',
      'health',
      'reports',
      'high-freq',
      'conditional',
      'robust',
    ];

    for (const example of examples) {
      await this.showExample(example);
      console.log(chalk.gray('\n' + '─'.repeat(60) + '\n'));
    }
  }
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  CronJobDemo.run().catch(console.error);
}
