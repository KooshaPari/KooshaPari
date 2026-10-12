# 2026-10-12: Constitution Reconciliation + Novelty Scout Dispatch

## What we did

Verified the design constitution's Section 2 and Section 7 claims against the
actual code in `styles/tokens.css` and `data/projects.js`. Found two binding
discrepancies:

1. **Color**: constitution said portfolio accent is `#2563EB` (Portfolio/Personal
   row in `ui-ux-pro-max/data/colors.csv`). Actual code uses `arch-500` `#3f8795`
   (teal, Engineering lens) and `olive-500` `#737c4c` (Product lens), with 6
   bespoke family accents and 4 Material Lab seed colors.

2. **Font**: constitution said project pages use `Archivo` (body) +
   `Space Grotesk` (display) (Minimalist Portfolio row #44). Actual code uses
   `Inter` (body) + `Space Grotesk` (display) + `JetBrains Mono` (meta). Inter
   is Minimal Swiss row #5 in the CSV, not Minimalist Portfolio #44.

## Why it matters

The `ui-ux-pro-max` CSVs are research corpora (192 industries, 50 active styles,
119 guidelines), not the source of the deployed palette or fonts. The deployed
source is `styles/tokens.css` + `data/projects.js` `theme:` field. The
constitution's prior framing implied the CSVs were the source, which would
have led downstream agents to apply a blue/Archivo aesthetic that doesn't match
the live portfolio.

## Fix

Reconciled the constitution in commit `b76d324`:

- **Section 2** re-stated the actual color story (Material Lab seeds + lens
  accents + per-family accents) and font story (Inter + Space Grotesk +
  JetBrains Mono). The CSV rows are now cited as research references, not
  binding claims.
- **Section 7** industry-row column labelled descriptive, not binding; binding
  values are the per-project `theme.accent` / `theme.fontPair` / `theme.industry`
  fields.
- **New Section 13** documents the visual systems shipped in `tokens.css` that
  prior versions were silent on: seed packet, lens accent state machine, family
  accent system, family ink tokens, glass surface tokens, motion system,
  precision radii, precision depth.

## Verification

- Pre-commit hook passed (695/695 tests, 0 failures).
- `grep` confirmed the only mentions of `#2563EB` and `Archivo` in the repo are
  now in the constitution, where they are cited as research references the code
  does not follow (intentional framing).
- No tests reference the constitution; the fix is docs-only.

## Novelty scout: route outage

Dispatched 3 novelty scouts back-to-back; all 3 failed with the same
route-level error against `https://opencode.ai/zen/go/v1/chat/completions`:

| Attempt | Model | Result |
|---|---|---|
| 1 (standing default) | `opencode-go:mimo-v2.6-flash` | failed (operator standing default 2026-09-24) |
| 2 (fallback #1) | `opencode-go:deepseek-v4.1-flash` | failed (tool-loop verified 2026-09-17) |
| 3 (fallback #2) | `opencode-go:mimo-v2.5-pro` | failed (tool-loop verified 2026-09-17) |

All three hit the same endpoint within 5-45s of spawn with body matching the
pattern `OpenAI-compatible chat request failed endpoint: ... model: <name>...`.
This is a **route-level outage**, not a per-model issue. The same pattern
matches the 3 visual-language / interactive-layer / trend-research scouts that
were dispatched ~3h earlier and never reported back through any channel.

Per the operator policy, advancing to native Codex requires explicit
escalation ("Do not silently fall back to native Codex ... from a Jcode
worker route for research or implementation work"). The novelty scout is
research, not a Jcode blocker — escalating to the operator.

## Recommended next

- Wait for `opencode.ai/zen/go/v1/chat/completions` to recover, then re-spawn
  the novelty scout with the original prompt.
- OR escalate and get approval to use the Codex route family (the only
  remaining non-broken route) for this research task.
- In the meantime, the constitution reconciliation (`b76d324`) and session
  note (`6aa6ca4`) are committed and live.

## Resolution: operator-routed fallback

Operator override 2026-10-12T05:10Z: "pick best path yourself, use
OpenAI-compatible MiniMax M3 for subagents." Re-spawned the scout on
`openai-compatible:MiniMax-M3` (provider `openai-compatible:openai-compatible`,
endpoint `https://api.minimax.io/v1`) — exactly the canonical MiniMax M3
route per the operator routing policy. Scout completed in 289 s and
produced a 6-candidate report at `/tmp/design-novelty-report.md`.

## Novelty candidates (delivered)

Six ranked candidates, all honoring every hard constraint (WCAG AA, ≤230 KB,
≤400 ms, no new font, no new color, no emoji, no third-party, museum-quiet).
Full integration in `NOVELTY_CANDIDATES.md` (this session).

**Ship queue (top 3 — lowest risk, highest voice match):**
1. **Editorial Grid / Magazine** (styles.csv #66) — drop caps + column rules
   on `.case-study`. Cost: 1 token, 1 selector, 0 new assets.
2. **E-Ink / Paper** (styles.csv #55) — `#fdfbf7` surface, gated per
   case-study route. Cost: 2 tokens, 1 SVG noise (≤400 B), 1 attr gate.
3. **Dimensional Layering** (styles.csv #46) — 3-step elevation ladder with
   `translateZ(0)`. Cost: 3 tokens, 1 transform.

**Parking lot (3 more — distinctive, not yet ship-ready):**
4. Bento Box Grid (saturated 2025-2026 move; hold for project-catalog refresh)
5. Exaggerated Minimalism (one-shot ceiling move; hold pending voice review)
6. Neubrutalism (controlled; hold pending surface-gate review)

**No more viable candidates under these constraints.** Remaining active
rows are voice conflicts (Cyberpunk, Y2K, Gen Z Chaos, Memphis),
anti-museum-quiet (Organic Biophilic, Nature Distilled, Biomimetic 2.0),
vendor design systems (Material 3 Expressive, Adobe Spectrum, Shopify
Polaris, Fluent 2), or surface-mismatched (Mobile 71-84, 3D / voice /
cursor / pixel-art variants).

## Files

- `00_SESSION_OVERVIEW.md` — this file (constitution fix + scout dispatch)
- `NOVELTY_CANDIDATES.md` — 6-candidate integration with ship queue + parking lot
- `/tmp/design-novelty-report.md` — raw scout output (kept as record)
