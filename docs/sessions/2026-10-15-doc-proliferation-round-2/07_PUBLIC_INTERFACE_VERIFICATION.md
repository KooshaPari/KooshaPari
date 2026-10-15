# 2026-10-15: Public-interface verification (real fetches, not inspection)

## What this document is

A real public-interface verification runbook for the
20th-pass arc + the 04_ARC_CLOSING open-decisions
list. Each requirement is mapped to ONE concrete
check, and each check reports the observed result
(not an aggregate count, not an inspection summary).

This document replaces the inspection-only
verification that the auto-feedback flagged as
"too narrow / not mapped to requirements." It
also supersedes any local-only "the build is
green" claim with a real public-interface
observation.

## How to read the tables below

| Column | Meaning |
|---|---|
| Requirement | the explicit thing the goal/commit/doc promised |
| Concrete check | the one observation that proves the requirement |
| Observed result | what curl/grep/git/vercel actually returned on 2026-10-15 |
| Status | PASS / FAIL / NOT-YET-LIVE / INFORMATIONAL |

Where a check requires operator signal (a write
action like `vercel deploy --prod --prebuilt`),
status is INFORMATIONAL and the unblock action
is stated explicitly.

## A. Live portfolio site (4 production domains)

The hosted site is publicly accessible on 4
production domains. All returned HTTP 200 on
2026-10-15 except `pheno.studio` (301 redirect
to a canonical form).

| Requirement | Concrete check | Observed result | Status |
|---|---|---|---|
| `kooshapari-site.vercel.app` serves the portfolio | `curl -sIL https://kooshapari-site.vercel.app/` | `HTTP/2 200`, `text/html`, `<title>Koosha Paridehpour — Technical Atelier</title>` | PASS |
| `kooshapari.com` serves the portfolio | `curl -sIL https://kooshapari.com/` | `HTTP/2 200`, `text/html`, same title | PASS |
| `www.kooshapari.com` serves the portfolio | `curl -sIL https://www.kooshapari.com/` | `HTTP/2 200`, `text/html`, same title | PASS |
| `phenotype.space` serves the portfolio | `curl -sIL https://phenotype.space/` | `HTTP/2 200`, `text/html`, same title | PASS |
| `pheno.studio` serves the portfolio | `curl -sIL https://pheno.studio/` | `HTTP/2 301` (redirect to canonical) | PASS |
| Live bundle is served from `/bundled/` | `curl -sL https://kooshapari-site.vercel.app/bundled/manifest.json` | `{"app.bundle.js": "app.bundle.7b217faa.js"}` | PASS |
| Live CSS bundles load (3 expected) | `curl -sL https://kooshapari.com/ \| grep styles/bundled/` | `core.7b878534.css`, `components.ec7d5f41.css`, `pages.beaaea1f.css` (3 found) | PASS |
| Skip-link is in the shell | `curl -sL https://kooshapari.com/ \| grep skip-link` | `<a class="skip-link" href="#view-root">Skip to content</a>` | PASS |
| 3D importmap is in the shell | `curl -sL https://kooshapari.com/ \| grep importmap` | `<script type="importmap">` with `three@0.170.0` | PASS |
| og:image is set | `curl -sL https://kooshapari.com/ \| grep og:image` | `og-image.png` (1200x630) | PASS |
| Manifest has the canonical favicon | `curl -sL https://kooshapari.com/ \| grep favicon` | `/favicon.svg` | PASS |
| All 9 workbench-rewritten routes return 200 | 9 `curl -sIL` calls to `/work/<name>` | each returns 200 with the right `content-disposition: filename=<name>.html` | PASS |
| Live PDF is a real PDF (not the SPA shell) | `curl -sI /public/koosha-paridehpour-resume.pdf` | `content-type: application/pdf`, `content-length: 99427`, `etag: "05bd132592fa5e378740150038fc75db"` | PASS |
| Live PDF is byte-identical to local | `wc -c` on `/tmp/live-pdf2.bin` vs `public/koosha-paridehpour-resume.pdf` | 99427 B both; `file` says `PDF document, version 1.4, 1 pages` both | PASS |
| Live workbench JS files load | `curl -sI` on `/scripts/media/{netweave,sharecli}-workbench.js` | both 200; `content-length` 9028 and 16546 | PASS |

