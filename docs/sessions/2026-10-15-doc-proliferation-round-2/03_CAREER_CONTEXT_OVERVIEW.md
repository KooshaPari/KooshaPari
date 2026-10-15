# Round 4 of the doc-proliferation cleanup: CAREER_CONTEXT_ANDURIL_*.md

> Picks up the 4 CAREER_CONTEXT_ANDURIL_* files at `docs/` root that
> were explicitly deferred from round 1 ("date-prefixed, but contain
> external narrative. Deferred."). Round 2 was scoped to the
> `docs/2026-09-*.md` glob and so did not touch them. Round 3 picked
> up the 4 non-glob loose files at `docs/` root. These 4 are the
> remaining loose files at `docs/` root and round 4 closes the
> cleanup arc.

## What was done

4 `git mv` operations into a new `career-context-anduril/` subfolder
under this session folder:

| Source file                                              | Target file                                                          | Size   |
|----------------------------------------------------------|----------------------------------------------------------------------|--------|
| `docs/CAREER_CONTEXT_ANDURIL_2026-09-05.md`              | `career-context-anduril/2026-09-05-career-context-anduril.md`         | 12,341 |
| `docs/CAREER_CONTEXT_ANDURIL_EARLY_2026-09-05.md`        | `career-context-anduril/2026-09-05-career-context-anduril-early.md`   | 14,377 |
| `docs/CAREER_CONTEXT_ANDURIL_MIDDLE_2026-09-05.md`       | `career-context-anduril/2026-09-05-career-context-anduril-middle.md`  | 10,110 |
| `docs/CAREER_CONTEXT_ANDURIL_FINAL_INTERVAL_2026-09-05.md` | `career-context-anduril/2026-09-05-career-context-anduril-final-interval.md` | 4,771 |

Total: 41,599 B preserved.

## Why a new subfolder (not into an existing one)

These 4 files are not portfolio work product. They are
**Anduril career conversation imports and transcript read ledgers** —
per their own first lines, "Internal process context only. Do not
include in deployable assets or publish." They are evidence of
the operator's career-candidate process (the Anduril conversation
that prompted the portfolio work in the first place), not anything
that should ever land on a built page, get linked from the
portfolio, or be associated with portfolio source/test/detector
surface.

Round 1's deferral was correct: these do not fit any of the 6
existing cluster subfolders (`resume-authority/`, `netweave-asset-production/`,
`production-construction/`, `audit-readiness/`,
`source-chat-recovery/`, `visual-motion-research/`). None of those
subfolders is the right semantic home for "career-conversation
imports that pre-date the portfolio itself." A new subfolder
gives them a clear, isolated home that does not pollute any of
the existing 6 clusters.

## Date-prefix inference

All 4 files share the date `2026-09-05` (the operator's
resume-optimization pass for Anduril). The new filenames use that
date prefix uniformly, matching the round-2 and round-3 cluster
convention of `2026-09-DD-...md`.

The variant suffixes (`-early`, `-middle`, `-final-interval`) are
preserved from the source filenames' interval-naming pattern
(`_EARLY_`, `_MIDDLE_`, `_FINAL_INTERVAL_`).

## Verification

- 4 R100 renames (verified by `git status --short` showing 4 `R`
  entries with no `M`, `A`, `D` entries).
- `git log --follow` on each new path returns the original absorb
  commit `9ac2bdb` (`absorb(koosha-phenotype): migrate incubating
  project from zz-merge-unk-koosha-phenotype (#1)`).
- `git diff --stat` against HEAD is empty apart from the 4 rename
  entries + this overview.
- No content edits, no deletions, no new files other than this
  overview.

## What was NOT done (out of scope, and carry-forwards)

- **Not copied to `~/Documents/ResVault/.researchledger/`.** ResVault
  is the operator's pre-existing external-narrative store. It already
  holds `github-pass1/`, `linkedin-pass1/`, and the
  `resume-claim-matrix-2026-09-10.md` + `resume-docx-inventory-2026-09-10.md`.
  The cleanest eventual home for these 4 files is
  `~/Documents/ResVault/.researchledger/career-context-anduril/`.
  This round moves them inside the portfolio repo only; the
  ResVault handoff is a **separate operator decision** because it
  crosses repository boundaries. No action taken autonomously.
- **No content redaction.** These files contain PII (employer
  names, transcript content). The portfolio's hard constraints
  (0 new color families, 0 new fonts, 0 new third-party scripts,
  0 emoji, WCAG 2.2 AA both themes) do not apply since these
  files are not in any built page. They remain in the repo only
  as a session-folder holding pending ResVault handoff.
- **No git rm.** The files are not deleted; they are moved. The
  only "removal" is the rename from `docs/` to
  `docs/sessions/2026-10-15-doc-proliferation-round-2/career-context-anduril/`.
- **No `.gitignore` changes.** The files remain in git's index
  via their new paths.

## After round 4

`docs/` root has **0** loose `.md` files. The doc-proliferation
cleanup arc is complete across all 4 rounds:

| Round | What moved                                            | Count | Total bytes |
|-------|--------------------------------------------------------|-------|-------------|
| 1     | (predecessor arc; see `docs/sessions/2026-10-14-doc-proliferation-round-1/`) | (n) | (n) |
| 2     | `docs/2026-09-*.md` → round-2 cluster subfolders       | 18    | 110,291     |
| 3     | non-glob loose files → round-2 cluster subfolders     | 4     | (r3 stat)   |
| 4     | CAREER_CONTEXT_ANDURIL_*.md → new subfolder            | 4     | 41,599      |
