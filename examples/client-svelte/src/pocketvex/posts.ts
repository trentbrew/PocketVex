import type PocketBase from 'pocketbase'
import { listRecords, subscribeToRecords, createRecord } from './records'

export type Post = {
  id: string
  title?: string
  content?: string
  published?: boolean
  created?: string
  updated?: string
}

export async function listPosts(pb: PocketBase) {
  return await listRecords<Post>(pb, 'posts', { sort: '-created' })
}

export function subscribeToPosts(pb: PocketBase, handler: (e: { action: 'create' | 'update' | 'delete'; record: Post }) => void) {
  return subscribeToRecords<Post>(pb, 'posts', '*', handler)
}

export async function createPost(pb: PocketBase, data: { title?: string; content?: string; published?: boolean }) {
  return await createRecord<Post>(pb, 'posts', data)
}
