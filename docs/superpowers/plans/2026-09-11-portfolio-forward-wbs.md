# Portfolio Forward Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the public KooshaPari portfolio from verified blind drafts to a reviewed, reproducible, safely promotable release without expanding into private resume variants or external-account mutations.

**Architecture:** Keep `/Users/kooshapari/CodeProjects/Phenotype/repos/koosha-phenotype` as the active source copy and treat `/Users/kooshapari/CodeProjects/Phenotype/repos/worktrees/KooshaPari-public-sync-20260909` as the Git promotion target. Preserve object-first visual modules, static/no-JavaScript fallbacks, explicit evidence boundaries, and separate source, review, sync, push, and deploy gates.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript modules, Node.js tests, Vercel preview build, Playwright browser acceptance, local screenshot review, Git worktree promotion.

---

## Scope and state legend

- **VERIFIED:** directly supported by the latest local command or artifact.
- **HISTORICAL:** retained source or prior evidence; not a current release claim.
- **UNKNOWN:** requires a new inspection or human decision.
- **BLOCKED:** cannot proceed without an explicit decision, missing artifact, or external-state change.

Current verified baseline: source-copy `npm run verify` exits 0; Vercel build passes; 83/83 unit tests pass; syntax checks pass; 9/9 browser tests pass. NetWeave, ShareCLI, and OmniRoute remain **visual-review candidates**, not promoted release artifacts.

Explicit exclusions: Anduril-targeted resume variants, LinkedIn mutations, Google Docs copies, external repository changes, deployment, push, and destructive cleanup.

## Program dependency graph

```text
Visual acceptance
      |
      v
Allowlist + provenance freeze
      |
      v
Source -> Git worktree reconciliation
      |
      v
Worktree verification + publication audit
      |
      +--> Human release approval --> commit --> push --> remote verification
      |                                      |
      +--------------------------------------v
                                  deploy approval -> production smoke -> rollback watch
```

## Work package inventory

| WP | Work package | State | Owner | Depends on | Exit evidence |
|---|---|---|---|---|---|
| WP00 | Control-plane and evidence ledger | VERIFIED/OPEN | Coordinator | None | Scope, hashes, gates, and decision log |
| WP01 | Human visual acceptance | UNKNOWN | Koosha + reviewer | Existing screenshots | Written approve/revise decision |
| WP02 | Visual correction loop | QUEUED | Named worker | WP01 targeted findings | Focused diff, screenshots, tests |
| WP03 | Source/worktree reconciliation | BLOCKED | Coordinator | WP01 approval | Allowlisted files byte/hash match |
| WP04 | Publication integrity and privacy audit | QUEUED | Audit worker | WP03 | No private paths/secrets in staged output |
| WP05 | Cross-surface accessibility and responsive hardening | VERIFIED/OPEN | QA worker | WP03 | Axe/no-JS/keyboard/390px/1440px evidence |
| WP06 | Content and evidence provenance | VERIFIED/OPEN | Content worker | WP03 | Claims, labels, ownership boundaries reviewed |
| WP07 | Release candidate and hosted checks | BLOCKED | Release owner | WP04-WP06 | Candidate tag/CI evidence |
| WP08 | Deployment and production smoke | BLOCKED | Release owner | WP07 + explicit approval | URL smoke, rollback reference |
| WP09 | Post-release operations | FUTURE | Coordinator | WP08 | Monitoring, change log, next WBS |

## WP00 — Control-plane and evidence ledger

**Files:** `EVIDENCE_LEDGER.md`, `docs/2026-09-10-site-first-execution.md`, `docs/superpowers/plans/2026-09-11-portfolio-forward-wbs.md`.

- [ ] Record the active source path, Git promotion path, current branch, and exact verification timestamp.
- [ ] Record each changed file, generated derivative, SHA-256, dimensions, and public/private classification.
- [ ] Record every gate as `OPEN`, `PASS`, `REVISE`, `BLOCKED`, or `APPROVED`; never convert an agent report into hosted-CI success.
- [ ] Append every ETA revision with old ETA, new ETA, and evidence-based reason.
- [ ] Preserve the distinction between authored explanatory artwork, recorded replay, upstream contribution evidence, and measured telemetry.

**Verification:** read back the ledger and confirm every active work package has an owner, dependency, and exit artifact.

## WP01 — Human visual acceptance

**Files:** `output/playwright/visual-qa/*.png`, `output/playwright/visual-qa/observations.json`, `HUMAN_REVIEW.md`.

- [ ] Review NetWeave Open gaps, Gaps narrow, and Approach screenshots at 390px and desktop width.
- [ ] Decide whether the preserved Approach-state vehicle contact is acceptable as an illustrative state; if not, open one NetWeave-only correction.
- [ ] Review ShareCLI capsule hierarchy, highlighted state, rail, labels, and reduced-motion/static fallback.
- [ ] Review OmniRoute plate border, conceptual-model label, solid/dashed legend, mobile readable alternative, and external-ownership wording.
- [ ] Write one decision: `APPROVE ALL`, `APPROVE SELECTED`, or `REVISE <surface>` with the exact acceptance criterion.

**Exit gate:** no synchronization or deploy action is allowed on an unreviewed surface.

## WP02 — Targeted visual correction loop

**Files:** only the named surface module, its surface-specific stylesheet, focused test, and screenshot evidence.

