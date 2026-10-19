# STATE.md — publication state for the KooshaPari profile repo

## Status: PUBLICATION_PROOF_DEFERRED

The publication state of this repo is **DEFERRED** as of 2026-10-17.
A real production deploy has not been performed in this audit cycle
and the v1.4 PROOF-AND-GRADE evidence bundle cannot be assembled
without one. This file is the operator-facing pointer for that
status; it is not the audit record (that lives at
`docs/audits/2026-10-17/kooshapari.md`).

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

## What is blocked pending operator approval

The FWD step 4 (hosted proof + Lighthouse + scoped numerical grade)
requires a real production deploy. **A real deploy is a destructive
surface change** (DNS attach on `kooshapari.com`), so the agent
MUST NOT trigger it autonomously. The rollout plan is
`PRODUCTION_CUTOVER.md:1-10`; the deployment-readiness walkthrough is
`docs/deploy/2026-10-17.md`.

When the operator approves the deploy:

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

## Confidence

Medium-high. The repository surface is clean and authoritative; the
only thing missing is the live deploy + multi-channel evidence,
which is intentionally behind operator approval and is not in the
agent's authority to take.

## Cross-references

- Audit: `docs/audits/2026-10-17/kooshapari.md`
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
  www.kooshapari.com, kooshapari-site.vercel.app,
  phenotype.space)
- Production deploy: DONE (round 6e at 2026-10-18
  06:36 UTC; round 6i at 2026-10-19 00:09 UTC)
- Evidence bundle: DONE (captured at
  `docs/deploy/2026-10-19.md`; 10 per-requirement
  observations, all PASS)
- Lighthouse score: NOT RUN. Lighthouse CLI 13.4.1
  is installed at `/opt/homebrew/bin/lighthouse`,
  but no Chrome browser binary is present on this
  host. The operator has not authorized installing
  a browser binary unilaterally. The 07 doc
  section H already flagged this as a known gap.

Per the AGENTS.md policy ("Show UNKNOWN where
evidence or timing is missing. Do not invent
percentages or finish dates."), the status line
remains `PUBLICATION_PROOF_DEFERRED` until one
of the following happens:

1. A Chrome binary is installed and a Lighthouse
   run is executed (operator action).
2. The close criteria are redefined to skip
   Lighthouse (a STATE.md amendment).

The single remaining item is documented here, in
`docs/deploy/2026-10-19.md`, and in
`docs/sessions/2026-10-15-doc-proliferation-round-2/06_OPEN_DECISIONS_STATUS.md`
item 5. The post-20th-pass arc is otherwise
closed: 8 commits pushed to `origin/main`
(c1a13de through bbcae40), all 5 items in the 06
doc are CLOSED/DECIDED, the unit suite is
767/767 PASS, and `HUMAN_REVIEW.md` carries the
complete round-6 audit trail (6c, 6d, 6e, 6f, 6g,
6h, 6i, 6i-correction).
