## x.y.z

- Added: `pocketvex/config` subpath export and `defineConfig` helper.
- Added: Strict schema unions at `pocketvex/types/schema-strict` (opt-in).
- Added: `Migration` typing at `pocketvex/types/migration` ({ sql, op } ctx).
- Changed: Default docs & commands now use Node-based CLI (`npx pocketvex`).
- Packaging: Emits JS + d.ts for config/types; CLI shebang targets Node.

