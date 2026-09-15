# Portfolio Next Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Each gate is independently testable.

**Goal:** Move from the verified public release to a visually stronger, evidence-grounded portfolio and reconciled private career package without mixing public and private data.

**Architecture:** Keep `KooshaPari/KooshaPari` as the allowlisted public publication boundary. Keep LinkedIn exports, ResVault evidence, DOCX originals, transcripts, and PMP source material private. Every change flows through evidence -> isolated implementation -> local build/browser/a11y gate -> explicit promotion.

**Tech Stack:** Static HTML/ES modules, Vercel staging, Node/Vercel build, Playwright, axe, Blender/WebP/FFmpeg, private ResVault Markdown evidence, DOCX source preservation.

---

## Gate 1: LinkedIn selector-correct evidence (private)

**Files:**
- Create: `/Users/kooshapari/Documents/ResVault/.researchledger/linkedin-pass1/live-headline-verification-2026-09-10.md`
- Read: `/Users/kooshapari/.forge/servers/linkedin-mcp/src/linkedin.ts`
- Preserve: existing `verify-profile.md`, `final-report.md`, and section reports.

- [ ] Write a focused read-only probe that identifies the authored headline element rather than the pronouns chip.
- [ ] Run it with `LINKEDIN_PROFILE_SLUG=kooshapari` against the authenticated saved session.
- [ ] Record selector, rendered text, timestamp, URL, exit status, and screenshot/hash if produced.
- [ ] Do not update headline, About, skills, projects, posts, connections, or messages.

## Gate 2: Canonical engineering/management DOCX reconciliation (private)

**Files:**
- Read only: canonical current engineering and management DOCX files and `/Users/kooshapari/Documents/ResVault/.researchledger/linkedin-pass1/live-reconciliation-2026-09-10.md`.
- Create: additive reconciled DOCX variants plus a Markdown fact ledger outside the public repo.

- [ ] Inventory the canonical engineering and management DOCX set already present in `/Users/kooshapari/Downloads/`, including structure, headings, tables, hyperlinks, dates, and claims before editing.
- [ ] Build a claim matrix with source, current status, confidence, and target resume variant.
- [ ] Apply the current three-team/~15-contributor wording; retain older five-team/~25 wording only as historical evidence.
- [ ] Keep originals immutable; render every output to PDF and visually inspect every page.
- [ ] Stop on conflicting dates/metrics; record the conflict instead of guessing.

## Gate 3: P0 visual slice - NetWeave

**Files:**
- Modify in isolated branch: `asset-sources/netweave-local-rules-v1/scene.blend`, `build_scene.py`, `manifest.json`, `scripts/media/netweave-field.js` only as needed.
- Add tests: `tests/netweave-presentation.test.js` and browser assertions in `tests/browser/acceptance.spec.js`.

- [ ] Start with a written art brief: composition, palette, focal hierarchy, desktop/mobile crops, and claim boundary.
- [ ] Export deterministic desktop/mobile derivatives with Blender and cwebp; record source/tool/version/hash/dimensions.
- [ ] Test static HTML, keyboard controls, no-JS fallback, reduced motion, 390px, 768px, and 1440px.
- [ ] Require fresh screenshots and a human visual pass before promotion.

## Gate 4: Shared visual language for diagrams and OmniRoute

**Files:** `scripts/media/diagrams.js`, `systems-plate.js`, `omniroute-topology.js`, `artifact.js`, relevant case-study CSS/tests.

- [ ] Define one token set for nodes, edges, labels, status, and failure branches.
- [ ] Keep conceptual diagrams explicitly conceptual; never imply live telemetry.
- [ ] Preserve the mobile semantic HTML fallback and keyboard/readers behavior.
- [ ] Add only restrained motion behind the reduced-motion preference.
- [ ] Run the existing full gate: `npm run verify` (build, unit, check, browser).

## Gate 5: Public release hygiene

- [ ] Review `git diff --cached --check`, public allowlist, `data/projects.js`, and generated output for private paths, secrets, raw exports, or internal filesystem references.
- [ ] Build from the canonical public checkout, not the non-Git working copy.
- [ ] Run unit, browser, axe, mobile overflow, no-JS, and download/hash checks.
- [ ] Push only the reviewed commit; connect the existing Vercel project only if linkage drifts.
- [ ] Deploy with `vercel deploy --prod --yes --scope koosha-paridehpours-projects`; record deployment ID and preserve rollback.

## Gate 6: Broader PMP/repository program

- [ ] Reconcile the master plan, repository inventory, Git custody, and LinkedIn evidence into one private traceability ledger; treat the downloaded Anduril chat as background source only, not a resume-variant workstream.
- [ ] Classify every item `VERIFIED`, `HISTORICAL`, `UNKNOWN`, or `BLOCKED` with exact evidence and next command.
- [ ] Treat each repository as its own owner/branch/remote gate; do not infer authority from directory presence.
- [ ] Advance only one bounded implementation lane at a time after the portfolio gates above are green.
