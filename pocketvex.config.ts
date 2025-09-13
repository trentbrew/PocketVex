// Example PocketVex config (not used by the current loader yet)
// Consumers can copy this file to their project root and tweak.
import { defineConfig } from 'pocketvex/config';

export default defineConfig({
  hosts: [
    { name: 'local', url: 'http://127.0.0.1:8090' },
    { name: 'live', url: 'https://pocketvex.pockethost.io' },
  ],
  defaultHost: 'local',
  schema: ['./pocketvex/schema/**/*.ts'],
  watch: [
    'pocketvex/schema/**/*.ts',
    'pocketvex/jobs/**/*.js',
    'pocketvex/hooks/**/*.js',
    'pocketvex/commands/**/*.js',
    'pocketvex/queries/**/*.js',
  ],
  types: { outDir: './generated', clientFile: 'api-client.ts' },
  migrations: { outDir: './pocketvex/migrations', idPrefix: 'pvx_' },
  vm: { mode: 'local-copy', restart: 'graceful' },
});

