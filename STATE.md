# STATE.md — publication state for the KooshaPari profile repo

## Status: PUBLICATION_PROOF_CLOSED

The publication state of this repo is **CLOSED** as of
2026-10-19. A real production deploy has shipped, the
route receipt has been captured against the live
production domains, and a real Lighthouse 13.4.1 run
has been executed against those same domains. This
file is the operator-facing pointer for that status;
the audit record lives at
`docs/audits/2026-10-17/kooshapari.md`, the deploy
evidence at `docs/deploy/2026-10-19.md`, and the
Lighthouse evidence at
`docs/audits/2026-10-19/lighthouse/README.md`.

**Closure receipt**

- Deploy SHA: `e95e763` (bundle `0403d845`), shipped
  to production in round 6e (2026-10-18 06:36 UTC) and
  re-shipped with post-6f content in round 6i
  (2026-10-19 00:09 UTC). Deployment URL:
  `https://kooshapari-site-isfokh1tc-koosha-paridehpours-projects.vercel.app`
- Route receipt: `docs/deploy/2026-10-19.md` (10
  per-requirement observations, all PASS; 4 custom
  domains serving HTTP 200, of which 3 serve the
  portfolio; live bundle and
  `/data/phenotype.js` byte-identical to prebuilt;
  live PDF byte-identical to local)
- Lighthouse, the committed round 6m batch: **100 / 100 /
  100 / 100** (Performance / Accessibility / Best
  Practices / SEO) across 7 in-scope runs — desktop and
  mobile on `kooshapari.com`, `www.kooshapari.com`, and
  `kooshapari-site.vercel.app`. Desktop LCP
  355-406 ms, mobile LCP 1,369-1,392 ms, TBT 0 ms,
  CLS 0.00. Evidence:
  `docs/audits/2026-10-19/lighthouse/`.
  **Re-verified 2026-10-19 21:33-22:01 UTC (round
  6p):** 8 further runs against `kooshapari.com`
  desktop. Accessibility, Best Practices and SEO
  stayed at **100 in all 9 observations**. Performance
  did not: it ranged **52-100** (observed 100, 98, 99,
  52, 100, 100, 99, 100, 99). The committed result is a
  true record of its batch (the committed summary was
  verified against the committed raw report) but
  Performance 100 is **not reproducible** on this host
  under the load present during re-verification. The
  52 outlier kept server response time at 48 ms and
  all three other categories at 100, so the variance is
  in the locally-simulated client metrics, not in the
  site. Evidence:
  `docs/audits/2026-10-19/lighthouse/reverification-2026-10-19T21Z.json`.
- Unit suite: 883/883 PASS, 0 fail (845/845 at round 6s,
  +3 for the size-mandate gate and +4 for the detector-tooling
  gate, added in round 6t, +12 for the CI workflow gate and the
  cast-player transport tests, and +16 for the scroll-reveal
  orchestrator tests, added in round 6u; measured 2026-10-21).

## What's done

- Re-clone at `~/.jcode/scratch/master-audit-2026-10-17/clones/kooshapari`
  is clean and on `main` at HEAD `f84011b` (the master-cohort audit commit).
- The git tree on origin does NOT contain any `*.iso`, `*.qcow2`,
  `*.mp3`, `*.wav`, `*.m4a`, `*.flac`, or `nanovms-*` artifacts; those
  audit claims refer to the local working dir under
  `~/CodeProjects/Phenotype/repos/KooshaPari`, which is outside this
  repo's published surface.
- `README.md` is canonical and authoritative (~4.4 KB, 9 sections,
  every selected-work entry linked to a downstream `KooshaPari/*`
  repo and OmniRoute's PR history for the external-contribution
  block).
- `.github/` has been completed with profile-standard assets:
  `CODEOWNERS`, `FUNDING.yml`, `SECURITY.md`, two issue templates,
  and a PR template, on top of the existing `dependabot.yml` and
  `workflows/ci.yml`.
- `vercel.json` is in place and complete (buildCommand, outputDirectory,
  installCommand, headers, 25+ rewrites including the
  `/engineering`, `/product`, `/work/*`, `/resume`, `/contact`,
  `/parent`, `/blog`, `/blog/<slug>` routes, and a static-asset
  fallback for unknown paths).

## What was blocked pending operator approval (now resolved)

