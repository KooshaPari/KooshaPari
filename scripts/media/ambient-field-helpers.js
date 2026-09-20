/**
 * Pure helpers for the ambient particle field — no DOM, no canvas, no
 * requestAnimationFrame. Tested in isolation so the orchestrator can
 * validate its motion invariants without spinning up a real canvas.
 */

export const PARTICLE_COLOR = 'rgba(126, 186, 181, 0.3)';
export const LINE_COLOR     = 'rgba(126, 186, 181, 0.08)';
export const NODE_COLOR     = 'rgba(126, 186, 181, 0.6)';

export const DESKTOP_COUNT  = 60;
export const MOBILE_COUNT   = 30;
export const MIN_COUNT      = 4;

export const LINE_DISTANCE  = 120;
export const NODE_RADIUS    = { min: 3, max: 4 };
export const DUST_RADIUS    = 1;

export const SPEED_MIN      = 0.1;
export const SPEED_MAX      = 0.3;
export const SINE_AMPLITUDE = 0.15;
export const SINE_PERIOD    = 0.003;

/**
 * Build a single particle with deterministic-ish initial state.
 *
 * @param {number} width
 * @param {number} height
 * @param {number} index
 * @param {boolean} isNode
 */
export function createParticle(width, height, index, isNode) {
  const angle = (index * 2.39996) % (2 * Math.PI); // golden angle spread
  const radius = 0.15 + ((index * 7 + 3) % 100) / 100 * 0.7; // 0.15–0.85 of bounds
  return {
    x: width * 0.5 + Math.cos(angle) * width * radius * 0.5,
    y: height * 0.5 + Math.sin(angle) * height * radius * 0.5,
    vx: SPEED_MIN + ((index * 13 + 7) % 100) / 100 * (SPEED_MAX - SPEED_MIN),
    vy: SPEED_MIN + ((index * 17 + 11) % 100) / 100 * (SPEED_MAX - SPEED_MIN),
    phase: (index * 1.7) % (2 * Math.PI),
    isNode,
    nodePulse: 0,
    nodePulseDir: 1,
  };
}

/**
 * Resolve the particle count + node distribution for a viewport.
 *
 * @param {number} width
 * @param {number} height
 * @param {boolean} lowEnd — true for low-hardware-concurrency devices
 * @returns {Array}
 */
export function buildParticles(width, height, lowEnd) {
  const isMobile = width < 768;
  const count = lowEnd ? MIN_COUNT : (isMobile ? MOBILE_COUNT : DESKTOP_COUNT);
  const particles = [];
  for (let i = 0; i < count; i++) {
    const isNode = !isMobile && i % 8 === 0 && !lowEnd;
    particles.push(createParticle(width, height, i, isNode));
  }
  return particles;
}

/**
 * Advance particle positions by one step. Mutates the particles in place.
 *
 * @param {Array} particles
 * @param {number} width
 * @param {number} height
 * @param {number} frame
 * @param {number} step
 */
export function ambientStep(particles, width, height, frame, step) {
  for (const p of particles) {
    const sineOffset = Math.sin(frame * SINE_PERIOD + p.phase) * SINE_AMPLITUDE;
    p.x += (p.vx + sineOffset) * step;
    p.y += p.vy * step;

    // Wrap around edges with padding
    const pad = LINE_DISTANCE;
    if (p.x > width + pad) p.x = -pad;
    if (p.x < -pad) p.x = width + pad;
    if (p.y > height + pad) p.y = -pad;
    if (p.y < -pad) p.y = height + pad;

    // Node pulse
    if (p.isNode) {
      p.nodePulse += 0.008 * p.nodePulseDir * step;
      if (p.nodePulse >= 1) { p.nodePulse = 1; p.nodePulseDir = -1; }
      if (p.nodePulse <= 0) { p.nodePulse = 0; p.nodePulseDir = 1; }
    }
  }
}

/**
 * Static positions used when prefers-reduced-motion is true. The renderer
 * iterates over them and draws a single dot at each point.
 *
 * @param {number} width
 * @param {number} height
 */
export function staticPositions(width, height) {
  return [
    { x: width * 0.25, y: height * 0.35 },
    { x: width * 0.55, y: height * 0.6 },
    { x: width * 0.78, y: height * 0.28 },
  ];
}

/**
 * Split a particle list into the dust and node sub-lists the renderer needs.
 *
 * @param {Array} particles
 * @returns {{ dust: Array, nodes: Array }}
 */
export function splitParticles(particles) {
  const dust = [];
  const nodes = [];
  for (const p of particles) {
    (p.isNode ? nodes : dust).push(p);
  }
  return { dust, nodes };
}
