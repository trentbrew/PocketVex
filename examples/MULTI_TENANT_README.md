# Multi-Tenant Application Schema

This schema provides a complete multi-tenant application structure for PocketBase, allowing you to build applications that can serve multiple tenants (apps) with isolated data and dynamic schemas.

## 🏗️ Schema Structure

### Collections Overview

1. **`apps`** - Tenant containers
2. **`app_members`** - User permissions per app
3. **`schemas`** - Dynamic schema definitions per app
4. **`pv_records`** - Dynamic data per schema
5. **`pv_files`** - File attachments per record
6. **`pv_state`** - Key-value state management

## 📱 Apps Collection

The `apps` collection serves as the main tenant container:

```typescript
interface App {
  id: string;
  owner: string; // User ID of the app owner
  name: string; // App name (unique per owner)
  production_url?: string; // Production URL
  development_url?: string; // Development URL
  github?: string; // GitHub repository URL
  meta?: Record<string, any>; // Custom metadata
}
```

**Key Features:**

- Unique constraint on `owner + name`
- Owner-based access control
- Flexible metadata storage

## 👥 App Members Collection

Manages user permissions within each app:

```typescript
interface AppMember {
  id: string;
  app: string; // App ID
  user: string; // User ID
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'active' | 'removed';
  invitedBy?: string; // User ID who invited this member
}
```

**Roles:**

- **Owner**: Full control over the app
- **Admin**: Can manage schemas and users
- **Editor**: Can create/edit records
- **Viewer**: Read-only access

## 📋 Schemas Collection

Dynamic schema definitions for each app:

```typescript
interface Schema {
  id: string;
  app: string; // App ID
  name: string; // Schema name (unique per app)
  version?: string; // Schema version
  schema: Record<string, any>; // Dynamic schema definition
  createdBy: string; // User ID
}
```

**Schema Definition Format:**

```json
{
  "fields": [
    {
      "name": "title",
      "type": "text",
      "required": true,
      "options": { "min": 1, "max": 100 }
    },
    {
      "name": "price",
      "type": "number",
      "required": true,
      "options": { "min": 0 }
    }
  ]
}
```

## 📝 PV Records Collection

Stores dynamic data based on schema definitions:

```typescript
interface PVRecord {
  id: string;
  app: string; // App ID
  schema: string; // Schema ID
  data: Record<string, any>; // Dynamic data
  createdBy: string; // User ID
}
```

**Features:**

- Flexible JSON data storage
- Schema-based validation
- App-level isolation

## 📎 PV Files Collection

File attachments for records:

```typescript
interface PVFile {
  id: string;
  app: string; // App ID
  schema: string; // Schema ID
  record?: string; // PVRecord ID (optional)
  file: string; // File ID
  public?: boolean; // Public access
  metadata?: Record<string, any>; // File metadata
}
```

**Features:**

- 25MB file size limit
- Public/private access control
- Metadata storage
- Optional record association

## 💾 PV State Collection

Key-value state management:

```typescript
interface PVState {
  id: string;
  key: string; // Unique key
  value: Record<string, any>; // JSON value
  holder?: string; // Optional holder identifier
  expires?: string; // Optional expiration date
}
```

**Use Cases:**

- Application settings
- User preferences
- Cached data
- Session state

## 🚀 Usage Examples

### 1. Create a New App

```typescript
const app = await pb.collection('apps').create({
  name: 'My Awesome App',
  production_url: 'https://myapp.com',
  meta: {
    description: 'A sample application',
    category: 'productivity',
  },
});
```

### 2. Define a Schema

```typescript
const schema = await pb.collection('schemas').create({
  app: app.id,
  name: 'products',
  version: '1.0.0',
  schema: {
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        options: { min: 1, max: 100 },
      },
      {
        name: 'price',
        type: 'number',
        required: true,
        options: { min: 0 },
      },
    ],
  },
});
```

### 3. Create Records

```typescript
const record = await pb.collection('pv_records').create({
  app: app.id,
  schema: schema.id,
  data: {
    title: 'Wireless Headphones',
    price: 199.99,
  },
});
```

### 4. Query Records

```typescript
// Get all products for an app
const products = await pb.collection('pv_records').getList(1, 10, {
  filter: `app = "${app.id}" && schema = "${schema.id}"`,
  sort: '-created',
});

// Filter by data fields
const expensiveProducts = await pb.collection('pv_records').getList(1, 10, {
  filter: `app = "${app.id}" && schema = "${schema.id}" && data.price > 100`,
  sort: '-created',
});
```

### 5. Manage State

```typescript
// Set app settings
await pb.collection('pv_state').create({
  key: `app:${app.id}:settings`,
  value: {
    theme: 'dark',
    language: 'en',
    notifications: true,
  },
  holder: app.id,
});

// Get app settings
const settings = await pb
  .collection('pv_state')
  .getFirstListItem(`key = "app:${app.id}:settings"`);
```

## 🔒 Security Considerations

1. **App Isolation**: All data is isolated by app ID
2. **User Permissions**: Role-based access control
3. **Schema Validation**: Dynamic schemas provide structure
4. **File Security**: Public/private file access control
5. **State Management**: Secure key-value storage

## 🎯 Best Practices

1. **Naming Conventions**: Use consistent naming for schemas and state keys
2. **Version Control**: Version your schemas for backward compatibility
3. **Data Validation**: Implement client-side validation based on schemas
4. **Error Handling**: Handle schema evolution gracefully
5. **Performance**: Use appropriate indexes for queries

## 🧪 Running the Demo

```bash
# Run the multi-tenant demo
npm run demo:multi-tenant

# Or run directly
bun run examples/multi-tenant-demo.ts
```

The demo will:

1. Create a new app
2. Define a product schema
3. Create sample records
4. Demonstrate queries and filtering
5. Show file attachments and state management

## 📚 Related Files

- `pocketvex/schema/multi-tenant.schema.ts` - Schema definition
- `pocketvex/schema/multi-tenant.schema.d.ts` - TypeScript types
- `pocketvex/migrations/001_multi_tenant_schema.js` - Migration script
- `examples/multi-tenant-demo.ts` - Usage demonstration

This multi-tenant schema provides a solid foundation for building scalable, multi-tenant applications with PocketBase!
