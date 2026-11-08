# Hybrid portfolio: complete first iteration

## Approved direction

The user selected Hybrid (shared instrument-grade shell plus authored material objects), balanced anchors across NetWeave, ShareCLI, OmniRoute and physical products, then authorized "do it all". This document records implementation decisions under that authorization. The previously deployed release is a prototype baseline; its completed release gates do not establish redesign completion.

Audience: hiring managers, engineering/product peers and collaborators evaluating craft, decisions and evidence. Use the September 10 Material Lab v0.6 HTML and Design System Iteration Markdown together with the existing Technical Atelier specification. Precision materials belong to the whole site, not just keycaps or NetWeave.

## Coverage contract

| Area | First-iteration outcome | Acceptance evidence |
|---|---|---|
| All page shells | Shared readable type, spacing, responsive navigation, controls, focus and reader presentation | Every generated route checked at desktop and mobile |
| Homepage and lenses | Art-directed opening, distinct physical/software visual families, coherent engineering/product reorder | Screenshots of both lenses and keyboard navigation |
| Work and archive | Scannable catalog, clear filters, empty results and discoverable historical work | Filter and archive interaction walkthrough |
| Every project detail | Intentional visual, readable narrative, source context and useful onward navigation | Coverage inventory lists each project, media type and render result |
| Physical products | Real images retain provenance; image framing and gallery interaction expose product detail | GMK Arch/WITF full-width and mobile review |
| NetWeave | Spatial readability across all three states, clear roles and truthful explanatory boundary | All states checked, including contact/overlap |
| ShareCLI | Distinct material queue objects, useful state inspection, real replay separated from explanation | State/control and replay checks |
| OmniRoute | Legible conditional routing diagram in detail and shared artifact surfaces | Matching node/edge semantics and small-screen reader |
| Additional software/research | Meaningful project-specific SVG diagrams and material scenes for Substrate/omlx | Per-project visual and caption review |
| Writing, resume, contact | Complete designed page treatment; usable reading, role choices and contact actions | Route walkthrough and link verification |
| Motion and accessibility | Purposeful state feedback with reduced-motion equivalents; no essential hover-only content | Keyboard, reduced-motion and no-JS review |

## Implementation boundaries

The existing vanilla JavaScript rendering and prerendering remain the application structure. A final shared CSS layer brings all surfaces into the approved design without requiring new framework dependencies. A semantic project-visual module provides distinct family diagrams and integrates them in case studies and shared artifacts. Original Blender renders expand material coverage beyond NetWeave; their source scripts, dimensions and checksums accompany exports.

Actual product images remain actual product images. Conceptual procedural objects describe software relationships and are captioned accordingly. Generated objects must not imply measured telemetry, exact product geometry, or historical simulation output.

## Execution and ownership

1. Root: scope ledger, HTML shell integration, publication consistency, application interactions not owned by workers, consolidated review.
2. Shell worker: existing styles and new hybrid-shell.css, all-route visual rhythm and responsive behavior.
3. Visuals worker: artifact.js, project-detail.js, new project-visuals.js and project-visuals.css.
4. Material-assets worker: new hybrid-materials Blender sources, renders and provenance only.

Shared completion sequence: implementation -> integrated browser review -> defect correction -> meaningful tests -> first-iteration acceptance report. Workers report their partial results without marking the whole redesign complete.

## Acceptance and reporting

Progress is counted against the coverage contract, not against deployment steps. Report covered routes/projects, missing graphics, unverified controls and unresolved defects independently. A test pass does not establish visual completion. Time estimates are provisional until rendering and integration results are observed; unavailable estimates are explicitly unknown.

The first iteration must present usable, coherent breadth across every route and substantive depth in all four anchors before overall completion is claimed. Any missing family or unreviewed route remains open in the denominator.
