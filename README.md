# PocketVex

**Schema migration system for PocketBase with real-time development workflow**

PocketVex provides a Convex-style development experience for PocketBase, allowing you to define your schema as code and automatically apply changes during development.

## 🚀 Features

- **Schema-as-Code**: Define your PocketBase schema in TypeScript
- **Real-time Migration**: Watch schema files and apply changes automatically
- **Safe vs Unsafe Operations**: Automatically categorizes changes and handles them appropriately
- **Migration Generation**: Generate migration files for production deployments
- **Development Server**: Hot-reload schema changes during development
- **CLI Tools**: Comprehensive command-line interface for schema management

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

### 1. Start Development Server

```bash
# Start with file watching
bun run dev --watch

# Or one-time sync
bun run dev
```

### 2. Live Demo with PocketBase Instance

Try PocketVex with a live PocketBase instance:

```bash
# Set up environment variables for live instance
export PB_URL="https://pocketvex.pockethost.io/"
export PB_ADMIN_EMAIL="your-admin@email.com"
export PB_ADMIN_PASS="your-admin-password"

# Run live demo
bun run demo-with-live-pb

# Run real-time migration demo
bun run realtime-migration

# Run incremental migration demo
bun run incremental-migration

# Or test connection
bun run test-connection
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
├── src/
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Core utilities (diff, pocketbase client)
│   ├── cli/             # CLI commands
│   ├── schema/          # Example schema definitions
│   ├── dev-server.ts    # Development server
│   └── index.ts         # Main entry point
├── schema/              # Your schema definitions
├── pb_migrations/       # Generated migration files
├── examples/            # Example projects
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

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by Convex's developer experience
- Built for the PocketBase community
- Uses Bun for fast development experience
