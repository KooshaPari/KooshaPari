# Technical Atelier Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the functional but generic portfolio SPA with the approved WITF-led Technical Atelier experience while preserving evidence, routes, accessibility, and migration safeguards.

**Architecture:** Keep the static ES-module deployment, but split the monolithic renderer into route, lens, shell, view, media, and case-study modules. Project records remain canonical. Rich media progressively enhances a complete static experience and never blocks navigation or content.

**Tech Stack:** HTML5, ES modules, CSS custom properties/Grid, SVG, optional Canvas, Node built-in test runner, Playwright CLI, Vercel static output.

---

## Scope and safety

- Implementation ownership is limited to `koosha-phenotype/`.
- `web-migration/` is read-only evidence authority during implementation.
- Source repositories such as ShareCLI, Tracera, phenotype-omlx, and cliproxyapi-plusplus are read-only evidence providers.
- Do not change DNS, production domains, redirects, or legacy-site state.
- Preserve the currently working preview until the redesigned build passes local screenshot review.
- `koosha-phenotype` has no `.git`; commit steps are recorded as intended checkpoints but must be skipped until the directory is attached to a real Git worktree. Every task must instead update `IMPLEMENTATION_STATUS.md` and record verification output.

## Target file structure

```text
koosha-phenotype/
  index.html
  package.json
  vercel.json
  data/
    projects.js
  scripts/
    app.js
    router.js
    lens-state.js
    work-filters.js
    components/
      dom.js
      shell.js
      project-index.js
      artifact.js
      evidence.js
    views/
      home.js
      work.js
      project-detail.js
      resume.js
      contact.js
      not-found.js
    media/
      layered-image.js
      diagrams.js
      netweave-field.js
      model-slot.js
  styles/
    tokens.css
    base.css
    shell.css
    artifacts.css
    case-studies.css
    responsive.css
  tests/
    lens-state.test.js
    work-filters.test.js
    router.test.js
    project-records.test.js
    build-output.test.js
  output/
    technical-atelier-review/
```

## Task 1: Establish the test and build contract

**Files:**
- Create: `package.json`
- Create: `tests/project-records.test.js`
- Create: `tests/build-output.test.js`
- Modify: `IMPLEMENTATION_STATUS.md`

- [ ] **Step 1: Write the project-record failing test**

Create `tests/project-records.test.js` using Node's built-in test runner. Import `PROJECTS`, assert unique slugs, require every project to expose `title`, `summary`, `status`, `category`, `lens`, and `evidence`, and assert that fork entries expose `provenance`.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { PROJECTS } from '../data/projects.js';

test('portfolio records have unique slugs and required evidence fields', () => {
  const slugs = PROJECTS.map((project) => project.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const project of PROJECTS) {
    for (const key of ['title', 'summary', 'status', 'category', 'lens', 'evidence']) {
      assert.ok(project[key], `${project.slug} missing ${key}`);
    }
  }
});

test('fork entries preserve upstream provenance', () => {
  for (const slug of ['phenotype-omlx', 'cliproxyapi-plusplus', 'agentapi-plusplus', 'mcpforge', 'forgecode', 'frostify']) {
    assert.ok(PROJECTS.find((project) => project.slug === slug)?.provenance, `${slug} missing provenance`);
  }
});
```

- [ ] **Step 2: Run the test and record the baseline**

Run: `node --test tests/project-records.test.js`

Expected: PASS for unique slugs; any missing field or provenance must fail with the project slug named.

- [ ] **Step 3: Add the package contract**

Create `package.json`:

```json
{
  "name": "koosha-technical-atelier",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.js",
    "check": "node --check scripts/app.js && node --check data/projects.js",
    "preview": "python3 -m http.server 4173"
  }
}
```

- [ ] **Step 4: Write the Vercel-output regression test**

Create `tests/build-output.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('Vercel static output includes the SPA entrypoint and core assets', () => {
  for (const file of ['index.html', 'scripts/app.js', 'styles/base.css']) {
    assert.ok(existsSync(`.vercel/output/static/${file}`), `missing ${file} from Vercel output`);
  }
});
```

- [ ] **Step 5: Verify the known red state before the new modules exist**

Run: `npm test`

Expected: `build-output.test.js` FAILS because `scripts/app.js` and `styles/base.css` do not exist yet. This is the intentional redesign build contract.

- [ ] **Step 6: Record the checkpoint**

Append to `IMPLEMENTATION_STATUS.md`: `Technical Atelier Task 1: test/build contract established; build-output test intentionally red pending module extraction.`

## Task 2: Extract router, lens state, filtering, and DOM helpers

**Files:**
- Create: `scripts/router.js`
- Create: `scripts/lens-state.js`
- Create: `scripts/work-filters.js`
- Create: `scripts/components/dom.js`
- Create: `tests/router.test.js`
- Create: `tests/lens-state.test.js`
- Create: `tests/work-filters.test.js`

- [ ] **Step 1: Write failing pure-state tests**

Test route parsing for `home`, `engineering`, `product`, `work`, `resume`, `contact`, and `work/<slug>`. Test that lens state accepts only `engineering` or `product`. Test existing Work filters against representative records.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../scripts/router.js';

test('parseRoute separates project detail slugs', () => {
  assert.deepEqual(parseRoute('#work/sharecli'), { view: 'project', slug: 'sharecli' });
});

test('parseRoute falls back to home for unknown routes', () => {
  assert.deepEqual(parseRoute('#not-real'), { view: 'home' });
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/router.test.js tests/lens-state.test.js tests/work-filters.test.js`

