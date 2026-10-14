# Career and portfolio program audit

Assessment: 2026-09-07 Pacific. Status: IN PROGRESS; publication gate BLOCKED.

Implementation update, September 7 18:07 Pacific: F01 file packaging repaired locally. Two byte-identical recordings now live under public/projects/sharecli/recordings, with catalog links and download attributes. The regression test first failed on the missing file, then passed against source, dist and Vercel static output using pinned SHA-256 values and revision checks. Local Vercel build, 44/44 tests and syntax checks passed. Hosted delivery and browser download acceptance remain open. The link now promises a download; an embedded player was not added. Earlier findings below retain the pre-repair evidence.

## Scope and evidence rules

This report covers the career evidence in ResVault, the portfolio site, the ShareCLI recordings, and supporting ResearchLedger/Agentora/AgilePlus evidence examined in this conversation. The wider repository estate remains an inventory boundary, not an audited product denominator. The earlier 149-entry/60-.git-directory scan excluded Git worktrees represented by .git files and nested repositories; 60 is not a complete repository count.

VERIFIED means a named observation at a stated revision/time. HISTORICAL means retained evidence that has not been refreshed. UNKNOWN means the necessary proof was not obtained. BLOCKED means a specific unmet gate. A passing tool run does not establish all downstream user journeys.

## Past and present

| Surface | Evidence | Present interpretation |
| --- | --- | --- |
| LinkedIn | ResVault/.researchledger/linkedin-pass1: 26 files; public DOM verification dated August 25 | Historical section verification. September 7 browser navigation reached auth wall. Skills additions have acknowledged saves without rendered confirmation. |
| GitHub identity | ResVault/.researchledger/github-pass1: 13 files counted | Evidence inventory exists; full content/current profile comparison remains open. |
| Portfolio | 43 Node tests passed earlier September 7; 13 test files; source and existing static output checks | Local test pass has a publication coverage gap described below. No .git in site directory; canonical source custody unresolved. |
| ShareCLI | Local 81c4dfaa208749adfa56ec6bbe07e01b5f80397e; two staged captures | September 7 remote main 00aa2c267e1d50afd3fcd9656ed4da8cb9b90179 was 20 commits ahead. Local test failure does not prove remote-main failure. |
| ResearchLedger | ddc2aa85930facbeb058242559bdbee5a5248161 matched remote main; 124 tests/build/CSP/resources passed | Frontend and selected contracts verified. Reranker reported PASS_LOCAL_FALLBACK; native desktop and authenticated provider E2E remain unknown. |
| Agentora | Local branch 56ba56d8b0ace4cefccaa3b4d3dbb988f2f82f5c; default tests passed | Historical response said 62; captured suite totals sum to 69. This is root/default coverage, not all workspace/features/live-model coverage. Remote comparison returned 404; ancestry unresolved. |
| AgilePlus | MCP health and gRPC healthy; two features returned | Civic feature summary says zero WPs while direct retrieval returns 20 planned WPs, all with empty dependencies/owners. Global governance passed; no transition-specific closure proved. |

## Finding F01: replay publication is broken

Both catalog URLs in scripts/media/sharecli-recording.js point under /output/playwright/. For each capture, a direct existence probe returned false at the site root, dist, and .vercel/output/static, and true in ../sharecli/output/playwright/.

scripts/stage-publication.js copies styles, scripts, data, public, work, and blog; it does not copy output. tests/build-output.test.js intentionally requires output to be excluded. tests/sharecli-recording.test.js validates metadata and the .cast suffix, but never reads the target file. Therefore the 43-test pass cannot establish downloadable or playable recordings.

The renderer creates ordinary anchors labelled "Open asciinema replay". Playback behavior is unverified; there is no player integration in that renderer. Delivering a .cast file alone must not be counted as a demonstrated browser replay journey.

Canonical capture SHA-256 values observed September 7:

- help: 324a834cfe01fb12b345e775b2cde59e62215afe89eeab9b88a64457e4f8a96e
- health: bdf24f25e24b1b9459e9e3d1e7aff6a7456300da6e7e2192b0d7f5510e4882fa

## Quality infrastructure inventory

| Layer | Present mechanism | Gap / required acceptance |
| --- | --- | --- |
| Site unit/contracts | Node tests for router, lens, filters, records, metadata, work views, media/workbenches, static output | Replay existence/hash and real browser journey missing from catalog test. |
| Site syntax | npm run check checks three JS entry files | Not a full source lint/typecheck denominator. |
| Build parity | Existing .vercel/output/static compared with selected source files | Cold build reproducibility and linked-asset closure need separate acceptance. |
| Browser E2E | Historical route/keyboard/console reports | Repeat against candidate build with downloads/replay, direct URLs, back/forward, mobile and 404 behavior. |
| Accessibility | Historical axe and keyboard claims | Current automated results and manual keyboard/reduced-motion evidence absent from this pass. |
| Performance | LIGHTHOUSE_REPORT.md explicitly claims no scores | Measured candidate baseline and budgets remain open. |
| Release | Vercel staging configuration and historical preview IDs | Current hosted artifact, canonical domain, redirects and rollback unverified. |
| ShareCLI Rust | cargo test --locked on local revision | Stops at c00_lib_sprawl_facade: pyroscope_stub outside allowlist; later targets not established by this run. |
| Hosted quality | September 7 PR #855: 18 failures, six skips, changes requested | Check counts are PR-specific; E2E/integration skipped. Required branch protections not audited. |
| Recovery/privacy | Publication allowlist excludes internal output/docs | Preserve exclusion while exporting only approved media. Restore drill and publication privacy scan remain open. |

