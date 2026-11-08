# Asset Quality Review: Hybrid-Materials, Physical Product Heroes, NetWeave

Date: 2026-09-12
Reviewer: Jcode (independent read-only QA)
Scope: `public/projects/hybrid-materials/*`, `public/projects/gmk-arch/hero.png`, `public/projects/sharecli/card.webp`, `public/projects/substrate/card.webp`, `public/projects/phenotype-omlx/card.webp`, `public/projects/netweave/*`, `public/projects/witf/*` (inventory only)

**Note**: This audit is an independent visual QA pass. It is not a redesign completion. Other workers may be active on overlapping concerns.

---

## 1. ShareCLI Renders (hybrid-materials)

### Asset Inventory

| File | Dimensions | Format | Size |
|---|---|---|---|
| `sharecli-desktop.webp` | 1200x800 | VP8 WebP | 10.3 KB |
| `sharecli-mobile.webp` | 800x700 | VP8 WebP | 6.4 KB |

### Visual Findings

**Capsule count**: PASS. Four capsules are present on the queue rail, matching the provenance claim ("Four capsules on a queue rail"). Positions are evenly spaced with the expected `CAP_SPACING = 0.80` in `build_project.py`.

**Highlight on rail**: PASS. The third capsule (index 2) is rendered in muted teal with a small status dot (teal-light cylinder) on its top-right, distinguishing it from the three porcelain (off-white) capsules. The directional chevron arrow is visible at the left end of the rail in teal.

**Capsule-to-rail visual clarity**: MINOR ISSUE. The capsules sit very close to the rail surface (only 0.01 units above). At this orthographic camera angle the bottom edge of each capsule nearly merges with the rail's top surface, making the rail-to-capsule boundary low-contrast (both light-colored). At small rendered sizes or on mobile cards, the rail reads more as a horizontal band than a distinct "queue rail."

**Arrow/chevron readability**: MINOR ISSUE. The queue-direction chevron at the left end of the rail uses the same muted teal as the highlighted capsule. It is small and partially overlaps the rail. On `sharecli-mobile.webp` (800x700) the chevron is barely distinguishable from the rail edge. A viewer unfamiliar with the "queue" concept may not interpret it as a directional indicator.

**Procedural label for "omlx bus connection"**: NOT APPLICABLE to ShareCLI. The bus trace geometry belongs to phenotype-omlx. See Section 3.

### Proposed Fixes (ShareCLI)

1. Raise capsules slightly above the rail (increase the 0.01 gap to ~0.03) or darken the rail material to create more contrast between capsule bottoms and rail surface.
2. Consider making the chevron slightly larger or using a brighter teal variant to improve mobile readability.

---

## 2. Substrate Renders (hybrid-materials)

### Asset Inventory

| File | Dimensions | Format | Size |
|---|---|---|---|
| `substrate-desktop.webp` | 1200x800 | VP8 WebP | 8.4 KB |
| `substrate-mobile.webp` | 800x700 | VP8 WebP | 5.0 KB |

### Visual Findings

**Three-layer claim**: ISSUE. The provenance description states "Three-layer policy stack with interface ports." The build script creates 3 stacked layers (`NUM_LAYERS = 3`) with colors: `graphite_dark` (bottom), `graphite_mid` (middle), `porcelain` (top). However, in the rendered output the three layers are extremely difficult to distinguish:

- The top layer is the dominant porcelain (off-white) surface occupying the vast majority of the visible area.
- The middle and bottom layers are only barely visible as thin horizontal slivers at the very bottom edge of the stack.
- The gap between layers (0.04 units) is very narrow relative to the layer height (0.12 units), and at this camera angle the gaps render as thin dark lines that are nearly invisible against the dark background.

**Result**: The object reads as "one white slab" rather than "three distinct stacked layers." The layered architecture is not conveyed visually.

**Interface ports readability**: PARTIAL. Two cylindrical port assemblies are visible at the bottom edge, rendered in teal. Each assembly appears as a stack of 3 small discs. They are the most visually distinct feature but are positioned at the very edge of the visible area, nearly falling off the bottom of the frame.

**Bottom label**: MINOR ISSUE. The `SubPolicyLabel` object (a small teal rectangle at `SUB_Z_BASE - 0.04`) is placed below the bottom layer. In the render it appears as a very thin horizontal bar near the bottom. At the 1200x800 resolution it is barely visible; at 800x700 mobile it merges with the port cylinders.

