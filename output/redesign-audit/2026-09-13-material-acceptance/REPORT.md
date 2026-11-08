 # Hybrid Materials Asset Acceptance Report
 **Date:** 2026-09-13 | **Reviewer:** Jcode (independent read-only) | **Scope:** 7 renders + provenance

 ## Provenance Hash Verification

 All 7 files checked against `provenance.json` MD5, SHA-256, and size_bytes:

 | File | MD5 | SHA-256 | Size | Verdict |
 |------|-----|---------|------|---------|
 | hybrid-materials.webp (composite) | match | match | 9422 | PASS |
 | sharecli-desktop.webp | match | match | 8660 | PASS |
 | sharecli-mobile.webp | match | match | 5504 | PASS |
 | substrate-desktop.webp | match | match | 6304 | PASS |
 | substrate-mobile.webp | match | match | 3742 | PASS |
 | phenotype-omlx-desktop.webp | match | match | 10330 | PASS |
 | phenotype-omlx-mobile.webp | match | match | 6346 | PASS |

 **Provenance integrity: PASS.** All byte-level hashes and sizes match recorded values exactly.

 ## View Transform Recording

 Metadata states "Standard view transform" with note "AgX unavailable in headless." Visual inspection confirms neutral/standard color response (no AgX filmic shadow roll-off). Palette colors (graphite, porcelain, muted teal) are all distinguishable and consistent across renders. **PASS** - accurately recorded and honest about headless limitation.

 ## Per-Family Defect Evaluation

 ### ShareCLI (queue rail + capsules)

 **Prior defect: arrow cutoff.**
 Desktop: Teal arrow at left end of rail is fully visible, no clipping at frame edge. Rail extends to both margins cleanly. **PASS.**
 Mobile: Arrow fully visible, all four capsules in frame. **PASS.**

 Remaining observation: Capsules are abstract rounded rectangles with no surface detail or labeling. Acceptable as procedural geometry, not a defect.

 ### Substrate (three-layer stack)

 **Prior defect: 3-layer distinction / ports clipping.**
 Desktop: Three stacked layers visible with clear color separation - top (dark blue-grey), middle (medium grey), bottom (large off-white slab). Y-stagger creates visible gaps between all three layers. **PASS on layer distinction.**
 Desktop ports: Two small teal cylinders at bottom edge, fully visible and not clipped. **PASS.**
 Mobile: Same three-layer stack with separation. Ports visible at bottom. **PASS.**

 Remaining observation: Layers are differentiated only by color (dark/medium/light). No texture, hatching, or surface detail distinguishes them further. Acceptable but minimal.

 ### Phenotype-OMLX (compute + memory slabs)

 **Prior defect: bus not physically connected; blank bars not meaningful.**
 Desktop: Horizontal teal bus/bridge physically spans the gap between left (blue-grey) slab and right (off-white) slab. Geometric connection is unambiguous. **PASS on bus connection.**
 Desktop bars: Left slab has 4 small raised rectangular bars; right slab has 3. They are identical blank geometry - no color differentiation, no text, no sizing variation to distinguish compute from memory context. **FAIL on meaningful compute/memory context.** The bars read as decorative bumps, not informational indicators.
 Mobile: Bus bridges both slabs. Same blank-bar issue. **FAIL (same).**

 **New deficiency:** OMLX indicator bars are visually identical across both slabs. They do not encode compute vs. memory distinction or any readable semantic content. If intent is explanatory artwork, bars need at minimum color/size differentiation or spatial labeling to convey meaning.

 ### Composite (hybrid-materials.webp)

 All three projects arranged vertically (OMLX top, ShareCLI middle, Substrate bottom). Every element is within frame. Arrow visible on ShareCLI. Substrate ports visible. OMLX bus present (appears desaturated at scale). **PASS** as composite overview.

 Note: OMLX bus in composite is grey rather than teal - likely contrast shift at smaller render scale. Minor.

 ## Summary

 | Family | Arrow/Connection | Layer Distinction | Ports | Bus Meaningful | Overall |
 |--------|-----------------|-------------------|-------|---------------|---------|
 | ShareCLI | PASS | n/a | n/a | n/a | **PASS** |
 | Substrate | n/a | PASS | PASS | n/a | **PASS** |
 | OMLX | n/a | n/a | n/a | **FAIL** | **FAIL** |
 | Composite | PASS | PASS | PASS | PARTIAL | **PASS with note** |

 **Acceptance-limited evidence:** 6 of 7 individual renders accepted. OMLX (both desktop and mobile) fails on meaningful indicator semantics - bars are blank identical rectangles. Provenance and view transform are fully verified.

 **Action needed:** OMLX indicator bars require differentiation (color, size, or label geometry) to convey compute vs. memory context before acceptance.
*** End Patch
