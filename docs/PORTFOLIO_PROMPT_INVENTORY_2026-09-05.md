# Portfolio Prompt Inventory and Requirements Synthesis

> Purpose: preserve the currently applicable portfolio, brand, recruiting, and
> rich-redesign requirements before another implementation or prompt-revision
> pass. This document is an internal planning artifact, not public copy and not
> authorization to deploy, change DNS, activate redirects, retire legacy sites,
> alter a social profile, or mutate GitHub.

## Scope and coverage

The inventory was performed on 2026-09-05 from
`/Users/kooshapari/CodeProjects/Phenotype/repos`, with the portfolio target at
`/Users/kooshapari/CodeProjects/Phenotype/repos/koosha-phenotype`.

Filename discovery covered `CodeProjects`, `.codex`, and `.agents`, excluding
dependency/build/VCS trees (`node_modules`, `.git`, `target`, `dist`, `build`,
`.next`, and `.vercel/output`). A broader `/Users/kooshapari` filename scan was
attempted but was not complete: macOS denied access to parts of `Downloads`, and
the scan timed out in `Library/CloudStorage` and cache-like trees. Therefore
this is a complete inventory of the primary Phenotype estate, not a claim of
exhaustive coverage of the whole home directory.

All nine primary-estate `*pmp*.md` files were read. The exact portfolio
addendum is `../port-pmp.md`; there is no file named `pmp-port.md` in the
discovered primary estate.

## Source inventory

| Source | Role | Portfolio applicability | Authority / action boundary |
|---|---|---|---|
| `../pmp-1-01.md` | Brand-system audit | Defines Koosha, Phenotype, project-brand, audience, funnel, and evidence model | Analysis/local-only; no public or deployment mutation |
| `../pmp-1-02.md` | LinkedIn/network audit | Defines privacy-preserving opportunity graph and comment/post measurement | Analysis/local-only; no social, GitHub, portfolio, DNS, or recruitment mutation |
| `../pmp-1-03.md` | Recruiting funnel calibration | Defines two-lane employment framing, inbound evidence, seniority calibration, and funnel measurement | Evidence-first analysis; do not turn hypotheses into public claims |
| `../pmp-1-04.md` | External-positioning control plane | Reconciles Koosha/Phenotype/project architecture, routing, freeze list, and 7/30/90-day priorities | Control-plane planning; distinguish do-now, experiment, and frozen work |
| `../pmp01.md` | Portfolio migration brief | Defines legacy/asset audit, evidence rules, content model, IA, migration phases, and cutover restraint | No destructive retirement/DNS change without explicit authorization |
| `../pmp02.md` | Portfolio design/implementation brief | Defines editorial foundation, canonical case-study/route requirements, accessibility/SEO, redirect-preview gate | Implementation sequence only after evidence and migration gates |
| `../pmp03.md` | Prebuild reconciliation | Locks project classification, attribution, IA, redirect readiness, and prebuild status | Do not implement until exact material blockers are resolved |
| `../pmp3.md` | GitHub recruiting curation | Defines profile/repository hierarchy and truthful fork/readme presentation | Separate GitHub audit/curation pass; preserve history and attribution |
| `../port-pmp.md` | Portfolio Redesign Addendum V2 | Superseding rich-experience specification and senior-front-end proof bar | Protected preview only; never replace production without approval |

Related target-local authority and handoff documents:

| Source | Use in next pass |
|---|---|
| `docs/superpowers/specs/2026-08-29-canonical-portfolio-design.md` | Baseline canonical portfolio and inherited constraints |
| `docs/superpowers/specs/2026-08-30-technical-atelier-redesign-design.md` | Current Technical Atelier safety, provenance, and review constraints |
| `docs/superpowers/plans/2026-08-29-canonical-portfolio-implementation.md` | Earlier implementation sequence |
| `docs/superpowers/plans/2026-09-01-technical-atelier-redesign.md` | Modular static implementation plan and explicit no-DNS/no-legacy mutation boundary |
| `portfolio-implementation-handoff.md` | Current handoff and unresolved delivery state |
| `IMPLEMENTATION_STATUS.md`, `MIGRATION_STATUS.md`, `VERIFICATION_REPORT.md`, `PRODUCTION_CUTOVER.md`, `REDIRECT_PARITY.md` | Existing evidence/status; not proof of a new hosted deployment |
| `docs/omniroute-integration/INTEGRATION_MANIFEST.md` and `docs/omniroute-integration/evidence-archive/` | OmniRoute evidence inputs only; do not convert upstream work into owned work |
| `../docs/redesign/NORTH_STAR.md`, `WORKBENCH_SPEC.md`, `PHASE_0_AUDIT.md`, `REFERENCE_MATRIX.md`, `ORIGINALITY_LEDGER.md` | Existing cross-estate design-research material; reconcile rather than duplicate |

