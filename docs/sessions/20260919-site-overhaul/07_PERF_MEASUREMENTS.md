# Performance Measurements — koosha-phenotype

Owner: performance worker (jcode), 2026-09-19.
All numbers are measured, not estimated. Commands: `npm run stage:publication`,
Chromium via Playwright, `scripts/preview-server.js` on 127.0.0.1:4197.

> Scope note: the working tree also contains another worker's changes
> (`scripts/components/shell.js`, `scripts/scroll-choreography.js`,
> `styles/*.css`). None of the numbers below were caused by, or depend on,
> those edits except where stated.

---

## 1. Headline results

| Finding | Before | After |
|---|---|---|
| Hero canvas backing store (1280x720 @ dpr 2) | 2404 x 3614 = **8,688,056 px** | 1152 x 1735 = **1,998,720 px** |
| Detached hero canvases still redrawing after leaving `/` | **13–164 draws/s forever**, +1 canvas per home visit | **0** |
| Home hero canvas draw rate | 60/s (display rate) | **30/s cap**, time-scaled motion |
| WebGL probe contexts after 7 home renders | **7** (never released) | **1** |
| JS requests on `/work/sharecli`, `/resume`, `/work/witf`, `/engineering` | **47** | **1** |
| Script bytes on those pages | 308 KB (unminified, 47 files) | 219 KB (1 minified bundle) |
| Total requests on those pages | 52–56 | 6–10 |
| `three.js` + GLB on home before scrolling to the viewer | ~295 KB gzip + **2.67 MB** | **0 requests** |
| `public/projects/dss-cipher/hero.webp` | **583,462 B** (87 frames) | **148,670 B** (29 frames, −74.5%) |
| Unused `hero-01.webp` preload on `/` | 48 KB fetched, never used | removed |
| `dist/public` total | 3,756,361 B (3.58 MB) | 3,321,569 B (3.17 MB) |

---

## 2. The idle hero canvas was the dominant problem

`scripts/media/ambient-field.js` sized its canvas from the **whole**
`.home-opening` section, not the viewport: 2404 x 3614 device px at dpr 2
(34.8 MB of backing store), fully cleared and redrawn every frame.

Worse, nothing ever stopped the loop. `render()` replaced the view root, which
detached the canvas, but `tick()` kept calling `requestAnimationFrame` and
redrawing a detached 8.7 MP canvas. `destroy` was returned and discarded, and the
`resize` / `visibilitychange` listeners accumulated too.

Measured (`clearRect` calls per second, grouped by canvas):

```
BEFORE
== HOME #1 ==          15/s  2404x3614 connected=true
== AFTER -> /resume == 13/s  2404x3614 connected=false   <-- detached, still burning
== HOME #2 ==           8/s  ...connected=false
                        8/s  ...connected=true          <-- second canvas
== AFTER -> /contact == 152/s combined across 3 detached canvases

AFTER
== HOME #1 ==          28/s  1152x1735 connected=true
== AFTER -> /resume ==  (zero)
== HOME #2 ==          13/s  ...connected=true
== AFTER -> /contact == (zero)
```

Fixes: cap the backing store at 2 MP (CSS size unchanged, drawing stays in
CSS-pixel coordinates); stop when the canvas is detached, out of view, or the
tab is hidden; drop the stale instance when a new one is created; export
`destroyAmbientField()` and call it from `render()` alongside the existing
`destroyWitfViewer()`; cap the draw rate at 30 fps with real-elapsed-time motion
scaling so drift speed (0.1–0.3 px/frame) is unchanged.

## 3. 23 of 29 pages loaded the module graph instead of the bundle

Only `index.html` referenced `/bundled/app.bundle.js`. Every other page —
`engineering`, `product`, `work`, `resume`, `contact`, `blog`, `archive`, all 17
prerendered `/work/<slug>` pages and the blog posts — referenced
`/scripts/app.js`, which the browser resolved into **47 separate module
requests totalling 308 KB unminified**.

`/work/sharecli` and `/resume` were both 47 scripts. Fixed in
`scripts/stage-publication.js` with one post-prerender pass that rewrites
`src="/scripts/app.js"` to `src="/bundled/app.bundle.js"` across every staged
`*.html`, so it covers prerender output (including the per-project pages
generated from the `work/sharecli.html` template) without touching 23 source
files. Build log line `Bundled entry point applied to 27 page(s)`; 29 pages now
reference the bundle, 0 reference the module graph.

## 4. three.js and the 2.67 MB GLB loaded on the landing page

`initWitfViewer()` ran in the first `requestIdleCallback` on `/` and immediately
began `import('three')`. Measured CDN cost:

```
three.module.js      1,314,681 B raw / 265,302 B gzip
OrbitControls.js        32,134 B raw /   6,789 B gzip
GLTFLoader.js          110,273 B raw /  23,560 B gzip
witf-keyboard.glb                        2,671,324 B
```

The viewer container sits **1103 px** down at 1280x720 and **1565 px** down at
390x844 — below the fold in both cases, so the whole ~3 MB was fetched before
the visitor could see the model.

`scripts/media/witf-viewer.js` now gates the imports behind an
`IntersectionObserver` with a 300 px rootMargin, and the render loop skips
`controls.update()/renderer.render()` whenever the viewer is offscreen (the
scene auto-rotates, so an unpaused loop kept burning GPU after scrolling past).

