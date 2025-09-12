/**
 * PocketBase Raw Database Queries Example
 * This file demonstrates advanced database operations
 */

// User analytics queries
const getUserStats = async () => {
  console.log("📊 Getting user statistics...");
  
  try {
    // Total users
    const totalUsers = await $app.db().newQuery(`
      SELECT COUNT(*) as count FROM users
    `).one();
    
    // New users this month
    const newUsersThisMonth = await $app.db().newQuery(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created > datetime('now', 'start of month')
    `).one();
    
    // Active users (users with posts)
    const activeUsers = await $app.db().newQuery(`
      SELECT COUNT(DISTINCT author) as count 
      FROM posts 
      WHERE published = true
    `).one();
    
    console.log(`Total users: ${totalUsers.count}`);
    console.log(`New users this month: ${newUsersThisMonth.count}`);
    console.log(`Active users: ${activeUsers.count}`);
    
    return {
      total: totalUsers.count,
      newThisMonth: newUsersThisMonth.count,
      active: activeUsers.count
    };
  } catch (error) {
    console.error("❌ Failed to get user stats:", error);
    return null;
  }
};

// Content analytics queries
const getContentStats = async () => {
  console.log("📝 Getting content statistics...");
  
  try {
    // Posts by status
    const postsByStatus = await $app.db().newQuery(`
      SELECT 
        published,
        COUNT(*) as count
      FROM posts 
      GROUP BY published
    `).all();
    
    // Posts by month
    const postsByMonth = await $app.db().newQuery(`
      SELECT 
        strftime('%Y-%m', created) as month,
        COUNT(*) as count
      FROM posts 
      WHERE published = true
      GROUP BY strftime('%Y-%m', created)
      ORDER BY month DESC
      LIMIT 12
    `).all();
    
    // Most active authors
    const topAuthors = await $app.db().newQuery(`
      SELECT 
        author,
        COUNT(*) as post_count
      FROM posts 
      WHERE published = true
      GROUP BY author
      ORDER BY post_count DESC
      LIMIT 10
    `).all();
    
    console.log("Posts by status:");
    postsByStatus.forEach(stat => {
      console.log(`  ${stat.published ? 'Published' : 'Draft'}: ${stat.count}`);
    });
    
    console.log("Posts by month (last 12 months):");
    postsByMonth.forEach(stat => {
      console.log(`  ${stat.month}: ${stat.count} posts`);
    });
    
    console.log("Top authors:");
    topAuthors.forEach(author => {
      console.log(`  ${author.author}: ${author.post_count} posts`);
    });
    
    return {
      byStatus: postsByStatus,
      byMonth: postsByMonth,
      topAuthors: topAuthors
    };
  } catch (error) {
    console.error("❌ Failed to get content stats:", error);
    return null;
  }
};

// Advanced search queries
const searchContent = async (searchTerm) => {
  console.log(`🔍 Searching for: "${searchTerm}"`);
  
  try {
    // Full-text search in posts
    const posts = await $app.db().newQuery(`
      SELECT 
        p.*,
        u.name as author_name
      FROM posts p
      LEFT JOIN users u ON p.author = u.id
      WHERE p.published = true
      AND (
        p.title LIKE ? OR 
        p.content LIKE ? OR 
        u.name LIKE ?
      )
      ORDER BY p.created DESC
    `).bind(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`).all();
    
    // Search in comments
    const comments = await $app.db().newQuery(`
      SELECT 
        c.*,
        p.title as post_title,
        u.name as author_name
      FROM comments c
      LEFT JOIN posts p ON c.post = p.id
      LEFT JOIN users u ON c.author = u.id
      WHERE c.content LIKE ?
      ORDER BY c.created DESC
    `).bind(`%${searchTerm}%`).all();
    
    console.log(`Found ${posts.length} posts and ${comments.length} comments`);
    
    return {
      posts: posts,
      comments: comments
    };
  } catch (error) {
    console.error("❌ Search failed:", error);
    return null;
  }
};