Expected: FAIL with module-not-found errors for the new modules.

- [ ] **Step 3: Implement the pure modules**

`router.js` exports `parseRoute(hash)` and `routeToHash(route)`. `lens-state.js` exports `createLensState(initial)`, returning `get`, `set`, and `subscribe`. `work-filters.js` exports `WORK_FILTERS` and `matchesWorkFilter(project, filter)`. `dom.js` exports `el`, `$`, and `$$` without importing application state.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/router.test.js tests/lens-state.test.js tests/work-filters.test.js`

Expected: all pure-state tests PASS.

- [ ] **Step 5: Record the checkpoint**

Update `IMPLEMENTATION_STATUS.md` with the passing test command and new module boundaries.

## Task 3: Build the Technical Atelier token and base layer

**Files:**
- Create: `styles/tokens.css`
- Create: `styles/base.css`
- Create: `styles/shell.css`
- Modify: `index.html`
- Create: `scripts/components/shell.js`

- [ ] **Step 1: Capture the current shell baseline**

Run the local preview and capture `output/technical-atelier-review/before-shell-1440.png` using Playwright. The screenshot must show the existing pill navigation and metric-card treatment.

- [ ] **Step 2: Implement fixed design tokens**

Define tokens for graphite, warm paper, concrete gray, olive, Arch teal, DSS acid, text hierarchy, rules, 12/8/4-column grids, reading measure, focus ring, and motion durations. Self-host Space Grotesk, Inter, and JetBrains Mono or use the documented system fallbacks without blocking requests.

- [ ] **Step 3: Replace the legacy shell markup**

`index.html` keeps the skip link, `main`, footer, metadata, favicon, and Person schema. Replace the old pill tablist with a shell mount point and load `scripts/app.js`. Load CSS in this order: `tokens.css`, `base.css`, `shell.css`, `artifacts.css`, `case-studies.css`, `responsive.css`.

- [ ] **Step 4: Implement semantic shell rendering**

`shell.js` must render the identity block, literal Work/Resume/Contact routes, an Engineering/Product lens control, and an Index trigger. It accepts callbacks instead of importing router state.

- [ ] **Step 5: Verify the shell**

Run: `node --check scripts/components/shell.js`

Browser checks: skip link reaches `main`; every control is keyboard reachable; focus is visible; no horizontal overflow at 375px.

- [ ] **Step 6: Record the checkpoint**

Capture `after-shell-1440.png` and `after-shell-390.png`, then update `IMPLEMENTATION_STATUS.md`.

## Task 4: Implement the Project Index and application coordinator

**Files:**
- Create: `scripts/app.js`
- Create: `scripts/components/project-index.js`
- Create: `styles/artifacts.css`
- Modify: `index.html`

- [ ] **Step 1: Write the interaction acceptance case**

Document the browser sequence in `VERIFICATION_REPORT.md`: open Index, traverse the first three projects by keyboard, close with Escape, verify focus returns to the trigger, reopen and navigate to `#work/sharecli`.

- [ ] **Step 2: Implement `project-index.js`**

Group shared records into Featured, Systems, AI/ML, Physical Products, Research, Compact, and Archive. Expose `open()`, `close()`, and `render()`. While open, contain focus inside the dialog, close on Escape, restore trigger focus, and keep every project as a real anchor.

