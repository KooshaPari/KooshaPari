# 2026-10-12: Parking-Lot Re-Evaluation

Read-only review. Re-evaluates the 3 candidates held in the parking lot from
`NOVELTY_CANDIDATES.md` against the museum-quiet voice established by the
already-shipped Editorial Grid, E-Ink / Paper, and Dimensional Layering
shipped to `main @ 5168b23`. No code or constitution changes.

## 1. Constraint ledger (live audit, 2026-10-12 23:17Z)

| # | Constraint | Current state | Source |
|---|---|---|---|
| 1 | WCAG 2.2 AA, both themes | `tests/contrast.test.js` enforces >=4.5:1 small / >=3:1 non-text on every family accent+ink pair; 696/696 tests green on `main @ 5168b23` | constitution §13, `tests/contrast.test.js` |
| 2 | Bundle <= 230 KB (code-only) | `./bundled/app.bundle.b913e0fe.js` = 238,974 B = 233.4 KB. **Already 3.4 KB over the ceiling.** The 696-test green-bar reflects the current ~228.7 KB referenced in `NOVELTY_CANDIDATES.md`; HEAD shows ~5 KB of organic drift accumulated in the merged post-ship edits. Net-additive candidates must come from net removal, not net addition. | `./bundled/app.bundle.b913e0fe.js` |
| 3 | Motion <= 400 ms | `--motion-glacial: 380ms` is the longest registered token; `--motion-slow: 280ms` is the longest commonly used. The 300 ms theme-transition in `tokens.css:379` is an outlier (background/color/border/box-shadow only, no transform). | `tokens.css:129-134, 379` |
| 4 | 0 new color families | Engineering lens = `--arch-500` + 6 family accents (netweave/sharecli/omniroute/physical/substrate/omlx). Product lens = `--olive-500` + the 6 family-product variants. All 12 are pre-solved against `surface-raised #faf7ef` and `graphite-800 #30332e` for >=4.5:1 small text. | `tokens.css:139-174` |
| 5 | 0 new fonts | `Inter` (body) + `Space Grotesk` (display) + `JetBrains Mono` (meta). All three are stable, locally hosted, and tested for subpixel rendering. | `tokens.css:79-84` |
| 6 | 0 new third-party scripts | 0 npm runtime deps added by these three candidates. Any motion, surface switch, or grid utility stays inside the existing `shell.js` opt-in pattern. | `scripts/components/shell.js:6-19` |
| 7 | 0 emoji in source or output | `grep -rEn '[Emoji BMP]` over `*.js/*.css/*.html` returns 0 project matches (the only emoji string match is an SVG `data-URI` inside `node_modules/playwright-core/lib/vite/htmlReport/report.js`, not in shipped code). | repo-wide grep |
| 8 | Voice: museum-quiet | Three shipped registers: (a) Editorial Grid - print-grade long-form; (b) E-Ink / Paper - matte, distraction-free reading; (c) Dimensional Layering - 1-px-precision depth ladder. All three honor the lens accent state machine and the 6/10/12 px precision radii. | `00_SESSION_OVERVIEW.md`, `tokens.css` |

**Budget carry-forward.** Net-additive cost across the 3 candidates is the
constraint they share with every prior novelty ship: total motion delta,
total CSS delta, total JS delta, total KB delta. Every byte of new visual
register either comes out of existing surfaces or pushes us further over the
already-broken 230 KB ceiling.

**Pre-existing opt-in surface pattern** (`scripts/components/shell.js:4-19`):
the repo already implements a `data-surface="paper"` attribute gate with a
`koosha-phenotype:surface` localStorage key, a `?surface=paper` URL
override, and a button renderer injected into the shell. Any future opt-in
register (data-style="brutalist", data-grid="bento") should follow this
exact pattern; it is the binding template.

## 2. Candidate Cards

================================================================================
## CANDIDATE 4: BENTO BOX GRID
================================================================================

