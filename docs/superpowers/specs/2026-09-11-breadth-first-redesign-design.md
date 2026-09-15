# Breadth-First Portfolio Redesign — Parallel Plate System

> **Status:** Expanded specification for review.
> **Date:** 2026-09-11
> **Scope:** Complete first iteration across all public routes, with substantive depth for all four anchor families. NetWeave and physical products lead execution; ShareCLI and OmniRoute receive meaningful depth in the same pass.
> **Pre-existing system:** See `styles/tokens.css` for the current token definitions; this spec proposes additions and overrides only.
> **Repository relationship:** `repos/koosha-phenotype` is the editable source copy (not a Git repository). `repos/worktrees/KooshaPari-public-sync-20260909` is the Git promotion target.

---

## 0. Existing System Audit

### 0.1 Two Design Systems Coexist

The project contains two independent design systems. Only the light system is loaded by the active application (`index.html`).

| System | Entry point | Loaded by | Status |
|---|---|---|---|
| Light (Technical Atelier) | `tokens.css` → `base.css` → `shell.css` → `artifacts.css` → `case-studies.css` → `work-catalog.css` → `responsive.css` | `index.html` | Active |
| Dark (Phenotype Profile) | `main.css` → `radar.css` + `timeline.css` + `cards.css` + `hero.css` | `scripts/main.js` (1824 lines) | Legacy, not loaded by active app |

The legacy dark system defines its own tokens (`--bg-0` through `--bg-4`, `--accent-prod`, `--accent-eng`, `--accent-pheno`) and is referenced by five CSS files (`hero.css`, `radar.css`, `timeline.css`, `cards.css`, `main.css`). These files are **dead weight** in the active application but remain in the repository. This spec does not modify or remove them; a separate cleanup pass should address their disposition.

### 0.2 Active Light System — Current Capabilities

