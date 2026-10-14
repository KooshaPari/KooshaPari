# 2026-10-15: Doc-proliferation cleanup, round 3 (non-glob loose docs/ root)

## Filename decision

The brief instructs writing `00_SESSION_OVERVIEW.md` next to the round-2 file of
the same name. A literal duplicate name cannot coexist in one folder, so the
new entry is co-located in the session folder root under
`02_ROUND3_OVERVIEW.md`, continuing the folder's numbering pattern:
`00_SESSION_OVERVIEW.md` (round 2) -> `01_LEDGER_ADDENDUM.md` (round 2 ledger
fix-forward) -> `02_ROUND3_OVERVIEW.md` (round 3 summary, this file).

## What was done

Four loose `docs/`-root files were moved into the existing round-2 cluster
subfolders. None were deleted; all history is preserved (`git log --follow`
on the new paths traces back to the original commits in committed history; the
AUDIT file traces to its first-author commit `02656ca` rather than the absorb
because it was authored after the absorb on 2026-09-27). The moves were
implemented as four `git mv` operations, each detected by git at 100%
similarity (R100) with `0 insertions(+), 0 deletions(-)` against `HEAD`.

| Source (pre-move)                                       | Bytes | Target subfolder (round-2)                              |
|---------------------------------------------------------|------:|---------------------------------------------------------|
| `docs/asset-visual-review-netweave.md`                  | 4,803 | `netweave-asset-production/2026-09-05-asset-visual-review-netweave.md` |
| `docs/AUDIT-collisions-e7b69ad.md`                     | 3,256 | `audit-readiness/2026-09-09-audit-collisions-e7b69ad.md` |
| `docs/TERMINAL_PLAYBACK_EVIDENCE_2026-09-06.md`         | 2,005 | `audit-readiness/2026-09-06-terminal-playback-evidence-decision.md` |
| `docs/PORTFOLIO_PROMPT_INVENTORY_2026-09-05.md`         | 17,382| `audit-readiness/2026-09-05-portfolio-prompt-inventory.md` |
| **TOTAL**                                               |**27,446** |                                                     |

All four bytes-counts are byte-identical to the pre-move `ls -la docs/`
listing. `git diff --stat HEAD` reports `0 insertions(+), 0 deletions(-)`
across all 4 paths.

## Why these four fit into existing round-2 subfolders

