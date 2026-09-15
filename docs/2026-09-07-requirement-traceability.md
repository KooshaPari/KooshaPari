# Portfolio requirement traceability

September 7, 2026 Pacific. Working reconciliation of the September 5 prompt inventory against inspected source and previously recorded verification. This is a requirement-family map; original PMP/addendum re-reading and atomic requirement enumeration remain open.

Authority: docs/PORTFOLIO_PROMPT_INVENTORY_2026-09-05.md consolidates the PMP documents; rich-experience conflicts defer to ../port-pmp.md. docs/superpowers/specs/2026-08-30-technical-atelier-redesign-design.md supplies the inspected acceptance criteria. Older completion labels are historical observations, not current acceptance.

| ID | Requirement family | Implementation/evidence | Status and missing proof |
| --- | --- | --- | --- |
| R01 | Human-facing provenance, internal names private | scripts/views/project-detail.js: evidencePanel renders project.evidence verbatim; ShareCLI browser snapshot displays github-pass1-after.md | FAIL: internal filename appears publicly. Replace with visitor-facing source labels/links while preserving internal records. |
| R02 | Full Reader/no-JS parity | work/sharecli.html noscript has four-state explanation; JS page has case study, provenance, downloads | FAIL for inspected ShareCLI page: static content omits downloads and most case-study content. Other routes need the same comparison. |
| R03 | Persistent Reader preference and reduced-motion default | scripts/reader-state.js writes localStorage, but never reads it or queries prefers-reduced-motion | SOURCE GAP: refresh restoration/default absent in inspected module. Browser reproduction and dedicated tests required. |
| R04 | Reader keyboard/focus | reader-state.js attaches R shortcut only during first set/toggle and queries #canvas headings | PARTIAL: current page uses #view-root. Verify fresh-load R, typing exclusion, heading focus, Escape and persistence. |
| R05 | Shared Engineering/Product model | data/projects.js; lens-state.js; home and work views; lens/record/catalog tests | PARTIAL: shared records and transformations have local coverage; refresh/URL/storage precedence and all route annotations need browser checks. |
| R06 | Direct-linkable path routes | router.js, vercel.json; fresh Vercel /work/sharecli browser pass | VERIFIED for ShareCLI local preview; all route refresh/back-forward and redirect parity remain open. |
| R07 | Original artifact delivery | public/projects/sharecli/recordings; pinned hashes in sharecli-recording.test.js | VERIFIED locally: both files delivered through Vercel, hashes match. Browser player not required by download label. Hosted proof open. |
| R08 | Public output excludes internal documents | stage-publication.js allowlist; build-output.test.js negative assertions | VERIFIED by local tests; old prompt inventory's root-output leak finding is superseded locally. Hosted exposure scan open. |
| R09 | Ownership, attribution, truthful claims | project records, evidence ledger, project-record tests | PARTIAL: presence tests do not substantiate each claim/date/confidence; external source reconciliation open. |
| R10 | Physical asset rights/dimensions/provenance | project-record tests verify selected hero hashes/dimensions | PARTIAL: selected hero verification does not cover all assets, licenses or model origin. |
| R11 | Unified Reader/Explore experience and six distinct project presentations | media/workbench modules; design acceptance section | PARTIAL: implementations exist; visitor tasks and cross-project interaction consistency unverified. |
| R12 | Four adaptive quality tiers/user override | Reader control and media fallbacks observed | UNKNOWN: no demonstrated four-tier policy, budgets or full override behavior in this pass. |
| R13 | Progressive loading/resource cleanup | module media inventory and source records | UNKNOWN: need route network waterfall, hidden-tab behavior and repeated navigation resource measurements. |
| R14 | Accessibility and five viewport sizes | historical HUMAN_REVIEW.md; current ShareCLI keyboard download activation | PARTIAL: full focus, contrast, touch targets, reduced motion and 1440/1280/768/390/375 visual review not refreshed. |
| R15 | Measured performance/user-task outcomes | LIGHTHOUSE_REPORT.md explicitly has no scores | OPEN: LCP/CLS/TBT lab baseline, field INP when available, asset budgets, task completion and memory evidence. |
| R16 | Resume/contact and metadata | static files, views, metadata tests; migration/status claims differ | PARTIAL: HTML paths exist; verify every action and canonical/social/schema destination. PDF policy requires explicit resolution. |
| R17 | Protected preview and production isolation | historical preview IDs; local Vercel acceptance | HISTORICAL/UNKNOWN hosted: verify intended deployment, noindex, isolation, redirect baseline and approval record. |
| R18 | Brand/recruiting/B2B/B2C/OSS routing | prompt inventory includes nine PMP sources | OPEN: audit these as separate requirements; a portfolio rendering pass does not complete the career program. |

