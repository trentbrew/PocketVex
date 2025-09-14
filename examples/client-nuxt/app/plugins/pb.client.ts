import PocketBase from 'pocketbase'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const pb = new PocketBase(config.public.pbUrl)
  nuxtApp.provide('pb', pb)
  if (process.dev) console.info('[nuxt] PocketBase URL:', config.public.pbUrl)
})

declare module '#app' {
  interface NuxtApp { $pb: import('pocketbase').default }
}
declare module 'vue' {
  interface ComponentCustomProperties { $pb: import('pocketbase').default }
}
