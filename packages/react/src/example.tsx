/**
 * Example React component using PocketVex hooks
 */

import React from 'react';
import { createPVClient } from '@pocketvex/live-core';
import {
  PVClientProvider,
  usePVList,
  usePVRecord,
  usePVMutation,
  usePVInvalidate,
} from './index.js';

// Example types (would be generated from schema)
interface PostRecord {
  id: string;
  title: string;
  content: string;
  author: string;
  created: string;
  published: boolean;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
}

// Create client instance
const client = createPVClient({
  url: 'http://127.0.0.1:8090',
  onError: (err) => console.error('PocketVex error:', err),
});

/**
 * Example component showing live post list
 */
function PostList() {
  const {
    data: posts,
    status,
    error,
  } = usePVList<PostRecord>(client, 'posts', {
    filter: 'published = true',
    sort: '-created',
  });

  if (status === 'loading') return <div>Loading posts...</div>;
  if (error) return <div>Error: {String(error)}</div>;

  return (
    <div>
      <h2>Published Posts</h2>
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

/**
 * Example component showing individual post with author
 */
function PostCard({ post }: { post: PostRecord }) {
  const { data: author } = usePVRecord<UserRecord>(
    client,
    'users',
    post.author,
  );

  return (
    <div
      style={{ border: '1px solid #ccc', padding: '1rem', margin: '0.5rem' }}
    >
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <small>
        By {author?.name || 'Unknown'} •{' '}
        {new Date(post.created).toLocaleDateString()}
      </small>
    </div>
  );
}

/**
 * Example component with mutations
 */
function PostEditor() {
  const { create, update, delete: remove } = usePVMutation(client);
  const { invalidate } = usePVInvalidate(client);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');

  const handleCreate = async () => {
    try {
      await create('posts', {
        title,
        content,
        author: 'user123', // would come from auth
        published: false,
      });
      setTitle('');
      setContent('');
      // Invalidate the posts list to refresh
      invalidate(['pv:list', { collection: 'posts' }]);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', margin: '1rem' }}>
      <h3>Create New Post</h3>
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <textarea
        placeholder="Post content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: '100%', height: '100px', marginBottom: '0.5rem' }}
      />
      <button onClick={handleCreate} disabled={!title || !content}>
        Create Post
      </button>
    </div>
  );
}

/**
 * Main app component
 */
export function App() {
  return (
    <PVClientProvider client={client}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1>PocketVex Live Demo</h1>
        <PostEditor />
        <PostList />
      </div>
    </PVClientProvider>
  );
}
