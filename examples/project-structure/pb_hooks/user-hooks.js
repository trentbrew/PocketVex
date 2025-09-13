/**
 * User Event Hooks
 * Handles user-related events and business logic
 */

// New user registration
$app.onRecordCreate('users', async (e) => {
  console.log('👤 New user created:', e.record.id);

  try {
    // Send welcome email
    await $app.newMailClient().send({
      from: 'noreply@myapp.com',
      to: e.record.email,
      subject: 'Welcome to MyApp!',
      html: `
        <h1>Welcome ${e.record.name}!</h1>
        <p>Thank you for joining MyApp. We're excited to have you!</p>
        <p>Get started by creating your first post.</p>
      `,
    });

    console.log('✅ Welcome email sent to:', e.record.email);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
});

// User profile update
$app.onRecordUpdate('users', async (e) => {
  console.log('👤 User updated:', e.record.id);

  // Update last modified timestamp
  e.record.lastModifiedAt = new Date().toISOString();

  // Log profile changes for analytics
  try {
    await $app.db().create('user_activity', {
      userId: e.record.id,
      action: 'profile_updated',
      timestamp: new Date().toISOString(),
      details: {
        fieldsChanged: Object.keys(e.record),
        previousData: e.oldRecord,
      },
    });
  } catch (error) {
    console.error('❌ Failed to log user activity:', error);
  }
});

// User login tracking
$app.onRecordUpdate('users', async (e) => {
  // Check if this is a login (lastLoginAt was updated)
  if (
    e.record.lastLoginAt &&
    e.record.lastLoginAt !== e.oldRecord?.lastLoginAt
  ) {
    console.log('🔐 User logged in:', e.record.id);

    try {
      // Update login statistics
      await $app.db().create('login_stats', {
        userId: e.record.id,
        loginAt: e.record.lastLoginAt,
        ipAddress: e.record.lastLoginIp || 'unknown',
      });
    } catch (error) {
      console.error('❌ Failed to log login stats:', error);
    }
  }
});

console.log('✅ User hooks registered successfully');