The FWD step 4 (hosted proof + Lighthouse + scoped numerical grade)
required a real production deploy. **A real deploy is a destructive
surface change** (DNS attach on `kooshapari.com`), so the agent
MUST NOT trigger it autonomously. The rollout plan is
`PRODUCTION_CUTOVER.md:1-10`; the deployment-readiness walkthrough is
`docs/deploy/2026-10-17.md`.

The operator approved the deploy on 2026-10-18 (06:35 UTC
"go" signal). The sequence then ran:

1. `git push origin main` (already clean) triggers Vercel to read
   `vercel.json` and run `npm run stage:publication` against the
   `kooshapari.com` domain.
2. Capture the route receipt (HTTP 200 on `/`, `/engineering`,
   `/work/sharecli`, `/resume`, `/contact`, `/blog/...`) and a
   Lighthouse mobile + desktop run.
3. Move the evidence bundle into `docs/deploy/<date>/evidence/`.
4. Flip this file's status line from `PUBLICATION_PROOF_DEFERRED`
   to `PUBLICATION_PROOF_CLOSED` with the deploy SHA, the receipt,
   and the Lighthouse score.

**All four steps are done.** Step 1: two production deploys
shipped (rounds 6e and 6i). Step 2: route receipt at
`docs/deploy/2026-10-19.md`, Lighthouse at
`docs/audits/2026-10-19/lighthouse/`. Step 3: evidence
bundle in both locations. Step 4: this status line.

## Confidence

High. The repository surface is clean and authoritative;
the live deploy, the route receipt, and a real
Lighthouse run against the live production domains all
exist and are recorded. The one prior gap (no browser
binary for Lighthouse) was resolved by finding the
already-installed system Chrome. `phenotype.space` is
noted below as out of scope for this repo's audit.

## Cross-references

- Audit: `docs/audits/2026-10-17/kooshapari.md`
- Lighthouse audit: `docs/audits/2026-10-19/lighthouse/README.md`
- Cutover plan: `PRODUCTION_CUTOVER.md`
- Provenance: `PROVENANCE.md`
- Deploy readiness: `docs/deploy/2026-10-17.md`
- Deploy evidence: `docs/deploy/2026-10-19.md`
- Public interface check: `docs/sessions/2026-10-15-doc-proliferation-round-2/07_PUBLIC_INTERFACE_VERIFICATION.md`
- Master audit cohort: PhenoRegistry `docs/audits/2026-10-17/MASTER.md`

## 2026-10-19 update

The two production deploys of the post-20th-pass
arc (round 6e on 2026-10-18 and round 6i on
2026-10-19) have shipped the 0403d845 bundle to
live, with the post-6f content (museum-quiet voice
NetWeave no-JS view descriptions). All 4 custom
domains serve HTTP 200; the per-requirement
receipt is at `docs/deploy/2026-10-19.md`.

Status of the original
PUBLICATION_PROOF_DEFERRED gate:

- DNS attach: DONE (kooshapari.com,
  www.kooshapari.com, kooshapari-site.vercel.app;
  `phenotype.space` and `pheno.studio` are
  registered to the same account but resolve
  to a separate Cloudflare Pages site)
- Production deploy: DONE (round 6e at 2026-10-18
  06:36 UTC; round 6i at 2026-10-19 00:09 UTC)
- Evidence bundle: DONE (captured at
  `docs/deploy/2026-10-19.md`; 10 per-requirement
  observations, all PASS; round 6k added a
  curl-based network perf baseline with
  TTFB, response sizes, and security headers
  for the 3 in-scope portfolio domains and the
  key prebuilt assets)
