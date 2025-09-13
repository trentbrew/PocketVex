# PocketVex

**Schema migration system for PocketBase with real-time development workflow**

PocketVex provides a Convex-style development experience for PocketBase, allowing you to define your schema as code and automatically apply changes during development.

## 🚀 Features

- **Schema-as-Code**: Define your PocketBase schema in TypeScript
- **Real-time Migration**: Watch schema files and apply changes automatically
- **Safe vs Unsafe Operations**: Automatically categorizes changes and handles them appropriately
- **Migration Generation**: Generate migration files for production deployments
- **Development Server**: Hot-reload schema changes during development
- **Unified CLI**: Comprehensive command-line interface with organized commands
- **JavaScript VM Integration**: Full support for PocketBase JavaScript features
- **Event Hooks**: Custom business logic with TypeScript definitions
- **Scheduled Jobs**: CRON jobs for automation and background tasks
- **Console Commands**: Custom CLI commands for database management
- **Raw Database Queries**: Advanced SQL operations with type safety
- **Type Generation**: Automatic TypeScript types from schema definitions
- **Interactive Demos**: Comprehensive demo system for learning and testing
- **Convex-like Experience**: Complete development workflow similar to Convex

## 📦 Installation

### As an npm package (recommended)

```bash
# Install globally for CLI usage
npm install -g pocketvex

# Or install locally in your project
npm install pocketvex

# Or with yarn
yarn add pocketvex

# Or with pnpm
pnpm add pocketvex
```

### Development setup

```bash
# Clone and install dependencies
git clone https://github.com/trentbrew/pocketvex.git
cd pocketvex
bun install

# Or with npm
npm install
```

## ⚙️ Configuration

Set up your environment variables:

```bash
export PB_URL="http://127.0.0.1:8090"
export PB_ADMIN_EMAIL="admin@example.com"
export PB_ADMIN_PASS="admin123"
```

## 🎯 Quick Start

### 1. Setup & Configuration

PocketVex provides an interactive setup experience that guides you through host selection and credential management:

```bash
# Interactive setup (recommended for first-time users)
bun run setup

# Or run any command - it will prompt for host selection
bun run dev
```

**🏠 Host Selection:** When you run PocketVex commands, you'll be prompted to select a PocketBase host:
- 🌐 **Live PocketBase** (pocketvex.pockethost.io)
- 🏠 **Local PocketBase** (127.0.0.1:8090)  
- 💾 **Cached Hosts** (previously used hosts)
- ✏️ **Custom URL** (enter your own PocketBase URL)

**🔐 Credential Caching:** PocketVex automatically caches your credentials securely for 24 hours per host, so you won't need to enter them repeatedly. Credentials are encrypted and stored locally in `~/.pocketvex/credentials.json`.

#### Host Selection Workflow

When you run PocketVex commands, you'll see an interactive host selection menu:

```
? Select PocketBase host:
❯ 🌐 Live PocketBase (pocketvex.pockethost.io)
  🏠 Local PocketBase (127.0.0.1:8090)
  💾 https://my-pb.example.com
  ✏️  Enter custom URL
```

**Features:**
- **Cached Hosts**: Previously used hosts appear in the menu for quick access
- **Custom URLs**: Enter any PocketBase URL with validation
- **Credential Integration**: Credentials are automatically retrieved for cached hosts
- **Secure Storage**: Host URLs and credentials are encrypted and cached locally

#### Managing Cached Credentials

```bash
# View and manage cached credentials
bun run credentials

# Clear all cached credentials
bun run cli util credentials  # Then select "Clear all credentials"

# Remove credentials for a specific URL
bun run cli util credentials  # Then select "Remove specific credentials"
```

### 2. Unified CLI Commands

PocketVex features a unified CLI system with organized commands:

