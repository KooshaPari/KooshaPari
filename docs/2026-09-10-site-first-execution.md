# Site-first execution board - 2026-09-10

The public portfolio is the primary workstream. Resume work is limited to the
canonical engineering and technical product/program management splits; the
Anduril-targeted files remain private custody context only.

## Ordered site gates

| Order | Gate | Owner surface | Exit evidence |
|---|---|---|---|
| 1 | Visual brief for the next hero/art pass | `docs/2026-09-10-visual-asset-upgrade-backlog.md`, NetWeave source | Approved composition, palette, focal hierarchy, mobile crop, and claim boundary |
| 2 | NetWeave P0 asset pass | `asset-sources/netweave-local-rules-v1/`, `scripts/media/netweave-field.js` | Deterministic exports, hashes/dimensions, alt text, 390/1440 screenshots, reduced-motion/no-JS checks |
| 3 | Shared diagram language | `scripts/media/diagrams.js`, `systems-plate.js`, `omniroute-topology.js` | Consistent node/edge/status tokens, semantic fallback, keyboard/readers proof |
| 4 | Case-study hierarchy polish | `styles/case-studies.css`, `scripts/views/project-detail.js`, selected artifact views | No duplicate narrative, clear evidence-vs-illustration boundary, mobile overflow zero |
| 5 | Site-wide acceptance | `tests/browser/acceptance.spec.js`, `tests/static-projects.test.js` | Unit, build, check, browser, axe, no-JS, download/hash, and five-viewport screenshots |
| 6 | Promotion | canonical public checkout + Vercel | reviewed allowlist, staged diff check, deployment metadata, rollback preserved |

## Parallel work allowed

- Asset provenance/manifest design can proceed alongside the visual brief.
- Browser acceptance coverage can proceed alongside authored asset preparation.
- Public-route copy and evidence-label review can proceed without touching private career files.

## Explicitly deferred

- Anduril-targeted resume variants.
- LinkedIn profile mutations, posts, messages, and connections.
- Google Docs copies until canonical engineering/management content is settled.
- New design-tool installations unless a selected site asset actually requires them.

## ShareCLI object-first and recorded-replay slice

The ShareCLI slice brings the runtime object and recorded replay into the site-first
sequence. Keep recorded-session evidence distinct from illustrative runtime
explanations. Acceptance must inspect the actual presentation, replay controls,
readable fallback, and evidence boundaries before promotion.

NetWeave v3 and ShareCLI are **blind drafts awaiting independent visual review**.
Automated verification does not establish visual quality or reviewer acceptance.

Latest verification evidence, supplied by the coordinating agent for this update:

| Check | Result |
|---|---|
| Vercel build | PASS |
| npm test | PASS, 59/59 |
| node --check | PASS |
| Playwright | PASS, 9/9 in 30.2 seconds |

These results record the latest run; this documentation task did not rerun them.
No deploy or push occurred. Independent visual review remains the next gate for
both drafts, followed by any necessary corrections and the existing promotion
checks above.

## OmniRoute routing-plate lane and final edited-source verification

The OmniRoute routing-plate lane joins the site-first slice. Preserve its upstream
contribution boundary and inspect routing relationships, labels, controls, and
readable alternatives during independent visual review.

The following final edited-source run supersedes the earlier 59/59 and
30.2-second ShareCLI checkpoint above, which remains historical evidence.
Results were supplied by the coordinating agent, not rerun by this docs task.

| Check | Result |
|---|---|
| Vercel build/stage | PASS |
| npm test | PASS, 82/82 |
| node --check | PASS |
| Playwright | PASS, 9/9 in 24.9 seconds |

NetWeave v3, ShareCLI, and OmniRoute remain **blind drafts pending independent
visual review**. These automated passes do not close that gate. No deploy or push
occurred.

## ShareCLI P1 visual correction

The Burst illustration now shows four distinct staggered metallic capsules on a
stationary rail, with one highlighted. The coordinating agent reports visual
smoke checks at 1440px and 390px passed without clipping, focused tests passed
14/14, and `node --check` passed. This is scoped correction evidence, not full
independent visual acceptance of every draft; this docs task did not rerun checks.

NetWeave's mobile thin-strip presentation and stale-blue-caption findings remain
deferred P2 items. No deploy or push occurred.

## NetWeave P2 correction

The coordinating agent reports the mobile-only figure crop/wider frame now measures
308 x 123 pixels at a 390px viewport, retaining all four vehicles across all three
states without overflow. The stationary-vehicle caption now correctly describes
graphite-grey. Desktop presentation and source assets are unchanged.

Focused tests passed 14/14 and syntax checks passed. These scoped results supersede
the two deferred P2 findings above; this docs task did not rerun verification.
Approach-state touching/overlap is preserved from the underlying sequence, not
introduced by this patch. Broader independent visual acceptance remains separate.
No source edits, deploy or push were performed by this documentation update.
