---
name: phenotype-design-constitution
description: Apply the koosha-phenotype.com portfolio design constitution. Use for ANY change touching visuals, copy, content, accessibility, or interaction. The portfolio's voice is "evidence-led, museum-quiet, designer-engineer". Every change must preserve three properties: (1) provenance is explicit, (2) accessibility meets WCAG 2.2 AA, (3) code reads like a curated exhibit, not a maximum-MVP page. Sources of truth: ui-ux-pro-max (192 industries x 50+ styles x 119 guidelines), ascii-skill (visual recipes), this constitution.
license: MIT
metadata:
  source_uiux: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
  source_ascii: https://github.com/arjunkshah12345-hash/ascii-skill
  portfolio: https://kooshapari.com
  repo: /Users/kooshapari/CodeProjects/Phenotype/repos/koosha-phenotype
  scope: koosha-phenotype.com PORTFOLIO site only (not Phenotype product cohort docs in docs-3/docs-5)
---

# Phenotype Design Constitution (koosha-phenotype.com)

## 1. Voice and Tense

- Voice: third person when describing Koosha's work. Never first person.
- Tense: past for completed (historical, retired, shipped); present for current and active research.
- Hedging: prefer "approximately", "user-stated", "canonical user fact" over "I/we" claims. Every metric has a provenance row in `data/projects.js`.
- Promotional: zero. The portfolio sells itself through restraint. No "passionate", "rockstar", "guru", "driven", "results-oriented".

## 2. Color and Typography Pairing Rules

- Brand palette: monochrome ink expressed from four canonical seeds in the Phenotype Material Lab source packet (Obsidian `#0F1012`, Slate `#353A40`, Ceramic `#F6F5F5`, Teal `#7EBAB5`) + a single lens accent (Engineering = teal `#3f8795` `arch-500`, Product = olive `#737c4c` `olive-500`) + a per-family accent per project. The `ui-ux-pro-max/data/colors.csv` "Portfolio/Personal" row (which lists `#2563EB`) is a research reference for tone mapping, not the source of the deployed palette. Source of truth: `styles/tokens.css` and `data/projects.js` `theme:` field. See Section 7 for the per-project mapping and Section 13 for the Material Lab seed rationale.
- Per-project accent: bespoke per project in `data/projects.js` `theme:` field, chosen against an industry-tone reference in `ui-ux-pro-max/data/colors.csv` (descriptive, not literal). See Section 7 for the matrix and the binding-value rule.
- Font pairing: project pages use `Inter` (body) + `Space Grotesk` (display) + `JetBrains Mono` (meta, evidence chips, hash digests). The `ui-ux-pro-max/data/typography.csv` "Minimalist Portfolio" row #44 (Archivo + Space Grotesk) is a research reference, not the deployed pairing. `Inter` was chosen for long-form reading legibility and AA contrast on the small-text-heavy card surface; `JetBrains Mono` is the dedicated face for evidence and code. Per-project `theme.fontPair` overrides the portfolio default for project-card typography (e.g., `sharecli` runs JetBrains Mono + IBM Plex Sans to signal a developer-tool voice). Do not introduce a fourth font without a written reason in the PR description.
- Type scale: clamp-based fluid sizes. Body 16px min, max 18px. H1 32-48px. Mono labels 12-14px.

## 3. Accessibility Floor (WCAG 2.2 AA, non-negotiable)

- Color contrast >= 4.5:1 (normal text), >= 3:1 (large text, UI components).
- Focus ring visible on every interactive element. Never `outline: none` without a replacement.
- Touch targets >= 24 CSS px on web, 44pt iOS, 48dp Android -- different per platform, not one rule.
- Reduced-motion respected for parallax, autoplay, scroll-jacking. Honor `prefers-reduced-motion: reduce`.
- Skip-link at top of `<body>`. Landmarks present (`<header>`, `<main>`, `<footer>`, `<nav>`).
- Form errors: inline + summarized, focus moved to summary, `aria-describedby` linking each item to its field.
- Icons paired with text; never color-only signals for status. Status pills `historical` / `current` / `research` carry a glyph prefix (`o` / `D` / `O`) -- documented in `data/projects.js`, must render.

