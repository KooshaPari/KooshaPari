# UI/UX Extreme Engineering Sprint — WBS

**Session:** 20260913-ui-ux-sprint
**Goal:** Transform koosha-phenotype from structural skeleton into a visually distinctive, interaction-rich technical atelier
**Baseline:** 15 case study pages, CSS token system, SPA router, zero scroll animations, zero page transitions, text-only homepage, no custom cursor

---

## Track A: Animation & Interaction Engine (foundation)

| # | Task | Files | Depends | Est |
|---|------|-------|---------|-----|
| A1 | Scroll reveal system | `scripts/scroll-reveal.js`, `styles/reveal.css` | — | 2h |
| A2 | Page transition engine | `scripts/transitions.js`, `styles/transitions.css` | — | 3h |
| A3 | Custom precision cursor | `scripts/cursor.js`, `styles/cursor.css` | — | 2h |
| A4 | Magnetic button physics | `scripts/magnetic.js` | — | 1.5h |
| A5 | Parallax depth layers | `scripts/parallax.js`, `styles/parallax.css` | — | 2h |
| A6 | Loading skeleton states | `styles/skeleton.css`, update router | A2 | 1h |
| A7 | Image load choreography | `scripts/image-reveal.js`, `styles/image-reveal.css` | — | 2h |

## Track B: Visual Assets & Generative Art

| # | Task | Files | Depends | Est |
|---|------|-------|---------|-----|
| B1 | Homepage ambient particle field | `scripts/media/ambient-field.js`, update `views/home.js` | — | 3h |
| B2 | Project card hero images (generate/fallback) | `scripts/media/card-composer.js` | — | 2h |
| B3 | SVG technical illustrations (4 inline SVGs) | `scripts/media/tech-illustrations.js` | — | 3h |
| B4 | Custom favicon + OG image | `public/favicon.svg`, `public/og-image.png` | — | 1h |

## Track C: Case Study Depth

| # | Task | Files | Depends | Est |
|---|------|-------|---------|-----|
| C1 | Terminal recording player (cast files) | `scripts/media/cast-player.js`, `styles/cast-player.css` | — | 3h |
| C2 | Interactive before/after image slider | `scripts/media/image-slider.js`, `styles/image-slider.css` | — | 2h |
| C3 | Systems diagram integration into case studies | Update `work/*.html` templates | A1 | 2h |
| C4 | Code block highlight + annotate | `scripts/media/code-annotate.js`, `styles/code-annotate.css` | — | 2h |

## Track D: Pages & Features

| # | Task | Files | Depends | Est |
|---|------|-------|---------|-----|
| D1 | Resume scroll-animated timeline | `views/resume.js`, `styles/timeline.css` | A1 | 3h |
| D2 | Contact page with animated form | `views/contact.js`, `styles/contact.css` | A1, A4 | 2h |
| D3 | Dark mode toggle with system preference | `scripts/dark-mode.js`, update `tokens.css` | — | 2h |
| D4 | 404 page with generative art | `views/not-found.js` | B1 | 1h |

## Execution Order

**Wave 1 (parallel):** A1, A2, A3, A4, A5, A7, B1, B2, B4, C1, C2, C4, D3
**Wave 2 (after A1):** A6, C3, D1, D2
**Wave 3 (after B1):** D4, B3
**Wave 4 (integration):** Wire everything into router + app.js, test, deploy

---

## Success Criteria

- [ ] Every section reveals on scroll with staggered timing
- [ ] Page transitions are smooth cross-fades (< 200ms)
- [ ] Custom cursor transforms on interactive elements
- [ ] Homepage has ambient generative visual
- [ ] Every project card has a visual (generated or real)
- [ ] Terminal recordings play inline
- [ ] Dark mode works with system preference detection
- [ ] Resume page has scroll-animated timeline
- [ ] Contact form has micro-interaction feedback
- [ ] Lighthouse Performance >= 90, Accessibility 100
- [ ] All existing tests still pass
