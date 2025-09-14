import type PocketBase from 'pocketbase'

export type ListParams = {
  page?: number
  perPage?: number
  filter?: string
  sort?: string
  expand?: string | string[]
}

export async function listRecords<T = any>(
  pb: PocketBase,
  collection: string,
  { page = 1, perPage = 50, ...rest }: ListParams = {}
) {
  return pb.collection(collection).getList<T>(page, perPage, rest as any)
}

export function subscribeToRecords<T = any>(
  pb: PocketBase,
  collection: string,
  topic: string | '*' = '*',
  handler: (e: { action: 'create' | 'update' | 'delete'; record: T }) => void
) {
  return pb.collection(collection).subscribe(topic as any, handler as any)
}

export async function getRecord<T = any>(pb: PocketBase, collection: string, id: string, opts?: any) {
  return pb.collection(collection).getOne<T>(id, opts)
}

export async function createRecord<T = any>(pb: PocketBase, collection: string, data: Partial<T>) {
  return pb.collection(collection).create<T>(data as any)
}

export async function updateRecord<T = any>(pb: PocketBase, collection: string, id: string, data: Partial<T>) {
  return pb.collection(collection).update<T>(id, data as any)
}

export async function deleteRecord(pb: PocketBase, collection: string, id: string) {
  return pb.collection(collection).delete(id)
}