```bash
# Show all available commands
bun run cli help

# Schema management
bun run cli schema diff          # Show schema differences
bun run cli schema apply         # Apply schema changes

# Migration management
bun run cli migrate generate     # Generate migration files
bun run cli migrate up           # Run migrations
bun run cli migrate down         # Rollback migrations
bun run cli migrate status       # Show migration status

# Type generation
bun run cli types generate       # Generate TypeScript types

# Development
bun run cli dev start            # Start development server

# Interactive demos
bun run cli demo run             # Run unified demo system

# Utilities
bun run cli util setup           # Interactive setup for credentials
bun run cli util credentials     # Manage cached credentials
bun run cli util test-connection # Test PocketBase connection
```

### 3. Start Development Server

PocketVex includes a real-time development server similar to `npx convex dev`:

```bash
# Start dev server with file watching (default behavior)
bun run dev

# Or use the CLI directly
bun run cli dev start

# One-time schema sync (no watching)
bun run dev:once
# Or: bun run cli dev start --once
```

**🔄 Real-time Features:**

- **File Watching:** Automatically detects schema changes and JavaScript VM files
- **Safe Changes:** Applied immediately to PocketBase
- **Unsafe Changes:** Generate migration files for review
- **Type Generation:** Auto-generates TypeScript types
- **JavaScript VM Deployment:** Automatically deploys CRON jobs, hooks, and commands to PocketBase
- **Hot Reload:** No manual intervention required during development

#### Development Workflow

1. **Start the dev server:**

   ```bash
   bun run dev
   ```

2. **Edit schema files** in the `schema/` directory or **JavaScript VM files** in `pb_jobs/`, `pb_hooks/`, etc.:

   ```typescript
   // schema/my-schema.ts
   export const schema = {
     collections: [
       {
         name: 'products',
         type: 'base' as const,
         schema: [
           { name: 'name', type: 'text' as const, required: true },
           { name: 'price', type: 'number' as const, required: true },
         ],
       },
     ],
   };
   ```

3. **Watch the magic happen:**

   - ✅ Safe changes (add fields, indexes) → Applied automatically
   - ⚠️ Unsafe changes (remove fields, change types) → Migration files generated
   - 📝 TypeScript types → Auto-generated in `generated/`

4. **Review and apply migrations:**
   ```bash
   bun run cli migrate up
   ```

#### JavaScript VM Auto-Deployment

PocketVex automatically deploys JavaScript VM files to your PocketBase instance, just like Convex deploys files in the `/convex` folder:

**Supported Directories:**

- `./pb_jobs/` - CRON jobs and scheduled tasks
- `./pb_hooks/` - Event hooks and middleware
- `./pb_commands/` - Console commands
- `./pb_queries/` - Custom queries and utilities

**How it works:**

1. **File Watching**: PocketVex watches all JavaScript files in these directories
2. **Auto-Deployment**: When you save a file, it's automatically deployed to PocketBase
3. **Hot Reload**: Changes take effect immediately without restarting PocketBase
4. **Error Handling**: Failed deployments are logged with clear error messages

**Example:**

```bash
# Start the dev server
bun run dev

# Edit a CRON job file
echo '$jobs.register("test", "*/60 * * * * *", () => console.log("Hello!"));' > pb_jobs/test.js

# File is automatically deployed to PocketBase!
# ✅ Deployed: test.js → pb_jobs/
```

**Initial Deployment:**
When you start the dev server, PocketVex automatically deploys all existing JavaScript VM files:

```
🚀 Deploying existing JavaScript VM files...
  📁 Found 2 files in pb_jobs/
✅ Deployed: basic-logging.js → pb_jobs/
✅ Deployed: example-jobs.js → pb_jobs/
✅ Deployed 2 JavaScript VM files
```

### 4. Live Demo with PocketBase Instance

Try PocketVex with a live PocketBase instance:

