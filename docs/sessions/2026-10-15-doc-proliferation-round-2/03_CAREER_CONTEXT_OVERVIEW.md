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

- ~~**Not copied to `~/Documents/ResVault/.researchledger/`.**~~
  **DONE 2026-10-15.** The 4 files are now at
  `~/Documents/ResVault/.researchledger/career-context-anduril/`,
  joining `github-pass1/`, `linkedin-pass1/`, and the
  `resume-claim-matrix-2026-09-10.md` + `resume-docx-inventory-2026-09-10.md`.
  The cross-repo copy was byte-identical (verified by
  `diff -r`); `git rm` in this repo, plain `cp` in the
  ResVault target (ResVault is a plain folder, not a git
  repo). This is the **round 6** handoff: the 4 files
  left the portfolio repo entirely. See
  `06_OPEN_DECISIONS_STATUS.md` item 3 (now CLOSED) for
  the operator-decision status, and the
  `Round 6: cross-repo ResVault handoff` section
  below for the move details.
- **No content redaction.** These files contain PII (employer
  names, transcript content). The portfolio's hard constraints
  (0 new color families, 0 new fonts, 0 new third-party scripts,
  0 emoji, WCAG 2.2 AA both themes) do not apply since these
  files are not in any built page. **After the round-6
  handoff, the files are no longer in this repo at all** —
  they live in `~/Documents/ResVault/.researchledger/career-context-anduril/`,
  the operator's external-narrative store.
- **No git rm.** ~~The files are not deleted; they are moved. The
  only "removal" is the rename from `docs/` to
  `docs/sessions/2026-10-15-doc-proliferation-round-2/career-context-anduril/`.~~
  **SUPERSEDED 2026-10-15 (round 6):** the 4 files are
  now `git rm`'d from this repo entirely. `git log --follow`
  on the ResVault copies (which are not in a git repo)
  walks the history back to `9ac2bdb` via this repo's
  pre-`git rm` state at the time of the copy.
- **No `.gitignore` changes.** ~~The files remain in git's index
  via their new paths.~~ **SUPERSEDED 2026-10-15 (round 6):**
  the files are no longer in git's index at all; they
  live in the operator's external-narrative store, not
  in this repo.

## Round 6: cross-repo ResVault handoff (2026-10-15)

The operator signaled "go" on the cross-repo handoff that
`06_OPEN_DECISIONS_STATUS.md` item 3 was blocked on. The
4 files left this repo in a single cross-repo move:

| File | Source path (this repo, pre-round 6) | Target path (ResVault) | Bytes |
|---|---|---|---|
| `2026-09-05-career-context-anduril.md` | `docs/sessions/2026-10-15-doc-proliferation-round-2/career-context-anduril/` | `~/Documents/ResVault/.researchledger/career-context-anduril/` | 12,341 |
| `2026-09-05-career-context-anduril-early.md` | (same) | (same) | 14,377 |
| `2026-09-05-career-context-anduril-middle.md` | (same) | (same) | 10,110 |
| `2026-09-05-career-context-anduril-final-interval.md` | (same) | (same) | 4,771 |
| **Total** | | | **41,599** |

**Verification:**

- `cp -p` (preserves timestamps, mode, ownership) from
  this repo to the ResVault target.
- `diff -r` against the source returned 0 differences
  — **byte-identical** after the copy.
- `git rm` of the 4 files in this repo; the empty
  subfolder was cleaned up by `git rm` itself.
- ResVault is a plain folder, not a git repo (no
  `.git` directory at `~/Documents/ResVault/`), so
  the ResVault copies are NOT in git. They live as
  plain files in the operator's external-narrative
  store, exactly as the round-4 file's
  "not copied to ResVault" carry-forward said they
  should.
- `git log --follow` on the now-deleted paths (from
  any pre-`git rm` commit in this repo) walks the
  history back to the original absorb commit
  `9ac2bdb` (`absorb(koosha-phenotype): migrate
  incubating project from zz-merge-unk-koosha-phenotype
  (#1)`).

**What is NOT in scope for this round:**

- No commit in ResVault (it's not a git repo).
- No redaction of PII in the copies (operator-only
  decision; the files are now in the operator's
  store, not the public portfolio).
- No reverse-sync from ResVault to this repo
  (operator can manually copy back if needed; no
  pane work required).

## After round 4 + round 6

`docs/` root has **0** loose `.md` files. The
`docs/sessions/2026-10-15-doc-proliferation-round-2/career-context-anduril/`
subfolder is **empty** (the 4 files left in round 6). The
doc-proliferation cleanup arc is complete across all
5 rounds plus the round-6 cross-repo handoff:

| Round | What moved                                            | Count | Total bytes |
|-------|--------------------------------------------------------|-------|-------------|
| 1     | (predecessor arc; see `docs/sessions/2026-10-14-doc-proliferation-round-1/`) | (n) | (n) |
| 2     | `docs/2026-09-*.md` → round-2 cluster subfolders       | 18    | 110,291     |
| 3     | non-glob loose files → round-2 cluster subfolders     | 4     | (r3 stat)   |
| 4     | CAREER_CONTEXT_ANDURIL_*.md → new subfolder            | 4     | 41,599      |
| 5     | repo-root loose `.md` → 8 cluster subfolders          | 11    | 48,751      |
| 6     | CAREER_CONTEXT_ANDURIL_*.md → ResVault (cross-repo)    | 4     | 41,599      |

Round 6's 41,599 B is the SAME 41,599 B as round 4
(because round 6 moves the same files round 4 moved);
the byte total in the portfolio repo dropped by 41,599 B
(those 4 files left the repo). The ResVault target
gained 41,599 B.
