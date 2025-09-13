## [1.0.2] - 2025-01-27

### Added

- **Auto-Directory Creation**: Dev server now automatically creates project directory structure
- **Zero Setup Experience**: Just run `npx pocketvex dev` and it creates all necessary directories
- **Project Structure Display**: Shows created directories and project layout on startup
- **Convex-like Experience**: Similar to `npx convex dev` - no manual directory setup required

### Changed

- Dev server now creates: `pocketvex/schema/`, `pocketvex/jobs/`, `pocketvex/hooks/`, `pocketvex/commands/`, `pocketvex/queries/`, `pocketvex/migrations/`, `generated/`
- Improved user onboarding with automatic project scaffolding

## [1.0.1] - 2025-01-27

### Added

- `pocketvex/config` subpath export and `defineConfig` helper
- Strict schema unions at `pocketvex/types/schema-strict` (opt-in)
- `Migration` typing at `pocketvex/types/migration` ({ sql, op } ctx)

### Changed

- Default docs & commands now use Node-based CLI (`npx pocketvex`)
- Packaging: Emits JS + d.ts for config/types; CLI shebang targets Node
