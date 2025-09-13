# PocketVex Project Structure Example

This example shows the recommended file structure for a project using PocketVex as an npm package.

## 📁 Project Structure

```
my-pocketbase-app/
├── package.json                 # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── .env                        # Environment variables (optional)
├── .gitignore                  # Git ignore rules
│
├── schema/                     # 📋 Schema Definitions
│   ├── users.schema.ts         # User collection schema
│   ├── posts.schema.ts         # Posts collection schema
│   ├── comments.schema.ts      # Comments collection schema
│   └── index.ts                # Export all schemas
│
├── pb_jobs/                    # ⏰ CRON Jobs
│   ├── cleanup.js              # Cleanup expired sessions
│   ├── analytics.js            # Daily analytics processing
│   ├── notifications.js        # Send scheduled notifications
│   └── backup.js               # Database backup job
│
├── pb_hooks/                   # 🪝 Event Hooks
│   ├── user-hooks.js           # User-related event handlers
│   ├── post-hooks.js           # Post creation/update hooks
│   ├── auth-hooks.js           # Authentication hooks
│   └── validation-hooks.js     # Custom validation logic
│
├── pb_commands/                # 💻 Console Commands
│   ├── migrate.js              # Custom migration commands
│   ├── seed.js                 # Database seeding
│   ├── maintenance.js          # Maintenance tasks
│   └── reports.js              # Generate reports
│
├── pb_queries/                 # 🔍 Custom Queries
│   ├── analytics.js            # Analytics queries
│   ├── search.js               # Search functionality
│   ├── reports.js              # Report generation
│   └── utilities.js            # Helper functions
│
├── pb_migrations/              # 📦 Generated Migrations
│   ├── 20240115_001_add_user_indexes.js
│   ├── 20240115_002_update_post_schema.js
│   └── 20240115_003_add_comment_relations.js
│
├── generated/                  # 🔧 Auto-generated Files
│   ├── types.ts                # TypeScript types
│   ├── api.ts                  # API client
│   └── schema.json             # Current schema snapshot
│
├── src/                        # 🏗️ Application Code
│   ├── components/             # React/Vue components
│   ├── pages/                  # Application pages
│   ├── utils/                  # Utility functions
│   ├── hooks/                  # Custom hooks
│   └── types/                  # Application types
│
├── public/                     # 🌐 Static Assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
└── docs/                       # 📚 Documentation
    ├── api.md                  # API documentation
    ├── deployment.md           # Deployment guide
    └── development.md          # Development setup
```

## 🚀 Getting Started

### 1. Install PocketVex

```bash
npm install pocketvex
# or
yarn add pocketvex
# or
pnpm add pocketvex
```

### 2. Initialize Project Structure

```bash
# Create directories
mkdir -p schema pb_jobs pb_hooks pb_commands pb_queries pb_migrations generated

# Initialize PocketVex
npx pocketvex init
```

### 3. Configure package.json

```json
{
  "name": "my-pocketbase-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "pocketvex dev",
    "dev:once": "pocketvex dev --once",
    "schema:diff": "pocketvex schema diff",
    "schema:apply": "pocketvex schema apply",
    "migrate:up": "pocketvex migrate up",
    "migrate:down": "pocketvex migrate down",
    "types:generate": "pocketvex types generate",
    "setup": "pocketvex setup"
  },
  "dependencies": {
    "pocketvex": "^1.0.0",
    "pocketbase": "^0.21.1"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

## 📋 Schema Files

### schema/users.schema.ts

```typescript
import type { SchemaDefinition } from 'pocketvex/types';

export const usersSchema: SchemaDefinition = {
  collections: [
    {
      name: 'users',
      type: 'auth' as const,
      schema: [
        { name: 'name', type: 'text' as const, required: true },
        { name: 'avatar', type: 'file' as const, required: false },
        { name: 'bio', type: 'editor' as const, required: false },
        {
          name: 'isVerified',
          type: 'bool' as const,
          required: false,
          defaultValue: false,
        },
        { name: 'lastLoginAt', type: 'date' as const, required: false },
      ],
      indexes: [
        { columns: ['name'], unique: true },
        { columns: ['isVerified'] },
        { columns: ['lastLoginAt'] },
      ],
    },
  ],
};
```

### schema/posts.schema.ts

```typescript
import type { SchemaDefinition } from 'pocketvex/types';

export const postsSchema: SchemaDefinition = {
  collections: [
    {
      name: 'posts',
      type: 'base' as const,
      schema: [
        { name: 'title', type: 'text' as const, required: true },
        { name: 'content', type: 'editor' as const, required: true },
        {
          name: 'author',
          type: 'relation' as const,
          required: true,
          options: { collectionId: 'users' },
        },
        { name: 'tags', type: 'json' as const, required: false },
        {
          name: 'isPublished',
          type: 'bool' as const,
          required: false,
          defaultValue: false,
        },
        { name: 'publishedAt', type: 'date' as const, required: false },
      ],
      indexes: [
        { columns: ['title'], unique: true },
        { columns: ['author'] },
        { columns: ['isPublished'] },
        { columns: ['publishedAt'] },
      ],
    },
  ],
};
```

### schema/index.ts

```typescript
import { usersSchema } from './users.schema.js';
import { postsSchema } from './posts.schema.js';
import type { SchemaDefinition } from 'pocketvex/types';