## Ordered implementation and verification queue

1. T01 / R01: render readable provenance without exposing internal filenames. Test visible DOM for meaningful attribution and absence of ledger filenames. Keep source records intact.
2. T02 / R02: generate complete static project content from shared records, including sources and downloadable evidence. Test a browser context with JavaScript disabled against required content/actions; compare with JS mode. Avoid separately maintained duplicate narratives.
3. T03 / R03-R04: reproduce Reader initialization, storage and keyboard problems. Fix initialization and focus against current DOM. Test reload, explicit override, reduced-motion default, editable fields, modified shortcuts and Escape.
4. T04 / R05-R06,R16: route/lens/action browser matrix against a fresh Vercel build. Include direct navigation, refresh, back/forward, malformed/unknown paths and metadata.
5. T05 / R09-R10,R18: claim and asset register with source/date/rights/owner; reconcile original nine PMP documents and addendum at atomic requirement level.
6. T06 / R11-R15: define visitor tasks and run accessibility, viewport, network/resource and performance measurements. Record actual budgets and gaps; do not infer completion from file presence.
7. T07 / R17: canonical Git custody, candidate manifest, protected hosted preview checks and rollback packet. Production remains a separate approval gate.

Task ownership is unassigned; these are proposed work packages, not live AgilePlus records. T01 and T03 can be developed independently; T02 precedes no-JS acceptance in T04/T06; T04-T06 and source custody precede T07.

September 7 23:05 Pacific implementation update: T01 now uses publicEvidenceSummary in both shared evidence labels and the project detail evidence panel. Known internal ledgers map to readable source-type descriptions; unknown references receive a conservative pending-evidence label. Internal project records and repository links remain unchanged. tests/public-evidence.test.js covers rendered shared labels for every project, source distinctions, unknown references and record preservation. Full-browser project-detail verification remains open.

## Contradictions resolved in this pass

September 7 23:27 Pacific: T03 source repair restores saved Reader booleans, defaults to reduced motion when unsaved, initializes keyboard handlers immediately, excludes modified/repeated/composing/typing shortcuts, persists Escape and explicit set, and preserves preference on resize. Focus targets #view-root headings with tabindex=-1. app.js updates the Reader button in place for all state changes; removing the toggle's full render prevents discarding the newly focused heading. Regression tests cover initialization, saved values, key exclusions, focus and persistence. Local build and 46 tests passed before the app integration adjustment; final build/test output accompanies this change. Full real-browser Reader acceptance remains pending.

- Historical root publication leak: current staging excludes internal output; selected explicit public captures are packaged safely.
- Historical replay verification: delivery is now locally verified with browser downloads; earlier metadata-only tests were insufficient.
- Historical COMPLETE migration labels: retained as history. Current R01-R04 findings prevent treating those labels as full acceptance.
- Existing preview returned a missing-module 404: fresh Vercel preview passed; long-lived server state and separate IPv4/IPv6 listeners affected diagnosis.

Next audit work is original-source requirement enumeration and current browser reproduction of R03-R04. This file does not claim exhaustive completion of the broad audit.
