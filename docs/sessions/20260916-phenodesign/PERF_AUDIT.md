# Performance Audit — koosha-phenotype

**Date:** 2026-09-16  
**Tool:** Lighthouse (headless Chrome)  
**Server:** Vite preview (localhost:4197)

## Lighthouse Scores

| Page | Performance | Accessibility | Best Practices | SEO |
|------|------------|---------------|----------------|-----|
| `/` | 72 | 98 | 100 | 100 |
| `/work` | 96 | 100 | 100 | 100 |
| `/blog` | 96 | 100 | 100 | 100 |
| `/work/sharecli` | 96 | 98 | 100 | 100 |

**Average Performance: 90** (homepage is the outlier)

## Core Web Vitals (Homepage)

| Metric | Value | Rating |
|--------|-------|--------|
| FCP | 1.3s | Needs Improvement |
| LCP | 1.9s | Good |
| TBT | 1,680ms | Poor |
| CLS | 0 | Good |
| Speed Index | 1.4s | Good |

## Root Cause: Total Blocking Time (TBT)

The homepage scores 72 on performance due to 1,680ms TBT. All other pages score 96.

**Bottleneck:** `app.bundle.js` (203 KB) blocks main thread for ~2.8s total.

| Resource | Total | Scripting |
|----------|-------|-----------|
| `app.bundle.js` | 2,806ms | 2,181ms |
| Unattributable | 682ms | 70ms |
| `/` (HTML) | 545ms | 20ms |

Main thread breakdown: 2,275ms script evaluation, 925ms other, 638ms style/layout.

## Why Homepage Is Worse

The homepage loads 3D background, scroll-triggered animations, and the full project index. Other pages (/work, /blog) load lighter components.

## Recommendations

1. **Code-split the homepage** — dynamic import the 3D background and scroll animations only on `/`
2. **Defer non-critical JS** — move animation init to requestIdleCallback
3. **Lazy-load 3D** — only initialize Three.js when hero is in viewport
4. **Preload critical CSS** — inline above-fold styles

## What's Already Good

- CLS = 0 (no layout shifts)
- LCP 1.9s (under 2.5s threshold)
- Accessibility 98+ across all pages
- Best Practices 100, SEO 100 everywhere
- No render-blocking resources detected
- No-JS fallbacks work for all pages

## Pages: P96 A100

All non-homepage pages are excellent. The site is production-ready; homepage TBT is an optimization opportunity, not a blocker.
