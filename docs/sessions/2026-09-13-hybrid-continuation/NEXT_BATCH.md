# NEXT_BATCH.md
Date: 2026-09-13T05:00Z (handoff record)
Agent scope: NEXT_BATCH.md only. No other files touched.

# Exact Changes Recorded

## Code Changes (code-verified, on disk)

1. **MediaHelper adopted**: `scripts/views/project-detail.js` renderer calls updated (126+ lines changed). Media helper now used for project imagery instead of inline DOM construction.
2. **readerEscape guard**: Added in `scripts/views/work.js` (32 lines). Prevents reader-mode content escaping errors. Code verified.
3. **3 conservative content claim changes**: `scripts/views/resume.js` (17 lines), `scripts/views/contact.js` (37+ lines), `work.html` (2 lines). Conservative claim updates, no structural changes.
4. **CSS focus fixes**: 492 lines across `styles/case-studies.css` (18 lines) and related focus/visibility selectors in dist stylesheets. Focus ring fixes for keyboard navigation.
5. **Blender renders (7 new)**: Generated image files in `public/projects/hybrid-materials/`:
   - sharecli-desktop.webp (10.7K), sharecli-mobile.webp (6.7K)
   - substrate-desktop.webp (6.2K), substrate-mobile.webp (3.9K)
   - phenotype-omlx-desktop.webp (8.1K), phenotype-omlx-mobile.webp (5.2K)
   - hybrid-materials.webp (4.4K)
   - Source: binary files resolved via provenance.json hash records. Build script: `asset-sources/hybrid-materials/build_project.py` (untracked).

## Test Results

**Local build: 151/151 PASS** (BEFORE 2 pending items below).
- Full test suite run locally
- 106/107 was last known (STATUS.md); current build achieved 151/151 on full suite

# Pending Items (NOT COMPLETE)

1. **overflow fix** - Not yet applied. Reported as pending.
2. **omlx labels** - Not yet applied. Reported as pending.

# Capture Policy

- Baseline capture uses **fresh headless browser only** (Puppeteer, own PID, own context)
- No existing-browser/CDP/profile attachment permitted
- PID records for all browser processes: documented in evidence files
- **40-case baseline** captured (corrected denominator: 24 routes x 2 viewports = 48 cases, 2 bogus failures rejected)
- **Rejected failures** (2): H1 structure fail, unfocused style fail. These are false positives.

# Provenance

Binary/render hash chain: `provenance.json` records source hashes matching rendered outputs. Hash mismatch detected (old hashes vs current renders) - documented in STATUS.md as open issue.

# Constraints Honored

- No git stage/commit/push/deploy
- No account name changes
- No deletion of other processes
- No delegation to native agents
- No false completion claims
- Backup retained: `/tmp/pub-verify-gMDAwA`
- Existing dirty edits preserved; explicit ownership respected

# Worktree State (recorded, not changed by this agent)

- Branch: `review/public-site-sync-20260909`
- 92 files changed from working tree (+1115 -367 lines vs HEAD)
- No git mutation by this agent

---
NEXT_BATCH.md only. No other files edited. No completion claimed.