### Proposed Fixes (Substrate)

1. **Layer differentiation**: Increase the inter-layer gap (e.g., from 0.04 to 0.08-0.10) or introduce a slight tilt/perspective offset so the three layers are visually separable. Alternatively, darken the background further or add a subtle edge highlight between layers.
2. **Port placement**: Move the port cylinders slightly upward or extend the camera frame to give them more breathing room. Currently they are crowded at the bottom edge.
3. **Label visibility**: Either make the bottom label taller/wider or integrate it as a text-like element on the front face of the bottom layer rather than floating below.

---

## 3. phenotype-omlx Renders (hybrid-materials)

### Asset Inventory

| File | Dimensions | Format | Size |
|---|---|---|---|
| `phenotype-omlx-desktop.webp` | 1200x800 | VP8 WebP | 7.3 KB |
| `phenotype-omlx-mobile.webp` | 800x700 | VP8 WebP | 4.6 KB |

### Visual Findings

**Compute and memory slab distinction**: PASS. Two large slabs are clearly visible: a darker graphite slab (left, "compute") and a lighter porcelain slab (right, "memory"). The color contrast between them is effective and the objects are well-separated by a visible gap.

**Indicator bars**: PASS. On the compute slab, 4 small teal bars are visible along the top edge. On the memory slab, 3 bars are visible. Both sets are legible at desktop resolution. On mobile, the bars reduce to small colored notches but remain distinguishable.

**Bus connection between slabs**: ISSUE. The provenance mentions "MLX inference research stack with Rust performance cores, multi-backend routing, and evaluation tooling." The build script creates a `PhxBusTrace` object (a thin metal bar spanning the gap between the two slabs at `SLAB_GAP + 0.10` width). In the render this appears as a very thin gray horizontal bar centered between the two slabs, at the same height as the indicator bars.

The bus trace is:
- Very thin (0.006 height) compared to the slabs (0.18 height), making it approximately 1/30th the visible height of the slabs.
- Rendered in `rail_metal` color which is close to the dark background tone.
- At mobile resolution (800x700), it is nearly invisible -- a barely perceptible gray line between two large slabs.

**Label context gap**: Neither slab has a text label or annotation in the render. Without external context, a viewer cannot determine that the left is "compute" and the right is "memory." The color coding (dark=compute, light=memory) is consistent with the palette but not self-explanatory.

### Proposed Fixes (phenotype-omlx)

1. **Bus trace prominence**: Increase the bus trace height (from 0.006 to at least 0.02-0.03) and/or use a more contrasting material (e.g., teal_muted instead of rail_metal). The current 1:30 height ratio makes it read as a rendering artifact rather than an intentional architectural element.
2. **Consider adding minimal labels**: Small embossed or raised text-like elements (even just colored squares or dots with distinct colors) on each slab face to indicate "compute" vs. "memory" at a glance.

---

## 4. Composite Render (hybrid-materials.webp)

### Asset Inventory

| File | Dimensions | Format | Size |
|---|---|---|---|
| `hybrid-materials.webp` | 1200x800 | VP8 WebP | 4.3 KB |

### Visual Findings

The composite render shows all three objects on a single studio plate in orthographic view:
- **Top-left**: phenotype-omlx compute slab (darker) with 4 indicator bars
- **Top-right**: phenotype-omlx memory slab (lighter) with 3 indicator bars
- **Center**: ShareCLI queue rail with 4 capsules (3 white, 1 teal)
- **Bottom-center**: Substrate layered slab with port cylinders

**Composition balance**: MINOR ISSUE. The composite is functional but the objects have different visual weights. The Substrate slab (bottom) appears largest by area, the OMLX slabs are medium, and the ShareCLI rail is the smallest. Since ShareCLI is positioned centrally, the eye naturally gravitates there, but the rail's horizontal form reads as weaker than the large rectangular slabs surrounding it.

**Background**: The dark graphite background is consistent across all renders and matches the site's dark theme. No issues.

**File size**: At 4.3 KB for 1200x800, the WebP compression is aggressive. At 32 Cycles samples with denoising, the render quality is adequate for illustrative artwork but shows some softness in fine edges (e.g., the chevron arms, port cylinder edges).

---

## 5. GMK Arch Hero (gmk-arch/hero.png)

