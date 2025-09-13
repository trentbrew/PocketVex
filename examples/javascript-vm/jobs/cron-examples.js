/**
 * PocketBase CRON Job Examples
 * Demonstrates various scheduling patterns and use cases
 */

// ============================================================================
// BASIC CRON PATTERNS
// ============================================================================

// Every minute
$jobs.register('every-minute', '0 * * * * *', async (cron) => {
  console.log('Running every minute:', new Date().toISOString());
  
  // Example: Clean up expired sessions
  const expiredSessions = await $app.db().newQuery('sessions')
    .filter('expires < {:now}', { now: new Date() })
    .all();
    
  if (expiredSessions.length > 0) {
    console.log(`Cleaning up ${expiredSessions.length} expired sessions`);
    for (const session of expiredSessions) {
      await $app.db().delete('sessions', session.id);
    }
  }
});

// Every 5 minutes
$jobs.register('every-5-minutes', '0 */5 * * * *', async (cron) => {
  console.log('Running every 5 minutes:', new Date().toISOString());
  
  // Example: Update user activity status
  const inactiveUsers = await $app.db().newQuery('users')
    .filter('lastSeen < {:threshold}', { 
      threshold: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    })
    .all();
    
  for (const user of inactiveUsers) {
    await $app.db().update('users', user.id, {
      status: 'offline',
      updated: new Date()
    });
  }
});

// Every hour at minute 0
$jobs.register('every-hour', '0 0 * * * *', async (cron) => {
  console.log('Running every hour:', new Date().toISOString());
  
  // Example: Generate hourly analytics
  const hourStart = new Date();
  hourStart.setMinutes(0, 0, 0);
  const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
  
  const hourlyStats = await $app.db().newQuery('page_views')
    .filter('created >= {:start} && created < {:end}', {
      start: hourStart,
      end: hourEnd
    })
    .count();
    
  await $app.db().create('analytics', {
    type: 'hourly_views',
    period: hourStart.toISOString(),
    value: hourlyStats,
    created: new Date()
  });
});

// Every day at midnight
$jobs.register('daily-midnight', '0 0 0 * * *', async (cron) => {
  console.log('Running daily at midnight:', new Date().toISOString());
  
  // Example: Daily backup and cleanup
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  // Archive old logs
  const oldLogs = await $app.db().newQuery('logs')
    .filter('created < {:yesterday}', { yesterday })
    .all();
    
  if (oldLogs.length > 0) {
    console.log(`Archiving ${oldLogs.length} old log entries`);
    
    // Create archive record
    const archive = await $app.db().create('log_archives', {
      date: yesterday.toISOString().split('T')[0],
      count: oldLogs.length,
      created: new Date()
    });
    
    // Move logs to archive (in a real app, you might export to file)
    for (const log of oldLogs) {
      await $app.db().update('logs', log.id, {
        archived: true,
        archiveId: archive.id,
        archivedAt: new Date()
      });
    }
  }
});

// Every Monday at 9 AM
$jobs.register('weekly-monday', '0 0 9 * * 1', async (cron) => {
  console.log('Running weekly on Monday at 9 AM:', new Date().toISOString());
  
  // Example: Weekly report generation
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  
  const weeklyStats = {
    newUsers: await $app.db().newQuery('users')
      .filter('created >= {:weekStart}', { weekStart })
      .count(),
    totalPosts: await $app.db().newQuery('posts')
      .filter('created >= {:weekStart}', { weekStart })
      .count(),
    totalViews: await $app.db().newQuery('page_views')
      .filter('created >= {:weekStart}', { weekStart })
      .count()
  };
  
  // Create weekly report
  await $app.db().create('reports', {
    type: 'weekly',
    period: weekStart.toISOString(),
    data: weeklyStats,
    created: new Date()
  });
  
  // Send email notification (if email is configured)
  try {
    await $app.newMailClient().send({
      from: 'noreply@yourapp.com',
      to: 'admin@yourapp.com',
      subject: 'Weekly Report',
      html: `
        <h2>Weekly Report</h2>
        <p>New Users: ${weeklyStats.newUsers}</p>
        <p>New Posts: ${weeklyStats.totalPosts}</p>
        <p>Total Views: ${weeklyStats.totalViews}</p>
      `
    });
  } catch (error) {
    console.log('Failed to send weekly report email:', error);
  }
});

// ============================================================================
// ADVANCED CRON PATTERNS
// ============================================================================

