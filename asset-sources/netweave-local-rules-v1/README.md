# Original NetWeave illustrative specimen

Built September 5, 2026 with Blender 4.4.3 CPU Cycles, 24 samples, AgX. All geometry and materials are procedural original artwork. No historical simulation output, external artwork, fonts, textures or models were consumed.

Run from portfolio root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python asset-sources/netweave-local-rules-v1/build_scene.py -- --output-dir output/netweave-local-rules-v1-fresh --save-scene asset-sources/netweave-local-rules-v1/scene-fresh.blend --state 1
```

Repeat without `--save-scene` for states 2 and 3. Existing render filenames are refused. The retained scene is the desktop state-1 setup; generator reconstructs both cameras and all states. Objects are named, but remain in Blender's default collection rather than the planned five collections.

Homebrew's Blender symlink crashed because it failed to locate bundled resources; the direct application executable worked. FFmpeg 8.1.2 lacks libwebp in this installation. Existing `cwebp -q 82 INPUT.png -o OUTPUT.webp` produced posters instead; no installation occurred. FFmpeg libx264 produced the silent six-second hard-cut sequence with `-framerate 1/2 -start_number 1 -i desktop-%02d.png -r 24 -c:v libx264 -pix_fmt yuv420p -movflags +faststart sequence.mp4`.

`node asset-sources/netweave-local-rules-v1/verify.mjs` records dimensions, byte counts and SHA-256 provenance. Sources and output candidates remain outside public directories. Independent image review and app accessibility/performance integration are pending.