### Asset Inventory

| File | Dimensions | Format | Size |
|---|---|---|---|
| `hero.png` | 354x90 | PNG RGBA | 4.7 KB |

### Visual Findings

**Content**: The image is a transparent-background wordmark containing:
- A teal Arch Linux triangle/mountain logo
- Large "ARCH" letterform in light gray (very low contrast against a dark page background)
- "GMK" label in teal overlapping the "C" area

**This is not a product photo.** It is a typographic logo/wordmark for the GMK Arch keyset brand.

**Dimensions issue**: At 354x90 pixels, this is an extremely wide-aspect-ratio image (roughly 4:1). When rendered as a hero image on the GMK Arch project page (confirmed via Playwright screenshot `gmk-arch.png`), the wordmark spans the page width and the transparent background blends into the dark page, producing a large dark rectangle with very faint gray text.

**Legibility**: The "ARCH" letterform uses a pale gray fill against the transparent (rendered as dark) background. The contrast ratio is very low. On the Playwright screenshot the wordmark is barely readable at the top of the page. A visitor would need to squint or zoom to read the text.

**Missing product imagery**: For a `physical-plate` category project described as "An Arch Linux-inspired mechanical keyboard keyset carried from concept through manufacturing, distribution, and community launch," a wordmark alone does not convey the physical product. The WITF project (also `physical-plate`) has two high-resolution 1600x900 product photos showing the actual keyboard from above and in detail. GMK Arch has nothing comparable.

**Provenance/status**: The `data/projects.js` entry lists `ownership: 'review-pending'` and `licensing: 'review-pending'` for this asset. The `retainedSource` SHA-256 matches the deployed file, confirming no modification since retention.

### Proposed Fixes (GMK Arch)

1. **Add a product photo**: GMK Arch should have at least one hero image showing the actual keycap set (a render of the full kit, a close-up of keycap profile, or a group-buy photo). The wordmark alone is insufficient for a `physical-plate` hero.
2. **If no product photo is available/allowed**: At minimum, increase the wordmark resolution (the original is only 354x90) or render a higher-fidelity version. The current dimensions are too small for a hero image.
3. **Wordmark contrast**: If retaining the wordmark, consider rendering it on a non-transparent background or with brighter fill text to improve legibility on the dark site theme.

---

## 6. Card Thumbnails (card.webp files)

### Asset Inventory

| File | Dimensions | Format | Size |
|---|---|---|---|
| `sharecli/card.webp` | 1600x900 | VP8 WebP | 3.4 KB |
| `substrate/card.webp` | 1600x900 | VP8 WebP | 3.4 KB |
| `phenotype-omlx/card.webp` | 1600x900 | VP8 WebP | 3.1 KB |

### Visual Findings

**All three card thumbnails are extremely dark and minimal.** Each is a 1600x900 image that appears as:
- A dark background filling most of the frame
- A thin horizontal band of slightly lighter color across the center

Visual inspection and pixel sampling:
- `sharecli/card.webp`: Near-black background with a subtle brownish/dark-orange horizontal band at center. No recognizable ShareCLI geometry (no capsules, no rail).
- `substrate/card.webp`: Near-black background with a subtle teal-gray horizontal band at center. No recognizable Substrate geometry (no layers, no ports).
- `phenotype-omlx/card.webp`: Near-black background with a subtle purple-gray horizontal band at center. No recognizable OMLX geometry (no slabs, no indicator bars).

**File sizes** are suspiciously small (3.1-3.4 KB for 1600x900) suggesting extremely low-detail or heavily compressed content. For comparison, the hybrid-materials individual renders (1200x800) are 4-10 KB with visible geometry.

**The card thumbnails do not represent their respective projects.** They are abstract horizontal bands that could be any project. On the Work page grid (visible in Playwright `work.png`), these cards are the first thing a visitor sees -- they function as the visual entry point for each project.

**On-page rendering**: In the Playwright `work.png` screenshot, the ShareCLI card (leftmost in the grid) shows as a dark rectangle with barely perceptible lighter elements. The visual signal is essentially zero.

### Proposed Fixes (Card Thumbnails)

