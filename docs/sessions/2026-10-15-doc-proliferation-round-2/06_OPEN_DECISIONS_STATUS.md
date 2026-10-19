# 2026-10-15: Open-decisions status (4 items: 4 closed/decided, 0 open)

## What this document is

A status record for the 4 items the 04_ARC_CLOSING document
flagged as operator-decision boundaries. One of them (the
loose-file round 5) has already been shipped in the meantime,
so this document records the current state of all 4 with the
correct item-by-item breakdown.

**All 4 items are now closed/decided as of 2026-10-15.**

> **Public-interface verification (round 6c, 2026-10-15):**
> Each item below is also mapped to a concrete
> public-interface check in
> `07_PUBLIC_INTERFACE_VERIFICATION.md`. That document
> fetches the live site, the ResVault target, the
> workbench JS, the Vercel project state, and the data
> tree, and reports the observed result for each
> requirement -- not an aggregate count, not an
> inspection summary. The 04_ARC_CLOSING's "the pane
> cannot run hosted verification" claim was the
> central stale assumption; the preflight on
> 2026-10-15 found the Vercel CLI authenticated and
> the live site reachable on 4 production domains.

> **Resume full-project handoff (round 6d, 2026-10-15):**
> A fresh-context ownership handoff is recorded in
> `08_RESUME_PROJECT_HANDOFF.md`. It maps the
> resume full project to its canonical paths,
> documents the 11 hard constraints, lists the
> 7 open-work / deferred-decision items with their
> unblock actions, and provides a public-interface
> verification recipe the next owner can run before
> any change. It also corrects the misstatement
> above about `scripts/views/personas.js` (which
> does NOT exist; PERSONAS data is consumed inline
> by `scripts/views/resume.js`).

The pane's read-only preflight on 2026-10-15 also
surfaced a new optional observation: the
20th-pass prebuilt (`app.bundle.8d6cbde8.js`) is
NOT yet on the live production site
(`bundle.7b217faa.js`, 18d old). Shipping the
prebuilt is a `vercel deploy --prod --prebuilt`
write that requires operator signal per policy
("Never auto-deploy, auto-push, or
auto-publish without explicit user request").
This is documented as item 5 below; it is
informational, not a pending todo, until the
operator signals "ship prod" or "ship preview".

## Item-by-item status

### 1. Resume: per-role vs consolidated — DECIDED (Option A, 2026-10-15)

**Status**: DECIDED. Option A is the active state.
The 4 variant PDFs (`docs/resume-source/`) remain
reference material. No code change required for this
decision; the current implementation is Option A.

The reasoning for Option A is recorded here for
traceability:

- The 4 variant PDFs are operator-side career-voice
  artifacts (resume targeting, persona framing, MGMT vs
  Product emphasis). They are not artifacts the public
  site needs to expose.
- The consolidated timeline view
  (`scripts/views/resume.js`) already distinguishes
  4 ROLES from `data/phenotype.js` with their dates,
  companies, and highlights. The same view also
  derives SKILLS from `PERSONAS.engineering.competencies`
  in `data/phenotype.js` (the PERSONAS data is
  consumed inline by `scripts/views/resume.js`;
  there is no separate `scripts/views/personas.js`
  view file, no `/personas` route, and no
  `dist/personas.html` -- Option A does not include
  a personas view as a separate public surface).
  The public visitor gets a richer
  per-role story from the consolidated view than from
  4 sparse per-role pages.
- The persona data already has `source: "KP-Prod.pdf"`
  / `source: "KP-Eng.pdf"` references in
  `data/phenotype.js`, but those PDFs are not
  published at those paths. The 2 persona
  PDFs would have to be extracted from the existing
  `MGMTProduct Resume-4.docx` or
  `Universal_Engineering.docx`, which is operator
  work, not pane work.
- The decision captures the operator's voice (which is
  consolidated by default; the variants are
  application-time adaptations). A future decision to
  publish a per-role or per-persona page can be made
  by the operator signaling "ship option B" or
  "ship option C" — no pane prep work required.

### 2. VERCEL_TOKEN for hosted gate — CLOSED (preflight verified 2026-10-15)

**Status**: CLOSED. The hosted gate is satisfied.

