# KooshaPari Technical Atelier Portfolio Redesign

## Status and authority

This specification supersedes the generic visual treatment in `2026-08-29-canonical-portfolio-design.md`. It preserves the existing project classification, evidence model, canonical routes, migration safeguards, and shared-record/two-lens architecture.

The redesign produces a professional, distinctive portfolio preview for human review. It does not authorize DNS changes, production redirects, production-domain attachment, or retirement of Adobe Portfolio, Ram Designs, `projects.kooshapari.com`, or `phenotype.space`.

## Goal

Create an elite portfolio experience that feels like Koosha Paridehpour's technical design atelier: a single practice spanning systems software, technical product/program leadership, computational research, and complex physical products.

The experience must be visually memorable without obscuring evidence, navigation, accessibility, or recruiter-level comprehension. It must not resemble a generic dark SaaS landing page, dashboard, terminal theme, AI-startup gradient site, or uniform card grid.

## Design thesis

The portfolio is a working studio archive. Physical products appear as material artifacts; software projects appear as systems drawings, traces, and experiment sheets. Both use one editorial canvas and one evidence system.

The central visual relationship is:

```text
MATERIAL LAYER                 SYSTEMS LAYER
matte aluminum                 topology lines
concrete / paper               routing paths
product photography            execution traces
olive utility markings         teal signal states
manufacturing annotations      architecture annotations
             \                 /
              ATELIER CANVAS
```

Personality appears through composition, material, annotation, and interaction. Essential navigation and content remain literal and visible.

## Visual system

### Color

- Graphite black: primary structural field and image frame.
- Warm off-white: reading surfaces, diagrams, and long-form editorial sections.
- Concrete gray: secondary panels and physical-product backgrounds.
- WITF olive: selected states, product annotations, decision paths, and utility labels.
- GMK Arch teal: engineering signals, links, route paths, and architecture emphasis.
- DSS acid green: sparse archive/experimental accents only.
- White, near-black, and two muted grays provide accessible text hierarchy.

Color never serves as the only state indicator. Engineering and Product lenses also change labels, ordering, icons, and annotation content.

### Typography

- Primary display: self-hosted Space Grotesk, with a geometric system-sans fallback.
- Reading face: self-hosted Inter, with the native system sans stack as fallback.
- Technical metadata: self-hosted JetBrains Mono used only for coordinates, evidence labels, dates, and system annotations.
- Headline widths remain editorial rather than full-screen billboard text.
- Uppercase tracking is reserved for labels and drawing-title metadata, not paragraphs.

No font choice may introduce a blocking third-party request. Fonts must be self-hosted or use resilient system fallbacks.

### Material and depth

- Matte plastic, powder-coated aluminum, paper/concrete texture, soft diffuse shadows, and precise crop masks define the physical-product layer.
- Fine rules, alignment marks, node paths, measurement labels, and diagram coordinates define the systems layer.
- Depth is restrained and purposeful. Avoid floating-card tilt, glass panels, neon bloom, and ornamental 3D.
- Product imagery carries visual weight; UI decoration does not compete with it.

### Grid and spacing

- Desktop uses a 12-column editorial grid with persistent outer gutters and deliberate asymmetry.
- Tablet collapses to 8 columns while retaining image/text counterpoint.
- Mobile uses 4 columns, full-bleed media where safe, and a compact persistent lens/index control.
- Reading measure is 58–72 characters.
- Spacing follows a small token scale; long pages use alternating dense evidence blocks and generous visual pauses.

## Information architecture

Canonical views remain:

- Home
- Engineering
- Product / Program
- Work index
- Project detail
- Resume
- Contact
- Archive

The current shared project records remain canonical. Lenses change ordering, excerpts, visible annotations, and section emphasis; they do not duplicate content.

## Global navigation

The existing centered pill tab bar is removed.

Desktop header:

- Koosha Paridehpour identity/title block at left.
- Work Index, Resume, and Contact as literal links at right.
- Engineering/Product lens control remains persistent and visibly separate from route navigation.
- Header becomes visually quieter as the user enters long-form work, but never disappears completely.

Project Index:

- Opens a full-height catalog grouped into Featured, Systems, AI/ML, Physical Products, Research, Compact, and Archive.
- Provides title, category, status, role, and one-line outcome/context.
- Supports keyboard traversal, Escape to close, focus restoration, and `/` as an optional shortcut.
- Essential routes remain available without the overlay.