- [ ] **Step 3: Implement `app.js`**

Coordinate parsed routes, shared lens state, shell rendering, Index state, view rendering, metadata updates, and hash changes. Do not import legacy persona/radar renderers.

- [ ] **Step 4: Run syntax and unit checks**

Run: `npm test && npm run check`

Expected: route/lens/filter/record tests PASS; build-output remains red until all new CSS modules exist and Vercel build runs.

- [ ] **Step 5: Run the Index browser checks**

Use Playwright at 1440px and 390px. Expected: logical focus order, Escape restoration, no clipped groups, and correct ShareCLI deep link.

- [ ] **Step 6: Record the checkpoint**

Update `IMPLEMENTATION_STATUS.md` and capture Index desktop/mobile screenshots.

## Task 5: Build the WITF-led homepage

**Files:**
- Create: `scripts/views/home.js`
- Create: `scripts/components/artifact.js`
- Create: `scripts/components/evidence.js`
- Modify: `styles/artifacts.css`
- Modify: `data/projects.js`

- [ ] **Step 1: Add authored homepage presentation data**

Extend the WITF, GMK Arch, ShareCLI, Substrate, phenotype-omlx, and NetWeave records with `presentation` fields containing authored alt text, artifact type, lens-specific annotation, and media dimensions. Do not alter evidence classes or metrics.

- [ ] **Step 2: Add a record-contract test**

Update `tests/project-records.test.js` so every featured record requires `presentation.type`, `presentation.alt`, and lens annotations. Run the test first and confirm it fails against the unextended records.

- [ ] **Step 3: Implement artifact primitives**

`artifact.js` exports helpers for a physical plate, systems sheet, experiment note, metric annotation, and evidence label. Each helper accepts a record and lens; no helper reads global state.

- [ ] **Step 4: Implement `home.js`**

Render a compact identity block, WITF media occupying 55–65% of the desktop opening scene, contextual annotations, lens-sensitive project ordering, and heterogeneous featured artifacts. Remove the generic proof grid and uniform selected-work card grid.

- [ ] **Step 5: Verify homepage behavior**

Run unit tests and Playwright at 1440, 1280, 768, 390, and 375px. Expected: WITF is the central artifact on desktop; identity precedes media on mobile; lens switching changes annotations/order; no overflow or hidden primary links.

- [ ] **Step 6: Record the checkpoint**

Capture `home-{1440,1280,768,390,375}.png` under `output/technical-atelier-review/` and update `IMPLEMENTATION_STATUS.md`.

## Task 6: Build the editorial Work catalog

**Files:**
- Create: `scripts/views/work.js`
- Modify: `scripts/work-filters.js`
- Modify: `styles/artifacts.css`
- Modify: `tests/work-filters.test.js`

- [ ] **Step 1: Expand filter tests**

Add cases for Engineering, Product, Systems, AI/ML, Developer Tools, Cloud, Physical Product, and Historical. Confirm the tests fail for any unsupported grouping before implementation.

- [ ] **Step 2: Implement heterogeneous catalog groups**

Featured entries use project-specific formats; compact entries render specimen sheets; archive entries render a chronological drawer. Preserve result counts with `aria-live` and `aria-pressed` filter state.

- [ ] **Step 3: Verify filtering and layout stability**

Run `npm test`. In Playwright, exercise every filter by keyboard and verify the result count and visible project slugs. Check 1440, 768, and 390px layouts for large jumps or clipped text.

- [ ] **Step 4: Record the checkpoint**

Capture Work screenshots for All, Engineering, Product, and Historical states and update `IMPLEMENTATION_STATUS.md`.

## Task 7: Build GMK Arch and WITF case-study experiences

**Files:**
- Create: `scripts/views/project-detail.js`
- Create: `styles/case-studies.css`
- Modify: `data/projects.js`
- Copy optimized derivatives into: `public/projects/gmk-arch/` and `public/projects/witf/`

- [ ] **Step 1: Select media from the retained manifest**

Read `../web-migration/assets/crawl-index.tsv` and select only retained primary assets. Record original source, project, dimensions, SHA-256, authored alt text, and deployed derivative path in the project record. Do not copy responsive duplicates.

- [ ] **Step 2: Add physical-case-study contract tests**

Require GMK Arch and WITF to expose `gallery`, `caseStudy.sections`, `presentation.alt`, and evidence-qualified metrics. Assert that GMK Arch contains `sold line items` rather than customers and WITF retains the `~15 -> ~100 -> ~50` sequence.

