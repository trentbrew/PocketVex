/**
 * Cleanup Job - Runs daily at 2 AM
 * Cleans up expired sessions and old data
 */

$jobs.register('cleanup', '0 2 * * * *', async (cron) => {
  console.log('🧹 Starting cleanup job...');

  try {
    // Clean expired sessions
    const expiredSessions = await $app.db().find('sessions', {
      filter: 'expires < :now',
      params: { now: new Date().toISOString() },
    });

    for (const session of expiredSessions) {
      await $app.db().delete('sessions', session.id);
    }

    console.log(`✅ Cleaned up ${expiredSessions.length} expired sessions`);

    // Clean old analytics data (older than 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const oldAnalytics = await $app.db().find('analytics', {
      filter: 'created < :date',
      params: { date: oneYearAgo.toISOString() },
    });

    for (const analytics of oldAnalytics) {
      await $app.db().delete('analytics', analytics.id);
    }

    console.log(`✅ Cleaned up ${oldAnalytics.length} old analytics records`);
    console.log('✅ Cleanup job completed successfully');
  } catch (error) {
    console.error('❌ Cleanup job failed:', error);
  }
});

console.log('✅ Cleanup job registered (runs daily at 2 AM)');
