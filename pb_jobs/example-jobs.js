/**
 * PocketBase CRON Job Examples
 * Deploy these to your PocketBase instance's pb_jobs directory
 */

// ============================================================================
// SESSION CLEANUP - Every minute
// ============================================================================
$jobs.register('session-cleanup', '0 * * * * *', async (cron) => {
  console.log('🧹 Cleaning up expired sessions...');
  
  try {
    const expiredSessions = await $app.db().newQuery('sessions')
      .filter('expires < {:now}', { now: new Date() })
      .all();
      
    if (expiredSessions.length > 0) {
      console.log(`Found ${expiredSessions.length} expired sessions`);
      for (const session of expiredSessions) {
        await $app.db().delete('sessions', session.id);
      }
      console.log(`✅ Cleaned up ${expiredSessions.length} expired sessions`);
    } else {
      console.log('✅ No expired sessions found');
    }
  } catch (error) {
    console.error('❌ Session cleanup failed:', error);
  }
});

// ============================================================================
// ANALYTICS GENERATION - Every hour
// ============================================================================
$jobs.register('hourly-analytics', '0 0 * * * *', async (cron) => {
  console.log('📊 Generating hourly analytics...');
  
  try {
    const hourStart = new Date();
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
    
    // Count page views for this hour
    const pageViews = await $app.db().newQuery('page_views')
      .filter('created >= {:start} && created < {:end}', {
        start: hourStart,
        end: hourEnd
      })
      .count();
    
    // Count new users for this hour
    const newUsers = await $app.db().newQuery('users')
      .filter('created >= {:start} && created < {:end}', {
        start: hourStart,
        end: hourEnd
      })
      .count();
    
    // Store analytics data
    await $app.db().create('analytics', {
      type: 'hourly',
      period: hourStart.toISOString(),
      pageViews,
      newUsers,
      created: new Date()
    });
    
    console.log(`✅ Analytics generated: ${pageViews} views, ${newUsers} new users`);
  } catch (error) {
    console.error('❌ Analytics generation failed:', error);
  }
});

