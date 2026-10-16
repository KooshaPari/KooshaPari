# 2026-10-15: Resume full-project handoff (for fresh-context ownership)

## What this document is

A self-contained ownership-transfer handoff for the
**resume full project** in this repo. A fresh
context (new pane, new agent, new operator session)
should be able to read this document plus the
seven reference docs it points to, then take
ownership of the resume full project without
re-deriving any of the state captured here.

This is the close-out for the
post-20th-pass arc. The 20th-pass landed 4 commits
in the live prebuilt (8cd50f9 + 01f3d17 + 3a14f1f
+ 77c881e) and a series of doc-only commits; the
4 04_ARC_CLOSING items are now closed/decided; this
handoff captures the resume-relevant subset for
the next owner.

## What "resume full project" means

The resume full project is the union of:

1. **Live resume data tree** (4 ROLES + 2 PERSONAS +
   IDENTITY + EDUCATION + TIMELINE + RECRUITER_STATS
   + SOURCE + PHENOTYPE)
2. **Live resume view** (`scripts/views/resume.js`
   + `scripts/views/resume-helpers.js`)
3. **Live route** (`/resume` -> `/resume.html` per
   `vercel.json`)
4. **Local prebuilt** (`dist/resume.html` +
   `dist/data/phenotype.js` + the bundled JS)
5. **4 variant PDFs** (`docs/resume-source/`,
   reference-only)
6. **Resume-consolidation work product**
   (`output/resume-consolidation-2026-09-08/`)
7. **ResVault resume files** (out of repo, at
   `~/Documents/ResVault/.researchledger/`)
8. **4 Anduril transcript files** (also in
   ResVault, not in this repo)

It does NOT include:

- The 15 project case studies (each project has its
  own view file under `scripts/views/work/<name>.html`
  in prebuilt; the resume view is the *consolidated
  timeline*, not the project detail views)
- The home page hero (which surfaces 2 ROLES, not
  4 ROLES — but the data source is the same
  `data/phenotype.js` ROLES array)
- The blog / contact / parent / work / engineering
  / product views (separate concerns)

## Current state (verified)

The 07_PUBLIC_INTERFACE_VERIFICATION.md document
on 2026-10-15 ran a real public-interface pass
against the live site. The relevant section
(live data + script public interfaces) confirmed:

| Claim | Observed |
|---|---|
| 4 ROLES are served (Option A: consolidated) | yes, ids `phenotype`/`akoma`/`cvs`/`atoms` |
| 2 PERSONAS are served (Option A: 2 personas) | yes, `engineering` + `product` |
| Live data byte-identical to prebuilt data | yes, 12204 B both, no diff |
| 4 ROLES id-count parity (live vs prebuilt) | yes, 4 ids both |
| 4 variant PDFs are present locally (reference, not shipped) | yes, in `docs/resume-source/` (1.4 MB total) |
| `KP-Prod.pdf` / `KP-Eng.pdf` persona sources are referenced but NOT shipped | yes, source references present, no PDF at those paths in `public/` |

**Option A (consolidated) is what's deployed, not
just what's documented.** The data tree is
byte-identical live-vs-prebuilt. The 4 variant
PDFs are reference material only; they are NOT
served on the live site and the 06 doc's "current
implementation is Option A" claim is verified.

## Architecture (data flow + view code + build pipeline)

```
data/phenotype.js                      [1, source of truth]
   |
   v
scripts/views/resume.js                [2, view code]
   +-- imports EDUCATION, ROLES, PERSONAS
   +-- derives EXPERIENCE from ROLES
   +-- derives RESUME_EDUCATION from EDUCATION
   +-- derives SKILLS from PERSONAS.engineering.competencies
   +-- uses formatYear / formatYearRange from resume-helpers.js
   |
   v
scripts/prerender.js                   [3, build-time walker]
   +-- calls resume.js render() at build time
   +-- writes dist/resume.html
   |
   v
dist/resume.html                       [4, prebuilt static page]
   |
   v
vercel.json rewrites                   [5, route mapping]
   +-- /resume -> /resume.html
   |
   v
Live at https://kooshapari.com/resume   [6, public interface]
```

The `scripts/app.js` router also calls
`renderResume()` at runtime, so the page works
both with JS (SPA mode) and without JS (prerendered
HTML fallback per `scripts/prerender.js`).

## Key files (canonical paths, the next owner needs these)

In this repo (`/Users/kooshapari/CodeProjects/Phenotype/repos/koosha-phenotype`):

| Path | Role | Size |
|---|---|---|
| `data/phenotype.js` | source of truth (ROLES, PERSONAS, EDUCATION, IDENTITY, TIMELINE, RECRUITER_STATS, PHENOTYPE, SOURCE) | 14,360 B source / 12,204 B built |
| `scripts/views/resume.js` | consolidated timeline view | 4,892 B (157 lines) |
| `scripts/views/resume-helpers.js` | `formatYear`, `formatYearRange` | 830 B (24 lines) |
| `scripts/prerender.js` | build-time HTML walker | 7,286 B |
| `scripts/app.js` | SPA router that calls `renderResume()` | 8,818 B |
| `scripts/stage-publication.js` | the build command (`npm run stage:publication`) | 6,744 B |
| `tests/resume-helpers.test.js` | unit tests for the format helpers | 36 lines, ~8 tests |
| `vercel.json` | route rewrite `/resume -> /resume.html` | the `rewrites` block |
| `docs/resume-source/` | 4 variant PDFs (reference, not deployed) | 1,426,595 B total (1.4 MB) |
| `output/resume-consolidation-2026-09-08/` | the consolidation work product | 16,221 B + 73 in `extracted/` + 21 in `variants/` |
| `dist/resume.html` | the prebuilt static page | 10,637 B |
| `dist/data/phenotype.js` | the prebuilt data file (mirror of source) | 12,204 B |
| `public/koosha-paridehpour-resume.pdf` | the single consolidated PDF (live-served) | 99,427 B |
| `docs/sessions/2026-10-15-doc-proliferation-round-2/06_OPEN_DECISIONS_STATUS.md` | current state record | 6,890 B |
| `docs/sessions/2026-10-15-doc-proliferation-round-2/07_PUBLIC_INTERFACE_VERIFICATION.md` | live verification | 18,053 B |

In ResVault (NOT in this repo):

| Path | Role | Size |
|---|---|---|
| `~/Documents/ResVault/.researchledger/resume-claim-matrix-2026-09-10.md` | claim ledger for the resume | 2,424 B |
| `~/Documents/ResVault/.researchledger/resume-docx-inventory-2026-09-10.md` | docx inventory | 3,685 B |
| `~/Documents/ResVault/.researchledger/career-context-anduril/` | 4 transcript files (moved out at commit `cf957c2`) | 41,599 B (4 files) |
| `~/Documents/ResVault/.researchledger/linkedin-pass1/` | 30 linkedin external-narrative files | 960 B dir + contents |
| `~/Documents/ResVault/.researchledger/github-pass1/` | 15 github external-narrative files | 480 B dir + contents |
| `~/Documents/ResVault/.researchledger/linkedin-capture.json` | raw linkedin capture | 1,375 B |

