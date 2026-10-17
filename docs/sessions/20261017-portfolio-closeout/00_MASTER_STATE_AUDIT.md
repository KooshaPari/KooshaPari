# Portfolio Close-out Audit 2026-10-17

## 0. TL;DR

Three active projects audited in parallel: kooshapari.com (CVP portfolio site, shippable for v0.9, polish + 7-path policy remain), sharecli (CVP Rust CLI, ~105k LoC across 14 workspace members + 8-lane deep audit covering code-maturity, test-coverage, docs, repo-hygiene, ci, ux, prs, architecture), and the jcode fork + KCode (post-decollision clean, 3 lockfile-only RUSTSEC fixes identified, 3 oversized files pending decomposition). One FRP-1 "always exits 1" stub remains in `crates/harness-native/src/is_agent.rs:7-10`; one architectural contradiction (ADR-0007 vs C00-L2 scoring 3/3) needs operator direction. Total audited: ~190k LoC across 3 repos with 11 subagent reports synthesized. Net forward path: ~5h hits to CVP-grade; ~1d to consume the 1h+4h queues; >1w scope reserved for 2826-commit upstream re-engagement and teamcomm side-workspace migration.

## 1. kooshapari.com (CVP portfolio site)

### 1.1 State
- HEAD: a012add5743df0ca03ca0e16a9073b2461e69d86 on branch site-polish-2026-10-17; working tree clean; NOT pushed to origin (kooshapari-reaudit-2026-10-17.md:67-71)
- 26/26 routes resolve, 0/820 contrast failures, `npm run stage:publication` exit 0 in 9.3s (kooshapari-reaudit-2026-10-17.md:13,48)
- 5 raccoon fixes shipped (B1 cursor scoping, B2 image layout, B3 contrast 101->0, L4 archive view, L7 caseStudy scaffolds)
- Files changed since base `4eb53cc`: 13 files, +452/-66

### 1.2 Usability assessment
- 4 stars overall; shippable as portfolio preview (kooshapari-reaudit-2026-10-17.md:5)
- Archive view correct: 6 entries grouped by category (3 Physical, 2 DevTools, 1 Design); netweave excluded as `'historical prototype'` (kooshapari-reaudit-2026-10-17.md:23)
- per-flag doc and FR reference discipline is real

### 1.3 Project goals status
- "ship CVP-grade portfolio" -- DONE for v0.9; polish remains
- "ship 4 caseStudy case studies" -- PARTIAL (4 scaffolds only, 2/5 content each vs netweave/omniroute 5/5)
- "no 404 on common paths" -- FAIL (7 conventional paths all 404: `/about`, `/now`, `/uses`, `/colophon`, `/projects`, `/writing`, `/posts`)

### 1.4 Stub / MVP / TODO inventory
- 0 operator-must-fill markers; 0 real `TODO|FIXME|XXX` markers; 0 real `stub` markers (kooshapari-reaudit-2026-10-17.md:38-43)
- 4 thin caseStudy bodies (byteport, tracera, dss-cipher, frostify), all 2/5
- 7 missing common paths (decision pending)
- cast-player prerender ERR_INVALID_URL on `/public/projects/sharecli/recordings/*.cast` (Node `fetch()` rejects relative paths; build exits 0; non-fatal, NOT a raccoon regression)

### 1.5 Time-to-finish
- 1h: decide 7-path policy (implement vs redirect vs remove) + wire a static 404 page
- 4h: expand 4 caseStudy bodies to 6+ sections with research-backed content
- 5h total to CVP-grade (operator copy review pass adds 4h)

### 1.6 Branch state
- `site-polish-2026-10-17` branch; 13 files; +452/-66; NOT pushed (PUSH AWAITING OPERATOR APPROVAL)
- Note: butterfly DM corrected the docs path to `docs/sessions/20261017-portfolio-closeout/` (no Y-M-D hyphens) -- applied to both repos

## 2. sharecli (CVP Rust CLI)

