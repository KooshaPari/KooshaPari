# Site Overhaul Audit — koosha-phenotype

**Date:** 2026-09-19
**Repo:** `kooshapari/koosha-phenotype` (this repo only)
**Baseline commit:** `2a1c406` ("docs(session): absorption reconciliation overview", 2026-09-18 16:56 -0700)
**Method:** static source read + build-pipeline read + runtime measurement against the staged `dist/` build in headless Chrome (`playwright` 1.63, channel `chrome`), plus axe-core 4.13 and the repo's own suites.
**Operator brief:** "site is boring, content is shit, UI/UX maybe 20% there, many readability bugs, massive performance issues, missing the Apple/other massively overengineered UI feel."

---

## 0. Verdict

The brief is accurate, and the causes are not "taste" — they are **five concrete engineering defects**, four of which are one-line-ish:

1. **The entire type scale is dead.** A regex in the CSS minifier strips the whitespace that `clamp()` requires around `+`, so all six type-step tokens are invalid and **51 `font-size` declarations collapse**. The H1 renders at 16px, not 62.4px. Nothing on the site has typographic hierarchy. (`scripts/bundle-css.js:88`)
2. **Two design systems are fighting.** A legacy dark neon theme (`styles/main.css`) overrides `html, body` background to near-black `#07080c`, while text colour comes from the newer precision palette (`--ink: #171a18`). Result: **every H1 and section heading is near-black on near-black and effectively invisible** — verified at 1.14:1 contrast and visible in the screenshots.
3. **The bundle is used by exactly one page.** `index.html` loads `/bundled/app.bundle.js`; `work.html`, `blog.html`, `resume.html`, `contact.html`, `engineering.html`, `product.html`, `archive.html` all load raw `/scripts/app.js` and pull **~50–59 module requests per page**. The 225 KB bundle optimises 1 of 8+ pages.
4. **The homepage hero is an empty black rectangle.** The WITF 3D viewer (`#witf-viewer`, the primary above-the-fold visual) depends on three.js from a third-party CDN with no timeout guard and no local fallback path; when that import is slow or blocked it sits on "Loading 3D model…" for up to ~30s. Reproduced. The same viewer can *never* work at `/work/witf` because only `index.html` ships an `importmap`.
5. **The accessibility gate cannot see the worst defect.** `axe-core` reports 0 colour-contrast violations on pages whose headings are 1.14:1, because the design system is built on `color-mix(in oklch, …)` (131 usages) whose computed value serialises with `none`, and the page background is a gradient. Axe errors out instead of reporting.

Fix order is not the order of the brief. Fixing #1 and #2 transforms the site from "looks broken" to "looks designed" in hours, before any motion or glass work lands.

**Structural note:** the `dist/` build is regenerable and was mid-rebuild by a concurrent agent during this audit; all runtime numbers below are from the staged build at 18:15 (**`dist/index.html` = 23,165 bytes, prerendered**) which matches what the current source prerenders (verified independently). A second agent has uncommitted WIP in the working tree (glass header, ambient-field perf, card shadows) — see §6.

---

## 1. UI / UX gaps vs a high-end Apple-style product page

### 1.1 There is no typographic hierarchy at all — ROOT CAUSE

`scripts/bundle-css.js:88`:

```js
output = output.replace(/\s*\+\s*/g, '+');
```

That rule is a CSS minifier optimisation intended for selectors (`a + b`). It also rewrites the **required** whitespace inside `clamp()` arithmetic. Source (`styles/tokens.css:71-76`) vs built (`styles/bundled/core.css`):

| source | built |
|---|---|
| `clamp(0.75rem, 0.71rem + 0.16vw, 0.84rem)` | `clamp(0.75rem,0.71rem+0.16vw,0.84rem)` |
| `clamp(0.96rem, 0.9rem  + 0.25vw, 1.08rem)` | `clamp(0.96rem,0.9rem+0.25vw,1.08rem)` |
| `clamp(2.45rem, 1.73rem + 2.9vw,  3.9rem)` | `clamp(2.45rem,1.73rem+2.9vw,3.9rem)` |

