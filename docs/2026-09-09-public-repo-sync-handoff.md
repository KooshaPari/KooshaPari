# Public-repository sync handoff

**Prepared:** 2026-09-09 (authorized local sync phase)  
**Status:** READY_FOR_FINAL_GATE_SYNC — stable public source staged locally on a review branch; no push, Vercel connection, deployment, or commit performed. Construction-gate files remain held until the explicit freeze handoff.

## Authorized local sync record

- **Review branch:** `review/public-site-sync-20260909` (based on canonical `main`; no commit created).
- **Stable transfer applied:** reviewed root HTML/assets/config, `blog/**/*.html`, `work/**/*.html` (only changed source files are visible in the diff), `styles/**/*.css` excluding `styles/construction-gate.css`, `data/posts.js` and `data/projects.js`, stable runtime component/media/view modules excluding mutable app/main/build/construction files, selected unit tests excluding build-output, metadata, recording, browser, and construction-gate tests, and the source `vercel.json` / package manifests.
- **Intentionally not transferred:** `scripts/app.js`, `scripts/main.js`, `scripts/stage-publication.js`, `scripts/construction-gate.js`, `scripts/construction-shell.js`, `styles/construction-gate.css`, `data/phenotype.js`, `server.js`, all local docs/reports, `output/`, `.vercel/`, `node_modules/`, browser tests, construction-gate tests, and the source `public/projects/{dss-cipher,gmk-arch,witf}` assets pending separate content/rights review or freeze approval. Existing remote copies of unrelated paths were not deleted.
- **Privacy/secrets review:** no private-key, API-key, secret, password, token, credential, `.env`, ResVault, transcript, resume-consolidation, raw LinkedIn, or research-export markers were found in admitted text classes. This is a marker scan, not approval of public biography, contact, employer, project, or recruiting-facing disclosures. Binary assets and terminal recordings require human content/rights review; no secret values were read or recorded.
- **Protected README:** SHA-256 remains `82dfae2c917e2e7297358478880e965ce97f3b0f2c11f295dcb5a30b1a4957b3`, identical to `main:README.md`.
- **Local diff:** 25 tracked paths changed, plus 34 untracked admitted paths; remote `README.md`, `docs/`, `output/`, `recruiting-funnel/`, and `web-migration/` show no diff. The complete path/hash manifest is stored outside the clone at `/Users/kooshapari/CodeProjects/Phenotype/repos/tmp_local/KooshaPari-public-sync-20260909-manifest.tsv`.
- **Build prerequisite:** the staged `package.json` references `scripts/stage-publication.js`, which is deliberately absent until construction freeze. Therefore `npm ci` may install the frozen lockfile, but the publication build cannot run in this phase and no browser/full verification was run while the gate worker owns those checks.
- **Vercel config:** staged `vercel.json` changes publication output from remote `.` to `dist` and adds `npm run stage:publication`; this is a material, review-required change and remains uncommitted.

## Next command after freeze handoff

After `docs/2026-09-09-construction-gate-implementation-handoff.md` explicitly states freeze, copy only the frozen gate files into this review branch, run the reviewed staged build and permitted QA, inspect `dist/`, then review the exact diff. Only after root release may a separate lane commit/push, connect the existing Vercel project, or deploy.


## Canonical repository snapshot

- **Clone:** `/Users/kooshapari/CodeProjects/Phenotype/repos/worktrees/KooshaPari-public-sync-20260909`
- **Origin:** `https://github.com/KooshaPari/KooshaPari.git`
- **Branch:** `main`
- **HEAD:** `c87c7b63c1ca9a426e491a9aeb194a6df5a03de9`
- **HEAD commit:** `docs: timestamp funnel dashboard verification` (`2026-09-04T01:19:17-07:00`)
- **Clone state:** clean; `main` tracks `origin/main` at the recorded SHA.
- **Existing root contract:** preserve the existing profile `README.md`, Git history, root layout, and unrelated remote content. The source workspace is not a Git repository and was not initialized.

The exact preflight source is `docs/2026-09-09-production-construction-gate-release.md`. Its release identity remains unchanged: Vercel project `prj_UMFNTyksVcChjBQ7ccXHMAQGdPZe`, scope `koosha-paridehpours-projects`, domains `kooshapari.com` and `www.kooshapari.com`, and rollback candidate `dpl_GtD6XSCDxVzyQjKeLhgiUXuD8wt6`.

## Frozen-source transfer policy

