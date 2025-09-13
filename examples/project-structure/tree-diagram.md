# PocketVex Project Structure Tree Diagram

## 🌳 New `/pocketvex` Directory Structure (Default)

```
my-project/
├── 📁 pocketvex/                    # 🎯 PocketVex Directory (Configurable)
│   ├── 📋 schema/                   # Schema definitions
│   │   ├── users.schema.ts
│   │   ├── posts.schema.ts
│   │   └── index.ts
│   ├── ⏰ jobs/                     # CRON jobs (no pb_ prefix)
│   │   ├── cleanup.js
│   │   ├── analytics.js
│   │   └── notifications.js
│   ├── 🪝 hooks/                    # Event hooks (no pb_ prefix)
│   │   ├── user-hooks.js
│   │   ├── post-hooks.js
│   │   └── auth-hooks.js
│   ├── 💻 commands/                 # Console commands (no pb_ prefix)
│   │   ├── seed.js
│   │   ├── migrate.js
│   │   └── maintenance.js
│   ├── 🔍 queries/                  # Custom queries (no pb_ prefix)
│   │   ├── analytics.js
│   │   ├── search.js
│   │   └── reports.js
│   └── 📦 migrations/               # Generated migrations (no pb_ prefix)
│       ├── 20240115_001_initial.js
│       └── 20240115_002_add_indexes.js
├── 🔧 generated/                    # Auto-generated files (always in root)
│   ├── types.ts
│   ├── api.ts
│   └── schema.json
├── 📄 pocketvex.config.json         # Configuration file
├── 📄 package.json
└── 📄 README.md
```

## 🔧 Configuration Options

### `pocketvex.config.json`
```json
{
  "directory": "pocketvex",           // Custom directory name
  "usePocketVexDirectory": true,      // Use new structure
  "usePbPrefixes": false              // No pb_ prefixes
}
```

### Custom Directory Example
```json
{
  "directory": "src/pocketbase",      // Custom location
  "usePocketVexDirectory": true,
  "usePbPrefixes": false
}
```

## 🔄 Legacy Structure Support

### Legacy Mode (Backward Compatible)
```json
{
  "directory": "pocketvex",
  "usePocketVexDirectory": false,     // Use legacy structure
  "usePbPrefixes": true               // Keep pb_ prefixes
}
```

**Legacy Structure:**
```
my-project/
├── 📋 schema/                       # Schema definitions
├── ⏰ pb_jobs/                      # CRON jobs (with pb_ prefix)
├── 🪝 pb_hooks/                     # Event hooks (with pb_ prefix)
├── 💻 pb_commands/                  # Console commands (with pb_ prefix)
├── 🔍 pb_queries/                   # Custom queries (with pb_ prefix)
├── 📦 pb_migrations/                # Generated migrations (with pb_ prefix)
└── 🔧 generated/                    # Auto-generated files
```

## 🎯 Benefits of New Structure

### ✅ **Cleaner Organization**
- All PocketVex files in one directory
- No confusing `pb_` prefixes
- Similar to Convex's `/convex` structure

### ✅ **Configurable Location**
- Default: `/pocketvex` in project root
- Custom: Any directory (e.g., `src/pocketbase`)
- Backward compatible with legacy structure

### ✅ **Better Developer Experience**
- Clear separation of concerns
- Easier to find related files
- Consistent naming conventions

### ✅ **Migration Path**
- Automatic detection of existing structure
- Gradual migration support
- No breaking changes

## 🚀 Getting Started

### 1. **New Project (Recommended)**
```bash
# Create new project
mkdir my-project && cd my-project

# Install PocketVex
npm install pocketvex

# Initialize with new structure
npx pocketvex init
```

### 2. **Existing Project Migration**
```bash
# PocketVex automatically detects existing structure
# and provides migration guidance

# Or manually migrate:
mkdir pocketvex
mv schema pocketvex/
mv pb_jobs pocketvex/jobs
mv pb_hooks pocketvex/hooks
mv pb_commands pocketvex/commands
mv pb_queries pocketvex/queries
mv pb_migrations pocketvex/migrations
```

### 3. **Custom Directory Setup**
```bash
# Create custom directory
mkdir src/pocketbase

# Update configuration
echo '{
  "directory": "src/pocketbase",
  "usePocketVexDirectory": true,
  "usePbPrefixes": false
}' > pocketvex.config.json
```

## 📝 File Examples

### Schema File
```typescript
// pocketvex/schema/users.schema.ts
import type { SchemaDefinition } from 'pocketvex/types';

export const usersSchema: SchemaDefinition = {
  collections: [
    {
      name: 'users',
      type: 'auth' as const,
      schema: [
        { name: 'name', type: 'text' as const, required: true },
        { name: 'email', type: 'email' as const, required: true },
      ],
    },
  ],
};
```

### CRON Job
```javascript
// pocketvex/jobs/cleanup.js
$jobs.register('cleanup', '0 2 * * * *', async (cron) => {
  console.log('🧹 Starting cleanup job...');
  // Cleanup logic here
});
```

### Event Hook
```javascript
// pocketvex/hooks/user-hooks.js
$app.onRecordCreate('users', async (e) => {
  console.log('👤 New user created:', e.record.id);
  // Welcome email logic here
});
```

### Console Command
```javascript
// pocketvex/commands/seed.js
$app.command('seed', async (cmd) => {
  console.log('🌱 Seeding database...');
  // Seeding logic here
});
```

## 🔄 Development Workflow

### 1. **Start Development Server**
```bash
npm run dev
# Watches: pocketvex/**/*.ts, pocketvex/**/*.js
```

### 2. **Schema Changes**
```typescript
// Edit: pocketvex/schema/users.schema.ts
// PocketVex automatically detects and applies changes
```

### 3. **JavaScript VM Changes**
```javascript
// Edit: pocketvex/jobs/cleanup.js
// PocketVex shows deployment instructions
```

### 4. **Type Generation**
```bash
npm run types:generate
# Updates: generated/types.ts
```

## 🎉 Summary

The new `/pocketvex` directory structure provides:

- **🎯 Clean Organization**: All PocketVex files in one place
- **🔧 Configurable**: Custom directory location support
- **🔄 Backward Compatible**: Legacy structure still supported
- **📋 No Prefixes**: Clean naming without `pb_` prefixes
- **🚀 Convex-like**: Similar to Convex's `/convex` structure
- **⚡ Better DX**: Improved developer experience

This structure makes PocketVex projects more organized, maintainable, and easier to understand! 🚀