Per CSS Values §10.1 (`calc()` grammar), `+` and `-` require whitespace on **both** sides. `0.9rem+0.25vw` is not a valid sum. The `clamp()` is therefore invalid, `--step-0` is invalid at substitution time, and because `font-size` is inherited, `font-size: var(--step-0)` becomes `inherit`. **Every consumer collapses to the browser default 16px.**

Blast radius: **51 declarations across 11 files** depend on `var(--step-*)`:

| token | consumers |
|---|---|
| `--step--1` | 34 |
| `--step-1` | 7 |
| `--step-0` | 6 |
| `--step-3` / `--step-4` / `--step-2` | 2 / 1 / 1 |

A/B proof, same page load, same DOM — only the six clamp values were repaired by injecting a corrected `:root`:

| selector | shipped | with clamps repaired | declaration |
|---|---|---|---|
| `body` | **16px** | 17.28px | `styles/base.css:23` |
| `h1` | **16px** | **62.4px** | `styles/base.css:71` |
| `.artifact-summary` | 16px | 17.28px | inherits from body |
| `.artifact-media figcaption` | 16px | 13.44px | `styles/artifacts.css:255` |
| `.atelier-label` | 16px | 13.44px | eyebrow, in every artifact |
| `.engineering-domain__desc` | 16px | 13.44px | `styles/main.css` |
| `.artifact-badge` | 9.6px | 9.6px | `styles/artifacts.css:166` (`rem`, unaffected) |

Consequence: **the single most visible UI/UX gap is that nothing is bigger than anything else.** No display type, no hero scale, no eyebrow/meta distinction, no rhythm. This is precisely "UI/UX maybe 20% there" and "boring". It also *hides* a second bug — `.home-identity h1 { max-width: 19ch }` (`styles/artifacts.css:30`) is `19ch` of a 16px font, so the homepage headline wraps into a **185px-wide column** (measured `h1` box `507×524` in a 1440px viewport) of five cramped lines.

### 1.2 Two design systems ship simultaneously

`styles/main.css:13-47` declares a complete legacy dark/neon system (`--bg-0: #07080c`, `--accent-eng: #5fb4ff`, `--accent-prod: #ffb95c`, `--accent-pheno: #b6f06b`, radii `--r-md/lg/xl`, `--sans/--mono/--display`), and `styles/main.css:51-57` then does:

```css
html, body { background: radial-gradient(...), radial-gradient(...), radial-gradient(...), var(--bg-0); }
```

`styles/base.css:7-9` sets `html { background: var(--surface); color: var(--ink) }` where `--surface: #f3f0e8` and `--ink: #171a18`. Both selectors are specificity `(0,0,1)`, so **source order decides** — and `main.css` is bundled into `pages.css`, which loads *after* `core.css` (`scripts/bundle-css.js` bundle map). The legacy dark background wins; the new light text colour also wins. The site renders as a near-black page with near-black text and light panels floating on it.

Screenshot evidence (`/` at 1440×900): the header is light lavender, the page is black, the four "Technical domains" cards are light boxes, and the eyebrow, H1, intro paragraph and both nav links are barely legible dark-on-black.

`main.css:8-11` also carries `@import url("./radar.css")` … `@import url("./hero.css")`. Those `@import`s land **mid-bundle** in `pages.css` (after `hero.css`/`main.css` rules), where `@import` is invalid and silently ignored. They only appear to work because `bundle-css.js` happens to list those files elsewhere. Dead, order-dependent wiring.

### 1.3 Header / nav

- The header is **not sticky** and has no blur at baseline: measured `.atelier-header` → `position: relative`, `backdrop-filter: none`, `height: 104px` (`styles/shell.css:3-8`). There is no scroll-state change.
- Nav is 4 links + a lens toggle + Reader + Index in one row. There is **no mobile nav affordance** — no hamburger, no drawer; `styles/responsive.css` reflows but the control cluster does not collapse.
- Dark-mode toggle exists and persists (`scripts/dark-mode.js`, `STORAGE_KEY` at line 33) and is re-inserted per render (`scripts/components/shell.js:115`) — but see §2.5 for its correctness bugs.

### 1.4 Motion modules: what is actually wired

`scripts/app.js` imports and calls the full motion set (`initScrollReveal` … `initScrollChoreography`, `scripts/app.js:19-33`), plus a deferred block at `scripts/app.js:140-153`. Assessment:

| module | loaded | effective on `/` | evidence |
|---|---|---|---|
| `scroll-reveal.js` | yes | yes | `data-reveal="up"` present in prerendered markup |
| `perspective-tilt.js` | yes | yes | `data-tilt-*` on `.artifact-media` (`scripts/components/artifact.js:57`) |
| `scroll-choreography.js` | yes | yes | drives `.artifact` reveal staging, `scripts/scroll-choreography.js:29,122,159,167` |
| `scroll-choreography.js:85` | yes | **no** | targets `heroPlate.querySelector('.artifact-media')` for the physical plate only |
| `parallax.js` | yes | **NO — fully dead** | scans `document.querySelectorAll('[data-parallax]')` (`scripts/parallax.js:26`); **0 elements in the prerendered homepage carry `data-parallax`**. It initialises, finds nothing, and does nothing on every page. |
| `cursor.js` | yes, **twice** | yes | `index.html:64` (inside the bundle) *and* `index.html:65` inline `import('/scripts/cursor.js')`. The guard at `scripts/cursor.js:104` prevents a double mount, but the repo pays a second request path and carries the module twice. |
| `magnetic.js`, `image-reveal.js`, `counter-animate.js`, `lightbox.js` | yes | partial | no `[data-count-to]`/masonry targets on the homepage render path |

Missing capability relative to an Apple-style page:

- **No view transitions.** `document.startViewTransition` is never used; all navigation is `history.pushState` + `innerHTML` replacement (`scripts/router.js:100-110`, `scripts/app.js:88-158`). Cross-page continuity — the single highest-leverage "premium" feeling — is absent.
- **No scroll-driven animation.** 0 uses of `scroll-timeline` / `animation-timeline`. Everything is `requestAnimationFrame` + scroll listeners.
- **No sticky/glass chrome**, no section pinning, no progressive-disclosure scroll storytelling.
- 19 `@keyframes`, 88 `transition:` declarations, 11 `will-change` — the primitives exist, but totals that low across 29 CSS files (5,732 lines) describe a system that is *restrained to the point of static*. The tokens file itself states the intent (`styles/tokens.css` header: "Motion is intentionally short — short 120ms, standard 180ms, none of the dashboard-style ambient loops").

### 1.5 Artifact cards are the strongest asset and are under-sold

The artifact system (`scripts/components/artifact.js`) is genuinely novel — physical plates, systems sheets, experiment notes, per-project family accents (`styles/tokens.css:106-127`). But on `/` the cards render **flat**: no media for the hero artifact (see §3.2), `border-radius` stays square (`styles/tokens.css:90-93`, deliberate "precision" aesthetic), and the only hover is a 4px lift + shadow. There is no scroll-linked scale, no media parallax, no reveal choreography that reads as deliberate.

---

## 2. Readability bugs

### 2.1 Near-black text on a near-black page (headings, eyebrows, links)

Measured effective contrast (foreground resolved against the composited backdrop, WCAG 2.x relative luminance):

| element | fg | bg | ratio | required | verdict |
|---|---|---|---|---|---|
| `body` (page canvas) | `#171a18` (`--ink`) | `#07080c` (`--bg-0`) | **1.14:1** | 4.5:1 | **FAIL** |
| `.atelier-label` (eyebrow above *every* artifact) | `#3d4239` (`--ink-muted`) | `#07080c` | **1.94:1** | 4.5:1 | **FAIL** |
| `.home-primary-links a` (secondary CTA) | `#b0b5a8`/`--ink-muted` on dark | `#07080c` | ~1.9:1 | 4.5:1 | **FAIL** (seen near-invisible in screenshot) |
| `.artifact-media figcaption` | `#c8c5bb` (`--concrete-300`) | `#faf7ef` | **1.61:1** | 4.5:1 | **FAIL** |
| `.metric-annotation span` / `small` | `#3d4239` | translucent tint on dark | ~1.96:1 | 4.5:1 | **FAIL** |
| `.artifact-badge` | `#ab5d36` | `#f3ded5` | **3.73:1** | 4.5:1 | **FAIL** (and 9.6px) |
| `.footer` | `#67738c` (`--fg-dim`) | `#07080c` | 4.20:1 | 4.5:1 | **FAIL** (and 11px) |