- [ ] **Step 3: Implement the GMK Arch launch dossier**

Render a visual opening, design/kitting system, prototype/manufacturing sections, 10-region distribution map, community/GTM chronology, externally corroborated Geekhack/Reddit evidence, and qualified outcomes.

- [ ] **Step 4: Implement the WITF decision path**

Render construction/specification details, product imagery, and the causal sequence from initial expectation through volume, fulfillment, price, accessory, viable-core, and outcome decisions. Attach evidence labels at the claim level.

- [ ] **Step 5: Verify content and media**

Run tests, check every deployed image returns HTTP 200, and use Playwright to verify alt text, reserved dimensions, mobile crops, metric wording, and previous/next project navigation.

- [ ] **Step 6: Record the checkpoint**

Capture desktop/mobile GMK Arch and WITF screenshots and update `IMPLEMENTATION_STATUS.md`.

## Task 8: Build engineering diagram case studies

**Files:**
- Create: `scripts/media/diagrams.js`
- Create: `scripts/media/netweave-field.js`
- Modify: `scripts/views/project-detail.js`
- Modify: `styles/case-studies.css`
- Modify: `data/projects.js`

- [ ] **Step 1: Define diagram data in records**

Add declarative nodes, edges, labels, summaries, and reduced-motion states for ShareCLI runtime topology, Substrate provider policy, phenotype-omlx upstream/fork delta, and NetWeave graph/automata layers. Diagram data may only encode claims already supported by the evidence ledger or GitHub handoff.

- [ ] **Step 2: Add diagram-contract tests**

Test that every full engineering study has a textual summary, at least two nodes, unique node IDs, valid edge endpoints, and an explicit limitations section. Run first and confirm failure until the records are extended.

- [ ] **Step 3: Implement accessible SVG diagrams**

`diagrams.js` renders semantic SVG with title/description, visible labels, keyboard-readable accompanying summaries, and a static reduced-motion state. Paths draw once only when motion is permitted.

- [ ] **Step 4: Implement the NetWeave field**

Use a small Canvas or SVG field driven by deterministic seeded data. It demonstrates local traffic movement and bottleneck formation without claiming measured simulation output. Pause when offscreen and provide a static explanatory fallback.

- [ ] **Step 5: Verify provenance boundaries**

Check ShareCLI has no adoption claim; Substrate has no invented performance number; phenotype-omlx separates `jundot/omlx` upstream work; NetWeave keeps congestion-aware routing and dynamic rerouting as future work and retains the AI-assistance disclosure.

- [ ] **Step 6: Record the checkpoint**

Capture each engineering study at desktop and one at mobile, then update `IMPLEMENTATION_STATUS.md`.

## Task 9: Finish compact, archive, resume, contact, and 404 views

**Files:**
- Create: `scripts/views/resume.js`
- Create: `scripts/views/contact.js`
- Create: `scripts/views/not-found.js`
- Modify: `scripts/views/project-detail.js`
- Modify: `styles/case-studies.css`

- [ ] **Step 1: Implement compact specimen sheets**

BytePort exposes current/planned boundaries; Tracera avoids adoption claims; DSS Cipher remains historical; CLIProxyAPI++ and AgentAPI++ lead with upstream attribution.

- [ ] **Step 2: Implement the archive drawer**

MCPForge, ForgeCode, and Frostify render as historical records. Frostify states unmaintained status, fork attribution, and 3,350+ GitHub release-asset downloads, never users.

- [ ] **Step 3: Implement resume selection**

Render polished Engineering and Product/Program HTML summaries. If canonical PDFs are absent, do not render dead links; state their absence only in the handoff.

- [ ] **Step 4: Implement contact and 404**

Contact actions remain real anchors. The 404 retains global navigation, a logical heading, and a direct Work action.

- [ ] **Step 5: Verify all supporting routes**

Use keyboard-only Playwright checks for Resume, Contact, Archive, one compact project, Frostify, and an unknown slug. Verify no placeholder copy or broken links.

## Task 10: Add progressive 2.5D and optional 3D boundaries

**Files:**
- Create: `scripts/media/layered-image.js`
- Create: `scripts/media/model-slot.js`
- Modify: `scripts/views/home.js`
- Modify: `styles/artifacts.css`
- Modify: `styles/responsive.css`

- [ ] **Step 1: Implement bounded layered media**

