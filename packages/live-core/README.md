# @pocketvex/live-core

Framework-agnostic live state management for PocketBase with real-time subscriptions, query caching, and optimistic updates.

## Features

- **Real-time by default**: Automatic subscriptions to PocketBase collections
- **Query deduplication**: Efficient subscription management with ref-counting
- **Local optimizations**: Debounced refetch and local re-sorting
- **Memory management**: TTL-based garbage collection
- **Type-safe**: Full TypeScript support
- **Framework agnostic**: Works with React, Vue, Svelte, or vanilla JS

## Installation

```bash
npm install @pocketvex/live-core pocketbase
```

## Quick Start

```typescript
import { createPVClient } from '@pocketvex/live-core';

// Create client
const client = createPVClient({
  url: 'http://127.0.0.1:8090',
  onError: (err) => console.error('PocketVex error:', err),
});

// Subscribe to live data
const unsubscribe = client.subscribe(
  ['posts', { collection: 'posts', filter: 'published = true' }],
  (state) => {
    console.log('Posts updated:', state.data);
  },
);

// Start the query
client.query(['posts', { collection: 'posts', filter: 'published = true' }]);

// Clean up
unsubscribe();
```

## API Reference

### `createPVClient(config)`

Creates a new PocketVex client instance.

**Parameters:**

- `config.url`: PocketBase server URL
- `config.auth?`: Function returning auth token
- `config.sdk?`: Existing PocketBase instance
- `config.onError?`: Error handler function

### `client.query(key, options?)`

Starts a query and begins real-time subscription.

**Parameters:**

- `key`: Query key (string or [string, params])
- `options.policy?`: 'live' | 'swr' | 'manual' (default: 'live')

### `client.subscribe(key, callback)`

Subscribe to query state changes.

**Returns:** Unsubscribe function

### `client.get(key)`

Get current query state synchronously.

### `client.invalidate(keys?)`

Invalidate and refetch queries.

### `client.create(collection, data)`

Create a new record.

### `client.update(collection, id, data)`

Update an existing record.

### `client.delete(collection, id)`

Delete a record.

## Query Keys

Query keys can be simple strings or tuples with parameters:

```typescript
// Simple string key
'posts'[
  // Tuple with parameters
  ('posts',
  {
    collection: 'posts',
    filter: 'published = true',
    sort: '-created',
    limit: 10,
    expand: 'author',
  })
];
```

## Real-time Features

- **Server-side filtering**: Uses PocketBase 0.21+ filtered subscriptions
- **Client-side recheck**: Handles filter-crossing events
- **Debounced updates**: Prevents burst updates (25ms delay)
- **Local re-sorting**: Avoids refetch for simple sorts
- **Subscription deduplication**: Reuses subscriptions for similar queries

### Reconnect & Auth

- On reconnect or going back online, queries are invalidated and refetched to backfill missed events.
- When the auth token changes, live subscriptions are torn down and re-established, and queries are invalidated.
- To make backfill reliable, add an `updated` field to your collections and prefer cursor or time-based windows over offset pagination.

## Memory Management

- **Ref-counted subscriptions**: Automatically cleanup unused subscriptions
- **TTL-based GC**: Removes unused queries after 5 minutes
- **Entity normalization**: Efficient storage of related data

## Error Handling

```typescript
const client = createPVClient({
  url: 'http://127.0.0.1:8090',
  onError: (err) => {
    console.error('PocketVex error:', err);
    // Handle reconnection, auth errors, etc.
  },
});
```

## TypeScript Support

```typescript
interface PostRecord {
  id: string;
  title: string;
  content: string;
  published: boolean;
}

const client = createPVClient({ url: '...' });

// Fully typed queries
client.query<PostRecord[]>(['posts', { collection: 'posts' }]);
```
