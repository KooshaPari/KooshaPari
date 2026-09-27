# Collision Severity Audit (e7b69ad, cac9d97)

Evidence gathered by recovering the exact pre-fix bundle
(`bundled/app.bundle.7b217faa.js` at `e7b69ad^`) and reading the minified
bindings, plus running the hardened guard against a `git archive` extraction
of the pre-fix tree.

The guard reports 14 colliding top-level names in the pre-fix source. All 14
are genuine column-0 declarations; none is a false positive. Severity is not
uniform, and the original fix commit message overstated two of them.

## Confirmed runtime defects (byte-level proof in the shipped bundle)

| Name | Modules | Proof |
|---|---|---|
| `SELECTOR` | `scroll-reveal-helpers.js`, `counter-animate.js` | Bundle binds `ae` to `"[data-reveal]"` at offset 167585, then reassigns the same binding to `"[data-count-to]"` at 195007. Reveal scanned the wrong attribute, so the whole system was inert. **This was the reported bug.** |
| `clamp` | `magnetic-helpers.js`, `perspective-tilt-helpers.js`, `media/image-slider-helpers.js` | Bundle defines `G(e,t,a){return Math.max(t,Math.min(a,e))}` (3-arg). `magnetic.js` calls `clamp(dx, MAX_X)` with 2 args, which minifies to `G(c,oa)`. `a` is `undefined`, so `Math.min(undefined, e)` is `NaN`. Confirmed by execution: `G(37,24) === NaN`, vs `G(37,-24,24) === 24`. Magnetic pointer tracking produced NaN transforms. |
| `DEFAULT_SPEED` | `parallax-helpers.js` (`0`), `perspective-tilt-helpers.js` (`400`) | Bundle declares `Me=0` at 184925 and reassigns `Me=400` at 195743. Both consumers read `Me`: parallax at 185012 (`speed: Number.isFinite(a)?a:Me`) and perspective-tilt at 196330 (`speed: Me`). Parallax therefore defaulted to 400ms instead of its intended 0. **Not previously reported; found by this audit.** |

## Structurally dangerous, no behavioral proof

- `tick` (`magnetic.js`, `views/not-found.js`) and `_observer`
  (`scroll-reveal.js`, `counter-animate.js`) are both real column-0
  collisions, but both were verified to be called and read within a single
  module's own body in the shipped bundle. They were a latent hazard, not a
  proven runtime break. The original commit message claimed they were "live
  bugs"; that claim is not supported.

## Benign at this revision (identical values)

`ID_ANNOUNCEMENTS` (`'announcements'`), `ATTR_DATA_SRC` (`'data-src'`),
`KEY_ARROW_LEFT` (`'ArrowLeft'`), `KEY_ARROW_RIGHT` (`'ArrowRight'`),
`TEAL` (`'#7EBAB5'`), `REDUCED_MOTION` (identical
`matchMedia(...)` call), `svgElement`. These are landmines that break on the
next unilateral edit, which is why the guard rejects them, but they produced
no wrong behavior as shipped.

`CLASS_IMG` (`'image-reveal-img'` vs `'lightbox-img'`) and
`prefersReducedMotion` differ between modules and are therefore genuine
semantic collisions; they were not separately proven to break a user-visible
path in the shipped bundle.

## Correction to e7b69ad

The original message said `_observer` and `tick` "were live bugs beyond the
reveal system." Retracting that. It also said "12 other colliding top-level
names"; the accurate count is 14, and the added severity distinction is
recorded above. Git history is immutable, so this document is the fix-forward
record rather than an amend.
