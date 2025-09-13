---
description: Generate an actionable, dependency-ordered release checklist for publishing this repo to npm.
---

Given the repository state and the goal “publish to npm”, do this:

1) Preflight audit (read-only):
   - Parse package.json (name, version, exports, bin, engines, files, scripts).
   - List entrypoints that must exist at publish time:
     - `dist/lib.js`, `dist/lib.d.ts`
     - `dist/cli/index.js` (bin)
     - `dist/types/pocketbase-js.js`, `dist/types/pocketbase-js.d.ts`
   - Note any missing files or mismatches.

2) Build and typecheck tasks:
   - Task: Run `bun run build`.
   - If TypeScript declaration build fails, add fix tasks grouped by file, with concrete error lines and proposed minimal fixes (or a fallback: disable declarations for the first release and create tracked TODOs).
   - Task: Smoke test CLI: `node dist/cli/index.js help`.

3) Packaging validation:
   - Task: `npm pack --dry-run` and capture the file list.
   - Verify only intended files are included (dist, README.md, LICENSE).
   - Verify `bin` resolves and is executable after pack.

4) Runtime sanity tasks:
   - Task: Local install test in a temp dir (`npm init -y && npm i <tgz> && npx pocketvex help`).
   - Task: Library import test (ESM): `node -e "import('pocketvex').then(m=>console.log(Object.keys(m)))"` using a `node --input-type=module` variant.

5) Docs & metadata:
   - Task: Update README with Quick Start (CLI + schema apply), env vars, and limitations (PocketHost cron notes).
   - Task: Add CHANGELOG or release notes stub.

6) Versioning & publish:
   - Task: Decide version (semver), bump in package.json.
   - Task: `npm publish --access public` (guarded/manual step).
   - Task: Create git tag and GitHub release (optional).

7) Post-publish validation:
   - Task: `npm info pocketvex` sanity.
   - Task: Fresh project install and CLI smoke test.

Output format:
- Create `/RELEASE_TASKS.md` with numbered tasks (R001, R002, …), each including:
  - Command(s) to run
  - Expected outputs / pass criteria
  - Dependencies (if any)
  - [P] marker for tasks safe to run in parallel

Context for task generation: $ARGUMENTS

The checklist should be immediately executable by an engineer tonight to publish confidently, with clear fallbacks where strict typing blocks the path.
