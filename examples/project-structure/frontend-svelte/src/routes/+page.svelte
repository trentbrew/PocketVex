<script lang="ts">
  import { onMount } from 'svelte';
  import {
    posts,
    postsLoading,
    postsError,
    postsActions,
  } from '$lib/stores/posts.js';
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
      <Button href="/posts/create">Create Post</Button>
    {/if}
  </div>

  {#if $postsLoading}
    <div class="text-center py-8">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
      <p class="mt-2 text-gray-600">Loading posts...</p>
    </div>
  {:else if $postsError}
    <div
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
    >
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