## Hard constraints (the next owner must respect)

These come from the koosha-phenotype / docs-3
atlas program constraints (the
phenotype-omlx-style contract) and the project
README. They are non-negotiable.

| Constraint | Why it exists | What it means for the resume full project |
|---|---|---|
| 85% coverage floor (per docs-3) | QA gate | new resume helpers / view code must come with tests at 85%+ coverage |
| Hex via tokens (no hex inline) | design-system discipline | any color used in the resume view comes from a token, not `#xxxxxx` literals |
| 0 new font families | design-system discipline | the resume view reuses the existing typography |
| Bundle cap 230 KB JS | performance budget | adding resume JS counts against the cap; the prebuilt bundle is currently 220,028 B (8d6cbde8.js) |
| 0 emoji | museum-quiet voice | no emoji anywhere in the resume view or its data |
| `prefers-reduced-motion` | accessibility | the timeline reveal animation must respect reduced motion |
| Skip-link + `aria-live` | accessibility | the resume view must have a skip-link and announce dynamic changes |
| 60fps transform/opacity | performance | the timeline animation must use transform/opacity, not layout properties |
| 4 ROLES + 2 PERSONAS is the canonical data shape | Option A | do not change the count without re-deciding Option A |
| `docs/resume-source/` is reference-only | Option A | do not deploy these PDFs without re-deciding Option A |
| 4 transcript files are in ResVault, not this repo | cross-repo handoff | do not move them back; they are external-narrative, not deployable |

## What is NOT done (open work, deferred decisions)

These are the items the next owner inherits. None
of them are "stuck" — each has a recorded decision
or a clear unblock action.

| Item | Status | Decision or unblock action |
|---|---|---|
| Lighthouse on the resume view | NOT RUN | `LIGHTHOUSE_REPORT.md` says CLI is not installed. Run when installed; the resume view is `/resume` on the live site. |
| Per-role persona pages (Option B) | DEFERRED under Option A | 06_OPEN_DECISIONS_STATUS.md item 1 = DECIDED (Option A). Re-decide if a fresh decision is needed. |
| Publish the 4 variant PDFs in `docs/resume-source/` | DEFERRED under Option A | Same as above. Re-decide to ship them. |
| Remove the 4 variant PDFs from `docs/resume-source/` | DEFERRED under Option A | Same as above. The PDFs are kept as reference, not deleted. |
| ResVault file sync (claim matrix, docx inventory) | NOT SYNCED | ResVault is a plain folder (not git), so no automatic sync. The 4 transcript files were moved in commit `cf957c2` with `cp -p` + `diff -r` + `git rm`. To move more files, use the same pattern. |
| The `output/resume-consolidation-2026-09-08/` artifacts | READ-ONLY STATE | the consolidation work is captured at 2026-09-08; subsequent edits go to `data/phenotype.js` and `scripts/views/resume.js`. The `output/` tree is the audit trail. |
| Post-20th-pass production redeploy (item 5 of 06 doc) | UNRELATED TO RESUME, BUT STILL PENDING | The live bundle is `7b217faa.js` (18d old). The prebuilt is `8d6cbde8.js` (current). The pane is READY to ship; the operator's "ship prod" / "ship preview" / "no ship" signal unblocks it. |

## How to verify state (the public-interface check recipe)

The 07 doc is the canonical recipe. For the resume
subset:

```bash
REPO=/Users/kooshapari/CodeProjects/Phenotype/repos/koosha-phenotype

# 1. The live data tree has 4 ROLES + 2 PERSONAS
curl -sL https://kooshapari.com/data/phenotype.js | \
  grep -E 'id: "(phenotype|akoma|cvs|atoms)"'

# 2. The live /data/phenotype.js is byte-identical to the prebuilt
curl -sL https://kooshapari.com/data/phenotype.js > /tmp/live-phenotype.js
diff /tmp/live-phenotype.js "$REPO/dist/data/phenotype.js"   # expect: empty

# 3. The live /resume page returns 200 with the consolidated HTML
curl -sIL https://kooshapari.com/resume | head -5
curl -sL https://kooshapari.com/resume | grep -E 'Koosha|Phenotype|TIMELINE' | head -3

# 4. The live PDF is byte-identical to local
curl -s https://kooshapari.com/public/koosha-paridehpour-resume.pdf > /tmp/live-pdf.bin
wc -c /tmp/live-pdf.bin "$REPO/public/koosha-paridehpour-resume.pdf"   # expect: 99427 99427

# 5. The 4 variant PDFs in docs/resume-source/ are NOT on the live site
for pdf in Anduril Technical_Product_Program Universal_Engineering MGMTProduct; do
  status=$(curl -sI -o /dev/null -w "%{http_code}" "https://kooshapari.com/docs/resume-source/${pdf}.pdf" 2>&1)
  echo "  $status  /docs/resume-source/${pdf}.pdf  (expect 404)"
done
# These are EXPECTED to be 404. Option A keeps them as reference.

# 6. The unit suite is green
cd "$REPO" && npm test   # expect: 714/714 in 5.5s

# 7. The build is green
cd "$REPO" && npm run stage:publication   # expect: 30 pages, 0 warnings
```

If any of these fail, the next owner has discovered
a real regression and should treat it as a
high-priority bug. The expected results above are
the 2026-10-15 baseline.

## What to do first (next owner's first 5 actions)

1. **Read this document end-to-end** (you're doing
   it now).
2. **Read `06_OPEN_DECISIONS_STATUS.md`** for the
   4 closed/decided items + the 1 informational
   item 5. This is the current state record.
3. **Read `07_PUBLIC_INTERFACE_VERIFICATION.md`**
   for the live verification evidence. Section B
   (live data + script interfaces) is the most
   relevant for the resume full project.
4. **Read `data/phenotype.js`** end-to-end. It is
   12,204 B and the source of truth. Every claim
   in the resume view derives from this file.
5. **Read `scripts/views/resume.js`** to see how
   the consolidated timeline is rendered from the
   4 ROLES + 2 PERSONAS data. Then run the
   verification recipe above to confirm the live
   state matches what this document claims.

After those 5 actions, the next owner has full
context and can begin any planned work.

## What NOT to do (common failure modes)

- **Do not add a `personas.js` view file** unless
  you are re-deciding Option A. The 06 doc's
  mention of "personas view" is a misstatement;
  the live architecture uses `scripts/views/resume.js`
  with PERSONAS data consumed inline. There is no
  `/personas` route, no `dist/personas.html`, and
  no `scripts/views/personas.js`. If you add one,
  you are introducing a new public surface that
  Option A explicitly did not include.
