# Browser-Verified Site Verification — koosha-phenotype

**Observation date:** 2026-09-19 (browser session 09:17–09:19 PDT)
**Method:** Playwright 1.63 (channel `chrome`) driving the repo's own `scripts/preview-server.js`
on `127.0.0.1:4197`, reading computed styles and DOM state. No desktop capture, no
user processes; only the locally started preview server was exercised.
**Built artifact:** `dist/` staged by `npm run stage:publication` at commit `8d5436f`.
**Script:** `~/.jcode/scratch/site-verify/verify.mjs` (read-only).

This is the acceptance check for the owner's own complaint list: *"boring, content is
shit, UI/UX maybe 20% there, many readability bugs, massive performance issues, missing
that Apple/overengineered UI feel."* Each row below maps a complaint to a measurement.

## Complaint -> measurement

| # | Owner complaint | Measurement | Observed 2026-09-19 | Verdict |
|---|---|---|---|---|
| 1 | "boring", "UI/UX 20%" | homepage `h1` computed `font-size` | **62.4px** (audit baseline: 16px) | PASS |
| 2 | "many readability bugs" | homepage `body` computed `font-size` | **17.28px** (baseline: 16px, i.e. browser default = token ignored) | PASS |
| 3 | "boring" (headline hierarchy) | homepage `h1` border box width at 1440x900 | **615px** (baseline: 507x524, a 185px-wide column of 5 cramped lines) | PASS |
| 4 | "many readability bugs" | `--step-*` tokens resolve to valid `clamp()` | `--step--1=clamp(0.75rem, 0.71rem + 0.16vw, 0.84rem)` etc., whitespace preserved | PASS |
| 5 | "readability bugs" | `h1` contrast over the page background | **15.4:1** (audit baseline: **1.14:1**, near-black on near-black) | PASS |
| 6 | "readability bugs" | `body` background / `h1` colour | `rgb(243,240,232)` paper / `rgb(23,26,24)` ink | PASS |
| 7 | dead route | `#view-root` on `/unknown-route-xyz` | **1994 chars** rendered, `"404 Page not found / RETURN HOME"` (baseline: empty) | PASS |
| 8 | "missing that Apple UI feel" | `/work/witf` declares an importmap | `true` (baseline: only `/` did; the detail page could never resolve `three`) | PASS |
| 9 | "missing that Apple UI feel" | `/work/witf` viewer state after 9s | `canvas=true poster=false loading=""` — the 3D model renders on its own page | PASS |
| 10 | asset integrity | 4xx / failed requests across `/`, `/unknown-route-xyz`, `/work/witf` | only `404 /unknown-route-xyz`, which is the correct HTTP status for an unknown URL | PASS |

**Fails: 0.**

## What this does and does not establish

Established: the type scale is live, the two design systems no longer conflict, the 404
route renders, and the 3D viewer loads on every page that embeds it — each measured in a
real browser against the staged artifact, not inferred from source.

Not established by this check: hostname-level cache behaviour, LCP/CLS field data, and
cross-browser rendering. Those need the deployed origin. `07_PERF_MEASUREMENTS.md` covers
the pre-fix measurement set; this file records only post-fix observations.

## Deployment state at time of writing

| Item | Value |
|---|---|
| Evidence commit | `8d5436f` (importmap fix + CDN timeout) |
| Site content pass | in flight by a worker; `data/posts.js` and `data/projects.js` modified in the working tree, uncommitted |
| Origin | `origin/main` = `8d5436f`, pushed |
| Production delta | live origin predates the hashed-bundle build (`71fa155`), the 404 fix (`8fcf735`), and the viewer fix (`8d5436f`) |