**One-line summary.** Asymmetric mixed-tile specimen grid carrying the 6
family accents as per-tile fills; cost = 2 CSS tokens, 1 utility class, 0
new assets, 0 new scripts.

**Voice match: STRETCH on the home page; FIT on a single tactical surface.**

The museum-quiet voice tolerates precision radii, low-saturation accents,
mono labels, opt-in surfaces, and 1-px depth. Bento Box is structurally
about asymmetric mixed-size tiles - that is the design value - but it is
also culturally the saturated 2025-2026 move (Apple, Linear, Vercel, Stripe
all use it; see `NOVELTY_CANDIDATES.md:71-75`). On the portfolio home the
candidate would place all 6 family accents on the same grid in the same
view, which is a behavior the lens accent state machine was specifically
designed to *prevent*: each lens (engineering/product) collapses the 6 into
1 primary accent at a time. Running Bento against the lens state machine
would either (a) ignore the lens collapse and show all 6 - visually loud,
or (b) honor the lens collapse and show 1 - then it is no longer "the 6
family accents as a specimen wall" and the move is demoted to a marketing
grid. Both outcomes are off-voice for the registry the prior 3 ships set
up. The hypothesis that makes the candidate voice-fit is a more restricted
target: an opt-in catalog surface where the 6 accents shown together *is*
the point (e.g. a future project-catalog refresh), running on the precision
6/10/12 px radii it would visually distinct against the 16-24 px Bento norm,
trading the move's usual plushness for the precision register the portfolio
already speaks. That hypothesis is real but it is conditional on (i) a
catalog refresh ticket that does not exist yet, and (ii) a 2026-2027 design
conversation where Bento is no longer the saturated 2025-2026 move. Today
neither precondition holds.

**Cost summary.**

| Item | Quantity | Notes |
|---|---|---|
| CSS lines | ~20-30 | `--grid-bento` template + per-tile-fill variants + responsive collapse |
| Tokens | 2 | `--grid-bento` (`grid-template-areas`), `--grid-tile-gap` (`var(--space-2)`) |
| Scripts | 0 | pure CSS grid |
| Assets | 0 | no SVG, no image, no font |
| New colors | 0 | family accents already live, reused via `--family-*-active` chain |
| Net bundle delta | ~+0.6 KB raw / ~+0.2 KB gzipped | trivially within 230 KB ceiling minus the 3.4 KB we're already over |

**Risk register (5).**

1. **Voice/saturation decay.** Bento is the most-saturated move in the
   2025-2026 design conversation. Empirical observation in the same
   conversation: ship quarterly, retire annually. Net: any ship today ages
   visibly by `2026-Q4` regardless of how well it is integrated. Mitigation:
   restrict to a single tactical surface (never the home) and accept a
   12-month useful life.
2. **Lens state-machine conflict.** The lens-scoped `--accent` collapse
   (engineering -> arch-500, product -> olive-500) is the binding voice
   rule. Per-tile family accents break the collapse unless we choose to
   always-show-all-6. Mitigation: scope the grid to a `data-lens="archive"`
   or context where the lens collapse is intentionally suspended; do not
   put it on the lens-driven surfaces.
3. **Mobile coherence.** Asymmetric mixed-size grids collapse poorly below
   ~720 px. The portfolio's mobile experience is single-column cards.
   Mitigation: include an explicit `grid-template-areas: none;` break at
   the existing `responsive.css` `max-width: 720px` break, defaulting to a
   single column. Document this as a hard requirement.
4. **Precision radii mismatch.** The portfolio lives at 6/10/12 px radii.
   Every published Bento uses 16-24 px radii. A Bento at 6/10/12 px is
   visually distinct (which is a positive) but visually loud (which is a
   negative); the eye reads the inconsistency before it reads the grid.
   Mitigation: ship at the existing precision radii; do not import the
   plush Bento corner.