Do **not** copy changing construction-gate files until the construction worker provides a freeze handoff and the root coordinator releases QA. Until then, this clone is only the ancestry-preserving review target.

After freeze, inspect and stage only the following source classes from `/Users/kooshapari/CodeProjects/Phenotype/repos/koosha-phenotype`:

### Allowlist, subject to per-file privacy/content review

- Root website HTML: `index.html`, `engineering.html`, `product.html`, `work.html`, `resume.html`, `contact.html`, `blog.html`, `archive.html`.
- Website route content: `work/**/*.html` and `blog/**/*.html`.
- Browser/runtime code: `scripts/**/*.js`, **excluding** `scripts/construction-gate.js` and `scripts/construction-shell.js` until the freeze handoff. `scripts/stage-publication.js` is included only if its reviewed behavior is required by the final build recipe.
- Styles: `styles/**/*.css`.
- Public data modules: `data/**/*.js`.
- Public assets: `public/**/*`, plus the reviewed root `favicon.svg`, `robots.txt`, and `sitemap.xml`. Binary assets require separate rights/content review; filenames alone are not privacy approval.
- Build/package files: `package.json`, `package-lock.json`, `vercel.json`, and `playwright.config.js` only where needed by the reviewed build/test contract. `server.js` is development/preview infrastructure and is not part of the publication payload unless separately approved.
- Public-safe tests: `tests/**/*.test.js` and `tests/browser/**/*.js` only after each test is inspected for private fixtures, paths, captures, credentials, and construction-gate coupling. Exclude `tests/construction-gate.test.js` until the corresponding implementation is frozen and approved.

`dist/` is generated output, not an independent source allowlist. It must be regenerated by the reviewed staging command and inspected as the publication candidate; do not blindly copy a stale or preview-target `dist/` tree.

### Explicit exclusions and preservation rules

Exclude local `docs/`, `output/`, `.playwright-cli/`, `.vercel/`, `node_modules/`, `asset-sources/`, private work/memory files, ResVault material, transcripts, resume-consolidation material, raw LinkedIn/research exports, secrets, `.env*`, credentials, tokens, and generated captures. Do not copy any file merely because it has a site-adjacent name.

The remote repository already contains `docs/`, `output/`, `recruiting-funnel/`, review/evidence material, `web-migration/`, and other unrelated content. Their presence proves neither privacy safety nor permission to delete/replace them. Preserve them during the first diff; do not automatically copy, delete, or classify them as safe. Preserve `README.md` exactly unless the root owner separately approves a narrowly scoped change.

The initial privacy scan found public-facing biography/contact/LinkedIn references and recruiter-facing site content in the reviewed classes. Those are intentional public disclosures only if confirmed by the release owner; a clean secret-marker scan is not a privacy approval.

## Build/publication reconciliation

The developed source `vercel.json` specifies `buildCommand: npm run stage:publication` and `outputDirectory: dist`. The canonical remote `vercel.json` currently specifies `outputDirectory: .` and has no staging build command. This is a material deployment change and must be reviewed in the exact staged diff. The root route also changes from remote `/index.html` to the staged `/root` output, so route parity and fresh production-build verification are required.

Before any release, run the final allowlisted build from the frozen source, inspect the resulting `dist/` tree and route behavior, compare the complete staged diff against canonical `main`, and confirm that no excluded content is staged. Preserve the existing project and domains; do not create a project or attach a new domain. Git connection and production deployment remain outside this phase and require explicit root release after QA.

## Next command after freeze handoff

From the developed source, first record the freeze marker and then run the review-only staging recipe below. The recipe intentionally creates no commit and performs no network write:

```sh
SOURCE=/Users/kooshapari/CodeProjects/Phenotype/repos/koosha-phenotype
REPO=/Users/kooshapari/CodeProjects/Phenotype/repos/worktrees/KooshaPari-public-sync-20260909

# After construction freeze + coordinator release only:
git -C "$REPO" switch -c review/public-site-sync-20260909
# Copy only the approved allowlist above; do not use cp -R, git add ., or rsync without --files-from.
# Then run the frozen-source build/test commands, inspect dist/, and review:
git -C "$REPO" status --short
git -C "$REPO" diff --stat
git -C "$REPO" diff -- README.md docs output recruiting-funnel web-migration
```

The final copy command must be assembled from the inspected, frozen manifest; it must not include `docs/`, `output/`, `recruiting-funnel/`, `.vercel/`, `.playwright-cli/`, `node_modules/`, or construction-gate files before their handoff. Do not push this branch, connect Vercel, or deploy in this preparation phase.