```bash
# Set up environment variables for live instance
export PB_URL="https://pocketvex.pockethost.io/"
export PB_ADMIN_EMAIL="your-admin@email.com"
export PB_ADMIN_PASS="your-admin-password"

# Run unified demo system (interactive)
bun run demo

# Or run specific demo modes
bun run demo:basic          # Basic schema demo
bun run demo:live           # Live PocketBase demo
bun run demo:realtime       # Real-time migration demo
bun run demo:incremental    # Incremental migration demo
bun run demo:js-vm          # JavaScript VM features demo
bun run demo:test           # Connection test demo
```

**Note**: You'll need the actual admin credentials for the live PocketBase instance to run the full demo.

#### Real-time Migration Demos

PocketVex includes interactive demos that show real-time schema migrations:

- **`realtime-migration`**: Interactive demo that creates collections and applies schema changes in real-time
- **`incremental-migration`**: Step-by-step schema evolution showing how to migrate from version to version

These demos will:

- Connect to your live PocketBase instance
- Show current schema analysis
- Apply safe schema changes in real-time
- Demonstrate the difference between safe and unsafe operations
- Create example collections with various field types

#### JavaScript Features Demo

Explore PocketBase JavaScript VM integration:

```bash
# Run JavaScript features demo
bun run js-features

# Start JavaScript development server
bun run dev-js
```

This demo showcases:

- Event hooks for custom business logic
- Scheduled jobs (CRON) for automation
- Console commands for database management
- Raw database queries with type safety
- Automatic TypeScript type generation

### 3. Define Your Schema

Create schema files in `schema/` directory:

```typescript
// schema/my-app.schema.ts
import type { SchemaDefinition } from '../src/types/schema.js';

export const schema: SchemaDefinition = {
  collections: [
    {
      id: 'users_001',
      name: 'users',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true, unique: true },
        {
          name: 'role',
          type: 'select',
          options: { values: ['user', 'admin'] },
        },
      ],
      rules: {
        list: "@request.auth.id != ''",
        view: "@request.auth.id != ''",
        create: "@request.auth.id != ''",
        update: '@request.auth.id = id',
        delete: "@request.auth.role = 'admin'",
      },
    },
  ],
};
```

### 3. Watch Changes Apply Automatically

When you save schema files, PocketVex will:

- ✅ Apply safe changes immediately (new collections, fields, rules)
- ⚠️ Generate migration files for unsafe changes (type changes, deletions)
- 📊 Show you exactly what changed

## 🛠️ Commands

### Development

```bash
# Start development server with file watching
bun run dev --watch

# One-time schema sync
bun run dev

# Check PocketBase connection
bun run status
```

### Schema Management

```bash
# Apply only safe changes
bun run schema:apply safe

# Apply all changes (with confirmation)
bun run schema:apply all

# Show schema differences
bun run schema:diff
```

### Migration Management

```bash
# Generate migration from schema changes
bun run migrate generate

# Run pending migrations
bun run migrate up

# Rollback last migration
bun run migrate down

# Show migration status
bun run migrate status
```

## 📁 Project Structure

```
pocketvex/
├── src/                    # Core library code
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Core utilities (diff, pocketbase client, demo utils)
│   ├── cli/                # Unified CLI system
│   │   └── index.ts        # Main CLI entry point
│   ├── schema/             # Example schema definitions
│   ├── dev-server.ts       # Development server
│   └── index.ts            # Main entry point
├── examples/               # Example projects and demos
│   ├── basic/              # Basic usage examples
│   ├── live-demo/          # Live PocketBase demos
│   ├── javascript-vm/      # PocketBase JS VM examples
│   └── demo.ts             # Unified demo system
├── docs/                   # Documentation and templates
│   ├── templates/          # Development templates
│   └── memory/             # Project constitution
├── config/                 # Configuration files
├── scripts/                # Build and utility scripts
├── schema/                 # Your schema definitions
├── generated/              # Auto-generated files
├── pb_migrations/          # Generated migration files
└── README.md
```

