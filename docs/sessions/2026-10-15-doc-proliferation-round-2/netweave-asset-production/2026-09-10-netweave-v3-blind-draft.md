# NetWeave v3 blind draft - 2026-09-10

## Intent

This additive iteration uses the two latest design-packet downloads as one
combined baseline: Material Lab v0.6 and Design System Iteration exported
2026-09-10. It also follows the existing NetWeave asset plan and independent
visual review. The goal is to move from a keycap-like grid toward a precision
traffic instrument while preserving the authored explanatory boundary.

## Changes

- Road slab replaces the raised dark frame and white tile pockets.
- Nine positions remain countable through subtle ticks and lane marks.
- Vehicles become elongated low-profile objects with wheels, windshield hints,
  body panels, and directional chevrons.
- Desktop and portrait cameras were rendered separately; portrait scale was
  widened after review showed the first blind framing clipped the left vehicle.
- v1/v2 outputs remain intact. v3 derivatives use additive `*-v3.webp` names.

## Local evidence

- Blender 4.4.3 direct binary rendered states 1-3 with exit 0.
- PNG outputs: desktop 1600x1100 and mobile 800x1000 for each state.
- cwebp produced six v3 WebP derivatives; all are present under
  `public/projects/netweave/` and staged into `dist` by the publication build.
- Focused NetWeave tests: 14/14 pass.
- Full unit gate: 74/74 pass; browser gate: 9/9 pass; build/check pass.
- Fresh integrated desktop screenshot reviewed at `/tmp/netweave-v3-dismissed.png`.

## Visual disposition

The v3 desktop result reads as an overhead road/traffic study rather than a
keyboard. The v3 portrait result retains all four vehicles and the road, but
still has deliberate neutral margin because the source delivery ratio is
800x1000. It is a blind draft, not a final art direction or production
acceptance. A second reviewer should inspect the six v3 images before any
production deployment.

## Truth boundary

The image remains original procedural explanatory artwork. It is not recorded
NetWeave output, calibrated telemetry, or proof that congestion-aware
rerouting shipped. The state sequence is hand-authored and vehicles retain one
route and lane.
