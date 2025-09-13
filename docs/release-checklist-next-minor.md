## PocketVex Next Minor Release Checklist

Goal: add typed public APIs and guardrails without breaking current users.

### 1) Typed public APIs (add new subpaths)
- [ ] Export `PocketBaseClient` from `pocketvex/client`
  - Auth, fetch current schema, apply plan (safe/assisted), rule updates
  - JSDoc + d.ts
- [ ] Export `DevServer` from `pocketvex/dev`
  - Watch schema + JS VM files, apply safe ops, emit types, optional VM modes
  - JSDoc + d.ts

### 2) Host state + safety
- [ ] Add per-host state file `{ schemaHash, pbVersion, lastApplied, migrations[] }`
- [ ] Add `--yes` guard for destructive ops on unknown hosts
- [ ] Add PB version gates with clear errors for features (e.g., editor)

### 3) Planner tiers
- [ ] Extend plan to `safe | assisted | unsafe`
- [ ] Implement assisted transforms (rename/backfill/swap)
- [ ] CLI confirmation flags for assisted steps

### 4) Credentials
- [ ] Prefer OS keychain via `keytar`; fallback to JSON cache
- [ ] Docs: how to clear or rotate creds

### 5) CLI additions
- [ ] `pocketvex plan` (colorized plan with tiers)
- [ ] `pocketvex doctor` (host version, perms, rate-limit hints)
- [ ] `pocketvex protect` (allowlist patterns per env)
- [ ] `pocketvex vm pack` and `vm push --ssh` (remote friendly)

### 6) Docs & examples
- [ ] README: API refs for `client`, `dev`, `Migration`, `SchemaFieldStrict`
- [ ] Guide: “Prod safety” (backups, rollback, host guards)
- [ ] Example: assisted rename/backfill migration

### 7) Packaging & tests
- [ ] Ensure `exports` includes new subpaths with JS + d.ts
- [ ] `npm run check:pack` is green; local install smoke tests pass
- [ ] Minimal e2e: spawn PB, apply sample schema, diff, migrate, rollback

