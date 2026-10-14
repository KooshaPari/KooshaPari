# Canonical release readiness

**Prepared:** 2026-09-09
**Status:** FREEZE — local sync and review complete; no commit, push, Vercel connection, or deployment performed in this lane.

## Canonical checkout

- **Path:** `/Users/kooshapari/CodeProjects/Phenotype/repos/worktrees/KooshaPari-public-sync-20260909`
- **Branch:** `review/public-site-sync-20260909`
- **Remote:** `https://github.com/KooshaPari/KooshaPari.git` (not written)
- **Base:** `main` / `c87c7b63c1ca9a426e491a9aeb194a6df5a03de9`
- **Staged diff:** 70 paths, 2,734 insertions, 197 deletions.
- **Generated files:** `dist/`, `node_modules/`, `.vercel/`, and `output/playwright/acceptance/` remain untracked/generated and were not staged.
- **Protected paths:** no staged paths under `README.md`, `docs/`, `output/`, `recruiting-funnel/`, or `web-migration/`. `README.md` worktree and `HEAD` hashes both remain `2eff43f3235f631a6e91c1680113b0315656ab54`.

## Explicit transfer manifest

The staged set was assembled from explicit file paths, never with `git add .`, broad directory copying, or rsync. It includes the frozen gate/runtime files:

- `styles/construction-gate.css`
- `scripts/construction-gate.js`
- `scripts/construction-shell.js`
- `scripts/app.js`
- `scripts/stage-publication.js`
- `tests/construction-gate.test.js`
- `tests/browser/acceptance.spec.js`

It also includes the required related shell, route, data, runtime/media, test, configuration, and approved public asset files. Public binary additions are limited to six NetWeave WebP assets and the two approved ShareCLI recordings under `public/projects/`. No docs, output, recruiting funnel, web migration, asset-sources, ResVault, transcript exports, resume material, research/raw exports, `.vercel`, or dependency directories were copied or staged.

## Configuration contract

- `package.json` `stage:publication`: `node scripts/stage-publication.js`
- `vercel.json` `buildCommand`: `npm run stage:publication`
- `vercel.json` `outputDirectory`: `dist`

## Security review

The staged text diff was scanned for credential/private-material markers without outputting values. No actionable credential, secret, password, token, private-key, `.env`, ResVault, transcript export, resume-consolidation, or raw LinkedIn/research export material was found. The only match was benign visitor-facing copy containing the word `transcript`.

## Verification

- `npm ci`: passed; 25 packages added, 0 vulnerabilities.
- `npm run stage:publication`: passed; generated self-contained `dist` with 88 files and 16,139,335 bytes.
- `npm run check`: passed.
- Focused public unit suite: 54 passed, 0 failed.
- `npm run test:e2e`: passed; 9 browser tests passed, including root gate visibility, session dismissal persistence, no-JS Continue, deep project routes, and downloads.

`npm run verify` was attempted but stopped at the Vercel build step because this unlinked worktree was resolved as an invalid Vercel project name. Exact output was HTTP 400: “Project names can be up to 100 characters long and must be lowercase...” The same result occurred with `npx --no-install vercel build --yes --output .vercel/output`. No local Vercel link was created and no remote write occurred; linking remains deferred to the root deploy lane as instructed. The independent publication build, syntax checks, unit coverage, and browser acceptance suite passed.

## Freeze boundary

The canonical checkout is frozen for root release review. Do not commit, push, connect Git/Vercel, create a project, or deploy from this lane. Root may independently perform the separately authorized final public sync, Git/Vercel connection, and production release after reviewing this readiness record.
