# Horizontal Overflow Trace Report

**Date:** 2026-09-13  
**Pages audited:** `/` (Home), `/engineering`, `/product`  
**Viewports:** 1440x900 (desktop), 390x844 (mobile)  
**Server:** loopback `node server.js` on `127.0.0.1:8421`, PID evidence in session  
**Browser:** Playwright headless Chromium, fresh process per session

---

## Summary

| Page | Viewport | scrollWidth | Status |
|------|----------|-------------|--------|
| Home | 1440px | **1530** | OVERFLOW (+90px) |
| Engineering | 1440px | **1530** | OVERFLOW (+90px) |
| Product | 1440px | **1504** | OVERFLOW (+64px) |
| Home | 390px | 390 | clean |
| Engineering | 390px | 390 | clean |
| Product | 390px | 390 | clean |

---

## Root Cause

### The overflow chain (Home @ 1440px)

```
html (scrollW=1530)
 └─ body (scrollW=1530)
    └─ #app (scrollW=1530)
       └─ #view-root (scrollW=1529, clientW=1439)   ← border-left:1px
          └─ .home-view (scrollW=1486, clientW=1353, maxW=1472px)
             └─ .home-featured (scrollW=1486, clientW=1353)
                └─ .home-artifact-sequence (scrollW=1486, clientW=1353)
                   ├─ article.artifact--experiment #0 (scrollW=780, clientW=687)
                   │  └─ .experiment-sheet (scrollW=743, clientW=613)
                   │     └─ .experiment-row (scrollW=300, clientW=146) ← OVERFLOWS
                   └─ article.artifact--experiment #1 (scrollW=758, clientW=624)
                      └─ .experiment-sheet (scrollW=721, clientW=550)
                         └─ .experiment-row (scrollW=300, clientW=130) ← OVERFLOWS
```

### The exact culprit: `@container (max-width: 680px)` + `.experiment-row` grid

**File:** `styles/hybrid-shell.css`, lines 447-456

```css
/* line 447 */ /* 9b. CONTAINER QUERIES — diagram layout adapts to artifact card width, not viewport. */
/* line 448 */ .artifact { container-type: inline-size; }
/* line 449 */ @container (max-width: 680px) {
/* line 450 */   .systems-diagram,
/* line 451 */   .experiment-sheet {
/* line 452 */     grid-template-columns: repeat(4, minmax(0, 1fr));
/* line 453 */     gap: var(--space-2);
/* line 454 */   }
/* line 455 */   .systems-route { display: none; }
/* line 456 */ }
```

**Why it triggers:** `.artifact` has `container-type: inline-size` (line 448). The `.experiment-sheet` inside is a container query subject. At 1440px viewport:

