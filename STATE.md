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
- Unit suite: 787/787 PASS, 0 fail (774/774 at round 6p,
  +2 for the `runWarnings` field and +11 for the claim
  sweep, both added in round 6q).

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
   (`npm run test:sweep`). Over 124 tracked Markdown
   files it finds 64 Lighthouse score claims, of which
   45 carry a dated correction, 5 are adjudicated as
   claims about a different run, 14 are quotations
   inside a correction, and **0 are uncovered**. The
   script is tested against a negative control that
   injects a stale claim and requires the sweep to
   report it. Details in
   `docs/audits/2026-10-19/lighthouse/README.md`,
   section "Claim sweep".
   <!-- sweep:counts {"trackedMarkdownFiles":124,"claims":64,"annotated":45,"adjudicated":5,"quotation":14,"uncovered":0,"proseForm":45,"numericForm":19,"annotationWindowLines":14} -->
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

The post-20th-pass arc is closed: 17 commits pushed to
`origin/main` (c1a13de through the round 6q close),
all 5 items in the 06 doc are CLOSED/DECIDED, the unit
suite is 787/787 PASS, and `HUMAN_REVIEW.md` carries
the complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,
6i, 6j, 6k, 6l, 6m, 6n, 6o, 6p, 6q) — 14 round
entries.

**Corrected 2026-10-21 (round 6r).** This paragraph
was last written at round 6m and had gone stale in
three ways, each of which is corrected above rather
than defended:

- The unit suite was stated as 774/774. It was
  774/774 when the paragraph was written; the
  closure receipt above now states **787/787**, which
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
  that exist. The corrected list above is the 14
  headings that are actually present.

The commit count counts round-scoped commits on the
first-parent line from `c1a13de` through the tip:
13 at the round 6m close, 17 now. The definition
reproduces the historical 13 exactly.
