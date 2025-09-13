import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 3000,
    host: true
  },
  define: {
    'import.meta.env.VITE_POCKETBASE_URL': JSON.stringify(process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')
  }
});
