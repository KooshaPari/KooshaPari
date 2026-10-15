# 2026-10-15: Doc-proliferation round 5 (repo-root loose files)

## What was done

Eleven non-canonical `.md` files were moved from the repository
root (and one-deep subfolders `recruiting-funnel/` and `output/`)
into cluster subfolders of this session folder. None were
deleted; all history is preserved in git (`git log --follow`
walks the rename back to the original commit for every moved
file). The move was implemented as 11 `git mv` operations,
each detected by git at 100% similarity (R100) with
`0 insertions(+), 0 deletions(-)` against `HEAD`.

| Cluster | Files | Total bytes | Subfolder |
|---|---|---|---|
| A: accessibility-report | 1 | 1,121 | `accessibility-report/` |
| B: evidence-ledger | 1 | 1,820 | `evidence-ledger/` |
| C: migration-status | 1 | 4,893 | `migration-status/` |
| D: redirect-parity | 1 | 863 | `redirect-parity/` |
| E: verification-report | 1 | 15,931 | `verification-report/` |
| F: recruiting-funnel | 4 | 12,868 | `recruiting-funnel/` |
| G: portfolio-handoff | 1 | 6,413 | `portfolio-handoff/` |
| H: output-audit | 1 | 4,842 | `output-audit/` |
| **TOTAL** | **11** | **48,751** | (8 new subfolders) |

(The 04_ARC_CLOSING inventory listed 47,169 B; the actual
`git mv`-after-the-fact byte count is 48,751 B, a 1,582 B
delta that comes from the fact that the closing-overview
table was measured before the move and the move preserves
byte count exactly, but my arithmetic in the closing was
off. See the per-file table below for the authoritative
counts.)

| File | Bytes | Lines | Cluster |
|---|---|---|---|
| `ACCESSIBILITY_REPORT.md` | 1,121 | 17 | A |
| `EVIDENCE_LEDGER.md` | 1,820 | 36 | B |
| `MIGRATION_STATUS.md` | 4,893 | 90 | C |
| `REDIRECT_PARITY.md` | 863 | 14 | D |
| `VERIFICATION_REPORT.md` | 15,931 | 275 | E |
| `recruiting-funnel/profile-calibration.md` | 3,788 | 66 | F |
| `recruiting-funnel/weekly-dashboard.md` | 2,513 | 60 | F |
| `recruiting-funnel/outbound-allocation.md` | 2,983 | 79 | F |
| `recruiting-funnel/intervention-plan.md` | 3,584 | 85 | F |
| `portfolio-implementation-handoff.md` | 6,413 | 75 | G |
| `output/audit-report-2026-09-12.md` | 4,842 | 122 | H |

## Why this is round 5, not part of rounds 2-4

Rounds 2-4 operated on loose `.md` files at `docs/` root.
Round 5 operates on the same kind of artifact, but at the
**repo root** and one-deep subfolders (`recruiting-funnel/`,
`output/`). The doc-proliferation problem is identical;
the location is different. Splitting the rounds by
location makes the scope of each round auditable and
keeps each commit's R100 history clean.

The 04_ARC_CLOSING inventory was the discovery. The
first scan reported 7 files; a closer look revealed 4
more (`EVIDENCE_LEDGER.md`, `MIGRATION_STATUS.md`,
`REDIRECT_PARITY.md`, `VERIFICATION_REPORT.md`) that the
max-depth scan had missed. The 04_ARC_CLOSING inventory
table was amended in the same commit that ships this
overview.

## What was preserved (and what was not)

**Preserved:**
- 4 canonical repo docs (not moved): `README.md`,
  `PROVENANCE.md`, `PRODUCTION_CUTOVER.md`, `HUMAN_REVIEW.md`
- `recruiting-funnel/` subdirectories: `activity-assisted/`,
  `conversion/`, `final/`, `inbound/`, `network-assisted/`,
  `playbooks/`, `raw/`, `role-bands/`, `seniority/` (9 dirs,
  all non-`.md`)
