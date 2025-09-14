import { defineStore } from 'pinia'
import { listPosts as pvList, subscribeToPosts as pvSubscribe, createPost as pvCreate, type Post } from '~/pocketvex/posts'

export const usePocketVexStore = defineStore('pocketvex', () => {
  const connected = ref(false)
  const loading = ref(false)
  const error = ref<string | undefined>()
  const posts = ref<Post[]>([])

  async function init() {
    if (connected.value) return
    const { $pb } = useNuxtApp()
    try {
      loading.value = true
      error.value = undefined
      const list = await pvList($pb)
      posts.value = list.items
      pvSubscribe($pb, (e: any) => {
        const record: Post = e.record
        if (e.action === 'create') posts.value = [record, ...posts.value]
        else if (e.action === 'update') posts.value = posts.value.map((p) => (p.id === record.id ? record : p))
        else if (e.action === 'delete') posts.value = posts.value.filter((p) => p.id !== record.id)
      })
      connected.value = true
    } catch (err: any) {
      error.value = err?.message ?? String(err)
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    const { $pb } = useNuxtApp()
    try {
      loading.value = true
      const list = await pvList($pb)
      posts.value = list.items
    } catch (err: any) {
      error.value = err?.message ?? String(err)
    } finally {
      loading.value = false
    }
  }

  async function createPost(data: { title?: string; content?: string; published?: boolean }) {
    const { $pb } = useNuxtApp()
    try {
      loading.value = true
      await pvCreate($pb, data)
    } catch (err: any) {
      error.value = err?.response?.message ?? err?.message ?? String(err)
      console.error('createPost failed:', err)
    } finally {
      loading.value = false
    }
  }

  return { connected, loading, error, posts, init, refresh, createPost }
})
