# PocketVex Frontend Project Structure (Svelte)

This example shows how to organize a Svelte frontend application using PocketVex for PocketBase schema management and type generation.

## 📁 Frontend Project Structure

```
my-svelte-app/
├── package.json                 # Frontend dependencies and scripts
├── vite.config.js              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
│
├── src/                        # 🏗️ Svelte Application
│   ├── App.svelte              # Main app component
│   ├── main.ts                 # Application entry point
│   ├── app.html                # HTML template
│   │
│   ├── lib/                    # 📚 Library Code
│   │   ├── pocketbase.ts       # PocketBase client setup
│   │   ├── stores/             # Svelte stores
│   │   │   ├── auth.ts         # Authentication store
│   │   │   ├── user.ts         # User data store
│   │   │   └── posts.ts        # Posts data store
│   │   ├── components/         # Reusable components
│   │   │   ├── ui/             # UI components
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   └── Modal.svelte
│   │   │   ├── auth/           # Authentication components
│   │   │   │   ├── LoginForm.svelte
│   │   │   │   ├── SignupForm.svelte
│   │   │   │   └── UserProfile.svelte
│   │   │   └── posts/          # Post-related components
│   │   │       ├── PostCard.svelte
│   │   │       ├── PostEditor.svelte
│   │   │       └── PostList.svelte
│   │   └── utils/              # Utility functions
│   │       ├── api.ts          # API helpers
│   │       ├── validation.ts   # Form validation
│   │       └── formatting.ts   # Data formatting
│   │
│   ├── routes/                 # 🛣️ Page Routes
│   │   ├── +layout.svelte      # Layout component
│   │   ├── +page.svelte        # Home page
│   │   ├── +layout.server.ts   # Server-side layout logic
│   │   ├── +page.server.ts     # Server-side page logic
│   │   ├── login/              # Login page
│   │   │   ├── +page.svelte
│   │   │   └── +page.server.ts
│   │   ├── posts/              # Posts pages
│   │   │   ├── +page.svelte    # Posts list
│   │   │   ├── +page.server.ts
│   │   │   ├── [id]/           # Individual post
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.server.ts
│   │   │   └── create/         # Create post
│   │   │       ├── +page.svelte
│   │   │       └── +page.server.ts
│   │   └── profile/            # User profile
│   │       ├── +page.svelte
│   │       └── +page.server.ts
│   │
│   └── static/                 # 🌐 Static Assets
│       ├── favicon.ico
│       ├── images/
│       └── icons/
│
├── schema/                     # 📋 Schema Definitions (PocketVex)
│   ├── users.schema.ts         # User collection schema
│   ├── posts.schema.ts         # Posts collection schema
│   └── index.ts                # Export all schemas
│
├── generated/                  # 🔧 Auto-generated Files (PocketVex)
│   ├── types.ts                # TypeScript types
│   ├── api.ts                  # API client
│   └── schema.json             # Current schema snapshot
│
├── pb_jobs/                    # ⏰ CRON Jobs (PocketVex)
│   ├── cleanup.js              # Cleanup expired sessions
│   └── analytics.js            # Daily analytics processing
│
├── pb_hooks/                   # 🪝 Event Hooks (PocketVex)
│   ├── user-hooks.js           # User-related event handlers
│   └── post-hooks.js           # Post creation/update hooks
│
├── pb_commands/                # 💻 Console Commands (PocketVex)
│   └── seed.js                 # Database seeding
│
├── pb_migrations/              # 📦 Generated Migrations (PocketVex)
│   └── 20240115_001_initial_schema.js
│
└── docs/                       # 📚 Documentation
    ├── api.md                  # API documentation
    ├── deployment.md           # Deployment guide
    └── development.md          # Development setup
```

## 🚀 Getting Started

### 1. Create Svelte Project

```bash
# Create new SvelteKit project
npm create svelte@latest my-svelte-app
cd my-svelte-app

# Install PocketVex
npm install pocketvex

# Install additional dependencies
npm install pocketbase tailwindcss @tailwindcss/typography
npm install -D @types/pocketbase autoprefixer postcss
```