## 🔄 How It Works

### Safe Operations (Auto-applied)

- ✅ Create new collections
- ✅ Add new fields
- ✅ Update collection rules
- ✅ Add indexes
- ✅ Increase field limits
- ✅ Add select values
- ✅ Add editor fields

### Unsafe Operations (Generate Migrations)

- ❌ Change field types
- ❌ Delete collections/fields
- ❌ Make fields required without defaults
- ❌ Make fields unique (may have duplicates)
- ❌ Tighten validation constraints
- ❌ Remove select values

### Development Workflow

1. **Edit Schema**: Modify your TypeScript schema files
2. **Auto-Apply**: Safe changes are applied immediately
3. **Generate Migrations**: Unsafe changes generate migration files
4. **Review & Deploy**: Review migrations before production deployment

## 📝 Schema Definition

```typescript
interface SchemaDefinition {
  collections: SchemaCollection[];
}

interface SchemaCollection {
  id?: string; // Stable ID for relations
  name: string; // Collection name
  type?: 'base' | 'auth'; // Collection type
  schema?: SchemaField[]; // Field definitions
  indexes?: string[]; // SQL indexes
  rules?: SchemaRules; // Access rules
}

interface SchemaField {
  name: string; // Field name
  type:
    | 'text'
    | 'number'
    | 'bool'
    | 'email'
    | 'url'
    | 'date'
    | 'select'
    | 'json'
    | 'file'
    | 'relation'
    | 'editor';
  required?: boolean; // Required field
  unique?: boolean; // Unique constraint
  options?: {
    // Field-specific options
    min?: number;
    max?: number;
    pattern?: string;
    values?: string[];
    maxSelect?: number;
    maxSize?: number;
    collectionId?: string;
    cascadeDelete?: boolean;
  };
}
```

## 🔧 Advanced Usage

### Programmatic Usage

You can also use PocketVex as a library in your Node.js applications:

```typescript
import { SchemaDiff, PocketBaseClient, DevServer } from 'pocketvex';
import type { SchemaDefinition } from 'pocketvex';

// Define your schema
const schema: SchemaDefinition = {
  collections: [
    {
      name: 'users',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true, unique: true },
        { name: 'bio', type: 'editor', options: {} },
      ],
    },
  ],
};

// Compare schemas
const currentSchema = await pbClient.fetchCurrentSchema();
const plan = SchemaDiff.buildDiffPlan(schema, currentSchema);

// Apply safe changes
for (const operation of plan.safe) {
  await pbClient.applyOperation(operation);
}

// Start development server programmatically
const devServer = new DevServer({
  url: 'http://localhost:8090',
  adminEmail: 'admin@example.com',
  adminPassword: 'admin123',
  watchPaths: ['schema/**/*.ts'],
  autoApply: true,
  generateMigrations: true,
  migrationPath: './migrations',
});

await devServer.start();
```

### Editor Fields (Rich Text)

PocketVex supports PocketBase's editor field type for storing HTML content:

```typescript
{
  name: 'bio',
  type: 'editor',
  options: {},
}
```

Editor fields store HTML content like:

```html
<p>
  <strong>Trent</strong> like
  <span style="text-decoration: underline;">computers</span> &amp; snowboarding
</p>
```

**Common use cases:**

- User bios and profiles
- Article content
- Course descriptions
- Product descriptions
- Any content requiring rich text formatting

### Custom Schema Loading

```typescript
// Load your own schema
import { mySchema } from './schema/my-app.schema.js';

// Use in dev server
const config = {
  // ... other config
  schemaLoader: () => mySchema,
};
```

### Migration Hooks

```typescript
// In generated migration files
export const up = async (pb) => {
  // Backup data before destructive changes
  const backup = await backupData(pb, 'users');

  // Migrate field data
  await migrateFieldData(pb, 'users', 'email', (email) => {
    return email.toLowerCase();
  });
};
```

