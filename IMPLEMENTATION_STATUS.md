# Implementation status

State: **Technical Atelier redesign — preview verified, pending hosted review**

## Technical Atelier checkpoints

- Task 1: test/build contract established. `node --test tests/project-records.test.js` passes 2/2 record-contract tests. `npm test` is intentionally red because the extracted `scripts/app.js` and `styles/base.css` build output do not exist yet.
- Task 2: router, lens state, work filters, and DOM helpers extracted. `node --test tests/router.test.js tests/lens-state.test.js tests/work-filters.test.js` passes 8/8 tests after the required module-not-found RED baseline.
- Task 3: Technical Atelier tokens, base layer, semantic shell, and responsive shell implemented. Legacy and replacement screenshots are recorded at `output/technical-atelier-review/before-shell-1440.png`, `after-shell-1440.png`, and `after-shell-390.png`; `node --check scripts/components/shell.js` passes.
- Task 4: application coordinator and full-height Project Index implemented. Keyboard traversal reached the first three projects, Escape restored focus to Index, reopening navigated to `#work/sharecli`, and the browser console reported 0 errors/warnings at 390px. Syntax checks and 10 non-build unit tests pass; the Vercel build-output contract remains intentionally red until Task 12.
- Task 5 visual correction: the Home opening keeps the identity block and WITF artifact together above the fold; WITF preserves its native 16:9 ratio at every breakpoint, desktop and mobile dead zones are tightened, and the 354x90 GMK Arch source is a contained specimen strip. Sequence-level captures at `output/technical-atelier-review/home-sequence-{1440,375}.png` prove the heterogeneous card layout. All four spec re-review blockers are resolved.
- Task 5 re-review fix: metric annotation changed from `<aside>` to `<div role="note">`, removing the nested-complementary-landmark accessibility violation. Vercel static output synced to current modular source. `npm test` passes 15/15 including the previously-red build-output contract. Console verified 0 errors / 0 warnings across 10 routes over HTTP.

Completed:

- Shared project records and evidence-qualified metrics.
- Canonical portfolio navigation: Home, Engineering, Product, Work, Resume, Contact.
- Technical Atelier Home with identity block, WITF opening artifact, and heterogeneous artifact sequence (systems, experiment, physical, GMK specimen).
- Engineering/Product lens views from shared records.
- Curated Work index, Resume, and Contact views.
- Work filters and hash-routed project detail views.
- Project cards and case-study pages render retained local assets with authored fallback alt text.
- Priority preview assets copied into `public/projects/` with deployable relative paths.
- Case-study detail pages now include context/decisions/outcome or problem/architecture/verification sections.
- NetWeave is now a full engineering case-study candidate with dedicated narrative sections, system-level routing insight, experimental workflow framing, and AI-assistance disclosure.
- NetWeave detail includes an accessible text architecture diagram showing POI routing, the directed graph, per-road cellular automata, and WebSocket visualization; deferred artifacts are explicitly non-blocking.
- Priority and compact/archive detail pages now use project-specific narratives and explicit current/upstream boundaries.
- Non-production Vercel preview deployed (SSO-protected); final review screenshot pack and readiness documents generated.
- Local static server smoke test, JavaScript syntax checks, and 10-route console verification (0 errors / 0 warnings) over HTTP.
- Accessibility audit via axe-core: nested-complementary-landmark violations resolved; remaining page-has-heading-one flags confirmed as SPA timing false-positives (h1 verified in DOM at all flagged routes).

Remaining before production cutover: Vercel redeployment (requires auth token), hosted Lighthouse/a11y checks, canonical resume PDFs if approved, redirect parity sign-off, and human approval.