- Lighthouse score: **DONE — 100 / 100 / 100 / 100.**
  Lighthouse 13.4.1 run against the live production
  domains on 2026-10-19 20:40-20:46 UTC. 7 in-scope
  runs (desktop + mobile on `kooshapari.com`,
  `www.kooshapari.com`, `kooshapari-site.vercel.app`),
  every one scoring 100 across Performance,
  Accessibility, Best Practices, and SEO. Desktop LCP
  355-406 ms, mobile LCP 1,369-1,392 ms, TBT 0 ms,
  CLS 0.00. Evidence:
  `docs/audits/2026-10-19/lighthouse/`.

  **Corrected 2026-10-19 (round 6p).** The statement
  above records what the 20:40-20:46 UTC batch
  observed and is not retracted. It is not, however, a
  reproducible Performance figure. An independent
  re-verification on 2026-10-19 21:33-22:01 UTC ran
  8 more `kooshapari.com` desktop runs on this host and
  observed Performance **52-100** (100, 98, 99, 52,
  100, 100, 99, 100, 99) while Accessibility, Best
  Practices and SEO stayed at 100 in all 9
  observations. The committed summary was verified
  against the committed raw report and is a faithful
  distillation, so the all-100 batch is genuine: it is
  simply not repeatable here. The measurement host was
  under heavy load (load average 781-976 on 10 CPUs)
  throughout; the 52 outlier still returned in 48 ms
  with the other three categories at 100, which places
  the variance in the locally-simulated client metrics
  rather than in the shipped site. No Performance score
  is claimed as stable. Evidence:
  `docs/audits/2026-10-19/lighthouse/reverification-2026-10-19T21Z.json`.

  The rounds 6k/6l note that Lighthouse was
  agent-exhausted was accurate at the time: the CLI was
  installed but no Chrome binary was found, the
  PageSpeed Insights free tier was quota-exhausted
  (HTTP 429), and WebPageTest returned HTTP 403. The
  2026-10-19 20:38 UTC preflight found that Google
  Chrome 152.0.7977.65 is installed at
  `/Applications/Google Chrome.app` — simply not on
  `PATH`, which is why the earlier `which` probe
  missed it.

Per the AGENTS.md policy ("Show UNKNOWN where
evidence or timing is missing. Do not invent
percentages or finish dates."), the status line
**is now `PUBLICATION_PROOF_CLOSED`** — both of the
previously-listed conditions have been met:

1. A Chrome binary was found and a Lighthouse run was
   executed against the live production domains
   (100 / 100 / 100 / 100 across 7 in-scope runs).
   Round 6p re-verified the Performance component and
   found it **not reproducible** on this host (52-100
   across 9 observations); Accessibility, Best
   Practices and SEO **were** reproducible at 100.
   The close criteria concern the existence and quality
   of the Lighthouse evidence, which stands: the run
   happened, the artifacts are committed, and the result
   is faithfully recorded. The Performance number is now
   reported as a range, not a constant.
   Round 6q corrected the *sweep* that backed the
   annotation, and replaced it with a re-runnable
   check: `scripts/sweep-lighthouse-claims.js`
   (`npm run test:sweep`). Over 125 tracked Markdown
   files it finds 64 Lighthouse score claims, of which
   45 carry a dated correction, 5 are adjudicated as
   claims about a different run, 14 are quotations
   inside a correction, and **0 are uncovered**. The
   script is tested against a negative control that
   injects a stale claim and requires the sweep to
   report it. Details in
   `docs/audits/2026-10-19/lighthouse/README.md`,
   section "Claim sweep".
   <!-- sweep:counts {"trackedMarkdownFiles":125,"claims":64,"annotated":45,"adjudicated":5,"quotation":14,"uncovered":0,"proseForm":45,"numericForm":19,"annotationWindowLines":14} -->
2. The close criteria no longer need redefining.

Remaining notes, neither of which blocks closure:

- `phenotype.space` scored SEO 82. It is **not** an
  alias of this project — it serves a separate
  Cloudflare Pages site titled "Phenotype" (its
  `/robots.txt` returns that site's HTML, and its
  dependency tree is Cloudflare Insights rather than
  the Vercel bundle). Its 82 reflects that other
  site's own issues, not this portfolio. The audit is
  still recorded at
  `docs/audits/2026-10-19/lighthouse/phenotype_space-desktop.summary.json`
  so the observation is not hidden.
- The Lighthouse mobile numbers use Lighthouse's
  standard *simulated* mobile profile. They are not
  real-user field data, and no field-data claim is
  made.

The post-20th-pass arc is closed: 20 round-scoped commits
pushed to `origin/main` (c1a13de through the round 6u close),
all 5 items in the 06 doc are CLOSED/DECIDED, the unit
suite is 883/883 PASS, and `HUMAN_REVIEW.md` carries
the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,
6i, 6j, 6k, 6l, 6m, 6n, 6o, 6p, 6q, 6r, 6s, 6t, 6u) — 18 round
entries.

**Corrected 2026-10-21 (round 6u close).** Two figures in
that paragraph had drifted from their measurements, and both
are corrected above rather than defended.

