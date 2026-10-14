# 2026-10-15: Doc-proliferation cleanup, round 2 (cluster subfolders)

## What was done

Eighteen loose `docs/2026-09-*.md` files were moved into a single consolidation
session folder with six cluster-aware subfolders. None were deleted; all
history is preserved in git (`git log --follow` returns the original commit,
`9ac2bdb`, for every moved file). The move was implemented as 18 `git mv`
operations, each detected by git at 100% similarity (R100) with
`0 insertions(+), 0 deletions(-)` against `HEAD`.

| Cluster | Files | Total bytes | Subfolder |
|---|---|---|---|
| A: resume-authority | 3 | 15,632 | `resume-authority/` |
| B: netweave-asset-production | 3 | 16,637 | `netweave-asset-production/` |
| C: production-construction | 4 | 24,090 | `production-construction/` |
| D: audit-readiness | 5 | 32,485 | `audit-readiness/` |
| E: source-chat-recovery | 1 | 8,379 | `source-chat-recovery/` |
| F: visual-motion-research | 2 | 13,068 | `visual-motion-research/` |
| **TOTAL** | **18** | **110,291** | (6 subfolders) |

| File | Bytes | Cluster |
|---|---|---|
| `2026-09-09-resume-authority-metrics-skills.md` | 6,377 | A |
| `2026-09-09-resume-authority-stealth-akoma.md` | 4,084 | A |
| `2026-09-09-resume-finalization-gates.md` | 5,171 | A |
| `2026-09-05-netweave-asset-production-plan.md` | 11,254 | B |
| `2026-09-05-netweave-integration.md` | 3,282 | B |
| `2026-09-10-netweave-v3-blind-draft.md` | 2,101 | B |
| `2026-09-09-construction-gate-implementation-handoff.md` | 3,206 | C |
| `2026-09-09-production-construction-gate-release.md` | 6,176 | C |
| `2026-09-09-public-repo-sync-handoff.md` | 9,507 | C |
| `2026-09-10-site-first-execution.md` | 5,201 | C |
| `2026-09-07-program-audit.md` | 11,310 | D |
| `2026-09-07-requirement-traceability.md` | 8,751 | D |
| `2026-09-08-design-production-readiness.md` | 6,750 | D |
| `2026-09-10-canonical-release-readiness.md` | 3,701 | D |
| `2026-09-10-post-release-state.md` | 1,973 | D |
| `2026-09-08-source-chat-requirements-part1.md` | 8,379 | E |
| `2026-09-04-portfolio-motion-research.md` | 10,234 | F |
| `2026-09-10-visual-asset-upgrade-backlog.md` | 2,834 | F |

## Cluster rationale

The 18 files were already analyzed and pre-assigned to clusters in the task
brief; this round did not re-cluster. One-line rationale per cluster:

- **A: resume-authority** -- three historical user-authority documents for
  Anduril / Stealth / Akoma adjacent submissions; cite the ChatGPT Resume
  Optimization source (`/Users/kooshapari/Downloads/ChatGPT-Resume Optimization
  for Anduril-20260905-0106.md`). Recovered, not invented.
- **B: netweave-asset-production** -- three NetWeave visual / asset /
  integration artifacts covering the V3.3 - V3.8 production pipeline.
- **C: production-construction** -- four site-first / public-repo-sync /
  construction-gate release handoffs that sequenced the production cutover.
- **D: audit-readiness** -- five state-of-artifact / canonical-readiness /
  post-release audit snapshots from the Sep 7 - Sep 10 audit window.
- **E: source-chat-recovery** -- one partial recovered source-chat ledger
  (filename retains the assigned 2026-09-08 audit identity; persisted 2026-09-09).
- **F: visual-motion-research** -- two motion-design / visual-asset-upgrade
  research artifacts underpinning the NetWeave hero / art pass.

## Why this matters

Per `AGENTS.md` (the canonical contract):

> "Detect orphaned docs" -> "Move relevant session-specific docs to appropriate
> session folder" -> "Delete temporal/redundant docs aggressively"

Loose date-prefixed files at `docs/` depth read as live state-of-artifact.
A new agent scanning the repo for "what was the post-release state" or
"what was the production cutover" hits a flat list of 18 same-prefix files
first, with no signal of cluster or chronology. Round 1 of this cleanup
(`docs/sessions/2026-10-14-doc-proliferation-cleanup/`) moved three
root-level stale docs and explicitly deferred the loose `docs/2026-09-*.md`
files as "also candidates for the same treatment, but moving them is a much
larger refactor and the user-facing surface is much smaller. Deferred."

