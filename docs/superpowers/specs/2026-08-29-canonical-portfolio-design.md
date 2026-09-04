# Canonical Portfolio Static-SPA Design

**Goal:** Evolve the existing `koosha-phenotype` static SPA into a coherent canonical portfolio preview for `kooshapari.com`, serving Engineering and Product lenses from shared project records.

**Architecture:** Preserve the vanilla ES-module/static architecture. Introduce a typed-by-convention project data module, a shared renderer for cards/case studies, and hash-based route views for `/`, `/engineering`, `/product`, `/work`, `/resume`, and `/contact` compatibility without adding a backend or framework migration.

**Visual direction:** Replace persona/radar-dashboard framing with restrained editorial sections. Retain the existing dark-capable tokens and responsive CSS foundations, use blue for engineering and amber for product emphasis, and reserve lime for combined identity/proof accents.

## Content and routes

- Homepage: concise positioning, four proof points, selected work, lens CTAs.
- Engineering: ShareCLI, Substrate, phenotype-omlx, BytePort, and Tracera first.
- Product: GMK Arch and WITF first, with relevant product/program evidence.
- Work: curated filterable index; no 50+ repository dump.
- Case studies: GMK Arch, WITF, ShareCLI, Substrate, and phenotype-omlx full entries; compact entries for BytePort, Tracera, DSS Cipher, and attributed forks; archive entries for MCPForge, ForgeCode, and Frostify.
- Resume/contact: concise HTML summaries and external/download links when canonical artifacts exist.

## Data model

Each project record contains identity, status, lens priorities, summary, problem/context, decisions, architecture, validation, outcomes, metrics with evidence class, technologies, links, provenance, and gallery assets. Engineering/Product views consume the same record and change ordering/emphasis only.

## Evidence and assets

Use `web-migration/EVIDENCE_LEDGER.md` for claims. Preserve approximate qualifiers for canonical user facts. Use only the 85 retained primary assets listed in `web-migration/assets/crawl-index.tsv`; do not render responsive duplicates as separate items. Every rendered image gets authored alt text in the content record.

## Interaction and accessibility

Hash navigation updates active view and scroll position. Filter controls are keyboard reachable, have visible focus, and expose active state. Images reserve dimensions to limit layout shift. Respect `prefers-reduced-motion`; no heavy animation dependency.

## Verification

Run the static preview locally. Verify all canonical views, filters, internal links, image loading, keyboard navigation, responsive layouts, canonical metadata, and the existing acceptance checklist before creating the implementation handoff. Do not change DNS or activate redirects.