Project pages display a coordinate-style breadcrumb, for example `WORK / 04 / SHARECLI`, with previous/next project navigation.

Mobile navigation:

- Compact identity row at top.
- Accessible menu for routes.
- Lens/Index control at the bottom safe area when useful.
- No miniature desktop navigation or horizontal overflow.

## Homepage composition

The homepage is a single art-directed scene followed by an editorial project sequence. It is not hero + proof cards + grid.

### Opening scene

WITF occupies approximately 55–65% of the desktop first viewport as the central physical artifact. Existing 3840px renders provide the initial 2.5D treatment using layered crops, masks, shadow separation, and restrained pointer/scroll depth. A future WITF 3D model can replace the media layer without changing page composition.

The identity block is compact:

> Koosha Paridehpour  
> Software systems, technical products, and the infrastructure between them.

A secondary sentence establishes the engineering/product/program range. Primary links lead to Engineering and Product readings.

Metrics are attached to relevant project annotations, not displayed as generic dashboard cards.

### Lens transformation

Engineering mode:

- Advances ShareCLI, Substrate, phenotype-omlx, and NetWeave.
- Applies teal route/signal annotations.
- Shows architecture, runtime, constraints, and verification excerpts.
- Reframes WITF through constraint modeling, technical coordination, and supplier interfaces.

Product mode:

- Advances GMK Arch, WITF, and product/program evidence.
- Applies olive material/decision annotations.
- Shows demand, economics, manufacturing, fulfillment, and outcomes.
- Keeps relevant engineering work visible as technical execution evidence.

Lens transitions reflow hierarchy in 350–500 ms. Reduced-motion mode changes state instantly.

### Featured artifact sequence

- WITF: central product object plus decision sequence.
- GMK Arch: panoramic launch dossier with community/distribution annotations.
- ShareCLI: runtime/process topology and contention narrative.
- Substrate: provider routing and policy-control map.
- phenotype-omlx: upstream/fork-delta and experiment sheet.
- NetWeave: graph-to-cellular-automata explanation with a restrained traffic-field animation.

Supporting work uses smaller specimen-sheet formats. No top-tier project is reduced to a generic card.

## Work index and lenses

The Work index remains filterable but becomes an editorial catalog.

- Featured work receives heterogeneous layouts based on project type.
- Compact entries use consistent specimen sheets with identity, role, current boundary, technologies, evidence class, and link.
- Archive entries appear as a chronological/indexed drawer, not as equal-weight cards.
- Filtering does not cause disorienting layout jumps; the result count remains announced to assistive technology.
- Filters include Engineering, Product, Systems, AI/ML, Developer Tools, Cloud, Physical Product, and Historical.

## Case-study system

All full studies share navigation, evidence labels, typography, and related-project behavior. Their narrative and visual structures differ by project.

### GMK Arch — launch dossier

- Opening: cinematic retained render/wordmark and concise launch identity.
- Design system: palette, typography, icon/novelty language, and kit logic.
- Prototype and manufacturing evidence.
- Distribution map for the 10-region vendor network.
- Community/GTM timeline using Geekhack and Reddit historical evidence.
- Outcomes attach qualifiers directly: approximately 4,900 sold line items, approximately $432K revenue in 30 days, 142K+ community views, and 10-region network.
- Revenue and line-item metrics remain canonical user facts; Geekhack externally corroborates the view count and vendor network.
- `line items` is never changed to customers or users.

### WITF — product decision path

- Opening: wide product object with controlled macro detail.
- Product construction sheet: form, materials, mounting, PCB/QMK/VIA, collaborators.
- Decision timeline: ~15 expectation -> toward 100 -> fulfillment changes -> softer demand/timing effects -> ~50 renegotiation -> $825 to $650 -> accessory cancellation/refund -> viable core preserved -> ~$40K across ~150 line items.
- Supplier, manufacturing, and fulfillment decisions attach to the point at which they changed the plan.
- External Geekhack/Reddit evidence supports product identity, launch dates, MOQ, public pricing context, and vendor/fabrication updates; canonical user evidence retains the financial/operational narrative.
- A future 3D model supports optional exploded construction and rotation.

### ShareCLI — runtime topology

- Begin with the high-concurrency coding-agent workload problem.
- Interactive topology shows processes, observation, coalescing/debounce/queue, optional FUSE boundary, and observability.
- Thermal/contention behavior is presented as a systems constraint, not a decorative graph.
- Install/build/demo paths are visible and testable.
- Current limitations are adjacent to architecture, not hidden at the end.
- No adoption or scale claims are introduced.