5. **Co-existence with Editorial Grid.** Editorial Grid (shipped) is a
   two-column long-form layout with column rules. Bento Box is asymmetric
   mixed tiles. Both are "grid" moves with different aesthetic logics.
   Co-existence is possible if Bento is restricted to `/work` (catalog)
   and Editorial is the case-study layout; that is already the planned
   split. Mitigation: document the surface split so a downstream agent
   does not apply Bento inside a `.case-study` block.

**Verdict: HOLD (wait-and-revisit)**

**Decision criteria to revisit.**

- Revisit on either (a) a project-catalog refresh ticket that explicitly
  nominates a grid surface and asks for `NOVELTY_CANDIDATES.md:71-76`
  to be re-evaluated against the refresh scope, or (b) the next novelty
  review (6 months from now, ~2026-04-12) if Bento is no longer a
  salient move in the design conversation. Either unblocks the
  conditional SHIP path described above; neither currently holds.

================================================================================
## CANDIDATE 5: EXAGGERATED MINIMALISM
================================================================================

**One-line summary.** A single oversized display moment per page using
`--type-statement: clamp(4rem, 12vw, 11rem)` + `--tracking-tight: -0.04em`;
cost = 2 tokens, 1 utility class, 1 single-use site, 0 new assets.

**Voice match: STRONG (one-shot, on the portfolio home only).**

The museum-quiet voice tolerates precision. It tolerates restraint. It
tolerates a single large move because the surrounding content - the case
studies, the evidence ledger, the long-form prose - does the talking. The
Pentagram poster convention this move inherits is precisely that: the
biggest thing on the page is the title, then the rest shuts up. At 1280 px
viewport, `clamp(4rem, 12vw, 11rem)` resolves to 153.6 px (12vw) which
caps below the 11 rem (176 px) ceiling, falling in the 4-11 rem range as
designed. That is 2.8x the existing `--step-4: 3.9 rem = ~62 px` ceiling,
well above the body's reading register, well below a marketing headline
that's trying to shout. The proposed use (portfolio home hero *only*) is
exactly where a one-shot museum-quiet display register is on-voice. The
risk is use-rate: if the move is applied to the project title on every
case study, or to the status banner on `/work`, it stops being one-shot
and starts being a typographic gimmick across the surface, which would
break the voice. The candidate is voice-fit *conditional on the one-shot
discipline holding*. The constitution and the live code provide the
mechanism to enforce one-shot: a single `.statement` utility class with
no second surface using it, plus a `tests/statement-discipline.test.js`
assertion that scans the rendered HTML and fails on `count > 1`.

**Cost summary.**

| Item | Quantity | Notes |
|---|---|---|
| CSS lines | ~6-10 | 2 token defs + 1 utility class + scope comment |
| Tokens | 2 | `--type-statement`, `--tracking-tight` |
| Scripts | 0 | pure CSS, no JS surface |
| Assets | 0 | no SVG, no image, no font |
| New colors | 0 | inherits `--ink` / `--surface` automatically |
| Net bundle delta | ~+0.15 KB raw / ~+0.05 KB gzipped | trivially within budget |
| New tests | 1 | `tests/statement-discipline.test.js` - parses each route's HTML and asserts `count(`.statement`) === 1` |

**Risk register (5).**

1. **One-shot discipline decay.** The strongest voice risk: a downstream
   agent or a future PR author reaches for `.statement` on a case-study
   title or a `/work` status banner because the visual impact is
   impressive in isolation. Mitigation: ship the discipline test in the
   same PR as the utility class; the test gates the merge. Add a CSS
   scope comment: "single-use on portfolio home only - do not apply to
   .case-study or .work-catalog surfaces".
2. **`-0.04em` letter-spacing on Space Grotesk.** Space Grotesk already
   reads as a tight display face; the tracking token is conservative, but
   -0.04em is the threshold where optical tuning matters. Mitigation:
   diff the rendered `.statement` at 1280 px in light + dark before
   ship; if the kerning reads as too-tight (tracked letters clipping the
   spacing rhythm), drop to -0.025em in the same PR.
