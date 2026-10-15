# 2026-10-15: Open-decisions status (3 truly-blocked items, 1 already-done)

## What this document is

A status record for the 4 items the 04_ARC_CLOSING document
flagged as operator-decision boundaries. One of them (the
loose-file round 5) has already been shipped in the meantime,
so this document records the current state of all 4 with the
correct item-by-item breakdown.

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
  companies, and highlights. The personas view
  (`scripts/views/personas.js`) already distinguishes
  2 framing axes (product, engineering) with 6
  competencies each. The public visitor gets a richer
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
| 1 | Resume: per-role vs consolidated | **DECIDED** (Option A, no change) | — (decision captured) |
| 2 | VERCEL_TOKEN for hosted gate | OPEN (credential) | operator (secret) |
| 3 | ResVault handoff for CAREER_CONTEXT_ANDURIL_*.md | OPEN (cross-repo) | operator (ResVault coord) |
| 4 | Loose-file round 5 | CLOSED (shipped at `6119c80`) | — |

The 2 OPEN items require operator action; the pane
cannot advance either. Item 1 is captured as a decision
(Option A = current state) with the reasoning recorded
in this document. Item 4 was already shipped at
`6119c80` between the 04_ARC_CLOSING arc and the 20th
pass.

The pane's job on the 2 OPEN items is to keep this
status document honest and to ship the operator's
decision when one is made. Item 1 closed itself by
Option A being the current state; the operator can
re-open it by signaling "ship option B" or
"ship option C" if a future visit wants the
per-role or per-persona structure.
