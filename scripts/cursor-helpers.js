/**
 * Pure helpers for the custom-precision cursor system.
 *
 * The orchestrator (cursor.js) is DOM-bound; this file owns:
 *
 *   - INTERACTIVE_SELECTOR / IMAGE_SELECTOR: CSS selectors used for
 *     hover-state detection
 *   - TRAIL_COUNT, LERP_SPEED, LERP_REDUCED, TRAIL_SPEED_THRESHOLD,
 *     RING_LERP_MULTIPLIER: tuning constants
 *   - lerp(a, b, t): linear interpolation
 *   - cursorStateFor(target): the state matching an Element, or
 *     'default' given null
 *   - trailOpacity(index, speed): the per-trail opacity for a given
 *     speed-above-threshold
 *   - cursorIsTextInput(el): true when el is a text-bearing input
 *   - cursorTransform(x, y): the css translate string for cursor layers
 *   - cursorFramePositions(state): pure helper for the per-frame tick —
 *     given the dot/ring/mouse state, returns the next frame's positions
 *
 * All helpers are pure given their inputs.
 */

export const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, .clickable, .interactive';

export const IMAGE_SELECTOR =
  '.artifact, figure, .project-card img';

export const TRAIL_COUNT = 3;
export const LERP_SPEED = 0.15;
export const LERP_REDUCED = 0.35;
export const RING_LERP_MULTIPLIER = 0.85;
export const TRAIL_SPEED_THRESHOLD = 8;

// Trail opacity ramp — three layered after-images the trail uses when
// the cursor is moving fast.
const TRAIL_OPACITIES = [0.18, 0.10, 0.05];
const TRAIL_SPEED_NORMALIZER = 40;

/** Linear interpolation: a + (b - a) * t. */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Two-frame Euler integration for the cursor's two-layered lerp chain:
 * dot follows mouse, ring trails dot by a sub-multiplier.
 *
 * Returns the updated positions; the input state is not mutated.
 *
 * @param {{ mouseX: number, mouseY: number, dotX: number, dotY: number, ringX: number, ringY: number, speed: number }} state
 * @param {number} lerpSpeed - the lerp speed factor (use LERP_SPEED or LERP_REDUCED)
 * @returns {{ dotX: number, dotY: number, ringX: number, ringY: number }}
 */
export function cursorFramePositions(state, lerpSpeed) {
  const { mouseX, mouseY, dotX, dotY, ringX, ringY } = state;
  const dotSpeed = lerpSpeed;
  const ringSpeed = lerpSpeed * RING_LERP_MULTIPLIER;
  return {
    dotX: lerp(dotX, mouseX, dotSpeed),
    dotY: lerp(dotY, mouseY, dotSpeed),
    ringX: lerp(ringX, dotX, ringSpeed),
    ringY: lerp(ringY, dotY, ringSpeed),
  };
}

/**
 * Given the target element under the pointer, return the cursor state
 * used by the dot/ring class manager. Pure given the target.
 *
 * @param {Element|null|undefined} target
 * @returns {'default' | 'hover' | 'text' | 'image'}
 */
export function cursorStateFor(target) {
  if (!target || !target.closest) return 'default';
  if (target.closest(IMAGE_SELECTOR)) return 'image';
  if (cursorIsTextInput(target)) return 'text';
  if (target.closest(INTERACTIVE_SELECTOR)) return 'hover';
  return 'default';
}

/**
 * True when the target element is a text-bearing input.
 *
 * @param {Element} el
 */
export function cursorIsTextInput(el) {
  if (!el || !el.matches) return false;
  if (el.matches('textarea')) return true;
  if (el.matches('[contenteditable="true"]')) return true;
  return el.matches(
    'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"])'
  );
}

/**
 * The opacity for trail-index i at the given speed. Returns 0 when the
 * cursor is moving slowly; a ramp above TRAIL_SPEED_THRESHOLD.
 *
 * @param {number} index - 0, 1, or 2
 * @param {number} speed - pixel delta from the previous frame
 */
export function trailOpacity(index, speed) {
  if (index < 0 || index >= TRAIL_OPACITIES.length) return 0;
  if (speed <= TRAIL_SPEED_THRESHOLD) return 0;
  const ratio = Math.min(speed / TRAIL_SPEED_NORMALIZER, 1);
  return TRAIL_OPACITIES[index] * ratio;
}

/**
 * Build the CSS transform string for a cursor layer at the given coords.
 */
export function cursorTransform(x, y) {
  return `translate(${x}px, ${y}px)`;
}

/**
 * Given the previous trails array, return the next trails array with one
 * entry shifted forward. Pure.
 *
 * @param {{x: number, y: number}[]} prevTrails
 * @param {{x: number, y: number}} head - the new head position
 */
export function advanceTrails(prevTrails, head) {
  const next = [head];
  for (let i = 1; i < prevTrails.length; i++) {
    next.push({ x: prevTrails[i - 1].x, y: prevTrails[i - 1].y });
  }
  return next;
}
