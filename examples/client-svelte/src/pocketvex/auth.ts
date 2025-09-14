import type PocketBase from 'pocketbase'

export async function loginWithPassword(pb: PocketBase, email: string, password: string) {
  return pb.collection('users').authWithPassword(email, password)
}

export function logout(pb: PocketBase) {
  pb.authStore.clear()
}

export function getCurrentUser<T = any>(pb: PocketBase) {
  return pb.authStore.model as T | null
}

export function isAuthed(pb: PocketBase) {
  return !!pb.authStore.token && !!pb.authStore.model
}

export async function refresh(pb: PocketBase) {
  if (!pb.authStore.isValid) return
  return pb.collection('users').authRefresh()
}

