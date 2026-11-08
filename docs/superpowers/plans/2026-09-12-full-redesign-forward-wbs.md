# Full-Redesign Forward WBS (Corrected)

> Date: 2026-09-12 | Branch: `review/public-site-sync-20260909`
> Scope: Wide/deep whole-site first iteration
> Exclusions: No code edits, builds, commits, deploys, or network mutations from this document
> Ownership: This document and `output/redesign-audit/` are agent-owned work artifacts

## User restore hold

The following <REDACTED> repositories are reported deleted and await GitHub Support restoration, expected ~2026-09-13:

| Repository | In-scope for current site? | Notes |
|---|---|---|
| `<REDACTED>/agentapi-plusplus` | **Yes** — in PROJECTS array | Restoration pending |
| `<REDACTED>/zz-Frostify` | Unknown — mapping to Frostify project unclear | Frostify project is in PROJECTS array; repo name mismatch |
| `<REDACTED>/zz-vibeproxy` | No — not in current site inventory | |
| `<REDACTED>/AuthKit` | No — not in current site inventory | |
| `<REDACTED>/phenotype-fleet-ops` | No — not in current site inventory | |

**Constraints for this session**: Local handoff only. Do not touch accounts, create/rename/transfer repositories, or claim restoration is verified. No network mutation.

## Verified codebase facts

| Dimension | Verified count | Evidence |
|---|---|---|
| Source HTML routes | 20 (7 root + 11 work/ + 1 blog/ + 1 archive) | `ls *.html work/*.html blog/*.html` |
| Prerendered routes | 19 of 20 — archive excluded | `scripts/prerender.js` TOP_LEVEL_ROUTES + project + post loops |
| Source CSS files | 17 | `ls styles/*.css` |
| JS modules | 34 (scripts + components + media + views) | `ls scripts/**` |
| Projects in data | 15 | `data/projects.js` PROJECTS array |
| FEATURED_PRESENTATIONS | 7 (netweave, sharecli, omniroute, gmk-arch, witf, substrate, phenotype-omlx) | `data/projects.js` |
| Projects with caseStudy data | 7 (gmk-arch, witf, sharecli, substrate, phenotype-omlx, omniroute, netweave) | `data/projects.js` |
| Projects without caseStudy | 8 (byteport, tracera, dss-cipher, cliproxyapi-plusplus, agentapi-plusplus, mcpforge, forgecode, frostify) | `data/projects.js` |
| Reduced-motion rules | 7 source CSS files | `rg prefers-reduced-motion styles/` |
| CSS line count range | 63 (construction-gate) to 425 (hybrid-shell) | `wc -l styles/*.css` — no file exceeds 500 |
| main.js | 1824 lines | `wc -l scripts/main.js` — maintainability concern, not a performance metric |
| Self-hosted fonts | Not present — system stack only | No `@font-face`, no font files |
| Browser evidence | **None** — zero screenshots, zero axe output | All visual/UX status is code-inspection only |

## Previous-audit corrections

| Audit # | Claim | Correction |
|---|---|---|
| 01 | "hybrid-shell.css MISSING, 0 bytes" | **FALSE** — 425 lines on disk |
| 01 | "project-visuals.css MISSING, 0 bytes" | **FALSE** — 257 lines on disk |
| 03 | "No `prefers-reduced-motion` found in `styles/*.css`" | **FALSE** — present in 7 source CSS files |
| 03 | "No-JS fallback: ShareCLI only" | **INCORRECT** — prerender.js populates static HTML for 19 of 20 routes at build time |
| 03 | "Self-hosted fonts: NOT IMPLEMENTED" | Correct outcome — system stack only; not necessarily a defect |
| 01 WBS | "hybrid-shell.css 536 lines" | **STALE** — current count is 425 lines |
| 01 WBS | "VERIFIED D48 under500 max536" | **INCORRECT** — max is 425 (hybrid-shell), not 536; line counts are not performance metrics |

## Corrected lane structure

