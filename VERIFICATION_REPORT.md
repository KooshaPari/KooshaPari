# Verification report

Last verified: 2026-09-29 at commit `437dfa8` (plus the working-tree changes noted
below). Every number below was measured in this working tree, not carried over
from an earlier report.

## Current state

| Gate | Command | Result |
|---|---|---|
| Unit suite | `npm test` | 708/708 pass, 0 fail, across 70 `tests/*.test.js` files |
| Browser suite | `npm run test:e2e` | 24/24 pass, 3.0m, on an unloaded host |
| Syntax contract | `npm run check` | pass |
| Full release gate | `npm run verify` | requires `vercel build`; see limitations |

`npm run test:e2e` stages `dist/` first and then drives Chrome against it through
`scripts/preview-server.js` on `127.0.0.1:4197`. The browser suite therefore
tests the staged artifact, not the source tree.

**Earlier full-suite failures were host load, now proven by a green re-run.**
An intermediate `npm run test:e2e` run passed 19 of 22 and timed out on three:
the scroll-reveal sweep, the cast player, and the lightbox. No assertion failed;
every failure was `Test timeout of 120000ms exceeded while setting up "page"`,
and per-test durations grew monotonically down the suite, from 13s at the start
to 17.1m by test 14. That machine was reporting load averages of 456, with
`syspolicyd` at 641% CPU and 3 days elapsed, a macOS Gatekeeper daemon unrelated
to this repository.

A second run at load ~466 improved to 22/23, with the axe viewport test the only
failure at 4.0m. After the host rebooted, the suite ran 23/23 in 4.5m at load
~250, and the current 24-test suite passes 24/24 in 3.0m. The axe test alone ran
in 7.6s in isolation.

So the timeouts were contention, not product defects, and that conclusion is now
backed by a green run rather than only by diagnosis. Two things follow. The
120s timeout is sufficient and was not raised again to manufacture a pass. And
the suite is only meaningful on a reasonably idle host: anyone reading a red
result here should check `uptime` before treating it as a code fault.

**The metric counters run, but a naive text assertion on them is vacuous.**
A first draft of the counter test compared the settled text against a
re-derived formatted number, and it passed even with `formatNumber`'s comma
branch deliberately broken. The reason is in `animateCounter`: the last frame
of the tick loop executes `el.textContent = targetText`, so the final displayed
value is the authored attribute written back verbatim and never depends on
`formatNumber` at all. Formatting only affects intermediate frames.

The test now asserts what is actually observable: that every `[data-count-to]`
element has its `_counterAnimated` latch set, proving the module is not silently
inert, and that each element settles on its exact authored text. Verified
against a negative control that disables `initCounterAnimate` outright, which
turns the test red.

Worth recording as a harness lesson: `npx playwright test` does **not** rebuild
the staged bundle, because only `npm run test:e2e` runs `stage:publication`. An
early negative control edited a source file, passed anyway, and was measuring a
stale `dist/`. Source-level negative controls must stage first.

**The scroll-reveal safety net was real, but did not cover load.** It was
flagged for re-audit as possibly unsupported. Auditing it showed the opposite
problem: the net only ran on `scroll`, so it never fired on page load. The
existing full-scroll test could not catch this, because scrolling the page
makes the IntersectionObserver fire on its own.

A new test that loads each reveal route and asserts nothing is hidden while
already inside the viewport found the live bug. On `/resume`,
`div.resume-timeline` rendered at top=565 in a 720px viewport, fully visible on
load, and stayed hidden until the user happened to scroll. `initScrollReveal`
now sweeps once at init and again on the next frame. Verified against a negative
control that removes the init sweep, which reproduces the failure exactly.

## What the browser suite actually covers

24 tests across ten groups:

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

**Two of the three suspected-dead subsystems are live, and one had a real bug.**
An earlier draft of this report called `image-slider.js`, `cast-player.js`, and
`lightbox.js` unreachable. Browser evidence contradicts two of those three:

- The lightbox is live on `/work/gmk-arch`. Clicking a case image opens it,
  arrows advance, Escape closes. It now has a browser test.
- The cast player is live on `/work/sharecli`, and it decodes real recorded
  terminal output.
- Only `image-slider.js` remains genuinely unexercised. No built page emits
  `.image-slider`, so that claim stands, narrowed to one module.

Investigating the cast player surfaced a genuine product defect. Both `app.js`
and `sharecli-recording.js` call `initCastPlayers`, and because the DOM
rebuilt view, the same `.cast-player` container was initialised twice. The
second call appended a full second chrome tree inside the first, which shipped
two Play controls, two fetch requests, and two animation loops on one
recording. `scripts/media/cast-player.js` now returns the existing player when
`container._castPlayer` is set. A unit test covers the idempotent path, and it
was checked against a negative control: removing the guard turns it red.

**Fresh-clone parity was re-verified at `fee99f5`.** A clean clone of the
current `main` tracks 71 files under `tests/` (70 unit specs plus 1 browser
spec), and neither the dangling `bundled/manifest.json` nor the Playwright
`.last-run.json` cache is tracked. After `npm ci`, `stage:publication`
regenerates the manifest and bundle from scratch and applies hashed references
to 29 pages, and the unit suite passes 708/708 in that clone. This supersedes
the single earlier check at `e9955e0`.

**Bundle determinism is now confirmed by measurement, and the old citation was
wrong.** The previous version of this claim attributed the check to commit
`42863b41`. That object does not exist in this repository, so the claim could
not be verified or reproduced and has been discarded.

Determinism was instead measured directly at `7270ae4`: staging twice, the
second time after deleting `dist/` and `bundled/` entirely, produces a
byte-identical `app.bundle.08d006f1.js` (sha256
`08d006f1c33a...de737`) both times. This holds from a clean tree, not just
from an incremental rebuild, which is the stronger of the two checks.

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