export const schema: SchemaDefinition = {
  collections: [...usersSchema.collections, ...postsSchema.collections],
};
```

## ⏰ CRON Jobs

### pb_jobs/cleanup.js

```javascript
// Clean up expired sessions and old data
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
  } catch (error) {
    console.error('❌ Cleanup job failed:', error);
  }
});
```

### pb_jobs/analytics.js

```javascript
// Daily analytics processing
$jobs.register('analytics', '0 0 * * * *', async (cron) => {
  console.log('📊 Processing daily analytics...');

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Process user registrations
    const newUsers = await $app.db().find('users', {
      filter: 'created >= :date',
      params: { date: yesterday.toISOString().split('T')[0] },
    });

    // Store analytics data
    await $app.db().create('analytics', {
      date: yesterday.toISOString().split('T')[0],
      newUsers: newUsers.length,
      type: 'daily_summary',
    });

    console.log(`✅ Processed analytics for ${newUsers.length} new users`);
  } catch (error) {
    console.error('❌ Analytics job failed:', error);
  }
});
```

## 🪝 Event Hooks

### pb_hooks/user-hooks.js

```javascript
// User-related event handlers
$app.onRecordCreate('users', async (e) => {
  console.log('👤 New user created:', e.record.id);

  // Send welcome email
  try {
    await $app.newMailClient().send({
      from: 'noreply@myapp.com',
      to: e.record.email,
      subject: 'Welcome to MyApp!',
      html: `
        <h1>Welcome ${e.record.name}!</h1>
        <p>Thank you for joining MyApp. We're excited to have you!</p>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
});

$app.onRecordUpdate('users', async (e) => {
  console.log('👤 User updated:', e.record.id);

  // Update last modified timestamp
  e.record.lastModifiedAt = new Date().toISOString();
});
```

### pb_hooks/post-hooks.js

```javascript
// Post creation and update hooks
$app.onRecordCreate('posts', async (e) => {
  console.log('📝 New post created:', e.record.title);

  // Auto-generate slug if not provided
  if (!e.record.slug) {
    e.record.slug = e.record.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Set published date if publishing
  if (e.record.isPublished && !e.record.publishedAt) {
    e.record.publishedAt = new Date().toISOString();
  }
});

$app.onRecordUpdate('posts', async (e) => {
  console.log('📝 Post updated:', e.record.title);

  // Update published date if status changed to published
  if (e.record.isPublished && !e.record.publishedAt) {
    e.record.publishedAt = new Date().toISOString();
  }
});
```

## 💻 Console Commands

### pb_commands/seed.js

```javascript
// Database seeding command
$app.command('seed', async (cmd) => {
  console.log('🌱 Seeding database...');

  try {
    // Create sample users
    const users = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123' },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
      },
    ];

    for (const userData of users) {
      await $app.db().create('users', userData);
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
});
```

## 🔍 Custom Queries

### pb_queries/analytics.js

```javascript
// Analytics query functions
function getDailyStats(date) {
  return $app.db().find('analytics', {
    filter: 'date = :date',
    params: { date },
  });
}

function getUserGrowth(startDate, endDate) {
  return $app.db().find('users', {
    filter: 'created >= :start AND created <= :end',
    params: { start: startDate, end: endDate },
  });
}

// Export functions for use in other files
module.exports = {
  getDailyStats,
  getUserGrowth,
};
```

## 🚀 Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Edit Schema Files

```typescript
// schema/users.schema.ts
export const usersSchema: SchemaDefinition = {
  collections: [
    {
      name: 'users',
      type: 'auth' as const,
      schema: [
        { name: 'name', type: 'text' as const, required: true },
        { name: 'age', type: 'number' as const, required: false }, // New field
      ],
    },
  ],
};
```

### 3. Watch Automatic Changes

```
🔄 Schema change detected: users.schema.ts
✅ Safe change applied: Added field 'age' to collection 'users'
📝 TypeScript types updated
```

### 4. Handle Unsafe Changes

```
⚠️  Unsafe change detected: Removing field 'oldField'
📦 Migration generated: pb_migrations/20240115_001_remove_old_field.js
```

### 5. Apply Migrations

```bash
npm run migrate:up
```

## 📦 Generated Files

### generated/types.ts

```typescript
// Auto-generated TypeScript types
export interface User extends PocketBaseRecord {
  name: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  lastLoginAt?: string;
}

export interface Post extends PocketBaseRecord {
  title: string;
  content: string;
  author: string;
  tags?: any;
  isPublished: boolean;
  publishedAt?: string;
}
```

### generated/api.ts

```typescript
// Auto-generated API client
import PocketBase from 'pocketbase';
import type { User, Post } from './types.js';

export class PocketVexAPI extends PocketBase {
  // User operations
  async getUsers(): Promise<User[]> {
    return this.collection('users').getFullList();
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.collection('users').create(data);
  }

  // Post operations
  async getPosts(): Promise<Post[]> {
    return this.collection('posts').getFullList();
  }

  async createPost(data: Partial<Post>): Promise<Post> {
    return this.collection('posts').create(data);
  }
}
```

## 🔧 Configuration

### .env

```bash
# PocketBase Configuration
PB_URL=http://127.0.0.1:8090
PB_ADMIN_EMAIL=admin@example.com
PB_ADMIN_PASSWORD=admin123

# Development
NODE_ENV=development
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*", "schema/**/*", "generated/**/*"],
  "exclude": ["node_modules", "dist", "pb_*"]
}
```

## 📚 Best Practices

### 1. Schema Organization

- Keep related collections in the same schema file
- Use descriptive names for collections and fields
- Add proper indexes for performance
- Use TypeScript for type safety

### 2. JavaScript VM Files

- Organize by functionality (jobs, hooks, commands, queries)
- Use descriptive file names
- Add error handling to all functions
- Include logging for debugging

### 3. Development Workflow

- Use the dev server for real-time development
- Test schema changes in development first
- Use migrations for production deployments
- Keep generated files in version control

### 4. Deployment

- Copy JavaScript VM files to PocketBase instance
- Run migrations in production
- Monitor logs for errors
- Backup database before major changes

This structure provides a clean, organized way to develop PocketBase applications with PocketVex! 🚀