```
BEFORE SCROLL: three/glb requests = 0    (was: started during idle, before scroll)
AFTER SCROLL:   0 -> 3 three.js requests fire, GLB follows
```

## 5. WebGL probe leaked a context on every home render

`webglSupported()` created a throwaway canvas and WebGL context per call and
never released it:

```
BEFORE: webgl getContext calls after 7 home renders = 7   (7 contexts, 0 released)
AFTER:  webgl getContext calls after 7 home renders = 1
```

Browsers cap live WebGL contexts per page, so in-app navigation eventually
forced the oldest context to be dropped. Now probed once per session and the
probe context released via `WEBGL_lose_context`.

CPU profile of the home page (swiftshader software GL), before the fix: 7.8 s of
sampled main-thread CPU, **88.9 % of it inside `webglSupported`**. After: 5.1 s
total, no single dominant JS frame.

## 6. Image and bundle waste

**`public/projects/dss-cipher/hero.webp`** was an 87-frame animated lossless
(VP8L) WebP: 583,462 B for 635 x 300. The animation is the project's actual
concept — a wordmark morphing through cipher glyphs — so it was preserved rather
than flattened to a still. Re-encoded lossy (`img2webp -lossy -q 50`), 29 frames
at 240 ms, same 6.96 s duration, same 635 x 300: **148,670 B (−74.5 %)**. Frames
were compared side by side; the only difference is slightly softer grunge
texture. Smoother alternatives if wanted: 44 frames = 202 KB, 87 frames at
q 60 = 419 KB, static = 11.7 KB.

**Dead duplicate `cursor.js`.** `scripts/bundle-js.js` inlined `cursor.js` into
the bundle "for fewer HTTP requests", but the bundler emits an IIFE with no
exports, so the inlined copy could never satisfy the HTML's
`import('/scripts/cursor.js')` — it was dead weight on the wire, fetched twice.
Removed: 220.1 KB → 218.4 KB and 48 → 47 modules.

**Unused preload.** `index.html` preloaded `/public/projects/witf/hero-01.webp`
with `fetchpriority="high"`. The home page renders the 3D viewer container, not
an `<img>`, so Chromium reported: *"The resource ... was preloaded using link
preload but not used within a few seconds from the window's load event."*
Removed; home total dropped 464 KB → 418 KB.

---

## 7. Recommended, NOT changed (shared/other-owned files)

1. **`data/projects.js:151` — `dss-cipher` has no `presentation` block.**
   `project-detail.js` therefore falls back to `width=1600 height=900` for a
   635 x 300 asset. Measured on `/work/dss-cipher`: `attrWH=1600x900`,
   `natural=635x300`, computed `aspect-ratio: auto 1600/900`. Before the image
   loads the box reserves 1.778:1, then snaps to 2.117:1 — a ~33 px shift at
   366 px wide, wider at larger breakpoints. Add a `presentation.assets` entry
   with the real dimensions and `alt` (also fixes the missing alt text, which
   currently falls back to "DSS Cipher project visual").
2. **`/work/witf` has no importmap.** `work/sharecli.html` (the per-project
   template) has no `importmap` block, so `import('three')` in the witf view
   cannot resolve and the page silently falls back to the poster. The 3D model
   only works on pages that carry `index.html`'s importmap. Add the importmap to
   the template if the interactive model is wanted on the project page.
3. **Custom cursor only runs on `/`.** Only `index.html` has
   `import('/scripts/cursor.js').then(m => m.initCursor())`. Inner pages ship
   `cursor.css` (inside `components.css`) without the behaviour. Consistency
   issue, not a perf one.
4. **Bundle still ships every view and all data to every page.** 47 modules /
   218.4 KB. Composition: `data/` 90.5 KB (`projects.js` 34.3, `posts.js` 31.2,
   `phenotype.js` 25.0 — the last is used only by `views/home.js`), `views/`
   44 KB, `media/` ~100 KB. `views/resume.js` and `views/contact.js` do not need
   `posts.js` or `projects.js`. Lazy-loading views/data behind `import()` inside
   `render()` would cut the initial bundle materially, but it touches
   `scripts/app.js` and `scripts/views/*`, so it is left to the owner of those
   files.
5. **Keep `gmk-arch/hero.png`** (4.8 KB, 354 x 90) — referenced as gallery item 2,
   not bloat.
6. **`styles/bundled/pages.css` at 54.9 KB and `components.css` at 55.1 KB** are
   the largest remaining first-load CSS. Both are loaded via the
   `media="print" onload="this.media='all'"` deferral with a working
   `<noscript>` fallback, so they do not block first paint. No duplicated file
   assignments exist (the bundler's own dedupe check passes); I did not audit for
   dead rules inside them because that is the CSS owner's lane.

---

## 8. Verification

```
npm test               83 pass / 0 fail
npm run test:e2e        9 pass / 0 fail   (includes axe wcag2a+wcag2aa,
                                          reduced-motion, reader mode, no-JS)
npm run stage:publication  exit 0
node --check on all 5 modified JS files: ok
```

Manual browser checks: canvas leak gone; reduced-motion still renders the static
field and the poster fallback; home and `/work/dss-cipher` screenshotted and
visually unchanged.
