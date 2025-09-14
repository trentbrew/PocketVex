<script lang="ts">
	import { onMount } from 'svelte';
	import { pb } from '$lib/pb';
	import {
		listPosts,
		subscribeToPosts,
		createPost as pvCreate,
		type Post
	} from '../pocketvex/posts';

	// Using shared Post type from pocketvex module

	let connected = $state(false);
	let loading = $state(true);
	let error: string | undefined = $state(undefined);
	let posts: Post[] = $state([]);
	let title = $state('');
	let content = $state('');
	let published = $state(false);
	let creating = $state(false);

	onMount(() => {
		let unsubscribe: undefined | (() => void);
		(async () => {
			try {
				loading = true;
				error = undefined;
				const list = await listPosts(pb);
				posts = list.items;

				unsubscribe = await subscribeToPosts(pb, (e: any) => {
					const record = e.record as Post;
					if (e.action === 'create') {
						posts = [record, ...posts];
					} else if (e.action === 'update') {
						posts = posts.map((p) => (p.id === record.id ? record : p));
					} else if (e.action === 'delete') {
						posts = posts.filter((p) => p.id !== record.id);
					}
				});

				connected = true;
			} catch (err: any) {
				error = err?.message ?? String(err);
			} finally {
				loading = false;
			}
		})();

		return () => {
			try {
				if (unsubscribe) unsubscribe();
				else pb.collection('posts').unsubscribe('*');
			} catch {}
		};
	});

	async function refresh() {
		try {
			loading = true;
			const list = await listPosts(pb);
			posts = list.items;
		} catch (err: any) {
			error = err?.message ?? String(err);
		} finally {
			loading = false;
		}
	}

	async function submit() {
		if (!title && !content) return;
		try {
			creating = true;
			await pvCreate(pb, { title, content, published });
			title = '';
			content = '';
			published = false;
		} catch (err: any) {
			error = err?.response?.message ?? err?.message ?? String(err);
			console.error('createPost failed:', err);
		} finally {
			creating = false;
		}
	}
</script>

<svelte:head>
	<title>PocketVex Demo</title>
</svelte:head>

<div
	style="max-width: 720px; margin: 24px auto; padding: 16px; font: 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto;"
>
	<div
		style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px;"
	>
		<h1 style="font-size: 18px; font-weight: 600;">PocketVex Demo (posts)</h1>
		<span style="color: {error ? '#dc2626' : connected ? '#16a34a' : '#eab308'};">
			{#if error}
				Realtime: failed
			{:else if connected}
				Realtime: connected
			{:else}
				Realtime: connecting…
			{/if}
		</span>
	</div>

	<div style="display:flex; gap: 8px; margin-bottom: 12px;">
		<button
			on:click={refresh}
			disabled={loading}
			style="padding:6px 10px; border:1px solid #d1d5db; border-radius: 6px;"
		>
			{loading ? 'Refreshing…' : 'Refresh'}
		</button>
	</div>

	<form
		on:submit|preventDefault={submit}
		style="display:flex; flex-direction:column; gap:8px; padding: 12px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:12px;"
	>
		<div style="font-size: 13px; font-weight: 600;">Create Post</div>
		<input
			placeholder="Title"
			bind:value={title}
			style="padding:6px 8px; border:1px solid #d1d5db; border-radius:6px; background: transparent;"
		/>
		<textarea
			placeholder="Content"
			bind:value={content}
			rows={3}
			style="padding:6px 8px; border:1px solid #d1d5db; border-radius:6px; background: transparent;"
		></textarea>
		<label style="display:inline-flex; align-items:center; gap:6px; font-size:13px;">
			<input type="checkbox" bind:checked={published} /> Published
		</label>
		<div style="display:flex; gap:8px;">
			<button
				type="submit"
				disabled={creating}
				style="padding:6px 10px; border:1px solid #d1d5db; border-radius: 6px;"
			>
				{creating ? 'Creating…' : 'Create'}
			</button>
		</div>
	</form>

	{#if error}
		<p style="color:#dc2626;">Error: {error}</p>
	{/if}

	<ul style="display:flex; flex-direction:column; gap:8px;">
		{#each posts as p (p.id)}
			<li style="border:1px solid #e5e7eb; border-radius: 8px; padding: 10px;">
				<div style="font-weight: 600;">{p.title ?? '(untitled)'}</div>
				{#if p.content}
					<div style="color:#6b7280; font-size: 13px; margin-top: 2px;">
						{p.content.replace(/<[^>]*>/g, '')}
					</div>
				{/if}
				<div style="color:#6b7280; font-size: 12px; margin-top: 4px;">
					{p.published ? 'Published' : 'Draft'} · {p.id}
				</div>
			</li>
		{/each}
		{#if !loading && posts.length === 0}
			<li style="color:#6b7280; font-size: 13px;">No posts yet.</li>
		{/if}
	</ul>

	<p style="color:#6b7280; font-size:12px; margin-top:12px;">
		PocketBase URL: {(import.meta as any).env?.VITE_PB_URL ?? 'https://pocketvex.pockethost.io'}
	</p>
</div>