### 2. Configure PocketVex

```bash
# Initialize PocketVex
npx pocketvex init

# Create schema directories
mkdir -p schema pb_jobs pb_hooks pb_commands pb_migrations generated
```

### 3. Configure package.json

```json
{
  "name": "my-svelte-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "pocketvex dev & vite dev",
    "dev:once": "pocketvex dev --once",
    "build": "pocketvex types generate && vite build",
    "preview": "vite preview",
    "schema:diff": "pocketvex schema diff",
    "schema:apply": "pocketvex schema apply",
    "migrate:up": "pocketvex migrate up",
    "types:generate": "pocketvex types generate",
    "setup": "pocketvex setup"
  },
  "dependencies": {
    "pocketvex": "^1.0.0",
    "pocketbase": "^0.21.1",
    "@sveltejs/adapter-auto": "^2.0.0",
    "@sveltejs/kit": "^1.20.4",
    "svelte": "^4.0.5"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^2.4.2",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.2"
  }
}
```

## 📋 Schema Files (PocketVex)

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

## 🏗️ Frontend Code

### src/lib/pocketbase.ts
```typescript
import PocketBase from 'pocketbase';
import { browser } from '$app/environment';
import type { User, Post } from '../../generated/types.js';

export class PocketBaseClient extends PocketBase {
  constructor() {
    const url = browser 
      ? (import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')
      : 'http://127.0.0.1:8090';
    
    super(url);
    
    // Enable real-time subscriptions
    this.autoCancellation(false);
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return this.collection('users').getFullList<User>();
  }

  async getUser(id: string): Promise<User> {
    return this.collection('users').getOne<User>(id);
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.collection('users').create<User>(data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.collection('users').update<User>(id, data);
  }

  // Post operations
  async getPosts(): Promise<Post[]> {
    return this.collection('posts').getFullList<Post>({
      expand: 'author',
      sort: '-created'
    });
  }

  async getPost(id: string): Promise<Post> {
    return this.collection('posts').getOne<Post>(id, {
      expand: 'author'
    });
  }

  async createPost(data: Partial<Post>): Promise<Post> {
    return this.collection('posts').create<Post>(data);
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post> {
    return this.collection('posts').update<Post>(id, data);
  }

  async deletePost(id: string): Promise<boolean> {
    return this.collection('posts').delete(id);
  }

  // Authentication
  async login(email: string, password: string): Promise<User> {
    const authData = await this.collection('users').authWithPassword(email, password);
    return authData.record as User;
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    const userData = await this.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name
    });
    
    // Auto-login after signup
    const authData = await this.collection('users').authWithPassword(email, password);
    return authData.record as User;
  }

  async logout(): Promise<void> {
    this.authStore.clear();
  }

  get currentUser(): User | null {
    return this.authStore.model as User | null;
  }

  get isAuthenticated(): boolean {
    return this.authStore.isValid;
  }
}

// Create singleton instance
export const pb = new PocketBaseClient();
```

### src/lib/stores/auth.ts
```typescript
import { writable, derived } from 'svelte/store';
import { pb } from '../pocketbase.js';
import type { User } from '../../generated/types.js';

// Auth state store
export const authStore = writable<{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}>({
  user: null,
  isAuthenticated: false,
  isLoading: true
});

// Derived stores
export const user = derived(authStore, ($auth) => $auth.user);
export const isAuthenticated = derived(authStore, ($auth) => $auth.isAuthenticated);
export const isLoading = derived(authStore, ($auth) => $auth.isLoading);

// Auth actions
export const authActions = {
  async login(email: string, password: string) {
    try {
      const user = await pb.login(email, password);
      authStore.update(state => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
      return { success: true, user };
    } catch (error) {
      authStore.update(state => ({
        ...state,
        isLoading: false
      }));
      return { success: false, error: error.message };
    }
  },

  async signup(email: string, password: string, name: string) {
    try {
      const user = await pb.signup(email, password, name);
      authStore.update(state => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
      return { success: true, user };
    } catch (error) {
      authStore.update(state => ({
        ...state,
        isLoading: false
      }));
      return { success: false, error: error.message };
    }
  },

  async logout() {
    await pb.logout();
    authStore.update(state => ({
      ...state,
      user: null,
      isAuthenticated: false,
      isLoading: false
    }));
  },

  // Initialize auth state
  async init() {
    if (pb.isAuthenticated) {
      authStore.update(state => ({
        ...state,
        user: pb.currentUser,
        isAuthenticated: true,
        isLoading: false
      }));
    } else {
      authStore.update(state => ({
        ...state,
        isLoading: false
      }));
    }
  }
};

// Initialize auth on app start
authActions.init();
```