| Lane ID | Lane name | Description |
|---|---|---|
| L1 | Shared shell | Construction gate, navigation, footer, CSS tokens, hybrid shell, project visuals |
| L2 | Home / lenses | Homepage identity, hero, engineering/product lens switching, cross-fade |
| L3 | Project graphics (15) | Per-project visual asset creation, SVG diagrams, image optimization, data coverage |
| L4 | Deep anchors (4 families) | NetWeave, ShareCLI, OmniRoute, Physical Products (GMK Arch + WITF) — full case-study pages with deep media and interaction |
| L5 | 3D breadth (11 projects) | Remaining projects — original 3D scenes (Blender where applicable), interactive diagrams, catalog cards, project-index entries |
| L6 | Search / UX | Project index dialog, filter state, keyboard nav, empty states, archive section |
| L7 | Writing / resume / contact | Blog, resume, contact — content pages and case-study rendering |
| L8 | Motion | Animations, keyframes, reduced-motion compliance, transitions |
| L9 | Mobile / performance | Responsive breakpoints, font loading, image optimization, CLS prevention, CSS limits |
| L10 | Archive route | Dedicated archive route — prerender gap, content, navigation |
| L11 | Image failure | Broken image fallbacks, missing asset states, SVG error recovery |
| L12 | Visual acceptance | Screenshots, axe audit, keyboard nav, color contrast, motion audit |
| L13 | Deep interaction verification | NetWeave traffic field, ShareCLI cast replay, OmniRoute topology, physical product gallery |
| L14 | Completeness audit | All 14 domains verified, all 15 projects covered, sign-off |

**All 14 acceptance domains**: L1 through L14 above.

---

## Atomic deliverables (43 rows)

### L1 — Shared shell

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D01 | Construction gate: responsive backdrop, mobile close button, reduced-motion override | None | EXISTS — verify mobile 390px in browser |
| D02 | Shell nav: keyboard-focusable links, visible focus ring, skip-link target | None | EXISTS — verify focus ring in browser |
| D03 | Shell footer: semantic `<footer>`, copyright, contact link | None | EXISTS — verify semantic HTML in browser |
| D04 | CSS token system: color-scheme, motion tokens, radii, shadows, spacing scale | None | EXISTS — tokens.css (202 lines) |
| D05 | Hybrid shell CSS: chrome frame, sidebar, content area responsive layout | D04 | EXISTS — hybrid-shell.css (425 lines) — verify 390px |
| D06 | Project visuals CSS: diagram containers, layered image wrappers, slot placeholders | D04 | EXISTS — project-visuals.css (257 lines) — verify render |

### L2 — Home / lenses

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D07 | Homepage identity block: name, tagline, proof-point strip, photo/avatar slot | L1 | UNKNOWN — no screenshot evidence |
| D08 | Homepage hero: art-directed project families, featured-project cards | D07 | UNKNOWN — no screenshot evidence |
| D09 | Lens switching: engineering/product toggle, CSS accent override, data-lens attr | D08 | EXISTS — verify toggle in browser |
| D10 | Lens cross-fade: opacity transition on switch, reduced-motion kill | D09 | EXISTS — verify smooth in browser |

### L3 — Project graphics (15 projects)

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D11 | Featured card engineering annotation (7 featured projects) | L1 | EXISTS in data — verify render |
| D12 | Featured card product annotation (7 featured projects) | L1 | EXISTS in data — verify render |
| D13 | All 15 project card visuals: SVG diagrams or image assets per project, alt text | D04 | PARTIAL — 7 featured have presentation data; 8 minimal |

### L4 — Deep anchors (4 families, 5 projects)

#### NetWeave

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D14 | NetWeave traffic-field SVG canvas, A*/CA diagram, desktop+mobile renders | L3 | PARTIAL — blind draft; no Blender source in worktree for re-render |
| D15 | NetWeave case-study sections, diagram ASCII, disclosure text, evidence refs | D14 | EXISTS in data — verify render |

#### ShareCLI

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D16 | ShareCLI process-topology SVG, workbench state machine, cast replay | L3 | EXISTS — verify render in browser |
| D17 | ShareCLI case-study sections, noscript fallback, GitHub evidence | D16 | EXISTS — verify render in browser |

#### OmniRoute

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D18 | OmniRoute routing-topology SVG, solid/dashed legend, external ownership label | L3 | EXISTS — verify ownership label in browser |
| D19 | OmniRoute case-study sections, evidence ledger, contribution metrics | D18 | EXISTS — verify render in browser |

#### Physical Products (GMK Arch + WITF)

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D20 | GMK Arch hero PNG, wordmark, plate rendering, alt text | L3 | EXISTS — single image (354x90) |
| D21 | GMK Arch case-study sections, EVIDENCE_LEDGER.md ref, metrics | D20 | EXISTS in data — verify render |
| D22 | WITF hero-01.jpg + hero-02.jpg (1600x900), split Alice photos, alt text | L3 | EXISTS — 2 product images |
| D23 | WITF case-study sections, metrics, manufacturing narrative | D22 | EXISTS in data — verify render |

### L5 — 3D breadth (11 remaining projects)

#### Full case-study projects (Substrate, phenotype-omlx)

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D24 | Substrate systems-sheet SVG, provider-routing diagram | L3 | EXISTS — verify render in browser |
| D25 | Substrate case-study sections, GitHub evidence | D24 | EXISTS in data — verify render |
| D26 | phenotype-omlx experiment-note SVG, fork boundary diagram | L3 | EXISTS — verify render in browser |
| D27 | phenotype-omlx case-study sections, upstream attribution | D26 | EXISTS in data — verify render |