1. **Regenerate from the hybrid-materials renders**: Use the per-project desktop renders (`sharecli-desktop.webp`, `substrate-desktop.webp`, `phenotype-omlx-desktop.webp`) cropped or scaled to 1600x900 as the card thumbnails. These have visible geometry.
2. **If preserving the dark abstract aesthetic**: Increase the brightness/contrast of the horizontal band elements so they read as intentional design rather than compression artifacts. The current state is below the threshold of visual communication.
3. **Verify compression pipeline**: The 3 KB file size for 1600x900 suggests either the source content is nearly uniform color, or the WebP encoding is stripping too much detail. Check whether these were encoded with appropriate quality settings.

---

## 7. NetWeave Renders

### Asset Inventory

| File | Dimensions | Format | Size |
|---|---|---|---|
| `desktop-01-v3.webp` | 1600x1100 | VP8 WebP | 24.8 KB |
| `desktop-02-v3.webp` | 1600x1100 | VP8 WebP | 24.9 KB |
| `desktop-03-v3.webp` | 1600x1100 | VP8 WebP | 24.9 KB |
| `mobile-01-v3.webp` | 800x1000 | VP8 WebP | 7.6 KB |
| `mobile-02-v3.webp` | 800x1000 | VP8 WebP | 7.7 KB |
| `mobile-03-v3.webp` | 800x1000 | VP8 WebP | 7.5 KB |
| `desktop-01.webp` (v1) | 1600x1100 | VP8 WebP | 19.8 KB |
| `desktop-02.webp` (v1) | 1600x1100 | VP8 WebP | 19.8 KB |
| `desktop-03.webp` (v1) | 1600x1100 | VP8 WebP | 19.8 KB |
| `mobile-01.webp` (v1) | 800x1000 | VP8 WebP | 12.2 KB |
| `mobile-02.webp` (v1) | 800x1000 | VP8 WebP | 12.2 KB |
| `mobile-03.webp` (v1) | 800x1000 | VP8 WebP | 12.2 KB |

### v3 vs v1 Comparison

The v3 renders are a significant visual improvement over v1:
- **v1** renders use a keyboard-like raised tile frame on a beige background. Vehicles appear as small colored blocks on individual keycap-like tiles. The metaphor is "keyboard keycap grid" which does not clearly communicate traffic simulation.
- **v3** renders use a flat road slab on a neutral gray background. Vehicles are elongated low-profile car-like objects with wheels, windshields, and directional chevrons. The road has lane markings. The metaphor is clearly "vehicles on a road."

### v3 Visual Findings

**Vehicle distinction**: PASS. Four vehicles are rendered with distinct colors: teal (two vehicles), orange (one vehicle), and gray (one vehicle). The color coding is consistent across all 6 v3 images (3 states x 2 sizes). Different vehicle types are implied by the color variation.

**Directional chevrons**: PASS. Small V-shaped chevrons are visible near the vehicles indicating direction of travel. They are small but recognizable at desktop resolution.

**Road markings**: PASS. White lane markings, stop lines, and grid reference dots are visible on the road surface, providing traffic infrastructure context.

**State 3 object intersection**: MINOR ISSUE. In `desktop-03-v3.webp` and `mobile-03-v3.webp`, the orange vehicle and gray vehicle overlap/collide. The orange vehicle's rear appears to merge into the gray vehicle's front. This may be intentional (representing congestion/gridlock per the project description) but reads as a geometric clipping error at first glance. The v3 manifest notes this is an "illustrative local-spacing study, not recorded NetWeave output."

**Mobile rendering**: PASS. The mobile versions (800x1000) correctly maintain the 4-vehicle composition and road markings. The camera has been widened per the manifest notes to "retain the complete road and all four vehicles." Vehicles are smaller but still distinguishable.

**Palette consistency with hybrid-materials**: NetWeave v3 uses a different palette (teal, orange, gray vehicles on gray road with neutral background) versus the hybrid-materials palette (graphite, porcelain, muted teal). This is appropriate since they represent different projects, but it means the NetWeave gallery cards will have a different visual tone from the hybrid-materials set.

### Provenance Status

The manifest (`manifest-v3.json`) records: `"review": "Blind draft; visual review pending"` and `"disposition": "LOCAL-VERIFIED; NOT YET PROMOTED"`. No `.blend` source file is in the worktree (private/custody), so re-rendering from this worktree is not possible.

---

## 8. Physical Product Source Asset Inventory

### Available Local Approved Assets

