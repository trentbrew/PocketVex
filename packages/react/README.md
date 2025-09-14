# @pocketvex/react

React hooks for PocketVex live state management. Provides real-time, type-safe data fetching with automatic subscriptions and optimistic updates.

## Features

- **Real-time hooks**: Automatic subscriptions with `useSyncExternalStore`
- **Type-safe**: Full TypeScript support with generated types
- **Optimized rerenders**: Selector-based equality checks
- **Convenience hooks**: Specialized hooks for common patterns
- **Context support**: Easy client sharing across components

## Installation

```bash
npm install @pocketvex/react @pocketvex/live-core react
```

## Quick Start

```tsx
import React from 'react';
import { createPVClient } from '@pocketvex/live-core';
import { PVClientProvider, usePVListCtx, usePVRecordCtx } from '@pocketvex/react';

// Create client
const client = createPVClient({
  url: 'http://127.0.0.1:8090',
});

// App component
function App() {
  return (
    <PVClientProvider client={client}>
      <PostList />
    </PVClientProvider>
  );
}

// Component with live data
function PostList() {
  const {
    data: posts,
    status,
    error,
  } = usePVListCtx('posts', {
    filter: 'published = true',
    sort: '-created',
  });

  if (status === 'loading') return <div>Loading...</div>;
  if (error) return <div>Error: {String(error)}</div>;

  return (
    <div>
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// Component with single record
function PostCard({ post }) {
  const { data: author } = usePVRecordCtx('users', post.author);

  return (
    <div>
      <h3>{post.title}</h3>
      <p>By {author?.name}</p>
    </div>
  );
}
```

## API Reference

### Provider

#### `PVClientProvider`

Provides PocketVex client to child components.

```tsx
<PVClientProvider client={client}>
  <App />
</PVClientProvider>
```

### Hooks

#### `usePVQuery<T>(client, key, options?)`

Main hook for subscribing to queries.

```tsx
const state = usePVQuery(client, ['posts', { collection: 'posts' }], {
  policy: 'live', // 'live' | 'swr' | 'manual'
  selector: (s) => s.data, // Optional selector
  equalityFn: (a, b) => a === b, // Optional equality function
});
```

#### `usePVData<T>(client, key)`

Convenience hook for just the data.

```tsx
const posts = usePVData(client, ['posts', { collection: 'posts' }]);
```

#### `usePVList<T>(client, collection, params?)`

Hook for list queries.

```tsx
const {
  data: posts,
  status,
  error,
} = usePVList(client, 'posts', {
  filter: 'published = true',
  sort: '-created',
  limit: 10,
  expand: 'author',
});
```

#### `usePVRecord<T>(client, collection, id)`

Hook for single record queries.

```tsx
const { data: user, status } = usePVRecord(client, 'users', 'user123');
```

#### `usePVStatus<T>(client, key)`

Hook for query status only.

```tsx
const status = usePVStatus(client, ['posts', { collection: 'posts' }]);
// Returns: 'idle' | 'loading' | 'success' | 'error'
```

#### `usePVError<T>(client, key)`

Hook for query error only.

```tsx
const error = usePVError(client, ['posts', { collection: 'posts' }]);
```

#### `usePVInvalidate(client)`

Hook for invalidating queries.

```tsx
const { invalidate, invalidateAll } = usePVInvalidate(client);

// Invalidate specific queries
invalidate(['posts', { collection: 'posts' }]);

// Invalidate all queries
invalidateAll();
```

#### `usePVMutation(client)`

Hook for CRUD operations.

```tsx
const { create, update, delete: remove } = usePVMutation(client);

// Create
await create('posts', { title: 'New Post', content: '...' });

// Update
await update('posts', 'post123', { title: 'Updated Title' });

// Delete
await remove('posts', 'post123');
```

### Context Hook

#### `usePVClient()`

Get the PocketVex client from context.

```tsx
function MyComponent() {
  const client = usePVClient();
  // Use client directly
}
```

## TypeScript Support

```tsx
interface PostRecord {
  id: string;
  title: string;
  content: string;
  published: boolean;
  author: string;
}

// Fully typed hooks
const { data: posts } = usePVList<PostRecord>(client, 'posts');
const { data: post } = usePVRecord<PostRecord>(client, 'posts', 'post123');
```

## Performance Optimization

### Selector-based Equality

Prevent unnecessary rerenders with custom selectors:

```tsx
// Only rerender when data changes, not status
const posts = usePVQuery(client, ['posts', { collection: 'posts' }], {
  selector: (s) => s.data,
  equalityFn: (a, b) => a === b,
});
```

### Stable References

Use `useMemo` for stable query keys:

```tsx
const queryKey = useMemo(
  () => ['posts', { collection: 'posts', filter: `author = "${userId}"` }],
  [userId],
);

const { data: posts } = usePVList(client, 'posts', {
  filter: `author = "${userId}"`,
});
```

## Error Handling

```tsx
function PostList() {
  const { data: posts, status, error } = usePVList(client, 'posts');

  if (status === 'error') {
    return (
      <div>
        <h3>Error loading posts</h3>
        <p>{String(error)}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // ... rest of component
}
```

## SSR Support

The hooks work with SSR by default. The client will hydrate with server data and attach live subscriptions on the client side.

```tsx
// Server-side
const client = createPVClient({ url: '...' });
await client.query(['posts', { collection: 'posts' }]);
const initialData = client.get(['posts', { collection: 'posts' }]);

// Client-side
<PVClientProvider client={client}>
  <App />
</PVClientProvider>;
```