Declarations: `styles/base.css:8-9` (`html { background: var(--surface); color: var(--ink) }`), `styles/tokens.css:48-58` (`--ink`, `--ink-muted`, `--concrete-300: #c8c5bb`), `styles/artifacts.css:253` (`figcaption { color: var(--concrete-300) }`), `styles/main.css:14` + `:51-57` (dark page background), `styles/main.css:404-405` (`.footer { font: 500 11px/1; color: var(--fg-dim) }`).

The visible symptom is on `/work` and `/blog` and `/resume`: the page `<h1>` ("Work", "Writing", "Experience") renders as a **dark grey ghost on black**, unreadable. Cause chain: `styles/main.css:184` gives `.portfolio-view > h1 { font: 700 clamp(2.3rem,6vw,5rem)/.98 var(--display) }` — a real display size — but no `color`, so it inherits `--ink` from `styles/base.css:9`. That is why `/work` has an (invisible) giant heading while `/`'s heading is a 16px speck: **the two design systems each style `h1` differently and neither wins cleanly.**

### 2.2 Line lengths and type sizes

- `--measure: 68ch` (`styles/tokens.css:88`) is applied to exactly **one** selector: `.lede` (`styles/base.css:262-263`). Body copy and long-form blog prose have no measure constraint; the `/resume` bullet lists run the full card width and the `/blog` excerpts run edge-to-edge (visible in screenshots).
- `.artifact-summary { max-width: 62ch }` (`styles/artifacts.css:212`) and `.artifact-header { max-width: 44rem }` (`:191`) are correctly constrained — the artifact cards are the one place typography is disciplined.
- Type sizes below 16px in body copy: `.artifact-text-summary` and 33 other `var(--step--1)` consumers *intend* 12–13.4px (`styles/tokens.css:71`) and, post-fix, will be 13.44px — small for a paragraph of explanatory prose.
- Hardcoded micro-type below 12px: `styles/artifacts.css:297` (0.6rem = 9.6px, the "E"/"P" lens marker), `styles/artifacts.css:166` (0.6rem badge), `styles/artifacts.css:342` (0.65rem evidence label), `styles/cast-player.css:193` (0.62rem), `styles/code-annotate.css:218` (0.625rem), `styles/work-catalog.css:73` (0.65rem). Nine of these are UI labels, not legal text.

### 2.3 Annotation and qualification clutter

Quantified from the prerendered homepage (`dist/index.html`, 978 visible words total):

| block | count | words | note |
|---|---|---|---|
| `.artifact-annotation` | 7 | 124 | one per artifact, each prefixed by a decorative `E`/`P` chip |
| `.artifact-text-summary` | 5 | 89 | **duplicate of the `aria-label` on the sibling diagram** |
| `figcaption` | 3 | 19 | `physical-product / historical` ×2, plus OmniRoute's |
| `.omniroute-topology__qualification` | 1 | 25 | "Conceptual routing overview, not a universal execution trace…" |
| `<details data-topology-reader>` | 1 | 90 | "Read routing paths" — 6 numbered steps restating the SVG |
| `.metric-annotation` | 3 | — | each carries a 3rd line reading **"canonical user fact"** |

Two concrete defects:

1. **Verbatim duplication.** `scripts/components/artifact.js:100-112` renders `role="img"` with `aria-label: record.presentation.alt` **and** `aria-describedby` pointing at a *visible* `<p class="artifact-text-summary">` containing the same sentence. Quoted from the built page:
   > `aria-label="Process topology drawing connecting concurrent coding agents to queues, coalesced events, shared runtime state, and host resources."`
   > `<p id="artifact-sharecli-summary" class="artifact-text-summary">Process topology drawing connecting concurrent coding agents to queues, coalesced events, shared runtime state, and host resources.</p>`

   A screen reader hears it twice and a sighted reader sees a paragraph of alt-text. Same pattern for `substrate`, `phenotype-omlx`, `netweave`.
