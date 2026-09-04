# Canonical Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the existing static SPA into a verified canonical portfolio preview with shared Engineering/Product project records.

**Architecture:** Keep the vanilla ES-module app. Replace persona tabs with hash-routed portfolio views, add a structured project data module, and render curated cards/case studies from shared records. Preserve existing CSS tokens and add editorial portfolio components without a framework or backend.

**Tech Stack:** HTML, CSS, vanilla ES modules, local archived images, browser-based static preview.

---

### Task 1: Add shared project records

**Files:**
- Create: `koosha-phenotype/data/projects.js`
- Reference: `web-migration/content/content-model.md`, `web-migration/EVIDENCE_LEDGER.md`

- [ ] Define records for GMK Arch, WITF, ShareCLI, Substrate, phenotype-omlx, BytePort, Tracera, DSS Cipher, cliproxyapi-plusplus, agentapi-plusplus, MCPForge, ForgeCode, and Frostify.
- [ ] Include status, categories, lens priorities, summaries, metrics with evidence class, technologies, links, provenance, and local gallery paths.
- [ ] Keep canonical user facts qualified and forks attributed.

### Task 2: Replace shell navigation and routing

**Files:**
- Modify: `koosha-phenotype/index.html`
- Modify: `koosha-phenotype/scripts/main.js`
- Modify: `koosha-phenotype/styles/main.css`

- [ ] Replace persona tab labels with Home, Engineering, Product, Work, Resume, and Contact.
- [ ] Map hash routes to canonical views while retaining a useful 404/fallback.
- [ ] Add accessible active-tab semantics, focus styles, and responsive navigation.

### Task 3: Implement homepage and lens views

**Files:**
- Modify: `koosha-phenotype/scripts/main.js`
- Modify: `koosha-phenotype/styles/main.css`
- Modify: `koosha-phenotype/styles/cards.css`

- [ ] Render concise hero positioning and four proof points.
- [ ] Render selected work cards from shared records.
- [ ] Render Engineering and Product views with different ordering/emphasis over the same records.
- [ ] Add curated Work filters for Engineering, Product, Systems, AI/ML, Developer Tools, Cloud, Physical Product, and Historical.

### Task 4: Add case-study views and local assets

**Files:**
- Modify: `koosha-phenotype/scripts/main.js`
- Create: `koosha-phenotype/public/projects/` asset links or copy manifest-approved assets
- Modify: `koosha-phenotype/styles/hero.css`

- [ ] Add full case-study views for GMK Arch, WITF, ShareCLI, Substrate, and phenotype-omlx.
- [ ] Add compact entries for BytePort, Tracera, DSS Cipher, and attributed forks.
- [ ] Add archive entries for MCPForge, ForgeCode, and Frostify.
- [ ] Use authored alt text and dimensions for every rendered image.

### Task 5: Add Resume, Contact, SEO, and tracking-safe metadata

**Files:**
- Modify: `koosha-phenotype/index.html`
- Modify: `koosha-phenotype/scripts/main.js`
- Modify: `koosha-phenotype/styles/main.css`

- [ ] Add Resume and Contact views with HTML summaries and links only where canonical artifacts exist.
- [ ] Add canonical/meta/Open Graph tags appropriate for the static preview.
- [ ] Keep analytics optional and non-blocking; do not add a backend.

### Task 6: Verify preview and produce implementation handoff

**Files:**
- Create: `koosha-phenotype/IMPLEMENTATION_STATUS.md`
- Create: `koosha-phenotype/portfolio-implementation-handoff.md`
- Reference: `web-migration/verification/acceptance-tests.md`

- [ ] Run a local static server and verify every canonical route, filter, image, external link, and fallback.
- [ ] Check keyboard navigation, responsive layouts, reduced motion, image dimensions, and no fabricated claims.
- [ ] Capture required screenshots where browser tooling is available.
- [ ] Record preview URL, commit SHA if applicable, routes, screenshots, performance/accessibility results, known issues, and remaining DNS/redirect gates.