| Artifact | Container width | Matches `max-width: 680px`? | Computed grid-cols |
|----------|----------------|----------------------------|--------------------|
| `artifact--phenotype-omlx` (Home #0, Product #0) | 614px | **YES** | `145px 145px 145px 145px` |
| `artifact--netweave` (Home #1, Product #1) | 613-615px | **YES** | `130px 130px 130px 130px` |

The container query forces `.experiment-sheet` into 4 columns even though it has no explicit children mapped to those columns.

### The CSS Grid overflow mechanism

**Base rule** (`styles/artifacts.css`, line 364):
```css
.experiment-row {
  display: grid;
  grid-template-columns: 2.5rem minmax(8rem, 0.8fr) minmax(0, 1.5fr);
  /* This 3-column grid has intrinsic content width ~300px */
}
```

**Computed columns** (from Playwright inspection):
```
grid-template-columns: 40px 128px 0px
```

Column 2 has `minmax(8rem, 0.8fr)` → minimum 128px (8rem).  
Column 3 has `minmax(0, 1.5fr)` → minimum 0px, gets remainder.

The parent `.experiment-sheet` (4-column grid) allocates ~146px per column. The `.experiment-row` as a grid item defaults to `min-width: auto` (the intrinsic content width of ~300px). CSS Grid **does not clip** overflowing grid items — the item expands beyond its column track.

**No ancestor has `overflow: hidden`** — the overflow propagates through:
`.experiment-row` → `.experiment-sheet` → `.artifact` → `.home-artifact-sequence` → `.home-view` → `#view-root` → `#app` → `body` → `html` (scrollWidth)

### Per-page measurements

**Home (`/`) @ 1440px:**
- `.experiment-row` #0: column widths `40px 128px 0px`, row clientWidth=146px, content scrollWidth=300px
- `.experiment-row` #1: same pattern, content scrollWidth=306px
- `.experiment-row` #2: content scrollWidth=297px
- `.experiment-row` #3: content scrollWidth=275px
- Overflow propagates to document: scrollWidth=1530 (+90px over 1440)

**Product (`/product`) @ 1440px:**
- Artifact #0 (phenotype-omlx): container=614px → 4-col grid, rows ~130px wide, content ~270-306px
- Artifact #1 (netweave): container=615px → 4-col grid, rows ~146px wide, content ~270-301px
- Overflow propagates: scrollWidth=1504 (+64px over 1440)

**Mobile (all pages) @ 390px:**
- No overflow. The `@media (max-width: 560px)` rule at `hybrid-shell.css:392` overrides: `.experiment-row { grid-template-columns: 2rem 1fr; }` — a 2-column layout that fits.

---

## Proposed Fix

**File to edit:** `styles/hybrid-shell.css` (owned by `shell_closeout`, not this agent)  
**Location:** Inside the `@container (max-width: 680px)` block, lines 449-456  
**Change:** Add `min-width: 0; overflow: hidden;` to `.experiment-row`

```css
/* styles/hybrid-shell.css, line 449 */
@container (max-width: 680px) {
  .systems-diagram,
  .experiment-sheet {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-2);
  }
  .systems-route { display: none; }
  /* ADD: prevent experiment-row 3-column grid from overflowing the 4-col parent */
  .experiment-row { min-width: 0; overflow: hidden; }
}
```

### Why this is the smallest safe fix

1. **Targets only the broken context.** The `@container (max-width: 680px)` query only applies when the `.artifact` container is ≤680px — which is exactly when the 4-column layout squeezes `.experiment-row`. At 1440px viewport, the artifacts are 614-689px, triggering this query.

2. **`min-width: 0`** overrides the CSS Grid default `min-width: auto`, allowing the grid item to shrink below its content width. This is the canonical fix for CSS Grid overflow.

3. **`overflow: hidden`** clips any residual text that still exceeds the column track width (the 3rd column gets 0px minimum, so long text in `<p>` tags would still overflow without clipping).

4. **No effect at other viewports.** At 390px, the `@media (max-width: 560px)` rule already overrides `.experiment-row` to a 2-column layout. At 761-1080px, the `@media (min-width: 761px) and (max-width: 1080px)` block doesn't touch `.experiment-row`, but the container query only fires when the artifact card itself is ≤680px, which doesn't happen at those viewport widths.

5. **`overflow: hidden` on the row is safe** because `.experiment-row` content is purely decorative/informational labels — no interactive elements, no scrollable content, no elements positioned outside the row boundary.

6. **Alternative (wider) fix considered and rejected:**
   - Adding `overflow: hidden` to `#view-root` — too broad, would clip all content globally.
   - Changing `.experiment-sheet` grid columns — would break the 4-column data layout.
   - Changing `.experiment-row` base grid columns — would affect the full-width layout at wider viewports.

---

## Verification

The fix was tested by injecting the CSS via `page.addStyleTag()` in a fresh headless Chromium process:

| Page | Viewport | Before fix | After fix |
|------|----------|------------|-----------|
| Home | 1440px | scrollWidth=1530 | scrollWidth=**1440** |
| Engineering | 1440px | scrollWidth=1530 | scrollWidth=**1440** |
| Product | 1440px | scrollWidth=1504 | scrollWidth=**1440** |
| Home | 390px | scrollWidth=390 | scrollWidth=390 (no regression) |

`experiment-row` rendered layout at 1440px with fix:
- gridCols: `40px 128px 0px` (unchanged)
- overflow: `hidden` (new, clips the 3rd column text overflow)
- row width: 146px (unchanged — constrained by parent column track)

`experiment-row` at 390px with fix:
- Uses `@media (max-width: 560px)` override: `grid-template-columns: 2rem 1fr` (32px 247px)
- Container query fix has no effect (different media query wins)

---

## Line Reference Summary

| File | Line(s) | What |
|------|---------|------|
| `styles/hybrid-shell.css` | 448 | `.artifact { container-type: inline-size; }` — makes artifacts container query subjects |
| `styles/hybrid-shell.css` | 449-456 | `@container (max-width: 680px)` — forces `.experiment-sheet` to 4-col grid |
| `styles/hybrid-shell.css` | **455 (insert after)** | **Proposed fix: `.experiment-row { min-width: 0; overflow: hidden; }`** |
| `styles/artifacts.css` | 360-368 | `.experiment-sheet { display: grid; }` and `.experiment-row { grid-template-columns: 2.5rem minmax(8rem, 0.8fr) minmax(0, 1.5fr); }` |
| `styles/hybrid-shell.css` | 392-393 | Mobile override: `.experiment-row { grid-template-columns: 2rem 1fr; }` |
| `styles/artifacts.css` | 2-8 | `.home-view { max-width: 92rem; margin-inline: auto; }` |
| `styles/base.css` | 134-137 | `#view-root { border-left: var(--structure-line); padding-left: var(--gutter); }` |
| `styles/base.css` | 227-230 | `#view-root { min-height: 70vh; padding: var(--space-6) var(--gutter) var(--space-7); }` |

---

## Audit Scope

- **DOM inspection:** Full `scrollWidth`/`clientWidth` walk of every element in the overflow chain
- **Computed CSS:** grid-template-columns, overflow, position, min-width, width for all elements in chain
- **Bounding rects:** exact right/left/width for `.experiment-row`, `.experiment-sheet`, `.artifact`, `.home-artifact-sequence`, `#view-root`
- **Construction gate:** dismissed via `display:none` injection before measurement
- **Decorative offscreen:** `#announcements` (absolute, left=-1, width=1px) — verified NOT contributing to overflow (position:absolute removes from flow)
- **390px mobile:** verified no overflow, verified fix causes no regression
- **Fix tested:** CSS injection via `page.addStyleTag()`, confirmed scrollWidth drops to viewport width on all 3 pages

**PID evidence:** `node server.js` started on port 8421, Playwright launched separate headless Chromium process. No existing browser/process used.