### src/lib/stores/posts.ts
```typescript
import { writable, derived } from 'svelte/store';
import { pb } from '../pocketbase.js';
import type { Post } from '../../generated/types.js';

// Posts state store
export const postsStore = writable<{
  posts: Post[];
  isLoading: boolean;
  error: string | null;
}>({
  posts: [],
  isLoading: false,
  error: null
});

// Derived stores
export const posts = derived(postsStore, ($posts) => $posts.posts);
export const postsLoading = derived(postsStore, ($posts) => $posts.isLoading);
export const postsError = derived(postsStore, ($posts) => $posts.error);

// Posts actions
export const postsActions = {
  async loadPosts() {
    postsStore.update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const posts = await pb.getPosts();
      postsStore.update(state => ({
        ...state,
        posts,
        isLoading: false
      }));
    } catch (error) {
      postsStore.update(state => ({
        ...state,
        error: error.message,
        isLoading: false
      }));
    }
  },

  async createPost(data: Partial<Post>) {
    try {
      const newPost = await pb.createPost(data);
      postsStore.update(state => ({
        ...state,
        posts: [newPost, ...state.posts]
      }));
      return { success: true, post: newPost };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updatePost(id: string, data: Partial<Post>) {
    try {
      const updatedPost = await pb.updatePost(id, data);
      postsStore.update(state => ({
        ...state,
        posts: state.posts.map(post => 
          post.id === id ? updatedPost : post
        )
      }));
      return { success: true, post: updatedPost };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deletePost(id: string) {
    try {
      await pb.deletePost(id);
      postsStore.update(state => ({
        ...state,
        posts: state.posts.filter(post => post.id !== id)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
```

### src/lib/components/auth/LoginForm.svelte
```svelte
<script lang="ts">
  import { authActions } from '../../stores/auth.js';
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';

  let email = '';
  let password = '';
  let isLoading = false;
  let error = '';

  async function handleSubmit() {
    if (!email || !password) return;
    
    isLoading = true;
    error = '';
    
    const result = await authActions.login(email, password);
    
    if (!result.success) {
      error = result.error;
    }
    
    isLoading = false;
  }
</script>

<div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
  <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
  
  {#if error}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-4">
      <Input
        type="email"
        bind:value={email}
        placeholder="Email"
        required
        disabled={isLoading}
      />
    </div>
    
    <div class="mb-6">
      <Input
        type="password"
        bind:value={password}
        placeholder="Password"
        required
        disabled={isLoading}
      />
    </div>
    
    <Button
      type="submit"
      disabled={isLoading || !email || !password}
      class="w-full"
    >
      {isLoading ? 'Logging in...' : 'Login'}
    </Button>
  </form>
</div>
```

### src/lib/components/posts/PostCard.svelte
```svelte
<script lang="ts">
  import type { Post } from '../../../generated/types.js';
  import { postsActions } from '../../stores/posts.js';
  import Button from '../ui/Button.svelte';

  export let post: Post;
  export let showActions = false;

  async function handleDelete() {
    if (confirm('Are you sure you want to delete this post?')) {
      await postsActions.deletePost(post.id);
    }
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6 mb-4">
  <div class="flex justify-between items-start mb-4">
    <h3 class="text-xl font-semibold text-gray-900">{post.title}</h3>
    {#if showActions}
      <Button
        variant="danger"
        size="sm"
        on:click={handleDelete}
      >
        Delete
      </Button>
    {/if}
  </div>
  
  <div class="prose max-w-none mb-4">
    {@html post.content}
  </div>
  
  <div class="flex justify-between items-center text-sm text-gray-500">
    <span>By {post.expand?.author?.name || 'Unknown'}</span>
    <span>{new Date(post.created).toLocaleDateString()}</span>
  </div>
  
  {#if post.tags && post.tags.length > 0}
    <div class="mt-3 flex flex-wrap gap-2">
      {#each post.tags as tag}
        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {tag}
        </span>
      {/each}
    </div>
  {/if}
</div>
```

