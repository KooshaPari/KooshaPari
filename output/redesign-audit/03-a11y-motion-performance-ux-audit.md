# Accessibility, Motion, Performance, and UX Audit (Corrected)

Date: 2026-09-12

## Corrections to previous audit (03)

| Previous claim | Correction |
|---|---|
| "No `prefers-reduced-motion` found in `styles/*.css`" — marked **MISSING** | **FALSE.** Present in 7 source CSS files. See table below. |
| "No-JS fallback: ShareCLI only; all other JS-rendered routes are empty shells" | **INCORRECT.** `prerender.js` generates static HTML for 19 of 20 routes at build time. Only `/archive` is outside prerender scope. |
| "Reduced-motion equivalents: Unknown" | **VERIFIED.** Global killswitch + 6 per-component overrides exist. |
| "File length is NOT a performance metric" | Acknowledged. `main.js` at 1824 lines is a maintainability concern, not a runtime metric. |
| "Self-hosted fonts: NOT IMPLEMENTED" | **Correct outcome** — system stack only, no @font-face. This is a fact, not necessarily a defect. |

## Reduced-motion inventory (verified)

| File | Line | Scope |
|---|---|---|
| `styles/tokens.css` | 196 | **Global killswitch** — kills all animations/transitions site-wide |
| `styles/main.css` | 212 | **Global killswitch** (duplicate) — animation-duration, scroll-behavior, transition-duration |
| `styles/hybrid-shell.css` | 688 | Shell chrome transitions |
| `styles/case-studies.css` | 127 | NetWeave/ShareCLI workbench button transitions |
| `styles/construction-gate.css` | 62 | Backdrop-filter removal |
| `styles/work-catalog.css` | 67 | Featured image transform/transition |
| `styles/project-visuals.css` | 259 | Project visual element transitions |

**All 7 files have `@media (prefers-reduced-motion: reduce)` rules.**

## Accessibility inventory

| Check | Status | Evidence |
|---|---|---|
| Skip link (`#view-root`) | Present in all 20 HTML routes | Source inspection |
| `aria-labelledby` on project index dialog | Present in `project-index.js` | Code review |
| Focus management on project index open/close | Present — `returnFocus` + `dialog.addEventListener('close')` | Code review |
| Keyboard ArrowUp/Down/Home in project index | Added in current iteration | `git diff` on `project-index.js` |
| Escape clears search in project index | Added in current iteration | `git diff` on `project-index.js` |
| Noscript fallback (ShareCLI) | Present — ordered list with `aria-label` | `work/sharecli.html` |
| Static HTML fallback (other routes) | **Prerendered** — `prerender.js` generates content for 19/20 routes | `scripts/prerender.js` |
| `/archive` route static fallback | **MISSING** — not in `TOP_LEVEL_ROUTES` | `scripts/prerender.js:15-23` |
| `aria-live` status for project index count | Present — `role="status"` + `aria-live="polite"` | Code review |
| Image `alt` text in static HTML | NetWeave `<picture>` has `alt`; other routes rely on JS data | `work/netweave.html` |
| Image `alt` text in JS-rendered views | Defined in `FEATURED_PRESENTATIONS` for 7 projects | `data/projects.js` |
| Keyboard reachability of lens controls | **UNKNOWN** — no keyboard test evidence | Requires browser test |
| Visible focus styles | Defined in `styles/base.css` — `--focus-ring` token | CSS inspection |
| Axe automated audit | Test exists (`tests/browser/acceptance.spec.js`) but no recent run | **No browser evidence** |

## Motion inventory (corrected)

| Motion target | Implementation | Reduced-motion? |
|---|---|---|
| Page enter/exit transitions | `@keyframes page-enter`, `page-exit` in `tokens.css` | YES — global killswitch |
| Lens cross-fade | `@keyframes lens-cross-fade` in `tokens.css` | YES — global killswitch |
| Button press feedback | `@keyframes button-press`, `button-release` in `tokens.css` | YES — global killswitch |
| Toast slide | `@keyframes toast-slide` in `tokens.css` | YES — global killswitch |
| Hover lift | `@keyframes hover-lift` in `tokens.css` | YES — global killswitch |
| NetWeave state transitions | `netweave-field.js` + `netweave-workbench.js` | YES — `case-studies.css:127` |
| ShareCLI state transitions | `sharecli-workbench.js` + `sharecli-recording.js` | YES — `case-studies.css:127` |
| OmniRoute topology diagram | `omniroute-topology.js` (89 lines) | YES — global killswitch |
| Construction gate backdrop | `construction-gate.css:62` | YES — backdrop-filter removed |
| Work-catalog featured image | `work-catalog.css:67` | YES — transform/transition none |
| Project visual elements | `project-visuals.css:259` | YES — per-component override |

## Performance inventory

| Check | Status | Evidence |
|---|---|---|
| `main.js` | 1824 lines | `wc -l` — maintainability concern, not runtime metric |
| CSS files all under 500 lines | All verified (max: hybrid-shell 536) | `wc -l styles/*.css` |
| Self-hosted fonts | System stack only — no @font-face, no font files | `rg font-face styles/` returns 0; no `fonts/` directory |
| Third-party blocking requests | No CDN links in HTML; all JS/CSS local | Source inspection |
| Image optimization | WebP for NetWeave, JPEG for WITF, GIF for DSS Cipher | `data/projects.js` |
| Layout shift prevention | Width/height on NetWeave `<picture>`; JS-rendered images rely on `media` field in data | Partial — CLS risk |
| Build/prerender pipeline | `prerender.js` + `stage-publication.js` functional | Code review |
| Dist staleness | `dist/styles/` missing `project-index.css` | `ls dist/styles/` |

## UX state inventory

| State | Coverage |
|---|---|
| Empty project index search | Implemented — "No projects match" message |
| No-JS fallback | **Prerendered** for 19/20 routes (all except `/archive`) via `prerender.js` |
| 404 / unknown route | `scripts/views/not-found.js` (12 lines) |
| Loading state (before JS) | Blank `#view-root` until prerender content paints; no loading indicator |
| Filter active state (work) | `work-filters.js` (30 lines) + `work-catalog.css` |
| Project index open state | `dialog`-based, keyboard-navigable |
| Lens switching (eng/prod) | `lens-state.js` (88 lines) |
| Reader/print mode | `reader-state.js` (125 lines) |
| Construction gate | `construction-gate.js` + `construction-shell.js` (28 lines) + `construction-gate.css` (63 lines) |
| Social/mobile share metadata | OG and Twitter cards present in all HTML files |

## Source vs dist vs browser evidence

| Layer | Status |
|---|---|
| Source (this worktree) | Verified — all files present, data complete |
| `dist/` output | Partially stale — missing `project-index.css`, NetWeave v2 assets present |
| Browser evidence | **NONE** — no Playwright screenshots, no axe output, no Lighthouse reports |
| Live deployment | Unknown — not verified from this worktree |
