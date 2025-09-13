## Next Minor (typed API + safety)

### New typed exports (no breaking changes)
- `pocketvex/client` → `PocketBaseClient` (auth, schema fetch/apply, plan execution)
- `pocketvex/dev` → `DevServer` (watch, apply safe ops, types emit, VM mode)

### Host state + guardrails
- Per-host state file: `{ schemaHash, pbVersion, lastApplied, migrations[] }`
- Refuse destructive ops on unknown hosts unless `--yes`
- Version gates for PB features (e.g., `editor`) with clear errors

### Planner tiers
- Plan: `safe | assisted | unsafe`
- Assisted transforms: rename/backfill/swap; confirm flag required

### Credentials
- Prefer OS keychain (keytar) with JSON fallback; document both

### CLI additions
- `pocketvex plan` (colorized plan)
- `pocketvex doctor` (env checks)
- `pocketvex protect` (allowlist patterns)
- `pocketvex vm pack/push` (remote-friendly)

### Docs
- API refs for `client`, `dev`, `Migration`, `SchemaFieldStrict`
- “Prod safety” page (host guards, backups, rollback)

