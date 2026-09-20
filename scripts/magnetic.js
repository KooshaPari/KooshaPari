/* ============================================================
 *  Magnetic Button Physics
 *  Spring-based cursor displacement for interactive elements.
 *  Damped harmonic oscillator: stiffness 150, damping 15, mass 1.
 *  Max displacement: 12px X, 8px Y.
 * ============================================================ */

import {
  MAX_X,
  MAX_Y,
  REDUCED_SCALE,
  AUTO_SELECTORS,
  clamp,
  createState,
  step,
  transformString,
  chooseDt,
  INITIAL_TRANSFORM,
} from './magnetic-helpers.js';

/** @type {Map<Element, ReturnType<typeof createState>>} */
const instances = new Map();

/** True when the user prefers minimal motion. */
function prefersReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Get element center relative to viewport. */
function center(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Attach magnetic physics to an element.
 * Wraps mouseenter / mousemove / mouseleave with spring integration.
 */
function attach(el) {
  if (instances.has(el)) return;

  const s = createState();

  const reduced = prefersReduced();

  function onEnter(e) {
    const c = center(el);
    const dx = e.clientX - c.x;
    const dy = e.clientY - c.y;

    if (reduced) {
      el.style.transform = `scale(${REDUCED_SCALE})`;
      return;
    }

    s.targetX = clamp(dx, MAX_X);
    s.targetY = clamp(dy, MAX_Y);
  }

  function onMove(e) {
    if (reduced) return;
    const c = center(el);
    const dx = e.clientX - c.x;
    const dy = e.clientY - c.y;
    s.targetX = clamp(dx, MAX_X);
    s.targetY = clamp(dy, MAX_Y);
  }

  function onLeave() {
    if (reduced) {
      el.style.transform = INITIAL_TRANSFORM;
      return;
    }
    s.targetX = 0;
    s.targetY = 0;
  }

  el.addEventListener('mouseenter', onEnter);
  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);

  instances.set(el, s);
}

/** Apply transform from state. */
function applyTransform(el, s) {
  const next = transformString(s);
  el.style.transform = next === null ? INITIAL_TRANSFORM : next;
}

/** Main rAF loop — drives all attached elements. */
let rafId = 0;
let lastTime = 0;

function tick(now) {
  const dt = chooseDt(now, lastTime);
  lastTime = now;

  for (const [el, s] of instances) {
    step(s, dt);
    applyTransform(el, s);
  }

  rafId = requestAnimationFrame(tick);
}

/**
 * Initialise magnetic physics.
 *
 * Collects all `.magnetic` elements plus the auto-selectors
 * (`.atelier-nav a`, `.home-primary-links a`, `.lens-control button`)
 * and attaches spring displacement handlers.
 *
 * When `prefers-reduced-motion: reduce` is active, displacement is
 * disabled and a subtle scale shift is applied instead.
 */
export function initMagnetic() {
  if (prefersReduced()) {
    // Reduced-motion: apply scale on hover only, no spring loop.
    const reducedSelectors = ['.magnetic', ...AUTO_SELECTORS];
    const els = document.querySelectorAll(reducedSelectors.join(', '));
    for (const el of els) {
      el.addEventListener('mouseenter', () => {
        el.style.transform = `scale(${REDUCED_SCALE})`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = INITIAL_TRANSFORM;
      });
    }
    return;
  }

  const selectors = ['.magnetic', ...AUTO_SELECTORS];
  const els = document.querySelectorAll(selectors.join(', '));
  for (const el of els) attach(el);

  if (!rafId) {
    lastTime = 0;
    rafId = requestAnimationFrame(tick);
  }
}