### Environment-specific Configs

```bash
# Development
export PB_URL="http://localhost:8090"
export PB_ADMIN_EMAIL="dev@example.com"
export PB_ADMIN_PASS="dev123"

# Production
export PB_URL="https://myapp.pockethost.io"
export PB_ADMIN_EMAIL="prod@example.com"
export PB_ADMIN_PASS="secure_password"
```

## 🚨 Safety Features

- **Dry Run Mode**: Test migrations without applying them
- **Backup Generation**: Automatic data backup before destructive changes
- **Confirmation Prompts**: Require explicit confirmation for unsafe operations
- **Rollback Support**: Easy rollback of migrations
- **Validation**: Comprehensive validation of schema changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## ⏰ CRON Job Scheduling

PocketVex includes comprehensive CRON job examples and demos for PocketBase's JavaScript VM scheduling capabilities:

### **Available CRON Patterns:**

- **Every minute**: `0 * * * * *` - Session cleanup, real-time monitoring
- **Every 5 minutes**: `0 */5 * * * *` - Email processing, task queues
- **Every hour**: `0 0 * * * *` - Analytics generation, data aggregation
- **Daily at midnight**: `0 0 0 * * *` - Data archiving, cleanup tasks
- **Weekly on Monday**: `0 0 9 * * 1` - Weekly reports, maintenance
- **Business hours**: `0 */15 9-17 * * 1-5` - Health monitoring, alerts
- **High frequency**: `*/30 * * * * *` - Real-time task processing

### **CRON Job Examples:**

```bash
# Run CRON jobs demo
bun run demo:cron

# Or through the main demo
bun run demo
# Select "⏰ CRON Jobs Demo"
```

### **Example CRON Jobs:**

- **Session Cleanup**: Automatically remove expired user sessions
- **Analytics Generation**: Create hourly/daily/weekly analytics reports
- **Email Processing**: Process queued emails with error handling
- **Health Monitoring**: Monitor system health during business hours
- **Data Archiving**: Archive old logs and data for performance
- **Task Processing**: Handle background tasks and notifications
- **Weekly Reports**: Generate and send automated reports

### **Implementation:**

1. Create JavaScript files in `pb_jobs/` directory
2. Use `$jobs.register()` to define scheduled jobs
3. Deploy to your PocketBase instance
4. Monitor execution in PocketBase logs

```javascript
// Example: Session cleanup every minute
$jobs.register('session-cleanup', '0 * * * * *', async (cron) => {
  const expiredSessions = await $app
    .db()
    .newQuery('sessions')
    .filter('expires < {:now}', { now: new Date() })
    .all();

  for (const session of expiredSessions) {
    await $app.db().delete('sessions', session.id);
  }
});
```

## 🧩 PocketBase JavaScript VM Integration

PocketVex provides comprehensive support for all PocketBase JavaScript features, making it truly Convex-like:

### 📁 Project Structure

```
your-project/
├── schema/                 # Schema definitions (TypeScript)
│   ├── users.schema.ts
│   └── posts.schema.ts
├── pb_hooks/              # Event hooks (JavaScript)
│   ├── user-hooks.js
│   └── post-hooks.js
├── pb_jobs/               # Scheduled jobs (JavaScript)
│   ├── daily-cleanup.js
│   └── analytics.js
├── pb_commands/           # Console commands (JavaScript)
│   ├── user-management.js
│   └── db-maintenance.js
├── pb_queries/            # Raw database queries (JavaScript)
│   ├── analytics.js
│   └── migrations.js
└── generated/             # Auto-generated TypeScript types
    ├── types.ts
    └── api-client.ts
```

### 🎣 Event Hooks

Define custom business logic with event hooks:

