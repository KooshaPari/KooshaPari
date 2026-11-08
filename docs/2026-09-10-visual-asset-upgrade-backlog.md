# Visual and asset upgrade backlog - 2026-09-10

This is a bounded design-production backlog. It does not change the deployed
site or claim that an asset is production-ready before visual review.

## Evidence

- VERIFIED: `docs/2026-09-08-design-production-readiness.md` inventories 162
  visual files and identifies the editable NetWeave Blender source at
  `asset-sources/netweave-local-rules-v1/scene.blend` plus `build_scene.py` and
  `manifest.json`.
- VERIFIED: Blender 4.4.3, FFmpeg/ffprobe 8.1.2, cwebp 1.6.0, ImageMagick
  7.1.2-15, gifsicle 1.96, OBS 30.2.3, and Playwright are runnable locally.
- VERIFIED: current runtime visual seams are `scripts/media/diagrams.js`,
  `netweave-field.js`, `netweave-workbench.js`, `systems-plate.js`,
  `layered-image.js`, and `model-slot.js`, with static/mobile/reduced-motion
  behavior already represented.
- UNKNOWN: Photoshop/Illustrator GUI automation and licensing permissions;
  no editable PSD, AI, Figma, GLB, or GLTF source is in the bounded portfolio.
- BLOCKED: no visual redesign should be called finished without fresh desktop
  and mobile screenshots plus an accessibility/reduced-motion review.

## Priority slices

| Priority | Slice | Source/output | Acceptance |
|---|---|---|---|
| P0 | NetWeave hero art pass | `asset-sources/netweave-local-rules-v1/` -> WebP desktop/mobile states | Preserve deterministic manifest, add authored composition/lighting, verify hashes/dimensions/alt text, review at 390 and 1440 px. |
| P0 | Systems-diagram visual language | `scripts/media/diagrams.js`, `systems-plate.js` | One shared node/edge token set, legible mobile HTML fallback, no misleading telemetry implication, keyboard/readers test green. |
| P1 | OmniRoute routing plate | `scripts/media/omniroute-topology.js`, `artifact.js` | Keep conceptual labels and failure branches, add restrained motion only when motion is allowed, static fallback remains complete. |
| P1 | ShareCLI runtime/evidence split | `sharecli-workbench.js`, `sharecli-recording.js` | Make illustrative state vs real cast evidence visually unmistakable; preserve download hashes and no-telemetry claim. |
| P2 | Cross-GUI asset manifest | new validator around existing `manifest.json` pattern | Record source/tool/version/command/hash/dimensions/rights/alt/fallback for every new derivative; fail publication on missing provenance. |

## Production sequence

```text
brief + claim boundary
  -> editable source
  -> deterministic export + manifest
  -> desktop/mobile derivatives
  -> hash/dimension/codec checks
  -> browser + a11y + reduced-motion review
  -> allowlisted staging
```

Do not introduce Photoshop/Illustrator/Autodesk dependencies until a specific
asset brief requires them. The existing Blender/CLI path is the fastest
reproducible lane; GUI adapters remain an explicit opt-in gate.
