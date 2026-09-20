/**
 * lightbox-helpers.js — Pure helpers for the lightbox orchestrator.
 *
 * No DOM access. The orchestrator module wires these into event handlers.
 */

export const OVERLAY_CLASS = 'lightbox-overlay';
export const ACTIVE_CLASS = 'lightbox-active';

export const CLASS_IMG = 'lightbox-img';
export const CLASS_CAPTION = 'lightbox-caption';
export const CLASS_FIGURE = 'lightbox-figure';
export const CLASS_CLOSE_BTN = 'lightbox-close';
export const CLASS_PREV_BTN = 'lightbox-nav lightbox-prev';
export const CLASS_NEXT_BTN = 'lightbox-nav lightbox-next';
export const CLASS_COUNTER = 'lightbox-counter';

export const SELECTOR_IMAGES =
  '.case-gallery img, .case-hero img, .project-card-image';

/**
 * Inline SVG strings used to populate the close / prev / next buttons.
 */
export const ICON_CLOSE =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
export const ICON_PREV =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';
export const ICON_NEXT =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

/** Swipe threshold in CSS pixels. */
export const SWIPE_MIN_DISTANCE = 50;

/**
 * Keyboard keys the lightbox handles while open.
 */
export const KEY_ESCAPE = 'Escape';
export const KEY_ARROW_LEFT = 'ArrowLeft';
export const KEY_ARROW_RIGHT = 'ArrowRight';

/**
 * The CSS `cursor` value applied to lightbox-eligible images.
 */
export const ZOOM_CURSOR = 'zoom-in';

/**
 * Compute the next index with wraparound. Returns `current` when
 * `total <= 0` (defensive guard).
 *
 * @param {number} current
 * @param {number} total
 * @returns {number}
 */
export function nextIndex(current, total) {
  if (total <= 0) return current;
  return (current + 1) % total;
}

/**
 * Compute the previous index with wraparound. Returns `current` when
 * `total <= 0`.
 *
 * @param {number} current
 * @param {number} total
 * @returns {number}
 */
export function prevIndex(current, total) {
  if (total <= 0) return current;
  return (current - 1 + total) % total;
}

/**
 * Build the gallery counter string "N / M".
 *
 * @param {number} index zero-based index
 * @param {number} total
 * @returns {string}
 */
export function counterText(index, total) {
  return `${index + 1} / ${total}`;
}

/**
 * Decide whether a horizontal swipe is being made. A horizontal swipe
 * is one where |dx| > |dy| AND |dx| > the minimum distance.
 *
 * @param {number} dx horizontal delta (touchend.clientX - touchstart.clientX)
 * @param {number} dy vertical delta
 * @param {number} [threshold=SWIPE_MIN_DISTANCE]
 * @returns {boolean}
 */
export function isHorizontalSwipe(dx, dy, threshold = SWIPE_MIN_DISTANCE) {
  return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold;
}

/**
 * Decide which direction a swipe is going. Returns 'next' for a left
 * swipe (negative dx), 'prev' for a right swipe (positive dx), and
 * `null` if the swipe doesn't qualify.
 *
 * @param {number} dx
 * @param {number} dy
 * @param {number} [threshold=SWIPE_MIN_DISTANCE]
 * @returns {'next' | 'prev' | null}
 */
export function swipeDirection(dx, dy, threshold = SWIPE_MIN_DISTANCE) {
  if (!isHorizontalSwipe(dx, dy, threshold)) return null;
  return dx < 0 ? 'next' : 'prev';
}

/**
 * Whether the prev/next buttons and counter should be visible. They
 * only make sense with more than one image.
 *
 * @param {number} total
 * @returns {boolean}
 */
export function shouldShowNav(total) {
  return total > 1;
}