#### Minimal projects (BytePort, Tracera)

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D28 | BytePort: project card, summary, technologies, GitHub link | L1 | EXISTS in data — no caseStudy |
| D29 | Tracera: project card, summary, technologies, GitHub link | L1 | EXISTS in data — no caseStudy |

#### Legacy / minimal projects

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D30 | DSS Cipher: hero.gif, project card, geekhack link | L1 | EXISTS — legacy GIF |
| D31 | CLIProxyAPI++: project card, upstream attribution, GitHub link | L1 | MINIMAL — no visual |
| D32 | AgentAPI++: project card, upstream attribution, GitHub link | L1 | MINIMAL — repo under restore hold |
| D33 | MCPForge: project card, upstream attribution, GitHub link | L1 | MINIMAL — no visual |
| D34 | ForgeCode: project card, upstream attribution, GitHub link | L1 | MINIMAL — no visual |
| D35 | Frostify: project card, download metrics, upstream attribution | L1 | MINIMAL — repo name mismatch under restore hold |

### L6 — Search / UX

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D36 | Project index dialog: keyboard ArrowUp/Down/Home, Escape, focus trap, aria-live count | L1 | EXISTS — verify keyboard in browser |
| D37 | Project index: empty search message, filter state, category tabs | D36 | EXISTS — verify state in browser |
| D38 | Work-catalog: filter chips, active state, card grid, archive section link | L1 | EXISTS — verify filters in browser |

### L7 — Writing / resume / contact

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D39 | Blog index: post cards, date display, excerpt | L1 | EXISTS — verify render |
| D40 | Blog post: case-study sections render, typography, code blocks | D39 | EXISTS — verify render |
| D41 | Resume: sections grid, technologies, proof points | L1 | EXISTS — verify layout |
| D42 | Contact: links, email, social, construction gate integration | L1 | EXISTS — verify layout |

### L8 — Motion

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D43 | Reduced-motion: global killswitch + per-component overrides (7 CSS files) | D04 | EXISTS in all 7 files — verify behavior in browser |
| D44 | Page-enter/exit transitions: keyframes defined, reduced-motion kills | D43 | EXISTS — verify usage in browser |
| D45 | Button press feedback: 1px settle, no bounce, reduced-motion override | D43 | EXISTS — verify in browser |

### L9 — Mobile / performance

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D46 | Responsive breakpoints: mobile-first, 760px shell collapse, 390px overflow check | L1 | EXISTS — verify 390px in browser |
| D47 | Font loading: system-stack only, no FOUT/FOIT risk | None | VERIFIED — no web fonts |
| D48 | Image optimization: WebP where applicable, width/height on `<picture>`, CLS prevention | L3 | PARTIAL — CLS risk on JS-rendered images |
| D49 | CSS audit: all files within size targets (current max 425 lines) | None | EXISTS — all 17 files under 500 lines |

### L10 — Archive route

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D50 | Archive route prerender inclusion or static fallback | L1 | **MISSING** — not in TOP_LEVEL_ROUTES |
| D51 | Archive route content: post listing, navigation, construction gate | D50 | NOT STARTED |
| D52 | Archive route 390px responsive check | D50 | NOT STARTED |

### L11 — Image failure

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D53 | Broken image fallback: `<img>` onerror handler or CSS placeholder state | L1 | NOT STARTED |
| D54 | Missing asset state: projects without gallery images show graceful placeholder | L3 | NOT STARTED |
| D55 | SVG diagram error recovery: fallback to text or placeholder on render failure | L3 | NOT STARTED |

### L12 — Visual acceptance (browser required)

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D56 | Desktop screenshot per route (20 routes) | D01-D55 | NOT STARTED — no browser evidence |
| D57 | 390px mobile screenshot per route (20 routes) | D01-D55 | NOT STARTED |
| D58 | Axe automated audit per route | D56 | NOT STARTED |
| D59 | Keyboard-only navigation: tab through all interactive elements, focus visible | D56 | NOT STARTED |
| D60 | Color-contrast audit: verify WCAG AA ratios for text on all surfaces | D56 | NOT STARTED |
| D61 | Motion audit: verify all keyframes respect reduced-motion, no autoplay | D43 | NOT STARTED |

