# Session 20260919 — koosha-phenotype overhaul — TODO list

## Status: nearly shippable, awaiting commit

### Recently completed (this session)

- **Axe 4.13 stacking-context mismatch (the real cause of e2e ShareCLI failures):**
  - Discovered `@axe-core/playwright@4.13.0` ships the **stacking-context blending fix** (PR #5214).
  - The e2e test runs in **dark mode** by default (Playwright chromium inherits system preference).
  - `--surface-inset` (#e2dfd8) in dark mode is a light beige, **light-on-light with dark-mode `--ink-muted`** (#b0b5a8), passing for fg dark-on-paper.
  - But axe 4.13 walks opacity-affected ancestor stacking contexts and computes fg composited into bg before evaluating contrast.
  - `--surface-inset` had no dark-mode override → `--surface-inset: var(--graphite-800)` in `tokens.css`.

- **`fadeUp` keyframe contained opacity 0→1:**
  - `styles/main.css:91 .portfolio-view { animation: fadeUp .35s ease both; }`
  - `styles/main.css:68 fadeUp { from { opacity: 0 } to { opacity: 1 } }`
  - axe 4.13 saw opacity ≈ 0.4 mid-flight, blended `.back-link` fg `#3d4239` into paper `#f3f0e8` → saw `#adada5` → 1.98:1 fails.
  - Removed `opacity` from `fadeUp` keyframe (kept transform-only fade-up).

- **Bundler collision: two `buildTimeline` functions in different modules:**
  - `scripts/views/resume.js:75 buildTimeline()` returns DOM (used by resume view).
  - `scripts/media/cast-player.js:56 buildTimeline()` returns `{time,type,data}[]` (used by cast player).
  - esbuild bundled both into ONE function (`ct` in bundle).
  - When `cast-player.js` called it, the resume.js DOM-returning version ran on `parsed.events`, returned a `<div>`, then `timeline.length` was undefined → `undefined.map` → error UI was rendered.
  - Fix: renamed `scripts/media/cast-player.js`'s `buildTimeline` → `buildCastTimeline`. Updated call site at line 288.
  - Validated: `grep buildCastTimeline` shows function definition + call site, no remaining `buildTimeline` references in cast-player.js.

### Tests now passing

```
10 tests/browser/acceptance.spec.js -- ALL PASS:
  ✓ 1 Homepage loads (526ms)
  ✓ 2 Homepage no critical a11y violations (800ms)
  ✓ 3 Colour contrast evaluated, reported violations zero (1.4s)
  ✓ 4 Clean navigation between pages (1.3s)
  ✓ 5 All navigation pages have content and links (811ms)
  ✓ 6 All project pages render (1.3s)
  ✓ 7 Blog posts render (615ms)
  ✓ 8 ShareCLI has heading and download (353ms)
  ✓ 9 ShareCLI accessibility across viewports (4.0s)
  ✓ 10 Reader Mode shortcut, persistence, reduced motion, focus (679ms)

10 passed (22.9s)
```

### Critical next steps

1. **Commit** all modified files:
   - `styles/tokens.css` (dark mode `--surface-inset`)
   - `styles/main.css` (`fadeUp` opacity removed)
   - `scripts/media/cast-player.js` (renamed `buildTimeline` → `buildCastTimeline` + call site update)
2. **Deploy** via `vercel --prod`
3. Verify live accessibility (mvp page or sharecli page) with axe-core 4.13 from a desktop browser
4. Then mark cq-4 done