// ============================================================================
// EMAIL PROCESSING - Every 5 minutes
// ============================================================================
$jobs.register('email-processor', '0 */5 * * * *', async (cron) => {
  console.log('📧 Processing email queue...');
  
  try {
    const emailQueue = await $app.db().newQuery('email_queue')
      .filter('status = "pending"')
      .filter('scheduledAt <= {:now}', { now: new Date() })
      .limit(10)
      .all();
      
    if (emailQueue.length === 0) {
      console.log('✅ No emails to process');
      return;
    }
    
    console.log(`Processing ${emailQueue.length} emails...`);
    
    for (const email of emailQueue) {
      try {
        // Update status to sending
        await $app.db().update('email_queue', email.id, {
          status: 'sending',
          startedAt: new Date()
        });
        
        // Send email
        await $app.newMailClient().send({
          from: email.from || 'noreply@yourapp.com',
          to: email.to,
          subject: email.subject,
          html: email.html || email.text
        });
        
        // Mark as sent
        await $app.db().update('email_queue', email.id, {
          status: 'sent',
          sentAt: new Date()
        });
        
        console.log(`✅ Email sent to ${email.to}`);
      } catch (error) {
        console.error(`❌ Failed to send email to ${email.to}:`, error);
        
        // Mark as failed
        await $app.db().update('email_queue', email.id, {
          status: 'failed',
          error: error.message,
          failedAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error('❌ Email processing failed:', error);
  }
});

// ============================================================================
// HEALTH MONITORING - Every 15 minutes during business hours
// ============================================================================
$jobs.register('health-monitor', '0 */15 9-17 * * 1-5', async (cron) => {
  console.log('🏥 Performing health check...');
  
  try {
    const healthCheck = {
      timestamp: new Date(),
      database: 'healthy',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    // Test database connectivity
    try {
      await $app.db().newQuery('users').limit(1).all();
      healthCheck.database = 'healthy';
    } catch (error) {
      healthCheck.database = 'error';
      console.error('❌ Database health check failed:', error);
    }
    
    // Store health check result
    await $app.db().create('health_checks', healthCheck);
    
    if (healthCheck.database === 'healthy') {
      console.log('✅ Health check passed');
    } else {
      console.log('⚠️ Health check failed - database issue detected');
    }
  } catch (error) {
    console.error('❌ Health monitoring failed:', error);
  }
});

// ============================================================================
// WEEKLY REPORTS - Every Monday at 9 AM
// ============================================================================
$jobs.register('weekly-reports', '0 0 9 * * 1', async (cron) => {
  console.log('📈 Generating weekly report...');
  
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    // Gather weekly statistics
    const weeklyStats = {
      newUsers: await $app.db().newQuery('users')
        .filter('created >= {:weekStart}', { weekStart })
        .count(),
      totalPosts: await $app.db().newQuery('posts')
        .filter('created >= {:weekStart}', { weekStart })
        .count(),
      totalViews: await $app.db().newQuery('page_views')
        .filter('created >= {:weekStart}', { weekStart })
        .count(),
      totalEmails: await $app.db().newQuery('email_queue')
        .filter('created >= {:weekStart}', { weekStart })
        .count()
    };
    
    // Create weekly report
    const report = await $app.db().create('reports', {
      type: 'weekly',
      period: weekStart.toISOString(),
      data: weeklyStats,
      created: new Date()
    });
    
    console.log(`✅ Weekly report generated:`, weeklyStats);
    
    // Send email notification (if email is configured)
    try {
      await $app.newMailClient().send({
        from: 'noreply@yourapp.com',
        to: 'admin@yourapp.com',
        subject: 'Weekly Report',
        html: `
          <h2>Weekly Report</h2>
          <p><strong>New Users:</strong> ${weeklyStats.newUsers}</p>
          <p><strong>New Posts:</strong> ${weeklyStats.totalPosts}</p>
          <p><strong>Total Views:</strong> ${weeklyStats.totalViews}</p>
          <p><strong>Emails Sent:</strong> ${weeklyStats.totalEmails}</p>
          <p><em>Generated on ${new Date().toLocaleString()}</em></p>
        `
      });
      console.log('✅ Weekly report email sent');
    } catch (error) {
      console.log('⚠️ Failed to send weekly report email:', error);
    }
  } catch (error) {
    console.error('❌ Weekly report generation failed:', error);
  }
});

// ============================================================================
// TASK PROCESSOR - Every 30 seconds
// ============================================================================
$jobs.register('task-processor', '*/30 * * * * *', async (cron) => {
  console.log('⚡ Processing task queue...');
  
  try {
    const queuedTasks = await $app.db().newQuery('task_queue')
      .filter('status = "pending"')
      .filter('scheduledAt <= {:now}', { now: new Date() })
      .limit(5)
      .all();
      
    if (queuedTasks.length === 0) {
      return; // No tasks to process
    }
    
    console.log(`Processing ${queuedTasks.length} tasks...`);
    
    for (const task of queuedTasks) {
      try {
        // Update status to processing
        await $app.db().update('task_queue', task.id, {
          status: 'processing',
          startedAt: new Date()
        });
        
        // Process task based on type
        switch (task.type) {
          case 'notification':
            await processNotificationTask(task);
            break;
          case 'data_export':
            await processDataExportTask(task);
            break;
          case 'cleanup':
            await processCleanupTask(task);
            break;
          default:
            console.log(`⚠️ Unknown task type: ${task.type}`);
        }
        
        // Mark as completed
        await $app.db().update('task_queue', task.id, {
          status: 'completed',
          completedAt: new Date()
        });
        
        console.log(`✅ Task ${task.id} completed`);
      } catch (error) {
        console.error(`❌ Task ${task.id} failed:`, error);
        
        // Mark as failed
        await $app.db().update('task_queue', task.id, {
          status: 'failed',
          error: error.message,
          failedAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error('❌ Task processing failed:', error);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function processNotificationTask(task) {
  console.log(`📢 Processing notification task: ${task.id}`);
  
  const notificationData = task.data;
  
  // Send webhook notification
  if (notificationData.webhook) {
    await $app.newRequest().send({
      url: notificationData.webhook,
      method: 'POST',
      body: notificationData.payload
    });
  }
  
  // Send email notification
  if (notificationData.email) {
    await $app.newMailClient().send({
      from: 'noreply@yourapp.com',
      to: notificationData.email,
      subject: notificationData.subject || 'Notification',
      html: notificationData.message
    });
  }
}

async function processDataExportTask(task) {
  console.log(`📊 Processing data export task: ${task.id}`);
  
  const exportData = task.data;
  const records = await $app.db().newQuery(exportData.collection)
    .filter(exportData.filter || '')
    .all();
    
  console.log(`Exporting ${records.length} records from ${exportData.collection}`);
  
  // In a real app, you might generate a CSV or JSON file
  // For now, just log the count
}

async function processCleanupTask(task) {
  console.log(`🧹 Processing cleanup task: ${task.id}`);
  
  const cleanupData = task.data;
  
  // Clean up old records
  if (cleanupData.collection && cleanupData.olderThan) {
    const cutoffDate = new Date(Date.now() - cleanupData.olderThan);
    const oldRecords = await $app.db().newQuery(cleanupData.collection)
      .filter('created < {:cutoff}', { cutoff: cutoffDate })
      .all();
      
    for (const record of oldRecords) {
      await $app.db().delete(cleanupData.collection, record.id);
    }
    
    console.log(`Cleaned up ${oldRecords.length} old records from ${cleanupData.collection}`);
  }
}

console.log('✅ CRON jobs registered successfully');