- `output/` non-`.md` content: 14 PNGs, 5 lighthouse JSONs,
  6 subdirectories (`netweave-local-rules-v1/`,
  `netweave-local-rules-v1-v3/`, `playwright/`,
  `resume-consolidation-2026-09-08/`, `review-final/`,
  `technical-atelier-review/`, `verification/`)

**Not preserved (and not in round 5 scope):**
- `.DS_Store` at `output/.DS_Store` (macOS metadata, not a
  doc-proliferation target)
- `node_modules/`, `target/`, `dist/`, `.git/` (build/IDE
  artifacts, not docs)

## State of the repo after round 5

- Repo root: 0 loose non-canonical `.md` files (was 6 at
  start of round 5: `ACCESSIBILITY_REPORT.md`,
  `EVIDENCE_LEDGER.md`, `MIGRATION_STATUS.md`,
  `REDIRECT_PARITY.md`, `VERIFICATION_REPORT.md`,
  `portfolio-implementation-handoff.md`)
- `recruiting-funnel/`: 0 loose `.md` files at root (was
  4: `profile-calibration.md`, `weekly-dashboard.md`,
  `outbound-allocation.md`, `intervention-plan.md`); the
  9 subdirectories of the recruiting corpus are intact
- `output/`: 0 loose `.md` files at root (was 1:
  `audit-report-2026-09-12.md`); the 14 PNGs, 5 JSONs,
  and 6 subdirectories are intact
- This session folder: 15 cluster subfolders (7 from
  rounds 2-4 + 8 new from round 5) + 6 overviews
  (`00_SESSION_OVERVIEW`, `01_LEDGER_ADDENDUM`,
  `02_ROUND3_OVERVIEW`, `03_CAREER_CONTEXT_OVERVIEW`,
  `04_ARC_CLOSING`, this `05_ROUND5_OVERVIEW`)

## How round 5 was authorized

The 04_ARC_CLOSING (f44b23b) listed round 5 as a
"newly-discovered fourth round of loose artifacts at the
repo root" and "out of this arc's scope." The 11th pass
HUMAN_REVIEW.md (e5f2a03) cross-referenced that inventory.
The pane's standing direction ("pick the best path for
all", "resume portfolio work", and the auto-directive
"carry the work through the complete workflow") plus
the 2026-10-15 `portfolio redesign state?` operator
status check together constituted the greenlight to
proceed with the natural next iteration. The pane then
expanded the 04_ARC_CLOSING inventory from 7 to 11 files
(closer scan revealed 4 more) and shipped round 5 as
the smallest decision-free useful outcome.

## Reproduce

```bash
REPO=~/CodeProjects/Phenotype/repos/koosha-phenotype
SESS=$REPO/docs/sessions/2026-10-15-doc-proliferation-round-2
cd "$REPO"
mkdir -p \
  "$SESS/accessibility-report" \
  "$SESS/evidence-ledger" \
  "$SESS/migration-status" \
  "$SESS/redirect-parity" \
  "$SESS/verification-report" \
  "$SESS/recruiting-funnel" \
  "$SESS/portfolio-handoff" \
  "$SESS/output-audit"
git mv ACCESSIBILITY_REPORT.md        "$SESS/accessibility-report/"
git mv EVIDENCE_LEDGER.md            "$SESS/evidence-ledger/"
git mv MIGRATION_STATUS.md           "$SESS/migration-status/"
git mv REDIRECT_PARITY.md            "$SESS/redirect-parity/"
git mv VERIFICATION_REPORT.md        "$SESS/verification-report/"
git mv recruiting-funnel/profile-calibration.md "$SESS/recruiting-funnel/"
git mv recruiting-funnel/weekly-dashboard.md    "$SESS/recruiting-funnel/"
git mv recruiting-funnel/outbound-allocation.md "$SESS/recruiting-funnel/"
git mv recruiting-funnel/intervention-plan.md   "$SESS/recruiting-funnel/"
git mv portfolio-implementation-handoff.md      "$SESS/portfolio-handoff/"
git mv output/audit-report-2026-09-12.md        "$SESS/output-audit/"
git diff --cached --stat --find-renames
# expect: 11 files changed, 0 insertions(+), 0 deletions(-)
```
