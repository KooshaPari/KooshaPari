/**
 * Pure helpers for the image comparison slider — no DOM, no pointer events.
 * Tested in isolation so the slider's keyboard contract and easing curve can
 * be validated without spinning up a real element.
 */

/** Clamp a value to the [min, max] range. */
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Keyboard handler return-value contract for `nextSliderPct(pct, event, opts)`.
 * `null` means the event was not handled; any other value is the new pct.
 *
 * @typedef {{ key: string, shiftKey?: boolean }} SliderKeyEvent
 * @typedef {{ step?: number, bigStep?: number }} SliderKeyOptions
 */

/**
 * Compute the slider pct for a keydown event. Returns null when the event
 * is not a recognised slider key, so the caller can pass-through other keys.
 *
 * Mirrors the APG slider pattern: ArrowRight/ArrowDown move forward,
 * ArrowLeft/ArrowUp move backward, Home/End jump to the endpoints, Shift
 * modifies the step size (the big-step is used for shift-modified moves).
 *
 * @param {number} pct - current pct in [0, 100]
 * @param {SliderKeyEvent} event
 * @param {SliderKeyOptions} [opts]
 * @returns {number | null}
 */
export function nextSliderPct(pct, event, opts = {}) {
  const step = opts.step ?? 2;
  const bigStep = opts.bigStep ?? 10;
  const move = event.shiftKey ? bigStep : step;

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') return clamp(pct + move, 0, 100);
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')    return clamp(pct - move, 0, 100);
  if (event.key === 'Home') return 0;
  if (event.key === 'End')  return 100;
  return null;
}

/**
 * Ease-out cubic curve. Maps t in [0, 1] to the eased position.
 *
 * @param {number} t - linear progress in [0, 1]
 * @returns {number}
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Linear interpolation between two values.
 *
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Compute the slider pct at a given elapsed time within an animation, using
 * the ease-out cubic curve. Used by the smoothSlideTo() rAF loop.
 *
 * Returns the target immediately when duration is 0 — this matches the
 * smoothSlideTo fast-path where reduced-motion callers want the final value
 * without any animation curve.
 *
 * @param {number} from - starting pct
 * @param {number} to - target pct
 * @param {number} elapsedMs
 * @param {number} durationMs
 * @returns {number}
 */
export function slideValue(from, to, elapsedMs, durationMs) {
  if (durationMs <= 0) return to;
  const t = clamp(elapsedMs / durationMs, 0, 1);
  return lerp(from, to, easeOutCubic(t));
}
