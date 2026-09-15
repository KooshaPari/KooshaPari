# Routing visual slice acceptance

2026-09-09 Pacific, approximately 16:53-17:08. Verdict: HOLD for observed keyboard defect; automated gate passes do not establish visual acceptance.

## Automated evidence

One `npm run verify` invocation, shell pipefail enabled, true exit0: Vercel local build,53/53 unit tests, syntax checks,6/6 browser tests. Log: [verify](../output/verification/routingvisualslice/2026-09-09-verify.log). Existing browser tests cover no-JS top-level/project/blog content, navigation/Reader and ShareCLI accessibility, not every visual interaction in this slice.

Capture harness initially failed on unsupported SVGRect.toJSON after two screenshots. QA-only serialization was corrected and capture rerun; the full verification gate was not rerun. App sources were not changed during QA.

## Observations

| Priority / state | Actual finding | Evidence / implication |
| --- | --- | --- |
| P1 CONFIRMED | NetWeave: focusing Overview and pressing ArrowRight selects Route but destroys focus to BODY. A second ArrowRight leaves Route selected. ArrowRight on Approach changes the inspection tab to Traffic. | Reproduced at1440x1000 and390x844. [observations.json](../output/playwright/2026-09-09-routing-visual-acceptance/observations.json), netweave-keyboard and netweave-state-arrow records. Repair tab focus retention and scope tab arrow handling; hold acceptance. |
| IMPROVED | Home paired studies remove the earlier large unoccupied grid columns; original WITF photo, green research sheets, blue GMK specimen and system diagrams retain distinct visual treatments. Mobile intro is more compact. | [desktop](../output/playwright/2026-09-09-routing-visual-acceptance/home-desktop.png), [mobile](../output/playwright/2026-09-09-routing-visual-acceptance/home-mobile.png), compared physically with earlier `2026-09-09-home-*.png`. Not full rich-redesign completion. |
| IMPROVED, visual gap | OmniRoute Home now has correct project-specific conditional routing, visible arrowheads and contained node labels. All measured labels fit220x56 node rectangles. At mobile the entire580-unit diagram is scaled into roughly244px, making its labels very small. The expanded six-step text also makes this supposed compact contribution card exceptionally tall. | [mobile topology](../output/playwright/2026-09-09-routing-visual-acceptance/omniroute-home-topology-mobile.png), Home screenshots and node bounds in observations.json. Reader text is available; mobile legibility and compactness still deserve refinement. |
| IMPROVED, visual gap | NetWeave architecture now renders real SVG with separated labels instead of concatenated HTML. One meaningfully named state-control group updates the image, pressed state and explanatory sentence, using desktop03/mobile03 appropriately. Mobile diagram labels remain tiny within the scaled640-unit viewBox. | [NetWeave mobile](../output/playwright/2026-09-09-routing-visual-acceptance/netweave-mobile.png); observations confirm SVG namespace, one group, zero generic State1/2/3 buttons and image/text update. |
| P2 CONFIRMED | OmniRoute detail has horizontal overflow:390px viewport,397px document. Screenshot shows raw long source URL prose; exact overflowing element not isolated in this pass. | [OmniRoute mobile](../output/playwright/2026-09-09-routing-visual-acceptance/omniroute-mobile.png). Home and NetWeave both390/390. Route also displays concatenated metric labels and internal classification prose; existing detail presentation needs further polish. |

## Fallback and motion boundary

NetWeave reduced-motion reload initializes Reader=true at desktop and mobile. No active animations were observed in the sampled pages. This is a point-in-time observation, not a performance benchmark. [No-JS mobile](../output/playwright/2026-09-09-routing-visual-acceptance/netweave-nojs-mobile.png) was physically inspected: original still, explanatory caption, narrative and navigation remain available; controls are removed. The illustration explicitly remains non-telemetry and excludes implemented rerouting.

## Coverage and remaining acceptance

Captured Home, OmniRoute detail and NetWeave at desktop/mobile; OmniRoute Home SVG crops; NetWeave Approach and reduced-motion/Reader; NetWeave no-JS mobile. Physically inspected Home desktop/mobile, OmniRoute Home mobile diagram, NetWeave mobile, OmniRoute mobile and no-JS mobile. Other captured images remain available but are not all claimed visually reviewed. Product-lens visual review and exhaustive accessibility/performance are still open.

The preserved `port-pmp.md` V3.2-.5 requirements require coherent rich inspection, project-specific truthful artifacts, legible mobile/Reader equivalents and keyboard access. Correct semantic mapping and CSS layout progress do not waive those requirements. No deployment, Git operation or source repair occurred during this QA pass. Return implementation ownership to coordinator for the confirmed focus repair before another acceptance pass.

17:12 Pacific follow-up: overflow isolated to the paragraph under OmniRoute's Verification heading (`.case-copy .case-section > p`), containing the literal GitHub pulls query URL. Paragraph bounding box left16/right374, clientWidth358, scrollWidth381; overflow reaches397px in the390px viewport. Its ancestors inherit the overflow. This is a text-wrapping defect, not the new Home SVG. Task-owned server58624 stopped via its execution session; browser closed. Build/server/capture ownership released to coordinator. The prior17:10 estimate is superseded by HOLD pending routed repairs, with no new completion estimate before their scope is known.