- [ ] Convert each human finding into one failing focused assertion before editing.
- [ ] Make one minimal correction; do not regenerate unrelated assets or rewrite shared layout.
- [ ] Run the surface-focused test and syntax check.
- [ ] Capture desktop and 390px screenshots; compare against the finding, not subjective preference.
- [ ] Update the ledger and handoff with the exact before/after result.

**Exit gate:** focused tests green, screenshots readable, no new overflow, and human re-review requested for the changed surface.

## WP03 — Source/worktree reconciliation

**Files:** source copy under `koosha-phenotype`; Git target `worktrees/KooshaPari-public-sync-20260909`.

- [ ] Freeze the approved allowlist after WP01/WP02.
- [ ] Exclude `node_modules/`, `.vercel/`, Playwright output, private exports, and unrelated generated files from promotion.
- [ ] Copy only approved source, tests, docs, and public derivatives into the Git worktree.
- [ ] Compare each allowlisted file with `diff -u` and record SHA-256 for binary assets.
- [ ] Run `git diff --check` and inspect the complete name/status diff.
- [ ] Stop if the target contains unexpected modifications; do not use destructive reset commands.

**Exit gate:** byte-level allowlist match, clean diff review, and explicit sync approval.

## WP04 — Publication integrity and privacy audit

**Files:** `scripts/stage-publication.js`, `.vercel/output/`, `tests/build-output.test.js`, `tests/public-evidence.test.js`, `vercel.json`.

- [ ] Run the publication staging script from the Git worktree.
- [ ] Confirm output contains only intended public routes/assets and no Finder metadata, private source paths, credentials, or internal filenames.
- [ ] Verify public evidence labels preserve source distinctions without exposing local paths.
- [ ] Verify generated HTML has construction gate, native no-JavaScript Continue, canonical/social metadata, and clean links.
- [ ] Recompute hashes/dimensions for selected hero and NetWeave derivatives.

**Exit gate:** staged publication is reproducible and privacy audit is clean.

## WP05 — Accessibility, responsive, and performance hardening

**Files:** `tests/browser/acceptance.spec.js`, `tests/*.test.js`, `styles/base.css`, `styles/case-studies.css`, `styles/responsive.css`.

- [ ] Run keyboard/focus, reader mode, reduced-motion, inert gate, no-JavaScript, download, and route acceptance tests.
- [ ] Run desktop and 390px smoke checks for all changed surfaces; record horizontal overflow as zero or explain any exception.
- [ ] Check semantic names for every object, role, relationship, legend, and evidence boundary.
- [ ] Confirm no autoplay, hidden telemetry, full-page blur, neon glow, or oversized plush controls were introduced.
- [ ] Record performance observations separately from functional correctness; do not infer hosted performance from local tests.

**Exit gate:** all local checks pass and remaining visual concerns are explicitly accepted or reopened.

## WP06 — Content and evidence provenance

**Files:** `data/projects.js`, `scripts/media/*.js`, `docs/2026-09-10-site-first-execution.md`, `EVIDENCE_LEDGER.md`.

- [ ] Re-read every changed claim for ownership, upstream attribution, historical qualifier, and evidence source.
- [ ] Keep ShareCLI recorded `.cast` evidence separate from the illustrative Workbench.
- [ ] Keep NetWeave artwork labeled as explanatory, deterministic, and non-telemetry material.
- [ ] Keep OmniRoute labeled as external contribution, not owned or maintained software.
- [ ] Confirm management/engineering lens variants remain generic canonical roles; do not create Anduril-specific variants.

**Exit gate:** content review signs off with no unsupported adoption, scale, ownership, or live-rank claims.

## WP07 — Release candidate and hosted checks

**Files:** Git worktree, `package.json`, `vercel.json`, release notes, CI configuration if present.

- [ ] Run `npm run verify` from the reconciled Git worktree, not only the source copy.
- [ ] Inspect the full staged publication diff and verify the exact commit contains only approved files.
- [ ] Create a release candidate commit only after explicit approval; do not push yet.
- [ ] If hosted CI is configured, inspect its actual run and report its URL/status; never substitute local results.
- [ ] Prepare rollback commit/SHA and deployment metadata before any production action.

**Exit gate:** candidate is locally verified, reviewable, and has a rollback reference.

## WP08 — Deployment and production smoke

**Files:** deployment metadata, production smoke report, rollback notes.

- [ ] Obtain explicit deployment approval separate from commit/push approval.
- [ ] Deploy only the approved candidate through the configured Vercel path.
- [ ] Verify canonical URL, route availability, construction gate, no-JavaScript fallback, downloads, and changed artifact surfaces.
- [ ] Capture production screenshots and compare against approved local screenshots.
- [ ] Monitor for the agreed observation window; record errors and rollback decision criteria.

**Exit gate:** production smoke passes and the release is either accepted or rolled back using the recorded SHA.

## WP09 — Post-release operations and next cycle

**Files:** `IMPLEMENTATION_STATUS.md`, `PRODUCTION_CUTOVER.md`, new dated handoff note.

- [ ] Record deployed commit, deployment identifier, timestamp, and smoke result.
- [ ] Reconcile any drift between source, Git, staged output, and production.
- [ ] Archive screenshots and evidence with stable names; do not delete raw evidence without approval.
- [ ] Open the next WBS from observed issues, not from speculative feature scope.
- [ ] Revisit the design packet only when a concrete acceptance finding or new user requirement exists.

## Immediate next action

The next authorized action is WP01 human visual acceptance. Until that decision is written, WP03-WP08 remain blocked. The current safest handoff is to review the three visual-qa surface groups and return `APPROVE ALL`, `APPROVE SELECTED`, or a named revision.
