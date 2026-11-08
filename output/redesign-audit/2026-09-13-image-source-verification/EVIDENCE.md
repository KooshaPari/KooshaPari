# Image Source Verification - 2026-09-13

## Scope
Read-only browser-level verification of source-rendered pages for five projects:
**mcpforge**, **forgecode**, **frostify**, **at390**, **and1440**
using an isolated local preview server (`python3 -m http.server`).

## Key Findings

### card.webp status: FIXED / LEGITIMATE ONLY
- `card.webp` is referenced in exactly **1 location**: `dist/scripts/views/work.js` line 82, mapped to `omniroute` only.
- `public/projects/omniroute/card.webp` EXISTS on disk → **HTTP 200 OK** on local server.
- No broken/stale `card.webp` requests detected.

### Per-project image status

| Project | Source `work/` page? | `dist/work/` page? | Image refs (img/source/srcset) | card.webp ref? | Image file exists on disk? |
|---------|---------------------|--------------------|--------------------------------|----------------|--------------------------|
| mcpforge | NO | YES (built) | 0 (none) | NO | NO (`public/projects/mcpforge/` does not exist) |
| forgecode | NO | YES (built) | 0 (none) | NO | NO (`public/projects/forgecode/` does not exist) |
| frostify | YES | YES (built) | 0 (none) | NO | NO (`public/projects/frostify/` does not exist) |
| at390 | NO | NO | N/A | N/A | N/A (page does not exist in source or dist) |
| and1440 | NO | NO | N/A | N/A | N/A (page does not exist in source or dist) |

### CARD_IMAGES mapping (dist/scripts/views/work.js)
Only 7 projects have card image mappings:
- netweave, gmk-arch, witf, sharecli, omniroute, substrate, phenotype-omlx
- **mcpforge, forgecode, frostify are NOT in the CARD_IMAGES map**
- **at390 and and1440 do not appear anywhere in the codebase**

### Source work.html img src attributes (rendered HTML)
8 image sources in the work catalog:
1. `/public/projects/gmk-arch/hero.png` → EXISTS
2. `/public/projects/hybrid-materials/phenotype-omlx-desktop.webp` → EXISTS
3. `/public/projects/hybrid-materials/sharecli-desktop.webp` → EXISTS
4. `/public/projects/hybrid-materials/substrate-desktop.webp` → EXISTS
5. `/public/projects/netweave/desktop-01-v3.webp` → EXISTS
6. `/public/projects/omniroute/card.webp` → EXISTS
7. `/public/projects/witf/hero-01.jpg` → EXISTS
8. `/scripts/app.js` (not an image)

All referenced image files exist on disk. Zero broken image requests.

### HTTP status checks (local server, all 200 OK)
- `dist/work.html` → 200
- `public/projects/omniroute/card.webp` → 200
- `dist/work/mcpforge.html` → 200
- `dist/work/forgecode.html` → 200
- `dist/work/frostify.html` → 200

## Conclusion

**No broken card.webp requests.** The only card.webp reference is for OmniRoute and it resolves correctly.

The three archived projects (mcpforge, forgecode, frostify) have NO image references at all -- they are text-only pages (construction-gate stubs in the built dist). at390 and and1440 do not exist as pages in this repository.

## Evidence paths
- `output/redesign-audit/2026-09-13-image-source-verification/EVIDENCE.md` (this file)
- Local server: `python3 -m http.server 5739 --directory .` (was used for verification, now stopped)

## Verification method
- Local `http.server` on port 5739 serving the repo root
- `curl` HTTP status checks on all target pages
- `grep` for img/source/srcset attributes in dist HTML
- `grep` for card.webp in dist scripts/views/work.js
- Filesystem existence checks for public/projects/* image directories
