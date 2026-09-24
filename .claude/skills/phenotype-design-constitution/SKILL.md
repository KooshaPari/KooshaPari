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

- Brand palette: monochrome ink (zinc-9 family) + a single accent per project category. The accent for the portfolio itself is `#2563EB` (Portfolio/Personal row in `ui-ux-pro-max/data/colors.csv`).
- Per-project accent: chosen by industry row in `ui-ux-pro-max/data/colors.csv`. Mapping lives in `data/projects.js` `theme:` field. See Section 7 for the full matrix.
- Font pairing: project pages use `Archivo` (body) + `Space Grotesk` (display) -- "Minimalist Portfolio" row #44 in `ui-ux-pro-max/data/typography.csv`. Research and fork pages may swap to JetBrains Mono for technical headers (Developer Mono row #9). Do not introduce a third font without a written reason in the PR description.
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

Source of truth: `theme:` field in each project object inside `data/projects.js` (15 projects).

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

- Each file <= 500 lines (target <= 350). Already enforced for helpers; the unreachable `scripts/main.js` island (1829 lines, no importer, absent from the bundle) was deleted rather than decomposed.
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
3. For any new visual: pick the industry row + font pairing from Section 7 and add a `theme:` field if the project doesn't have one yet.
4. For any new copy: apply Section 1 (voice/tense).
5. Before opening a PR: run the anti-pattern detector (`scripts/anti-pattern-detector.sh`) and complete the Section 11 checklist.
