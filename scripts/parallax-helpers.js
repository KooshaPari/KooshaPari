/**
 * Pure helpers for the parallax depth-layer system.
 *
 * The orchestrator (parallax.js) is DOM-bound; this file is what the
 * orchestrator imports and what the unit tests exercise.
 *
 *   - VIEWPORT_MARGIN: pixels beyond the viewport still considered "in view"
 *     for parallax calculations (prevents pop-in at the edges)
 *   - clampValue(value, max): restrict value to [-max, max]
 *   - isInViewport(rect, viewportHeight, margin): true when the rect
 *     overlaps [ -margin , viewportHeight + margin ]
 *   - calculateTranslateY(scrollY, speed, offset, clamp): the parallax Y
 *     displacement for an element with the given metadata
 *   - transformFor(translateY): the CSS translateY string, or null when
 *     no work is needed (translateY is null/undefined)
 *   - DEFAULT_CLAMP_FALLBACK: when no data-parallax-clamp attribute is set,
 *     the orchestrator uses window.innerHeight — represented here as null
 *     so the orchestrator can substitute the live value
 *   - DEFAULT_SPEED / DEFAULT_OFFSET: parseFloat('') || 0 results
 *   - REDUCED_TRANSFORM: 'none' — the value used to disable parallax
 */

export const VIEWPORT_MARGIN = 200;

export function clampValue(value, max) {
  return Math.max(-max, Math.min(max, value));
}

export function isInViewport(rect, viewportHeight, margin = VIEWPORT_MARGIN) {
  return rect.bottom >= -margin && rect.top <= viewportHeight + margin;
}

export function calculateTranslateY(scrollY, speed, offset, clamp) {
  return clampValue((scrollY * speed) + offset, clamp);
}

export function transformFor(translateY) {
  if (translateY == null) return null;
  return `translateY(${translateY}px)`;
}

export const REDUCED_TRANSFORM = 'none';
export const DEFAULT_SPEED = 0;
export const DEFAULT_OFFSET = 0;
export const DEFAULT_CLAMP_FALLBACK = null;

/**
 * Parse the data-parallax-* attributes on an element. Returns the metadata
 * object the orchestrator caches per element. Pure given the attribute map.
 *
 * @param {{ speed: string|number|null, offset?: string|number|null, clamp?: string|number|null }} attrs
 * @param {number} viewportHeight - fallback clamp when no attribute is set
 */
export function parseParallaxAttrs(attrs, viewportHeight) {
  const speed = attrs.speed != null && attrs.speed !== '' ? Number(attrs.speed) : DEFAULT_SPEED;
  const offset = attrs.offset != null && attrs.offset !== '' ? Number(attrs.offset) : DEFAULT_OFFSET;
  const rawClamp = attrs.clamp != null && attrs.clamp !== '' ? Number(attrs.clamp) : DEFAULT_CLAMP_FALLBACK;
  return {
    speed: Number.isFinite(speed) ? speed : DEFAULT_SPEED,
    offset: Number.isFinite(offset) ? offset : DEFAULT_OFFSET,
    clamp: Number.isFinite(rawClamp) ? rawClamp : viewportHeight,
  };
}