### L13 — Deep interaction verification

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D62 | NetWeave traffic-field interaction: state transitions, play/pause, reduced-motion | D14 | NOT STARTED — no browser evidence |
| D63 | ShareCLI cast replay: playback controls, process topology update, timing | D16 | NOT STARTED |
| D64 | OmniRoute topology: solid/dashed legend accuracy, ownership label visibility | D18 | NOT STARTED |
| D65 | Physical products gallery: GMK Arch wordmark render, WITF dual-image layout | D20, D22 | NOT STARTED |
| D66 | Lens switching interaction: toggle, accent color change, cross-fade, reduced-motion | D09, D10 | NOT STARTED |
| D67 | Project index keyboard interaction: ArrowUp/Down/Home/Escape, focus trap, aria-live | D36 | NOT STARTED |

### L14 — Completeness audit

| ID | Deliverable | Depends on | Status |
|---|---|---|---|
| D68 | All 15 projects have visible card or presentation on work route | D11, D13 | NOT STARTED |
| D69 | All 15 project detail pages render with summary and navigation | D14-D35 | NOT STARTED |
| D70 | All 7 featured projects show engineering and product annotations on home | D11, D12 | NOT STARTED |
| D71 | Archive route accessible and renders content | D50-D52 | NOT STARTED |
| D72 | 404 / unknown route displays not-found view | L1 | EXISTS — verify in browser |
| D73 | Final sign-off: all 14 acceptance domains pass | D01-D72 | NOT STARTED |

---

## Acceptance domains summary

| Domain | Lane | Deliverables | Outcomes to verify |
|---|---|---|---|
| 1. Shared shell | L1 | D01-D06 | 6 |
| 2. Home / lenses | L2 | D07-D10 | 4 |
| 3. Project graphics | L3 | D11-D13 | 3 |
| 4. Deep anchors | L4 | D14-D23 | 10 |
| 5. 3D breadth | L5 | D24-D35 | 12 |
| 6. Search / UX | L6 | D36-D38 | 3 |
| 7. Writing / resume / contact | L7 | D39-D42 | 4 |
| 8. Motion | L8 | D43-D45 | 3 |
| 9. Mobile / performance | L9 | D46-D49 | 4 |
| 10. Archive route | L10 | D50-D52 | 3 |
| 11. Image failure | L11 | D53-D55 | 3 |
| 12. Visual acceptance | L12 | D56-D61 | 6 |
| 13. Deep interaction | L13 | D62-D67 | 6 |
| 14. Completeness | L14 | D68-D73 | 6 |
| **Total** | | **73 deliverables** | **73 outcomes** |

## Dependency graph

```
L1 shell ──> L2 home ──> L3 graphics ──> L4 deep anchors ──> L13 interaction
                       ──> L5 3D breadth
                       ──> L6 search/UX
                       ──> L7 writing
                       ──> L10 archive
                       ──> L11 image failure

D04 tokens ──> D43 reduced-motion ──> D61 motion audit

D01-D55 ──> D56 screenshots ──> D58 axe, D59 keyboard, D60 contrast
D01-D72 ──> D73 final sign-off
```

## Key blockers

1. **No browser evidence exists** — zero Playwright screenshots, zero axe output. All code-inspection status is provisional until browser acceptance.
2. **Blender source absent from worktree** — NetWeave v3 renders are blind drafts; no `.blend` file available for re-render.
3. **`/archive` route excluded from prerender** — will be empty `#view-root` without JS; needs static fallback or prerender inclusion.
4. **8 projects have no caseStudy data** — BytePort, Tracera, DSS Cipher, CLIProxyAPI++, AgentAPI++, MCPForge, ForgeCode, Frostify.
5. **AgentAPI++ repo under restore hold** — repository deleted, pending GitHub Support restoration; cannot verify GitHub link.
6. **Frostify repo name mismatch** — project references `<REDACTED>/Frostify` but deleted repo is `<REDACTED>/zz-Frostify`.
7. **Dist staleness** — `dist/styles/` missing `project-index.css`; dist may not match current source.
8. **main.js at 1824 lines** — exceeds 500-line hard limit; decomposition needed but out of scope for this audit.
9. **No self-hosted fonts** — system stack only; design spec may require @font-face (fact, not necessarily defect).
10. **CLS risk on JS-rendered images** — width/height attributes set in NetWeave static HTML but JS-rendered project views rely on data fields.

## Provisional-status disclaimer

Every status in this document is based on source-code inspection only. **No status should be treated as confirmed until a browser renders the route and a human or automated test accepts it.** The following status labels are used:

- **VERIFIED** — source-code fact confirmed by grep/read (no browser)
- **EXISTS** — file or data structure present on disk; render behavior unknown
- **PARTIAL** — some components present, gaps identified
- **MINIMAL** — minimal data exists; significant work needed
- **UNKNOWN** — no screenshot or test evidence; cannot assess
- **NOT STARTED** — no implementation or evidence exists
- **MISSING** — identified gap; no implementation exists