```javascript
// pb_hooks/user-hooks.js
$hooks.onRecordAfterCreateSuccess((e) => {
  console.log(`New user registered: ${e.record.get('email')}`);

  // Send welcome email
  const mailer = $app.newMailClient();
  mailer.send({
    from: 'noreply@example.com',
    to: [e.record.get('email')],
    subject: 'Welcome!',
    html: `<h1>Welcome ${e.record.get('name')}!</h1>`,
  });
}, 'users');

$hooks.onRecordValidate((e) => {
  if (e.record.collectionName === 'posts') {
    const title = e.record.get('title');
    if (!title || title.length < 5) {
      throw new Error('Post title must be at least 5 characters');
    }
  }
  e.next();
}, 'posts');
```

### ⏰ Scheduled Jobs (CRON)

Create automated background tasks:

```javascript
// pb_jobs/daily-cleanup.js
$jobs.register({
  name: 'daily_cleanup',
  cron: '0 2 * * *', // Every day at 2 AM
  handler: async (e) => {
    // Clean up old sessions
    await $app
      .db()
      .newQuery(
        `
      DELETE FROM _sessions
      WHERE created < datetime('now', '-30 days')
    `,
      )
      .execute();

    console.log('Daily cleanup completed');
    e.next();
  },
});
```

### 💻 Console Commands

Add custom CLI commands:

```javascript
// pb_commands/user-management.js
$commands.register({
  name: 'user:create',
  description: 'Create a new user',
  handler: async (e) => {
    const user = $app.db().newRecord('users');
    user.set('email', 'newuser@example.com');
    user.set('name', 'New User');
    await $app.save(user);

    console.log('User created successfully');
    e.next();
  },
});
```

### 🗄️ Raw Database Queries

Perform advanced database operations:

```javascript
// pb_queries/analytics.js
const getUserStats = async () => {
  const stats = await $app
    .db()
    .newQuery(
      `
    SELECT
      COUNT(*) as total_users,
      COUNT(CASE WHEN created > datetime('now', '-30 days') THEN 1 END) as new_users
    FROM users
  `,
    )
    .one();

  return stats;
};
```

### 🔧 TypeScript Type Generation

Automatic type generation from your schema:

```typescript
// generated/types.ts (auto-generated)
export interface UsersRecord extends AuthRecord {
  name: string;
  email: string;
  bio?: string;
  role?: string;
}

export interface PostsRecord extends BaseRecord {
  title: string;
  content: string;
  author: string;
  published: boolean;
}

// generated/api-client.ts (auto-generated)
export interface PocketBaseAPI {
  users: {
    getList: (
      params?: PocketBaseListParams,
    ) => Promise<PocketBaseResponse<UsersRecord>>;
    getOne: (id: string) => Promise<UsersRecord>;
    create: (data: UsersCreate) => Promise<UsersRecord>;
    update: (id: string, data: UsersUpdate) => Promise<UsersRecord>;
    delete: (id: string) => Promise<boolean>;
  };
  // ... other collections
}
```

### 🚀 Development Workflow

1. **Define Schema**: Create TypeScript schema files
2. **Add Business Logic**: Write event hooks in JavaScript
3. **Create Automation**: Add scheduled jobs and console commands
4. **Start Development Server**: `bun run dev-js`
5. **Real-time Sync**: Files are watched and synced automatically
6. **Type Safety**: TypeScript types are generated from schema

### 📋 Available JavaScript VM APIs

- **`$app`** - Main application instance
- **`$hooks`** - Event hook registration
- **`$jobs`** - Scheduled job registration
- **`$commands`** - Console command registration
- **`$http`** - HTTP request client
- **`$realtime`** - Realtime messaging
- **`$filesystem`** - File operations
- **`$log`** - Logging utilities
- **`$app.db()`** - Database operations
- **`$app.newMailClient()`** - Email client

This comprehensive integration makes PocketBase development as smooth and type-safe as Convex! 🎉

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by Convex's developer experience
- Built for the PocketBase community
- Uses Bun for fast development experience
