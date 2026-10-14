# NetWeave illustrative specimen implementation plan

> For agentic workers: execute this bounded asset package task by task with the coordinator assigning one owner. Preserve concurrent app, prompt, and documentation edits.

**Goal:** Produce an original, poster-first dimensional explanation of local vehicle spacing, with retained Blender source and three discrete explanatory states.

**Architecture:** Offline Blender renders supply desktop/mobile posters and an optional explicit-play film. Ordinary HTML captions carry all meaning; this task produces their text contract but does not edit the app. No downloaded artwork, stock models, fonts, textures, or original NetWeave execution data are required.

**Tech stack:** Blender 4.4.3, procedural Python scene authoring, FFmpeg 8.1.2; no additional installation required.

**Status:** PLANNED. Tool availability verified September 5, 2026, 02:21 PDT. No scene or render has been produced by this preparation task.

## Selection and evidence

Read: `../port-pmp.md` V3.3-V3.8; `data/projects.js` NetWeave record and featured presentation; `scripts/media/netweave-field.js`; `docs/2026-09-04-portfolio-motion-research.md`; `../web-migration/assets/asset-manifest.json`; publication staging implementation.

The current field uses a seeded random position generator, not a faithful traffic simulation. Do not reuse those points as traffic telemetry. The project record supports discussion of graph routing and local lane rules, but explicitly excludes completed congestion-aware rerouting. The new object is an original explanatory illustration, never recovered historical output.

WITF/GMK photos retain review-pending ownership flags. This package introduces no derivative of them and clears an independent original-geometry production lane. It does not supersede V3.8's priority for WITF and ShareCLI/Substrate poster-backed artifacts; those remain separate required work.

## Ownership and exact outputs

All paths below are relative to `koosha-phenotype/`. One future asset worker owns only this package. The app integrator separately owns app/data/CSS changes.

| Path | Deliverable |
| --- | --- |
| `asset-sources/netweave-local-rules-v1/build_scene.py` | Deterministic procedural authoring, named objects, three state poses, camera presets, saved scene |
| `asset-sources/netweave-local-rules-v1/scene.blend` | Editable scene, retained outside publication |
| `asset-sources/netweave-local-rules-v1/README.md` | Actual versions, render commands, palette, source limitations |
| `asset-sources/netweave-local-rules-v1/manifest.json` | Hashes, dimensions, bytes, provenance and reviewer disposition |
| `output/netweave-local-rules-v1/desktop-01.png` through `desktop-03.png` | Lossless desktop review frames, 1600x1100 |
| `output/netweave-local-rules-v1/mobile-01.png` through `mobile-03.png` | Independently composed narrow review frames, 800x1000 |
| `output/netweave-local-rules-v1/poster.webp` | Desktop first-state delivery candidate |
| `output/netweave-local-rules-v1/poster-mobile.webp` | Mobile first-state delivery candidate |
| `output/netweave-local-rules-v1/sequence.mp4` | Optional six-second, silent, 24fps film; only after still review |
| `output/netweave-local-rules-v1/captions.md` | Caption/transcript/alt contract below |
| `output/netweave-local-rules-v1/verification.json` | Measured sizes, dimensions, render exit codes, reviewer notes |

Do not write candidates under `public/`: the current publication script copies that directory recursively. App integration may copy approved derivatives to `public/projects/netweave/` in a separate reviewed change. Source `.blend`, Python, manifests, raw PNG review captures, and logs stay outside the deployment allowlist. No GLB is required: spatial inspection has not yet demonstrated more value than the posters.

## Composition contract

Create an orthographic studio plate showing one straight road with two shallow parallel lanes, nine discrete cell tiles in each lane, and four simple rounded vehicle blocks in the upper lane. No cityscape, map outline, logo, simulated UI, numerical dashboard, traffic legend claiming measurements, or decorative unrelated objects.

Use warm paper background, charcoal cell dividers, cool muted vehicle blocks, and one amber highlighted vehicle. Soft broad shadows establish depth; shallow bevels provide tactile edge definition. Camera targets the center of the plate from an oblique angle so every occupied cell remains countable. Mobile uses a tighter, higher camera with the entire road visible; do not crop away vehicles or conditions.

Named collections: `Road`, `Cells`, `Vehicles`, `Lighting`, `Cameras`. Named objects: `RoadPlate`, `Cell_L0_00` through `Cell_L1_08`, `Vehicle_A` through `Vehicle_D`, `Camera_Desktop`, `Camera_Mobile`, `Key_Area`, `Fill_Area`. Use procedural materials only; no external file references. Use the bundled renderer on CPU initially so a GPU is not a prerequisite.

Three hand-authored states illustrate a relationship without asserting simulator fidelity. Lane 0 occupancy, from left to right, is `[0,2,4,7]`, then `[1,3,5,7]`, then `[2,4,6,7]`. Vehicle D stays at cell 7. All four identities remain stable, never overlap, and never change route or lane. This depicts approaching a stationary vehicle; do not call it an implemented NetWeave state trace or calibrated cellular-automaton algorithm. Lane 1 is empty and visually subordinate, making absence of rerouting explicit.

## Production steps