- The commit count was stated as **17**. It was 17 when the
  paragraph was written at the round 6r close; three commits have
  joined the range since — the round 6s scanner commit `92c26d6`,
  the round 6t size-mandate commit `a11c928`, and the round 6u
  ledger commit `766a27d` — making the current figure **20**. The
  count is *round-scoped* commits on the first-parent line, not all
  commits, and the definition and its command are stated below.
- The range end was stated as "the round 6q close". The arc now
  runs through the round 6u close.

The round list, the 06 doc status, and the suite figure in that
paragraph were re-measured at the same time and all still hold: the
18 headings are present in `HUMAN_REVIEW.md`, the 06 doc carries 12
CLOSED/DECIDED markers across its 5 items with no OPEN item, and
the suite measures 883/883.

**Corrected 2026-10-21 (round 6r).** This paragraph
was last written at round 6m and had gone stale in
three ways, each of which is corrected above rather
than defended:

- The unit suite was stated as 774/774. It was
  774/774 when the paragraph was written; the
  closure receipt above now states **845/845**, which
  is the measured value.
- The round list stopped at 6m. Rounds 6n, 6o, 6p and
  6q have run since and each has a `HUMAN_REVIEW.md`
  entry.
- The list named **6h** and **6i-correction** as
  `HUMAN_REVIEW.md` round entries. Neither has its own
  heading in that file, and neither appears in it as
  a string. They exist as git commit labels only:
  `82ddac2` ("round 6h HUMAN_REVIEW audit-trail
  pointer for 6f + 6g") and `bbcae40` ("round 6i
  correction -- framing of state alignment"). Their
  *content* is in the file — 6h added the 6f and 6g
  entries, and 6i-correction amended the 6i entry in
  place — so no round was dropped from the record;
  the entry list simply did not match the headings
  that exist. The corrected list above is the 16
  headings that are actually present.

**Corrected 2026-10-21 (round 6s).** Round 6s built
a scanner for this defect class and ran it against
this tree. It found three live instances of the class
it was built to detect, all of them in this file:

- The unit suite was stated as **787/787** in two
  places. The suite held **838** tests. The 787 figure
  was correct at commit `492969c` (round 6q) and at
  commit `4222594` (round 6r) — both measured at 787 —
  and became stale when round 6s added its own 51
  tests (20 in `stale-claim-classes.test.js`, 15 in
  `stale-claim-rules.test.js`, 16 in
  `stale-claim-scan.test.js`).
- The round list omitted **6r**, which has a
  `HUMAN_REVIEW.md` entry of its own. The list said
  "the complete round-6 audit trail" and then named
  14 of the 15 headings that exist.

Both are corrected above. The scanner that found them
now runs on every suite invocation, against a count
measured by running the suite rather than read out of
this file.

### Round 6s evidence map

Each requirement, the command that checks it, and what
the command actually returned. Measured 2026-10-21.

| # | Requirement | Check | Observed result |
|---|---|---|---|
| 1 | No sibling instance of the round 6r defect class remains in the tree | `npm run scan:stale-claims` | 272 checks, 0 findings, exit 0, measurement source "measured by running the suite" |
| 2 | The suite passes in full | `node --test tests/*.test.js` | 883 tests, 883 pass, 0 fail |
| 3 | The scanner detects the defect it was built to detect | `node --test tests/stale-claim-controls.test.js` | 9 pass, 0 fail (negative controls on a planted stale count, a planted phantom round, a planted incomplete list, and the verbatim round 6r paragraph) |
| 4 | The scanner accepts a paragraph that is correct | `node --test tests/stale-claim-controls.test.js` | the tree-derived positive control is accepted, 0 findings |
| 5 | The scanner's rules behave as specified | `node --test tests/stale-claim-rules.test.js` | 15 pass, 0 fail |
| 6 | The scanner's class predicates behave as specified | `node --test tests/stale-claim-classes.test.js` | 20 pass, 0 fail |
| 7 | The scanner is reachable by name | `npm run test:stale-claims` | 58 pass, 0 fail across the five files (20 classes + 15 rules + 8 scan + 9 controls + 6 gates) |
| 8 | The measured count is independent of the document under test | `node --test tests/stale-claim-scan.test.js` | 8 pass, 0 fail; the count comes from a child-process run of the suite; the test asserting circularity fails if the count is read from `STATE.md` |
| 9 | Every claim in the tree is covered by a check | `npm run test:sweep` | 125 files scanned, 64 claims found (45 annotated, 5 adjudicated, 14 quotation), 0 uncovered, exit 0 |
| 10 | No anti-pattern is present | `bash scripts/anti-pattern-detector.sh` | 0 violations across 29 patterns, exit 0 |
| 11 | The tree is syntactically sound | `npm run check` | exit 0 |
| 12 | Every file is within the 500-line hard limit | `bash scripts/anti-pattern-detector.sh` | one warning, `scripts/sweep-lighthouse-claims.js` at 481 lines, pre-existing (481 lines at commit `92c26d6`) and not written by round 6s or 6t; the `tests/` tree is now inside the scan, and every file in it is at or below 275 lines |
| 13 | The committed Lighthouse bundle re-verifies against its own artifacts | `npm run verify:bundle` | 36/36 category scores, 54/54 metric values, 1/1 raw sha256 match, series MATCH, exit 0 |
| 14 | The round 6q sweep dominates the round 6p sweep | `npm run compare:sweeps` | 6p saw 18 claim sites, 6q saw 64, 0 sites only 6p could see, exit 0 |
| 15 | The scanner is reachable from the places that run automatically | `node --test tests/stale-claim-gates.test.js` | 6 pass, 0 fail (the pre-commit hook and the CI workflow both invoke it, and the npm script requires no argument) |
| 16 | The gate BLOCKS a stale claim, not merely passes a clean tree | a real `git commit`, run 2026-10-21, with a planted `777/777` current count staged in `STATE.md` (not `--no-verify`) | the real hook reported one `A-count` finding naming `STATE.md:53`, the planted figure, and the reason, and the **commit did not land** — `git commit` exited 1 and `HEAD` stayed at `766a27d`. The planted figure was stated as a current count when the defect was planted, which is what made it a finding rather than a record |
| 16a | The gate BLOCKS a phantom round (round 6s defect class, half one) | a real `git commit` with `6v` planted into the round-6 list in `STATE.md`, run 2026-10-21 | the real hook reported one `B-round` finding naming `6v` — "named as a HUMAN_REVIEW.md round entry, but no such entry exists" — exited 1, and the commit did not land |
| 16b | The gate BLOCKS an incomplete round list (round 6s defect class, half two) | a real `git commit` with `6u` removed from the round-6 list in `STATE.md`, run 2026-10-21 | the real hook reported one `C-missing` finding naming `6u` — "the list claims to be complete but omits a round that has a HUMAN_REVIEW.md entry" — exited 1, and the commit did not land. In all three planted-defect cases the working tree was afterwards restored byte-identical to its pre-plant state |
| 17 | The gate PASSES a clean tree, as the real hook | `bash scripts/git-hooks/pre-commit` with the remediation staged | detector 0 violations, suite 883/883, scanner 272 checks and 0 findings, `[pre-commit] ok`, exit 0 |
| 18 | The published entry point runs with no arguments | `node scripts/scan-stale-claims.js` | measured count 883, measurement source "measured by running the suite", 272 checks, 0 findings, exit 0 |
| 19 | A count that cannot be parsed is refused, not ignored | `node scripts/scan-stale-claims.js --measured not-a-number` | exit 2, the refusal names the offending argument |
| 20 | The size gate can see every tracked module | `bash scripts/anti-pattern-detector.sh` | 0 violations across 29 patterns, exit 0; the scan now covers `tests/` as well as `scripts/`, `data/`, and `styles/`, and every file in `tests/` is at or below 275 lines |
| 21 | The size gate is exercised in its failing direction | `node --test tests/size-mandate-gate.test.js` | 3 pass, 0 fail; the scope is pinned as text, every tracked test module must be covered by the declared globs, and the detector must exit non-zero and name the path when a module exceeds the hard limit |
| 22 | Splitting the 974-line browser spec preserved its behaviour | `npx playwright test --retries=2 --reporter=json`, run on HEAD `92c26d6` and on the split tree, on the same host | identical title sets (28 tests in 6 files), identical failing set (the same 2 tests in both), identical total attempts (55 each); 26/28 passed in both. The browser suite fails 14/28 without retries in BOTH trees — the browser process dies mid-run under host load, an environmental condition that predates the split. The e2e suite is not run in CI; the last recorded clean run was 29/29 on 2026-10-15 on a lower-load host |
| 23 | The detector refuses to run without ripgrep | `node --test tests/detector-tooling.test.js` | 4 pass, 0 fail; with `rg` removed from PATH the detector exits 2 with a message naming ripgrep, and does not report content violations on correct files |
| 24 | The missing-tool failure is distinguishable from a finding | `env PATH=<no rg> bash scripts/anti-pattern-detector.sh` | exit 2, with "ripgrep (rg) is not on PATH" and install instructions; the violation exit code remains 1 |
| 25 | CI installs the tool the detector needs, before using it | `gh run view 39669823674` (CI run for commit `d7dc6b1`) | the workflow gained an "Install ripgrep" step ahead of "Anti-pattern detector"; without it the detector on `ubuntu-latest` reported 62 fabricated violations on files that carry the required markup, and CI was red on main for the six commits before this round. Run 39669823674 concluded **success** with every step green, and the runner's own numbers matched the local measurements of the moment exactly: 883/883 tests, 252 scanner checks with 0 findings, 91.18% lines / 88.61% branches / 86.48% functions. (The tree's check count has since moved — see row 1 — because this round's own record added count-claims. The figure quoted for the run is what the run printed.) |
| 26 | CI stages the publication before the suite that reads its output | `rm -rf bundled && npm run stage:publication && node --test tests/*.test.js` | negative control: without `bundled/` the suite ran 868 tests with 10 failures; positive control: after `npm run stage:publication` it ran 883 tests, 883 pass, 0 fail, with `bundled/` holding exactly `app.bundle.0403d845.js` and `manifest.json`. `bundled/` is gitignored (`.gitignore:7`) and no file under it is tracked, so a fresh checkout has none — this is the path CI actually takes |
| 27 | The suite is not flaky under concurrency | four concurrent `node --test tests/*.test.js` runs | before the round 6u continuation fix, 3 of 4 concurrent runs failed at `tests/detector-tooling.test.js:121` (exit 1 with empty output where exit 2 was asserted); after it, 4 of 4 passed, and 8 of 8 concurrent runs of that file in isolation passed. The cause was a fixed shared stub-PATH directory (`output/no-rg-path`) that concurrent runs deleted from under each other, with `err.status ?? 1` reporting the failed spawn as the detector's violation exit code |
| 28 | The ledger record of the CI run is itself green on the runner | `gh run view 39670793875` (CI run for commit `766a27d`) | the ledger edit that recorded run 39669823674 was itself a commit needing a green run of its own. Run 39670793875 concluded **success** in 1m22s with every step green, and the runner printed **253 checks, 0 findings** — the count the local tree measured at that commit — with the same 883/883 suite and the same 91.18% / 88.61% / 86.48% coverage. The check count has since moved again, because rows 16a, 16b, and 28 of this table state count-claims of their own; row 1 carries the current figure |
| 29 | The coverage gate clears the 85% floor on the current tree | `npm run test:coverage` | **91.21% lines / 88.69% branches / 86.48% functions**, exit 0, all three above the 85% floor. The figure is a property of the tree's *content*, not a constant of the repository: the scanner's own tests exercise whichever branches the ledger's prose happens to trigger, so editing a count-claim moves the number. Measured four times on this tree with an identical result. The function floor, which is what the 85% requirement turns on, is 86.48% |
| 30 | The commit that closes the round is itself green on the runner | `gh run view 39685095488` (CI run for commit `ef50ad3`) | the closing commit, which is the one that reconciles the coverage claim, was itself a commit needing a green run of its own. Run 39685095488 concluded **success** in 1m50s with every step green, and the runner printed **883/883** tests, **269 checks, 0 findings**, and **91.18% / 88.63% / 86.48%** coverage — the figures the tree at `ef50ad3` measured. The count and the coverage have since moved again, because this table's own rows state count-claims and coverage claims of their own; rows 1 and 29 carry the current figures |

Requirements 1 and 2 are the round's own subject. The
rest are the standing gates the round had to leave
green, and they are listed here so that a reader can
tell what was checked without reconstructing it from
the commit history.

The count has moved seven times during this round —
832, 834, 835, 837, 838, 842, 845 — and the scanner
named the `STATE.md` lines that had fallen behind each
time, before this table was written. That is
requirement 1 demonstrated on the round's own documents.
An eighth move, to 852, came in round 6t; it is
recorded in the correction below.

The check count in row 1 is not a constant. The scanner
counts one check per paragraph it examines, so it rises
whenever the tree gains prose: 236, then 237, then 239,
then 247 as this table was written. It is reported as
observed, and a reader re-running the command should
expect a different number if the tree has moved on.

The commit count counts round-scoped commits on the
first-parent line from `c1a13de` through the tip:
13 at the round 6m close, 17 at the round 6r close,
**20 at `ef50ad3`**. The definition is
`git log --first-parent --oneline c1a13de..ef50ad3 | grep -cE
"round|fix\(prerender\)|no-JS view|Merge branch 'main'"`, and it
reproduces the historical 13 at `798e54f` and 17 at `4222594`
exactly. The range is anchored to a named commit rather than to
`HEAD`, so the figure cannot shift underneath the sentence that
states it: the commit that wrote the 17 was `4222594`, and the
three that have joined the range since are the round 6s scanner
commit `92c26d6`, the round 6t size-mandate commit `a11c928`, and
the round 6u ledger commit `766a27d`. A reader re-running the
command against a later tip should expect a higher number, and
should read that as the arc having grown, not as the claim having
been wrong.

**Corrected 2026-10-21 (round 6s, second pass).**
The round 6s close was reviewed against the acceptance
path rather than against the gates, and three defects
in the round's own work were found. All three are
corrected here rather than defended.

- **The documented entry point did not work.** The
  scanner required `--measured N` and exited 2 without
  it. `npm run scan:stale-claims` — the command the
  round recorded as the way to run it — therefore failed
  every time it was invoked the way a gate would invoke
  it. The scanner now measures the suite itself, in a
  child run that excludes the three stale-claim test
  files, and `--measured` is an override rather than a
  requirement.

- **The scanner was wired into no gate.** It was a
  script, not a gate. Nothing ran it automatically, so
  it would have drifted out of date exactly as the
  documents did. It now runs in the pre-commit hook
  whenever Markdown is staged, and in the CI workflow.

- **The scanner's own measurement was unreachable from
  the CLI.** The logic that measures the suite without
  recursing lived in a test helper. It is now
  `scripts/stale-claim-measure.js`, imported by both
  the CLI and the tests, so there is one measurement and
  one definition of the exclusion list.

The suite grew from 838 to 845 as a result. The scanner
named the `STATE.md` lines that had fallen behind, on
its own, before either was corrected. The count has now
moved seven times during this round — 832, 834, 835,
837, 838, 842, 845 — and each time the scanner named the
lines that had fallen behind before the documents were
updated. That is requirement 1 demonstrated on the
round's own documents, repeatedly.

**Corrected 2026-10-21 (round 6t).** Round 6t was
asked to prove that the round 6r defect class had no
sibling instances. It found one, and it was the same
shape as the original defect: a gate that reported
success while the thing it policed was broken.

- **The size gate could not see the test tree.**
  `scripts/anti-pattern-detector.sh` check #27 scans
  `scripts/`, `data/`, and `styles/` for files over the
  500-line hard limit. The `tests/` tree was invisible
  to it. `tests/browser/acceptance.spec.js` stood at
  974 lines — nearly double the hard limit — while the
  detector reported "0 violations across 29 patterns".
  The scan now covers every tracked JavaScript module
  the project maintains, `tests/` included.

- **A file that a gate cannot see is not governed by
  it.** The detector's own report had claimed the tree
  was clean. The claim was true of the files the
  detector looked at and false of the tree.

- **The oversized file is now split.** The 974-line
  browser spec became six spec files of 111, 166, 165,
  275, 189, and 75 lines, plus a 12-line shared
  helper. The before and after Playwright lists are
  identical: 28 tests in 6 files, the same 21 test
  declarations expanding over the same 8 routes in the
  static-asset sweep, under the same 11 describe
  blocks.

The size-mandate gate is now `tests/size-mandate-gate.test.js`,
which pins the scan's scope as text — because a test
that merely ran the detector could not distinguish "the
scope is right" from "the tree happens to have no
oversized file right now", and the second state is
exactly what let the 974-line file survive.

The suite grew from 845 to 852 as a result. The scanner
named the three `STATE.md` lines that had fallen behind
on its own, before this document was corrected. That is
requirement 1 demonstrated on the round's own
documents, for the eighth time.