## Consolidated non-negotiables

### Evidence, ownership, and wording

1. Every consequential public claim needs a source, date, evidence type, and
   confidence. Unknown remains `unknown`; it is not silently estimated.
2. OmniRoute is a compact upstream OSS contribution. Do not describe it as
   Koosha-owned, built, maintained, or as a portfolio flagship. Preserve the
   upstream distinction, separate it from CLIProxyAPI++, and only use rank/PR/
   release metrics when a cited frozen source supports them.
3. Do not import upstream popularity, planned work, or unsupported production
   claims as local proof. Forks retain upstream attribution and describe local
   delta only.
4. The public Evidence & Provenance experience must use human-facing labels and
   qualifiers; internal ledger names, confidence enums, raw evidence manifests,
   and review language must remain non-public.
5. Physical assets must be first-party or appropriately licensed, traceable by
   source/dimensions/hash/disposition. Do not fabricate geometry or present a
   generated reconstruction as original CAD.

### Brand and content model

1. The system has three distinct entities: Koosha (operator), Phenotype
   (operating/studio umbrella), and individual projects/products. It must not
   collapse them into one undifferentiated personal-project collection.
2. Evaluate claims per audience, intent, surface, and context depth (blind,
   skimmed, informed, experienced), not by one aggregate brand score.
3. Preserve a coherent temporal story: increasing systems complexity while
   retaining product/operator ownership, rather than apparent career hopping.
4. Separate recruiting, B2B, B2C/community, OSS reputation, and founder/network
   paths. Do not force every project into a commercial product.
5. The portfolio must quickly answer role fit, personal role/ownership,
   current-vs-planned-vs-upstream status, proof, resume, and contact needs.

### Product and interaction architecture

1. `port-pmp.md` supersedes an earlier rich-redesign brief where they conflict.
   Its central concept is one coherent **Phenotype Workbench / Technical
   Atelier**, not disconnected 3D, terminal, graph, and animation demos.
2. Two equal paths share one record model:

   - **Reader / Quick Scan:** semantic, fast, accessible, indexable, and
     complete without rich assets.
   - **Explore / Rich:** optional progressive enhancement that proves real
     project behavior and never blocks access or navigation.

3. Engineering and Product are persistent interpretations of shared project
   records. A lens changes ranking, representation, annotations, metrics, and
   evidence—not merely button color or duplicate content trees.
4. Canonical project routing is path-based (`/work/:slug`), direct-linkable, and
   refresh-safe. Hash-only navigation is not the desired final architecture.
5. The visual system retains paper/ink, strict grid, editorial type, and
   utilitarian mono. Glass is reserved for instrument/inspection states; generic
   3D portfolio tropes, unexplained keyboards, forced intros, and decorative
   motion are prohibited.
6. Every interaction needs a stated visitor question, project behavior, skill
   demonstrated, nonanimated equivalent, mobile/reduced-motion behavior, and
   byte/CPU/GPU/maintenance cost.

### Accessibility, performance, and evaluation

1. Reader/no-JS/no-WebGL content is complete. Rich interactions need semantic
   summaries, keyboard access, visible focus, headings/landmarks, contextual alt
   text, no hover-only information, pause/stop where needed, and a real
   reduced-motion alternative.
2. Four adaptive quality tiers are required: high desktop, standard desktop,
   mobile/low-power, and Reader/no-JS/no-WebGL. Users may override quality;
   implementation must avoid invasive device fingerprinting.
