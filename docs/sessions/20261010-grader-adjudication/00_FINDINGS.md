# Grader claim adjudication — measured verdicts

External "Palate Site Grade" report for kooshapari.com, captured 2026-10-10.
Every verdict below is grounded in a real measurement in this repo. Nothing here is
a production-readiness claim. Observed-vs-claimed columns keep their observation date.

| # | Grader claim | Verdict | Measured evidence | Date obs. |
|---|---|---|---|---|
| 1 | Focus indicators ~1:1 contrast | **PARTLY REAL** — true of the inner gap layer in light theme, but an incomplete read | Light: inner 0-3px `--surface` (243,240,232) on glass header (244,240,231) = **1.0013:1**; outer 3-6px `--arch-500` (63,135,149) = **3.6128:1** (passes 3:1). Real Chrome, viewport 1280x900 dpr 1, 8 controls across 3 pages, screenshot + ring-local diff | 2026-10-10 |
| 2 | Focus ring fails 3:1 (consequence the grader understated) | **REAL PRODUCT DEFECT, dark theme only** | Dark: outer ring teal (63,135,149) on dark glass (63,64,61) = **2.5401:1** -> FAILS the WCAG 1.4.11 3:1 floor. `[data-theme="dark"]` (styles/tokens.css:257) overrides `--surface` to `--graphite-950` but never overrides `--focus-ring` or `--arch-500`, so the inner gap becomes near-invisible graphite paint and the outer teal lands on a lighter glass header (shell.css:9) | 2026-10-10 |
| 3 | 2 `<h1>` headings on `/` | **MEASUREMENT ARTIFACT** | With JS on (what any real user or axe/Lighthouse sees): exactly **1** visible `<h1>` on all 7 routes, **0** skipped heading levels on every route. The 2nd `<h1>` exists only in the JS-OFF fallback, inside `<noscript>` | 2026-10-10 |
| 4 | Weak internal linking | **REAL** | Tracked `index.html` has 12 `href`s: 6 are stylesheet/asset refs, 1 is in-page `#view-root`, 1 is `mailto:`, 3 are external (self, LinkedIn, GitHub). Zero page-to-page internal nav links. Navigation is JS-rendered only | 2026-10-10 |
| 5 | Missing `Organization` structured data | **REAL** | Only JSON-LD is `index.html:66` = `{"@context":"https://schema.org","@type":"Person",...}`. Zero `schema.org/Organization` in the tree | 2026-10-10 |

## Gate result at HEAD

`d363946` — `npm run test:e2e` -> **24/24 pass, 0 failures**. (First attempt aborted
before executing any test: `playwright.config.js:15` sets `reuseExistingServer: false`
and an orphaned `preview-server.js` held port 4197, so Playwright hit EADDRINUSE.
Port freed, gate re-run cleanly. Host-load contention, not a product defect.)

## Test blind spot found

`tests/browser/acceptance.spec.js` contains **zero** references to `data-theme` or
dark mode, and no test in `tests/` asserts on focus/outline. Therefore finding #2
above was invisible to the suite that reports 24/24. A passing suite is not
evidence that the focus ring passes in dark mode.

## Untouched / unproven

- `VERCEL_TOKEN` unset. Hosted build passed locally (55s) but **no hosted deploy**.
  Production readiness is **not claimed**.
- No screenshot-hosted verification, no screenshot-based 3:1 audit across all pages.