**Token system** (`tokens.css`):
- Four canonical seed colors: Obsidian (#0F1012), Slate (#353A40), Ceramic (#F6F5F5), Teal (#7EBAB5).
- Derived families: graphite, paper, concrete, olive, arch, acid.
- Semantic aliases: `--ink`, `--ink-muted`, `--surface`, `--surface-raised`, `--rule`, `--precision-rule`.
- Typography: Space Grotesk (display), Inter (reading), JetBrains Mono (meta).
- Spacing: 4–64px scale with `--gutter` and `--measure` (68ch).
- Radii: control 6px, panel 10px, studio 12px.
- Shadow: `--shadow-card` (hairline), `--shadow-specimen` (offset block).
- Lens accent: `--accent` defaults to `--arch-500` (engineering); `--accent-product` = `--olive-500`.
- Focus ring: `--focus-ring` uses arch-500.

**Visual components** (`artifacts.js` + `case-studies.css`):
- Four artifact types: `physicalPlate`, `systemsSheet`, `experimentNote`, `genericCard`.
- Each artifact renders: header (label + title + summary), media/plate, annotation (lens-scoped), metric annotation, evidence label.
- OmniRoute has a dedicated topology plate (`omniroute-topology.js`) with SVG diagram, legend, mobile HTML fallback.
- NetWeave has a workbench (`netweave-workbench.js`) with interactive state tabs and a field animation (`netweave-field.js`).
- ShareCLI has a workbench (`sharecli-workbench.js`) with capsule states and a recording catalog (`sharecli-recording.js`) with cast file downloads.
- Substrate has a systems plate (`systems-plate.js`) with SVG boundary diagram.
- Layered image component (`layered-image.js`) supports parallax shadow layers.
- Model slot component (`model-slot.js`) supports GLB/GLTF with poster fallback.

**Route views** (`scripts/views/`):
- `home.js`: Identity block + opening artifact (WITF physical plate) + featured sequence (artifact cards per lens).
- `work.js`: Filter controls + three-tier catalog (featured text cards / compact specimen list / archive drawer).
- `project-detail.js`: Case study layout with metrics, sections, diagram, workbench, recordings, evidence labels.
- `resume.js`: Two-card grid linking to engineering/product readings.
- `contact.js`: Email/GitHub/LinkedIn links.
- `blog-index.js`: Post cards with tags.
- `blog-post.js`: Article rendering.
- `not-found.js`: 404.

**Responsive** (`responsive.css`):
- Mobile (<=760px): single column, stacked layout.
- Tablet (761–1079px): two-column artifact sequence.
- Desktop (>=1080px): full layout.

### 0.3 What Exists Per Project Family

| Family | Existing visual assets | Existing interactive treatment | Gap |
|---|---|---|---|
| NetWeave | 6 v3 WebPs (desktop + mobile), Blender source | Workbench with state tabs, field animation | No hero plate on detail page; no composed visual entry on homepage beyond the artifact card |
| ShareCLI | 2 cast recordings (.cast files) | Workbench with 4 capsule states, recording catalog | No visual plate; workbench is text-heavy |
| OmniRoute | SVG topology diagram, legend | Topology plate with mobile fallback | No hero image; plate is diagram-only |
| Physical (GMK Arch) | Transparent PNG hero | None | No metrics display, no visual depth |
| Physical (WITF) | 2 JPEG heroes, layered-image treatment | Parallax shadow layer | Metrics exist but not prominently displayed |
| Substrate | SVG boundary diagram | Systems plate | No hero; diagram-only |
| phenotype-omlx | None | Experiment note layout | No visual assets |
| All compact/archive | None | Text cards | No visual treatment |

### 0.4 CSS Files Not Used by Active App

These files exist in `styles/` but are only loaded by `main.css` (legacy dark system):

| File | Lines | Purpose | Disposition |
|---|---|---|---|
| `hero.css` | 175 | Fighter-card frame for legacy overview | Not modified in this pass |
| `radar.css` | 120 | Radar chart for phenotype view | Not modified in this pass |
| `timeline.css` | 117 | Experience timeline for legacy views | Not modified in this pass |
| `cards.css` | 339 | Card/list/panel primitives for dark system | Not modified in this pass |
| `main.css` | 409 | Dark system entry, imports above files | Not modified in this pass |

---

## 1. Direction

**Hybrid: clean confidence + restrained technical density.**

The shared shell is a composed frame — light neutral base, deliberate spacing scale, high-contrast headings — into which authored visual objects are inserted. Authored plates carry all visual energy; the shell never competes. Subtle structure lines, tight grids, and monospace accents appear where density serves legibility, not decoration.

The design must feel like a single coherent site across all routes, not a collection of unrelated project pages glued together.

---

## 2. Shell System

### 2.1 Token Additions

These tokens are additions to the existing `tokens.css` system. They do not replace or override existing definitions.

```css
/* Family accent colors — engineering lens (default) */
--family-netweave: #3f8795;       /* arch-500, cool teal */
--family-sharecli: #c76a3a;       /* warm terracotta */
--family-omniroute: #457b9d;      /* steel blue */
--family-physical: #b8962e;       /* warm gold */
--family-substrate: #5a7a6e;      /* sage */
--family-omlx: #7a6aad;           /* muted violet */

/* Family accent colors — product lens (shifted warmer) */
--family-netweave-product: #4ecdc4;
--family-sharecli-product: #e07a5f;
--family-omniroute-product: #577590;
--family-physical-product: #daa520;
--family-substrate-product: #6a8f7e;
--family-omlx-product: #9a8acd;

/* Surfaces — additions */
--surface-inset: #eae8e4;

/* Structure line — left-edge content frame */
--structure-line: 1px solid var(--precision-rule);
```

**Lens accent mapping** — the existing `--accent` token shifts based on `data-lens` on `<html>`:

| Lens | `--accent` value | Use |
|---|---|---|
| engineering | `--arch-500` (#3f8795) | Nav active, focus ring, global interaction |
| product | `--olive-500` (#737c4c) | Nav active, focus ring, global interaction |

The global accent (teal/arch-500) always governs the construction gate, keyboard focus, and the shared navigation regardless of lens.

### 2.2 Layout Structure

Add a single vertical rule at the left edge of `#view-root`:

```css
#view-root {
  border-left: var(--structure-line);
  padding-left: var(--gutter);
}
```

This is the one "technical density" element that frames the content column and makes the shell feel composed.

### 2.3 Header

No structural changes. Current three-column grid (identity, nav, tools) is already instrument-grade. Only:

- Ensure the lens-control pressed state uses the lens-scoped `--accent` value (already the case via `--arch-500` / `--olive-500` in tokens).
- On mobile (<=560px), keep the current column-reverse tool layout.

### 2.4 Footer

Tighten spacing. Use `--ink-muted` consistently. No new visual treatment.

---

## 3. Accent Model

### 3.1 Per-Family Identity

Each project family has a fixed hue that appears in its cards, detail pages, and plates. The hue shifts temperature with the active lens but never changes family.

| Family | Engineering hue | Product hue | CSS variable (engineering) | CSS variable (product) |
|---|---|---|---|---|
| NetWeave | Cool teal (#3f8795) | Warm teal (#4ecdc4) | `--family-netweave` | `--family-netweave-product` |
| ShareCLI | Terracotta (#c76a3a) | Warm orange (#e07a5f) | `--family-sharecli` | `--family-sharecli-product` |
| OmniRoute | Steel blue (#457b9d) | Warm blue (#577590) | `--family-omniroute` | `--family-omniroute-product` |
| Physical products | Warm gold (#b8962e) | Bright gold (#daa520) | `--family-physical` | `--family-physical-product` |
| Substrate | Sage (#5a7a6e) | Warm sage (#6a8f7e) | `--family-substrate` | `--family-substrate-product` |
| phenotype-omlx | Muted violet (#7a6aad) | Warm violet (#9a8acd) | `--family-omlx` | `--family-omlx-product` |

### 3.2 Application Rules

Family accent appears as:

- **Card left border** (3px solid, thickens to 5px on hover).
- **Category badge** background at 12% opacity with full-color text.
- **Detail page section heading underline** (replacing `--precision-rule` on featured project pages).
- **Plate border** for systems/physical/experiment types.
- **Workbench tab active state** background for NetWeave and ShareCLI.

Family accent never appears as:

- Body text color.
- Large surface background fill.
- Construction gate chrome (uses global teal only).

### 3.3 Family Assignment Map

Project slug to family:

| Slug | Family |
|---|---|
| `netweave` | NetWeave |
| `sharecli` | ShareCLI |
| `omniroute` | OmniRoute |
| `gmk-arch`, `witf`, `dss-cipher` | Physical products |
| `substrate` | Substrate |
| `phenotype-omlx` | phenotype-omlx |
| All others | No family accent (use base shell styling) |

---

## 4. Featured Card Component

### 4.1 Purpose

Replace the current text-only featured project cards in the work catalog with visually authored cards that include an image preview, family accent, and category badge.

### 4.2 Structure

```
┌─────────────────────────────────────────────┐
│ [category badge]                   [status] │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │     Visual preview (image or plate)   │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Title                                      │
│  Summary (3 lines max, line-clamp)         │
│                                             │
│  [technologies as mono pills]              │
└─────────────────────────────────────────────┘
```

### 4.3 Visual Treatment

- **Container:** `background: var(--surface-raised); border: 1px solid var(--rule); border-radius: var(--radius-panel);`
- **Left border:** 3px solid in family accent color. On hover, thickens to 5px.
- **Image area:** `aspect-ratio: 16/9; overflow: hidden; border-radius: var(--radius-control) var(--radius-control) 0 0;` Contains the project's primary visual (hero image, plate screenshot, or topology diagram rendered to image).
- **Category badge:** Positioned top-left over the image. `background: color-mix(in oklch, var(--family-accent) 12%, transparent); color: var(--family-accent); font: 600 0.7rem/1 var(--font-meta); padding: 0.35rem 0.6rem; border-radius: var(--radius-control);`
- **Status:** Top-right, `font: 600 0.7rem/1 var(--font-meta); color: var(--ink-muted);`
- **Title:** `font: 650 clamp(1.05rem, 2vw, 1.45rem)/1.08 var(--font-display); color: var(--ink);`
- **Summary:** `color: var(--ink-muted); line-height: 1.55; max-width: 38rem; display: -webkit-box; -webkit-line-clamp: 3;`
- **Technologies:** Flex row of mono pills. `font: 600 0.65rem/1 var(--font-meta); color: var(--ink-muted); background: var(--surface-inset); padding: 0.25rem 0.5rem; border-radius: var(--radius-control);`

### 4.4 Hover / Focus

- **Hover:** Left border thickens to 5px. Title gets `text-decoration: underline; text-decoration-color: var(--accent-global);`. Image gets `transform: scale(1.02); transition: transform 200ms ease;`.
- **Focus:** `box-shadow: var(--focus-ring);` on the card anchor.
- **Reduced motion:** `transform: none; transition: none;`

### 4.5 Image Selection Per Project

| Project | Card image source | Notes |
|---|---|---|
| NetWeave | `desktop-01-v3.webp` | Existing v3 asset |
| ShareCLI | Workbench state screenshot or topology render | New asset needed — capture from workbench |
| OmniRoute | Topology SVG rendered to image or existing plate screenshot | New asset needed |
| GMK Arch | `hero.png` | Existing asset, may need crop to 16:9 |
| WITF | `hero-01.jpg` | Existing asset, may need crop to 16:9 |
| Substrate | Systems plate SVG rendered to image | New asset needed |
| phenotype-omlx | Experiment note rendered to image | New asset needed |

### 4.6 Responsive

| Width | Grid columns | Card padding | Image height |
|---|---|---|---|
| >= 1080px | 2 columns (`repeat(auto-fit, minmax(20rem, 1fr))`) | 1.5rem | 12rem |
| 761–1079px | 2 columns | 1.25rem | 10rem |
| <= 760px | 1 column | 1rem | 8rem |

### 4.7 Accessibility

- Card is a single `<a>` element wrapping all content.
- `aria-label` includes title, category, and status.
- Image has meaningful alt text from `presentation.alt`.
- `line-clamp` is visual only; full text in DOM.
- No animation on appearance.

---

## 5. Route-by-Route Visual Requirements

### 5.1 Homepage (`/`)

**Current state:** Identity block + opening WITF physical plate + featured artifact sequence.

**Changes:**

1. **Identity block:** No structural changes. Keep the existing heading, intro, reading note, and primary links. Only apply lens-scoped accent to the "Read Engineering" / "Read Product" link hover state.

2. **Opening artifact:** The WITF physical plate is already the homepage anchor. Apply the physical-product family accent as the plate border. Keep the layered-image treatment.

3. **Featured sequence:** The existing artifact sequence (`home-artifact-sequence`) renders one artifact card per featured project. Each artifact already has its type-specific plate. Add:
   - Family accent border-left to each artifact card.
   - Category badge overlay on the artifact media area.
   - Ensure all artifact cards have consistent vertical rhythm.

4. **Structure line:** The new left-edge rule on `#view-root` frames the homepage content.

### 5.2 Work Catalog (`/work`)

**Current state:** Filter controls + three-tier catalog (featured text cards / compact specimen list / archive drawer).

**Changes:**

1. **Featured group:** Replace text-only cards with the new Featured Card Component (Section 4). Each featured project gets an image preview, family accent, category badge, title, summary, and technology pills.

2. **Compact group:** No structural changes. Keep existing specimen-list format. Optionally add a subtle family accent left-border (1px) to each specimen item for visual coherence.

3. **Archive group:** No changes.

4. **Filter controls:** Already functional. Only update the active filter pressed state to use the lens-scoped accent color.

### 5.3 NetWeave Detail (`/work/netweave`)

**Current state:** Case study with SVG diagram + workbench + v3 image gallery + evidence labels.

**Changes:**

1. **Hero plate:** Add a composed hero above the case study content: v3 desktop-01 image on the right, title + summary + NetWeave family accent bar on the left. Responsive: single-column on mobile.

2. **Workbench:** Apply NetWeave family accent to tab active states and state borders. Tighten panel spacing to match shared shell rhythm.

3. **Evidence panel:** Add a horizontal scrollable strip below the workbench showing the three v3 states (desktop-01, desktop-02, desktop-03) with labels. Each image is 16:9, lazy-loaded.

4. **Metrics:** Render the existing `metrics` data in a grid below the hero plate.

5. **Reduced motion:** Field animation respects `prefers-reduced-motion`. Workbench tabs are instant.

### 5.4 ShareCLI Detail (`/work/sharecli`)

**Current state:** Case study + workbench with capsule states + recording catalog.

**Changes:**

1. **Hero plate:** Add a composed hero: workbench capsule screenshot on the right, title + summary + ShareCLI family accent bar on the left.

2. **Workbench:** Apply ShareCLI family accent to active capsule states and recording borders. The workbench already has four bounded states; make the visual distinction between illustrative state and recorded evidence clearer with a subtle background tint difference.

3. **Recording catalog:** Apply ShareCLI family accent to recording card borders. Ensure cast download links remain functional.

4. **Metrics:** Render existing metrics in a grid if available.

### 5.5 OmniRoute Detail (`/work/omniroute`)

**Current state:** Topology plate with SVG diagram, legend, mobile fallback, and external-ownership wording.

**Changes:**

1. **Hero plate:** Add a composed hero: topology diagram on the right, title + summary + OmniRoute family accent bar on the left.

2. **Topology plate:** Apply OmniRoute family accent to the plate border and legend markers. Ensure mobile HTML fallback remains complete.

3. **External ownership:** Keep all upstream attribution and ownership wording unchanged.

4. **Metrics:** Render existing metrics in a grid.

### 5.6 GMK Arch Detail (`/work/gmk-arch`)

**Current state:** Case study with physical plate (transparent hero.png).

**Changes:**

1. **Hero plate:** Composed layout: hero.png on the left, title + summary + gold family accent bar on the right. Metrics grid (4,900 sold, 10-region distribution, kitting coverage).

2. **Case study sections:** Apply gold family accent to section heading underlines.

3. **Evidence:** Keep existing evidence labels and provenance boundaries.

### 5.7 WITF Detail (`/work/witf`)

**Current state:** Case study with physical plate (hero-01.jpg, layered-image with shadow).

**Changes:**

1. **Hero plate:** Composed layout: hero-01 primary image, hero-02 as secondary thumbnail. Gold family accent bar. Metrics grid (50-unit reset, price move, accessory refund).

2. **Case study sections:** Gold family accent on section headings.

3. **Evidence:** Keep provenance boundaries.

### 5.8 Substrate Detail (`/work/substrate`)

**Current state:** Systems plate with SVG boundary diagram.

**Changes:**

1. **Hero plate:** Composed layout: systems plate SVG on the right, title + summary + substrate family accent bar on the left.

2. **Systems plate:** Apply substrate family accent to node borders and edge lines.

### 5.9 phenotype-omlx Detail (`/work/phenotype-omlx`)

**Current state:** Experiment note layout.

**Changes:**

1. **Hero plate:** Composed layout: experiment note on the right, title + summary + omlx family accent bar on the left.

2. **Experiment rows:** Apply omlx family accent to row markers.

### 5.10 Compact/Archive Projects

All projects without dedicated visual treatment receive:
- Family accent left-border on their card (if they belong to a family).
- Standard text card treatment otherwise.
- No new image assets required.

### 5.11 Resume (`/resume`)

**Current state:** Two-card grid linking to engineering/product readings.

**Changes:**

1. Apply consistent card styling matching the shared shell (surface-raised background, rule border, radius-panel).
2. Add a brief visual separator between the two cards.
3. No family accent (this is a meta-route).

### 5.12 Contact (`/contact`)

**Current state:** Email/GitHub/LinkedIn links.

**Changes:**

1. Apply consistent card styling to the link group.
2. Add the global teal accent to link hover states.
3. No family accent (this is a meta-route).

### 5.13 Blog Index (`/blog`)

**Current state:** Post cards with tags.

**Changes:**

1. Ensure blog card styling is consistent with the shared shell (currently uses `--color-border` and `--color-surface-1` fallbacks — these should resolve to `--rule` and `--surface-raised`).
2. Add a subtle left-border accent (global teal) to post cards.

### 5.14 Blog Post (`/blog/{slug}`)

**Current state:** Article with header, body blocks, footer.

**Changes:**

1. Ensure article typography is consistent with the shared shell.
2. No structural changes.

### 5.15 404 (`not-found`)

**Current state:** Minimal not-found message.

**Changes:**

1. Apply consistent shell styling.
2. Add a link back to the work index.

---

## 6. Interaction and Motion System

### 6.1 Transitions

| Element | Property | Duration | Easing |
|---|---|---|---|
| Card hover border | border-left-width | 120ms | ease |
| Card hover image | transform | 200ms | ease |
| Card focus ring | box-shadow | 0ms | instant |
| Filter button press | background, color | 120ms | ease |
| Lens control press | background, color | 120ms | ease |
| View transition | none | instant | — |

### 6.2 Reduced Motion

When `prefers-reduced-motion: reduce`:
- All transitions set to `0.01ms`.
- All animations set to `0.01ms`.
- Card image `transform: none`.
- NetWeave field animation paused.
- Workbench state changes instant.

### 6.3 Keyboard Navigation

- All interactive elements have visible focus rings (`--focus-ring`).
- Tab order follows DOM order.
- Workbench tabs use `role="tablist"` / `role="tab"` / `role="tabpanel"`.
- Filter buttons use `aria-pressed`.
- Card anchors are reachable via Tab.

---

## 7. Responsive Behavior

### 7.1 Breakpoints

| Name | Width | Grid behavior |
|---|---|---|
| Mobile | <= 760px | Single column, stacked plates, full-width cards |
| Tablet | 761–1079px | Two-column cards, 40/60 or 50/50 plate splits |
| Desktop | >= 1080px | Two-column cards, 45/55 plate splits, generous gutter |

### 7.2 Plate Responsive

- **Mobile:** Plates stack vertically (image above text). Workbench tabs wrap.
- **Tablet:** Plates use side-by-side split. Workbench tabs fit in one row.
- **Desktop:** Plates use 45/55 split with generous gutter. Workbench in full layout.

### 7.3 Card Responsive

Cards use `repeat(auto-fit, minmax(20rem, 1fr))` within the `--measure` constraint. On mobile, `minmax` collapses to single column.

---

## 8. Asset Production Requirements

### 8.1 Existing Assets (No Production Needed)

| Asset | Location | Use |
|---|---|---|
| NetWeave v3 desktop/mobile | `public/projects/netweave/desktop-*-v3.webp` | Hero plate, evidence strip, card image |
| GMK Arch hero | `public/projects/gmk-arch/hero.png` | Hero plate, card image |
| WITF heroes | `public/projects/witf/hero-01.jpg`, `hero-02.jpg` | Hero plate, card image |
| ShareCLI casts | `public/projects/sharecli/recordings/*.cast` | Recording downloads |
| Substrate SVG | Generated by `systems-plate.js` | Runtime rendering |
| OmniRoute SVG | Generated by `omniroute-topology.js` | Runtime rendering |

### 8.2 New Assets Required

| Asset | Source | Output | Acceptance |
|---|---|---|---|
| ShareCLI card image | Capture from workbench or compose from capsule states | WebP, 1600×900, 16:9 | Visual review at 390px and 1440px |
| OmniRoute card image | Render topology SVG to image | WebP, 1600×1000, 16:9 | Visual review |
| Substrate card image | Render systems plate SVG to image | WebP, 1600×1100, 16:9 | Visual review |
| phenotype-omlx card image | Render experiment note to image | WebP, 1400×980, 16:9 | Visual review |
| NetWeave hero plate composition | Composite v3 desktop-01 with title/summary overlay or separate layout | HTML/CSS composition, not rasterized | Responsive test |

### 8.3 Asset Production Pipeline

For each new asset:
1. Identify source (existing image, SVG render, or Blender export).
2. Produce derivative with documented tool, version, and command.
3. Record SHA-256, dimensions, and alt text in `FEATURED_PRESENTATIONS`.
4. Verify at 390px and 1440px widths.
5. Pass publication/privacy audit (no private paths, no Finder metadata).

### 8.4 3D / Blender Content

This spec does not require new Blender exports or 3D model production. The existing v3 WebPs and hero images are sufficient for the first iteration. A future pass may add:
- GLB/GLTF models for physical products (using `model-slot.js`).
- Animated NetWeave scenes (using Blender pipeline in `asset-sources/`).
- Interactive OmniRoute topology (using canvas or WebGL).

These are explicitly out of scope for this pass.

---

## 9. Evidence and Provenance Constraints

All visual changes must:

1. Use existing public assets or newly produced derivatives with documented provenance.
2. Maintain SHA-256 and dimension records for all deployed assets.
3. Pass the publication/privacy audit (no private paths, no Finder metadata).
4. Include alt text for all new `<img>` elements.
5. Preserve reduced-motion and no-JavaScript fallbacks.
6. Preserve all existing evidence labels, ownership boundaries, and upstream attribution.
7. Not claim measured telemetry, production scale, or deployment status beyond what the evidence ledger records.

---

## 10. What This Pass Does NOT Do

- No structural changes to the construction gate (it already uses global teal).
- No removal or modification of the legacy dark system files.
- No new 3D models, GLB/GLTF assets, or Blender exports.
- No changes to the blog post template structure.
- No DNS, deployment, or custom-domain changes.
- No changes to the data model (`projects.js`, `phenotype.js`, `posts.js`).
- No new routes or route structure changes.
- No backend or API changes.

---

## 11. Implementation Sequence

| Phase | Scope | Dependencies |
|---|---|---|
| 1. Token and shell | Add family accent tokens, structure line, lens scoping | None |
| 2. Card component | Build featured card component with image, accent, badge | Phase 1 |
| 3. Work catalog | Integrate cards into featured group | Phase 2 |
| 4. Family plates | Apply accent to all existing artifact/plate types | Phase 1 |
| 5. NetWeave depth | Hero plate, evidence strip, workbench accent | Phase 4 |
| 6. Physical depth | GMK/WITF hero plates, metrics grids | Phase 4 |
| 7. ShareCLI depth | Hero plate, workbench accent, recording accent | Phase 4 |
| 8. OmniRoute depth | Hero plate, topology accent | Phase 4 |
| 9. Remaining routes | Substrate, omlx, resume, contact, blog, 404 | Phase 1 |
| 10. Interaction | Hover, focus, transitions, reduced motion | Phase 2 |
| 11. Asset production | New card images for ShareCLI, OmniRoute, Substrate, omlx | Phase 2 |
| 12. Responsive | Verify all breakpoints | All phases |
| 13. Accessibility | Focus rings, keyboard nav, screen reader, a11y audit | All phases |
| 14. Testing | Unit tests, browser tests, publication audit | All phases |

---

## 12. Acceptance Criteria

### Visual
- [ ] All routes render with consistent shell treatment at 390px, 760px, 1080px, 1440px.
- [ ] Family accent colors shift correctly between engineering and product lenses.
- [ ] Featured work catalog cards render with image previews, accent borders, and category badges.
- [ ] NetWeave detail has a composed hero plate with v3 images.
- [ ] GMK Arch and WITF details have composed hero plates with gold accent.
- [ ] ShareCLI detail has a hero plate with orange accent.
- [ ] OmniRoute detail has a hero plate with blue accent.
- [ ] Substrate and phenotype-omlx details have composed hero plates.
- [ ] Resume and contact routes have consistent shell treatment.
- [ ] Blog index and post routes are visually consistent.

### Technical
- [ ] All existing unit tests pass.
- [ ] All existing browser acceptance tests pass.
- [ ] Publication/privacy audit remains clean.
- [ ] No new files exceed 350 lines (target) or 500 lines (hard limit).
- [ ] No private paths, secrets, or Finder metadata in staged output.

### Accessibility
- [ ] All interactive elements have visible focus rings.
- [ ] Keyboard navigation works across all routes.
- [ ] Screen reader announces card content correctly.
- [ ] Reduced-motion preference is respected.
- [ ] No-JavaScript fallback remains functional.

### Asset
- [ ] All new card images have SHA-256, dimensions, and alt text recorded.
- [ ] Asset production uses documented tools and commands.
- [ ] No internal filenames exposed in public labels.
