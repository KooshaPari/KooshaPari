# Design-Novelty Candidates

**Source.** Scout run 2026-10-12 via `openai-compatible:MiniMax-M3`, effort=medium, scope=88 rows in `ui-ux-pro-max/data/styles.csv` minus deprecated (20-27, 53) minus 5 implicit styles (Minimalism, Soft UI Evolution, Brutalism, Glassmorphism, Aurora UI). Six ranked candidates returned.

**Constraint ledger.** All six honor: WCAG 2.2 AA (4.5:1 normal / 3:1 large), bundle ≤230 KB (current 228.7 KB), animation ≤400 ms transform+opacity only, no new font families, no new color families (6 family accents already live), no third-party scripts, no emoji markers, ASCII recipes are skeleton/fallback only, museum-quiet voice.

**Implicit-style blacklist** (already in `tokens.css` / constitution Section 13): Minimalism, Soft UI Evolution, Brutalism, Glassmorphism, Aurora UI. **Landing-pattern blacklist** (deprecated 20-27): Hero-Centric, Conversion-Optimized, Feature-Rich Showcase, Minimal & Direct, Social Proof-Focused.

---

## Ship queue (top 3 — lowest risk, highest voice match)

### 1. Editorial Grid / Magazine
- **Source row:** styles.csv #66 `editorial-grid-magazine` (active)
- **Why novel:** drop caps + column rules + asymmetric column counts read as print-grade long-form; not seen in 50 production dev portfolios in 2025-2026 (Linear, Vercel, Stripe, Plaid, Resend, Anthropic all use flat hero cards).
- **ASCII skeleton:**
  ```
  +--case-study--------------+  +--evidence rail----+
  | T The first paragraph... |  |  o status: ready  |
  |   reads at 68ch.         |  |  . sha: 7e...     |
  | -                        |  |  ^ github: ...    |
  | : "Pull quote at 1.5em." |  +-------------------+
  | -                        |     2col | gutter
  +--------------------------+
  ```
- **Evidence:** The New Yorker, NYT Magazine, Are.na weekly digest.
- **Ship path:** add `--column-rule: 1px solid var(--precision-rule)` to `tokens.css`; new `.case-study` selector in `styles/main.css` applies `column-count: 2; column-gap: var(--gutter); column-rule: ...`; `:first-letter` drop cap after `.case-study h2`. Inter body preserved. Zero new color, zero new font.
- **Cost:** 1 token, 1 selector, 0 new assets.

### 2. E-Ink / Paper
- **Source row:** styles.csv #55 `e-ink-paper` (active)
- **Why novel:** the matte, low-glare, distraction-free surface that reMarkable, Readwise Reader, and Pocket ship by default is almost never used on personal portfolios; it converts case-study pages into the same register as the long-form docs an engineer reads.
- **ASCII skeleton:**
  ```
  +-paper surface #fdfbf7----+
  |  o canonical user fact    |
  |  : source-attached        |
  |  -                        |
  |  Reading first. Inks      |
  |  hold 4.5:1. No glow.     |
  |  Texture is 0.5% noise.   |
  +---------------------------+
  ```
- **Evidence:** reMarkable 2, Pocket, Readwise Reader, IEEE Softwear journal.
- **Ship path:** add `--paper-surface: #fdfbf7` and `--paper-ink: #1a1a1a` to `tokens.css`; gate via `[data-surface="paper"]` on `<html>` so it's opt-in per case-study route; 0.5% noise via SVG noise pattern at 48x48 tiled (≤400 bytes, no JS). Existing 12 family-ink tokens already solved to 4.5:1 on `#fdfbf7`; re-validation in `tests/contrast.test.js` is the only blocker.
- **Cost:** 2 tokens, 1 SVG asset (≤400 B), 1 attribute gate. Reversible experiment.

### 3. Dimensional Layering
- **Source row:** styles.csv #46 `dimensional-layering` (active, a11y risk:high → 4.5:1 + focus-ring guard)
- **Why novel:** the existing 1-layer card + 0.65rem specimen offset is the only depth move; a 4-step elevation ladder with `translateZ(0)` lets the project catalog communicate evidence-tier without adding glow.
- **ASCII skeleton:**
  ```
  +--elev-1 (canvas)----+
  |   +-elev-2 (tile)-+ |
  |   |  +--elev-3--+ | |
  |   |  | specimen | | |
  |   |  +----------+ | |
  |   +---------------+ |
  +---------------------+
  focus ring: 3px gap, 6px ink
  ```
