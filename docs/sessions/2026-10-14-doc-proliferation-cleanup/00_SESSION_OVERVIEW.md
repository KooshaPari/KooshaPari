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

## Addendum 2026-10-14T07:14Z: novelty-scout dispatch lane unblocked

The "parking-lot novelty candidates" referenced above were paused because the
`opencode-go:` route was in outage (2026-10-12 confirmation) and the operator
policy "do not silently fall back to native Codex" bound the dispatch lane.
Operator instruction 2026-10-14T07:04Z unblocks it:

- **Tier 1 default is now `openai-compatible:MiniMax-M3`** (M3 via
  `https://api.minimax.io/v1`, NOT the native `https://api.minimaxi.com/v1`).
  Promoted 2026-10-14T03:47Z after a real `bash` tool-loop test
  (`wc -l /etc/hosts` -> 9). The harness's `~/.jcode/config.toml` already
  has `swarm_model = "openai-compatible:MiniMax-M3"`. The novelty-scout
  novelty-research lane can resume using M3 as the workhorse.
- **For `opencode-go:` Tier 1.5 / 2 / 3 fallback**, cycle through the 5
  OpenCode Go keys in `~/ocgo.env.rtf` (`KODEFAULT_OCGO` -> `KOTWO_OCGO`
  -> `MIKE_OCGO` -> `ASU_OCGO` -> `RAMDESIGNS_OCGO`) to find the one with
  monthly / weekly / 5-hour headroom. This is a budget-extending move, not
  a provider switch.
- Canonical policy record: `~/.jcode/memories/global/harness-agents.md`
  (Hybrid 3-Tier + Last-Resort Routing, ACTIVE operator 2026-10-14,
  TIER-0 PROMOTED 2026-10-14T03:47Z; new "opencode-go key-cycling protocol"
  section added 2026-10-14T07:11Z).
- Opencode-go route state as of 2026-10-14T07:08Z: `/chat/completions`
  returned HTTP 404 unauthenticated; `mimo-v2.6-flash` is no longer in the
  opencode-go catalog. Tier 1.5 is degraded; T2 / T3 still have routable
  models (mimo 2.5 PRO, deepseek v4.1 flash, glm-5, kimi-k2.5,
  qwen3.5-plus, minimax-m2.7). M3 + the 5-key cycle is the working config.
