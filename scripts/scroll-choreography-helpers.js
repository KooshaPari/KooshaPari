/**
 * scroll-choreography-helpers.js — Pure helpers for scroll choreography.
 *
 * No DOM access. Caller passes in already-computed values when needed.
 */

/**
 * Timing constants.
 */
export const STAGGER_BASE_MS = 120;
export const BEAT_DURATION_MS = 800;
export const HERO_ANIMATION_CLEANUP_MS = 1000; // BEAT_DURATION + 200
export const PARALLAX_DEPTH_PX = -15;
export const SCALE_NEAR_FULL = 0.98;

/**
 * Threshold values for the IntersectionObservers.
 */
export const SEQUENCE_OBSERVER_THRESHOLD = 0.1;
export const SEQUENCE_OBSERVER_ROOT_MARGIN = '0px 0px -60px 0px';
export const HERO_OBSERVER_THRESHOLD = 0.2;

/**
 * CSS strings for the hero clip-path reveal.
 */
export const HERO_CLIP_INSET = 'inset(8% 8% 8% 8% round 12px)';
export const HERO_CLIP_EXPANDED = 'inset(0% 0% 0% 0% round 0px)';
export const HERO_CLIP_TRANSITION =
  'clip-path 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)';

/**
 * CSS transform string for the initial hidden state of a card.
 */
export const HIDDEN_TRANSFORM = 'translateY(32px) scale(0.97)';
export const HIDDEN_OPACITY = '0';

/**
 * CSS class names used by the orchestrator.
 */
export const CLASS_REVEAL_HIDDEN = 'reveal-hidden';
export const CLASS_REVEAL_VISIBLE = 'reveal-visible';
export const SELECTOR_ARTIFACT = '.artifact';
export const SELECTOR_HERO_MEDIA = '.artifact-media';
export const SELECTOR_ARTIFACT_SEQUENCE = '.home-artifact-sequence';
export const SELECTOR_HERO_PLATE = '.home-opening-artifact';

/**
 * Compute the staggered delay for a card at the given index.
 *
 * @param {number} index zero-based card position
 * @returns {number} delay in milliseconds
 */
export function revealDelayFor(index) {
  return index * STAGGER_BASE_MS;
}

/**
 * Compute the vertical parallax offset for an artifact.
 *
 * `rect` is the artifact's bounding rect (must contain top + height);
 * `viewportHeight` is `window.innerHeight`. The function returns a pixel
 * offset (negative = moves up with scroll). Distance is normalized to
 * `[-0.5, 0.5]` for a typical viewport so the multiplier produces the
 * final pixel translation.
 *
 * @param {{top: number, height: number}} rect
 * @param {number} viewportHeight
 * @returns {number}
 */
export function parallaxOffsetFor(rect, viewportHeight) {
  const offset = normalizedDistance(rect, viewportHeight) * PARALLAX_DEPTH_PX;
  // Normalize -0 to 0 for test/assert stability.
  return offset === 0 ? 0 : offset;
}

/**
 * Compute the scale factor for an artifact given its normalized distance
 * from the viewport center.
 *
 * Cards centered in the viewport (distance = 0) get a scale of 1. Cards
 * further away get a smaller scale, clamped to {@link SCALE_NEAR_FULL} so
 * artifacts don't visually shrink too much.
 *
 * @param {number} distance normalized distance (returned by `parallaxOffsetFor`'s
 *                   formula before the multiplier)
 * @returns {number} scale factor in (0, 1]
 */
export function parallaxScaleFor(distance) {
  const scale = 1 + Math.abs(distance) * -0.01;
  return Math.max(SCALE_NEAR_FULL, scale);
}

/**
 * Compute the normalized distance (artifact center vs viewport center)
 * for an artifact, expressed in `[-1, 1]` viewport-heights.
 *
 * @param {{top: number, height: number}} rect
 * @param {number} viewportHeight
 * @returns {number}
 */
export function normalizedDistance(rect, viewportHeight) {
  const artifactCenter = rect.top + rect.height / 2;
  const viewportCenter = viewportHeight / 2;
  return (artifactCenter - viewportCenter) / viewportHeight;
}

/**
 * Build the inline style strings needed to apply parallax to one artifact.
 *
 * @param {{top: number, height: number}} rect
 * @param {number} viewportHeight
 * @returns {{ parallaxY: string, parallaxScale: string }}
 */
export function parallaxVarsFor(rect, viewportHeight) {
  const distance = normalizedDistance(rect, viewportHeight);
  return {
    parallaxY: `${parallaxOffsetFor(rect, viewportHeight)}px`,
    parallaxScale: String(parallaxScaleFor(distance)),
  };
}