- **Do not change the 4 ROLES + 2 PERSONAS count
  without re-deciding Option A.** The data shape
  is the source of truth; the view derives from
  it. Changing the count without re-decision
  breaks the consolidated-timeline promise.
- **Do not deploy the 4 variant PDFs in
  `docs/resume-source/`.** They are reference
  material per Option A. To publish them,
  re-decide Option A first (the 06 doc explains
  the trade-offs).
- **Do not move the 4 transcript files back from
  ResVault to this repo.** They are
  external-narrative, not deployable, and were
  moved in commit `cf957c2` with `cp -p` + `diff
  -r` + `git rm`. Use the same pattern for any
  future ResVault handoff.
- **Do not auto-fire `vercel deploy`** even if
  the live bundle is behind the prebuilt. The
  pane's policy is "Never auto-deploy, auto-push,
  or auto-publish without explicit user request."
  Wait for the operator's signal.
- **Do not invent content.** The 4 ROLES have
  explicit evidence in the transcripts (now in
  ResVault) and the 4 variant PDFs. New claims
  about employment, sales, manufacturing, or
  public profiles are NOT supported by source.
- **Do not skip the public-interface verification
  recipe above.** The unit suite (714/714) is a
  build-time check, not a public-interface check.
  The recipe above is the public-interface check
  and is the only way to confirm the live state.

## Decision history (what was decided and why)

| Date | Decision | Recorded in |
|---|---|---|
| 2026-09-05 | Anduril transcript split into 4 interval files (early/middle/final/main) | `output/resume-consolidation-2026-09-08/CLAIM_LEDGER.md` |
| 2026-09-08 | Resume consolidation work captured (4 ROLES, 2 PERSONAS, 1 PHENOTYPE) | `output/resume-consolidation-2026-09-08/CANONICAL_MASTER_CANDIDATE.md` |
| 2026-09-10 | Resume claim matrix and docx inventory finalized | `~/Documents/ResVault/.researchledger/resume-claim-matrix-2026-09-10.md`, `resume-docx-inventory-2026-09-10.md` |
| 2026-10-15 | Option A (consolidated) decided as the active state | `06_OPEN_DECISIONS_STATUS.md` item 1 |
| 2026-10-15 | Cross-repo handoff of 4 transcript files to ResVault | commit `cf957c2` |
| 2026-10-15 | Public-interface verification confirms Option A is deployed | `07_PUBLIC_INTERFACE_VERIFICATION.md` section B |

The 06 doc item 1 is the authoritative decision
record. Re-decisions must update that file (and
preserve the history with a new dated entry).

## Out-of-scope (this handoff does NOT cover)

- **Lighthouse / a11y scores** on the resume view:
  the LIGHTHOUSE_REPORT notes the CLI is not
  installed. Run when installed; this handoff
  does not block on it.
- **Per-role pages (Option B)**: deferred under
  Option A. The handoff documents the deferred
  state but does not implement Option B.
- **ResVault file sync protocol**: ResVault is a
  plain folder, not a git repo. There is no
  automatic sync. New files would use the same
  `cp -p` + `diff -r` + `git rm` pattern. This
  handoff does not propose a different protocol.
- **Post-20th-pass production redeploy (item 5
  of 06 doc)**: not specific to the resume full
  project, but the operator's "ship prod" /
  "ship preview" / "no ship" signal unblocks it.
  The resume view will be on whichever bundle is
  deployed at the time of the signal.
- **NetWeave attachments** (Doc, MP4, screenshots,
  simulation, ControlNet artifacts): the project
  is a full engineering candidate with that gap
  explicitly non-blocking. The resume view does
  not surface NetWeave attachments, so this is
  not a resume concern, but a fresh context
  should know it exists in the broader project.

## Persistent record

This document is the canonical handoff for the
resume full project as of 2026-10-15. It is
committed at `c1a13de` (round 6c) in
`docs/sessions/2026-10-15-doc-proliferation-round-2/08_RESUME_PROJECT_HANDOFF.md`.

Updates to this document should be made in place
(per the AGENTS.md "living documents" rule), not
as new versions. Add dated entries at the bottom
of the relevant section rather than rewriting
history.

A fresh context reading this document plus the
7 reference docs (`data/phenotype.js`,
`scripts/views/resume.js`,
`scripts/views/resume-helpers.js`,
`scripts/prerender.js`,
`scripts/app.js`,
`scripts/stage-publication.js`,
`tests/resume-helpers.test.js`,
`06_OPEN_DECISIONS_STATUS.md`,
`07_PUBLIC_INTERFACE_VERIFICATION.md`)
has full context for the resume full project.

## 2026-10-15: fresh-context ownership verification

A fresh context took ownership by re-running the
full 7-step recipe above. Result: **7/7 PASS, no
regressions.** The handoff's recorded state was
accurate.

| Step | Expected (2026-10-15) | Observed |
|---|---|---|
| 1. ROLES count | 4 live / 4 prebuilt | 4 / 4 |
| 1b. PERSONAS | 2 | 2 (`product`, `engineering`) |
| 2. live data parity | byte-identical, 12204 B | IDENTICAL, 12204 B |
| 3. `/resume` | 200 + resume content | HTTP/2 200, markers Koosha / Phenotype / RESUME |
| 4. live PDF | identical, 99427 B | IDENTICAL, 99427 B |
| 5. 4 variant PDFs | 404 | 404 x4 |
| 6. `npm test` | 714/714 | 714/714 in 7.1s |
| 7. `npm run stage:publication` | 30 pages, 0 warnings | 30 pages, 0 warnings |

Bundle state unchanged: live `7b217faa.js`, prebuilt
`app.bundle.8d6cbde8.js` (220,028 B). Item 5 remains
INFORMATIONAL and operator-owned; no deploy was fired.

### Corrections made by this verification pass

Three defects in this document and its neighbours
were found and fixed in place:

1. **`data/phenotype.js` size was wrong in the table
   above.** The source is 14,360 B / 316 lines. The
   12,204 B figure is the *built* size after comment
   stripping. Verified: the 27-line delta between
   source and `dist/` is entirely comments; export
   parity is 9 vs 9 and the non-comment diff is empty.
   No code is lost in the build. A triage worker
   initially misread this as a dropped re-export; the
   re-export is present at `dist/data/phenotype.js:289`.
2. **`dist/assets/` does not exist.** The hashed bundle
   is emitted to `dist/bundled/app.bundle.<hash>.js`,
   not `dist/assets/`. Any verification recipe that
   looks under `dist/assets/` will report a false
   UNKNOWN.
3. **PERSONAS has no `id:` fields.** `PERSONAS` is an
   object keyed `product` / `engineering`, so a grep for
   `id: "engineering"` returns 0. Verify by key, not by
   `id:`. The handoff's own recipe step 1 does not have
   this bug, but it is an easy trap for the next owner.

