# Route and Shell Audit (Corrected)

Date: 2026-09-12
Branch: `review/public-site-sync-20260909`

## Corrections to previous audit (01-route-and-shell-audit.md)

| Previous claim | Correction |
|---|---|
| "hybrid-shell.css — MISSING (0 bytes, never created)" | **FALSE** — `styles/hybrid-shell.css` exists at 536 lines |
| "project-visuals.css — MISSING (0 bytes, never created)" | **FALSE** — `styles/project-visuals.css` exists at 257 lines |
| "Neither file exists" | Both files exist in source and are linked in all HTML routes |

## Route inventory (verified from source)

| Route | File | Shell JS | Static content source |
|---|---|---|---|
| `/` (home) | `index.html` | `app.js` | prerender.js: `renderHome()` |
| `/engineering` | `engineering.html` | `app.js` | prerender.js: `renderHome()` with lens |
| `/product` | `product.html` | `app.js` | prerender.js: `renderHome()` with lens |
| `/work` | `work.html` | `app.js` | prerender.js: `renderWorkCatalog()` |
| `/resume` | `resume.html` | `app.js` | prerender.js: `renderResume()` |
| `/contact` | `contact.html` | `app.js` | prerender.js: `renderContact()` |
| `/blog` | `blog.html` | `app.js` | prerender.js: `renderBlogIndex()` |
| `/archive` | `archive.html` | `app.js` | Not in prerender TOP_LEVEL_ROUTES |
| `/work/netweave` | `work/netweave.html` | `app.js` | prerender.js: `renderProjectDetail()` |
| `/work/sharecli` | `work/sharecli.html` | `app.js` | prerender.js + inline noscript |
| `/work/omniroute` | `work/omniroute.html` | `app.js` | prerender.js: `renderProjectDetail()` |
| `/work/gmk-arch` | `work/gmk-arch.html` | `app.js` | prerender.js: `renderProjectDetail()` |
| `/work/witf` | `work/witf.html` | `app.js` | prerender.js: `renderProjectDetail()` |
| `/work/substrate` | `work/substrate.html` | `app.js` | prerender.js: `renderProjectDetail()` |
| `/work/phenotype-omlx` | `work/phenotype-omlx.html` | `app.js` | prerender.js: `renderProjectDetail()` |
| `/work/tracera` | `work/tracera.html` | `app.js` | prerender.js: `renderProjectDetail()` |
| `/work/byteport` | `work/byteport.html` | `app.js` | prerender.js: `renderProjectDetail()` |
| `/work/dss-cipher` | `work/dss-cipher.html` | `app.js` | prerender.js: `renderProjectDetail()` |
| `/work/frostify` | `work/frostify.html` | `app.js` | prerender.js: `renderProjectDetail()` |
| `/blog/why-we-forked-omniroute` | `blog/why-we-forked-omniroute.html` | `app.js` | prerender.js: `renderBlogPost()` |

**Total: 20 routes** (the archive route is outside the prerender scope)

## No-JS / static fallback (corrected)

The previous audit claimed "ShareCLI only; all other JS-rendered routes are empty shells." This is incorrect.

**Evidence:** `scripts/prerender.js` exports three functions:
- `prerenderTopLevel()` — renders shell + view for 7 top-level routes
- `prerenderProjects()` — renders shell + `renderProjectDetail()` for all 15 projects
- `prerenderPosts()` — renders shell + `renderBlogPost()` for published posts

At build time (via `stage-publication.js`), every route except `/archive` receives static HTML content in `#view-root`. Buttons are stripped by `removeInertControls()` but text content, navigation links, and semantic structure persist.

**Gap:** `/archive.html` is not in `TOP_LEVEL_ROUTES` — it receives no prerender and will be an empty `#view-root` without JS.

## CSS stack (verified)

All 20 HTML files reference this stylesheet chain:

```
tokens.css → base.css → shell.css → artifacts.css → case-studies.css
→ responsive.css → project-visuals.css → hybrid-shell.css
```

Additional route-specific: `work-catalog.css`, `project-index.css`, `blog.css`, `hero.css`, `radar.css`, `timeline.css`, `cards.css`

**All 17 source CSS files exist on disk.** Line counts:

| File | Lines |
|---|---|
| hybrid-shell.css | 536 |
| base.css | 435 |
| main.css | 409 |
| artifacts.css | 390 |
| cards.css | 339 |
| project-visuals.css | 257 |
| tokens.css | 202 |
| hero.css | 175 |
| blog.css | 173 |
| responsive.css | 152 |
| shell.css | 147 |
| case-studies.css | 127 |
| radar.css | 120 |
| project-index.css | 120 |
| timeline.css | 117 |
| work-catalog.css | 99 |
| construction-gate.css | 63 |

**Dist staleness:** `dist/styles/` does not contain `project-index.css` which exists in source. The dist build may be out of date.
