# QA Baseline Report — 2026-09-13 Next Batch

## Route Manifest (from app data, not raw HTML count)

Source: vercel.json rewrites + dist/ directory + prerender.js TOP_LEVEL_ROUTES + PROJECTS array.

**20 public routes:**

| # | Route | Source |
|---|-------|--------|
| 1 | `/` | vercel.json → root.html |
| 2 | `/engineering` | vercel.json → engineering.html |
| 3 | `/product` | vercel.json → product.html |
| 4 | `/work` | vercel.json → work.html |
| 5 | `/work/sharecli` | vercel.json + dist/work/ |
| 6 | `/work/gmk-arch` | vercel.json + dist/work/ |
| 7 | `/work/witf` | vercel.json + dist/work/ |
| 8 | `/work/substrate` | vercel.json + dist/work/ |
| 9 | `/work/phenotype-omlx` | vercel.json + dist/work/ |
| 10 | `/work/netweave` | vercel.json + dist/work/ |
| 11 | `/work/byteport` | vercel.json + dist/work/ |
| 12 | `/work/tracera` | vercel.json + dist/work/ |
| 13 | `/work/omniroute` | vercel.json + dist/work/ |
| 14 | `/work/dss-cipher` | vercel.json + dist/work/ |
| 15 | `/work/frostify` | vercel.json + dist/work/ |
| 16 | `/resume` | vercel.json → resume.html |
| 17 | `/contact` | vercel.json → contact.html |
| 18 | `/blog` | vercel.json → blog.html |
| 19 | `/blog/why-we-forked-omniroute` | vercel.json + dist/blog/ |
| 20 | `/archive` | vercel.json → archive.html |

4 additional dist/work/ files exist (agentapi-plusplus, cliproxyapi-plusplus, forgecode, mcpforge) but have no vercel.json rewrite and are not in the public route manifest.

## Baseline Run

| Field | Value |
|-------|-------|
| Script | `qa-baseline.mjs` |
| Generated | 2026-09-13T04:09:24Z |
| Completed | 2026-09-13T04:11:54Z |
| Git revision | `7d6b3ff` |
| Server PID | 54489 |
| Viewports | 390x844 (mobile), 1440x900 (desktop) |
| Total checks | 40 (20 routes x 2 viewports) |
| Ownership proof | New headless chromium launched by script, PID tracked, no system capture |

## Results

### HTTP Status: ALL PASS

40/40 routes returned HTTP 200. Zero network errors, zero console errors, zero JS execution errors.

### Overflow: 3 FAILURES

Horizontal scroll overflow detected at **desktop 1440x900** on:

- `/` (homepage)
- `/engineering`
- `/product`

Mobile (390x844) overflow: **none**. All 10 project detail routes pass at both viewports.

### Heading Hierarchy: SYSTEMIC

Every route at both viewports has **2 H1 elements** (40/40 checks affected). The two H1s are:

1. `"Under construction"` — from the construction shell overlay
2. The actual page heading (e.g., `"Software systems, technical products, and the infrastructure between them."`)

This is a site-wide structural issue affecting accessibility. The construction shell H1 should likely be demoted or removed when the page content H1 exists.

### Hydration: PASS

Zero JS execution errors across all routes and viewports. All routes render with JS disabled (no-JS content check passes). The SPA shell hydrates correctly.

### Keyboard / Focus: WEAK

Average ~35 focusable elements per route, but only **1 per route** has visible focus styling (outline or box-shadow). This means the vast majority of interactive elements lack visible keyboard focus indicators. Affected: all routes, both viewports.

### no-JS: PASS

All routes render meaningful content (body text > 10 chars) with JavaScript disabled. The construction shell and page content are both visible without JS.

## Remaining Gates

1. **Overflow fix** for `/`, `/engineering`, `/product` at desktop width
2. **Single H1 per page** — construction shell must not emit an H1 alongside the page's own H1
3. **Keyboard focus visibility** — visible focus on all interactive elements, not just 1 of ~35
4. **Other workers' mutations** — this baseline is non-final; timestamps and revision recorded above. Other workers are modifying sources concurrently.

## Artifacts

- `qa-baseline.mjs` — reproducible script
- `qa-baseline.json` — machine-readable results (40 route/viewport entries)
- `00_BASELINE_SUMMARY.md` — this file