3. Rich assets load progressively and by route. No persistent hidden-tab GPU
   load, unbounded animation, global loading of all project assets, or retained
   resources across route changes.
4. Measure real page budgets and outcomes: LCP, INP, CLS, frame behavior,
   payload/decode/draw/memory data, browser/mobile matrix, task completion,
   accessibility, and interaction abandonment. Do not invent human-testing or
   award-score results.

### Safety and delivery gates

1. No DNS, production domain, production deployment, production redirect,
   legacy-site retirement, social-profile, GitHub, or outbound-recruiting
   mutation is implied by these prompts.
2. A protected preview must be isolated from production artifact/data/secrets/
   analytics and must not be presented as canonical. Production replacement
   requires explicit human approval.
3. The current static deployment configuration needs a separate publication
   allowlist fix before any preview: the independent verification found
   `.vercel/output/static` included review artifacts, tests, Markdown evidence,
   and Playwright captures when `outputDirectory` was `.`. This conflicts with
   the addendum's ban on public evidence-ledger internals.
4. Generated clean-URL redirects require parity review. The absence of a Git
   worktree prevents proving whether their behavior is new; do not claim
   redirect safety from local source inspection alone.

## Phase-aligned requirement map

| Gate | Minimum evidence before advancing | Current observed status |
|---|---|---|
| Scope lock | No public/Git/DNS/redirect/legacy mutation; source evidence remains preserved | Local-document work is within scope; hosted state not reverified here |
| Content and provenance | Project classification, personal contribution, maturity, assets, and qualifiers reconciled | Partial: project records/tests exist; cross-prompt reconciliation not yet recorded in one authority file |
| Workbench prototype | One coherent stage, lens transformation, semantic fallback, mobile/reduced-motion behavior | Partial: current media modules provide diagrams, layered image, model slot, and NetWeave field; no demonstrated unified Workbench |
| Flagship proof | Accurate material artifact, runtime topology, meaningful simulation, evidence controls | Partial: static/illustrative building blocks exist; required flagship proof bar remains unverified |
| Public-surface hardening | Static allowlist, no internal evidence exposure, route/redirect parity, noindex preview, metadata | Blocked: output leak and hosted verification gap |
| Human review | Protected preview, screenshot/video pack, task test report, known issues, approval | Not established by this inventory |

## Exact gaps to resolve before revising `port-pmp.md` or app code

1. **Authority reconciliation:** decide which existing `docs/redesign/*` source
   is current for each required deliverable and record a single status registry.
   The addendum names many deliverables; their existence alone is not phase-exit
   proof.
2. **Project proof matrix:** map every proposed flagship/compact/archive project
   to canonical repository, ownership/fork status, current maturity, evidence
   source/date, applicable lens, and allowed public claims.
3. **Publication allowlist:** replace root-wide static publication with a staged
   allowlist and a negative artifact test. Keep internal reports, prompts, docs,
   tests, logs, screenshots, `.playwright-cli`, `web-migration`, and `.vercel`
   out of deployable output.
4. **Preview authority:** obtain explicit confirmation of the protected preview
   target and its isolation/noindex behavior. Do not infer an authorized DNS
   change from the preferred `preview.kooshapari.com` example.
5. **Redirect baseline:** compare generated clean-URL behavior with the approved
   redirect map. No activation or claim of parity until that review is recorded.
6. **Reader/Explore contract:** formalize state, URL persistence, fallback,
   loading/error, keyboard, and mobile behavior before adding rich scenes.
7. **Measurement baseline:** capture actual local/preview accessibility,
   performance, browser, memory, and task-test evidence; label any historical
   report as historical until rerun against the candidate.
8. **PMP execution boundaries:** network/recruiting and GitHub curation prompts
   are related inputs, but each requires its own privacy/mutation gate. They do
   not authorize implementation in this portfolio directory.

## Addendum deliverable crosswalk

The following is a filename-existence inventory, not a claim that a document
is accurate, current, phase-complete, or implemented. Cross-estate files are
preserved sources and should be reconciled rather than copied over the target.

