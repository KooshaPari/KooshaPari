# Verification report

Last verified: 2026-09-29 at commit `437dfa8` (plus the working-tree changes noted
below). Every number below was measured in this working tree, not carried over
from an earlier report.

## Current state

| Gate | Command | Result |
|---|---|---|
| Unit suite | `npm test` | 707/707 pass, 0 fail, across 70 `tests/*.test.js` files |
| Browser suite | `npm run test:e2e` | 20 tests, all passing |
| Syntax contract | `npm run check` | pass |
| Full release gate | `npm run verify` | requires `vercel build`; see limitations |

`npm run test:e2e` stages `dist/` first and then drives Chrome against it through
`scripts/preview-server.js` on `127.0.0.1:4197`. The browser suite therefore
tests the staged artifact, not the source tree.

## What the browser suite actually covers

20 tests across eight groups:

| Group | Tests | What it asserts |
|---|---|---|
| Homepage | 4 | title/nav/hero; WITF board placement across lens pages; critical a11y; contrast evaluated and violations zero |
| Navigation | 2 | every navigation page has content and links; clean navigation between pages |
| Project Pages | 1 | all project pages render with title, summary, and navigation |
| Blog | 1 | blog posts render with title, excerpt, and navigation |
| ShareCLI | 2 | heading and download; accessibility across viewports |
| Reader Mode | 1 | shortcut, persistence, reduced motion, and focus |
| Scroll reveal | 3 | every reveal-capable route ships `[data-reveal]`; a below-fold target reaches `reveal-visible` at opacity 1; a full scroll leaves no renderable reveal target hidden |
| Static assets | 6 | every root-absolute asset URL a built page emits resolves over HTTP |

## Defects this suite caught

Each was found by a test that was red first, not by inspection.

**Reveal elements stranded in the fold** (`cc9608b`). The observer used
`rootMargin: -40px`, so an element whose bottom edge sat inside the first
viewport never crossed the trigger line. It rendered at `opacity: 0` while
fully visible. Reproduced deterministically before the fix.

**`.gitignore` deleted every new test file** (`e9955e0`). `tests/` was listed in
`.gitignore` while 69 files under it were already tracked. Git applies the rule
only to untracked paths, so pre-existing tests kept committing and anything new
silently disappeared. Two test files existed only in one working tree, which
meant a fresh clone ran 68 of 70 files. Any test count quoted before this fix
described one machine, not the repository.

**Loading-state contrast below the AA floor** (`437dfa8`). axe measured 1.89:1
on `.witf-viewer-loading`, where WCAG AA requires 4.5:1. The panel background
is `--surface` in both themes, so the element is always light-on-dark, but its
colour came from `--ink-muted`, which inverts with the theme. The gate was
flaky rather than reliably red, because the element only exists while the GLB
loads: three consecutive runs gave two passes and one failure, and a direct
probe of the same condition failed 5 of 6.

**Resume PDF link returned 404** (working tree, below). The download pointed at
`/koosha-paridehpour-resume.pdf` while the file publishes under `/public/`. It
rendered as a normal download link, and no presence-based assertion would have
noticed. A sweep of every root-absolute asset URL in the built pages found it;
the fix is `/public/koosha-paridehpour-resume.pdf`, matching the convention
used by `work.js` and `data/projects.js`.

## Verification method, and its limits

Negative controls were used to prove each test can fail. The reveal tests were
re-run against a deliberately broken selector in a rebuilt artifact: both
behavioural tests went red, and passed again after restore. The static-asset
test was re-run against the reintroduced 404: 1 failed, 5 passed, with the diff
naming `404 /koosha-paridehpour-resume.pdf`; it returned to 6/6 after restore.

**Two controls from this cycle were invalid, and neither proved anything.**

A first rebuild-and-rerun of the reveal tests looked like it confirmed the fix,
but the browser suite serves `dist/` and I had rebuilt `bundled/` without
restaging. Both arms tested identical bytes; the failure I saw was a
smooth-scroll race in the test, not the defect. Restaging through
`stage-publication` produced the real red.

A `git stash` comparison appeared to show the contrast bug predated the reveal
work. The stash left the same bundle in `dist/`, so both arms again tested
identical bytes. The genuine baseline required a worktree build at `e7b69ad^`.

**Test flakiness has an infrastructure cause.** `playwright.config.js` sets
`reuseExistingServer: false`, so a preview server left running on port 4197 from
an earlier command makes `npm run test:e2e` fail with a port-in-use error
rather than a real assertion. One apparent "intermittent" asset-test failure was
exactly this. Kill the port before running the suite.

## Known limits of the current gate

**The counter is only reachable on 4 of 15 projects.** `data-count-to` is
rendered by `project-detail.js` from `project.metrics`, and only `gmk-arch`,
`witf`, `omniroute`, and `frostify` define metrics. The other 11 project pages
exercise no counter.

**Three subsystems have no reachable DOM at all.** `image-slider.js` and
`cast-player.js` are imported by `app.js` and auto-discover `.image-slider` and
`.cast-player[data-src]`, but no view, component, or data record emits either
class. `lightbox.js` likewise finds no image to open. All three are shipped,
bundled, and dead in every route. They are not verified because they cannot be,
and no test asserts they work.

**Fresh-clone parity was verified once.** `tests/` now tracks 70 files and 1
browser spec in both a fresh clone and the working tree. This was checked when
`e9955e0` landed; it has not been re-checked since.

**Bundle determinism was checked at `42863b41`, not at `437dfa8`.** The
bare-import fix in `scripts/bundle-js.js` left the production bundle
byte-identical at the time. A later bundle-affecting commit has not been
re-confirmed.

**The hosted gate has not been run.** `VERCEL_TOKEN` is unset, so hosted
verification, the redirect map, Lighthouse on the preview, and any cutover
remain unperformed. No statement in this report covers hosted behaviour.

**Accessibility is verified in Chromium only.** The suite is configured with the
`chrome` channel. No Firefox, WebKit, or mobile-device run has been made.

**axe covers 3 of the site's routes, not all of them.** The contrast test walks
`INCOMPLETE_CEILING = { '/': 22, '/work': 16, '/blog': 15 }`, and the
critical-violation test runs on `/`. Project detail pages, `/resume`,
`/contact`, `/engineering`, and `/product` are not axe-swept. A contrast
regression on those routes would not be caught. The previous version of this
report claimed a 10-route axe sweep; that claim was not reproducible and has
been removed rather than restated.

The three axe routes are the only pages with a recorded incomplete-node ceiling.
Those ceilings are coverage thresholds, not quality thresholds: they fail when
axe becomes *less* able to evaluate contrast, which catches a colour silently
serialising as `none` again. They do not mean the residual incomplete nodes are
defects.

