# Migration Status

Reconciled 2026-09-29 against the code at `437dfa8`. Phase statuses below were
checked against the actual renderers and data, not against the previous version
of this file. Where a status changed, the evidence is named.

## Phase tracking (pmp02.md s20)

| Phase | Scope | Status | Evidence |
|---|---|---|---|
| 0 | Validate handoff + finish asset crawl | COMPLETE | — |
| 1 | Typed content model + project records | COMPLETE | 15 records in `data/projects.js` |
| 2 | Design system / shell / navigation | COMPLETE | — |
| 3 | Homepage (Technical Atelier) | COMPLETE | — |
| 4 | Engineering / Product lenses | COMPLETE | — |
| 5 | Work index with filters | COMPLETE | filter focus restoration covered by the browser suite |
| 6 | GMK Arch + WITF case studies | COMPLETE (narrative) | 9 and 10 `caseStudy.sections` respectively |
| 7 | Top engineering case studies | COMPLETE (narrative) | sharecli 8, substrate 8, phenotype-omlx 8, omniroute 10, netweave 8 |
| 8 | Archive / remaining compact entries | COMPLETE | all 15 records render |
| 9 | Resume / contact | COMPLETE | `/resume` renders and the PDF link resolves |
| 10 | SEO / analytics / verification | PARTIAL (see below) | sitemap present; OG images resolve but are shared, not per-project |
| 11 | Redirect preview | NOT STARTED | `vercel.json` has no `redirects`; no `redirect-map.csv` |

### Corrections to the previous status

**Phases 6 and 7 were marked PARTIAL for "narrative needs enrichment" and
"full narrative pending". Both are wrong.** Every one of the 15 projects
defines `caseStudy.sections`, rendered via `sectionLookupFor` in
`scripts/views/project-detail-helpers.js`. There is no project relying on the
`COMPACT_SECTIONS` fallback. The narrative gap the old status described no
longer exists.

This does not mean the copy is good. It means the structural claim of missing
narrative was false. Reviewing whether the prose is accurate is a separate
editorial question and is still open.

**Phase 9 was marked PARTIAL with "PDF links pending". The PDF exists and the
link was broken.** `public/koosha-paridehpour-resume.pdf` is tracked in git and
stages to `dist/public/`. The resume view linked to `/koosha-paridehpour-resume.pdf`,
which returns 404, because published assets live under `/public/`. Fixed in the
working tree; a regression test now resolves every root-absolute asset URL that
a built page emits.

### Phase 10 detail

`app.js` derives the OG image from `project.hero` when the hero is a root-absolute
path, otherwise it falls back to `/og-image.png`. Project heroes point into
`/public/projects/...`, so project pages do get a project-specific image. The
`og-image.png` fallback is a single shared asset used by non-project routes.
The file exists at the repository root and stages correctly. There is no
per-project *designed* OG card; the hero image stands in.

## Infrastructure

| Artifact | Status |
|---|---|
| EVIDENCE_LEDGER.md | Created 2026-09-01 |
| MIGRATION_STATUS.md | Created 2026-09-01, reconciled 2026-09-29 (this file) |
| redirect-map.csv | Still absent. Phase 11 cannot start without it. |
| web-migration/ directory | Not present (planning artifacts are in pmp01-03.md) |
| VERIFICATION_REPORT.md | Rewritten 2026-09-29 with measured results |
| HUMAN_REVIEW.md | Stale. See below. |

## Current blockers

**`VERCEL_TOKEN` is unset.** This blocks, in order: hosted verification,
Lighthouse on the preview, the redirect map's real destination check, the
production gate, and cutover. Nothing in the local gate can substitute for it,
and no hosted claim should be made until it is resolved.

**`HUMAN_REVIEW.md` still describes the site as it was in September.** It claims
"28/28 Node tests" and a 2026-09-04 review gate, and its preview deployment
reference is stale. The header still reads "READY FOR HUMAN PRODUCTION REVIEW",
which overstates the current position given the blockers above. It needs a
rewrite before it is shown to anyone; it has been left in place rather than
silently edited, so the staleness is visible rather than hidden.

**Shipped subsystems all reachable.** `image-slider` was unreachable and was
removed in `c298cb1` rather than retained. `cast-player` and `lightbox` are live:
the lightbox on `/work/gmk-arch`, the cast player on `/work/sharecli`, the latter
covering a real double-initialization bug. Details in `VERIFICATION_REPORT.md`.

Note that the paragraph above, which recorded `HUMAN_REVIEW.md` as still
describing the site as it was in September, is itself a 2026-09-29 pass.
`HUMAN_REVIEW.md` has since been rewritten; its current header reads "NOT READY
FOR PRODUCTION REVIEW" and it names the missing hosted gate directly.

**The counter renders on 4 of 15 projects.** Only `gmk-arch`, `witf`,
`omniroute`, and `frostify` define `metrics`, so `data-count-to` appears on
those four project pages and nowhere else.
