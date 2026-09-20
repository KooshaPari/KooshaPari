/**
 * image-reveal-helpers.js — Pure helpers for image reveal choreography.
 *
 * No DOM access. The orchestrator module wires these into real handlers.
 */

export const REVEAL_STYLES = ['wipe-right', 'zoom-fade', 'curtain', 'pixelate'];

export const TRANSITION_DURATION_MS = 800;
export const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** Buffer added to TRANSITION_DURATION_MS for the cleanup setTimeout. */
export const CLEANUP_BUFFER_MS = 50;
/** Delay before fading out the placeholder after reveal starts. */
export const PLACEHOLDER_FADE_DELAY_MS = 80;

/** Class added to a revealed image so CSS rules take over from inline styles. */
export const CLASS_REVEALED = 'revealed';
export const CLASS_IMG = 'image-reveal-img';
export const CLASS_CONTAINER = 'image-reveal-container';
export const CLASS_PLACEHOLDER = 'image-reveal-placeholder';

/** Data attributes used to mark / control reveal processing. */
export const ATTR_REVEAL_STYLE = 'data-reveal-style';
export const ATTR_REVEAL_PROCESSED = 'data-reveal-processed';
export const ATTR_DATA_SRC = 'data-src';

/** CSS custom property for the container's intrinsic aspect ratio. */
export const VAR_REVEAL_ASPECT = '--reveal-aspect';

/**
 * Decide which reveal style to use for an image. Returns `attr` when it
 * is non-empty and a known style; otherwise picks randomly from
 * {@link REVEAL_STYLES}. The optional `randomFn` lets callers inject a
 * deterministic RNG (defaults to `Math.random`).
 *
 * @param {string|null|undefined} attr value of `data-reveal-style`
 * @param {() => number} [randomFn]
 * @returns {string}
 */
export function pickRevealStyle(attr, randomFn = Math.random) {
  if (attr && REVEAL_STYLES.includes(attr)) return attr;
  const idx = Math.floor(randomFn() * REVEAL_STYLES.length);
  return REVEAL_STYLES[idx];
}

/**
 * Whether a reveal style name is known.
 *
 * @param {string} style
 * @returns {boolean}
 */
export function isValidRevealStyle(style) {
  return REVEAL_STYLES.includes(style);
}

/**
 * Build the `--reveal-aspect` value from an `<img>`'s intrinsic width
 * and height. Returns `null` when either is missing or non-positive —
 * the orchestrator skips the inline style in that case.
 *
 * @param {number|string|null|undefined} w
 * @param {number|string|null|undefined} h
 * @returns {string | null}
 */
export function aspectRatioVar(w, h) {
  const width = Number.parseInt(w, 10);
  const height = Number.parseInt(h, 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  return `${width} / ${height}`;
}

/**
 * Build a `url(...)` CSS background-image value for the placeholder.
 * Returns `null` for empty sources or `data:` URIs.
 *
 * @param {string|null|undefined} src
 * @returns {string | null}
 */
export function backgroundImageFor(src) {
  if (!src || src.startsWith('data:')) return null;
  return `url(${src})`;
}

/**
 * Compute the cleanup timeout used to clear inline styles after a reveal.
 *
 * @returns {number}
 */
export function cleanupDelayMs() {
  return TRANSITION_DURATION_MS + CLEANUP_BUFFER_MS;
}

/**
 * The "wipe-right" reveal — initial clip-path that hides the image.
 * @returns {string}
 */
export function wipeRightInitialClipPath() {
  return 'inset(0 100% 0 0)';
}

/** @returns {string} */
export function wipeRightFinalClipPath() {
  return 'inset(0)';
}

/**
 * The "zoom-fade" reveal — initial transform / filter / opacity values.
 * @returns {{transform: string, filter: string, opacity: string}}
 */
export function zoomFadeInitial() {
  return {
    transform: 'scale(1.05)',
    filter: 'blur(10px)',
    opacity: '0',
  };
}

/** @returns {{transform: string, filter: string, opacity: string}} */
export function zoomFadeFinal() {
  return {
    transform: 'scale(1)',
    filter: 'blur(0)',
    opacity: '1',
  };
}

/**
 * The "curtain" reveal — initial clip-path is a degenerate polygon at
 * the center.
 * @returns {string}
 */
export function curtainInitialClipPath() {
  return 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)';
}

/** @returns {string} */
export function curtainFinalClipPath() {
  return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
}

/**
 * The "pixelate" reveal — initial filter / opacity.
 * @returns {{filter: string, opacity: string}}
 */
export function pixelateInitial() {
  return {
    filter: 'contrast(20) saturate(0) blur(6px)',
    opacity: '0',
  };
}

/** @returns {{filter: string, opacity: string}} */
export function pixelateFinal() {
  return {
    filter: 'contrast(1) saturate(1) blur(0)',
    opacity: '1',
  };
}

/**
 * Build a single-property CSS transition string.
 *
 * @param {string} property
 * @param {number} [duration=TRANSITION_DURATION_MS]
 * @param {string} [easing=EASING]
 * @returns {string}
 */
export function transitionFor(property, duration = TRANSITION_DURATION_MS, easing = EASING) {
  return `${property} ${duration}ms ${easing}`;
}

/**
 * Build a multi-property CSS transition string by joining entries with
 * `, `. Empty entries are skipped.
 *
 * @param {string[]} properties
 * @param {number} [duration=TRANSITION_DURATION_MS]
 * @param {string} [easing=EASING]
 * @returns {string}
 */
export function transitionsFor(properties, duration = TRANSITION_DURATION_MS, easing = EASING) {
  return properties
    .map((p) => transitionFor(p, duration, easing))
    .join(', ');
}