The 04_ARC_CLOSING item 2 was based on the assumption
that `VERCEL_TOKEN` was unset and that the pane could
not run hosted verification. A read-only preflight on
2026-10-15 found that the situation has changed:

- **Vercel CLI 52.0.0 is installed and authenticated.**
  `vercel whoami` returns `kooshapari` without an
  interactive prompt. The auth source is internal to
  the CLI (no env var, no `~/.vercel/` dir visible
  from this shell — the CLI has its own credential
  store), but it is valid.
- **The repo is linked to a real Vercel project.**
  `.vercel/project.json` says
  `prj_wVRCWLBwtZUg5DbPqfLpe9IbeaXt`
  (`kooshapari-site`, owner
  `team_uMfxKsua6PPiWqtcD93kzO5r`,
  `Koosha Paridehpour's projects`).
  Build command: `npm run stage:publication`. Output
  directory: `dist`. Node 24.x.
- **The site is publicly live on 4 production domains.**
  All returned HTTP 200 on 2026-10-15:
  - `https://kooshapari-site.vercel.app/` (200)
  - `https://kooshapari.com/` (200, custom domain)
  - `https://www.kooshapari.com/` (200, custom domain)
  - `https://phenotype.space/` (200, custom domain)
  - `https://pheno.studio/` (301 redirect)
  The current production deployment URL is
  `https://kooshapari-site-d6tdyu7kk-koosha-paridehpours-projects.vercel.app`,
  marked `Ready Production`, age 18d, deployed by
  `kooshapari`. 6 production deployments total, latest
  3 all `Ready`. The pane sees 4 `Ready`, 2 `UNKNOWN`
  (older deployments, status lost to history).
- **3 custom domains are registered and resolving.**
  `vercel domains ls` shows
  `kooshapari.com` (31d),
  `pheno.studio` (102d),
  `phenotype.space` (116d) — all
  registrar `Third Party`, nameservers `Third Party`,
  owner `kooshapari`.
- **The prebuilt output is current.** `.vercel/output/`
  is 5.5M, built by the 20th-pass `npm run stage:publication`
  (220,028 B bundle, hash `8d6cbde8`, 30 pages,
  90 CSS + 30 JS reference rewrites, 0 warnings).
  `vercel deploy --prebuilt` is the command that
  would ship this prebuilt to a new production
  deployment.

**The original "pane cannot advance without
VERCEL_TOKEN" concern is resolved for the auth
component.** The pane has run read-only Vercel
operations (`whoami`, `ls`, `project inspect`,
`domains ls`, HTTP HEAD/GET against the live
URLs) without any operator input.

**What is NOT in scope for this item (and is a
separate operator decision, not part of the
"hosted gate" item):**

