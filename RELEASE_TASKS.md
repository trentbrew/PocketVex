# PocketVex Release Checklist (npm)

R001 — Preflight audit
- Ensure Node >= 18 and npm >= 9
- Confirm package metadata: `cat package.json | jq '{name, version, exports, bin, files, engines}'`
- Expect:
  - `bin.pocketvex` -> `dist/cli/index.js`
  - exports: `"."`, `"./types"`, `"./cli"`
  - files: `dist`, `README.md`, `LICENSE`

R002 — Clean build (types for stable surfaces)
- Run: `bun run build`
- Pass criteria:
  - `dist/lib.js` present
  - `dist/lib.d.ts` present
  - `dist/cli/index.js` present and first line is `#!/usr/bin/env node`
  - `dist/types/pocketbase-js.{js,d.ts}` present

R003 — CLI smoke test
- Run: `node dist/cli/index.js help`
- Expect a help banner without errors.

R004 — Pack dry-run
- Run: `npm pack --dry-run --json | jq '.[0].files[].path'`
- Expect only:
  - `LICENSE`, `README.md`
  - `dist/cli/index.js`, `dist/lib.js`, `dist/lib.d.ts`
  - `dist/types/pocketbase-js.{js,d.ts}`
  - `dist/utils/{diff,rules}.d.ts`, `dist/types/schema.d.ts`

R005 — Local install test (temp dir)
- Commands:
  - `TMP=$(mktemp -d)`
  - `npm pack --json | jq -r '.[0].filename' > /tmp/pkg.tgz`
  - `cd "$TMP" && npm init -y >/dev/null && npm i /tmp/$(cat /tmp/pkg.tgz)`
  - `npx pocketvex help`
- Expect CLI to run.

R006 — Library import smoke
- ESM quick check:
  - `node --input-type=module -e "import('pocketvex').then(m=>console.log(Object.keys(m)))"`
- Expect keys to include: `SchemaDiff`, `Rules`, `PBRules`.

R007 — Version bump
- Choose semver (e.g., `1.0.0` -> `1.0.1` if needed)
- Edit `package.json` -> `version`

R008 — Publish
- `npm publish --access public`

R009 — Post-publish verification
- `npm info pocketvex version`
- Fresh project test: `npm init -y && npm i pocketvex && npx pocketvex help`

R010 — Docs polish
- README: Ensure Quick Start (CLI + schema apply), env vars, PocketHost cron note.
- Add a short CHANGELOG summary for this release.

Notes
- Declarations included for stable surfaces: types, Rules, SchemaDiff.
- CLI is built for Node (no Bun required). Shebang patched during build.
- Future: add typed exports for PocketBaseClient/DevServer in a minor release.

