import PocketBase from 'pocketbase'

const url = (import.meta as any).env?.VITE_PB_URL ?? 'https://pocketvex.pockethost.io'

export const pb = new PocketBase(url)