- **asset-visual-review-netweave.md -> netweave-asset-production/**
  Reviewed by `asset_visual_acceptance` against the same NetWeave local-rules
  output bundle referenced by the three existing cluster members (`plan`,
  `integration`, `v3-blind-draft`). The cluster's identity is the NetWeave
  asset pipeline; visual acceptance of that pipeline output is a natural
  fourth member.

- **AUDIT-collisions-e7b69ad.md -> audit-readiness/**
  Pre-existing five-member cluster is the Sep 7 - Sep 10 audit window. The
  collisions audit is a post-incident forensic artifact (`SELECTOR`,
  `clamp`, `DEFAULT_SPEED` globals collided; byte-level evidence from the
  shipped `bundled/app.bundle.7b217faa.js`) and reads as an audit-day
  deliverable. Although first-committed 2026-09-27 (after Sep 10), its topic
  fits the cluster's identity; the `2026-09-09` date prefix is the operator-
  provided default for "no in-prose date hint."

- **TERMINAL_PLAYBACK_EVIDENCE_2026-09-06.md -> audit-readiness/**
  A decision artifact (`do not present as historical ShareCLI/CLIProxyAPI++
  demonstration`) authored against audited material. Reads as an audit-day
  evidence-disposition note; topic-aligned with the cluster even though the
  cluster's other members are release-readiness focused.

- **PORTFOLIO_PROMPT_INVENTORY_2026-09-05.md -> audit-readiness/**
  An inventory/synthesis artifact (9 primary-estate `*pmp*.md` files read on
  2026-09-05) that locks down the portfolio/brand/recruiting requirements
  before a prompt-revision pass. Same intent class as the other audit-readiness
  members: preserve the state of an artifact before a downstream change.

## Date-prefix inference rationale

The four target filenames all use the round-2 cluster convention
(`2026-09-DD-name.md`). Date per file:

- `2026-09-05-asset-visual-review-netweave.md` -- the file body states
  "Reviewed 2026-09-05, 03:48 PDT by `asset_visual_acceptance`"; filesystem
  mtime is also Sep 5 04:15.
- `2026-09-09-audit-collisions-e7b69ad.md` -- the original filename's
  `e7b69ad` is a commit hash, not a date. The file body has no explicit date.
  The brief's explicit rule for this case is "defaulting to 2026-09-09 if
  unclear," which was applied. For traceability, the file was first-committed
  on 2026-09-27 by `docs(bundler): correct collision severity claims from the
  reveal fix` (commit `02656ca`) -- this is the audit-content authoring date,
  not the audit-event date the file documents.
- `2026-09-06-terminal-playback-evidence-decision.md` -- the original filename
  already encoded `2026-09-06`; filesystem mtime is Sep 5 23:03. Preserved.
- `2026-09-05-portfolio-prompt-inventory.md` -- the body states "The
  inventory was performed on 2026-09-05"; filesystem mtime is Sep 17 20:55.
  The body date wins.

## What was NOT done

Explicit out-of-scope set per the brief and round-1 deferral:

- `docs/CAREER_CONTEXT_ANDURIL_*.md` (4 files: `CAREER_CONTEXT_ANDURIL_2026-09-05.md`,
  `CAREER_CONTEXT_ANDURIL_EARLY_2026-09-05.md`, `CAREER_CONTEXT_ANDURIL_FINAL_INTERVAL_2026-09-05.md`,
  `CAREER_CONTEXT_ANDURIL_MIDDLE_2026-09-05.md`). Round-1's
  `00_SESSION_OVERVIEW.md` explicitly deferred these as "date-prefixed, but
  contain external narrative. Deferred." Not touched in round 3.
- `docs/superpowers/` -- separate planning-archive convention; not touched.
- `docs/sessions/` -- all nested session folders (including round 1 and round
  2) preserved as-is; no file modified or moved.
- Any source, test, CSS, HTML, or JS file.
- The `VERCEL_TOKEN` / hosted gate.
- The round-2 session folder's existing `00_SESSION_OVERVIEW.md` and
  `01_LEDGER_ADDENDUM.md` -- preserved.
- The cluster subfolders' existing files (only the 4 targets above were
  moved into them; no churn elsewhere).

## Verification

| Check                                   | Result                                                                          |
|-----------------------------------------|---------------------------------------------------------------------------------|
| `git status` after `git mv`             | 4 renames, R100, no other staged modifications, no untracked files             |
| `git diff --stat HEAD`                  | `4 files changed, 0 insertions(+), 0 deletions(-)` across all 4 renames        |
| `git diff --cached --find-renames=100` | All 4 reports `similarity index 100%`                                            |
| `git log --follow` (preimage, committed) | asset-visual, TERMINAL_PLAYBACK, PORTFOLIO_PROMPT -> `9ac2bdb`; AUDIT -> `02656ca`->`d363946` |
| File sizes (pre == post)                | 4,803 / 3,256 / 2,005 / 17,382 bytes -- byte-identical                          |
| Original paths removed                  | All 4 `ls docs/<orig>` return `No such file or directory`                       |
| New paths exist                         | All 4 present at the new locations                                              |

Note on history: `git log --follow` operates on committed history. Pre-commit,
the renames are only staged, so the new-path `git log` chains are empty until
the move is committed. The preimage chains (above) confirm that the underlying
history is intact and will surface under the new paths after commit.

## Carry-forward

- `docs/CAREER_CONTEXT_ANDURIL_*.md` (4 files) remain at `docs/` root.
  Round-1 explicit deferral preserved; round-3 also deferred.
- `docs/superpowers/` tree untouched; separate convention.
- Round-3 produced no remaining loose `docs/`-root cluster candidates. The
  remaining `docs/`-root files after this round are the four deferred
  CAREER_CONTEXT_ANDURIL files and a small set of canonical repo doc roots
  (e.g., `AGENTS.md` analogs) that belong at the root by intent.

## Files added in this round

- `docs/sessions/2026-10-15-doc-proliferation-round-2/02_ROUND3_OVERVIEW.md`
  -- this file.