2. **Process language in the UI.** Each `.metric-annotation` renders a third line, `#{canonical user fact}` / `#{upstream PR history}` (`scripts/components/evidence.js:22-31`, data from `data/projects.js`, 2 occurrences of the literal `canonical user fact`). "canonical user fact" is an internal audit taxonomy, not a reader-facing label. The OmniRoute artifact stacks **four** consecutive qualifications (figcaption, 25-word qualification paragraph, 90-word `<details>`, plus the visible text-summary), which is why that card reads as bureaucracy rather than a product.

### 2.4 ARIA and semantics

- `role="note"` on `.metric-annotation` with `aria-label="unit planning sequence: ~15 -> ~100 -> ~50"` duplicates the visible `<strong>` and `<span>` content.
- The annotation chip is `aria-hidden="true"` but carries the only indication of which lens ("E"/"P") produced the annotation — the lens is otherwise unlabelled at the annotation level.
- Homepage heading order is `h1 → h2 ×2 → h3 ×4` — valid (an `h2` was deliberately added, see the comment at `scripts/views/home.js:52-54`).
- `#reader-toggle` is given `title="Enter Reader Mode (R)"` (`scripts/components/shell.js:66`) but no `aria-keyshortcuts`, so the `R` shortcut is undiscoverable to assistive tech.

### 2.5 Dark mode is structurally unsound in three ways

1. **Flash of light theme.** `index.html:2` is `<html lang="en">` with no `data-theme`; `dist/index.html:2` is hardcoded `<html data-theme="light">` by the prerenderer. A user whose OS prefers dark gets a light page, then `initDarkMode()` (`scripts/components/shell.js:115` → `scripts/dark-mode.js:135-137`) flips it after the bundle boots. There is no pre-paint inline script.
2. **The dark token block is 9 declarations against 87 light token definitions** (`styles/tokens.css:205-218`). Tokens defined in light only and therefore stale in dark include `--surface-inset: #e2dfd8` (`tokens.css:137`, a *light* value used as a panel background by `styles/work-catalog.css:64,73` and `styles/case-studies.css:14,24,31,33`), `--shadow-card`, `--shadow-specimen` (`:98`, which computes to a **light** hard shadow because it mixes `--ink`, now `#f3f0e8`), and `--concrete-300` (`:56`, used for `figcaption` text).
3. **Measured dark-mode defects:** `.artifact-badge` keeps the light-mode `color-mix(in oklch, var(--paper-100) 72%, transparent)` background (`styles/artifacts.css:171`) but flips its text to `--ink-muted` `#b0b5a8` (`:172`) → light-on-light pill. `.artifact-context` keeps `color-mix(in oklch, var(--paper-100) 40%, transparent)` (`styles/artifacts.css:280`) → a light band inside a dark card. Meanwhile the `figcaption` that is unreadable in light mode becomes 9.2:1 in dark mode — the two themes fail in opposite places, which is the signature of unreconciled palettes.

### 2.6 The accessibility gate gives false assurance

`tests/browser/acceptance.spec.js:17-25` asserts no `critical`/`serious` axe violations, and it **passes**. I ran axe-core directly on `/`, `/work` and `/resume`:

```
=== / ===        violations(all): (none)
                 incomplete(all): color-contrast x1  (impact=serious)
                   - button[data-state="idle"]:nth-child(1) | "Axe encountered an error"
```

Zero violations on a page whose headings are 1.14:1. Isolated cause, from a controlled probe:

| probe element | axe result |
|---|---|
| hex background + bad contrast | **flagged**, ratio 1.51 |
| `oklch()` background + bad contrast | **flagged**, ratio 1.67 |
| `color-mix(in oklch, …)` background | **"Could not parse color string oklch(0.95525 0.0111265 none)"** |
| gradient background | **"background color could not be determined"** |

This site has both conditions everywhere: **131 `color-mix(in oklch, …)` usages** and a 3-gradient `body` background (`styles/base.css:20-22`). So the contrast rule aborts and the green CI tick is meaningless. Any contrast work must be validated with a hex-resolving checker, not axe-in-CI.

---

## 3. Performance

### 3.1 The bundle optimises exactly one page

Only `index.html` references the 225 KB bundle. Every other page loads the raw module graph.

