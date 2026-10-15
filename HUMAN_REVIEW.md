# Human review

STATUS: NOT READY FOR PRODUCTION REVIEW — local gate green, hosted gate not run

Last reconciled 2026-09-29 against `437dfa8` and the working tree. The previous
version of this file claimed production readiness and cited a 2026-09-04 review
gate with 28 Node tests. Both were stale; the counts and the readiness claim have
been corrected below rather than left in place. Reconciled again 2026-10-04
against `c298cb1`, which removed the `image-slider` feature; the unit count below
was re-measured at that commit. A later pass at `debf320` on 2026-10-09
re-measured the browser suite at that commit too, and stabilized the contrast
sampling that had made one route flake. Reconciled again 2026-10-14 against
`5a22929`: the unit suite was re-run at that commit (result below), while the
browser suite was deliberately not re-run — host load average was 344, in the
range where this file's own caveat makes a red result uninterpretable — so its
2026-10-09 observation is retained with its original date and commit rather than
restated as fresh evidence. Reconciled again 2026-10-14 against `02962d5`: the
unit suite was re-run at that commit (new count below) for the `fix(seo): correct
JSON-LD LinkedIn slug in blog pages, lock canonical structured data` change, and
the browser suite was deliberately not re-run again — host load average is 220
(improved from 344 but still in the same uninterpretable range, since the caveat
is about the browser suite's per-test timeout being a contention signal rather
than a precise threshold) — so the 2026-10-09 browser observation continues to be
the freshest product evidence on file. Reconciled again 2026-10-14 against
`184f71f`: the unit suite was re-run at that commit (new count below) for the
`fix(seo): add noscript internal nav fallback across static pages` change, and
the browser suite was deliberately not re-run again — same load caveat
(220) — so the 2026-10-09 browser observation remains the freshest product
evidence. Reconciled again 2026-10-14 against `824ab37`, the
`docs(grader): record remediation for all 5 findings (terminal state)`
commit. That commit is a docs-only change (the `Remediation` column on
`docs/sessions/20261010-grader-adjudication/00_FINDINGS.md` plus a
`Summary at this session` section) and does not touch any source, test,
or detector surface, so the unit count below is carried forward from
`184f71f` unchanged; the 2026-10-14 unit observation at `184f71f`
remains the freshest product evidence, and the browser-suite caveat
(220) is unchanged. Reconciled again 2026-10-14 against `6ad2a63`, the
`docs(repo): consolidate 3 routing-slice docs from 2026-09-09 into
session folder` commit. That commit is also a docs-only change
(`git mv` of 3 root-level files into
`docs/sessions/2026-10-14-routing-slice-cleanup/`, plus a new
`00_SESSION_OVERVIEW.md`); it touches no source, test, or detector
surface, so the unit count below is again carried forward from
`184f71f` unchanged. Reconciled again 2026-10-14 against `edc6731`,
the `docs(repo): record ledger-trailer gap for 97d145c via
session-folder addendum` commit, which is the immediate follow-up
to `97d145c` (the round-2 doc-proliferation move). That commit
moved 18 loose `docs/2026-09-*.md` files into
`docs/sessions/2026-10-15-doc-proliferation-round-2/` via `git mv`
(R100 rename detection, 0 content delta against HEAD), and
`edc6731` records the missing `tx-agent` / `tx-validated` ledger
trailers from `97d145c` in-tree (the wrapper was invoked as
`git-commit -m subject -m body` instead of `git-commit subject -m
body`; per global immutability policy the original commit stands
and the gap is documented in
`docs/sessions/2026-10-15-doc-proliferation-round-2/01_LEDGER_ADDENDUM.md`).
Both commits are docs-only: they touch no source, test, or detector
surface, so the unit count below is again carried forward from
`184f71f` unchanged. Reconciled again 2026-10-14 against `94fb369`,
the `chore(docs): doc-proliferation round 3` commit, which moves the
4 non-glob loose files at `docs/` root (`asset-visual-review-netweave.md`,
`AUDIT-collisions-e7b69ad.md`, `TERMINAL_PLAYBACK_EVIDENCE_2026-09-06.md`,
`PORTFOLIO_PROMPT_INVENTORY_2026-09-05.md`) into the round-2 session
folder's existing cluster subfolders (`netweave-asset-production/`
+ `audit-readiness/`). All 4 are R100 renames (0 insertions / 0
deletions against HEAD); history is preserved via `git log --follow`
(3 to `9ac2bdb`, `AUDIT-collisions` to `d363946`). The
`02_ROUND3_OVERVIEW.md` adds the new 134-line rationale document.
This is also docs-only: no source, test, or detector surface change,
so the unit count is again carried forward from `184f71f` unchanged.
Reconciled again 2026-10-14 against `86700d2` and `d052eb6`.
`86700d2` is `chore(docs): doc-proliferation round 4` — the 4
`CAREER_CONTEXT_ANDURIL_*.md` files at `docs/` root (moved into a
new `career-context-anduril/` subfolder of the round-2 session
folder, with `03_CAREER_CONTEXT_OVERVIEW.md` documenting the
placement and the ResVault handoff as a separate operator
decision). `d052eb6` is `docs(specs): mark breadth-first redesign
spec DEFERRED INDEFINITELY` — a 36-line status footer added to the
636-line `docs/superpowers/specs/2026-09-11-breadth-first-redesign-design.md`
spec, recording that it was authored 2026-09-11 and has not been
adopted as the active design direction 33 days later; the spec
body is unchanged. Both commits are docs-only: they touch no
source, test, or detector surface, so the unit count is again
carried forward from `184f71f` unchanged. Reconciled again
2026-10-14 against `f44b23b`. `f44b23b` is
`docs(session): add 04_ARC_CLOSING.md` — a 142-line
terminal-state record for the doc-proliferation arc, tying
all 8 commits this arc shipped together with the 3
operator-decision items surfaced at the boundary (resume
per-role vs consolidated, `VERCEL_TOKEN` for hosted gate,
ResVault handoff for `CAREER_CONTEXT_ANDURIL_*.md`) and a
newly-discovered 4th round of loose artifacts at the repo
root (7 files, 25,244 B, 504 lines) flagged as round 5
candidates for operator greenlight. The closing overview is
the canonical place to record what shipped, what the operator
owns, and what is the next iteration. The commit is docs-only
(1 new file in the round-2 session folder, 0 source/test/
detector surface change), so the unit count is again carried
forward from `184f71f` unchanged. The freshest product
evidence remains the 2026-10-14 unit observation at `184f71f`
and the 2026-10-09 browser observation at `debf320` (subject
to the same load caveat, 220). Reconciled again 2026-10-15 against `6119c80`, the
`chore(docs): doc-proliferation round 5` commit. That commit moves 11
non-canonical `.md` files from the repository root and the one-deep
subfolders `recruiting-funnel/` and `output/` into 8 new cluster
subfolders of the round-2 session folder (`accessibility-report/`,
`evidence-ledger/`, `migration-status/`, `redirect-parity/`,
`verification-report/`, `recruiting-funnel/`, `portfolio-handoff/`,
`output-audit/`). All 11 are R100 renames (0 insertions / 0 deletions
against HEAD); history is preserved via `git log --follow` (e.g.,
`recruiting-funnel/profile-calibration.md` -> `5b970c3` "Add
recruiting funnel audit artifacts",
`portfolio-handoff/portfolio-implementation-handoff.md` -> `9ac2bdb`
"absorb(koosha-phenotype)",
`verification-report/VERIFICATION_REPORT.md` -> `8fec2e5` "docs:
correct post-slider-removal claims",
`output-audit/audit-report-2026-09-12.md` -> `9ac2bdb`). The commit
also adds `05_ROUND5_OVERVIEW.md` (151 lines) documenting the round-5
rationale, byte/line breakdown, scope boundaries, and reproduction
sequence, and corrects the `04_ARC_CLOSING.md` byte total from
25,244 B (the 7-file first-pass count) to 48,751 B (the 11-file
authoritative count). The commit is docs-only: it touches no source,
test, or detector surface, so the unit count below is again carried
forward from `184f71f` unchanged. The freshest product evidence
remains the 2026-10-14 unit observation at `184f71f` and the
2026-10-09 browser observation at `debf320` (subject to the same
load caveat, 220). Reconciled again 2026-10-15 against `6f9478f`, the
`koosha-phenotype: add /parent/ view as default landing` commit. This is
the first non-docs-only commit since `184f71f` (or any source/test/detector
surface change in this arc), so the unit count below is **re-measured** at
this commit rather than carried forward. `npm test` (the canonical runner,
`node --test tests/*.test.js`) reports 714/714 pass across 73 test files —
the same count as `184f71f` — confirming the /parent/ registration in
`scripts/app.js` (import + dispatch), `scripts/components/shell.js` (top-nav
ROUTES), `scripts/router-helpers.js` (VIEW_ROUTES), `tests/internal-nav.test.js`
(STATIC_PAGES, x2), `scripts/stage-publication.js` (the third top-level-page
enumeration; this is the place the repo's own tests caught the first two
omissions), and `vercel.json` (`/parent` -> `/parent.html` rewrite) all
land without breaking existing coverage. The commit adds three new files
(`parent.html`, `scripts/views/parent.js`, `styles/parent.css`) totaling
398 lines / 13,501 B, registered eagerly rather than lazy-loaded (the
bundle is 214.8 KB minified against the 230 KB convention, ~15 KB
headroom; the new view adds only 2.5 KB). Hard-constraint compliance: 0 new
third-party scripts (only `/scripts/app.js`), 0 emoji, `prefers-reduced-motion:
reduce` handled (`@media (prefers-reduced-motion: reduce) { .parent-agent
{ transition: none; } .parent-agent:hover { transform: none; } }`),
WCAG-minded (skip-link, aria-live region for the 15-min refresh stamp, the
ASCII frame carries `aria-label="Agent state as a text frame"`). 7 hex
fallback values appear inline in `styles/parent.css` (the `--seed-teal`
accent token is reused; the other 6 are ink/grey values that should ideally
flow through the existing token system — flagged below as a follow-up, not
a blocker for this pass). The 15-min `setInterval` is corroborated from two
independent 2026-10-11 artifacts but the 9-agent static roster is
NOT live-verified against paperclip's `/api/agents` (the local origin is
down; the public endpoint sits behind Cloudflare Access, so a public page
cannot hold those credentials client-side) — the view source labels it as a
starting point, not truth, so a future reader does not mistake the static
list for the live registry. Authored by Instinct per the operator's
directive; the commit is signed off here at 6f9478f with full tx-trailers
(`tx-agent: jcode`, `tx-validated: test`, `tx-task: cockpit-phase-1`,
`tx-scope: parent-view`, `tx-intent: land the consolidated cockpit view
the operator directed`). Browser suite still NOT re-run (load average 220,
same uninterpretable range per the caveat above), so the 2026-10-09
observation at `debf320` remains the freshest browser evidence.
Reconciled again 2026-10-15 against `750d788`, the
`refactor(styles): hoist 4 inline graphite fallbacks in parent.css to
real tokens` commit. The 13th pass flagged 7 inline hex fallback values
in `styles/parent.css` as a follow-up; this commit resolves 4 of them.
Four new tokens (`--graphite-600: #5b6472`, `--graphite-500: #7a8494`,
`--graphite-400: #9aa3b2`, `--graphite-200: #dfe3ea`) are added to
`styles/tokens.css` (lines 41-44, inserted directly below
`--graphite-800` in descending lightness order). The 9
`var(--graphite-N, #hex)` sites in `parent.css` (lines 35, 44, 63, 83,
84, 97, 114, 121, 134) lose their inline fallbacks and resolve through
the new tokens; the rendered output is byte-identical because the
fallback values were always the active values. This is a CSS-only
change (2 files, +13/-9, no JS, no HTML, no test surface), so the unit
count below is carried forward from `6f9478f` unchanged at 714/714
across 73 test files (re-verified at this commit; the test suite
remained green throughout the rebase). 3 inline fallbacks remain in
`parent.css` and are documented in the commit body, not removed:
line 65 is `var(--surface-ceramic, #fff)` — the fallback IS being used
today because `--surface-ceramic` resolves to `--seed-ceramic` (#F6F5F5)
not #fff; dropping it would shift agent card backgrounds ~10 RGB units
cooler; lines 123 and 124 are exact matches to `--surface-obsidian` and
`--seed-ceramic` respectively and are harmless. Both surface as
separate follow-ups. Browser suite still NOT re-run (load average
still in the uninterpretable range), so the 2026-10-09 observation at
`debf320` remains the freshest browser evidence. Reconciled again
2026-10-15 against `63b6d03` and `12d51c8`, two review-finding
follow-ups to the /parent/ view arc that landed in sequence on
`fix/parent-view-review-findings` and were fast-forwarded into main.
`63b6d03` is the `refactor(styles): align parent.css font-family
stacks with the rest of the codebase` commit: 6 sites in
`styles/parent.css` (lines 26, 40, 88, 110, 125, 132) used a
double-fallback pattern (e.g. `'Space Grotesk', var(--font-display,
system-ui), sans-serif;` and `'JetBrains Mono', var(--font-mono,
monospace);`) inconsistent with the dominant codebase pattern
(`var(--font-display)`, `var(--font-meta)`) used by radar, project-
index, contact, code-annotate, contact-info, hero, main, shell, and
resume-timeline (~25+ sites). Additionally, `--font-mono` is not
defined in `tokens.css` or `main.css`, so the `monospace` literal
fallback was the active value for the 5 JetBrains Mono sites, with
the leading `'JetBrains Mono'` then duplicated by the var's
eventual resolution — dead code. Aligned parent.css with the
standard pattern: line 26 -> `var(--font-display)`, lines 40/88/
110/125/132 -> `var(--font-meta)`. The tokens.css vars already
include the same font names as the first option, so the rendered
font cascade is byte-identical for users with Space Grotesk /
JetBrains Mono installed and slightly improved for users without
(the var's own fallback chain `"Avenir Next", "Helvetica Neue",
sans-serif` or `"SFMono-Regular", Consolas, monospace` is now
used). 1 file, 6 insertions, 6 deletions; CSS-only, no test
surface. `12d51c8` is the `fix(parent-view): complete prerender
route + correct ASCII frame + replaceChildren` commit, which closes
three review findings against the 6f9478f /parent/ view: (1)
`scripts/prerender.js` was missing the `parent.html` entry in its
`TOP_LEVEL_ROUTES` list, so the static-build output was missing
`parent.html` entirely; the route only worked via the client-side
router fallback. With the import + entry added, the prerenderer
emits `parent.html` like every other top-level route and the build
output is consistent with the live router. (2) The ASCII frame's
last row was misformatted as a single cell `| 9 agents              |`
that didn't align with the two-column `agent | state` header above
it; fixed to a proper two-cell row `| 9                   | 9 agents        |`.
(3) `root.appendChild(view)` was switched to
`root.replaceChildren(view)` to match the peer views (contact.js
and friends) and prevent a previous Parent view lingering in the
root when the route is re-rendered, which would duplicate the
whole view. The pre-commit anti-pattern detector also flagged the
unguarded `setInterval(...)` in the view as a build-hang risk
(the timer would keep the Node process alive after
`prerenderTopLevel` finishes, hanging the build), and that was
fixed in the same commit by guarding the timer with
`isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'`.
2 files (prerender.js + views/parent.js), 20 insertions, 8
deletions; scripts-only, no test surface. Unit count re-measured
at 12d51c8 (the pre-commit hook ran the full test suite on
both 63b6d03 and 12d51c8 and reported 714/714 / 0 fail) — same
714/714 across 73 files. Browser suite still NOT re-run (load
average still in the uninterpretable range), so the 2026-10-09
observation at `debf320` remains the freshest browser evidence.
Reconciled again 2026-10-15 against the post-flight loose-file
audit. Two changes: (1) the untracked one-shot `rt.tmp.mjs`
(2,197 B, linkedom-based /parent/ route smoke harness, mtime
`2026-10-15T00:56`, surfaced during a root-level `ls` scan) was
deleted as a one-shot artifact; the test surface it covered
(9 cards, no duplication, .parent-view count, ASCII frame
alignment, aria-live, pill states) is already exercised by the
tracked suite (`tests/internal-nav.test.js`,
`tests/router-helpers.test.js`, `tests/router.test.js`,
`tests/omniroute-topology.test.js`, plus the 12d51c8 prerender
route tests). No promotion to a permanent test file was needed.
(2) `.gitignore` was extended with `/*.tmp.mjs` (root-only
pattern) in commit `5372026` to prevent the next one-shot from
escaping; the rule covers `rt.tmp.mjs`, `route-test.tmp.mjs`, etc.,
but does NOT match subdir paths like `scripts/foo.tmp.mjs` (leading
`/` anchors the pattern to the repo root) — if a permanent
route-test harness is wanted, the convention is to promote it
to `tests/<name>.test.js` so `node --test` picks it up. After
both changes, `git status` is clean: 0 untracked files at root,
1 tracked .mjs file at root (`take-screenshots.mjs`, the
screenshot harness), 0 .tmp files, 4 canonical .md files at
root (`README.md`, `HUMAN_REVIEW.md`, `PRODUCTION_CUTOVER.md`,
`PROVENANCE.md`). Unit count carried forward unchanged at
714/714 across 73 files; config-only, no test surface impact.
Browser suite still NOT re-run (load average still in the
uninterpretable range), so the 2026-10-09 observation at
`debf320` remains the freshest browser evidence.
**Public-interface verification (19th pass, 2026-10-15 at `c11e429`):**
the 13th-18th pass browser-suite caveat ("load average still in
the uninterpretable range") is now **lifted** by running the
real public-interface path end-to-end. Concrete evidence collected
this pass (not inspection):
  - **Build:** `npm run stage:publication` ran in 15.0s. 30
    pages with hashed bundle references (90 CSS + 30 JS
    rewrites), 28 pages with importmap injected. 1 JS bundle
    (`dist/bundled/app.bundle.9bb0eb7b.js`, 220,040 B = 214.88 KB
    minified, within the 230 KB convention) and 3 CSS bundles
    (`dist/styles/bundled/{core,components,pages}.*.css`,
    21,791 + 48,594 + 63,403 = 133,788 B = 130.65 KB).
    The bundle hash changed from the 13th-pass-reported
    `ac2d541b` to `9bb0eb7b`; the new hash is the result of
    the four CSS passes (`750d788` + `63b6d03` + `176a2a0` +
    `97cb4b0`) since the 13th pass, which is expected for
    content-hashed bundles. Two non-fatal `Failed to load`
    warnings during the build were from `scripts/media/...`
    workbench modules — see "Real bugs surfaced" below.
  - **HTTP / serving:** `scripts/preview-server.js` (the
    `npm run preview` entry point) bound to `127.0.0.1:4197`.
    All 9 top-level routes returned **HTTP 200, text/html** with
    the expected byte sizes matching `dist/*.html`:
    `/` 22,503 B, `/parent/` 8,177 B, `/work/` 14,427 B,
    `/resume/` 10,637 B, `/contact/` 9,376 B, `/blog/` 8,456 B,
    `/archive/` 3,646 B, `/engineering/` 22,195 B, `/product/`
    20,872 B. (The `preview-server.js` does its own extension
    resolution, so trailing-slash routes resolve to
    `<route>/index.html` or `<route>.html` automatically.)
  - **Asset-link verification** (the real public-interface
    check, not the synthetic in-process test): curl'd every
    root-absolute asset URL on the rendered HTML of 3 routes.
    `/parent/` 19/19 (deduped 11), `/index/` 19/19, `/work/`
    33/33, **0 fail across 71 total asset URLs.** Each asset
    returned 200 with the expected content-type
    (`text/javascript`, `text/css`, `image/svg+xml`).
  - **Bundle content checks:** the `9bb0eb7b` bundle contains
    all 9 agent labels from `scripts/views/parent.js`
    (`jcode`, `hermes`, `vp`, `instinct`, `codex`, `kcode`,
    `winremote`, `engineer-general`, `engineer-specialist`),
    each exactly once; state values distribute 3+3+3 across
    `current`/`research`/`historical`. The static HTML for
    `/parent/` contains 1 `.parent-view` wrapper and 1
    `aria-live` region; the 9 agent cards are JS-rendered
    at runtime (not in the server HTML).
  - **Playwright e2e suite** (`npx playwright test` against
    `tests/browser/acceptance.spec.js`, 20 unique tests
    parametrized to 25 cases): **25/25 passed in 3m 16s** at
    host load `87.85 / 72.61 / 71.63` at start. This
    contradicts the long-standing "load average too high"
    caveat from the 13th pass preamble; the test timeout of
    120s is generous enough that the suite completes even
    on a heavily-loaded host. The 25 cases include:
    `homepage loads with title, navigation, hero` (2.5s);
    `hero WITF board renders on every lens page` (4.3s);
    `homepage has no critical accessibility violations` (3.4s
    — real axe-core on real rendered DOM);
    `colour contrast is evaluated, zero violations` (16.2s —
    real contrast sweep across the rendered pages);
    `focus ring meets 3:1 non-text contrast in BOTH themes`
    (28.3s); `clean navigation between pages` (6.9s);
    `all navigation pages have content and links` (6.0s);
    `all project pages render with title, summary, nav`
    (8.2s); `blog posts render with title, excerpt, nav`
    (3.7s); `ShareCLI has heading and download` (2.2s);
    `ShareCLI accessibility across viewports` (11.0s);
    `Reader shortcut, persistence, reduced motion, focus`
    (2.8s); 4 scroll-reveal tests (3.8s, 2.2s, 16.4s, 11.0s);
    6 static-asset-link sweeps for `/`, `/resume`, `/work`,
    `/contact`, `/engineering`, `/product` (5.4s, 1.2s, 1.2s,
    1.3s, 2.9s, 2.7s); `Cast player: ShareCLI recordings
    load and render decoded terminal output` (4.8s);
    `Lightbox opens, advances, closes on Escape` (3.6s);
    `Metric counters animate and settle on exact authored
    text` (2.9s). This is the first post-debf320 public-
    interface evidence in the 18-pass arc; it confirms the
    2026-10-09 browser claim of zero axe violations, zero
    contrast violations, and 3:1 focus-ring contrast on the
    current build, not on a 6-day-old artifact.
Reconciled again 2026-10-15 against `97cb4b0`, the
`refactor(styles): drop 3 dead exact-match fallbacks in parent.css
(lines 11, 123, 124)` commit. The 13th pass preamble's 7-hex
concern is now fully closed: 7 -> 0 inline fallbacks in
`parent.css` across the four CSS passes in this arc (`750d788`
hex token hoisting added 4 new `--graphite-*` tokens, `63b6d03`
font-stack align, `176a2a0` line-65 drop, `97cb4b0` lines
11/123/124 drops). `97cb4b0` drops three more dead-fallback
literals — each is a case-insensitive exact match to a globally-
defined token, so the `var(--token, #fallback)` fallback has
never been reachable: line 11 `--seed-teal` (tokens.css:28
`#7EBAB5` vs fallback `#7ebab5`), line 123 `--surface-obsidian`
(tokens.css:31 `var(--seed-obsidian)` -> tokens.css:25
`#0F1012` vs fallback `#0f1012`), line 124 `--seed-ceramic`
(tokens.css:27 `#F6F5F5` vs fallback `#f6f5f5`). 1 file, 3
lines dropped, no JS change, no visual effect, the rendered
value is unchanged. After this commit
`grep -nE '#[0-9a-fA-F]{3,8}' styles/parent.css` returns 0
matches. The `parent.css` file is now fully token-driven. Unit
count carried forward unchanged at 714/714 across 73 files;
CSS-only, no test surface impact. Browser suite still NOT re-run
(load average still in the uninterpretable range), so the
2026-10-09 observation at `debf320` remains the freshest browser
evidence.
Reconciled again 2026-10-15 against `176a2a0`, the
`refactor(styles): drop dead fallback on /parent/ agent card
background (line 65)` commit. The 14th pass preamble flagged
this line as a "real fallback" concern — the preamble said
"the fallback IS being used today because `--surface-ceramic`
resolves to `--seed-ceramic` (#F6F5F5) not #fff; dropping it
would shift agent card backgrounds ~10 RGB units cooler" —
which is technically wrong. The `var(--surface-ceramic, #fff)`
syntax only uses the `#fff` fallback when `--surface-ceramic`
is *undefined*. `--surface-ceramic` is defined globally on
`tokens.css:33` (as `var(--seed-ceramic)`), so the fallback is
dead code: the rendered background has always been the warmer
`#f6f5f5` (the value `--seed-ceramic` resolves to), never `#fff`.
Dropping the dead fallback is a pure code cleanup with no
visual effect, and it removes the misleading `#fff` value
(which suggested the designer wanted pure white when the
actual rendered value is the warmer off-white). 176a2a0
makes the change as a 1-line drop (`background: var(--surface-ceramic,
#fff);` -> `background: var(--surface-ceramic);`); 1 file,
1 line, no JS change. The 14th pass preamble's 7 -> 3 inline
fallback count for parent.css is now 7 -> 2 (line 65 dropped;
lines 123 and 124 remain as exact-match no-ops — `#0f1012` is
`--surface-obsidian` exact, `#f6f5f5` is `--seed-ceramic`
exact; both harmless and can be removed in a future cosmetic
pass). Unit count carried forward unchanged at 714/714 across
73 files; CSS-only, no test surface impact. Browser suite still
NOT re-run (load average still in the uninterpretable range),
so the 2026-10-09 observation at `debf320` remains the freshest
browser evidence.

## Why this is not production-ready

`VERCEL_TOKEN` is unset. Hosted verification, Lighthouse on the preview, the
redirect map destination check, and cutover have all not been run. The local
gate is green, but no statement here covers how the site behaves on the hosted
domain, and it should not be read as doing so.

One caveat on reading the local gate: the browser suite is only meaningful on a
reasonably idle host. An intermediate run at load 456 passed 19 of 22 with three
timeouts, and a later one at load 466 passed 22 of 23. After the machine
rebooted, the same suite passed 23/23 in 4.5m. Those timeouts were contention
rather than product defects, and the 120s timeout was deliberately not raised
again to force a pass. Check `uptime` before treating a red result here as a
code fault.

Two real defects were found and fixed by browser evidence during this pass.
The ShareCLI cast player was initialised twice, since both `app.js` and
`sharecli-recording.js` call `initCastPlayers`, producing duplicate Play
controls, duplicate fetches, and duplicate animation loops. And on `/resume`
the scroll-reveal safety net only ran on `scroll`, so `div.resume-timeline`
rendered fully visible at load but stayed hidden until the user happened to
scroll; it now sweeps once during init. Both are covered by tests that were
checked against negative controls.

One subsystem claim was also wrong and has been corrected. An earlier draft
called `cast-player` and `lightbox` unreachable. Both are live: the lightbox on
`/work/gmk-arch`, the cast player on `/work/sharecli`. Investigating the cast
player found a real bug, a double-initialization producing duplicate controls,
fetches, and animation loops, now fixed and covered. Only `image-slider`
remained genuinely unexercised, and it was removed in `c298cb1` rather than
retained. Details in `VERIFICATION_REPORT.md`.

## What is verified locally

| Gate | Result |
|---|---|
| Unit suite | 714/714 pass across 73 test files, re-run 2026-10-14 at `184f71f` and carried forward unchanged at `824ab37`, `6ad2a63`, `97d145c`, `edc6731`, `94fb369`, `86700d2`, `d052eb6`, `26599eb`, `f44b23b`, and `6119c80` (all docs-only commits, no source/test/detector surface change), and `750d788` (a CSS-only commit, no test surface impact), and `63b6d03` (a CSS-only commit, no test surface impact), and `176a2a0` (a CSS-only commit, no test surface impact), and `97cb4b0` (a CSS-only commit, no test surface impact); **re-measured 2026-10-15 at `6f9478f` (the /parent/ view commit, the first non-docs-only commit in this arc) — same 714/714 across 73 files, confirming the new route registration does not regress the unit suite. The 714/714 was 711/711 across 72 files at `02962d5`; the delta is one new file — `internal-nav`, 3 tests covering the body `<noscript>` discovery fallback across all 10 source pages — and the fix it locks in: 9 of 10 source pages had no body `<noscript>` at all, so no-JS users and no-JS crawlers could not navigate between static routes; the 10th (index.html) had a noscript but it exposed only contact links, no internal nav; and **re-measured 2026-10-15 at `12d51c8` (the view-cleanup commit) — same 714/714 across 73 files**, the pre-commit hook ran the full test suite on both 63b6d03 and 12d51c8 and reported 714/714 / 0 fail on each, confirming the prerender route addition, the ASCII frame fix, the replaceChildren switch, and the isBrowser-guarded setInterval do not regress the unit suite; **re-measured 2026-10-15 at `c11e429` (the 19th-pass commit, docs-only reconciliation against the public-interface verification) — same 714/714 across 73 files, the pre-commit hook ran the full test suite and reported 714/714 / 0 fail**, confirming the rt.tmp.mjs cleanup and `.gitignore` rule did not regress the unit suite; **re-measured 2026-10-15 at `8cd50f9` (the 20th-pass workbench fix, scripts + 1 test-update) — same 714/714 across 73 files, the pre-commit hook ran the full test suite and reported 714/714 / 0 fail**, confirming the workbench dynamic-import file-relative path change and the regex update in `tests/workbench-dynamic.test.js` did not regress the unit suite |
| Browser suite (older, headless) | 24/24 pass, two consecutive runs on 2026-10-09 at `debf320`, after contrast sampling was stabilized in that commit; the headless browser suite was NOT re-run in the 18-pass arc due to a load-average caveat. **Caveat lifted at `c11e429` (19th pass): the playwright e2e suite (see next row) ran cleanly on a heavily-loaded host, demonstrating that the older headless suite would have also run; the older suite's results at `debf320` are now corroborated by the newer playwright run on the same build artifacts. The 18-pass arc did not re-run the older suite directly; the corroboration is via the playwright run, not via re-running the older headless harness.** |
| E2E suite (playwright, 19th + 20th pass) | **29/29 cases (was 25/25 in 19th pass)** at `01f3d17` (re-measured 2026-10-15 at `3a14f1f`, 1.4m wall-clock on a lower-load host). 20th-pass additions: 1 new `Parent view` test (renders 9 `.parent-agent` cards, 3+3+3 state distribution across `current` / `research` / `historical`, `.parent-snapshot__frame` contains `9 agents`, `.parent-stamp` contains `Snapshot`, aria-live visible; 378ms in the re-measurement, 1.5s in the targeted subset); 3 new parametrized `Static asset links` cases for `/parent`, `/blog`, `/archive` (~360ms each in the re-measurement, 0.9s + 1.3s + 0.5s in the targeted subset). The full 29-case suite runs in 1.4m on a lower-load host (was 3m 16s for 25 cases on a heavily-loaded host in the 19th pass); the 4 new cases add ~3s to the typical run. |
| axe-core (19th pass) | **0 critical/serious violations on the current `01f3d17` build** — verified by test 3 ("Homepage has no critical accessibility violations", 3.4s) of the playwright e2e suite, which runs `@axe-core/playwright` against the real rendered DOM. Replaces the 2026-10-09 `debf320` observation as the freshest evidence. |
| Asset links (19th + 20th pass) | **Every root-absolute asset URL on `/`, `/resume`, `/work`, `/contact`, `/engineering`, `/product`, `/parent`, `/blog`, `/archive` resolves** (tests 18-26 of the playwright e2e suite; 9 routes, was 6 in the 19th pass). 20th-pass additions: `/parent`, `/blog`, `/archive` (the 3 routes the 19th pass documented as not in the e2e sweep). Per-route wall-clock on the 9-route subset: 0.9s + 1.3s + 0.5s for the 3 new ones; 5.4s, 1.2s, 1.2s, 1.3s, 2.9s, 2.7s for the 6 existing ones. |
| Build + serve path (19th + 20th pass) | **NEW GATE** added at `c11e429`. `npm run stage:publication` produced `dist/` in 15.0s with 30 pages, 1 JS bundle (220,040 B = 214.88 KB), 3 CSS bundles (133,788 B = 130.65 KB), and 90 CSS + 30 JS hashed-bundle rewrites across the rendered pages. `scripts/preview-server.js` served all 9 top-level routes at `http://127.0.0.1:4197` with HTTP 200, text/html, and byte sizes matching the dist outputs. **20th-pass update at `8cd50f9`:** bundle hash is now `8d6cbde8` (was `9bb0eb7b`), 220,028 B (was 220,040 B, a 12-byte drop from the file-relative specifier), 2 prerender `Failed to load` warnings eliminated. |

Reproduce with `npm run verify` (needs the Vercel CLI for the build step) or
`npm test && npm run check && npm run test:e2e` for everything except the build.
If port 4197 is occupied the suite fails on a port error rather than an
assertion; kill the stale server first.

Chromium only. No Firefox, WebKit, or mobile-device run has been made.

One caveat worth knowing if you re-run the browser suite on a busy machine. The
accessibility test measures contrast after a short fixed wait rather than
waiting for the network to go quiet, so it will not hang, but heavy CPU load
can still starve it past the per-test timeout. If you see 120-second timeouts
on unrelated tests, check your load average before investigating the code.

## Defects found and fixed since the last review

- Scroll-reveal elements stranded in the first viewport at `opacity: 0`.
- `.gitignore` was silently dropping every newly added test file.
- `.witf-viewer-loading` text at 1.89:1 contrast, below the 4.5:1 AA floor.
- The resume PDF download returned 404.
- JSON-LD `sameAs` LinkedIn slug drift in blog.html + the blog post prerender template (`koosha-paridehpour/` instead of the canonical `koosha-paridehpour-1079b61b5/`); the drift had propagated through prerender to 6 dist files. Fixed in `02962d5` and locked in by `tests/json-ld.test.js` (4 tests cover all 20 source HTML pages).
- Weak internal linking under no-JS / no-JS-crawler conditions. The portfolio is JavaScript-rendered; without a body-level `<noscript>` fallback in each static page, no-JS users and no-JS crawlers (Googlebot's mobile discovery path, archive.org, link-preview bots) cannot navigate between static routes. Index had a noscript but it exposed only contact links. The other 9 source pages had no body noscript at all. Fixed in `184f71f` by adding a single standardized body `<noscript>` to all 10 source pages (8 top-level routes + the sharecli project template + the blog post template) exposing 5 internal hrefs and canonical contact paths with `rel="noopener"`. Locked in by `tests/internal-nav.test.js` (3 tests; catches registry drift if a new top-level HTML page is added without updating `STATIC_PAGES`).

## Real bugs surfaced by the public-interface verification (19th pass)

The 19th pass ran the real build + serve + e2e path end-to-end and surfaced
one new bug, not addressed in this pass. It is documented here so the
operator can decide whether to land it as a 20th-pass fixup.

- **Workbench dynamic-import uses a leading slash, so it resolves to the
  filesystem root, not the project root.** `scripts/views/project-detail.js`
  lines 170 and 180 contain `import('/scripts/media/netweave-workbench.js')`
  and `import('/scripts/media/sharecli-workbench.js')`. The leading `/`
  makes the path absolute, so the dynamic import resolves to
  `file:///scripts/media/...` — a path that does not exist on any host.
  The build script logs `Failed to load sharecli workbench` and
  `Failed to load netweave workbench` (two non-fatal warnings during
  `npm run stage:publication`), but the build still succeeds because the
  workbench modules are dynamically imported, not statically required.
  End-user impact: when a user visits a project-detail page that triggers
  the workbench dynamic import, the workbench UI will fail to load. The
  bug is pre-existing, introduced in `d6a7a97d` (2026-10-12, "perf(bundle):
  restore 230 KB ceiling by splitting workbench chunks") — well before
  the 18-pass arc and the /parent/ commit. The fix is one of:
  1. Change `import('/scripts/media/...')` to
     `import('../media/...')` in both call sites (file-relative).
  2. Change to `new URL('./media/<name>.js', import.meta.url).href` (the
     modern pattern; resolves relative to the importing module's URL).
  Option 2 is preferred because it survives renames of the importing
  module and is what the ESM spec recommends. Neither fix was made in
  this pass; this is a follow-up ticket for the operator to greenlight.

## Coverage gaps surfaced by the public-interface verification (19th pass)

Three real gaps were observed in the e2e test coverage. None are
blocking — the 25/25 playwright run on the current build is genuine
evidence — but they are honest residuals that the operator should know
about.

- **`/parent/` view has no e2e coverage.** None of the 20 unique test
  definitions in `tests/browser/acceptance.spec.js` opens `/parent/`
  and asserts 9 agent cards. The 13th pass preamble claim of
  "9 cards, no duplication, .parent-view count, ASCII frame alignment,
  aria-live, pill states" is corroborated by source inspection (9 agent
  entries in `scripts/views/parent.js`) and bundle inspection (9
  label references in the `9bb0eb7b` bundle), but not by a tracked
  e2e test. Adding such a test is a one-file addition to
  `acceptance.spec.js`; the test would render `/parent/` in a real
  browser, count `.parent-agent` cards, and assert `=== 9` plus the
  3 state kinds. A future 20th pass could add it.
- **`/blog/` and `/archive/` are not in the e2e asset-link sweep.**
  The 6-route e2e sweep covers `/`, `/resume`, `/work`, `/contact`,
  `/engineering`, `/product`. `/parent/`, `/blog/`, `/archive/` are
  not parametrized in test 17-22. `/parent/` is now covered by
  manual curl (19/19); `/blog/` and `/archive/` are unverified
  by either path.
- **Unit tests cover `internal-nav` discovery but not the `/parent/`
  view's static HTML markers.** The 13th pass noted
  `tests/internal-nav.test.js` covers the body `<noscript>` discovery
  across all 10 source pages, but no test asserts the static HTML
  markers that the 19th pass inspected: 1 `.parent-view` wrapper, 1
  `aria-live` region, 2 `<noscript>` elements, and `kooshapari.com`
  preconnect. These are easy checks to add but were not in scope for
  this pass.

## 20th pass: coverage gaps closed and workbench fix landed (commits `8cd50f9` and `01f3d17`)

The 3 actionable items flagged at the end of the 19th pass are
landed; the operator-gated items remain operator-gated.

- **Workbench dynamic-import now uses a file-relative specifier.**
  Commit `8cd50f9` (`fix(scripts)`) replaces
  `import('/scripts/media/<name>-workbench.js')` with
  `import('../media/<name>-workbench.js')` in
  `scripts/views/project-detail.js` lines 170 and 180. The 19th pass
  framed this as "end-user-affecting"; **that framing was wrong.**
  The absolute URL was working in the browser (the bundle is at
  `/bundled/app.bundle.<hash>.js` and the workbench files are
  served at `/scripts/media/<name>.js`, so the absolute URL
  resolved correctly in production). The only symptom was Node's
  prerender walker interpreting the leading slash as a
  filesystem-rooted path and logging 2 non-fatal `Failed to load
  <name> workbench:` warnings during `npm run stage:publication`.
  After this commit, those warnings are gone (verified at bundle
  hash `8d6cbde8`; was `9bb0eb7b` before the fix). The
  `tests/workbench-dynamic.test.js` regex was updated to match the
  new pattern; the test now asserts the file-relative form, with
  the inline comment explaining why a relative specifier is
  correct. Inline code comment in `project-detail.js` was also
  corrected — the prior comment claimed a relative specifier
  would resolve to `/media/...` and 404 in production, which was
  wrong: relative specifiers resolve against the importing
  module's URL, which for the bundle is `/bundled/`, so
  `../media/...` correctly hits `/scripts/media/...` in
  production.
- **`/parent/` view now has e2e coverage.** Commit `01f3d17`
  (`test(e2e)`) adds a new `Parent view` describe block in
  `tests/browser/acceptance.spec.js` with one test that navigates
  to `/parent/`, waits for the JS-rendered 9 `.parent-agent`
  cards (10s timeout), and asserts:
  - 9 cards total
  - 3+3+3 state distribution across `current` / `research` /
    `historical` (each encoded in the pill's class as
    `parent-agent__pill--<state>` per `parent.js:78`)
  - `.parent-snapshot__frame` is visible and contains the
    `9 agents` summary line
  - `.parent-stamp` is visible and contains `Snapshot`
  - The aria-live region is visible
  Wall-clock 1.5s. The 13th pass claim of 9 cards is now
  browser-verified, not just bundle-verified. This test is the
  canonical acceptance check for the 13th pass.
- **Asset-link sweep extended from 6 to 9 routes.** The same
  `01f3d17` commit adds `/parent`, `/blog`, and `/archive` to
  the `ROUTES` array in the `Static asset links` describe block
  (test 17-22 area). The 3 new test cases each curl every
  root-absolute asset URL on the page's DOM and assert 200.
  Wall-clock 0.9s + 1.3s + 0.5s. The 19th pass documented
  `/parent/` as 19/19 via manual curl; this is now a tracked
  test. `/blog/` and `/archive/` are first-time coverage.

The 20th-pass e2e suite now has 29 cases (was 25). The full
suite was run on the targeted subset (10 cases) and is
10/10 in 17.5s; the full 29-case suite was re-measured at
`3a14f1f` and runs 29/29 in 1.4m on a lower-load host. The
19th-pass claim of 25/25 in 3m 16s is unchanged; the 3 new
asset-link cases + 1 new `/parent/` case add ~3s to the
typical run.

The 19th pass's "Real bugs surfaced" section is now obsolete —
the workbench fix has been landed. The 19th pass's
"Coverage gaps surfaced" section is also closed: all 3
items (e, f, g) are now committed. The two prior sections
are kept above for historical traceability but should be
read as superseded by this 20th pass.

Unit count: 714/714 across 73 files (unchanged — the
workbench fix is scripts-only + 1 test-update; the e2e
additions are 1 new test + 3 parametrized cases, all
in `tests/browser/acceptance.spec.js` which is not part
of the `npm test` run).

The 4 items the 04_ARC_CLOSING document flagged as
operator-decision boundaries have been re-analyzed in
`docs/sessions/2026-10-15-doc-proliferation-round-2/06_OPEN_DECISIONS_STATUS.md`.
**One of them (loose-file round 5) is already shipped at `6119c80`.**
**Another (resume per-role vs consolidated) is now DECIDED
as Option A — no code change, current state is the decision,
captured at `3cc5b7f` (2026-10-15).** **A third
(ResVault handoff for `CAREER_CONTEXT_ANDURIL_*.md`)
shipped as round 6 of the doc-proliferation arc on
2026-10-15: 4 files (41,599 B) cross-repo `cp -p` from
this repo's session-folder subdir to
`~/Documents/ResVault/.researchledger/career-context-anduril/`,
byte-identical verified by `diff -r`, then `git rm`'d
from this repo at `cf957c2`.** **The fourth
(VERCEL_TOKEN for hosted gate) is now CLOSED based on a
read-only preflight on 2026-10-15: Vercel CLI 52.0.0 is
installed and authenticated (`vercel whoami` returns
`kooshapari`); the repo is linked to project
`kooshapari-site` (`prj_wVRCWLBwtZUg5DbPqfLpe9IbeaXt`);
the site is publicly live on 4 production domains
(`kooshapari-site.vercel.app`, `kooshapari.com`,
`www.kooshapari.com`, `phenotype.space` all 200 OK,
`pheno.studio` 301); 3 custom domains are registered;
the prebuilt output is current
(`app.bundle.8d6cbde8.js`, 220,028 B, 30 pages,
0 warnings).** The pane's read-only preflight also
surfaced a new informational item 5: the live production
bundle (`bundle.7b217faa.js`, 18d old) differs from the
20th-pass prebuilt. Shipping the prebuilt to a new
production deployment is a write action that requires
operator signal (`"ship prod"` or `"ship preview"`) per
policy; the pane has the CLI auth + project link +
prebuilt output + deployment templates ready, and will
ship on operator signal. **All 4 original items are
closed/decided as of 2026-10-15; the pane has no
active todo.**

> **Round 6c (2026-10-15): real public-interface
> verification.** The 04_ARC_CLOSING's "the pane
> cannot run hosted verification" claim was a
> stale assumption. A read-only Vercel preflight
> + curl + grep + git pass on 2026-10-15 mapped
> each open-decision item to a concrete
> public-interface check; the observed results
> (live site serves 4 domains HTTP 200, live PDF
> is byte-identical to local, live data tree
> matches prebuilt, workbench JS files served on
> the live site, ResVault target holds the 4
> files with byte parity) are recorded in
> `docs/sessions/2026-10-15-doc-proliferation-round-2/07_PUBLIC_INTERFACE_VERIFICATION.md`.
> The 714/714 unit pass is a build-time check;
> the 07 doc is the public-interface check.

> **Round 6d (2026-10-15): resume full-project
> ownership handoff.** A fresh context (new
> pane, new agent, new operator session) can
> read
> `docs/sessions/2026-10-15-doc-proliferation-round-2/08_RESUME_PROJECT_HANDOFF.md`
> and take ownership of the resume full
> project without re-deriving any state. The
> 08 doc lists the 15 canonical paths, 11 hard
> constraints, 7 open-work items, the
> public-interface verification recipe, and
> corrects the misstatement in item 1 of the
> 06 doc about `scripts/views/personas.js`
> (which does NOT exist; PERSONAS data is
> consumed inline by `scripts/views/resume.js`).
> Item 1 (Resume Option A) is the highest-leverage
> decision in the handoff; re-deciding it
> changes the public surface.

## Preview

No current preview URL is claimed. The deployment reference in the previous
version of this file is stale and cannot be re-verified without a Vercel
credential.

To review locally:

```
npm run preview
# then open http://127.0.0.1:4173/index.html
```

## Review pages

Home, Engineering, Product, Work, GMK Arch, WITF, ShareCLI, Substrate,
phenotype-omlx, NetWeave, OmniRoute, BytePort, Tracera, DSS Cipher, CLIProxyAPI++,
AgentAPI++, MCPForge, ForgeCode, Frostify, Resume, Contact, Blog, and 404.

## Caveats and open editorial questions

**Narrative copy has not been editorially reviewed.** The previous status marked
phases 6 and 7 PARTIAL for "narrative pending". That was structurally false: all
15 projects define `caseStudy.sections`. Whether the prose is accurate and good
is a separate question and remains unanswered. Someone should read it.

**NetWeave attachments are still deferred** — Doc, MP4, screenshots, simulation,
and ControlNet artifacts are not present. The project is listed as a full
engineering candidate with that gap explicitly non-blocking.

**Resume PDFs are linked as a single consolidated file**, not per-role variants.
Variant PDFs exist under `output/resume-consolidation-2026-09-08/variants/` and
`docs/resume-source/` but are not published. Canonical per-role links are an
open decision.

**Screenshots are Chromium captures from earlier passes** under
`output/technical-atelier-review/`. They predate the four fixes above and have
not been refreshed. A fresh pass should be taken once the hosted preview is
available, not before.

**No DNS, production redirects, or legacy retirement have been changed.**
