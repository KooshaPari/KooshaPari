/**
 * transitions-helpers.js — Pure helpers for the page-transition engine.
 *
 * No DOM access. The orchestrator module wires these into real handlers.
 */

/** Animation durations (ms). */
export const DURATION_OUT_MS = 180;
export const DURATION_IN_MS = 250;
export const DEBOUNCE_MS = 100;
/** Safety-net buffer added to durations for the `setTimeout` fallback. */
export const SAFETY_NET_BUFFER_MS = 30;

/** CSS class names used by the orchestrator. */
export const CLASS_PREPARING = 'view-transition-preparing';
export const CLASS_OUT = 'view-transition-out';
export const CLASS_IN = 'view-transition-in';
export const CLASS_VISIBLE = 'is-visible';

/** Selector for the default view-root element. */
export const SELECTOR_VIEW_ROOT = '#view-root';
/** ID of the default view-root element (no `#`). */
export const VIEW_ROOT_ID = 'view-root';

/**
 * Decide which transition strategy the engine should use.
 *
 * @param {{ prefersReducedMotion: boolean, viewTransitionsSupported: boolean }} state
 * @returns {'native' | 'manual'}
 */
export function transitionPlan(state) {
  if (state.prefersReducedMotion || !state.viewTransitionsSupported) {
    return 'manual';
  }
  return 'native';
}

/**
 * Compute the safety-net timeout (transition duration + buffer).
 *
 * @param {number} duration
 * @param {number} [buffer=SAFETY_NET_BUFFER_MS]
 * @returns {number}
 */
export function safetyNetMs(duration, buffer = SAFETY_NET_BUFFER_MS) {
  return duration + buffer;
}

/**
 * Decide whether a new navigation should replace the pending one while a
 * transition is in flight. Returns `true` when there is already a queued
 * route — the caller should update `_pendingRoute` rather than kicking
 * off a second transition.
 *
 * @param {boolean} transitionInFlight
 * @returns {boolean}
 */
export function shouldReplaceQueue(transitionInFlight) {
  return transitionInFlight;
}

/**
 * Total transition budget (out + in) in milliseconds.
 *
 * @returns {number}
 */
export function totalTransitionMs() {
  return DURATION_OUT_MS + DURATION_IN_MS;
}