| page | script tag | measured requests | measured transfer |
|---|---|---|---|
| `/` (`dist/index.html`) | `/bundled/app.bundle.js` | **12** | 444.5 KB |
| `/work` (`dist/work.html:36`) | `/scripts/app.js` | **59** | 539.3 KB |
| `/resume` (`dist/resume.html:36`) | `/scripts/app.js` | 53 | 454.1 KB |
| `/contact` (`dist/contact.html:36`) | `/scripts/app.js` | 52 | 446.5 KB |
| `/blog` (`dist/blog.html:41`) | `/scripts/app.js` | 52 | 446.5 KB |

Source lines: `work.html:36`, `blog.html:41`, `resume.html:36`, `contact.html:36`, `engineering.html:36`, `product.html:36`, `archive.html:36` — all `<script type="module" src="/scripts/app.js"></script>`. Full waterfall for `/work` includes 45+ distinct module fetches plus `data/projects.js` (34.6 KB), `data/posts.js` (31.0 KB), `data/phenotype.js` (23.2 KB) loaded as **separate module scripts on every route** regardless of whether the route needs them. `scripts/bundle-js.js:112` builds the bundle; nothing routes the other pages to it.

Two further asset-wiring defects:

- `dist/resume.html` links `/styles/resume-timeline.css` as a 4th stylesheet **while that file is already inside `components.css`** (`scripts/bundle-css.js` bundle map lists `resume-timeline.css` under `components.css`). Duplicate CSS download, duplicate parse. Consumed at `scripts/views/resume.js:62` (`link.href = '/styles/resume-timeline.css'`).
- `styles/<file>` is served `public, max-age=31536000, immutable` (`vercel.json` headers), and the bundled CSS filenames are **not content-hashed** (`core.css`, `components.css`, `pages.css`). With `immutable` caching plus no hash, a CSS change will not reach returning visitors within a year, and the same applies to `/bundled/app.bundle.js` and `/public/*`. This is a cache-invalidation time bomb.

### 3.2 Render-blocking and preload strategy

- `index.html:23` loads `core.css` (17.7 KB) render-blocking. `index.html:24-25` load `components.css` (53.7 KB) and `pages.css` (53.9 KB) with the `media="print" onload="this.media='all'"` async pattern. **But `core.css` contains only `tokens.css + base.css + shell.css`**, so everything that defines the artifact/hero card layout lives in the two deferred sheets — the page paints structurally unstyled first. On localhost (0 ms latency) the swap lands within the same frame and no flash was measurable; the risk is real and grows with latency. The `onload` handler also requires inline-script permission, which a strict CSP would break.
- `index.html:21` preloads `/public/projects/witf/hero-01.webp` at `fetchpriority="high"`. **The homepage never renders that image.** The WITF hero artifact renders a `<div id="witf-viewer">` 3D container (`scripts/components/artifact.js:57-58`); `hero-01.webp` is used only as the WITF thumbnail in `scripts/views/work.js:80`. Chrome says so itself — captured console output on `/`:

  > `The resource http://.../public/projects/witf/hero-01.webp was preloaded using link preload but not used within a few seconds from the window's load event.`

  Measured cost: **48.2 KB at high priority competing with the real LCP.** The actual hero (three.js + GLB) is not preloaded, and the real LCP-candidate image (`gmk-arch/hero-blender.webp`) is discovered late (t=368 ms, `loading="lazy"`, no preload).
- `/work` measured FCP 216 ms but pulls 59 requests; `/` measured FCP 456 ms. LCP could not be sampled via `getEntriesByType('largest-contentful-paint')` (it requires a `PerformanceObserver`); the numbers above are FCP and are pre-throttling.

### 3.3 The homepage hero is an external single point of failure

`scripts/media/witf-viewer.js:145-148` dynamically imports three.js from a CDN declared in an importmap (`index.html:26-33`):

```js
await Promise.all([ import('three'), import('three/addons/controls/OrbitControls.js'), import('three/addons/loaders/GLTFLoader.js') ]);
```

