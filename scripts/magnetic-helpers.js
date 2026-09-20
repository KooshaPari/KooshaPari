/**
 * Pure helpers for the magnetic spring-physics system.
 *
 * The orchestrator (magnetic.js) is DOM-bound; this file is what the
 * orchestrator imports and what the unit tests exercise.
 *
 *   - STIFFNESS, DAMPING, MASS: damped harmonic oscillator coefficients
 *   - MAX_X, MAX_Y, REDUCED_SCALE: visual clamps / hover fallback
 *   - AUTO_SELECTORS: elements that get magnetic behavior without needing
 *     the .magnetic class
 *   - clamp(v, max): restrict value to [-max, max]
 *   - createState(): initial MagneticState
 *   - step(s, dt): integrate one frame of spring physics (F = k*(t-x) - c*v)
 *   - isAtRest(s): true when all four state values are below 0.01 — used
 *     by the orchestrator to skip writing `translate(0px, 0px)` to the DOM
 *   - transformString(s): the CSS transform value for the state, or null
 *     when the element is at rest (used by applyTransform)
 *   - chooseDt(now, lastTime, maxDelta): clamped frame delta in seconds —
 *     first call returns 0.016 (16ms default frame)
 *   - INITIAL_TRANSFORM: the empty string used to clear a transform
 */

export const STIFFNESS = 150;
export const DAMPING = 15;
export const MASS = 1;
export const MAX_X = 12;
export const MAX_Y = 8;
export const REDUCED_SCALE = 1.04;

export const AUTO_SELECTORS = [
  '.atelier-nav a',
  '.home-primary-links a',
  '.lens-control button',
];

export function clamp(v, max) {
  return Math.max(-max, Math.min(max, v));
}

export function createState() {
  return { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 };
}

/** Integrate one frame of spring physics for a single state. */
export function step(s, dt) {
  const fx = STIFFNESS * (s.targetX - s.x) - DAMPING * s.vx;
  const fy = STIFFNESS * (s.targetY - s.y) - DAMPING * s.vy;

  s.vx += (fx / MASS) * dt;
  s.vy += (fy / MASS) * dt;
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  return s;
}

export function isAtRest(s) {
  return Math.abs(s.x) < 0.01 && Math.abs(s.y) < 0.01 &&
    Math.abs(s.vx) < 0.01 && Math.abs(s.vy) < 0.01;
}

export function transformString(s) {
  if (isAtRest(s)) return null;
  return `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`;
}

/** Compute the per-frame delta in seconds, clamped to 64ms (≈15fps floor). */
export function chooseDt(now, lastTime) {
  if (!lastTime) return 0.016;
  return Math.min((now - lastTime) / 1000, 0.064);
}

export const INITIAL_TRANSFORM = '';