### Substrate — provider policy map

- A routing diagram connects HTTP, CLI, MCP, and A2A interfaces to provider state and execution.
- Rate limiting, retries/fallback, budgets, audit, health, and observability appear as policy nodes.
- The policy boundary is explained before implementation detail.
- Provider uncertainty/failure states have explicit visual treatment.
- No invented throughput, latency, adoption, or availability metrics.

### phenotype-omlx — fork-delta experiment sheet

- Split opening identifies upstream `jundot/omlx` and KooshaPari fork/extension.
- A delta matrix distinguishes upstream capability from multi-backend routing, Rust performance cores, evaluation tooling, and supported research on speculative decoding, quantization, concurrency, MLX, and Apple Silicon.
- Experiment notes and diagrams use only repository-supported claims.
- Upstream OMLX work is never attributed to KooshaPari.

### NetWeave — simulation notebook

- Keep the current canonical narrative and evidence caveat.
- Directed graph and per-road cellular automata appear as two synchronized layers.
- A lightweight traffic field demonstrates local rules and emergent congestion.
- The network-level insight is explicit: individually optimal routes can degrade aggregate flow.
- Congestion-aware routing and dynamic rerouting remain documented future work, not shipped capability.
- Stable Diffusion/ControlNet sketch-to-network work remains an experimental authoring workflow.
- AI-assisted implementation disclosure remains visible; architecture and system interpretation remain user-owned.
- Deferred Doc/MP4/screenshots/simulation/ControlNet artifacts do not block the redesign.

## Compact and archive formats

- BytePort explicitly separates current Go/AWS deployment behavior from planned Firecracker/microVM work and does not claim a public deployment.
- Tracera states traceability/audit purpose without unsupported deployment/adoption claims.
- DSS Cipher remains a compact historical artifact with retained render/GIF, interest-check evidence, profile/material/kitting context, and no invented commercial outcome.
- CLIProxyAPI++ and AgentAPI++ display upstream attribution before extension/delta content.
- MCPForge and ForgeCode remain archive records with upstream provenance.
- Frostify remains historical and unmaintained, attributes the fork, and states 3,350+ GitHub release-asset downloads, never users.

## Rich-media and asset strategy

### Retained assets

- Use retained primary assets only; do not render responsive duplicates as separate media.
- Curate from the 85 retained assets instead of limiting the site to the current four copied images.
- Each chosen image receives project-specific authored alt text, retained dimensions, provenance, and ownership/licensing notes.
- Full-resolution originals remain archived; deploy optimized derivatives appropriate to display size.

### 2.5D treatments

- Existing WITF renders may be separated into background, object, shadow, and annotation layers.
- Pointer response is subtle and capped; scroll depth is bounded.
- Product macro crops reveal construction/detail rather than serving as ambient decoration.
- Mobile and reduced-motion fallbacks are static, art-directed crops.

### 3D boundary

If the WITF model is supplied:

- Accept GLB/GLTF preferred; OBJ/FBX can be converted offline.
- Preserve source model separately from web derivatives.
- Produce a decimated, compressed web model with material/texture budgets.
- Model interaction loads after critical content and never blocks the case study.
- Provide poster image, keyboard-accessible controls if interaction is exposed, reduced-motion behavior, and a WebGL failure fallback.
- Do not fabricate keycaps or manufacturing geometry as factual product evidence. Clearly label any illustrative completion.

### Generated visuals

New diagrams, textures, and abstract 2D/2.5D assets may be authored for presentation. Generated content must not masquerade as historical evidence, shipped UI, product photography, manufacturing output, or measured system behavior.

## Motion and interaction rules

Motion explains structure:

- Annotation lines resolve after the related object.
- Architecture paths draw once when entering view.
- Lens changes animate priority and annotation state.
- Timelines reveal causal sequence.
- Product media uses restrained depth rather than floating tilt.

Avoid scroll hijacking, cursor replacement, autoplay audio, essential hover-only content, continuous background animation, and gratuitous shader effects.

Performance constraints:

- Critical homepage content renders without WebGL.
- Decorative animation pauses offscreen.
- 3D and large media load on intent or proximity.
- Interaction remains responsive on mid-range mobile hardware.
- Layout dimensions are reserved to prevent CLS.

## Responsive behavior

### Desktop (1280–1440+)

