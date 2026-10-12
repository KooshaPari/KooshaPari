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

## Next

Dispatched a focused novelty scout (`opencode-go:mimo-v2.6-flash`, effort
medium) with the corrected constitution in hand. Scope: 5-7 visual style
candidates that are NOT in the 5 implicit styles already shipped
(Minimalism, Soft UI Evolution, Brutalism, Glassmorphism, Aurora UI), fit
all hard constraints (museum-quiet, WCAG-AA, 400ms ceiling, ≤230KB bundle,
glass-friendly, no emoji, no 4th font), and have a clear ship path. Stop
condition: 5-7 ranked candidates OR exhaustive search with explicit
"no more viable candidates" reason.

Report expected back in 10-15 min. When it arrives: integrate into a small
"novelty candidates" doc, pick the top 1-2 to ship first, and file the
remaining as a parking-lot.
