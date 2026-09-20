/**
 * Pure helpers for the IntersectionObserver-driven scroll-reveal system.
 *
 * The orchestrator (scroll-reveal.js) is DOM-bound and manages the
 * IntersectionObserver and MutationObserver lifecycle; this file owns:
 *
 *   - SELECTOR: '[data-reveal]'
 *   - DEFAULT_DISTANCE: default slide distance in px (24)
 *   - VALID_REVEALS: the documented variants (left/right/up/down/fade/scale/rotate)
 *   - DEFAULT_OPTIONS: the IntersectionObserver options
 *   - parseRevealDistance(dataset): parse + clamp the slide distance
 *   - parseRevealDelay(dataset): parse + clamp the stagger delay (ms)
 *   - distanceCssVar(distance): the CSS custom-property value string,
 *     or null when no override is needed
 *   - delayStyle(delay): the inline transitionDelay style value (with 'ms'),
 *     or null when no override is needed
 *   - hasRevealAttribute(dataset): the dataset has a reveal variant set
 *   - safeInteger(raw): NaN/negative-safe integer coercion
 *
 * All helpers are pure given their inputs.
 */

export const SELECTOR = '[data-reveal]';
export const DEFAULT_DISTANCE = 24;

export const VALID_REVEALS = new Set([
  'left',
  'right',
  'up',
  'down',
  'fade',
  'scale',
  'rotate',
]);

export const DEFAULT_OPTIONS = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px',
};

const REVEAL_DISTANCE_VAR = '--reveal-distance';

/**
 * Parse data-reveal-distance. NaN and <=0 values fall back to DEFAULT_DISTANCE.
 *
 * @param {{ revealDistance?: string }} dataset
 */
export function parseRevealDistance(dataset) {
  const raw = parseInt(dataset?.revealDistance, 10);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_DISTANCE;
  return raw;
}

/**
 * Parse data-reveal-delay. NaN and <=0 values return null (no override).
 *
 * @param {{ revealDelay?: string }} dataset
 */
export function parseRevealDelay(dataset) {
  const raw = parseInt(dataset?.revealDelay, 10);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  return raw;
}

/**
 * The CSS custom-property value string for the slide distance,
 * or null when no override is needed.
 *
 * @param {number} distance
 */
export function distanceCssVar(distance) {
  if (!Number.isFinite(distance) || distance === DEFAULT_DISTANCE) return null;
  return `${distance}px`;
}

/**
 * Re-export the variable name for tests / debug tooling.
 */
export const REVEAL_DISTANCE_CSS_VAR = REVEAL_DISTANCE_VAR;

/**
 * The inline transitionDelay style value (with 'ms' suffix),
 * or null when no override is needed.
 *
 * @param {number|null|undefined} delay
 */
export function delayStyle(delay) {
  if (!Number.isFinite(delay) || delay <= 0) return null;
  return `${delay}ms`;
}

/**
 * Determine whether an element with the given dataset should be marked as
 * needing the initial hidden state. Returns true for pristine elements that
 * have not yet been observed.
 *
 * @param {DOMStringMap} dataset
 */
export function hasRevealAttribute(dataset) {
  return !!(dataset && dataset.reveal != null);
}

/**
 * Coerce a parseFloat result. NaN -> 0. Negative -> 0. Returns 0 when the
 * input is null/undefined.
 *
 * @param {any} raw
 */
export function safeInteger(raw) {
  const v = typeof raw === 'string' ? parseInt(raw, 10) : raw;
  if (!Number.isFinite(v) || v < 0) return 0;
  return v;
}
