# NetWeave local-spacing asset: independent visual acceptance

Reviewed 2026-09-05, 03:48 PDT by `asset_visual_acceptance`.

Disposition: **conditional acceptance as original illustrative still artwork**.
This does not accept a completed NetWeave flagship, browser integration, or a
demonstration of the historical simulation's algorithm.

## Evidence inspected

- Viewed all six actual desktop/mobile PNG files and both WebP posters in
  `output/netweave-local-rules-v1/`.
- Read the asset manifest, verification report, three state JSON files, caption
  contract, generator and README, and `port-pmp.md` V3.3-V3.5.
- Fresh `ffprobe` inspection confirmed the MP4 is H.264, 1600x1100, 24 fps,
  6 seconds and 163720 bytes. Playback, timing quality and browser decoding were
  not tested in this review.
- Existing verification records desktop PNG dimensions 1600x1100, mobile
  dimensions 800x1000, desktop poster 20236 bytes and mobile poster 12458 bytes.
  Both recorded poster sizes are below the V3 200 KB planning target; this is
  not a measured page-performance result.

## Visual judgment

| Dimension | Finding | Disposition |
|---|---|---|
| Composition | Entire plate and all vehicles are visible in every image; stable framing makes positional changes understandable. | Accept |
| Material and craft | Restrained blue/amber, rounded edges and soft shadows make a coherent tactile miniature. It feels more like a physical study than a stock traffic image. | Accept as aesthetic judgment |
| State distinction | Three followers advance while the rightmost lead remains stationary. The amber follower closes from two empty cells to one to none ahead of it. | Accept with explanatory text |
| Semantic clarity | Unlabeled two-row tiles resemble a keyboard, especially within this portfolio's keyboard work. The isolated image does not clearly say traffic. | Required HTML title and lane explanation |
| Color meaning | Amber marks the selected follower, not the stationary lead. An unlabeled highlight can suggest the opposite role. | Required explicit selected-follower and stationary-lead labels |
| Mobile suitability | Portrait framing retains the full object, but substantial blank top/bottom area shrinks the meaningful field. | Conditional; inspect at actual 390px layout width |
| Compression | Posters retain visibly recognizable shapes and spacing; minor softness is acceptable for this miniature. | Accept at inspected size |
| Delight | Toy-like material is inviting; still images alone do not demonstrate a delightful interaction. | Interaction acceptance pending |

The distinct spatial changes do not rely on color, which is useful for a
reduced-motion still selector. There are no baked text labels to become
illegible when scaled. Actual text readability and contrast therefore belong
to the eventual HTML layout and were not evaluated here.

## Required integration conditions

1. Place the caption boundary immediately beside the artwork: “Illustrative
   local-spacing study. Original explanatory artwork, not recorded NetWeave
   output.” Preserve the full Reader description and the statement that
   congestion-aware rerouting remained future work.
2. Identify direction and roles in HTML. Explain that the highlighted amber
   vehicle follows the stationary blue lead and approaches it through three
   drawings. Label the three states and expose the remaining empty-cell gap
   as 2, 1, 0; these are drawing coordinates, not measured traffic metrics.
3. Do not describe this authored pose sequence as an executed local-rule
   algorithm. The generator's `poses` array is hand-specified. V3's actual
   deterministic field requirement remains a separate implementation/evidence
   gate unless this drawing is used solely as its clearly marked illustration.
4. Use compressed still derivatives for browser state selection rather than
   the approximately 0.89-1.81 MB PNG sources. Verify actual narrow-screen
   framing, keyboard/touch selection, reduced motion, loading failure and
   no-JS Reader equivalence when integrated.
5. Keep optional film behind deliberate play, with controls and adjacent
   transcript. This six-second silent hard-cut sequence is not a captioned
   narrative-film acceptance result.

## Provenance follow-up

The manifest already includes hashes, sizes, authoring tool, rights boundary
and fallback. Its reviewer/disposition correctly say independent acceptance
is pending. Add the state JSON and caption contract to provenance records,
record the exact cwebp version, and link this qualified review rather than
upgrading the whole artifact to an unconditional flagship acceptance.

No app files, production configuration, source-evidence repositories or media
were changed by this review. Only this separate review document was written.
