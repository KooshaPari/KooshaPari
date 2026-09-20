/**
 * Ambient particle field — generative canvas background for the homepage hero.
 *
 * Types: dust motes (tiny dots), constellation lines (thin connections),
 * nodes (pulsing larger circles). Precision-aesthetic, not organic.
 *
 * Usage:
 *   import { initAmbientField } from '../media/ambient-field.js';
 *   const teardown = initAmbientField(document.querySelector('.home-opening'));
 *   // teardown() — or destroyAmbientField() — stops the loop and frees the canvas.
 *
 * Performance contract (each of these was measured as a regression source):
 *   - The backing store is capped at MAX_DEVICE_PIXELS. The hero section is
 *     ~2400x3600 CSS px at DPR 2 (8.7 MP); drawing that every frame drops the
 *     home page to ~23 rAF/s. The CSS size is unchanged, so this is visually
 *     equivalent while costing a fraction of the fill rate.
 *   - The loop stops when the field leaves the viewport, when the tab is
 *     hidden, and when the canvas is detached from the document. Without the
 *     detach guard a single home visit leaked a full-viewport redraw loop for
 *     the rest of the session.
 */

import {
  PARTICLE_COLOR,
  LINE_COLOR,
  NODE_COLOR,
  DUST_RADIUS,
  NODE_RADIUS,
  LINE_DISTANCE,
  buildParticles,
  ambientStep,
  splitParticles,
  staticPositions,
} from './ambient-field-helpers.js';

const RESIZE_DEBOUNCE_MS = 200;

/**
 * Draw-rate cap. Motes drift at 0.1-0.3 px per 60 Hz frame, so half the draws
 * at twice the step is visually identical for half the fill cost. Motion is
 * advanced by real elapsed time, never by a fixed per-frame constant.
 */
const TARGET_FPS = 30;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;

/**
 * Backing-store budget in device pixels (~2 MP). Prevents an 8.7 MP canvas on
 * a large hero section at DPR 2. Drawing stays in CSS-pixel coordinates.
 */
const MAX_DEVICE_PIXELS = 2_000_000;

/**
 * How far outside the viewport the field may sit before it stops drawing.
 */
const IDLE_ROOT_MARGIN = '200px';

/** @type {null | (() => void)} Teardown for the most recently initialised field. */
let activeTeardown = null;

/**
 * Stop and remove the current ambient field, if one is running.
 * Called on every route render so navigation cannot accumulate loops.
 */
export function destroyAmbientField() {
  const teardown = activeTeardown;
  activeTeardown = null;
  if (teardown) teardown();
}

/**
 * Draw one frame: lines first, then dust, then nodes on top.
 *
 * `dust` is precomputed by the caller: rebuilding it with a filter on every
 * frame allocated a fresh array 60 times a second for no reason.
 */
function draw(ctx, particles, dust, width, height) {
  ctx.clearRect(0, 0, width, height);

  // --- Constellation lines ---
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 1;
  for (let i = 0; i < dust.length; i++) {
    for (let j = i + 1; j < dust.length; j++) {
      const dx = dust[i].x - dust[j].x;
      const dy = dust[i].y - dust[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < LINE_DISTANCE) {
        const alpha = 1 - dist / LINE_DISTANCE;
        ctx.globalAlpha = alpha * 0.5; // reinforce the 8% base
        ctx.beginPath();
        ctx.moveTo(dust[i].x, dust[i].y);
        ctx.lineTo(dust[j].x, dust[j].y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  // --- Dust motes ---
  ctx.fillStyle = PARTICLE_COLOR;
  for (const p of dust) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, DUST_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
  }

  // --- Nodes (pulsing) ---
  for (const p of particles) {
    if (!p.isNode) continue;
    const r = NODE_RADIUS.min + p.nodePulse * (NODE_RADIUS.max - NODE_RADIUS.min);
    ctx.globalAlpha = 0.35 + p.nodePulse * 0.25;
    ctx.fillStyle = NODE_COLOR;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw a static field — 3 subtle dots, no animation, for reduced-motion users.
 */
function drawStatic(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = PARTICLE_COLOR;
  for (const pos of staticPositions(width, height)) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, DUST_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
  }
}

/**
 * Initialise the ambient particle field inside the given container.
 *
 * @param {HTMLElement} container — the hero section element
 */
export function initAmbientField(container) {
  if (!container || !document.createElement('canvas').getContext) return;

  // A stale field (route re-render, or a caller that dropped the handle) must
  // never outlive the new one — two loops on the same hero is strictly worse
  // than one.
  destroyAmbientField();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowEnd = (navigator.hardwareConcurrency || 4) <= 4;

  const canvas = document.createElement('canvas');
  canvas.className = 'ambient-field-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';

  // Make container the positioning context
  const prevPosition = getComputedStyle(container).position;
  if (prevPosition === 'static') {
    container.style.position = 'relative';
  }
  // Ensure existing children layer above the canvas
  container.style.isolation = 'isolate';
  container.insertBefore(canvas, container.firstChild);

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let dust = [];
  let frame = 0;
  let rafId = 0;
  let inView = true;
  let destroyed = false;

  /** True while the loop should not be scheduled. */
  function shouldIdle() {
    return destroyed || document.hidden || !inView || !canvas.isConnected;
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function start() {
    if (!rafId && !shouldIdle() && !prefersReducedMotion) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.round(rect.width);
    height = Math.round(rect.height);
    // Cap the backing store: the visual size is set by CSS below, so the only
    // effect is a proportional drop in fill-rate cost for a procedural field
    // of 1px dots and 1px lines.
    const area = Math.max(1, width * height);
    const scale = Math.min(dpr, Math.sqrt(MAX_DEVICE_PIXELS / area));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    particles = buildParticles(width, height, lowEnd);
    dust = splitParticles(particles).dust;

    if (prefersReducedMotion) {
      drawStatic(ctx, width, height);
    } else if (rafId) {
      // Repaint immediately so an in-flight resize never shows a stale field.
      draw(ctx, particles, dust, width, height);
    }
  }

  let lastDrawAt = 0;

  function tick(now) {
    if (shouldIdle()) { rafId = 0; return; }
    rafId = requestAnimationFrame(tick);
    if (!particles.length) return;

    // Skip this frame if the previous draw is still fresh. `step` is real
    // elapsed time in nominal frames, so drift speed is unchanged.
    if (now - lastDrawAt < FRAME_INTERVAL_MS - 1) return;
    const elapsed = lastDrawAt ? Math.min(now - lastDrawAt, FRAME_INTERVAL_MS * 4) : FRAME_INTERVAL_MS;
    lastDrawAt = now;
    const step = elapsed / FRAME_INTERVAL_MS;

    frame += step;
    ambientStep(particles, width, height, frame, step);
    draw(ctx, particles, dust, width, height);
  }

  // Debounced resize
  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, RESIZE_DEBOUNCE_MS);
  }

  // Park the loop when the tab is hidden.
  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  // Park the loop when the field scrolls out of view. The hero canvas spans the
  // whole opening section, so it easily stays alive well past the fold.
  let observer = null;
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    }, { rootMargin: IDLE_ROOT_MARGIN });
    observer.observe(container);
  }

  resize();
  start();

  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stop();
    clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    observer?.disconnect();
    observer = null;
    particles = [];
    dust = [];
    if (activeTeardown === destroy) activeTeardown = null;
    canvas.remove();
  }

  activeTeardown = destroy;

  // Return a teardown handle in case the view unmounts.
  return destroy;
}
