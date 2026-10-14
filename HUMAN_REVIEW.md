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
the freshest product evidence on file.

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
| Unit suite | 711/711 pass across 72 test files, re-run 2026-10-14 at `02962d5` (up from 707/707 across 71 files at `5a22929`; the delta is one new file — `json-ld`, 4 tests covering canonical Person structured data — and the bug fix it locks in: blog.html + the blog post prerender template carried `koosha-paridehpour/` in `sameAs` while the other 19 source pages used `koosha-paridehpour-1079b61b5/`) |
| Browser suite | 24/24 pass, two consecutive runs on 2026-10-09 at `debf320`, after contrast sampling was stabilized in that commit; not re-run at either 2026-10-14 pass (load average 344 at `5a22929`, then 220 at `02962d5`; both in the uninterpretable range per the caveat above) |
| axe-core | No critical/serious violations; contrast violations zero across 7 routes (2026-10-09 browser pass at `debf320`; not re-run at either 2026-10-14 pass, same load caveat) |
| Asset links | Every root-absolute asset URL on the built pages resolves (same 2026-10-09 pass; not re-run at either 2026-10-14 pass) |

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
