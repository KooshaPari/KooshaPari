# Portfolio motion research and asset tooling

Inspected 2026-09-04 Pacific. Owner: portfolio_research. Scope: research and tooling only; no application edits, installations, or renders performed.

## Evidence and limits

Live primary pages were fetched as text. These observations establish published content and controls, not a visual browser audit, measured performance, or accessibility certification.

| Reference | Inspected evidence | Proposed adaptation |
| --- | --- | --- |
| [Bruno Simon](https://bruno-simon.com/) | Explorable portfolio; quality/audio controls; keyboard/mobile/gamepad instructions; Three.js and downloadable Blender sources documented. | One memorable interactive object with an explicit explore action and quality fallback; preserve direct project links. |
| [Lusion](https://lusion.co/) | Studio explicitly combines 3D storytelling, motion and development; projects retain names and discipline labels. | Pair a sculptural hero with a legible editorial project index; visual identity should recur across project artwork. |
| [Josh W. Comeau](https://www.joshwcomeau.com/) | Homepage foregrounds readable articles and publishes SVG, squash/stretch and scroll-animation tutorials. | Small responsive SVG details and playful affordances can supply personality between larger visual moments. |

## Proposed direction: a systems specimen

An original sculptural assembly represents Koosha's engineering practice: three offset plates or orbital bands with a warm signal passing through them. Editorial typography and real project descriptions remain ordinary HTML. Each project receives a distinct specimen composition, avoiding repetition of the same generic gradient card. This is a design proposal, not an inspected property of the existing site.

| Layer | Concrete interaction | Fallback |
| --- | --- | --- |
| 2D | SVG signal traces briefly illuminate on explicit project selection; focus receives the same visual emphasis as pointer interaction. | Static SVG and standard links. |
| 2.5D | Specimen layers shift a few pixels under a fine pointer; project artwork has shallow perspective. | Flat composition on touch, reduced motion, or unsupported CSS. |
| 3D | Optional user-activated object rotates to three fixed views associated with practice areas; HTML buttons provide equivalent navigation. | Art-directed still showing the complete object. |
| Film | Short case-study sequence moves from problem to architecture to shipped interface, with authentic screenshots and captions. | Poster plus a textual sequence; play control loads the film. |
| Delight | A small signal acknowledgement on selecting a project, and restrained spring settling on a control. | Immediate state change, no sound required. |

The visual object must not imply invented metrics, clients, awards, production use, or fabricated project relationships. Use existing verified material for captions.

## Ideas mapped to current project records

Inspected source: `data/projects.js`, specifically FEATURED_PRESENTATIONS and project records. These are existing portfolio assertions, not independent verification of the underlying project results.

| Project | Existing record evidence | Proposed asset and fidelity constraint |
| --- | --- | --- |
| OmniRoute | Routing sheet describes provider selection, cooldowns and fallback chains. | Original SVG routing paths with a selectable degradation state; label as explanatory illustration rather than live telemetry. |
| GMK Arch | Existing transparent wordmark at public/projects/gmk-arch/hero.png; recorded source hash and 354x90 dimensions. | Use the authentic mark alongside an original sculptural keycap study. Do not upscale this narrow wordmark into a full photographic hero or present an imagined keycap model as a manufactured artifact. |
| WITF | Two 1600x900 photo derivatives with separate retained-source hashes and Alice-layout descriptions. | Use the genuine photographs as dominant imagery; a restrained crop transition can reveal the numpad and split geometry. Keep a still gallery under reduced motion. |
| ShareCLI | Record describes agents, queues, coalesced events and shared runtime resources. | User-stepped SVG queue sequence: burst, coalesce, observe. Explicitly illustrative; no fabricated benchmark numbers. |
| Substrate | Record names HTTP, CLI, MCP and A2A callers plus policy, health, retry and budget controls. | Four labeled input ribbons converge on one architectural plate; all labels remain HTML or accessible SVG text. |
| phenotype-omlx | Record distinguishes upstream runtime from fork additions. | Two clearly attributed layers with a selectable boundary highlight; do not imply upstream functionality was newly authored. |
| Traffic simulation | Record distinguishes completed local-rule simulation from future congestion-aware rerouting; evidence references still request source artifacts before publication. | Only an explicitly labeled conceptual lane diagram until original simulation media is attached. Never animate future rerouting as a shipped result. |

GMK Arch and WITF asset records currently mark ownership and licensing as review-pending. Preserve those evidence flags when planning derivatives; source hashes establish provenance, not rights clearance.

## Interaction and performance contract

[web.dev's animation guidance](https://web.dev/articles/animations-guide) favors transform and opacity, recommends checking rendering costs, and cautions against indiscriminate will-change. Proposed implementation: animate a small number of composited elements, avoid continuous large blur/filter changes, and stop rendering when the object is offscreen or the document is hidden.

[Reduced-motion guidance](https://web.dev/articles/prefers-reduced-motion?hl=en) documents the operating-system preference. Proposed implementation: honor it before starting motion, listen for preference changes, and provide a persistent motion control. A still image should be the initial reliable state; richer rendering enhances it after content is usable.

[WCAG 2.2 SC 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) requires a pause, stop or hide mechanism for qualifying automatic motion lasting more than five seconds alongside other content. [SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) addresses disabling nonessential interaction-triggered motion at AAA. Adopt both behaviors as a design target without claiming conformance from implementation alone.

Proposed budgets, not measured results: initial hero poster below 200 KB where visual quality permits; optional 3D model below 1 MB compressed; no video download before intent; cap interactive pixel ratio around 1.5; one active render loop. Validate actual page responsiveness, image fidelity and mobile memory before accepting budgets. Keep normal scrolling and a visible keyboard focus path. All essential content must survive JavaScript failure.

## Local tool audit

Commands used: command -v for blender/remotion/ffmpeg/node/bun; blender --version; ffmpeg -version; npm list -g --depth=0; /Applications directory listing; portfolio package.json and filename inspection. Shell: /bin/zsh, login:false.

| Tool | Verified availability | Unverified boundary |
| --- | --- | --- |
| Blender | /opt/homebrew/bin/blender; version 4.4.3; Blender.app listed | GPU/render reliability, add-ons and scene export not exercised |
| FFmpeg | /opt/homebrew/bin/ffmpeg; version 8.1.2 | Specific encoder throughput and output quality not tested |
| Node / Bun | /opt/homebrew/bin/node and /opt/homebrew/bin/bun | Versions not captured in this audit |
| Remotion | Not found on PATH or global npm list; current portfolio manifest has no dependencies | Not an exhaustive machine-wide package search; a separate project may contain it |
| Adobe Photoshop 2025 | Application bundle listed | License, launch and automation not tested |
| Adobe Illustrator 2025 | Application bundle listed | License, launch and automation not tested |
| Adobe Creative Cloud / Acrobat DC | Application bundles listed | No asset-production requirement established |
| After Effects / Premiere | Not present in inspected /Applications listing | Other install locations not exhaustively searched |

The current koosha-phenotype directory is not a Git repository according to git -C koosha-phenotype status --short. The relative pmp-port/package.json path does not exist at the container root. Neither result identifies canonical deployment ownership; coordinator must reconcile actual checkout paths.

## Proposed reproducible asset pipeline

1. Author one original Blender scene with explicit camera, lighting, material palette and named objects. Retain the source scene and a generation script.
2. Produce a static poster first; use it to approve composition and ensure the page stands alone.
3. Export a simplified GLB only if direct manipulation provides value. Bake lighting where practical and avoid large texture atlases for an object that can use simple materials. The Blender manual fetch failed in this audit, so export details still need version-specific verification.
4. For a film, use Blender image frames and FFmpeg, or a separate pinned Remotion project for DOM/screenshot choreography. [Remotion's rendering documentation](https://www.remotion.dev/docs/render) is the verified starting point; no Remotion environment was installed here.
5. Use Illustrator for original vector cleanup or Photoshop for art direction only if needed; both are optional and license availability remains unverified.
6. Store source, export command, dimensions, byte size, poster, alt-text decision and provenance in an asset manifest. Avoid introducing tooling dependencies into the static site solely to render offline media.
7. Verify keyboard, reduced motion, disabled JavaScript, touch, hidden-tab suspension and failed-WebGL paths. Review real screenshots at narrow and wide widths and measure deployed performance separately from local checks.

Suggested next bounded slice: build one poster-backed specimen prototype and two project artwork variants; evaluate visual distinctiveness and mobile behavior before committing to a full 3D or film pipeline.