## 4. Evidence Discipline

- Every claim has a source. If no source, the claim is a "canonical user fact" with the explicit user-stated qualifier.
- Upstream work is attributed in the same sentence as the contribution. No naked "101 PRs" without naming the upstream project and the time window.
- Forks retain upstream provenance in the project slug and on the case-study page. `cliproxyapi-plusplus`, `agentapi-plusplus`, `MCPForge`, `forgecode`, `Frostify` all carry this in `data/projects.js`.
- Don't restate metrics across the site. Each metric is canonical once (the project page). Elsewhere, link.

## 5. ASCII as a Visual Layer

ASCII widgets are allowed and encouraged where:
- A skeleton needs visual weight without color.
- A project page wants a non-photographic representation (the radar fallback, a project card spine, an evidence chip).
- The widget ships as `<pre>` with monospace CSS -- never as raster.

Recipes catalog: see Section 8. Drop-in code lives in `scripts/components/visual-ascii.js`. The recipes from ascii-skill that map cleanly here are: status widget, project spine, evidence chip. The donut/cube/wireframe recipes are not appropriate; this portfolio is not a graphics demo.

## 6. Bundle and Performance Budget

- Bundle <= 230 KB minified (current: 228.7 KB). New features must justify bytes.
- Lazy-load below-fold images. Eager-load hero only.
- No synchronous third-party scripts in `<head>`.
- Fonts: `font-display: swap` + matching-metric fallback.
- 60fps on parallax and reveals. Use `transform` and `opacity`. Never animate `width`/`height`/`top`/`left`.

## 7. Project Type -> Color/Font Matrix

