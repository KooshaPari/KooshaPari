# 2026-10-14: Routing visual slice cleanup (3 files consolidated into one session)

## What was done

Three root-level docs from the 2026-09-09 routing visual slice were moved
into a single dated session folder. None were deleted; all history is preserved
in git (`git mv` preserves file history through rename-detection in
`git log --follow`).

| File | Original | Bytes | Why it was at root | Why it moved |
|---|---|---|---|---|
| `home-routing-visual-slice.md` | Sep 9 (5,691 B) | The design/implementation plan for the user-approved visible slice | Was a live work-in-progress plan during the construction-gate period (Sep 9, 16:53-17:08 Pacific). The plan's scope is now historical: that slice shipped on Sep 9; the on-disk implementation matches what the plan described, and the canonical narrative now lives in `HUMAN_REVIEW.md` (defects-since-last-review) and `VERIFICATION_REPORT.md`. |
| `routing-visual-acceptance.md` | Sep 9 (5,643 B) | The acceptance checkpoint, verdict HOLD for keyboard defect | The keyboard defect it called out (the "focus indicator ~1:1" issue) is the same finding that the 2026-10-10 Palate report flagged and that this session's grader-adjudication docket concluded on (`docs/sessions/20261010-grader-adjudication/00_FINDINGS.md`, finding #1: PARTLY REAL, inner-gap 1:1 by design). The acceptance record's "automated gate passes do not establish visual acceptance" caveat remains a real product rule and is now embedded in the file's new home rather than read as a live acceptance policy at the repo root. |
| `routing-visual-repair-acceptance.md` | Sep 9 (3,627 B) | The post-repair acceptance checkpoint, 18:42 PDT | References the same pre-`39e78d1` focus ring state. With the dark-theme focus ring fix landed at `39e78d1` (now in `styles/tokens-dark.css:54`) and locked in by `tests/contrast.test.js`, the post-repair observation is read as "the dark ring now holds >=3:1 in both themes," which the test re-measures on every run. The file's repair artifacts in `output/playwright/2026-09-09-postrepair-final/` remain on disk. |

## Why this matters

Per `AGENTS.md` (the canonical contract):

> "Detect orphaned docs" -> "Move relevant session-specific docs to appropriate
> session folder" -> "Delete temporal/redundant docs aggressively"

The 3 files are tightly clustered: same date, same user-visible feature
(routing visual slice), same acceptance pattern, same downstream fix. Keeping
them at `docs/` root made them read as the canonical entrypoint for
"current state" of routing, when in fact their content is now archival. A new
agent scanning the repo would otherwise surface these files first, see the
"HOLD for keyboard defect" verdict, and read it as a live policy.

## What was NOT done (still out of scope)

This commit covers one of the four cluster groups previously identified in
`docs/sessions/2026-10-14-doc-proliferation-cleanup/00_SESSION_OVERVIEW.md`
("what was NOT done"). The remaining loose `docs/2026-09-XX-*.md` cluster
still contains ~26 files. The remaining candidate clusters, in
descending tightness:

- **Resume authority cluster (3 files):** `resume-authority-metrics-skills`,
  `resume-authority-stealth-akoma`, `resume-finalization-gates`. Same
  2026-09-09 day, same feature (resume authority/narrative).
- **Production construction cluster (3 files):**
  `construction-gate-implementation-handoff`,
  `production-construction-gate-release`, `public-repo-sync-handoff`.
  Same 2026-09-09 day, same topic (cutover/gate).
- **2026-09-10 post-release cluster (5 files):** `canonical-release-readiness`,
  `netweave-v3-blind-draft`, `post-release-state`, `site-first-execution`,
  `visual-asset-upgrade-backlog`. Slightly looser cluster (different
  aspects of the same cutover).
- **Pre-2026-09-09 loose files (8 files):** portfolio motion research,
  netweave asset production plan, netweave integration, program audit,
  requirement traceability, design production readiness, source chat
  requirements part 1, plus the 5 `CAREER_CONTEXT_ANDURIL_*.md` files
  (career narrative, explicitly deferred by the prior cleanup session).
- **2 ad-hoc audit files:** `asset-visual-review-netweave.md`,
  `AUDIT-collisions-e7b69ad.md`.
- **2 inventories:** `PORTFOLIO_PROMPT_INVENTORY_2026-09-05.md`,
  `TERMINAL_PLAYBACK_EVIDENCE_2026-09-06.md`.

These are not in scope for this commit. Each is a separate decision.

## Verification

- `git mv` preserves file history (each new file is reachable through the
  rename-detection in `git log --follow`).
- `grep -rEn "home-routing-visual-slice|routing-visual-acceptance|routing-visual-repair-acceptance"`
  across the whole repo: zero hits outside the new session folder. No
  external `[text](path.md)` markdown link breaks; no plain-text
  references that would need updating.
- Pre-commit hook: 0 detector violations, 714/714 tests pass
  (carried forward from `824ab37`; the 3 moves do not touch any
  source, test, or detector surface).
- The 3 files remain readable in the new location. `git log --follow`
  shows the rename at the head of each file's history.

## Recommended next

- The 3 remaining tight clusters (resume authority, production
  construction, 2026-09-10 post-release) are individually 3-5 file
  moves each and each could ship as its own commit with its own
  overview. The smallest is the resume authority cluster (3 files,
  same scope as this commit).
- The 5 `CAREER_CONTEXT_*` files contain external narrative
  (Anduril work history) and are an open question per the prior
  cleanup's "out of scope" list. Operator decision needed before
  any move.
- After all clusters are consolidated, `docs/` root should contain
  only canonical repo docs (README, ARCHITECTURE, etc.) and the
  11+ `docs/sessions/<date>-<name>/` folders.
