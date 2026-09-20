/**
 * Pure helpers for the 2.5D perspective-tilt system.
 *
 * The orchestrator (perspective-tilt.js) is DOM-bound and concerns itself with
 * DOM querying, pointer event listeners, glare overlays, and reduced-motion
 * preferences. This file encapsulates the math: pointer normalization, angle
 * clamping, transform string formatting, and glare gradient construction.
 *
 *   - DEFAULT_MAX_TILT, DEFAULT_SCALE, DEFAULT_SPEED, DEFAULT_PERSPECTIVE
 *   - clamp(val, min, max): generic numeric clamp
 *   - normalizeClientPoint(x, y, rect): -1..1 normalized offset from center
 *   - tiltFromPointer(normalX, normalY, maxTilt, scale): the per-frame
 *     transform-string payload (perspective + rotateX/Y + scale3d)
 *   - resetTransformString(perspective): the resting neutral transform string
 *   - glareBackground(x, y, rect): CSS background string for the glare overlay
 *   - parseTiltAttrs(dataset, fallbackOpts): parse data-tilt-* attributes
 *
 * All functions are pure given their inputs.
 */

export const DEFAULT_MAX_TILT = 12;
export const DEFAULT_SCALE = 1.02;
export const DEFAULT_SPEED = 400;
export const DEFAULT_PERSPECTIVE = 800;

export const TILT_EASING = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)';

export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

/**
 * Normalize a pointer position relative to a bounding rect into a -1..1 range
 * along each axis, with (0, 0) at the rect's center.
 *
 * @param {number} pointerX - clientX minus rect.left
 * @param {number} pointerY - clientY minus rect.top
 * @param {{ width: number, height: number }} rect - the bounding rect
 */
export function normalizeClientPoint(pointerX, pointerY, rect) {
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  return {
    normalX: (pointerX - centerX) / centerX,
    normalY: (pointerY - centerY) / centerY,
  };
}

/**
 * Build the CSS transform string for a tilt frame.
 *
 * The Y axis is inverted so that the top of the element tilts *forward*
 * when the cursor is at the top (normalY < 0).
 */
export function tiltFromPointer(normalX, normalY, maxTilt, scale, perspective = DEFAULT_PERSPECTIVE) {
  const tiltX = clamp(normalY * maxTilt, -maxTilt, maxTilt);
  const tiltY = clamp(-normalX * maxTilt, -maxTilt, maxTilt);
  return `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, 1)`;
}

/**
 * The resting (pointerleave) transform string. Scale is 1, rotations are 0.
 */
export function resetTransformString(perspective = DEFAULT_PERSPECTIVE) {
  return `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
}

/**
 * Build the radial-gradient CSS for the glare overlay given a pointer position
 * in client (rect-relative) coordinates and the bounding rect.
 *
 * @param {number} pointerX - x relative to rect.left (0..rect.width)
 * @param {number} pointerY - y relative to rect.top (0..rect.height)
 * @param {{ width: number, height: number }} rect - the bounding rect
 */
export function glareBackground(pointerX, pointerY, rect) {
  const glareX = (pointerX / rect.width) * 100;
  const glareY = (pointerY / rect.height) * 100;
  return `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
}

/**
 * Parse data-tilt-* attributes. Returns the metadata that setupTilt caches
 * per element. Pure given the dataset map.
 *
 * @param {{ tiltMax?: string|null, tiltScale?: string|null, tiltSpeed?: string|null, tiltGlare?: string }} dataset
 */
export function parseTiltAttrs(dataset, options = {}) {
  const fallback = {
    maxTilt: DEFAULT_MAX_TILT,
    scale: DEFAULT_SCALE,
    speed: DEFAULT_SPEED,
    perspective: DEFAULT_PERSPECTIVE,
    ...options,
  };
  const maxTiltRaw = parseFloat(dataset.tiltMax);
  const scaleRaw = parseFloat(dataset.tiltScale);
  const speedRaw = parseInt(dataset.tiltSpeed, 10);
  return {
    maxTilt: Number.isFinite(maxTiltRaw) ? maxTiltRaw : fallback.maxTilt,
    scale: Number.isFinite(scaleRaw) ? scaleRaw : fallback.scale,
    speed: Number.isFinite(speedRaw) ? speedRaw : fallback.speed,
    perspective: fallback.perspective,
    enableGlare: dataset.tiltGlare === 'true',
  };
}

/**
 * Build the CSS transition string for the tilt element.
 */
export function tiltTransition(speed = DEFAULT_SPEED) {
  return `transform ${speed}ms ${TILT_EASING}`;
}