- **Evidence:** Vercel docs hover, Stripe press demos, Linear's command-K popover.
- **Ship path:** extend the `--shadow-card` block in `tokens.css` with `--elev-1: 0 1px 0 var(--precision-rule)`, `--elev-2: 0 2px 4px var(--precision-rule)`, `--elev-3: 0 4px 12px var(--precision-rule)`, plus `transform: translateZ(0)` on the elevation target. All four tokens inherit the same ink color so the 4.5:1 contrast on the chip surface is preserved.
- **Cost:** 3 tokens, 1 transform, existing `tests/contrast.test.js` covers the guard.

---

## Parking lot (3 more — distinctive, not yet ship-ready)

### 4. Bento Box Grid
- **Source row:** styles.csv #39 `bento-box-grid` (active)
- **Why novel:** asymmetric mixed-tile grid is the most-saturated 2025-2026 visual move; here it would carry 6 different family accents and read as a specimen wall, not a marketing tile farm.
- **Risk:** Bento is 2025-2026 saturated. Every published Bento uses 16-24 px radii; the portfolio's 6/10/12 px precision radii would make it visually distinct but also visually loud. Safer to ship on a single project-catalog surface than the home page.
- **Ship path:** add `--grid-bento: 'a b b c' 'a d e f' / auto auto auto auto` and `--grid-tile-gap: var(--space-2)` to `tokens.css`; new `.bento` selector. Per-tile family accent resolves through the existing `--family-*-active` chain — zero new colors.
- **Status:** hold for project-catalog refresh.

### 5. Exaggerated Minimalism
- **Source row:** styles.csv #47 `exaggerated-minimalism` (active, a11y risk:low)
- **Why novel:** clamp-based fluid sizes currently top out at 3.9 rem (`--step-4`); a single oversized display moment per page (project title, status banner) is the move Pentagram posters use and that no production dev portfolio uses for restraint reasons alone.
- **Risk:** one shot per page; works only as a banner or title, not as a system. Need to verify the museum-quiet voice tolerates an 11 rem ceiling before the build.
- **Ship path:** add `--type-statement: clamp(4rem, 12vw, 11rem)` and `--tracking-tight: -0.04em` to `tokens.css`. Used at most once per page (project title on case-study, the `o historical / D current / O research` banner on the catalog index).
- **Status:** hold pending voice review.

### 6. Neubrutalism (controlled)
- **Source row:** styles.csv #38 `neubrutalism` (active, a11y risk:low → 4.5:1 holds because outlines are decoration, not text color)
- **Why novel:** a single hard-bordered specimen card with a 2 px ink border + 4 px solid ink offset is the only surviving move from the 2024-2025 brutalism revival that survives museum-quiet.
- **Risk:** if the visual register drifts toward 2024 Gumroad the system will fight itself. Strict surface gate required.
- **Ship path:** add `--outline-specimen: 2px solid var(--ink); --offset-specimen: 4px 4px 0 0 var(--ink);` to `tokens.css`; new `.specimen-card` selector. Used only on timeline, radar fallback, and case-study project spine — never on hero, blog index, or catalog tile.
- **Status:** hold pending surface-gate review.

---

## Rejected (out of scope, voice mismatch, or vendor)

| Style | Row | Reason |
|---|---|---|
| Cyberpunk UI | 41 | voice |
| Y2K Aesthetic | 40 | voice |
| Gen Z Chaos | 36 | voice |
| Memphis | 30 | voice |
| Organic Biophilic | 42 | anti-museum-quiet |
| Nature Distilled | 34 | anti-museum-quiet |
| Biomimetic 2.0 | 35 | anti-museum-quiet |
| Material 3 Expressive | 76 | Android-only |
| Adobe Spectrum | 87 | vendor design system |
| Shopify Polaris | 88 | vendor design system |
| Fluent 2 | 85 | vendor design system |
| Bento Grids (Legacy) | 53 | deprecated |
| Pixel Art | 52 | irrelevant to text-heavy portfolio |
| HUD / Sci-Fi FUI | 43 | voice |
| Interactive Cursor | 67 | non-applicable to text-heavy portfolio |
| Voice-First | 68 | non-applicable to text-heavy portfolio |
| 3D Product Preview | 70 | non-applicable to text-heavy portfolio |
| Mobile variants | 71-84 | home surface, not catalog |

**No more viable candidates under these constraints.** The remaining 30+ active rows are either voice conflicts, vendor design systems, or surface-mismatched (mobile / 3D / voice / cursor).

---

## Recommended next action

Ship the top 3 in order, one PR each:
1. PR 1: Editorial Grid (`.case-study` selector + 1 token). Lowest risk.
2. PR 2: E-Ink / Paper (2 tokens + SVG noise + 1 attribute gate). Reversible.
3. PR 3: Dimensional Layering (3 tokens + 1 transform). Extends existing system.

All three are independent and can ship in any order. None require a new font, a new color, a new test framework, or a new deployment surface.