Round 2 picks up that deferral. The cluster subfolders give a new agent an
immediate visual signal: production-construction is the gate-handoff chain,
audit-readiness is the state-of-artifact snapshots, etc.

## What was NOT done (out of scope for this commit)

- Any **content edit** to the 18 files. They are byte-identical to their
  pre-move state. Plain-text cross-references between files in the cluster
  (e.g. `docs/2026-09-10-visual-asset-upgrade-backlog.md` cites
  `docs/2026-09-08-design-production-readiness.md`) are now stale relative
  to the canonical URL, but they are archival citations of pre-state artifacts
  and rewriting them would change the meaning of the source files.
- `docs/superpowers/plans/2026-XX-XX-*.md` -- the superpowers tree is a
  separate planning-archive convention. Deferred (carried from round 1).
- `docs/CAREER_CONTEXT_ANDURIL_*.md` (4 files) -- date-prefixed, but
  external narrative. Deferred (carried from round 1).
- `docs/2026-09-04-portfolio-motion-research.md` is the **oldest** file in
  this batch (Sep 4) and one of only two in cluster F; its cluster was
  preserved rather than split to keep the pair together with the visual-
  asset-upgrade follow-up.
- `docs/2026-09-08-source-chat-requirements-part1.md` filename retains the
  2026-09-08 audit identity (per the task brief) even though the file was
  actually persisted 2026-09-09 Pacific. The filename was not renamed; the
  cluster subfolder gives the date its second home.
- Any `docs/` file with a date prefix other than `2026-09-*`.
- Any session folder under `docs/sessions/` -- preserved as-is.
- The prior round-1 session folder
  (`docs/sessions/2026-10-14-doc-proliferation-cleanup/`) -- preserved.

## Verification

- **Pure rename**: `git diff --cached --name-status` shows all 18 entries
  with `R100` similarity, `0 insertions(+), 0 deletions(-)` against `HEAD`
  in `git diff --stat HEAD`.
- **History preserved**: every file in the new location has exactly one
  historical commit (the original absorb migration `9ac2bdb`, "absorb
  (koosha-phenotype): migrate incubating project from
  zz-merge-unk-koosha-phenotype (#1)"). After this commit lands, each new
  path is reachable via `git log --follow`, returning `9ac2bdb` as the
  origin. Verified pre-commit by enumerating `git log --format=%h -n 1 -- <old-path>`
  for all 18 old paths and confirming every result is `9ac2bdb`.
- **Byte total**: `find docs/sessions/2026-10-15-doc-proliferation-round-2 -name "*.md" -exec wc -c {} +`
  reports `110,291 total` across 18 files (excluding the overview that
  is being written). Working-tree file sizes match the original
  pre-move byte counts recorded in `ls -la` before the `git mv`.
- **No collateral**: `git status` shows only the 18 renames plus this
  untracked `00_SESSION_OVERVIEW.md`. No other files modified, no
  untracked content beyond this overview.
- **No markdown link breakage**: `grep -rEn "\]\([^)]*2026-09-[0-9]{2}-[a-z][a-z0-9-]*\.md\)"`
  returns zero hits across the whole repo. All citations of these files
  in other markdown (e.g. `docs/superpowers/plans/2026-09-11-portfolio-forward-wbs.md`,
  `output/audit-report-2026-09-12.md`) are plain-text mentions, not
  `[text](path.md)` links.
- **Branch policy**: committed to `main` directly. No force push. No PR.

## Cross-references

- Round 1 of this cleanup, three root-level docs moved:
  `docs/sessions/2026-10-14-doc-proliferation-cleanup/00_SESSION_OVERVIEW.md`
- Live state-of-artifact (Sep 17 cutover): `docs/sessions/2026-09-17-production-cutover/`
  (preserved as-is, not part of this cleanup).
- Repo canonical contract on doc lifecycle: `AGENTS.md` sec. "Session
  Documentation Management".

## Carry-forward (out-of-scope follow-ups, not part of this commit)

These were already noted in round 1 and remain deferred:

- The remaining loose `docs/sessions/20266*.md` files that already have
  natural session folders (i.e. files outside `2026-10-15-...` that sit
  loose in `docs/sessions/` rather than inside a dated subfolder).
- The `docs/superpowers/` tree (planning archive convention).
- The `docs/CAREER_CONTEXT_ANDURIL_*.md` files (4 of them, separate
  decision; round 1 already deferred).
- Any `docs/` file with a date prefix other than `2026-09-*`.