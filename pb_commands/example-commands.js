/**
 * PocketBase Console Commands Example
 * This file demonstrates custom console commands
 */

// User management commands
$commands.register({
  name: "user:create",
  description: "Create a new user account",
  handler: async (e) => {
    console.log("👤 Creating new user...");
    
    try {
      // Get user input (in a real scenario, you'd parse command arguments)
      const email = "newuser@example.com"; // This would come from command args
      const name = "New User";
      const password = "password123";
      
      // Create user record
      const user = $app.db().newRecord("users");
      user.set("email", email);
      user.set("name", name);
      user.set("password", password);
      user.set("emailVisibility", false);
      
      await $app.save(user);
      
      console.log(`✅ User created successfully: ${email}`);
    } catch (error) {
      console.error("❌ Failed to create user:", error.message);
    }
    
    e.next();
  }
});

$commands.register({
  name: "user:list",
  description: "List all users",
  handler: async (e) => {
    console.log("👥 Listing all users...");
    
    try {
      const users = await $app.db().newQuery(`
        SELECT id, email, name, created 
        FROM users 
        ORDER BY created DESC
      `).all();
      
      console.log(`Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - ${user.created}`);
      });
    } catch (error) {
      console.error("❌ Failed to list users:", error.message);
    }
    
    e.next();
  }
});

// Database maintenance commands
$commands.register({
  name: "db:backup",
  description: "Create a database backup",
  handler: async (e) => {
    console.log("💾 Creating database backup...");
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${timestamp}`;
      
      await $app.createBackup(backupName);
      
      console.log(`✅ Backup created: ${backupName}`);
    } catch (error) {
      console.error("❌ Backup failed:", error.message);
    }
    
    e.next();
  }
});

$commands.register({
  name: "db:stats",
  description: "Show database statistics",
  handler: async (e) => {
    console.log("📊 Database Statistics:");
    
    try {
      // Get collection counts
      const collections = await $app.db().findCollectionsByFilter("");
      
      for (const collection of collections) {
        const count = await $app.db().newQuery(`
          SELECT COUNT(*) as count FROM ${collection.name}
        `).one();
        
        console.log(`  ${collection.name}: ${count.count} records`);
      }
      
      // Get database size (approximate)
      const dbSize = await $app.db().newQuery(`
        SELECT page_count * page_size as size 
        FROM pragma_page_count(), pragma_page_size()
      `).one();
      
      const sizeInMB = (dbSize.size / 1024 / 1024).toFixed(2);
      console.log(`  Database size: ${sizeInMB} MB`);
      
    } catch (error) {
      console.error("❌ Failed to get stats:", error.message);
    }
    
    e.next();
  }
});

// Content management commands
$commands.register({
  name: "content:seed",
  description: "Seed the database with sample content",
  handler: async (e) => {
    console.log("🌱 Seeding database with sample content...");
    
    try {
      // Create sample posts
      const samplePosts = [
        {
          title: "Welcome to PocketBase",
          content: "This is your first post created via console command!",
          published: true
        },
        {
          title: "Getting Started Guide",
          content: "Learn how to use PocketBase effectively in your projects.",
          published: true
        },
        {
          title: "Advanced Features",
          content: "Explore the advanced features of PocketBase.",
          published: false
        }
      ];
      
      for (const postData of samplePosts) {
        const post = $app.db().newRecord("posts");
        post.set("title", postData.title);
        post.set("content", postData.content);
        post.set("published", postData.published);
        post.set("author", "admin"); // Assuming admin user exists
        
        await $app.save(post);
        console.log(`  ✅ Created post: ${postData.title}`);
      }
      
      console.log("🌱 Seeding completed successfully");
    } catch (error) {
      console.error("❌ Seeding failed:", error.message);
    }
    
    e.next();
  }
});

$commands.register({
  name: "content:cleanup",
  description: "Clean up old or unpublished content",
  handler: async (e) => {
    console.log("🧹 Cleaning up content...");
    
    try {
      // Delete old unpublished posts (older than 30 days)
      const deletedPosts = await $app.db().newQuery(`
        DELETE FROM posts 
        WHERE published = false 
        AND created < datetime('now', '-30 days')
      `).execute();
      
      console.log(`🗑️ Deleted ${deletedPosts.changes} old unpublished posts`);
      
      // Delete orphaned comments
      const deletedComments = await $app.db().newQuery(`
        DELETE FROM comments 
        WHERE post NOT IN (SELECT id FROM posts)
      `).execute();
      
      console.log(`🗑️ Deleted ${deletedComments.changes} orphaned comments`);
      
      console.log("✅ Content cleanup completed");
    } catch (error) {
      console.error("❌ Cleanup failed:", error.message);
    }
    
    e.next();
  }
});

// System maintenance commands
$commands.register({
  name: "system:optimize",
  description: "Optimize database performance",
  handler: async (e) => {
    console.log("⚡ Optimizing database...");
    
    try {
      // Analyze database
      await $app.db().newQuery("ANALYZE").execute();
      console.log("  ✅ Database analyzed");
      
      // Vacuum database
      await $app.db().newQuery("VACUUM").execute();
      console.log("  ✅ Database vacuumed");
      
      // Reindex
      await $app.db().newQuery("REINDEX").execute();
      console.log("  ✅ Database reindexed");
      
      console.log("⚡ Database optimization completed");
    } catch (error) {
      console.error("❌ Optimization failed:", error.message);
    }
    
    e.next();
  }
});

$commands.register({
  name: "system:logs",
  description: "Show recent system logs",
  handler: async (e) => {
    console.log("📋 Recent system logs:");
    
    try {
      // Read log file (assuming logs are stored in filesystem)
      const logFiles = await $filesystem.listFiles("/logs");
      
      if (logFiles.length > 0) {
        const latestLog = logFiles
          .filter(f => f.name.endsWith('.log'))
          .sort((a, b) => new Date(b.modTime) - new Date(a.modTime))[0];
        
        if (latestLog) {
          const logContent = await $filesystem.readFile(`/logs/${latestLog.name}`);
          const lines = new TextDecoder().decode(logContent).split('\n');
          const recentLines = lines.slice(-20); // Last 20 lines
          
          recentLines.forEach(line => {
            if (line.trim()) {
              console.log(`  ${line}`);
            }
          });
        }
      } else {
        console.log("  No log files found");
      }
    } catch (error) {
      console.error("❌ Failed to read logs:", error.message);
    }
    
    e.next();
  }
});
