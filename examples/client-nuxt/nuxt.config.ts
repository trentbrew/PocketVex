// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      // URL for the PocketBase instance used by plugins/components
      pbUrl: 'https://pocketvex.pockethost.io',
    },
  },
});
