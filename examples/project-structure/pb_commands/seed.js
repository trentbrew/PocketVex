/**
 * Database Seeding Command
 * Populates the database with sample data for development
 */

$app.command('seed', async (cmd) => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Software developer and tech enthusiast',
        isVerified: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        bio: 'Designer and creative professional',
        isVerified: true
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password123',
        bio: 'Product manager with a passion for innovation',
        isVerified: false
      }
    ];
    
    const createdUsers = [];
    for (const userData of sampleUsers) {
      try {
        const user = await $app.db().create('users', userData);
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.name}`);
      } catch (error) {
        console.log(`⚠️  User ${userData.name} might already exist`);
      }
    }
    
    // Create sample posts
    if (createdUsers.length > 0) {
      const samplePosts = [
        {
          title: 'Welcome to MyApp!',
          content: 'This is our first post. We\'re excited to share our journey with you.',
          author: createdUsers[0].id,
          tags: ['welcome', 'announcement'],
          isPublished: true,
          publishedAt: new Date().toISOString()
        },
        {
          title: 'Getting Started Guide',
          content: 'Here\'s how to get started with MyApp and make the most of its features.',
          author: createdUsers[1].id,
          tags: ['guide', 'tutorial'],
          isPublished: true,
          publishedAt: new Date().toISOString()
        },
        {
          title: 'Draft Post',
          content: 'This is a draft post that hasn\'t been published yet.',
          author: createdUsers[0].id,
          tags: ['draft'],
          isPublished: false
        }
      ];
      
      for (const postData of samplePosts) {
        try {
          const post = await $app.db().create('posts', postData);
          console.log(`✅ Created post: ${post.title}`);
        } catch (error) {
          console.error(`❌ Failed to create post: ${postData.title}`, error);
        }
      }
    }
    
    console.log('✅ Database seeding completed successfully');
    console.log(`📊 Created ${createdUsers.length} users and sample posts`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
});

// Additional seeding command for specific data
$app.command('seed:analytics', async (cmd) => {
  console.log('📊 Seeding analytics data...');
  
  try {
    // Create sample analytics data for the last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await $app.db().create('analytics', {
        date: date.toISOString().split('T')[0],
        newUsers: Math.floor(Math.random() * 10),
        newPosts: Math.floor(Math.random() * 5),
        pageViews: Math.floor(Math.random() * 1000),
        type: 'daily_summary'
      });
    }
    
    console.log('✅ Analytics data seeded successfully');
  } catch (error) {
    console.error('❌ Analytics seeding failed:', error);
  }
});

console.log('✅ Seeding commands registered successfully');