// Every 15 minutes during business hours (9 AM - 5 PM, Monday-Friday)
$jobs.register('business-hours', '0 */15 9-17 * * 1-5', async (cron) => {
  console.log('Running during business hours:', new Date().toISOString());
  
  // Example: Monitor system health
  const healthCheck = {
    timestamp: new Date(),
    database: 'healthy',
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  // Check database connectivity
  try {
    await $app.db().newQuery('users').limit(1).all();
    healthCheck.database = 'healthy';
  } catch (error) {
    healthCheck.database = 'error';
    console.error('Database health check failed:', error);
  }
  
  // Store health check result
  await $app.db().create('health_checks', healthCheck);
  
  // Alert if issues detected
  if (healthCheck.database === 'error') {
    console.error('CRITICAL: Database connectivity issue detected!');
    // In a real app, you might send alerts to monitoring systems
  }
});

// Every 30 seconds (for high-frequency tasks)
$jobs.register('high-frequency', '*/30 * * * * *', async (cron) => {
  console.log('Running every 30 seconds:', new Date().toISOString());
  
  // Example: Process queued tasks
  const queuedTasks = await $app.db().newQuery('task_queue')
    .filter('status = "pending"')
    .filter('scheduledAt <= {:now}', { now: new Date() })
    .limit(10)
    .all();
    
  for (const task of queuedTasks) {
    try {
      // Update task status
      await $app.db().update('task_queue', task.id, {
        status: 'processing',
        startedAt: new Date()
      });
      
      // Process the task based on type
      switch (task.type) {
        case 'email':
          await processEmailTask(task);
          break;
        case 'notification':
          await processNotificationTask(task);
          break;
        case 'data_export':
          await processDataExportTask(task);
          break;
        default:
          console.log(`Unknown task type: ${task.type}`);
      }
      
      // Mark as completed
      await $app.db().update('task_queue', task.id, {
        status: 'completed',
        completedAt: new Date()
      });
      
    } catch (error) {
      console.error(`Task ${task.id} failed:`, error);
      await $app.db().update('task_queue', task.id, {
        status: 'failed',
        error: error.message,
        failedAt: new Date()
      });
    }
  }
});

// ============================================================================
// CONDITIONAL CRON JOBS
// ============================================================================

// Run only if certain conditions are met
$jobs.register('conditional-job', '0 0 */6 * * *', async (cron) => {
  console.log('Running conditional job every 6 hours:', new Date().toISOString());
  
  // Check if maintenance mode is enabled
  const settings = await $app.db().newQuery('settings')
    .filter('key = "maintenance_mode"')
    .one();
    
  if (settings && settings.value === 'true') {
    console.log('Skipping job - maintenance mode is enabled');
    return;
  }
  
  // Check if we have pending tasks
  const pendingCount = await $app.db().newQuery('task_queue')
    .filter('status = "pending"')
    .count();
    
  if (pendingCount === 0) {
    console.log('Skipping job - no pending tasks');
    return;
  }
  
  console.log(`Processing ${pendingCount} pending tasks...`);
  // Process tasks...
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function processEmailTask(task) {
  console.log(`Processing email task: ${task.id}`);
  
  const emailData = task.data;
  await $app.newMailClient().send({
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html
  });
}

async function processNotificationTask(task) {
  console.log(`Processing notification task: ${task.id}`);
  
  const notificationData = task.data;
  
  // Send push notification, webhook, etc.
  if (notificationData.webhook) {
    await $app.newRequest().send({
      url: notificationData.webhook,
      method: 'POST',
      body: notificationData.payload
    });
  }
}

async function processDataExportTask(task) {
  console.log(`Processing data export task: ${task.id}`);
  
  const exportData = task.data;
  const records = await $app.db().newQuery(exportData.collection)
    .filter(exportData.filter || '')
    .all();
    
  // In a real app, you might generate a CSV or JSON file
  console.log(`Exporting ${records.length} records from ${exportData.collection}`);
}

// ============================================================================
// ERROR HANDLING AND LOGGING
// ============================================================================

// Job with comprehensive error handling
$jobs.register('robust-job', '0 0 2 * * *', async (cron) => {
  const jobId = `robust-job-${Date.now()}`;
  console.log(`Starting job ${jobId}:`, new Date().toISOString());
  
  try {
    // Log job start
    await $app.db().create('job_logs', {
      jobId,
      jobName: 'robust-job',
      status: 'started',
      startedAt: new Date(),
      message: 'Job started successfully'
    });
    
    // Perform the actual work
    await performRobustJobWork();
    
    // Log successful completion
    await $app.db().create('job_logs', {
      jobId,
      jobName: 'robust-job',
      status: 'completed',
      completedAt: new Date(),
      message: 'Job completed successfully'
    });
    
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    
    // Log failure
    await $app.db().create('job_logs', {
      jobId,
      jobName: 'robust-job',
      status: 'failed',
      failedAt: new Date(),
      error: error.message,
      stack: error.stack
    });
    
    // Re-throw to ensure job is marked as failed
    throw error;
  }
});

async function performRobustJobWork() {
  // Simulate some work that might fail
  const random = Math.random();
  if (random < 0.1) { // 10% chance of failure
    throw new Error('Simulated random failure');
  }
  
  console.log('Performing robust job work...');
  // Actual work here
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Helper function to create a one-time delayed job
async function scheduleDelayedJob(delayMs, jobFunction, jobData = {}) {
  const scheduledAt = new Date(Date.now() + delayMs);
  
  await $app.db().create('delayed_jobs', {
    scheduledAt,
    function: jobFunction.name,
    data: jobData,
    status: 'pending',
    created: new Date()
  });
  
  console.log(`Scheduled delayed job for ${scheduledAt.toISOString()}`);
}

// Helper function to cancel a job
async function cancelJob(jobId) {
  await $app.db().update('delayed_jobs', jobId, {
    status: 'cancelled',
    cancelledAt: new Date()
  });
  
  console.log(`Cancelled job ${jobId}`);
}

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    scheduleDelayedJob,
    cancelJob,
    processEmailTask,
    processNotificationTask,
    processDataExportTask
  };
}