- Asymmetric first viewport with WITF media occupying 55–65%.
- Persistent identity/navigation and lens control.
- Project compositions may span multiple columns and overlap grid lines intentionally.

### Tablet (~768)

- Preserve media/text counterpoint but reduce simultaneous annotation density.
- Project Index becomes a sheet/drawer.
- Diagrams pan or simplify without shrinking below legibility.

### Mobile (375–390)

- Identity and value proposition appear before the central artifact.
- Media uses deliberate portrait crops or contained landscape frames.
- Lens/Index controls remain thumb-reachable.
- Timelines become vertical; diagrams use simplified states with optional expansion.
- No horizontal page overflow, tiny labels, hover dependency, or oversized blank regions.

## Accessibility

- Semantic header, navigation, main, sections, articles, aside/evidence notes, and footer.
- One logical page heading followed by ordered section headings.
- Skip link and visible focus remain.
- Project Index traps focus only while open and restores it on close.
- Lens state and filter state are programmatically exposed.
- All public images use meaningful authored alt text; decorative layers use empty alt or CSS backgrounds.
- Diagrams include text summaries; animated diagrams provide paused/static states.
- Color contrast meets WCAG AA for body text and controls.
- Touch targets meet a 44px minimum where practical.
- `prefers-reduced-motion` removes depth motion, path drawing, smooth scrolling, and reflow animation.
- 404, resume, and contact views receive the same navigation and focus quality as primary pages.

## Technical architecture

This redesign will preserve the static ES-module application for the visual prototype. Implementation will separate the current oversized renderer into bounded modules:

- content/project records
- route and view state
- global shell/navigation
- lens state
- project index/filtering
- media and diagram renderers
- case-study layout primitives
- analytics hooks

No CMS, database, authentication, or runtime backend is required. Rich media must use progressive enhancement. A later Next.js migration may reuse the content records and design system, but it is outside this redesign scope.

## Metadata and analytics

- Retain canonical `https://kooshapari.com/` handling on preview builds.
- Preview deployments remain `noindex` while protected or under review.
- Home uses Person schema.
- Software pages may use supported SoftwareSourceCode/CreativeWork fields.
- Physical-product pages may use supported Product/CreativeWork fields.
- No unsupported schema metrics or fake offers/reviews.
- Lightweight events may record lens selection, project view, GitHub outbound, resume action, and contact action.
- Analytics remains deferred if privacy/consent decisions are unresolved.

## Verification and acceptance

The redesign is ready for a human preview only when:

- Homepage no longer uses generic metric cards or a uniform selected-work grid.
- WITF is the central first-viewport artifact with functional static fallback.
- Engineering/Product lenses visibly change hierarchy and annotation without duplicating records.
- GMK Arch, WITF, ShareCLI, Substrate, phenotype-omlx, and NetWeave have distinct presentations.
- Compact/archive items preserve scope and provenance.
- All selected assets have authored alt text, dimensions, and provenance.
- Desktop 1440/1280, tablet 768, and mobile 390/375 are visually reviewed.
- Keyboard navigation, focus order, reduced motion, contrast, and touch targets are verified.
- Internal links, project deep links, assets, resume/contact actions, sitemap, metadata, and 404 are tested.
- A hosted preview loads the SPA entrypoint and assets successfully.
- No DNS, production redirects, domain attachment, or legacy retirement occurs.

## Implementation sequence

1. Refactor the shell into bounded view/navigation/media modules without changing content evidence.
2. Establish tokens, typography, grids, material surfaces, and accessibility primitives.
3. Build the new header, Project Index, lens state, and mobile navigation.
4. Build the WITF-led homepage and heterogeneous featured-artifact sequence.
5. Build the Work catalog and compact/archive specimen formats.
6. Build GMK Arch and WITF case studies using retained imagery and evidence.
7. Build ShareCLI, Substrate, phenotype-omlx, and NetWeave diagram systems.
8. Add progressive motion and 2.5D media treatments.
9. Integrate an optional WITF 3D model behind poster/fallback boundaries when supplied.
10. Complete responsive, accessibility, performance, metadata, link, and hosted-preview verification.

## Explicit non-goals

- Production cutover.
- DNS mutation.
- Redirect activation.
- Legacy-site retirement.
- Fabricated project metrics, adoption, product photography, or technical results.
- Two disconnected portfolios.
- A CMS, database, authentication layer, or heavy runtime backend.
- Mandatory WebGL or animation for comprehension.