Source of truth: the `theme:` field in each project object inside `data/projects.js` (15 projects). The accent hex codes and font family names in `theme.accent` / `theme.fontPair` are bespoke per project (Koosha's intentional choice) and are the **binding** values. The "Industry row" column below is the tone reference the project was composed against (descriptive, not literal).

| Slug | Category | Industry row (colors.csv) | Accent | Font pairing (typography.csv) |
|------|----------|---------------------------|--------|-------------------------------|
| gmk-arch | physical-product | Row 4 E-commerce Luxury | `#A16207` gold | Cormorant + Montserrat |
| witf | physical-product | Row 4 E-commerce Luxury | `#A16207` gold | Cinzel + Josefin Sans |
| sharecli | systems | Row 81 Developer Tool / IDE | `#22C55E` green | JetBrains Mono + IBM Plex Sans |
| substrate | ai-infrastructure | Row 162 Academic Journal | `#A16207` gold | Cormorant Garamond + Libre Baskerville |
| phenotype-omlx | ai-ml | Row 85 Quantum Computing (sparingly) | `#0891B2` cyan | Syne + Manrope |
| omniroute | ai-infrastructure | Row 14 Fintech/Crypto (restraint) | `#F59E0B` gold | Playfair + Inter |
| netweave | simulation | Row 81 Developer Tool / IDE | `#22C55E` green | JetBrains Mono + IBM Plex Sans |
| byteport | cloud | Row 81 Developer Tool / IDE | `#0891B2` cyan | IBM Plex Sans + IBM Plex Mono |
| tracera | developer-tools | Row 81 Developer Tool / IDE | `#7C3AED` violet | JetBrains Mono + IBM Plex Sans |
| dss-cipher | physical-product | Row 4 E-commerce Luxury | `#A16207` gold | Cormorant + Montserrat |
| cliproxyapi-plusplus | developer-tools | Row 81 Developer Tool / IDE | `#7C3AED` violet | IBM Plex Sans + IBM Plex Mono |
| agentapi-plusplus | developer-tools | Row 81 Developer Tool / IDE | `#7C3AED` violet | IBM Plex Sans + IBM Plex Mono |
| mcpforge | developer-tools | Row 81 Developer Tool / IDE | `#7C3AED` violet | IBM Plex Sans + IBM Plex Mono |
| forgecode | developer-tools | Row 81 Developer Tool / IDE | `#7C3AED` violet | IBM Plex Sans + IBM Plex Mono |
| frostify | design | Row 81 Developer Tool / IDE | `#06B6D4` cyan | Manrope + JetBrains Mono |

## 8. ASCII Recipes

Three drop-in patterns. Code lives in `scripts/components/visual-ascii.js`.

### 8.1 Status Widget (40 x 12, blocks ramp)

```
+----------------------------------------+
|  ###  SYSTEM ONLINE   o  READY         |
|  ...  ------------------------        |
|  :::  radar ........... nominal        |
|  ###  routing ......... nominal        |
|  ...  compile ........ nominal         |
|  :::  tests .......... 626 / 626 v    |
|  ###  deploy ......... kooshapari.com  |
+----------------------------------------+
```

Use as the radar-hero fallback in `views/home.js:74-148`. ASCII equivalent of the box-drawing variant above.

### 8.2 Project Spine (56 x 20, Standard ramp)

```
       .        *         .
   .        *         .
        .-<slug>-.
   +----------------------+
   |  ^ <one-line role>   |
   |  -                   |
   |  . <metric 1>        |
   |  : <metric 2>        |
   |  # <metric 3>        |
   +----------------------+
   `----------------------'
```

Use as `<img>` placeholder or above-the-fold summary in `components/artifact.js:90-110`.

### 8.3 Evidence Chip (24 wide, consistent frame)

```
+-canonical fact--------------+
|  . user-stated              |
|  : source-attached          |
+-----------------------------+
+-external link---------------+
|  ^ <host>                   |
+-----------------------------+
+-upstream contribution-------+
|  o <PR count> - <days>d     |
+-----------------------------+
+-fork / extension------------+
|  . upstream retained       |
+-----------------------------+
```

Use in `components/evidence.js:21-50` for every evidence link.

## 9. Code Conventions (anchored to current files)

- Each file <= 500 lines (target <= 350). Detector pattern 27 enforces the 500-line hard limit on tracked first-party source (`scripts/`, `data/`, `styles/`) and warns above the 350-line target. The unreachable `scripts/main.js` island (1829 lines, no importer, absent from the bundle) was deleted rather than decomposed, and `styles/artifacts.css` (549 lines) was split into `artifacts.css` + `artifact-physical.css` at the same cascade position.
- Pure helpers extracted per orchestrator: see `scripts/transitions-helpers.js`, `scripts/lightbox-helpers.js`, `scripts/scroll-reveal-helpers.js`, `scripts/scroll-choreography-helpers.js`, `scripts/image-reveal-helpers.js`, `scripts/counter-animate-helpers.js`, `scripts/dark-mode-helpers.js`, `scripts/cursor-helpers.js`, `scripts/parallax-helpers.js`, `scripts/perspective-tilt-helpers.js`, `scripts/router-helpers.js`. Each helper module is independently testable via `node --test`.
- Commit format: `tx-agent`, `tx-task`, `tx-parent`, `tx-validated`, `tx-scope`, `tx-intent` trailers (immutable ledger pattern).
- ASCII widgets go in `scripts/components/visual-ascii.js` (this skill's section 8.1-8.3 ship here).

## 10. Don'ts

- No new emoji as status markers. Use the glyph prefixes in Section 3.
- No "Lorem ipsum" placeholders in any visible state. Use the ASCII fallback (Section 8.3) or a stable skeleton.
- No decorative gradients on text. Color-only emphasis is for chips and pills with paired icons.
- No animations longer than 400ms on a single transition.
- No third-party analytics, no trackers, no consent banners. The portfolio has zero third-party scripts.
- No rewriting history. Force push is blocked by policy.

## 11. Quick-Reference Checklist (paste into PR descriptions)

```
[ ] Voice: third person, past for shipped, present for current. No "I/we".
[ ] Evidence: every metric has a source row in data/projects.js.
[ ] Color: WCAG AA (4.5:1 normal, 3:1 large).
[ ] Focus: visible ring on every interactive element.
[ ] Touch: >=24 CSS px on web, 44pt iOS, 48dp Android.
[ ] Motion: respects prefers-reduced-motion.
[ ] Bundle: <= 230 KB minified.
[ ] Fonts: clamp-based, no third family added.
[ ] ASCII: skeleton or fallback only, not decorative.
[ ] Upstream: attribution in same sentence as the contribution.
[ ] Tests: full suite passes (626 unit + 10 e2e minimum).
[ ] Ledger: tx-* trailers present.
```

## 12. How to use this skill

When working on `koosha-phenotype.com`:

1. Read this SKILL.md first.
2. Read the relevant section(s) of `data/projects.js` for the project(s) touched.
3. For any new visual: follow the per-project binding-value rule in Section 7 (hex in `theme.accent`, families in `theme.fontPair`, label in `theme.industry`); the Industry row column is descriptive, not binding. Add a `theme:` field if the project doesn't have one yet. For portfolio-level visuals (home, resume, contact, blog), use the lens-accent story in Section 2 + the systems in Section 13.
4. For any new copy: apply Section 1 (voice/tense).
5. Before opening a PR: run the anti-pattern detector (`scripts/anti-pattern-detector.sh`) and complete the Section 11 checklist.

## 13. Visual Systems In Code (added 2026-10-12; prior versions were silent)

Several visual systems ship in `styles/tokens.css` but were absent from earlier versions of this constitution. This section is the single place to look for the system, its source file, and the rationale.

| System | Source | What it is | Why it matters |
|---|---|---|---|
| Material Lab seed packet (4 canonical) | `styles/tokens.css:25-28` | Obsidian `#0F1012`, Slate `#353A40`, Ceramic `#F6F5F5`, Teal `#7EBAB5` | OKLab-derived source colors; the graphite/paper/olive/arch/acid families are derived from these. Designers compose from the source. |
| Lens accent state machine | `styles/tokens.css:118-121`, `184-213` | Engineering = teal, Product = olive, swapped via `html[data-lens]` | Lens flips every family accent in one rule; the family-active tokens are the binding surface. |
| Family accent system (6 families x 2 lenses) | `styles/tokens.css:135-148` | netweave / sharecli / omniroute / physical / substrate / omlx, each in engineering + product | One accent per project family; resolves via `--family-*-active` under the active lens. |
| Family ink tokens (12 light + 12 dark) | `styles/tokens.css:158-169`, `269-280` | Solved against worst-case badge background for >=4.5:1 | Enforced by `tests/contrast.test.js`; do not edit without re-running the contrast test. |
| Premium glass surface tokens | `styles/tokens.css:174-177`, `293-295` | Apple-grade backdrop-filter glass with inset highlight, 8-10% ink border | Used by header + spec surfaces; the recipes catalog in Section 8 covers ASCII skeletons, but the glass layer is the actual visual surface for the chrome. |
| Motion system (8 tokens) | `styles/tokens.css:123-132` | fast 160 / normal 220 / slow 280 / glacial 380 ms + short 120 / standard 180 + 3 eases | Aligns with the Section 6 400ms ceiling; transform + opacity only, no width/height/top/left animations. |
| Precision radii | `styles/tokens.css:106-108` | 6 / 10 / 12 px (control / panel / studio) | Sharp instrument, not plush. |
| Precision depth | `styles/tokens.css:111-112` | 1-layer card shadow + 0.65rem specimen offset shadow | No glow; the specimen offset is the only depth move. |

The `ui-ux-pro-max` and `ascii-skill` references remain valid as research corpora (192 industries, 50 active styles, 119 guidelines, recipe catalog). They are **not** the source of the deployed palette, the deployed font pairing, or the per-project accent map. The deployed source is `styles/tokens.css` + `data/projects.js`; everything else is a research reference.
