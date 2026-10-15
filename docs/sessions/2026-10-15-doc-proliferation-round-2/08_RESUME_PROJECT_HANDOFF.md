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
| `data/phenotype.js` | source of truth (ROLES, PERSONAS, EDUCATION, IDENTITY, TIMELINE, RECRUITER_STATS, PHENOTYPE, SOURCE) | 12,204 B |
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
