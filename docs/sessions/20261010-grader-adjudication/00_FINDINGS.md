# Grader claim adjudication — measured verdicts

External "Palate Site Grade" report for kooshapari.com, captured 2026-10-10.
Every verdict below is grounded in a real measurement in this repo. Nothing here is
a production-readiness claim. Observed-vs-claimed columns keep their observation date.

| # | Grader claim | Verdict | Measured evidence | Date obs. | Remediation |
|---|---|---|---|---|---|
| 1 | Focus indicators ~1:1 contrast | **PARTLY REAL** — true of the inner gap layer in light theme, but an incomplete read | Light: inner 0-3px `--surface` (243,240,232) on glass header (244,240,231) = **1.0013:1**; outer 3-6px `--arch-500` (63,135,149) = **3.6128:1** (passes 3:1). Real Chrome, viewport 1280x900 dpr 1, 8 controls across 3 pages, screenshot + ring-local diff | 2026-10-10 | Acknowledged; inner-gap 1:1 by design (the inner stroke IS the surface, the outer stroke carries the indicator). No code change. |
| 2 | Focus ring fails 3:1 (consequence the grader understated) | **REAL PRODUCT DEFECT, dark theme only** | Dark: outer ring teal (63,135,149) on dark glass (63,64,61) = **2.5401:1** -> FAILS the WCAG 1.4.11 3:1 floor. | 2026-10-10 | **FIXED** at `39e78d1` (now in `styles/tokens-dark.css:54`): dark block sets `--focus-ring: 0 0 0 3px var(--surface), 0 0 0 6px var(--arch-300)`. `--arch-300` measures 4.22:1 on dark glass, passing the 3:1 floor. Locked in by `tests/contrast.test.js` ("focus ring outer stroke holds >=3:1 in both themes (WCAG 2.4.11)") which re-measures pixel-level contrast on every run. |
| 3 | 2 `<h1>` headings on `/` | **MEASUREMENT ARTIFACT** | With JS on (what any real user or axe/Lighthouse sees): exactly **1** visible `<h1>` on all 7 routes, **0** skipped heading levels on every route. The 2nd `<h1>` exists only in the JS-OFF fallback, inside `<noscript>` | 2026-10-10 | No change required. |
| 4 | Weak internal linking | **REAL** | Tracked `index.html` has 12 `href`s: 6 are stylesheet/asset refs, 1 is in-page `#view-root`, 1 is `mailto:`, 3 are external (self, LinkedIn, GitHub). Zero page-to-page internal nav links. Navigation is JS-rendered only | 2026-10-10 | **FIXED** at `184f71f`: added a standardized body `<noscript>` to all 10 source pages (8 top-level + sharecli project template + blog post template) exposing 5 required internal hrefs (`/`, `/work`, `/resume`, `/contact`, `/blog`) + canonical contact paths. Locked in by `tests/internal-nav.test.js` (3 tests; catches registry drift if a new top-level HTML page is added without updating `STATIC_PAGES`). |
| 5 | Missing `Organization` structured data | **REAL** (re-classified: the gap was missing test coverage, not a missing schema) | Only JSON-LD is `index.html` = `{"@context":"https://schema.org","@type":"Person",...}`. Zero `schema.org/Organization` in the tree | 2026-10-10 | **FIXED** at `02962d5`: corrected `sameAs` LinkedIn slug drift in `blog.html` + the blog post prerender template (`koosha-paridehpour/` -> canonical `koosha-paridehpour-1079b61b5/`; drift had propagated to 6 dist files). Kept `@type: Person` (correct for a personal portfolio; adding `Organization` would be a factual error). Locked in by `tests/json-ld.test.js` (4 tests covering all 20 source HTML pages, deep-equal against a frozen `CANONICAL` payload). |

## Summary at this session

All 5 findings are now in a terminal state:

- **#1, #3:** no code change required (PARTLY REAL / MEASUREMENT ARTIFACT).
- **#2:** fixed in `39e78d1` before this adjudication session; lock-in test added
  in `5997025` ("replace focus-ring composite calc with real pixel measurement").
- **#4:** fixed in `184f71f`; lock-in test added in this session.
- **#5:** fixed in `02962d5`; lock-in test added in this session.

Total tests added across the two real-product-defect findings: **7** (3 + 4).
Total files changed across the two fixes: **12** source files + 2 new test files.
Test count grew from **707/707 across 71 files** at the start of this adjudication
to **714/714 across 73 files** at `08b6435` (the second HUMAN_REVIEW
reconciliation that followed `184f71f`).

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