// Data migration queries
const migrateUserData = async () => {
  console.log("🔄 Migrating user data...");
  
  try {
    // Add default values for new fields
    await $app.db().newQuery(`
      UPDATE users 
      SET bio = 'No bio provided' 
      WHERE bio IS NULL OR bio = ''
    `).execute();
    
    // Update user roles
    await $app.db().newQuery(`
      UPDATE users 
      SET role = 'user' 
      WHERE role IS NULL OR role = ''
    `).execute();
    
    // Set admin role for specific users
    await $app.db().newQuery(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email IN ('admin@example.com', 'trent@example.com')
    `).execute();
    
    console.log("✅ User data migration completed");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
};

// Performance optimization queries
const optimizeDatabase = async () => {
  console.log("⚡ Optimizing database performance...");
  
  try {
    // Create indexes for better performance
    await $app.db().newQuery(`
      CREATE INDEX IF NOT EXISTS idx_posts_author_created 
      ON posts(author, created DESC)
    `).execute();
    
    await $app.db().newQuery(`
      CREATE INDEX IF NOT EXISTS idx_posts_published_created 
      ON posts(published, created DESC)
    `).execute();
    
    await $app.db().newQuery(`
      CREATE INDEX IF NOT EXISTS idx_comments_post_created 
      ON comments(post, created DESC)
    `).execute();
    
    await $app.db().newQuery(`
      CREATE INDEX IF NOT EXISTS idx_users_email 
      ON users(email)
    `).execute();
    
    console.log("✅ Database indexes created");
    
    // Update table statistics
    await $app.db().newQuery("ANALYZE").execute();
    console.log("✅ Database statistics updated");
    
  } catch (error) {
    console.error("❌ Optimization failed:", error);
  }
};

// Data export queries
const exportUserData = async () => {
  console.log("📤 Exporting user data...");
  
  try {
    const users = await $app.db().newQuery(`
      SELECT 
        id,
        email,
        name,
        role,
        created,
        updated
      FROM users
      ORDER BY created DESC
    `).all();
    
    // Export to JSON file
    const exportData = {
      timestamp: new Date().toISOString(),
      count: users.length,
      users: users
    };
    
    await $filesystem.writeFile(
      "/exports/users.json",
      new TextEncoder().encode(JSON.stringify(exportData, null, 2))
    );
    
    console.log(`✅ Exported ${users.length} users to /exports/users.json`);
  } catch (error) {
    console.error("❌ Export failed:", error);
  }
};

// Data cleanup queries
const cleanupOldData = async () => {
  console.log("🧹 Cleaning up old data...");
  
  try {
    // Delete old sessions
    const deletedSessions = await $app.db().newQuery(`
      DELETE FROM _sessions 
      WHERE created < datetime('now', '-30 days')
    `).execute();
    
    // Delete old logs
    const deletedLogs = await $app.db().newQuery(`
      DELETE FROM logs 
      WHERE created < datetime('now', '-90 days')
    `).execute();
    
    // Archive old posts (move to archive table)
    const archivedPosts = await $app.db().newQuery(`
      INSERT INTO posts_archive 
      SELECT * FROM posts 
      WHERE created < datetime('now', '-1 year')
      AND published = false
    `).execute();
    
    // Delete archived posts from main table
    await $app.db().newQuery(`
      DELETE FROM posts 
      WHERE created < datetime('now', '-1 year')
      AND published = false
    `).execute();
    
    console.log(`🗑️ Cleaned up:`);
    console.log(`  - ${deletedSessions.changes} old sessions`);
    console.log(`  - ${deletedLogs.changes} old logs`);
    console.log(`  - ${archivedPosts.changes} old draft posts archived`);
    
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
};

// Export functions for use in other files
module.exports = {
  getUserStats,
  getContentStats,
  searchContent,
  migrateUserData,
  optimizeDatabase,
  exportUserData,
  cleanupOldData
};