### Standing observation, not yet actioned

The comment block at `data/phenotype.js:306-314`
claims a "Public Record" tab in the SPA consumes
`PUBLIC_RECORD`. No such view or route exists;
`PUBLIC_RECORD` has no importer outside
`tests/phenotype-profile.test.js`, which imports
`data/phenotype-public-record.js` directly. The module
is built and served live (11,343 B, HTTP 200) and the
bundle inlines its body, so nothing is broken — the
comment is simply stale. Correcting it was out of
scope for this read-only verification pass.

Note also that `dist/` is gitignored
(`.gitignore:8`). A clean `git status` therefore says
nothing about whether the prebuilt is current; only the
`stage:publication` rebuild does.

### 2026-10-15: deep verification pass (beyond the 7-step recipe)

The 7-step recipe is curl-shaped: it proves *identity*
and *availability*, not *rendered behaviour*. A second
pass exercised the rendered page, the JS-enabled path,
and the claimed hard constraints. Findings below.

#### What the shallow recipe could NOT see

The prerendered `/resume` **does** render the real
consolidated timeline: all 4 roles present with correct
company and title (`Phenotype`, `Akoma`, `CVS Health`,
`Atoms.Tech`), 4 `.resume-node` entries, 4
`.resume-node__company`, 3 `.resume-section`, 6
`.resume-skill__bar-fill`, 1 h1, 3 h2. It is a real
page, not a shell.

The JS-enabled SPA path **works**, proven by driving a
real browser against a local preview with JS on: the
router resolves `/resume` -> `renderResume()`, the SPA
overwrites the prerendered markup in `#view-root`, and
there were zero console or page errors. 8 distinctive
`resume.js` literals survive minification into the
bundle (`resume-badge--eng`, `resume-skill__bar-fill`,
etc.). `vercel.json` does carry `/resume ->
/resume.html`.

#### Finding 1 — `aria-live` claim was FALSE as written (a11y) — FIXED `de5d511`

The handoff's hard-constraint table listed "Skip-link +
`aria-live`" as satisfied. **The skip-link was real; the
aria-live claim was not.**

```
grep -c "aria-live" scripts/views/resume.js   -> 0
```

Every other view had one (`home.js`, `parent.js`, `work.js`,
`work-index.js` x2); resume was the only one without, and the
built `dist/resume.html` had zero `aria-live` and zero
`role="status"`.

Fixed at `de5d511` by adding `'aria-live': 'polite'` to the
lede element. The app convention is a **single** attribute, no
`role`, no `aria-atomic`, no separate announcer element, and it
is **content-update** semantics rather than route-change — the
lede is the element whose text describes the rendered content,
so it is the correct host. (`parent.js` adds `role="status"` +
`.parent-sr-only`, but that class is scoped to
`styles/parent.css:139` and is not available to resume.)

#### Finding 2 — a layout-property animation (perf) — FIXED `de5d511`

```
styles/resume-timeline.css:192
.resume-skill__bar-fill { transition: width 0.8s var(--ease-out); }
```

`width` is a layout property, which contradicted the "60fps
transform/opacity" constraint. The worker proved it was **dead
before removing it**, rather than assuming:

- `resume.js:87-90` passes the width as an `el()` attribute, so
  `dom.js:10-20` applies it via `setAttribute` before the node is
  ever in the document.
- `resume.js:115` `root.replaceChildren(...)` is the first DOM
  insertion, after the whole tree is built.
- The only deferred work is `rAF(initScrollReveal)`, which sets
  `--reveal-distance` and `transitionDelay` — never `width`.
- Repo-wide there is exactly one JS site and one CSS site for
  `.resume-skill__bar-fill`, so there is no second mutation and
  no prior computed value to transition from.

Removed outright, with no replacement. Removing the declaration
also dissolves the "sits outside the reduced-motion block"
problem, since there is nothing left to guard.

**Still open, outside resume scope:** four other stylesheets
carry the same layout-property pattern — `radar.css:102`,
`shell.css:68`, `cast-player.css:250`, `artifacts.css:82`.

#### Finding 3 — the lens control on /resume was INERT — FIXED `6982683`

This started as "product persona skills are never
rendered" and turned out to be a **visible control that
did nothing**, which is a bug rather than a taste
question.

The lens switcher is global shell chrome:
`components/shell.js:59-77` builds it unconditionally and
injects it into the header on **every** route, so it is
visible on `/resume`. But `renderResume(root)` took no
lens argument and `SKILLS` was hardcoded to
`PERSONAS.engineering.competencies`. Clicking Product on
`/resume` changed nothing.

`renderResume(root, lens = 'engineering')` now derives via
`deriveSkills(lens)` -> `PERSONAS[lens].competencies`,
falling back to engineering via `??` on an unknown lens so
the view cannot throw. `app.js:123` passes the resolved
lens, matching the sibling call sites.

One trap worth recording: setting `route.lens` in
`prerender.js` would have been a **regression**.
`app.js:90` does `if (route.lens) lensState.set(route.lens)`,
which would pin every returning visitor to engineering on a
lens-agnostic route and defeat both localStorage and URL
resolution. `resume.html` therefore renders the default
lens explicitly while leaving `route.lens` unset, so
static output is byte-identical to before.

Also corrected: the skill rows do **not** use
`BADGE_CLASS` (that map is consumed only by `buildNode`
for timeline role badges). Timeline badges derive from
`ROLES[].framing[0]`, not the lens, so they correctly show
one Product and three Engineering badges in both lens
states. No CSS change was needed.

Verified across five browser states, 0 console errors
each: engineering lens, click Product, click back, direct
`/resume?lens=product`, and default. Now guarded by 6
mutation-tested tests at `3444968` (suite 714 -> 720).

Competency axes behind the two lenses:

| Engineering (default) | Product |
|---|---|
| Systems & Runtime 95 | Product Discovery 92 |
| Distributed Backends 92 | Roadmap & Prioritization 88 |
| AI / Agent Infra 90 | Cross-functional Leadership 95 |
| Performance & Tooling 90 | Commercial / Unit Economics 90 |
| Code Quality & Lifecycle 85 | Stakeholder & Sponsor Mgmt 92 |
| Hardware / Virtualization 80 | Risk & Compliance Framing 80 |

#### Hard-constraint audit: 6 PASS / 3 FAIL / 1 UNCLEAR

