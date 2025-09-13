/**
 * Test Hook - Auto-deployed by PocketVex
 * This file demonstrates automatic deployment of JavaScript VM files
 */

// Example event hook that logs when records are created
$app.onRecordCreate('users', (e) => {
  console.log('🆕 New user created:', e.record.id);

  // You can add custom logic here
  // For example, send a welcome email, create a profile, etc.
});

$app.onRecordCreate('posts', (e) => {
  console.log('📝 New post created!!!!!!!! :', e.record.title);

  // Example: Auto-generate a slug if not provided
  if (!e.record.slug) {
    e.record.slug = e.record.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

console.log('✅ Test hooks loaded successfully');