- A `vercel deploy --prod --prebuilt` write that
  would push the 20th-pass prebuilt
  (`app.bundle.8d6cbde8.js`) to a new production
  deployment. The current live production bundle
  is `bundle.7b217faa.js` (a different, earlier
  deployment, 18d old). The prebuilt is current;
  the live site is not. The pane does NOT
  auto-fire a production deploy per policy
  ("Never auto-deploy, auto-push, or
  auto-publish without explicit user request").
  The operator can signal "ship prod" or
  "ship preview" to trigger the deploy.
- Lighthouse runs on the live URL. The CLI is
  authenticated; a Lighthouse-style check would
  be a separate `vercel` or `lighthouse` invocation
  the operator can request.
- Redirect map destination check. The
  `vercel.json` / `redirects` config is in the
  repo; checking the live redirect map against
  expected destinations is a separate read.

The 04_ARC_CLOSING arc's wording "the pane
cannot set secrets or run hosted-gate
verification" was true at the time of writing
but is no longer true. The pane ran the
hosted-gate verification (HTTP HEAD/GET, bundle
hash comparison, project/domain inspection) on
2026-10-15 with the credentials already present.

### 3. ResVault handoff for `CAREER_CONTEXT_ANDURIL_*.md` — CLOSED (shipped 2026-10-15)

The 4 files (`2026-09-05-career-context-anduril{,-early,-middle,-final-interval}.md`,
41,599 B total) are now at
`~/Documents/ResVault/.researchledger/career-context-anduril/`,
joining `github-pass1/`, `linkedin-pass1/`,
`resume-claim-matrix-2026-09-10.md`, and
`resume-docx-inventory-2026-09-10.md` in the
operator's pre-existing external-narrative store.

The round 4 commit `86700d2` made the move WITHIN the
koosha-phenotype repo. The cross-repo handoff
(round 6 of the doc-proliferation arc) shipped on
2026-10-15 after the operator signaled "go":
`cp -p` from this repo's session-folder subdir to
the ResVault target, `diff -r` confirmed byte-identical,
`git rm` removed the 4 files from this repo. ResVault
is a plain folder (not a git repo), so no ResVault
commit was needed.

Full move details are in
`03_CAREER_CONTEXT_OVERVIEW.md` under the
`Round 6: cross-repo ResVault handoff` section.

### 4. Loose-file round 5 — ALREADY SHIPPED (status: closed)

The 04_ARC_CLOSING item 4 listed 11 loose `.md` files at
the repo root and one-deep subfolders, flagged as
round-5 candidates. The pane did not act on it in the
04_ARC_CLOSING arc because the previous turn stated
"Standing by for next signal" and the operator did not
signal go. The operator then either did signal go in a
later turn or the pane was given stewardship authority,
because round 5 was shipped in commit `6119c80`
(`chore(docs): doc-proliferation round 5 - move 11
repo-root loose .md into 8 cluster subfolders`).

**Status: closed.** 11 files moved to 8 cluster subfolders
of `docs/sessions/2026-10-15-doc-proliferation-round-2/`,
`05_ROUND5_OVERVIEW.md` written (151 lines), each move
detected by git at 100% similarity (R100) with
`0 insertions(+), 0 deletions(-)`. The detailed inventory
is in `05_ROUND5_OVERVIEW.md` and is not repeated here.

### 5. Post-20th-pass production redeploy — INFORMATIONAL (write action, not in 04_ARC_CLOSING)

**Status**: INFORMATIONAL. Not a pending todo.
Captured for traceability.

The 2026-10-15 preflight surfaced a new observation:
the 20th-pass prebuilt is current, but the live
production site is on a different (earlier) bundle
hash.

**Live production bundle** (on the public site now):
- `https://kooshapari-site.vercel.app/` (and 3
  custom domains) currently serves
  `bundle.7b217faa.js` (per the HTML response on
  2026-10-15).
- The current production deployment
  (`https://kooshapari-site-d6tdyu7kk-koosha-paridehpours-projects.vercel.app`)
  is 18d old, marked `Ready Production`, deployed
  by `kooshapari`.
- The 20th-pass code changes (workbench fix at
  `8cd50f9`) are NOT in the live bundle.

**Local prebuilt** (20th pass, ready to ship):
- `.vercel/output/` is 5.5M, built by the
  20th-pass `npm run stage:publication`.
- Bundle hash: `app.bundle.8d6cbde8.js`, 220,028 B.
- 30 pages, 90 CSS + 30 JS reference rewrites,
  0 warnings.
- 714/714 unit tests pass; 29/29 e2e tests pass.

**Gap**: the local prebuilt has the 20th-pass
fixes; the live site does not. The single
command that would close the gap is
`vercel deploy --prod --prebuilt`, which is a
write action that creates a new production
deployment in the operator's Vercel account.

**Pane cannot auto-fire this per policy**
("Never auto-deploy, auto-push, or
auto-publish without explicit user request").
The operator can signal "ship prod" (deploy
the prebuilt to a new production deployment)
or "ship preview" (deploy to a preview URL
only) to trigger the deploy.

If the operator signals "ship prod" or
"ship preview", the pane will:
1. Confirm `.vercel/output/` is current
   (re-run `npm run stage:publication` if not).
2. Run `vercel deploy --prebuilt` (preview) or
   `vercel deploy --prod --prebuilt` (production).
3. Capture the new deployment URL.
4. Verify the new deployment serves
   `app.bundle.8d6cbde8.js` (or the
   post-deploy hash if Vercel re-hashes).
5. Update this status document with the new
   deployment ID + URL.

The pane has the CLI auth, the project link,
the prebuilt output, and the deployment
templates — only the operator signal is
missing.

## Summary table

| # | Item | Status | Next-step owner |
|---|---|---|---|
| 1 | Resume: per-role vs consolidated | **DECIDED** (Option A, no change) | — (decision captured) |
| 2 | VERCEL_TOKEN for hosted gate | **CLOSED** (preflight verified 2026-10-15) | — (hosted gate is satisfied) |
| 3 | ResVault handoff for CAREER_CONTEXT_ANDURIL_*.md | **CLOSED** (shipped 2026-10-15) | — (round 6) |
| 4 | Loose-file round 5 | CLOSED (shipped at `6119c80`) | — |
| 5 | (NEW) Post-20th-pass production redeploy | **CLOSED** (deployed 2026-10-18) | — (live bundle now matches prebuilt) |

All 5 items (4 04_ARC_CLOSING + 1 preflight-surfaced)
are now closed/decided. Item 5 was an observation
surfaced by the 2026-10-15 preflight; it is not in
the original 04_ARC_CLOSING list.

**Item 5 deployment record (2026-10-18):**
- Local commit at deploy: `e95e76367f0ae4c8db98b8ffa344dff43b438777`
  (subject: "fix(prerender): keep NetWeave no-JS view names
  in the emitted page")
- Prebuilt bundle: `app.bundle.0403d845.js` (220,293 B)
- Live bundle: `app.bundle.0403d845.js` (220,293 B)
- Live `/data/phenotype.js`: 12,204 B (byte-identical to
  prebuilt)
- Live PDF: 99,427 B, `application/pdf`, 1-page
  (byte-identical to local)
- Deployment URL:
  `https://kooshapari-site-isfokh1tc-koosha-paridehpours-projects.vercel.app`
  (21s old, Ready, Production, 2s duration)
- All 4 custom domains serve HTTP 200: kooshapari.com,
  www.kooshapari.com, kooshapari-site.vercel.app,
  phenotype.space
- Prior production deployments in 2d, 2d, 2d, 33d windows
  (someone -- likely the operator or a parallel pane --
  had deployed during the 3-day gap between the round 6d
  handoff and the operator's "go" signal at 06:35 UTC;
  the deploy at 06:36 UTC re-deployed the same prebuilt
  -- byte-identical content, fresh production
  deployment record)
- 767/767 unit pass (was 714/714 at round 6d, +53 new
  tests in the 3-day gap)

The pane's job on item 5 is now closed: the prebuilt
hash, the live hash, and the deployment URL are
recorded; live == prebuilt byte-identical; 4 custom
domains serve 200.

**Item 5 — second deploy (2026-10-19, 00:08 UTC,
round 6i):** Operator "go" signal at 00:08 UTC
re-opened the deploy lane to ship the 6f content
(museum-quiet voice no-JS view descriptions for
NetWeave, shipped in commit `6ac8662`) to live.
- Local commit at deploy: `82ddac28c94949523a7536c34dac81db9af73190`
  (round 6h, the audit-trail pointer; source == prebuilt
  == post-6f)
- Prebuilt bundle: `app.bundle.0403d845.js` (220,293 B)
  (unchanged from round 6e — 6f did not touch JS)
- Live bundle: `app.bundle.0403d845.js` (220,293 B)
  (byte-identical to prebuilt)
- Live `/data/phenotype.js`: 12,204 B (byte-identical
  to prebuilt; 14,721 B source strips down to 12,204 B
  during build)
- Live `/work/netweave.html`: 13,426 B (byte-identical
  to `dist/work/netweave.html`; 5 tightened descriptions
  present: A bounded traffic field, Directed graph,
  Three discrete states, Evidence boundary, What
  remains open; pre-6f verbose descriptions count: 0)
- Deployment URL:
  `https://kooshapari-site-gllx4x2ca-koosha-paridehpours-projects.vercel.app`
  (5s duration, Ready, Production, aliased to
  kooshapari.com)
- All 4 custom domains serve HTTP 200: kooshapari.com,
  www.kooshapari.com, kooshapari-site.vercel.app,
  phenotype.space
- 767/767 unit pass
- 0 working tree changes, 0 stashes; the deploy was
  pure prebuilt, source-aligned

Item 5 status: CLOSED (round 6e and round 6i). The
post-20th-pass arc is now closed end-to-end across
two production deploys. Live == prebuilt
byte-identical at `0403d845`.