`layered-image.js` accepts background, object, shadow, annotation layers, and a maximum movement value. It disables pointer/scroll depth for reduced motion, touch-only contexts, and offscreen content.

- [ ] **Step 2: Implement a model slot with poster fallback**

`model-slot.js` renders a poster by default and loads a GLB/GLTF only when a valid `modelUrl` exists and WebGL is available. It exposes loading/error text, a non-interactive reduced-motion mode, and never fabricates missing keycaps or product geometry.

- [ ] **Step 3: Integrate WITF 2.5D**

Use the retained render derivatives for the homepage and WITF case-study opening. Cap motion, reserve dimensions, and verify the static composition remains complete with JavaScript disabled.

- [ ] **Step 4: Verify performance behavior**

Confirm decorative motion pauses offscreen, no continuous requestAnimationFrame loop runs when idle, and mobile/reduced-motion screenshots remain stable.

## Task 11: Complete responsive, accessibility, metadata, and link QA

**Files:**
- Create: `styles/responsive.css`
- Modify: `ACCESSIBILITY_REPORT.md`
- Modify: `LINK_AUDIT.md`
- Modify: `LIGHTHOUSE_REPORT.md`
- Modify: `VERIFICATION_REPORT.md`

- [ ] **Step 1: Run the responsive matrix**

Review Home, Index, Work, GMK Arch, WITF, ShareCLI, phenotype-omlx, NetWeave, Resume, Contact, and 404 at 1440, 1280, 768, 390, and 375px. Fix overflow, awkward wrapping, giant gaps, tiny labels, poor crops, and crowded controls.

- [ ] **Step 2: Run keyboard and semantics checks**

Verify landmarks, heading order, skip link, focus order, focus visibility, Project Index containment/restoration, filters, lens state, image alt text, diagram summaries, touch targets, contrast, and reduced motion.

- [ ] **Step 3: Run link and asset checks**

Check all navigation hashes, project slugs, GitHub/source links, contact actions, sitemap URLs, favicon, robots, and deployed assets. Classify external failures as broken, redirected, stale, or intentionally retained.

- [ ] **Step 4: Run performance checks**

Use Lighthouse or an equivalent browser audit on Home, Engineering, Product, Work, GMK Arch, WITF, and ShareCLI. Record Performance, Accessibility, Best Practices, SEO, LCP, CLS, and INP/TBT. Fix only actionable issues that do not weaken the approved design.

- [ ] **Step 5: Verify metadata**

Check page titles/descriptions, canonical tags, OpenGraph, favicon, Person schema, supported SoftwareSourceCode/CreativeWork/Product schema, sitemap, robots, and preview `noindex` behavior.

## Task 12: Verify Vercel output and publish a review-only preview

**Files:**
- Modify: `IMPLEMENTATION_STATUS.md`
- Modify: `HUMAN_REVIEW.md`
- Modify: `portfolio-implementation-handoff.md`
- Modify: `REDIRECT_PARITY.md`

- [ ] **Step 1: Run the complete local gate**

Run: `npm test && npm run check && vercel build --yes`

Then run: `node --test tests/build-output.test.js`

Expected: all tests PASS and `.vercel/output/static/` contains `index.html`, `scripts/app.js`, and the new CSS files.

- [ ] **Step 2: Generate the final screenshot pack**

Store desktop/mobile review images under `output/technical-atelier-review/final/` for Home, Engineering, Product, Work, GMK Arch, WITF, ShareCLI, phenotype-omlx, NetWeave, Resume, and representative mobile views.

- [ ] **Step 3: Deploy a preview only**

Run: `vercel deploy --prebuilt --yes --target=preview`

Record the preview URL and deployment ID. Do not run `--prod`, attach a domain, change DNS, or activate redirects.

- [ ] **Step 4: Verify hosted behavior**

Confirm the user can load the authenticated preview, routes render, assets load, titles update, 404 works, and the deployed build matches the final screenshot pack.

- [ ] **Step 5: Refresh migration review documents**

Re-evaluate GMK Arch, WITF, and DSS Cipher redirect parity against the redesigned destinations. Keep `projects.kooshapari.com` and `phenotype.space` live. Update handoff status to `READY FOR HUMAN PRODUCTION REVIEW` only if the redesigned preview is meaningful and verified.

## Final execution rule

Use one worker owner per task or non-overlapping file group. Review each task for spec compliance and verification before the next task begins. Do not let a worker modify `web-migration/`, source-project repositories, DNS, redirects, or legacy-site state.