3. **Type scale breakage.** The step ladder tops at `--step-4: 3.9 rem`.
   `--type-statement: 11 rem` *outside* the ladder is a new typographic
   register. That is the desired outcome (a single one-shot display
   register, separate from the reading register) but it is brittle if a
   downstream agent reaches for `--type-statement` on a body title.
   Mitigation: name it `--type-statement` (not `--step-5`) and add a
   comment naming the intent ("display statement, used at most once per
   page").
4. **Mobile behavior at viewport floor.** At 320 px viewport, the clamp
   floor resolves to 4 rem (64 px). That is fine for a portfolio home
   hero. At 768 px landscape, the vw resolves to 92 px which sits in the
   middle of the clamp range - also fine. No mobile risk identified.
5. **Co-existence with Dimensional Layering.** A 176 px hero title with
   elev-1 (1 px shadow hairline) is visually plausible. With elev-3 (4
   px / 12 px shadow) the title fights the elevation ladder because the
   eye now sees three possible planes on the same element. Mitigation:
   the home hero is currently at `--shadow-card: 0 1px 0
   var(--precision-rule)`; do not promote it to elev-2 or elev-3.

**Verdict: SHIP**

**1-week plan (5 steps, ~10m each).**

1. **`add tokens (10m).`** Add `--type-statement: clamp(4rem, 12vw, 11rem)`
   and `--tracking-tight: -0.04em` to `tokens.css` immediately after
   `--step-4`. Add a scope comment naming the intent.
2. **`add utility class (10m).`** Add `.statement { font: var(--font-display);
   font-size: var(--type-statement); letter-spacing: var(--tracking-tight);
   line-height: 0.95; }` plus the one-shot scope comment to `main.css`.
3. **`add home hero application (10m).`** Apply `.statement` to the single
   largest title on `index.html` (typically the lead `<h1>` block of the
   home hero). Leave the existing title elements as fallbacks for
   prefers-reduced-motion and resize-collapse paths.
4. **`add discipline test (10m).`** Add `tests/statement-discipline.test.js`
   that parses every shipped HTML route (root, /work, /work/[slug],
   /resume, /contact, /blog, /blog/[slug]) and asserts
   `count(`.statement`) <= 1` per route. Enforces the one-shot invariant
   across future PRs.
5. **`commit + push + PR (10m).`** Per the standard `git-commit` ledger
   wrapper; `tx-agent: jcode`, `tx-validated: lint,test`. Single PR,
   squash-merge to `main`. Direct-push if `gh` deferral is still gated
   (the same harness gap documented in `00_SESSION_OVERVIEW.md:130-184`).

================================================================================
## CANDIDATE 6: NEUBRUTALISM (controlled)
================================================================================

**One-line summary.** A 2 px solid ink border + 4 px solid ink offset shadow
on opt-in `[data-style="brutalist"]` cards; cost = 2 tokens, 1 attr gate,
1 toggle in shell.js.

**Voice match: FIT in principle, HOLD in execution.**

The Brutalism 2024-2025 revival (Gumroad, Are.na weekly, etc.) is the
most-loud move on the parking lot, but *controlled* Brutalism - restricted
to a single decorative card with a hard border and a hard offset shadow -
is what has earned a place in serious museum-quiet contexts: a display card
for evidence on a colophon page, a decision record on a design-system page,
a reading-specimen on a typography page. The voice cost is in the *voice
of the surrounding surface*; a 2 px ink border + 4 px solid ink offset on a
single specimen card inside an otherwise quiet page reads as deliberate
discipline, not as system noise. The portfolio's existing depth system
is `--shadow-card: 0 1px 0 var(--precision-rule)` - a hairline - so a
4 px solid offset is a 4-8x stroke change. That's the Brutalist visual
register: a louder stroke against a quieter system. It works as long as
it does not leak.

It does leak if the surface the candidate is supposed to live on does not
exist. **Critical finding.** The candidate's parking-lot description
specifies "only the `/colophon` page" as the scoped surface. The deployed
repo has no `colophon.html` route (verified: `ls *.html` on 2026-10-12
returns archive, blog, contact, engineering, index, product, resume, work
- no colophon). The opt-in `[data-style="brutalist"]` attribute has no
destination on the current site structure. This is a *scope blocker*,
not a voice blocker: the candidate can be voice-fit and still be parked
because the surface it lives on does not yet exist. Two paths to
unblock: (a) build a `/colophon` page first (out of scope for the
novelty review; it is a separate surface-design ticket with its own
scope), or (b) re-target the candidate at an existing surface (the
question becomes whether brutalism belongs on `/work/[slug]` evidence
spines, on `/resume` timeline cards, or on a future `/colophon`).

**Cost summary.**

| Item | Quantity | Notes |
|---|---|---|
| CSS lines | ~12-18 | 2 token defs + 1 attr-gate block + focus-ring override + scope comment |
| Tokens | 2 | `--outline-specimen` (`2px solid var(--ink)`), `--offset-specimen` (`4px 4px 0 0 var(--ink)`) |
| Scripts | ~10-15 lines in `shell.js` | parallel to the existing paper-surface toggle (lines 4-19); localStorage key, URL param override, button render |
| Assets | 0 | no SVG, no image, no font |
| New colors | 0 | uses `--ink` (and `--surface` in dark mode); no new accent |
| Net bundle delta | ~+0.5 KB raw / ~+0.2 KB gzipped | trivially within budget |
| New surface ticket | 1 | a `/colophon` page build (or a different home surface ticket) - out of scope for this review |

**Risk register (5).**

1. **Scope blocker: no `/colophon` route.** `colophon.html` does not exist
   in the deployed repo. The opt-in gate has no destination. Mitigation:
   explicitly defer ship until either (a) a `/colophon` build ticket is
   queued with rough scope, or (b) a different home surface is nominated
   and the gate is re-targeted.
2. **Gate discipline.** Even with the gate, every page that links a
   "specimen card" surface (timeline, radar, project spine) is named in
   the parking-lot text as a candidate home. None of those surfaces
   exist as standalone routes in the current deploy; linking to them
   would create dead-page nav. Mitigation: scope the gate to the
   surfaces that actually exist when the home surface is nominated.
3. **Precision-radii mismatch.** Cards on `--radius-control: 6px`,
   `--radius-panel: 10px`, `--radius-studio: 12px` define the portfolio's
   corner register. A specimen card on Brutalist 2 px solid borders with
   4 px solid offsets wants `border-radius: 0` for the corner to read as
   hard. Buttons inside the card (8 px corners) will visually collide
   with the 0-px specimen card. Mitigation: at implementation, decide
   between (i) keeping card radius at 6 px (lets the ink border look
   less intent-driven) or (ii) forcing 0 px on the specimen card and
   accepting the corner collision. Document the choice in the PR.
4. **Co-existence with Dimensional Layering.** `--shadow-card: 0 1px 0
   var(--precision-rule)` is a 1 px hairline shadow; elev-1 / elev-2 /
   elev-3 are also 1-12 px precision shadows. A specimen card with a 4
   px solid offset shadow is a *third depth system* on the same page,
   with different visual logic (offset + solid). If a specimen card ever
   appears inside an elev-1 or elev-2 surface - and it would on the
   portfolio, where most surfaces carry one of the three elevation
   tokens - the two depth systems fight. Mitigation: scope `[data-style="brutalist"]`
   to pages that opt out of the elevation system explicitly, or scope
   it to children of `.no-elev`.
5. **A11y on the focus ring.** The brutalist border + offset shadow will
   visually surround whatever is inside. WCAG 1.4.11 requires 3:1
   non-text contrast for UI components; the focus ring is already
   `--arch-500` on light / `--arch-300` on dark (verified in
   `tokens.css:105, 297`), and 2 px ink border on top of the ring
   reduces readability by overlapping the ring's outer 6 px stroke.
   Mitigation: at implementation, the brutalist style overrides
   `--focus-ring` to `0 0 0 3px var(--surface), 0 0 0 6px var(--arch-300)`
   in dark mode and the light variant in light mode (same shape as the
   current dark override on line 297); the existing contrast test will
   catch any regression.

**Verdict: HOLD (scope-blocker, not voice-blocker)**

**Decision criteria to revisit.**

- Revisit when either (a) a `/colophon` (or equivalent evidence-spine)
  page ticket is queued with at least rough scope, or (b) an existing
  surface is nominated as the brutalist home - and the nomination
  passes its own voice review. The voice itself is fit; the parking
  lot's blocker is the missing surface ticket, not the candidate.

## 3. Summary table (3 rows)

```
+========================+================+==========+====================================================+
| Candidate              | Voice          | Verdict  | Next checkpoint                                    |
+========================+================+==========+====================================================+
| 4. Bento Box Grid      | STRETCH / FIT* | HOLD     | Project-catalog refresh ticket OR 2026-04 review   |
|                        | (surface-      | (cond.)  | once Bento is no longer the 2025-26 move          |
|                        | conditional)   |          |                                                    |
+------------------------+----------------+----------+----------------------------------------------------+
| 5. Exaggerated         | STRONG         | SHIP     | 5-step plan above; ship this week (2026-10-19 EOD)  |
|    Minimalism          | (one-shot,     |          | one-shot discipline test enforces use-rate         |
|                        | home only)     |          |                                                    |
+------------------------+----------------+----------+----------------------------------------------------+
| 6. Neubrutalism        | FIT            | HOLD     | `/colophon` build ticket OR re-target an existing  |
|    (controlled)        | (in principle, | (scope-  | surface (each gets its own voice review)           |
|                        | scope-blocks)  | blocked) |                                                    |
+========================+================+==========+====================================================+
```

## 4. Final notes (non-binding observations)

- **Net bundle drift.** The shipped `dist/bundled/app.bundle.b913e0fe.js` is
  238,974 B (233.4 KB) - 3.4 KB above the 230 KB ceiling referenced in
  `NOVELTY_CANDIDATES.md`. All three candidates here are net-additive by
  < 1 KB, so the ceiling breaches are not from these candidates; they are
  organic drift on `main` since `5168b23`. A separate "bundle ceiling
  restoration" ticket may want to drop unused code (the candidate list
  for deletion includes investigating whether `dash-mode.js`,
  `magnetic-helpers.js`, and `cursor-helpers.js` are still loaded) before
  any future net-additive novelty ships.
- **The opt-in surface pattern is reusable, not vendor-locked.** The
  paper-surface toggle in `shell.js:4-19` is the binding template for
  any future opt-in visual register. Brutalism would extend that
  template; Bento Box could too if a `[data-grid="bento"]` attribute
  gate replaces the per-page CSS. Either future work should consume
  this template rather than invent a new one.
- **Voice stability.** Three ships in one day tested the museum-quiet
  voice; the integration of E-Ink / Paper over Editorial Grid over
  Dimensional Layering (utility -> layout -> surface, per
  `00_SESSION_OVERVIEW.md:142-156`) shows that the voice holds under
  layered novelty when each novelty honors (a) the existing precision
  radii, (b) the lens accent state machine, (c) the motion ceiling, and
  (d) the existing font/asset budget. The 3 candidates here were
  evaluated against the same four constraints.

## 5. Parking lot deprecation log

(No retires this round. HOLDs are NOT deprecations: the parking lot
holds them for revisit; only RETIRE entries get logged here.)

| Date       | Candidate             | Reason (one line)                                            |
|------------|-----------------------|--------------------------------------------------------------|
| (no retires — see verdicts above)                                                |