- `three.module.js` = **1,314,681 bytes** (curl, verified 200), plus GLTFLoader 110 KB and OrbitControls 32 KB, plus **`public/projects/witf/witf-keyboard.glb` = 2,671,324 bytes (2.67 MB)**. That ~4 MB is loaded on the homepage's above-the-fold hero, from a third-party origin (extra DNS + TLS).
- **No timeout guard.** On import failure the only recovery is the `catch` at `scripts/media/witf-viewer.js:291-295` → `showPoster()`. Reproduced: in a sandboxed browser the three CDN fetches failed `net::ERR_TIMED_OUT`, and the hero sat on `<div class="witf-viewer-loading">Loading 3D model…</div>` for **25 s (one probe: still loading at 25 s; the import rejected at 30.1 s**). Because the `import()` is at the top of the `try`, even a *predictive* local-poster fallback is impossible — but there is also no `AbortController`/race, so the poster is strictly reactive and arrives up to 30 s late.
- **`/work/witf` can never render the viewer at all.** Only `index.html` contains the importmap; `dist/work.html`, `dist/work/witf.html`, `dist/blog.html`, `dist/resume.html`, `dist/contact.html` have none (verified: `grep -c importmap` → 1, 0, 0, 0, 0, 0). Measured console on `/work/witf`:

  > `[WITF Viewer] Failed to load 3D model, falling back to poster: TypeError: Failed to resolve module specifier 'three'`

  So the flagship artifact's interactive view silently degrades to a static image on its own detail page.
- `scripts/app.js:140-153` schedules `initWitfViewer()` inside a `requestIdleCallback` *after* `render()`, while `destroyWitfViewer()` runs at the top of every render (`scripts/app.js:91`). The `_destroyed` flag is reset at `scripts/media/witf-viewer.js:125`, which papers over the race, but on route churn a queued idle callback can still fire against a torn-down container.

### 3.4 Bundle contents vs. reality

`dist/bundled/app.bundle.js` = 225,423 bytes (the committed `bundled/app.bundle.js` is a stale 181,730-byte artefact from 2026-09-16 — it is git-ignored but present in the tree, which is confusing). Composition: `scripts/app.js` (201 lines) + views + `components/` + `lens-state`/`reader-state`/`router` + 13 motion modules + 12 `media/` modules, minified by esbuild via `scripts/bundle-js.js:138`. It **also statically includes `scripts/cursor.js`** (`scripts/bundle-js.js:113` `loadModule(resolve(ROOT, 'scripts/cursor.js'))`) so that module is shipped twice-over. Three.js is *not* in the bundle (dynamic import, preserved).

The real problem is not bundle size but §3.1: 7 of 8 pages bypass it entirely, so the toolchain's savings are unrealised. `data/*.js` (88.8 KB) is a second-order win: it is bundled for `/` but fetched as 3 separate modules elsewhere.

### 3.5 Build pipeline fragility observed

At 18:37 during this audit, `dist/` contained **shell-only** HTML (`dist/index.html` = 3,714 bytes = the raw source shell) with no `work/*.html` and no prerendered content — an incomplete run of `npm run stage:publication` by a concurrent agent. I verified this was not a code regression by running the three prerender stages against an isolated copy: `prerenderTopLevel: OK`, `prerenderProjects: OK`, `prerenderPosts: OK`, producing `index.html` = 23,165 bytes, matching the earlier build. I then re-ran the full `stage:publication` to restore a valid `dist/`. Note the build has **no atomicity guard** — it `rm -rf`s `dist/` first (`scripts/stage-publication.js:20`) and writes incrementally, so an interrupted or concurrent build publishes a broken site.

### 3.6 SEO/routing defect with a performance cost

`sitemap.xml` advertises 28 URLs including 5 blog posts. `vercel.json` rewrites only `/blog/why-we-forked-omniroute`. The other four —

- `/blog/what-keycaps-taught-me-about-systems`
- `/blog/building-at-the-systems-boundary`
- `/blog/declarative-deployment-separating-intent-from-execution`
- `/blog/running-hundreds-of-ai-agents-without-losing-your-mind`

— are prerendered to `dist/blog/<slug>.html` (634–777 words each, real content) **but have no rewrite**, so they fall through `vercel.json`'s catch-all to `/root.html`. `dist/root.html` is a copy of `index.html` (`scripts/stage-publication.js:36-37`) whose `<link rel="canonical" href="https://kooshapari.com/" />` **claims to be the homepage**. Google is told four substantial posts are duplicates of `/`. The prerendered files are only reachable at their `.html` URLs, which the sitemap does not list.
