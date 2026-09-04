# Preview verification report

Date: 2026-09-01

- `node --check scripts/app.js`: PASS
- `node --check data/projects.js`: PASS
- `node --check scripts/components/evidence.js`: PASS
- Static server app/asset HTTP checks: PASS
- Home, Engineering, Product, Work, Resume, Contact routes: PASS
- Work filters and project detail hashes: PASS
- Active tab `aria-selected` synchronization: PASS
- Desktop/mobile screenshots captured under `output/technical-atelier-review/`: PASS
- Vercel static-output contract: PASS (15/15 `npm test`)
- Task 5 visual re-review blockers (WITF responsive crop, opening dead zones, heterogeneous sequence proof, stale status claim): RESOLVED
- aside → div role="note" accessibility fix for nested-complementary-landmark: APPLIED
- Console errors/warnings across home, engineering, product, work, resume, contact (HTTP): 0 / 0
- Horizontal overflow at 1440 / 768 / 375: none
- Production DNS/redirect/legacy retirement mutation: NOT PERFORMED
- Stable in-process Node static-server route sweep (Playwright + Chromium): 10/10 PASS — every route has a visible h1, zero horizontal overflow, zero console errors (routes: home, engineering, product, work, resume, contact, sharecli, gmk-arch, witf, netweave).
- axe-core sweep: 10/10 CLEAN after Work Index card heading h3 -> h2 fix (styles/main.css updated).
- HTTP screenshot pack refreshed post-fix: home-http-{1440,768,375}.png, sequence-http-1440.png under output/technical-atelier-review/.
- Vercel static output re-synced to post-fix source (styles/main.css + scripts/ verified byte-identical).

Remaining human-review items: Lighthouse/performance audit on hosted preview, final case-study copy review, canonical resume links, and deployed-preview metadata/redirect checks. Vercel redeployment requires auth token (sandbox lacks Vercel credential).

## Technical Atelier interaction acceptance

Project Index sequence: open Index, traverse the first three project links by keyboard, close with Escape, verify focus returns to the Index trigger, reopen, and navigate to `#work/sharecli`. Verify at 1440px and 390px with no clipped catalog groups.

