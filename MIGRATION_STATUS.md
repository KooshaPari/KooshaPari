# Migration Status

## Phase tracking (pmp02.md s20)

| Phase | Scope | Status |
|---|---|---|
| 0 | Validate handoff + finish asset crawl | COMPLETE |
| 1 | Typed content model + project records | COMPLETE |
| 2 | Design system / shell / navigation | COMPLETE |
| 3 | Homepage (Technical Atelier) | COMPLETE |
| 4 | Engineering / Product lenses | COMPLETE |
| 5 | Work index with filters | COMPLETE |
| 6 | GMK Arch + WITF case studies | PARTIAL (hero assets only, narrative needs enrichment) |
| 7 | Top engineering case studies | PARTIAL (compact sections wired, full narrative pending) |
| 8 | Archive / remaining compact entries | COMPLETE (all 14 records render) |
| 9 | Resume / contact | PARTIAL (HTML views wired; PDF links pending) |
| 10 | SEO / analytics / verification | PARTIAL (sitemap exists; per-project OG pending) |
| 11 | Redirect preview | NOT STARTED |

## Infrastructure

| Artifact | Status |
|---|---|
| EVIDENCE_LEDGER.md | Created 2026-09-01 |
| MIGRATION_STATUS.md | Created 2026-09-01 (this file) |
| redirect-map.csv | Pending |
| web-migration/ directory | Not present (migration planning artifacts are in pmp01-03.md) |

## Current blockers

- Vercel redeployment requires auth token (sandbox lacks Vercel credential)
- Hosted Lighthouse/a11y checks require authenticated access to SSO-protected preview

