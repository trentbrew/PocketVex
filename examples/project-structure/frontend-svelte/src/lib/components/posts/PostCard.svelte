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
      <Button variant="danger" size="sm" on:click={handleDelete}>Delete</Button>
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