| Addendum deliverable | Observed source | Inventory state |
|---|---|---|
| Reference matrix/contact sheet | `../docs/redesign/REFERENCE_MATRIX.md`, `REFERENCE_CONTACT_SHEET.md` | Exists cross-estate; content/currentness not revalidated in this pass |
| North star/workbench spec | `../docs/redesign/NORTH_STAR.md`, `WORKBENCH_SPEC.md` | Exists cross-estate |
| Information architecture/visual/motion/interaction | `../docs/redesign/INFORMATION_ARCHITECTURE.md`, `VISUAL_SYSTEM.md`, `MOTION_SYSTEM.md`, `INTERACTION_SYSTEM.md` | Exists cross-estate |
| Component state/project interaction map | `../docs/redesign/COMPONENT_STATE_MATRIX.md`, `PROJECT_INTERACTION_MAP.md` | Exists cross-estate |
| Asset pipeline/provenance/status | `../docs/redesign/3D_ASSET_PIPELINE.md`, `ASSET_PROVENANCE.md`, `ASSET_STATUS.md` | Exists cross-estate |
| Adaptive/mobile/Reader/accessibility/performance | `../docs/redesign/ADAPTIVE_QUALITY.md`, `MOBILE_STRATEGY.md`, `READER_MODE.md`, `ACCESSIBILITY_STRATEGY.md`, `PERFORMANCE_BUDGET.md` | Exists cross-estate |
| Originality and Phase 0 audit | `../docs/redesign/ORIGINALITY_LEDGER.md`, `PHASE_0_AUDIT.md` | Exists cross-estate |
| System case study/interactions/status | `../docs/redesign/SYSTEM_CASE_STUDY.md`, `INTERACTION_INVENTORY.md`, `REDESIGN_STATUS.md` | Exists cross-estate |
| User tasks/heuristic review/analytics plan | No matching primary-estate `docs/redesign/USER_TASKS.md`, `HEURISTIC_REVIEW.md`, or `ANALYTICS_PLAN.md` found | Missing from the inventoried cross-estate design folder |
| Accessibility/performance/browser/task/bundle/memory reports | Target root has historical `ACCESSIBILITY_REPORT.md` and `LIGHTHOUSE_REPORT.md`; no matching named `docs/redesign` reports found for performance, browser, user-task, bundle, or memory leakage | Missing or located outside the discovered design folder; no current evidence inferred |
| Rich review pack | `.playwright-cli/` and `output/` artifacts exist locally | Present as local review material only; unsafe to publish under current root-wide static output |

### Requirements that should survive a `port-pmp.md` overhaul

An eventual addendum revision must retain these constraints verbatim in effect,
even if it shortens or restructures the prose:

1. `port-pmp.md` wins only on rich-experience conflicts; evidence, ownership,
   legacy preservation, and explicit delivery authorization remain governing
   constraints from the canonical portfolio materials.
2. A phase cannot be marked complete solely because a document exists. It needs
   the named phase-exit evidence, a linked status entry, and fresh verification.
3. The Workbench is a unifying grammar with Reader/Explore parity, not a demand
   to ship every proposed 3D/terminal/simulation surface at once.
4. A protected preview is a gate, not an instruction to create a DNS record.
   Absent explicit authorization, preview requirements remain blocked.
5. Public deployment must be an allowlisted artifact. Internal proof remains in
   the repository/workspace and is summarized through public-facing provenance
   components rather than shipped raw.
6. No production or legacy action follows from a prompt revision, local build,
   or generated static output.

## Next safe handoff

The next worker should treat this document, the two Technical Atelier source
documents, and `../port-pmp.md` as a requirements bundle. It should first make
the authority/proof/publication registry and resolve the eight gaps above. Only
then should it propose a revised `port-pmp.md` or implementation plan. It must
not rewrite `port-pmp.md`, edit application code, deploy, alter DNS, activate
redirects, or retire legacy surfaces as part of that reconciliation.

## Evidence footer

- scope_pass: analysis
- read_only: true except for creation of this internal synthesis
- omniroute_attribution_check: passed in this synthesis; no ownership or
  unsourced metric assertion is made
- evidence_policy: source path | 2026-09-05 inventory date | direct file read |
  confidence high for discovered primary-estate files; low for unscanned or
  inaccessible home-directory locations