| Constraint | Status | Note |
|---|---|---|
| Hex via tokens | PASS | 0 hex in `resume-timeline.css`; 0 of 44 resume rules in the shipped CSS bundle. The 3 inline hex in `data/phenotype.js` are PERSONAS *data* values that `resume.js` never reads. |
| 0 new font families | PASS | 2 declarations, both token refs (`var(--font-display)`, `var(--font-meta)`). |
| Bundle cap 230 KB | was FAIL, now GATED | 220,049 B = 93.4% of cap after the `de5d511` fix. **Enforced** since `9380916`: detector check 28 asserts <= 235520 B, fault-injected at 520,049 B to prove it fires. |
| 0 emoji | was UNCLEAR, now GATED | Zero emoji, and **enforced** since `9380916`: detector check 29 covers U+1F300-1FAFF and U+2600-27BF over the 4 user-facing files, fault-injected to prove it fires. |
| `prefers-reduced-motion` | PASS | Real rule at `resume-timeline.css:253-258`; `reveal.css:64-73` forces `opacity:1; transform:none; transition:none`. |
| Skip-link + `aria-live` | was FAIL, now FIXED | Skip-link always real. `aria-live` added at `de5d511`, following the app's single-attribute convention. |
| 60fps transform/opacity | was FAIL, now FIXED | Dead `transition: width` removed at `de5d511` after the dead-code claim was proven, not assumed. Reveal animation itself was always clean. |
| 4 ROLES + 2 PERSONAS | PASS | `ROLES.length === 4`, `Object.keys(PERSONAS)` = 2, confirmed by node import. |
| Tests + 85% coverage floor | **now GATED** `b68f3a1` | Line coverage 89.29% against an enforced 85 floor, verified to exit 1 when unmet. Helper tests plus 6 resume-view tests and 4 router tests. Caveat: function coverage is 83.43% and is NOT bounded by the gate. |
| File size <=350/<=500 | PASS | All 6 files under target; `phenotype.js` is the largest at 322. |

#### Resolved: the 85% coverage floor is now ENFORCED `b68f3a1`

This was the last documented-but-unenforced
constraint. It is now a real gate.

```
"test:coverage": node --test --experimental-test-coverage
  --test-coverage-include='scripts/**/*.js' --test-coverage-lines=85
```

`--experimental-test-coverage` is load-bearing, not
decorative: without it the threshold flag is ignored
and exits 0 at 89.29%, a silent pass. Verified by
forcing the threshold to 100, which printed "does not
meet threshold" and exited 1.

Scope: loaded files (89.29% lines), not include-all
(49.51%). The include-all figure counts 34 DOM or
build-entry files exercised by Playwright, which a
node flag cannot measure; no dead code was in that
gap. A permanently-red gate gets disabled by whoever
inherits it, which is worse than no gate.

Kept out of `npm test` (still ~24s) and out of the
detector (still ~1.5s).

`.github/workflows/ci.yml` is the repo's **first CI**:
ubuntu-latest only, no macOS or Windows or large
runners, per the CI billing policy.

Two honest limits: CI has never executed on GitHub, so
it is verified by YAML parse and local step
equivalence only. And the gate bounds **lines only**,
while function coverage is 83.49% — below the floor.
See the contract finding below, because it turns
out this is not a judgement call.

#### RESOLVED by contract research: the 85% floor is NOT a single metric

I had been treating "which metric does 85% mean?" as
an open judgement call. It is not. The contract
answers it, and the answer is that **all three are
required as separate cells.**

`qa/ASSURANCE-CONTRACT.md:7` (docs-3 and docs-5 are
byte-identical) states: "Line, branch/decision and
function measurements are distinct" and requires
**per-family** 85% floors. `qa/METRICS.md:7-18`
enumerates 9 distinct structural cells, each at 85
(executable-lines, branches-decisions, functions x
unit/integration/e2e). `REQUIREMENTS.md:301-305`,
REQ-05-04: "Keep line, branch/decision, function and
behavioral metrics distinct where supported", with
acceptance criterion "High line coverage cannot hide
required low branch coverage."

So the gate was **incomplete, not merely
narrow**. Both gaps are now closed at `022b1d1`:

| Metric | Was | Now | Floor |
|---|---|---|---|
| Lines | 89.29% PASS | **93.43%** | 85 |
| Branches | 92.26% PASS | **92.39%** | 85 |
| Functions | 83.49% **FAIL** | **86.37%** | 85 |

`test:coverage` now passes `--test-coverage-branches=85`
and `--test-coverage-functions=85` alongside lines, so
the gate enforces the per-family floors the contract
actually specifies. Each threshold was proven to fire
by running it at 100 and confirming exit 1.

The function gap was 9 of 539 functions. Closed with
real tests in three modules that reached 100% function
coverage: `card-icons.js`, `systems-plate.js` and
`dom.js`. `cast-player.js` (19 uncovered) and
`scroll-reveal.js` (13) were deliberately left alone —
they need genuine IntersectionObserver/RAF fakes, which
is a much larger job than the 9 functions required. Suite
741 -> 765.

Precedent across the fleet is mixed and should not
override the contract: koosha-phenotype and HeliosLab
bound lines only; phenoDesign (vitest) and OmniRoute
(c8) bound all four metrics at 80 and 60; the argis CI
template declares `MIN_COVERAGE 85 / MIN_BRANCH 75 /
MIN_FUNCTION 80` but wires only the line bound — the
same gap this repo had.

**Closed at `022b1d1`.** Both the gate and the
function gap are done, so the "permanently-red gate
gets disabled" sequencing problem no longer applies.
`cast-player.js` and `scroll-reveal.js` remain the
next coverage targets if the floor ever rises.

#### SEO defects found and fixed

Three, all user- or crawler-visible:

1. **`/parent` shipped a not-found title** (`02ad381`).
   `setPageMetadata`'s view->label map had no `parent`
   key, so `/parent` rendered correctly but its document
   title read "Page not found — Koosha Paridehpour" —
   what a link preview and a crawler use. One line.
   Correction: the canonical URL was **not** affected;
   it is derived independently from `route.view`.
2. **`archive.html` was a soft-404** (`ef17576`). A
   3646-byte empty shell with no view, no prerender
   entry, no route and no inbound link, yet it was
   **live in the production sitemap** and returned 200
   while rendering not-found. Deleted along with all
   five registries referencing it, including a
   `vercel.json` rewrite that would otherwise have 404'd
   after the file was deleted. Page count 30 -> 29.
   The Archive drawer on `/work` is untouched — the
   concept is fully realized there.
3. **The sitemap was inverted** (`ef17576`). It listed
   the dead `/archive` while omitting `/parent`, a real
   prerendered view linked in the primary nav. Both
   registries were hand-maintained and had drifted in
   opposite directions.

`tests/route-coherence.test.js` now prevents the class:
every sitemap URL must resolve to a non-`not-found`
route, every staged page must have prerendered
`#view-root` content unless allow-listed, and sitemap
and staged pages must agree in **both** directions.

Why the suite never caught it: `internal-nav.test.js`
listed `archive.html` only as a member of
`STATIC_PAGES`, which asserts it has a noscript block
and exists on disk. It never required a link or a view,
so it passed 3/3 while the page was dead.

#### 2026-10-16: DEPLOYED TO PRODUCTION — VERIFIED

