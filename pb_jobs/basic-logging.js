/**
 * Basic CRON Job Example - Log every 60 seconds
 * Simple example to demonstrate basic CRON job functionality
 */

// Register a CRON job that runs every 60 seconds
$jobs.register('basic-logging', '0 */60 * * * *', async (cron) => {
  const timestamp = new Date().toISOString();
  console.log(`🕐 Basic logging job executed at: ${timestamp}`);

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
      created: new Date(),
    });
    console.log('✅ Log entry saved to database');
  } catch (error) {
    console.log(
      '⚠️  Could not save to database (table might not exist):',
      error.message,
    );
  }

  console.log('✅ Basic logging job completed\n');
});

console.log('✅ Basic logging CRON job registered (runs every 60 seconds)');
