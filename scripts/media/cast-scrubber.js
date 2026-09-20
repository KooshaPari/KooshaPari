/* ================================================================
   Cast scrubber — seek interaction contract.

   Wires pointer drag, click-to-seek, and keyboard stepping onto a
   scrubber element that already carries the APG media seek-slider
   ARIA attributes. Owns no playback state: it reads position from
   the supplied accessors and reports intent through onSeek/onToggle,
   so the same controller can drive any timeline-shaped media.

   Keyboard contract (APG slider pattern)
     ArrowLeft / ArrowDown   step back  (SEEK_STEP_MS)
     ArrowRight / ArrowUp    step ahead (SEEK_STEP_MS)
     PageDown / PageUp       coarse step (SEEK_PAGE_MS)
     Home / End              jump to start / end
     Space / Enter           toggle play
   ================================================================ */

import { SEEK_PAGE_MS, SEEK_STEP_MS } from './cast-timeline.js';

/**
 * @param {object} options
 * @param {HTMLElement} options.element       Scrubber root (role="slider")
 * @param {HTMLElement} options.fill          Progress fill, sized by width %
 * @param {HTMLElement} options.thumb         Draggable thumb, placed by left %
 * @param {() => number} options.getDurationMs
 * @param {() => number} options.getElapsedMs
 * @param {(ms: number, opts?: {announce?: boolean}) => void} options.onSeek
 * @param {() => void} options.onToggle       Space/Enter handler
 * @returns {{ sync: () => void, setEnabled: (on: boolean) => void }}
 */
export function createScrubber({
  element,
  fill,
  thumb,
  getDurationMs,
  getElapsedMs,
  onSeek,
  onToggle,
}) {
  let dragging = false;

  const STEP_KEYS = {
    ArrowLeft: -SEEK_STEP_MS,
    ArrowDown: -SEEK_STEP_MS,
    ArrowRight: SEEK_STEP_MS,
    ArrowUp: SEEK_STEP_MS,
    PageDown: -SEEK_PAGE_MS,
    PageUp: SEEK_PAGE_MS,
  };

  /** Position of a pointer event as a playing time, in ms. */
  function timeFromPointer(event) {
    const rect = element.getBoundingClientRect();
    const duration = getDurationMs();
    if (!rect.width || duration <= 0) return 0;
    const ratio = (event.clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, ratio)) * duration;
  }

  /* --- pointer --- */

  element.addEventListener('pointerdown', (event) => {
    if (getDurationMs() <= 0) return;
    dragging = true;
    element.setPointerCapture?.(event.pointerId);
    onSeek(timeFromPointer(event));
  });

  element.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    // Suppress the live announcement mid-drag; pointerup announces once.
    onSeek(timeFromPointer(event), { announce: false });
  });

  element.addEventListener('pointerup', (event) => {
    if (!dragging) return;
    dragging = false;
    element.releasePointerCapture?.(event.pointerId);
    onSeek(getElapsedMs());
  });

  element.addEventListener('pointercancel', () => {
    dragging = false;
  });

  /* --- keyboard --- */

  element.addEventListener('keydown', (event) => {
    if (getDurationMs() <= 0) return;

    const step = STEP_KEYS[event.key];
    if (step != null) {
      event.preventDefault();
      onSeek(getElapsedMs() + step);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      onSeek(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      onSeek(getDurationMs());
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onToggle();
    }
  });

  /* --- public surface --- */

  function setEnabled(on) {
    element.setAttribute('aria-disabled', on ? 'false' : 'true');
  }

  function sync() {
    const duration = getDurationMs();
    const elapsed = getElapsedMs();
    const pct = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

    fill.style.width = `${pct}%`;
    thumb.style.left = `${pct}%`;
    element.setAttribute('aria-valuenow', String(Math.round(elapsed)));
  }

  return { sync, setEnabled };
}