| Asset | Location | Dimensions | Format | Notes |
|---|---|---|---|---|
| WITF hero-01.png | `public/projects/witf/` | 3840x2160 | PNG RGB | High-res retained source |
| WITF hero-02.png | `public/projects/witf/` | 3840x2160 | PNG RGB | High-res retained source |
| WITF hero-01.jpg | `public/projects/witf/` | 1600x900 | JPEG | Optimized derivative |
| WITF hero-02.jpg | `public/projects/witf/` | 1600x900 | JPEG | Optimized derivative |
| GMK Arch hero.png | `public/projects/gmk-arch/` | 354x90 | PNG RGBA | Wordmark only, not product photo |
| DSS Cipher hero.gif | `public/projects/dss-cipher/` | (not inspected) | GIF | Legacy format |

### Assets NOT Available Locally

- **GMK Arch product photographs**: No photos of the actual keycap set exist in the repository. The retained source record in `data/projects.js` references the same SHA-256 as the deployed wordmark, confirming only the wordmark is retained.
- **Blender source files for hybrid-materials**: `.blend` files exist in `asset-sources/hybrid-materials/render-{sharecli,substrate,phenotype-omlx}/` and can be used to re-render. The composite `build_scene.py` source is also available.
- **NetWeave Blender source**: NOT in worktree. Only `build_scene_v3.py` and `manifest-v3.json` are present. Re-rendering requires the private `.blend` file.

### Potential Source Assets for GMK Arch Product Gallery

No additional physical product photos for GMK Arch are available in the local repository. Options for acquiring a better hero image:
1. **Retained source with custody record**: The `data/projects.js` entry confirms a retained source exists privately but its content is byte-identical to the deployed 354x90 wordmark. This is not a product photo.
2. **External sources referenced in project data**: The project links to `https://<REDACTED>.myportfolio.com/` and the Geekhack group-buy thread. These may contain product images but are external and licensing/ownership status is `review-pending`.
3. **WITF as a precedent**: The WITF project demonstrates the pattern for physical product photography -- two 3840x2160 retained source PNGs, optimized to 1600x900 JPEG derivatives, with full SHA-256 provenance tracking. This is the template that GMK Arch should follow if product photos are sourced.

---

## 9. Summary of Concrete Issues

### Critical (blocks clear communication)

| # | Asset | Issue | Impact |
|---|---|---|---|
| 1 | `gmk-arch/hero.png` | Wordmark only (354x90), not a product photo; "ARCH" text very low contrast on dark background | GMK Arch, a physical-plate project with ~$432K revenue and ~4,900 sold line items, has no visible product hero |
| 2 | ShareCLI, Substrate, OMLX `card.webp` | All three card thumbnails are near-black with barely perceptible horizontal bands; no recognizable geometry | First visual impression on Work/Product grids communicates nothing about any project |

### Moderate (reduces clarity)

| # | Asset | Issue | Impact |
|---|---|---|---|
| 3 | `substrate-desktop.webp` | Three-layer stack reads as one white slab; layer gaps nearly invisible | "Three-layer policy stack" claim not visually supported |
| 4 | `phenotype-omlx-desktop.webp` | Bus trace between slabs is 1/30th slab height, same color as background; nearly invisible | "Bus connection" architectural element not conveyed |
| 5 | `netweave/desktop-03-v3.webp` | Orange and gray vehicles intersect in state 3 | Reads as geometry clipping rather than intentional congestion illustration |

### Minor (polish opportunities)

| # | Asset | Issue | Impact |
|---|---|---|---|
| 6 | `sharecli-desktop.webp` | Capsule-to-rail contrast very low; chevron small | Rail concept could be clearer |
| 7 | `substrate-desktop.webp` | Port cylinders and label crowded at bottom edge | Interface port feature barely within frame |
| 8 | `hybrid-materials.webp` | Composite has uneven visual weight across three objects | Acceptable for illustration but not gallery-hero grade |

---

## 10. Scope Limitations

- This review covers **visual quality and label-to-content alignment only**. It does not assess performance, accessibility (alt text), or deployment readiness.
- No source edits, asset modifications, network requests, or commits were made.
- The Playwright screenshots of individual project pages (sharecli, substrate, phenotype-omlx) were blocked by the "Under Construction" splash page and could not be inspected in page context.
- Five deleted repository name holds (sharecli, substrate, phenotype-omlx, netweave, hybrid-materials) were respected; no references to deleted repos were introduced.
