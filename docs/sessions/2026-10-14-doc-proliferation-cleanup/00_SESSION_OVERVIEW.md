# 2026-10-14: Doc-proliferation cleanup (root-level stale files)

## What was done

Three root-level docs from prior sessions were moved into a single consolidation
session folder. None were deleted; all history is preserved in git.

| File | Original | Why it was at root | Why it moved |
|---|---|---|---|
| `IMPLEMENTATION_STATUS.md` | Sep 5 (5,658 B) | Was the live status doc during the Technical Atelier redesign and review-preview handoff | All task-by-task state it described is now in git history; live status is captured by `HUMAN_REVIEW.md` (Oct 9) and the test suite. The preview URL it cites (`dpl_7121kBU5ChY2SChRhvoFE6J9zpss`) is a specific deployment ID from a non-production SSO-protected preview that no longer resolves. |
| `LIGHTHOUSE_REPORT.md` | Aug 29 (376 B) | Was a placeholder for a future Lighthouse report | Lighthouse CLI is not installed in this environment; the file contained zero scores, only the prompt "Run Lighthouse against ... Record Performance, Accessibility, Best Practices, SEO, LCP, CLS, and INP/TBT there." A TODO at the wrong layer. |
| `LINK_AUDIT.md` | Aug 29 (548 B) | Was a snapshot of the link audit at that date | Its "deferred external checks" section is now historical: the Vercel preview it references is SSO-protected and was superseded by the production cutover (Sep 17, `PRODUCTION_CUTOVER.md`) and the post-release state (`docs/2026-09-10-post-release-state.md`). |

## Why this matters

Per `AGENTS.md` (the canonical contract):

> "Detect orphaned docs" → "Move relevant session-specific docs to appropriate
> session folder" → "Delete temporal/redundant docs aggressively"

Root-level docs read like the canonical entrypoint. A new agent scanning the
repo for "current state" hits these files first, and their old preview
deployment IDs, missing-score Lighthouse placeholders, and pre-cutover link
checklists read as live. Moving them to a dated session folder signals "this
is archival" without losing any content.

## What was NOT done (out of scope for this commit)

- `docs/2026-09-XX-*.md` (15+ loose session-specific files in `docs/`) — also
  candidates for the same treatment, but moving them is a much larger
  refactor and the user-facing surface is much smaller. Deferred.
- `docs/superpowers/plans/2026-XX-XX-*.md` — old plans, but the `superpowers/`
  tree is a separate planning-archive convention. Deferred.
- `CAREER_CONTEXT_*` files in `docs/` — date-prefixed, but contain external
  narrative. Deferred.

## Verification

- `git mv` preserves file history (each new file is reachable through the
  rename-detection in `git log --follow`).
- All textual references to the 3 files in old planning docs are plain text
  mentions, not `[text](path.md)` markdown links, so the move does not break
  any links. Confirmed with `grep -rEn "\]\([^)]*(IMPLEMENTATION_STATUS|LIGHTHOUSE_REPORT|LINK_AUDIT)\.md\)"`.
- Pre-commit hook: 0 detector violations, 707/707 tests pass.
- The 3 files remain readable in the new location. `git log --follow` shows
  the rename at the head of each file's history.

## Recommended next

- Continue with the operator's "proc" direction. The next obvious ship-ready
  item is the loose `docs/2026-09-XX-*.md` cluster, but that's a larger
  refactor and should be a separate decision.
- The repo is in a stable, well-tested state. The remaining open items
  (parking-lot novelty candidates, Firefox --headless env constraint) all
  require operator action or environment changes, not code work.