### src/routes/+page.svelte
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { posts, postsLoading, postsError, postsActions } from '$lib/stores/posts.js';
  import { isAuthenticated } from '$lib/stores/auth.js';
  import PostCard from '$lib/components/posts/PostCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  onMount(() => {
    postsActions.loadPosts();
  });
</script>

<svelte:head>
  <title>My Svelte App</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Latest Posts</h1>
    
    {#if $isAuthenticated}
      <Button href="/posts/create">
        Create Post
      </Button>
    {/if}
  </div>

  {#if $postsLoading}
    <div class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading posts...</p>
    </div>
  {:else if $postsError}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error loading posts: {$postsError}
    </div>
  {:else if $posts.length === 0}
    <div class="text-center py-8">
      <p class="text-gray-600">No posts yet. Create the first one!</p>
    </div>
  {:else}
    <div class="space-y-6">
      {#each $posts as post (post.id)}
        <PostCard {post} showActions={$isAuthenticated} />
      {/each}
    </div>
  {/if}
</div>
```

## 🔧 Configuration Files

### vite.config.js
```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 3000,
    host: true
  },
  define: {
    'import.meta.env.VITE_POCKETBASE_URL': JSON.stringify(process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')
  }
});
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

### .env
```bash
# PocketBase Configuration
VITE_POCKETBASE_URL=http://127.0.0.1:8090

# Development
NODE_ENV=development
```

## 🚀 Development Workflow

### 1. Start Development Servers
```bash
# Start both PocketVex and SvelteKit dev servers
npm run dev

# Or start them separately
npm run dev:once  # PocketVex schema sync
npm run dev       # SvelteKit dev server
```

### 2. Schema Development
```typescript
// Edit schema files
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

### 3. Type Generation
```bash
# Generate TypeScript types from schema
npm run types:generate

# Types are automatically updated in generated/types.ts
# Import them in your Svelte components
import type { User, Post } from '../../generated/types.js';
```

### 4. Frontend Development
```svelte
<!-- Use generated types in Svelte components -->
<script lang="ts">
  import type { Post } from '../../generated/types.js';
  
  export let post: Post;
</script>

<div class="post-card">
  <h3>{post.title}</h3>
  <p>{post.content}</p>
</div>
```

## 📦 Build & Deployment

### 1. Build for Production
```bash
# Generate types and build Svelte app
npm run build
```

### 2. Deploy
```bash
# Deploy to your hosting platform
npm run preview  # Test production build locally
```

## 🔄 Real-time Features

### 1. Schema Changes
- PocketVex watches schema files
- Automatically applies safe changes
- Generates migrations for unsafe changes
- Updates TypeScript types

### 2. Frontend Updates
- SvelteKit hot reload for UI changes
- PocketBase real-time subscriptions
- Automatic type updates from schema changes

### 3. Development Experience
- Single command to start both servers
- Automatic type generation
- Real-time schema synchronization
- Hot reload for frontend changes

## 📚 Best Practices

### 1. Schema Organization
- Keep schema files in `/schema` directory
- Use TypeScript for type safety
- Generate types before building

### 2. Frontend Architecture
- Use Svelte stores for state management
- Separate concerns (auth, posts, UI)
- Leverage generated types throughout

### 3. Development Workflow
- Start with schema design
- Generate types
- Build frontend components
- Test with real data

### 4. Deployment
- Build types before deployment
- Use environment variables for configuration
- Deploy schema changes first
- Then deploy frontend

This structure provides a complete Svelte frontend setup with PocketVex for schema management! 🚀
