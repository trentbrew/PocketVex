/**
 * PocketBase Scheduled Jobs (CRON) Example
 * This file demonstrates scheduled jobs and background tasks
 */

// Daily cleanup job - runs every day at 2 AM
$jobs.register({
  name: 'daily_cleanup',
  cron: '0 2 * * *', // Every day at 2:00 AM
  handler: async (e) => {
    console.log('🧹 Starting daily cleanup job...');

    try {
      // Clean up old sessions
      const oldSessions = await $app
        .db()
        .newQuery(
          `
        DELETE FROM _sessions
        WHERE created < datetime('now', '-30 days')
      `,
        )
        .execute();

      console.log(`🗑️ Cleaned up ${oldSessions.changes} old sessions`);

      // Clean up temporary files
      const tempFiles = await $filesystem.listFiles('/tmp');
      for (const file of tempFiles) {
        if (file.name.endsWith('.tmp')) {
          await $filesystem.deleteFile(`/tmp/${file.name}`);
        }
      }

      console.log('✅ Daily cleanup completed');
    } catch (error) {
      console.error('❌ Daily cleanup failed:', error);
    }

    e.next();
  },
});

// Weekly analytics job - runs every Monday at 9 AM
$jobs.register({
  name: 'weekly_analytics',
  cron: '0 9 * * 1', // Every Monday at 9:00 AM
  handler: async (e) => {
    console.log('📊 Generating weekly analytics...');

    try {
      // Get user registration stats
      const newUsers = await $app
        .db()
        .newQuery(
          `
        SELECT COUNT(*) as count
        FROM users
        WHERE created > datetime('now', '-7 days')
      `,
        )
        .one();

      // Get post creation stats
      const newPosts = await $app
        .db()
        .newQuery(
          `
        SELECT COUNT(*) as count
        FROM posts
        WHERE created > datetime('now', '-7 days')
      `,
        )
        .one();

      // Send analytics email to admin
      const mailer = $app.newMailClient();
      const message = {
        from: 'analytics@example.com',
        to: ['admin@example.com'],
        subject: 'Weekly Analytics Report',
        html: `
          <h2>Weekly Analytics Report</h2>
          <p><strong>New Users:</strong> ${newUsers.count}</p>
          <p><strong>New Posts:</strong> ${newPosts.count}</p>
          <p>Generated on: ${new Date().toISOString()}</p>
        `,
      };

      await mailer.send(message);
      console.log('📧 Analytics report sent');
    } catch (error) {
      console.error('❌ Analytics job failed:', error);
    }

    e.next();
  },
});

// Health check job - runs every 5 minutes
$jobs.register({
  name: 'health_check',
  cron: '*/5 * * * *', // Every 5 minutes
  handler: async (e) => {
    console.log('🏥 Running health check...');

    try {
      // Check database connectivity
      await $app.db().newQuery('SELECT 1').one();

      // Check disk space
      const stats = await $filesystem.listFiles('/');
      const totalFiles = stats.length;

      // Log health status
      $log.info(`Health check passed - ${totalFiles} files in root directory`);

      // Send alert if something is wrong (example: too many files)
      if (totalFiles > 10000) {
        const mailer = $app.newMailClient();
        await mailer.send({
          from: 'alerts@example.com',
          to: ['admin@example.com'],
          subject: '⚠️ High File Count Alert',
          text: `Warning: ${totalFiles} files detected in root directory`,
        });
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);

      // Send critical alert
      const mailer = $app.newMailClient();
      await mailer.send({
        from: 'alerts@example.com',
        to: ['admin@example.com'],
        subject: '🚨 Critical: Health Check Failed',
        text: `Health check failed: ${error.message}`,
      });
    }

    e.next();
  },
});

// Data synchronization job - runs every hour
$jobs.register({
  name: 'data_sync',
  cron: '0 * * * *', // Every hour
  handler: async (e) => {
    console.log('🔄 Starting data synchronization...');

    try {
      // Sync with external API
      const response = await $http.send({
        url: 'https://api.external-service.com/sync',
        method: 'GET',
        headers: {
          Authorization: 'Bearer your-api-key',
        },
      });

      if (response.status === 200) {
        const data = response.data;

        // Process and store the data
        for (const item of data.items) {
          await $app
            .db()
            .newQuery(
              `
            INSERT OR REPLACE INTO external_data (id, name, value, updated)
            VALUES (?, ?, ?, datetime('now'))
          `,
            )
            .bind(item.id, item.name, item.value)
            .execute();
        }

        console.log(`✅ Synced ${data.items.length} items`);
      }
    } catch (error) {
      console.error('❌ Data sync failed:', error);
    }

    e.next();
  },
});

// Cache warming job - runs every 15 minutes
$jobs.register({
  name: 'cache_warming',
  cron: '*/15 * * * *', // Every 15 minutes
  handler: async (e) => {
    console.log('🔥 Warming cache...');

    try {
      // Pre-compute popular queries
      const popularPosts = await $app
        .db()
        .newQuery(
          `
        SELECT * FROM posts
        WHERE published = true
        ORDER BY created DESC
        LIMIT 10
      `,
        )
        .all();

      // Store in cache (example using filesystem)
      const cacheData = {
        timestamp: new Date().toISOString(),
        posts: popularPosts,
      };

      await $filesystem.writeFile(
        '/cache/popular-posts.json',
        new TextEncoder().encode(JSON.stringify(cacheData)),
      );

      console.log('✅ Cache warmed successfully');
    } catch (error) {
      console.error('❌ Cache warming failed:', error);
    }

    e.next();
  },
});