Operator signalled "do it yourself" at 00:33Z.
`npx vercel deploy --prod --prebuilt --yes` completed and
aliased to https://kooshapari.com.

| Deployment | Value |
|---|---|
| Inspect | `vercel.com/.../kooshapari-site/2SqmHBvwPcyYQytgN5eJESnf3oUu` |
| Production alias | `https://kooshapari-site-34tfieqek-koosha-paridehpours-projects.vercel.app` |
| Aliased domain | `https://kooshapari.com` |
| Live bundle | `app.bundle.0403d845.js`, 220,293 B |

Verified against **live production** in a real browser
with JS enabled. This was the check that mattered: the
original bug returned HTTP 200 while rendering not-found,
so status codes alone prove nothing here.

| Route | Title | Renders | Errors |
|---|---|---|---|
| `/resume.html` | Resume | YES - h1 Experience, 4 `.resume-node` | 0 |
| `/work/sharecli.html` | ShareCLI | YES - workbench mounted, 17 buttons | 0 |
| `/work/netweave.html` | NetWeave | YES - workbench mounted, 11 buttons, 5 tabs | 0 |
| `/parent.html` | Parent | YES - h1 Parent | 0 |
| `/resume` | Resume | YES - 4 `.resume-node` | 0 |
| `/archive.html` | 404 | not-found, page correctly deleted | expected |

**The `.html` bug is confirmed dead**: `/resume.html`
carries 4 `.resume-node` in the raw HTML *and* 4 in the
rendered DOM after JS settles, so the client router no
longer discards correct prerendered markup. Workbench
mount was proven by a source-vs-DOM delta — the
prerendered HTML contains 0 buttons while the rendered
DOM has 17 and 11 workbench-specific ones, which can
only come from runtime JS.

Also confirmed live: sitemap has `/parent` and no
`/archive` (27 entries), and `data/phenotype.js` is
byte-identical to the local prebuilt (sha256
`9ca3d36f...`, 12,204 B).

**Honest limits on this verification:** nav-link clicks
trigger full document navigation, so client-side SPA
view-swap was not exercised — only direct URL loads.
Headless Chrome at a single 1440x1000 desktop viewport
only: no mobile, no Safari, no Firefox. Workbench
*functionality* was verified by mount, not by driving
its controls. And `/archive.html` now serves Vercel's
edge 404 rather than the app's own styled 404 view,
because the page was deleted; whether that should be a
soft 404 via a `vercel.json` rewrite is a product call.

#### Deploy preflight (2026-10-15, superseded by the deploy above)

Everything below is verified ready. Nothing has been
deployed; that waits on the operator signal.

| Check | State |
|---|---|
| Working tree | clean |
| Prebuilt | `dist/bundled/app.bundle.0403d845.js`, 220,293 B (under the enforced 235,520 B cap) |
| Pages staged | 29 (9 top-level + 15 `work/` + 5 `blog/`) |
| Tests | 765/765 |
| Build | 29 pages, 0 warnings |
| Coverage gate | lines 93.43%, branches 92.39%, functions 86.37% vs 85 |
| Detector | 0 violations across 29 patterns |
| `npm run check` | clean |
| Vercel CLI | installed |
| Vercel auth | present at `~/Library/Application Support/com.vercel.cli/auth.json` |
| Project link | `.vercel/project.json` exists |
| Residual `/archive` refs | none in source, dist or sitemap |
| **Playwright acceptance** | **28/28 passed**, 90s, exit 0 |

The e2e suite is the acceptance-level gate and had
**not been run at any point earlier in this arc**,
which was a real gap. It runs unmodified
(`npm run test:e2e`); `playwright.config.js` already
pins `channel: 'chrome'`, so no override was needed
even though Playwright ships no bundled browsers on
this host.

It confirms the artifact that would ship: 29 staged
pages (`Hashed bundle references applied to 29
page(s)`), and no stale 30-page assertion survives
anywhere in `tests/` or `scripts/`. It also exercises
the `ef17576` edit that removed `/archive` from the
suite's ROUTES array.

A separate manual route matrix over real Chrome
against the preview server, 9 routes, confirms the
specific fixes:

| Route | Status | Renders | Console/page errors |
|---|---|---|---|
| `/resume` | 200 | 4-role timeline, 8 sections | 0 |
| `/resume.html` | 200 | identical 2772-char body | 0 |
| `/work` | 200 | Work Index | 0 |
| `/work/sharecli` | 200 | workbench MOUNTED, 27 controls | 0 |
| `/work/netweave` | 200 | workbench MOUNTED, 21 controls | 0 |
| `/parent` | 200 | title "Parent — Koosha Paridehpour" | 0 |
| `/archive` | 404 | not-found | 1 self-referential 404 |
| `/definitely-not-a-real-path` | 404 | not-found | 1 self-referential 404 |
| `/blog` | 200 | Writing | 0 |

Honest limits on this evidence: the two 404 routes log
one console error each — that is the browser logging its
own 404 document, not a defect, so "0 console errors" is
not literally true for those two. Workbench
*interactivity* is evidenced by mount and control
counts rather than an observed state transition. And
this is the local preview server, so Vercel-only
behaviour (rewrites, headers, CDN) is still unverified
until a deploy happens.

Note the auth path: `VERCEL_TOKEN` is **not** in a shell
env, and `~/.vercel/auth.json` does not exist. The CLI's
credential lives at the macOS-standard
`~/Library/Application Support/com.vercel.cli/auth.json`.
Anyone re-running this preflight should not conclude the
CLI is unauthenticated from `~/.vercel` alone.

Unblock phrases: **"ship prod"**, **"ship preview"**, or
**"no ship"**.

#### CRITICAL: every `.html` page URL was broken in the browser — FIXED `d0993df`

This is the most serious bug found in the whole arc,
and it was **live in production** until a ship signal.

`parseSegments()` split the path but never stripped a
trailing `.html`, so `/resume.html` resolved to
`not-found`. `app.js` `render()` runs at boot and its
not-found branch does `viewRoot.innerHTML =
renderNotFound()`, so the SPA **threw away the correct
prerendered markup the static host had already
served**.

It was invisible to no-JS checks because the server was
never wrong, only the client router: `curl /resume.html`
returned 200 with real resume content, while a browser
with JS on rendered "Page not found". Live proof:
`https://kooshapari.com/resume.html` showed title
"Page not found — Koosha Paridehpour", view-root cut
to 31 chars, canonical rewritten to `/not-found`.

**All 30 staged pages were affected**, not just resume:
index, engineering, product, work, contact, blog and
archive included.

Fixed as one general rule — strip `.html` from the
last segment — rather than a `/resume` special case,
so project slugs (`/work/sharecli.html`) and post
slugs (`/blog/<slug>.html`) are covered too. A bare
`.html` that would strip to empty is left intact so
unknown paths still 404. Guarded by 4 new tests
(`d0993df`, suite 720 -> 724).