## Future WBS and dependencies

Owners below are proposed roles, not dispatched agents. Audit/planning is authorized; implementation and publication are separate stages.

| ID | Owner role | Dependencies | Concrete output and exit criterion |
| --- | --- | --- | --- |
| A01 | Program auditor | none | Reconcile prompt inventory, design specs, plans and handoffs into requirement-to-artifact/test rows; list every unresolved requirement. |
| A02 | Custody owner | A01 | Identify canonical source repository or recovery copy; record hashes and branch provenance without overwriting existing work. |
| A03 | Portfolio implementer | A02 | Publish only the two approved captures under public/projects/sharecli/recordings; update catalog URLs and retain source hashes/revision. Keep output excluded. |
| A04 | Quality owner | A03 | Add file/hash/build closure checks; npm test must fail for a missing or altered capture and pass for packaged captures. |
| A05 | UX owner | A04 | Choose and implement an honest download experience or actual player; browser proof must match displayed action. |
| A06 | Browser QA owner | A05 | Candidate route, replay/download, keyboard, focus, mobile, reduced motion, 404 and console checks with artifact links and timestamps. |
| A07 | Quality owner | A06 | Accessibility and Lighthouse baseline; document budgets, measured values, failures and manual review boundaries. |
| A08 | Career evidence owner | A01 | Reconcile GitHub/LinkedIn/resume claims with source evidence; retain skill ambiguity and auth limitation until resolved. |
| A09 | Product QA owner | A01 | Inventory ResearchLedger native tests/provider contracts and Agentora workspace/features; run approved deterministic targets and document skipped external journeys. |
| A10 | Governance owner | A01 | Diagnose AgilePlus count mismatch against running version and existing PR #1069; propose correction and real WP dependencies without changing unrelated feature scope. |
| A11 | Release owner | A02,A07,A08 | Prepare exact candidate manifest, hosted preview verification, redirect/privacy checks and rollback instructions for review. |
| A12 | Sponsor/release owner | A11 | Production approval and authorized deployment followed by hosted user-journey verification. |

No archive, source deletion, ref rewrite, mass commit, or broad output publication is part of this plan. Preserve staged captures and unrelated dirty work.

## Audit work still outstanding

Vercel preview diagnosis, September 7 20:39 Pacific: existing process 68231 on 4173 has the correct cwd but returns 404 for the new recording module. A fresh `vercel dev --listen 4189 --yes` rebuild served the module with HTTP 200 and rendered the clean /work/sharecli route. Port 4189 had separate IPv4 Python and IPv6 Vercel listeners; use explicit http://[::1]:4189 for this observation. Both Chrome downloads succeeded through Vercel with the canonical hashes and zero console errors/warnings. Evidence: .playwright-cli/page-2026-09-08T03-38-44-709Z.yml and downloaded casts. Fresh-server success supports stale running-preview state as the cause of the original failure; exact internal cache mechanism was not inspected. No source routing fix is indicated. Restart/rebuild the old preview when its owner is ready; it was left running. Hosted deployment verification remains open.

Browser download acceptance, September 7 20:23 Pacific: isolated Chrome opened /work/sharecli on a loopback server rooted in .vercel/output/static (port 4188, explicit ShareCLI HTML route mapping). Both rendered download links produced the expected filenames; downloaded SHA-256 values exactly matched the canonical hashes above. Tab then Shift+Tab followed by Enter reactivated the health download. Browser console reported zero errors and warnings on this candidate. Evidence: .playwright-cli/page-2026-09-08T03-22-27-763Z.yml, page-2026-09-08T03-23-08-866Z.yml, and downloaded .cast files. This establishes the local download journey, not full keyboard traversal or hosted rewrite parity. Existing vercel dev on port 4173 separately returned 404 for scripts/media/sharecli-recording.js and rendered an empty main; its preview-serving defect remains open. The existing server was left unchanged.

Full requirement traceability, source/asset rights inventory, canonical repository identity, backend test enumeration, dependency/security review, current hosted preview verification, external primary-source research, performance/accessibility measurements, restore evidence and runnable acceptance plans remain unfinished. This report is a durable checkpoint, not full-audit completion.

## Source pointers

- scripts/media/sharecli-recording.js
- scripts/stage-publication.js
- tests/sharecli-recording.test.js
- tests/build-output.test.js
- vercel.json
- HUMAN_REVIEW.md and IMPLEMENTATION_STATUS.md: historical preview claims with different deployment IDs
- LIGHTHOUSE_REPORT.md: no measured scores
- docs/PORTFOLIO_PROMPT_INVENTORY_2026-09-05.md: next requirement reconciliation input
- ../sharecli/tests/c00_lib_sprawl_facade.rs and ../sharecli/src/lib.rs: local test conflict
- /Users/kooshapari/Documents/ResVault/.researchledger/: identity evidence
