<script setup
        lang="ts">
            import { ref, onMounted } from 'vue'

            // Use Nuxt's useState for better SSR compatibility
            const posts = useState('posts', () => [])
            const loading = useState('loading', () => false)
            const connected = useState('connected', () => false)
            const error = useState('error', () => null)

            const title = ref('')
            const content = ref('')
            const published = ref(false)
            const creating = ref(false)

            // Initialize PocketBase connection
            onMounted(async () => {
                try {
                    const { default: PocketBase } = await import('pocketbase')
                    const pb = new PocketBase('https://pocketvex.pockethost.io')

                    // Set up realtime connection
                    pb.collection('posts').subscribe('*', () => {
                        refresh()
                    })

                    connected.value = true
                    await refresh()
                } catch (error) {
                    console.error('Failed to initialize PocketBase:', error)
                    error.value = 'Failed to connect to PocketBase'
                }
            })

            async function refresh() {
                try {
                    loading.value = true
                    error.value = null
                    const { default: PocketBase } = await import('pocketbase')
                    const pb = new PocketBase('https://pocketvex.pockethost.io')
                    const result = await pb.collection('posts').getList(1, 50, { sort: '-created' })
                    posts.value = result.items
                } catch (err) {
                    console.error('Failed to refresh posts:', err)
                    error.value = 'Failed to load posts'
                } finally {
                    loading.value = false
                }
            }

            function handleRefresh() {
                refresh()
            }

            function handleSubmit(event: Event) {
                event.preventDefault()
                submit()
            }

            async function submit() {
                if (!title.value && !content.value) return

                creating.value = true
                try {
                    const { default: PocketBase } = await import('pocketbase')
                    const pb = new PocketBase('https://pocketvex.pockethost.io')
                    await pb.collection('posts').create({
                        title: title.value,
                        content: content.value,
                        published: published.value
                    })
                    title.value = ''
                    content.value = ''
                    published.value = false
                    await refresh()
                } catch (err) {
                    console.error('Failed to create post:', err)
                    error.value = 'Failed to create post'
                } finally {
                    creating.value = false
                }
            }
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="border-b bg-white shadow-sm">
            <div class="container mx-auto px-4 py-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">PocketVex Demo</h1>
                        <p class="text-gray-600 mt-2">Real-time posts with PocketBase integration</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span :class="connected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                            class="px-2 py-1 text-sm rounded">
                            {{ connected ? 'Connected' : 'Connecting...' }}
                        </span>
                        <a href="/" class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8">
            <div class="max-w-4xl mx-auto space-y-6">
                <!-- Create Post Form -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-xl font-semibold mb-4">Create New Post</h2>
                    <p class="text-gray-600 mb-4">Add a new post to the database</p>
                    <form @submit="handleSubmit" class="space-y-4">
                        <div class="space-y-2">
                            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                            <input id="title" v-model="title" placeholder="Enter post title"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div class="space-y-2">
                            <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
                            <textarea id="content" v-model="content" placeholder="Enter post content" rows="4"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <div class="flex items-center space-x-2">
                            <input id="published" type="checkbox" v-model="published" class="rounded" />
                            <label for="published" class="text-sm text-gray-700">Published</label>
                        </div>
                        <div class="flex gap-2">
                            <button type="submit" :disabled="creating"
                                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                                <template v-if="creating">Creating...</template>
                                <template v-else>Create Post</template>
                            </button>
                            <button type="button" @click="handleRefresh" :disabled="loading"
                                class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50">
                                <template v-if="loading">Refreshing...</template>
                                <template v-else>Refresh</template>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Error Alert -->
                <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md">
                    <h4 class="font-semibold text-red-800">Error</h4>
                    <p class="text-red-700 mt-1">{{ error }}</p>
                </div>

                <!-- Posts List -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-xl font-semibold mb-4">Posts</h2>
                    <p class="text-gray-600 mb-4">{{ posts.length }} posts found</p>

                    <div v-if="loading" class="flex items-center justify-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <div v-else-if="posts.length === 0" class="text-center py-8 text-gray-500">
                        No posts yet. Create your first post above!
                    </div>
                    <div v-else class="space-y-4">
                        <div v-for="post in posts" :key="post.id" class="p-4 border border-gray-200 rounded-lg">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <h3 class="font-semibold text-lg text-gray-900">
                                        {{ post.title || '(Untitled)' }}
                                    </h3>
                                    <span
                                        :class="post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                                        class="px-2 py-1 text-sm rounded">
                                        {{ post.published ? 'Published' : 'Draft' }}
                                    </span>
                                </div>
                                <p v-if="post.content" class="text-gray-600">
                                    {{ post.content.replace(/<[^>]*>/g, '') }}
                                </p>
                                <div class="flex items-center justify-between text-sm text-gray-500">
                                    <span>ID: {{ post.id }}</span>
                                    <span>{{ new Date(post.created).toLocaleDateString() }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>

    /* Basic utility classes */
    .min-h-screen {
        min-height: 100vh;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .max-w-4xl {
        max-width: 56rem;
    }

    .space-y-2>*+* {
        margin-top: 0.5rem;
    }

    .space-y-4>*+* {
        margin-top: 1rem;
    }

    .space-y-6>*+* {
        margin-top: 1.5rem;
    }

    .flex {
        display: flex;
    }

    .items-center {
        align-items: center;
    }

    .justify-between {
        justify-content: space-between;
    }

    .justify-center {
        justify-content: center;
    }

    .gap-2 {
        gap: 0.5rem;
    }

    .p-4 {
        padding: 1rem;
    }

    .p-6 {
        padding: 1.5rem;
    }

    .px-2 {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }

    .px-3 {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
    }

    .px-4 {
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .py-1 {
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
    }

    .py-2 {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }

    .py-6 {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
    }

    .py-8 {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }

    .mt-1 {
        margin-top: 0.25rem;
    }

    .mt-2 {
        margin-top: 0.5rem;
    }

    .mb-4 {
        margin-bottom: 1rem;
    }

    .text-sm {
        font-size: 0.875rem;
        line-height: 1.25rem;
    }

    .text-lg {
        font-size: 1.125rem;
        line-height: 1.75rem;
    }

    .text-xl {
        font-size: 1.25rem;
        line-height: 1.75rem;
    }

    .text-3xl {
        font-size: 1.875rem;
        line-height: 2.25rem;
    }

    .font-medium {
        font-weight: 500;
    }

    .font-semibold {
        font-weight: 600;
    }

    .font-bold {
        font-weight: 700;
    }

    .text-gray-500 {
        color: rgb(107 114 128);
    }

    .text-gray-600 {
        color: rgb(75 85 99);
    }

    .text-gray-700 {
        color: rgb(55 65 81);
    }

    .text-gray-800 {
        color: rgb(31 41 55);
    }

    .text-gray-900 {
        color: rgb(17 24 39);
    }

    .text-green-800 {
        color: rgb(22 101 52);
    }

    .text-yellow-800 {
        color: rgb(133 77 14);
    }

    .text-red-700 {
        color: rgb(185 28 28);
    }

    .text-red-800 {
        color: rgb(153 27 27);
    }

    .text-white {
        color: rgb(255 255 255);
    }

    .bg-white {
        background-color: rgb(255 255 255);
    }

    .bg-gray-50 {
        background-color: rgb(249 250 251);
    }

    .bg-gray-100 {
        background-color: rgb(243 244 246);
    }

    .bg-green-100 {
        background-color: rgb(220 252 231);
    }

    .bg-yellow-100 {
        background-color: rgb(254 249 195);
    }

    .bg-red-50 {
        background-color: rgb(254 242 242);
    }

    .bg-blue-600 {
        background-color: rgb(37 99 235);
    }

    .border {
        border-width: 1px;
    }

    .border-b {
        border-bottom-width: 1px;
    }

    .border-gray-200 {
        border-color: rgb(229 231 235);
    }

    .border-gray-300 {
        border-color: rgb(209 213 219);
    }

    .border-red-200 {
        border-color: rgb(254 202 202);
    }

    .rounded {
        border-radius: 0.25rem;
    }

    .rounded-md {
        border-radius: 0.375rem;
    }

    .rounded-lg {
        border-radius: 0.5rem;
    }

    .rounded-full {
        border-radius: 9999px;
    }

    .shadow {
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }

    .shadow-sm {
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    .hover\:bg-blue-700:hover {
        background-color: rgb(29 78 216);
    }

    .hover\:bg-gray-50:hover {
        background-color: rgb(249 250 251);
    }

    .focus\:outline-none:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
    }

    .focus\:ring-2:focus {
        --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
        --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
        box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
    }

    .focus\:ring-blue-500:focus {
        --tw-ring-color: rgb(59 130 246);
    }

    .disabled\:opacity-50:disabled {
        opacity: 0.5;
    }

    .block {
        display: block;
    }

    .w-full {
        width: 100%;
    }

    .h-8 {
        height: 2rem;
    }

    .w-8 {
        width: 2rem;
    }

    .border-b-2 {
        border-bottom-width: 2px;
    }

    .border-blue-600 {
        border-color: rgb(37 99 235);
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }

    .space-x-2>*+* {
        margin-left: 0.5rem;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }
</style>