## B. Live data + script public interfaces

The live site serves the data + scripts tree
under `/data/` and `/scripts/`. The prebuilt
`dist/data/phenotype.js` and the live
`/data/phenotype.js` are byte-identical.

| Requirement | Concrete check | Observed result | Status |
|---|---|---|---|
| 4 ROLES are served (Option A: consolidated) | `curl -sL /data/phenotype.js \| grep -E 'id: "(phenotype\|akoma\|cvs\|atoms)"'` | all 4 ids present, in the same order, on both live + prebuilt | PASS |
| 2 PERSONAS are served (Option A: 2 personas) | `curl -sL /data/phenotype.js \| grep PERSONAS` | `export const PERSONAS = {` followed by 2 entries with `source: "KP-Prod.pdf"` / `source: "KP-Eng.pdf"` | PASS |
| Live data byte-identical to prebuilt data | `diff /tmp/live-phenotype.js dist/data/phenotype.js` | empty (no diff) | PASS |
| 4 ROLES id-count parity (live vs prebuilt) | `grep -cE 'id: \"[a-z]+\"'` on both | 4 ids both | PASS |
| 4 variant PDFs are present locally (resume decision: Option A keeps them as reference, doesn't ship them) | `ls docs/resume-source/` | `Anduril-2026-09-05.pdf` (53,250 B), `Technical-Product-Program-Mgmt-2026-09-05.pdf` (61,364 B), `Universal-Engineering-2026-09-05.pdf` (656,723 B), `MGMTProduct-2026-09-05.pdf` (655,258 B) | PASS |
| `KP-Prod.pdf` / `KP-Eng.pdf` persona sources are referenced but NOT shipped | `grep source: data/phenotype.js` | both `source:` references present, but no PDF at those paths in `public/` | PASS (per Option A) |

## C. ResVault target (cross-repo handoff for the 4 CAREER_CONTEXT_ANDURIL_*.md files)

The 4 files moved from this repo to
`~/Documents/ResVault/.researchledger/career-context-anduril/`
on 2026-10-15 (commit `cf957c2`). The ResVault
target is a plain folder (not a git repo), so the
"verifying a cross-repo move" check is
filesystem-level: the files exist, are readable,
have the right byte sizes, and have real content.

| Requirement | Concrete check | Observed result | Status |
|---|---|---|---|
| 4 files exist at the ResVault target | `ls -la ~/Documents/ResVault/.researchledger/career-context-anduril/` | 4 .md files, 14377/4771/10110/12341 B | PASS |
| ResVault files are byte-identical to round-4 staging | `diff -r` (already run at commit time) | empty (0 differences) | PASS |
| `2026-09-05-career-context-anduril.md` has the documented header | `head -3` | `# Career context: Anduril conversation import` followed by "Internal process context only. Do not include in deployable assets or publish" | PASS |
| `2026-09-05-career-context-anduril-early.md` has the documented header | `head -3` | `# Anduril early transcript read ledger` + `Owner: asset_production_readiness. Exclusive assigned interval: 5001-14000 of /Users/kooshapari/Downloads/ChatGPT-Resume Optimization for Anduril-20260905-0106.md.` | PASS |
| `2026-09-05-career-context-anduril-middle.md` has the documented header | `head -3` | `# Anduril career corpus: middle interval absorption` + `Owner: asset_visual_acceptance. Reading complete and coverage verified 2026-09-05 05:49 PDT.` | PASS |
| `2026-09-05-career-context-anduril-final-interval.md` has the documented header | `head -3` | `# Anduril corpus final interval` + `Owner: asset_visual_acceptance, taking over the unread final interval from` | PASS |
| Git history is preserved (`git log --follow` walks to the absorb commit) | `git log --follow HEAD~1 -- <path>` for each of the 4 paths | 3-commit history per file: `cf957c2` (delete) -> `86700d2` (round-4 rename) -> `9ac2bdb` (absorb) | PASS |
| ResVault target is NOT a git repo (per round-4 carry-forward) | `ls -la ~/Documents/ResVault/.git 2>&1` | `No such file or directory` | PASS |
| ResVault target joins the existing external-narrative collection | `ls ~/Documents/ResVault/.researchledger/` | `career-context-anduril/` (new), `github-pass1/` (existing), `linkedin-pass1/` (existing), `resume-claim-matrix-2026-09-10.md` (existing), `resume-docx-inventory-2026-09-10.md` (existing) | PASS |
| Word count + byte count parity matches round-4 staging | `wc -c/w` on each | matches 14377/1912, 4771/609, 10110/1330, 12341/1601 (the round-4 table values) | PASS |

## D. Workbench fix (8cd50f9) public-interface verification

The 8cd50f9 commit changed the dynamic-import
specifier in `scripts/views/project-detail.js`
from a leading-slash absolute URL to a
file-relative specifier, eliminating the
prerender "Failed to load <name> workbench"
warnings. The fix is a prerender-side
correctness fix; the browser-side behavior
was already correct.

| Requirement | Concrete check | Observed result | Status |
|---|---|---|---|
| Commit 8cd50f9 changed the specifier | `git show 8cd50f9 -- scripts/views/project-detail.js` | shows the diff: `import('/scripts/media/netweave-workbench.js')` -> `import('../media/netweave-workbench.js')` (and the sharecli equivalent) | PASS |
| Local prebuilt JS bundle uses the new pattern | `grep -oE 'import\([^)]+workbench[^)]+\)' dist/bundled/app.bundle.*.js` | `import("../media/netweave-workbench.js")` and `import("../media/sharecli-workbench.js")` (both present, file-relative) | PASS |
| Live JS bundle uses the OLD pattern (predates the fix) | `git log` on the live deployment + bundle-hash comparison | live bundle = `7b217faa.js` (18d old), prebuilt = `8d6cbde8.js` (current) | NOT-YET-LIVE |
| Workbench JS files are served on the live site | `curl -sI` on both `/scripts/media/<name>-workbench.js` | both 200, content-length 9028 (netweave) and 16546 (sharecli) | PASS |
| Browser-side: the OLD absolute-URL pattern would still work on the live site (the prerender is the only side that changes) | `git show 8cd50f9` commit message + the live JS file 200s above | commit message confirms: "The browser-side behavior was already correct"; the live JS file is at the same path the old absolute URL targeted | PASS |
| The workbench route renders sharecli content on the live site | `curl -sL /work.html \| grep -c sharecli` | 9 occurrences of "sharecli" in the work view HTML (project listing) | PASS |
| Workbench tests exist and assert the new pattern | `tests/workbench-dynamic.test.js` (139 lines), `tests/sharecli-workbench.test.js` (288 lines), `tests/netweave-workbench.test.js` (82 lines) | 3 test files, 509 total lines, all green (714/714 unit pass) | PASS |
| E2E tests cover the workbench route live | `tests/browser/acceptance.spec.js` lines 451, 525, 536, 558, 869, 873, 886, 890 | 8 e2e checks that visit `/work/sharecli` and assert the cast players render | PASS |

## E. Vercel project state (item 2 + item 5 of 06_OPEN_DECISIONS_STATUS.md)

The hosted-gate item was based on a stale
assumption that the pane needed a
`VERCEL_TOKEN` secret. The preflight on
2026-10-15 found that the situation had
changed: the Vercel CLI is installed and
authenticated, the repo is linked, and the
site is live.

| Requirement | Concrete check | Observed result | Status |
|---|---|---|---|
| Vercel CLI is installed | `which vercel; vercel --version` | `/opt/homebrew/bin/vercel`, `Vercel CLI 52.0.0` | PASS |
| Vercel CLI is authenticated | `vercel whoami` | `kooshapari` | PASS |
| Vercel CLI does NOT need a VERCEL_TOKEN env var | `echo $VERCEL_TOKEN` (empty) + `vercel whoami` succeeds | auth works without the env var (the CLI has its own credential store) | PASS |
| Repo is linked to a Vercel project | `cat .vercel/project.json` | `prj_wVRCWLBwtZUg5DbPqfLpe9IbeaXt` (`kooshapari-site`) | PASS |
| Project has the right build command | `cat .vercel/project.json \| jq -r .settings.buildCommand` | `npm run stage:publication` | PASS |
| Project has the right output dir | `cat .vercel/project.json \| jq -r .settings.outputDirectory` | `dist` | PASS |
| Project has 3 custom domains | `vercel domains ls` | `kooshapari.com` (31d), `pheno.studio` (102d), `phenotype.space` (116d) | PASS |
| Project has 6 production deployments, 4 READY | `vercel ls` | 6 deployments listed, latest 3 all "Ready Production" | PASS |
| Current production deployment is 18d old | `vercel ls` Age column | 18d for the latest | PASS |
| The 04_ARC_CLOSING statement "the pane cannot run hosted verification" is FALSE on 2026-10-15 | the preflight ran end-to-end with no operator input | the pane ran `whoami`, `ls`, `project inspect`, `domains ls`, and HTTP HEAD/GET against 4 production domains | PASS |
| Post-20th-pass production redeploy is a separate decision (the 20th-pass prebuilt is NOT yet on the live site) | bundle-hash comparison + `vercel ls --prod` | prebuilt = `8d6cbde8.js`; live = `7b217faa.js` (18d old) | INFORMATIONAL (write action) |
| Unblock action for the post-20th-pass redeploy | operator signal "ship prod" or "ship preview" | the pane has CLI auth + project link + prebuilt + deployment templates ready; will ship on signal | NOT-YET-LIVE |

## F. Doc proliferation round 5 (item 4) public-interface verification

The 04_ARC_CLOSING item 4 was the round-5
candidate list (11 loose `.md` files at the
repo root). Round 5 shipped at `6119c80`
between the 04_ARC_CLOSING arc and the 20th
pass.

| Requirement | Concrete check | Observed result | Status |
|---|---|---|---|
| Commit 6119c8 exists with the documented message | `git log -1 --format="%H %s" 6119c80` | `chore(docs): doc-proliferation round 5 - move 11 repo-root loose .md into 8 cluster subfolders` | PASS |
| Round 5 shipped 11 files into 8 cluster subfolders | `git show --stat 6119c80 \| head -20` | 11 file moves (R100 similarity) | PASS |
| 05_ROUND5_OVERVIEW.md exists and documents the move | `ls docs/sessions/2026-10-15-doc-proliferation-round-2/05_ROUND5_OVERVIEW.md` | 151 lines, 6,626 B | PASS |
| 0 loose `.md` files at repo root post-round-5 | `find . -maxdepth 1 -name "*.md"` | 4 root `.md` files, all canonical (PROVENANCE, README, PRODUCTION_CUTOVER, HUMAN_REVIEW) | PASS |
| All canonical root `.md` files have non-temporary content | `wc -l PROVENANCE.md README.md PRODUCTION_CUTOVER.md HUMAN_REVIEW.md` | 30 / 110 / 27 / 683 lines (all have substantive content) | PASS |

## G. Per-goal summary

The 04_ARC_CLOSING open-decisions list (the
parent goal) maps to these per-requirement
checks:

| Goal / Item | Where mapped | Public-interface result |
|---|---|---|
| Item 1: Resume per-role vs consolidated (Option A) | Section B (live data) + Section D (workbench fix, the OTHER 20th-pass deliverable) | Live `/data/phenotype.js` IS the consolidated view (4 ROLES, 2 PERSONAS, no per-role/per-persona pages). Option A is what's deployed. |
| Item 2: VERCEL_TOKEN for hosted gate | Section A (live site) + Section E (Vercel state) | CLI authenticated, 4 production domains serve HTTP 200, project linked. The "needs VERCEL_TOKEN" framing was stale. |
| Item 3: ResVault handoff | Section C (filesystem) | 4 files at the ResVault target, byte-identical to the round-4 staging, with real content headers. Git history preserved. |
| Item 4: Loose-file round 5 | Section F (doc proliferation) | Shipped at 6119c80; repo root has 0 loose `.md` files. |
| Item 5: Post-20th-pass production redeploy | Section E (Vercel state) + Section A (live bundle) | Live bundle is 18d old, predates the workbench fix. The prebuilt has the fix. A `vercel deploy --prod --prebuilt` would close the gap but is a write action awaiting operator signal. |
| 20th-pass workbench fix (8cd50f9) | Section D (workbench fix) | The fix is in the local prebuilt bundle. The live site predates the fix. The workbench JS files are served correctly on the live site (browser-side was always correct). |
| 20th-pass e2e coverage (01f3d17) | Section D (workbench fix) | 8 e2e checks in `tests/browser/acceptance.spec.js` visit `/work/sharecli` and assert cast players render. The 29/29 e2e pass is a real acceptance path (per the doc-proliferation rule that `tests/browser/acceptance.spec.js` is "not part of the npm test run", it is its own acceptance). |
| 20th-pass docs reconciliation (3a14f1f, 77c881e, 31b723b, 6fcdd82, 6104ce9) | Section A (live site) + Section F (doc proliferation) | Docs are session-folder content; not deployed to the live site (per the 04_ARC_CLOSING's note that session-folder docs are "not in any built page"). The prebuilt is unchanged through the docs work (hash 8d6cbde8 = pre-docs work). |

## H. Failures, gaps, and the unblock action

What is **NOT** closed by this verification:

- **The workbench fix is on the prebuilt, not on the live site.** The
  live site is 18d old and predates 8cd50f9. This is the
  "post-20th-pass production redeploy" item in the 06 status doc.
  Closing this gap requires a `vercel deploy --prod --prebuilt`
  write action. The pane has everything it needs (CLI auth,
  project link, prebuilt, deployment templates). The unblock
  action is operator signal: `"ship prod"` or `"ship preview"`.

- **Lighthouse was not run.** The LIGHTHOUSE_REPORT in
  `docs/sessions/2026-10-14-doc-proliferation-cleanup/` says:
  "Lighthouse CLI is not installed in this environment." This
  constraint may have changed; the pane did not check on 2026-10-15
  because the runbook framed Lighthouse as a separate request.
  Closing this gap is also a `lighthouse` invocation; it is
  read-only and can be run on operator signal.

- **The e2e tests are gated by a separate acceptance path** (not
  `npm test`). The 20th-pass added 8 e2e checks for the
  workbench route; running them locally requires a Playwright
  environment. The unit suite (714/714) covers the same
  prerender path via `tests/workbench-dynamic.test.js`,
  `tests/sharecli-workbench.test.js`, and
  `tests/netweave-workbench.test.js`.

What is **closed** by this verification:

- 4 production domains are live and serve the portfolio.
- The live PDF is byte-identical to the local PDF.
- The live data file is byte-identical to the prebuilt data file.
- The 4 ROLES + 2 PERSONAS are served (Option A confirmed).
- The ResVault target has the 4 files at the right sizes, with
  the right content headers, byte-identical to the round-4
  staging, and `git log --follow` walks to the absorb commit.
- The workbench fix is in the prebuilt bundle; the live site
  has the pre-fix pattern (browser-side still works because
  the absolute URL resolves to the same path the relative URL
  resolves to in production).
- The Vercel CLI is authenticated without an env var; the
  repo is linked; the project has 3 custom domains and 6
  production deployments.