**This raises the priority of item 5.** Until the site
is deployed, production serves a broken not-found page
for every `.html` URL, including every page a crawler
or a shared link would use.

#### Audit totals

Recounted from the table itself, because the first
totals I wrote were wrong.

| | PASS | GATED | FIXED | FAIL | UNCLEAR |
|---|---|---|---|---|---|
| At audit time | 6 | 0 | 0 | 3 | 1 |
| After remediation | 5 | 4 | 2 | 0 | 0 |

That is **10 of 10 constraints satisfied** — 5 always-passed,
4 now gated (bundle cap, emoji, coverage, and the file-size
target cleared by `8e6fa31`), and 2 fixed. No failures
remain open. Two caveats survive: a contract question about
which metric "85% coverage" means, and the fact that CI has
not yet executed on GitHub.

Earlier revisions of this line claimed "7 PASS", then "9 of
10". Both were wrong in different directions because the
figure was carried forward rather than recounted from the
table. The row above is derived from the table itself.

Remediation: constraints fixed (`de5d511`), three items
turned into enforced gates (`9380916`, `b68f3a1`), and
one size regression I introduced was reverted (`8e6fa31`).
Four bugs were found outside the audit itself: the `/work`
dynamic imports (`bb59100`), orphaned `radar.css`
(`3b8930d`), the inert lens control (`6982683`), and the
`.html` routing break (`d0993df`).

**The pattern worth naming: constraints with gates hold;
constraints without gates drift.** Every bug found in
this arc was invisible to the 7-step curl recipe, because
that recipe proves identity and availability, not
behaviour.

#### Resolved: bundle-js.js size target — REGRESSION I INTRODUCED, `8e6fa31`

This section previously said decomposition was
deferred. It was not deferred, because the
over-length file was **my own regression** from
`bb59100`, not a pre-existing condition.

`bundle-js.js` went 340 -> 408 lines when I added the
dynamic-import rewrite, making it the only file in
`scripts/` over the 350 target (the 500 hard limit was
never breached). The rewrite is one cohesive build-step
concern, so it moved to `scripts/rewrite-dynamic-imports.js`
(93 lines) and `bundle-js.js` is back to exactly 350.

Proof it is a pure move: the emitted bundle is
byte-identical, sha256 `2251bb96...`, confirmed with `cmp`,
and all 11 lines of the guard's error output were
diffed against HEAD unchanged. The guard still fires.

Note for the next owner: 350 is exactly at the target, so
this file will trip the warning again on the next
substantial addition. Decompose the module walker next
time it is touched for a real reason.

#### Out of scope but found: broken dynamic imports in /work — FIXED `bb59100`

The bundle's dynamic `import("../media/netweave-workbench.js")`
and `import("../media/sharecli-workbench.js")` resolved to
`/media/*.js`, but the files live at `dist/scripts/media/`.
Observed `net::ERR_ABORTED` on `/work/netweave` and
`/work/sharecli`; the workbench subtree never mounted. The
error was swallowed by a `.catch` that only logs, so the
page still rendered its heading — a silent failure.

This was **not** a resume defect: resume is slug-gated and
fires neither import. Fixed anyway because it was a real,
silently-failing bug in the same bundle.

Cause: the bundler only walks static `import ... from`
declarations, so a dynamic specifier is copied into the IIFE
verbatim and the browser resolves it relative to the served
bundle. Fixed by rewriting the specifier to the absolute
`/scripts/media/<name>.js` at build time. The guard requires one
rewrite per workbench and aborts the build naming any missing
specifier, because a count-only check let a single rename through
and shipped a 404-ing workbench.

Verified in a real browser: netweave and sharecli both went from
absent-with-4-errors to mounted-with-0-errors, and both are
interactive.

#### Width transitions in other stylesheets — triaged, mostly NOT bugs

The 4 remaining `transition: width` sites were triaged rather
than blindly fixed. Result: **1 dead, 3 intentional, 0 unguarded.**

| Site | Target | Verdict | Action |
|---|---|---|---|
| `radar.css:102` | `.ax-row .bar > span` | **DEAD_NO_MUTATION** | Nothing ever sets that width; the sheet is fully orphaned (git grep for all 9 of its classes returns nothing) and ships dead CSS. |
| `shell.css:68` | `.atelier-nav a::after` | LIVE_INTENTIONAL | CSS hover `0` -> `100%`. A working underline reveal. |
| `artifacts.css:82` | `.home-primary-links a::after` | LIVE_INTENTIONAL | Same hover-underline pattern. |
| `cast-player.css:250` | `.cast-player__scrubber-fill` | LIVE_INTENTIONAL | Real media scrubber, width mutated per-frame in `cast-scrubber.js`. Width is the correct property; a transform swap would be a behaviour change. |

The decisive correction to the earlier framing: **a global
reduced-motion kill switch already covers all four.**