- [ ] Author the deterministic scene generator using the composition and poses above. Expose `--output-dir`, `--save-scene`, and `--state 1|2|3` arguments after Blender's `--`; validate the state range and refuse an existing output filename unless a specific overwrite flag is supplied. Save scene before rendering; record seed even though geometry is deterministic.
- [ ] Render state 1 in both camera presets. Inspect actual images at native size and at 360px CSS width. Confirm four identifiable vehicles, amber highlight, nine legible cells, comfortable negative space, and an unobscured lane end. Correct the scene rather than explaining defects in captions.
- [ ] Render states 2 and 3 with exactly the same framing, materials, exposure and lighting. Review all three together for identity continuity and no implied rerouting.
- [ ] Encode WebP delivery candidates with the commands below. Measure bytes; the 200KB poster target is a hypothesis, not a claimed result. If exceeded, adjust encoding or dimensions only after visual comparison; preserve lossless review PNGs.
- [ ] Write the provenance manifest and caption contract. Set disposition `IMPLEMENTED-UNPROVEN` until another reviewer opens the images and confirms scope/fidelity. Record the reviewing agent and timestamp when approved.
- [ ] Only after still review, create the optional film by holding each approved desktop state for two seconds with hard cuts. No interpolated vehicle motion or autoplay contract is introduced. The static sequence already conveys all information.
- [ ] Hand off exact candidate hashes and reviewer disposition to the app integrator. Do not integrate or deploy in the asset lane.

## Commands and measurable checks

Run from the portfolio root after the generator has been implemented; these commands are future acceptance commands, not results already obtained.

```sh
/opt/homebrew/bin/blender --background --factory-startup --python asset-sources/netweave-local-rules-v1/build_scene.py -- --output-dir output/netweave-local-rules-v1 --save-scene asset-sources/netweave-local-rules-v1/scene.blend --state 1
/opt/homebrew/bin/blender --background --factory-startup --python asset-sources/netweave-local-rules-v1/build_scene.py -- --output-dir output/netweave-local-rules-v1 --state 2
/opt/homebrew/bin/blender --background --factory-startup --python asset-sources/netweave-local-rules-v1/build_scene.py -- --output-dir output/netweave-local-rules-v1 --state 3
ffmpeg -n -i output/netweave-local-rules-v1/desktop-01.png -c:v libwebp -quality 82 output/netweave-local-rules-v1/poster.webp
ffmpeg -n -i output/netweave-local-rules-v1/mobile-01.png -c:v libwebp -quality 82 output/netweave-local-rules-v1/poster-mobile.webp
ffmpeg -n -framerate 1/2 -start_number 1 -i output/netweave-local-rules-v1/desktop-%02d.png -frames:v 144 -r 24 -c:v libx264 -pix_fmt yuv420p -movflags +faststart output/netweave-local-rules-v1/sequence.mp4
ffprobe -v error -show_entries stream=width,height,codec_name -show_entries format=duration,size -of json output/netweave-local-rules-v1/sequence.mp4
shasum -a 256 asset-sources/netweave-local-rules-v1/build_scene.py asset-sources/netweave-local-rules-v1/scene.blend output/netweave-local-rules-v1/poster.webp output/netweave-local-rules-v1/poster-mobile.webp
```

Require Blender exit 0, six nonempty PNGs with expected dimensions, WebP dimensions matching input, and optional MP4 approximately six seconds with no audio stream. If codec availability fails, retain PNGs and report the exact error; do not install a different pipeline silently. Re-run the generator into a new output directory and compare geometry/state metadata; image bitwise identity is not guaranteed across render hardware or tool versions.

Manifest fields: `id=netweave-local-rules-v1`, `project=netweave`, `mode=system`, source paths and dates, `rights=original procedural geometry; no third-party inputs`, original/derivative SHA-256 values, dimensions, byte counts, authoring tool/version, commands, alt decision, fallback paths, evidence boundary, reviewer, disposition. Do not invent a legal license grant or mark historical project evidence verified.

## Caption and integration contract

Visible caption: **Illustrative local-spacing study. Original explanatory artwork, not recorded NetWeave output.**

Reader text: **Four vehicles approach a stationary vehicle on one lane. Three discrete drawings show the available gaps shrinking. Vehicles keep the same route; congestion-aware rerouting was future work in the historical prototype.**

If caption and Reader text immediately accompany the image, use empty alt to avoid repetition. Otherwise: **Three-dimensional illustration of four vehicle blocks on a gridded lane, approaching a stationary lead vehicle.** No essential label is baked into the raster.

Desktop/mobile/no-JS/no-WebGL: show the matching poster with reserved aspect ratio and the full Reader text. Reduced motion: static poster and optional discrete state selection, no automatic transitions. Optional film loads only on an explicitly named Play button and has native controls; three static frames plus transcript remain available without playback. Film failure preserves poster/text; any state selector is ordinary keyboard-operable HTML. App integrator owns browser/reflow/focus tests after integration.

## Exit and remaining scope

This package is accepted only when retained source, six reviewed frames, two measured posters, manifest, captions and verification record exist and another reviewer has opened the actual images. Film is optional. Acceptance does not complete the Workbench, seven-artifact program, adaptive tier system, original NetWeave evidence collection, performance targets, or production approval.
