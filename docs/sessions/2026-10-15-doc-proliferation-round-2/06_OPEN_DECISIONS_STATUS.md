# 2026-10-15: Open-decisions status (3 truly-blocked items, 1 already-done)

## What this document is

A status record for the 4 items the 04_ARC_CLOSING document
flagged as operator-decision boundaries. One of them (the
loose-file round 5) has already been shipped in the meantime,
so this document records the current state of all 4 with the
correct item-by-item breakdown.

## Item-by-item status

### 1. Resume: per-role vs consolidated — STILL OPEN (decision required)

The 04_ARC_CLOSING item 1 says the structural choice (separate
per-role detail pages vs one consolidated document) is the
operator's career voice, not the pane's. The current
implementation is a consolidated timeline view (4 ROLES
from `data/phenotype.js`) plus a single PDF link at
`/public/koosha-paridehpour-resume.pdf` (99,427 B). 4 variant
PDFs exist under `docs/resume-source/`:

- `Koosha_Paridehpour_Anduril_Resume_Targeted_Draft.pdf` (53,250 B)
- `Koosha_Paridehpour_Technical_Product_Program_Resume_Management_Master.pdf` (61,364 B)
- `Koosha_Paridehpour_Universal_Engineering_Resume.docx` (656,723 B)
- `MGMTProduct Resume-4.docx` (655,258 B)

The 2 PERSONAS in `data/phenotype.js` (product, engineering)
each have a `source: "KP-Prod.pdf"` / `source: "KP-Eng.pdf"`
reference, but neither PDF is published at those paths. The
4 ROLES are: phenotype (PM, 2020-present), akoma (Lead SWE,
2023-2024), cvs (DDAT, 2025), atoms (Lead SWE + TPM,
2025-2026). The 2 PERSONAS are persona-level aggregations of
the role data, not separate roles.

**Pane's read of the options** (operator decides, pane ships):

- Option A: keep the current consolidated timeline + 1 PDF.
  No change. The 4 variant PDFs stay under `docs/resume-source/`
  as reference material only.
- Option B: 2 persona detail pages (`/resume/product/`,
  `/resume/engineering/`) linked from the existing
  consolidated timeline. Each persona page links to its
  persona-specific PDF (would require extracting
  `KP-Prod.pdf` and `KP-Eng.pdf` from the existing
  `MGMTProduct Resume-4.docx` or `Universal_Engineering.docx`).
  Adds 2 new routes + 2 new prerender entries + 2 new
  playwright tests. ~150-200 lines of code + tests.
- Option C: 4 per-role detail pages (one per ROLES entry),
  each linking to a per-role PDF. Same per-role as
  `data/phenotype.js`. The 4 variant PDFs above already
  cover this taxonomy. Adds 4 new routes + 4 new prerender
  entries + 4 new playwright tests. ~300-400 lines of code
  + tests.

**Recommended: Option A** (current state). The 4 variant
PDFs are reference material that the operator uses when
applying for specific roles, not artifacts the public site
needs to expose. The consolidated timeline already
distinguishes 4 roles with their dates, companies, and
highlights, and the personas view already distinguishes
2 framing axes. The structural choice the operator makes
should be the one that best serves public visitors, not
the one that mirrors the variant taxonomy.

### 2. VERCEL_TOKEN for hosted gate — STILL BLOCKED (credential)

The 04_ARC_CLOSING item 2 says the credential is unset, so
hosted verification, Lighthouse, redirect map destination
check, and cutover are all blocked. The local gate is green
(29/29 e2e, 714/714 unit, build + serve path clean), but
no statement here covers the hosted domain behavior.

**Unblock action**: the operator runs `vercel login` in the
host environment, then sets `VERCEL_TOKEN` (likely via
`vercel env add VERCEL_TOKEN production`), then
`npm run verify` exercises the hosted gate. No code change
required.

**Pane cannot advance this without the credential.** Marked
as a pending decision in the cockpit-presentation todo list.

### 3. ResVault handoff for `CAREER_CONTEXT_ANDURIL_*.md` — STILL BLOCKED (cross-repo)

The 04_ARC_CLOSING item 3 says the 4 files now sit in
`docs/sessions/2026-10-15-doc-proliferation-round-2/career-context-anduril/`
and the right place for them is
`~/Documents/ResVault/.researchledger/` so they join
`linkedin-pass1/`, `github-pass1/`, `resume-claim-matrix`.
The round 4 commit `86700d2` made the move WITHIN the
koosha-phenotype repo. The cross-repo move is operator-only.

**Unblock action**: the operator runs the cross-repo
`git mv` from `docs/sessions/2026-10-15-doc-proliferation-round-2/career-context-anduril/`
to `~/Documents/ResVault/.researchledger/career-context-anduril/`
(or wherever the canonical ResVault path is). No code change
required in this repo.

**Pane cannot advance this without operator coordination
across the two repos.** Marked as a pending decision in the
cockpit-presentation todo list.

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

## Summary table

| # | Item | Status | Next-step owner |
|---|---|---|---|
| 1 | Resume: per-role vs consolidated | OPEN (decision) | operator (design voice) |
| 2 | VERCEL_TOKEN for hosted gate | OPEN (credential) | operator (secret) |
| 3 | ResVault handoff for CAREER_CONTEXT_ANDURIL_*.md | OPEN (cross-repo) | operator (ResVault coord) |
| 4 | Loose-file round 5 | CLOSED (shipped at `6119c80`) | — |

The 3 OPEN items all require operator action; the pane
cannot advance any of them. The pane's job on these items
is to keep the status document honest and to ship the
operator's decision when one is made.

The original `open-decisions` todo in the pane's todo list
is closed by this document. Each of the 3 OPEN items is
broken out into a more-specific pending todo with the
"blocked on" reason explicit.