```
styles/tokens.css:264-271
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

It ships in the core bundle and loads before components/pages,
and `!important` wins, so reduced-motion coverage was never the
problem. So "4 bad width transitions" was wrong — it is 1 dead
sheet and 3 correct decisions.

Open option: `radar.css` was resolved — deleted at
`3b8930d` after re-verifying all 9 of its selectors were
unreferenced. Shipped CSS dropped 2,323 B. Note the same
prior audit also recommended deleting `cast-player.css`,
which would have broken a live media scrubber, so its
list was **not** applied wholesale.

#### Two smaller things found along the way

- `BADGE_CLASS.resume-badge--leadership` is dead: no
  role's `framing[0]` yields `Leadership`.
- The SPA router renders the not-found view for any
  `*.html` path, so `/resume.html` shows "Page not found"
  while `/resume` works. Pre-existing and unrelated to
  this arc, but worth its own ticket.

#### 2026-10-16: two worker verification passes on live production

Two scoped read-only workers were dispatched against
https://kooshapari.com to close the two gaps the
deploy section itself flagged as honest limits:
nav-click behaviour and mobile viewports. Both
returned **PASS**. Neither changed a single repo file
(`git status --porcelain --untracked-files=all` empty
for both; all scratch work lived outside the repo).

**Pass 1 - nav clicks (cat).** Concern: the deploy
verification used direct URL loads only, so client-side
view-swapping was unexercised and the site could still
be doing full reloads on every nav click.

Method: a `window.__marker` set before the click and
read after, in real Chrome (`channel:'chrome'`), run
identically against the local preview on :4197 and
against live. A lost marker means a new document.

| Check | Local | Live |
|---|---|---|
| marker_survived | NO | NO |
| framenavigated | YES (3) | YES (3) |
| console errors | 0 | 0 |

Verdict: **INTENTIONAL_FULL_LOADS, not a defect.**
`scripts/prerender.js` emits a separate static document
per route (index / engineering / product / work /
resume / contact / parent / blog + `work/<slug>` +
`blog/<slug>`). With JavaScript **disabled**, `/parent`
still renders fully (title "Parent", h1 "Parent",
view-root 3757 chars, nav links intact) locally and
live. An SPA would render nothing. No performance
problem either: `/resume` live is 3.9 KB, FCP ~272 ms,
domInteractive 70 ms.

Root cause of the original ambiguity, now recorded:
`navigateTo()` (router.js:30-37, pushState +
routechange) has **zero callers** and
`initTransitions` is imported by app.js:20 but never
called. `git log -S "closest('a')"` is empty, so click
interception was never present and nothing regressed.
No fix applied. The dead code plus docs calling this an
"SPA" is a real inconsistency (operator decision),
since wiring click interception would **delete** the
no-JS guarantee and forfeit prerendered per-route SEO.

**Pass 2 - phone widths on /resume (chipmunk).**
Viewports: 390x844, 360x800, 320x800 (768x1024 tablet
also checked, excluded as not phone). HTTP 200, title
"Resume - Koosha Paridehpour", h1 "Experience", 4
`.resume-node`, at every width.

| Metric | 390x844 | 360x800 | 320x800 |
|---|---|---|---|
| scrollWidth - clientWidth | 0 | 0 | 0 |
| out-of-bounds elements | 0 | 0 | 0 |
| nodes at opacity 1 after scroll | 4/4 | 4/4 | 4/4 |
| `[data-reveal]` at opacity 1 | 19/19 | 19/19 | 19/19 |
| overlapping node pairs | 0 | 0 | 0 |
| sub-24px touch targets | 0 | 0 | 0 |
| console / page errors | 0 | 0 | 0 |

Overflow was checked both at load and after scrolling
the full document, and cross-checked by enumerating
every DOM element whose bounding box exceeded the
viewport width. Timeline columns correctly collapse to
a single full-width column on phones (the alternating
two-column layout only appears at >=768px). Header
`headerBottom == contentTop` (349 == 349) at scrollY
0 / 400 / 1600, so nothing is hidden under the sticky
bar.

**The one real finding, in either pass: phone header
density.** The sticky header is 349px at 390x844
(**41.3%** of the viewport) and 349px at 360x800
(**43.6%**), leaving only 495px / 451px of visible
content. It grows to 393px at 320px. It **does not
shrink when scrolled** - measured 349px at scrollY 0,
400 and 1600 - because `.atelier-header--scrolled`
(styles/shell.css:20-24) only sets `box-shadow` and
`border-bottom-color` and has no height effect. The
height itself comes from `@media (max-width:860px)`
putting nav on `grid-row: 2` with `padding-top:
var(--space-3)` and `@media (max-width:560px)` stacking
`.atelier-tools` in `column-reverse`. At 768px the
header is 182px (17.8%), so this is phone-class only.

This is a defect on the highest-traffic viewport class,
not a caveat: the top ~40% of a phone screen is
permanently occupied by chrome. Nothing is broken or
unreachable, which is why neither worker marked a FAIL.
Tracked as open work.

Honest limits on this evidence: both passes are
Chrome-only, headless, `channel:'chrome'`. No
Safari/iOS WebKit, no Firefox, no real device. Touch
targets were measured by bounding box, not by observed
tap behaviour.

**Handoff doc line 109-110 correction.** This document
still calls `scripts/app.js` an "SPA router" and says
the page "works both with JS (SPA mode) and without JS
(prerendered HTML fallback)". Pass 1 shows the SPA mode
is effectively vestigial for navigation: there is one
static document per route and nav clicks are full loads
by design, so the JS path re-renders content into an
already-correct document rather than swapping views.
The "prerendered HTML fallback" framing is correct; the
"SPA mode" framing is not.

#### 2026-10-16 01:11Z heartbeat tick 2

Live `/resume` still HTTP 200. HEAD was `22ba965`. Working
tree was clean. The header-fix worker (lobster) had been
running ~10 minutes, had written a read-only probe at
`~/.jcode/scratch/measure-header.mjs`, and had not edited
`styles/shell.css` (mtime still 2026-09-19). Stopped it.

Applied the phone-header change directly in
`styles/shell.css` inside `@media (max-width: 560px)` only.
The 249px tools stack (`column-reverse`) is now one
horizontal scrolling row (`minmax(0, 1fr)`, `min-width: 0`
so the row cannot widen the page). The subtitle is one
line. `.atelier-header--scrolled` now tightens padding and
hides the subtitle. Name and all four nav links stay in
the DOM. Desktop rules were not edited. The CSS is
uncommitted. Verification and the test gate have not run,
so this is not a measured fix yet and nothing was deployed.

#### 2026-10-16 01:24Z heartbeat tick 3

Live `/resume` still HTTP 200 (`date: Fri, 16 Oct 2026 01:24:47 GMT`).
HEAD is `19868c1`. Working tree is still only the phone-header
CSS: `styles/shell.css` +52/-9, uncommitted. Desktop rules are
untouched. The scrolled phone rule hides the subtitle, tightens
padding, and puts tools on one scrolling row. Name and nav links
stay in the DOM. This is still an unverified candidate.

The earlier viewport worker (shrimp) timed out while reading the
preview server, which serves `dist/` and would have measured the
old 349px header. It was stopped. Replacement measurement is
`session_frog_1792113821900_a10ab5b1591c068e` (MiniMax-M3), still
running at this tick: it is reading `scripts/bundle-css.js` and
`scripts/stage-publication.js` so the preview includes the
uncommitted CSS before measuring 320/360/390/768 at rest and
after scroll. No test run. No deploy.

Stray untracked file `css-verify-temp.mjs` (120 lines) is in the
repo root. It is not part of the fix and must not be committed.

#### 2026-10-16 01:36Z heartbeat tick 4

Live `/resume` still HTTP 200 (`date: Fri, 16 Oct 2026 01:35:49 GMT`).
HEAD is `52490b0`. Working tree is still only `styles/shell.css`
(+52/-9), uncommitted. `css-verify-temp.mjs` is no longer in
`git status --porcelain`.

Measurement worker `session_frog_1792113821900_a10ab5b1591c068e`
(MiniMax-M3) is still running, about 12 minutes in, and has not
written a result. It did copy source styles into `dist/styles/`
at 18:31:54 PDT (so a preview measurement can see the uncommitted
phone rules). It wrote `/tmp/measure-resume.mjs`, which reads
`http://127.0.0.1:4197/resume` and is supposed to write
`~/.jcode/scratch/header-measure-20261016.json`. That JSON does
not exist yet. The preview on :4197 is up (HTTP 200, node pid
52338). No Playwright process was running at this tick, so the
script has not executed. No test run. No deploy.

A measurement that skips this rebuilt `dist/styles/shell.css` is
invalid: the preview serves `dist/`, and the old header was 349px.