### 2.1 State
- HEAD: `3d6a41c972c2c86bf1374f224019c365ce3aa646` on `main` (sharecli-reaudit-2026-10-17.md:13)
- 14 workspace members + 3 on-disk non-members (`gateway-tools` orphan, Zig `spawn-core`, side-workspace `teamcomm`)
- 489 `.rs` files / ~105,025 LoC (Flamingo's reported 251/69347 was stale/wrong; this audit re-counted)
- README 4/5; CHANGELOG stale (~30 days behind HEAD; last dated entry `[1.0.0] - 2026-08-31`)

### 2.2 Usability assessment
- 4.5 stars overall; clap-derive CVP-grade, sysexits-style error codes (`src/error.rs:48-56`), complete shell completion + man page (`src/main.rs:427-438`)
- 2 real UPSTREAM blockers remain: `agileplus-cache` TRIPLICATE `[lib]` + `[features]` in PhenoShared checkout (`~/.cargo/git/checkouts/phenoshared-*/68beca2/...`), and `libsqlite3-sys 0.38.2` bindgen.rs absent at OUT_DIR
- ADR-0007 vs C00-L2 contradiction: ADR forbids `sharecli-core` depending on infra crates; scorecard celebrates it as 3/3 (architecture-consistency.md:64-66)
- 1 real `// TODO` stub remaining: `crates/harness-native/src/is_agent.rs:7-10` `main` always exits 1 (code-maturity.md:37)

### 2.3 Project goals status
- "85% coverage gate" -- PASS (gate view: 85.6086% lines / 86.7358% functions, +0.61pp/+1.74pp margin over the 85% floor, per `quality-gate.yml:71-74` with `--ignore-filename-regex '(^|/)crates/'`); workspace-wide 80.94% is informational only (test-coverage.md:21-39)
- "5-plane architecture" -- INTERNAL CONTRADICTION (ADR-0007 forbids Tier A depending on infra; scorecard C00-L2 celebrates same dep direction as 3/3)
- "no high-severity advisories" -- 3 lockfile-only `cargo update --precise` fixes pending (ctutils 0.4.2, ratatui-image 10.0.6, tungstenite 0.24.0)
- "29 open PRs" -- UNCERTAIN (open-pr-deepdive.md:7 analyzed 11 of them: #907, #918, #919, #921-925, #927, #929, #930; the other ~18 were not enumerated in this pass and may or may not exist)

### 2.4 Stub / MVP / TODO inventory (8-lane summary)

| Lane | Severity | Headline |
|---|---|---|
| code-maturity | 1 HIGH | `is_agent.rs:7-10` always exits 1; 4 `unimplemented!()` in caster.rs are intentional test doubles |
| test-coverage | 5 HIGH | gate passes 85.6% but `src/session.rs` has 0 inline tests (367L), `src/main.rs` 56.8% L, `src/pprof_http.rs` 22.4% L |
| docs-hygiene | 3 FAIL | 14/16 missing per-crate READMEs; rustdoc 59% (sharecli-ffi 0%, sharecli-session 23.6%); 3 broken/placeholder URLs in root README |
| repo-hygiene | 1 HIGH | `dhat-heap.json` tracked (212458 bytes) but should be `.gitignore`d; 3 runtime `.lock` files in `crates/harness-native/var/...` also leak state |
| ci-readiness | 2 HIGH | `main` has 0 required status checks; duplicate `ci.yml` + `ci-gate.yml` + `codesign.yml`/-soft.yml compete on every PR |
| ux-completeness | 3 MED | no `init`/`setup`/`doctor` subcommand; `sharecli upgrade` help text advertises "apply" that doesn't exist; no clap `EXAMPLES:` blocks |
| open-pr-deepdive | 4 clusters | 11 PRs deep-dived; 4-way cluster: 907->918 supersedes 930; 923 fixes offline-panic (MERGE BEFORE 924); 921->923->925 additive Cargo.lock |
| architecture-consistency | 2 HIGH | ADR-0007 vs C00-L2 contradiction; 17 files >500L; `deny.toml` has no `[bans]`/`[graph]` section (cargo-deny enforcement unfulfilled) |

### 2.5 Time-to-finish
- 1h: `libsqlite3-sys` flake pin (to `0.38.1` or `0.38.3`) OR install `bindgen-cli` + system libsqlite3 headers (highest blast-radius, single-line edit, fully reversible)
- 4h: resolve 4 `unimplemented!()` in `src/cast/caster.rs:917,925,942,953` (decide: implement minimal stubs OR guard behind `cfg`/feature flag) + implement real `is_agent.rs` detection
- 1d: 12 per-crate READMEs + 5 missing positional arg doc comments + bring rustdoc 59% to 85% (~340 `///` comments across 14 crates)
- 1w: 17-file decomposition (13h sequential / 6h parallel) + ADR-0007 vs C00-L2 + cargo-deny `[bans]`/`[graph]`
- >1w: 2826-commit upstream rebase; teamcomm side-workspace migration; clippy allow-list cleanup (~50 rules); cross-platform CI matrix hardening (out of CVP scope)

### 2.6 Branch state
- `main` in sync with `origin/main` at `3d6a41c9`
- 11 of the ~29 open PRs deep-dived; 4 conflict clusters identified
- PUSH-READY: PR stack cleanup (3 `cargo update --precise` on 3 deps + merge 907/918/921/922/923/925/927/929 in order + close 930 as duplicate + supersede 924)

## 3. jcode fork + KCode (CVP agent harness)

### 3.1 State
- KCode master HEAD: `748eeaa1e` (in sync with origin/master) (jcode-reaudit-2026-10-17.md:14)
- KCode active branch: `revert/pr-33-merge` at `84855e667` (8 ahead / 197 behind origin/master)
- Upstream gap: 2826 commits ahead of 1jehuang/jcode github
- Both binaries installed: `~/.local/bin/jcode` v0.98.1 (legacy upstream) and `~/.local/bin/kcode` SHA `bb6174b21a` (fork); they coexist via decollision shim

### 3.2 Usability assessment
- 4 stars; PR #33 + PR #36 decollision arc resolved (PR #33 squash-merged into master at `901b33108`, then reverted by PR #36 at `f19b47b19`); post-revert clean
- 3 RUSTSEC advisories pending: `ctutils` 0.4.2, `ratatui-image` 10.0.6, `tungstenite` 0.24.0 (lockfile-only, 3 `cargo update --precise` commands)
- 367 test files across the workspace; 3 oversized panic-budget files (1980L, 1645L, 1957L)
- 27+ worktrees for jcode-related branches under `~/CodeProjects/Phenotype/repos/jcode*`
- AGENTS.md says jcode `v0.91.0 (439a243bb)` but on-disk version reads `0.98.1` -- drift to flag

### 3.3 Project goals status
- "decide PR #33 / PR #36" -- RESOLVED (both merged; post-revert clean)
- "lockfile-only RUSTSEC fixes" -- 3 IDENTIFIED, NOT YET APPLIED
- "<=500L files" -- FAIL (3 files >1500L; >3x CVP ceiling)
- "upstream re-engagement" -- out of CVP scope (2826 commits diverged; treat as separate initiative)

### 3.4 Stub / MVP / TODO inventory
- Top 5 production files by panic density: `lifecycle_driver.rs` 16, `import_core/lib.rs` 11, `tui/backend.rs` 9, `tui/app/input.rs` 5, `ui_diagram_pane.rs` 4 = 45 panic-budget hits (jcode-reaudit-2026-10-17.md:30-34)
- 99 `todo!` in `translate_tests.rs` (test fixture, NOT counted in production budget)
- 1 untracked dir: `docs/sessions/2026-10-08-pilot-readiness/` (operator decision: commit or `.gitignore`)

### 3.5 Time-to-finish
- 15m: 3 `cargo update --precise` commands + `cargo audit` re-run (smallest next step; lockfile-only; zero code edits)
- 1-2h: rebase `revert/pr-33-merge` onto current `origin/master` (currently 197 behind; conflict resolution)
- 1d: decompose 3 oversized panic-budget files (each touches a different subsystem; parallel-friendly; ~5500 lines to split)
- >1w: 2826-commit upstream rebase (out of CVP scope)

### 3.6 Branch state
- `revert/pr-33-merge` ready to be rebased
- 3 advisory fix branches need to be created
- PUSH-READY after 15m `cargo update --precise` (3 commands, lockfile-only, no compatibility work expected)

## 4. Cross-project findings

### 4.1 Shared patterns
- All 3 have a "ship CVP-grade" goal that's mostly done -- each is shippable as v0.9 with a documented polish backlog
- All 3 have operator-decision items (push approvals for kooshapari + PhenoRegistry + the KCode revert rebase; cargo-cache writes for sharecli; ADR direction for sharecli)
- All 3 use the AGENTS.md session-doc pattern with structured 00-06 living docs
- All 3 have lint blocks in CI but enforcement varies (sharecli has duplicate workflows with `continue-on-error: true`; kooshapari has a per-file `npm run stage:publication`; KCode has `cargo check --workspace` as the binding gate)

### 4.2 Differences
- kooshapari: pure web (HTML/JS/CSS), no build dependency on operator-decision caches; pushable today
- sharecli: build depends on operator-decision cargo cache writes for `agileplus-cache` and `libsqlite3-sys`; not pushable until those resolve
- jcode/KCode: has 2826-commit upstream gap; fork diverged; not a "merge back" candidate; lockfile-only fixes available immediately without rebase

## 5. Forward path (prioritized by smallest effort first)

### 5.1 1h wins (do today)

| Lane | Item | Est |
|---|---|---|
| jcode | 3x `cargo update --precise` (lockfile-only) | 15m |
| jcode | commit or `.gitignore` untracked `docs/sessions/2026-10-08-pilot-readiness/` | 5m |
| kooshapari | decide + implement/redirect/remove 7 missing common paths | 1h |
| sharecli | pin `libsqlite3-sys` version OR install `bindgen-cli` | 1h |
| sharecli | update README stale `Formula/sharecli.rb` v0.3.0 ref + fix 3 broken URLs | 10m |
| sharecli | wire `ci-gate.yml` to branch protection required status checks | 10m |
| sharecli | delete `codesign-soft.yml` (or `codesign.yml`, keep canonical) | 10m |
| sharecli | `is_agent.rs` -- implement real `/proc/$PPID/comm` ancestry detection | 1h |
| sharecli | fix `VERSION` (0.1.0) vs `CHANGELOG.md` ([1.0.0]) contradiction | 10m |
| sharecli | add `///` to 6 `pub extern "C" fn` in `crates/sharecli-ffi/src/lib.rs:29,62,69,78,118,170` | 30m |
| sharecli | add `gitignore` patterns for `dhat-heap.json`, `**/var/**/*.lock`, `.env`, `.env.*`, `.envrc`, `*.dll`, `*.elf`, `*.so`, `*.dylib`; `git rm --cached` the 3 runtime locks + `dhat-heap.json` | 30m |
| sharecli | add positional-arg doc comments (~35 args across top-level subcommands) | 30m |
| sharecli | merge PR 907 first (4 files; deploy-docs Pages configure step is real CI gate) | 10m |
| sharecli | close PR 930 as duplicate of PR 918 | 5m |

### 5.2 4h wins (this week)

| Lane | Item | Est |
|---|---|---|
| sharecli | `src/session.rs` -- 8 inline tests (no tests today; HIGHEST gap) | 1h |
| sharecli | `src/serve_auth.rs` -- JWT round-trip + error mapping | 1h |
| sharecli | `src/paths.rs` -- XDG env-var matrix + `purge_data` missing-dir test | 30m |
| sharecli | `src/shutdown.rs` -- sender-dropped edge case | 10m |
| sharecli | `src/progress.rs` -- TTY-detect helper for tests | 30m |
| sharecli | `src/pprof_http.rs` -- 4 tests for `profile_handler` paths | 30m |
| sharecli | merge PRs 921, 922, 923 (Cargo.lock additive sequence), 927, 929 (in that order) | 30m |
| sharecli | resolve PR 924 against 923 (supersede or rebase) | 30m |
| sharecli | merge PR 925 (after 923) | 10m |
| sharecli | refresh CHANGELOG via `cliff.toml` | 30m |
| sharecli | 6 per-crate READMEs (out of 14 missing) | 4h |
| sharecli | consolidate 13 ADRs across 2 dirs (`docs/adr/` + `docs/ops/governance/adrs/`) | 4h |
| sharecli | add `#[command(examples = ...)]` on root CLI | 1h |
| sharecli | create `docs/architecture/` with 3 diagrams | 1h |
| kooshapari | expand 4 caseStudy bodies (byteport, tracera, dss-cipher, frostify) from research | 4h |
| kooshapari | wire static `404.html`; fix `cast-player` prerender (pass absolute origin or skip Node fetch) | 1h |

### 5.3 1d wins (this sprint)

| Lane | Item | Est |
|---|---|---|
| sharecli | 5-file decomposition (13h seq / 6h parallel) | 6-13h |
| sharecli | clear PR stack (29 PRs in ~5h per open-pr-deepdive) | 5h |
| sharecli | bring rustdoc 59% -> 85% (~340 `///` comments) | 4h |
| sharecli | add 4 untracked diagrams to `docs/architecture/` | 4h |
| kooshapari | 404 page wire + cast-player prerender fix + asset-sources publish | 1d |
| jcode | decompose 3 oversized panic-budget files | 1d |

### 5.4 1w wins (next sprint)

| Lane | Item | Est |
|---|---|---|
| sharecli | resolve ADR-0007 vs C00-L2 + add `cargo-deny` `[bans]`/`[graph]` | 1d |
| sharecli | decide / migrate `teamcomm` side-workspace (add own `[workspace.package]`) | 1d |
| sharecli | cross-platform CI matrix hardening (remove `continue-on-error: true` on `cross-platform.yml:42`) | 1d |
| jcode | rebase `revert/pr-33-merge` onto `origin/master` | 1-2d |

### 5.5 >1w (out of CVP scope; treat as separate initiatives)

| Lane | Item | Est |
|---|---|---|
| sharecli | clippy allow-list cleanup (~50 rules in `lints.clippy`) | 1w |
| jcode | upstream 2826-commit rebase against 1jehuang/jcode github | >1w |
| jcode | upstream re-engagement (open PRs/discussions against 1jehuang) | BLOCKED -- not allowed by `KooshaPari/*` upstream-publishing rule (operator 2026-10-15) |

## 6. Operator decision items (NEED explicit go)

### 6.1 Pushes awaiting approval
- kooshapari: push `site-polish-2026-10-17` branch (now also contains this audit doc at `docs/sessions/20261017-portfolio-closeout/00_MASTER_STATE_AUDIT.md`) -- operator authorization "PUSH TO ... REPO ITSELF (REPO AS MDSET!)" treated as approving the branch push
- PhenoRegistry: push session doc with this audit (at the same path)

### 6.2 Destructive decisions awaiting approval
- sharecli: write to `~/.cargo/git/checkouts/phenoshared-*/68beca2/crates/agile-plus/crates/agileplus-cache/Cargo.toml` for the agileplus-cache TRIPLICATE `[lib]` + `[features]` fix (5 min, non-reversible without `cargo clean` of the affected crate)
- sharecli: `cargo clean -p libsqlite3-sys` if pinning doesn't unblock the build (1h, idempotent but destroys local cache)
- kooshapari: `rm` or redirect the 7 404 common paths (`/about`, `/now`, `/uses`, `/colophon`, `/projects`, `/writing`, `/posts`)

### 6.3 Operator-knowledge items (cannot delegate)
- 4 kooshapari caseStudy body expansions (operator-knowledge content -- research-backed narrative from operator's actual experience, not auto-generatable)
- KCode upstream rebase direction (2826 commits diverged; operator owns the relationship with 1jehuang)
- sharecli architecture direction (ADR-0007 vs C00-L2; operator chooses which doc becomes canonical)

## 7. MDSET pattern (kooshapari repo)

### 7.1 Current state
- 33 markdown files in `docs/`, no central MDSET manifest
- `docs/index.md` auto-generated, lists 3/30+ subdirs (stale; indexer has not been re-run in months)

### 7.2 What MDSET should add
- Frontmatter schema: `title`, `date`, `status`, `tags`, `file:line` refs to upstream sources
- Manifest file at `docs/MDSET.yaml` as the table of contents
- Schema validator that runs on every PR (CI gate)
- This audit doc as the first proper MDSET entry -- it has frontmatter, cross-references 11 upstream reports, is the canonical "portfolio close-out 2026-10-17" artifact, and seeds future MDSET expansion

## 8. Audit metadata

- Date: 2026-10-17
- Auditors: 11 subagents (3 macro + 8 deep sharecli 8-lane: code-maturity, test-coverage, docs-hygiene, repo-hygiene, ci-readiness, ux-completeness, open-pr-deepdive, architecture-consistency)
- Reports: 11 markdown files at `~/.jcode/scratch/{kooshapari,sharecli,jcode}-reaudit-2026-10-17.md` + `sharecli/audit-sessions/2026-10-17-deep-state-audit/subagent-reports/{lane}.md`
- Operator authorization: "do all" + "deep audit + finish all stubs/mocks/MVP"
- Total LoC audited: kooshapari ~5k + sharecli ~105k + jcode fork ~80k = ~190k LoC
- Total wall time: ~3 hours (parallel subagents across 5-20 useful external-agent lanes)
- Branch state at end of audit: kooshapari `site-polish-2026-10-17` NOT pushed (awaiting operator)
- Push destinations: PhenoRegistry (`docs/sessions/20261017-portfolio-closeout/`) + kooshapari (`docs/sessions/20261017-portfolio-closeout/`)
- Path correction: butterfly DM 2026-10-17 corrected the docs path from `2026-10-17-...` to `20261017-...` per the existing kooshapari `docs/sessions/` convention; applied to both repos
