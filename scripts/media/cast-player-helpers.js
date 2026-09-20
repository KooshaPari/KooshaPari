// Pure helpers for the Cast Player terminal replay engine.
// Side effects (DOM mutations, fetch, rAF, audio) live in
// scripts/media/cast-player.js; this file is testable in isolation.

import { SEEK_STEP_MS } from './cast-timeline.js';

// CSS class names referenced by the player orchestrator.
export const CLASS_LINE = 'cast-player__line';
export const CLASS_SPEED_BTN_ACTIVE = 'cast-player__speed-btn--active';
export const CLASS_STATE_PAUSED = 'cast-player--paused';
export const CLASS_STATE_FINISHED = 'cast-player--finished';
export const CLASS_VISUALLY_HIDDEN = 'visually-hidden';

// HTML data attributes that the player reads.
export const ATTR_DATA_SRC = 'data-src';
export const ATTR_DATA_TITLE = 'data-title';
export const ATTR_DATA_SPEED = 'data-speed';
export const ATTR_DATA_STATE = 'data-state';

// Selector used by initCastPlayers.
export const SELECTOR_PLAYER = '.cast-player[data-src]';

// Transport glyphs (unicode play/pause).
export const PLAY_GLYPH = '\u25b6';   // ▶
export const PAUSE_GLYPH = '\u23f8';  // ⏸

// Accessible labels.
export const LABEL_PLAY = 'Play';
export const LABEL_PAUSE = 'Pause';

// Live-region announcement strings.
export const ANNOUNCE_PLAYING = 'Playing';
export const ANNOUNCE_PAUSED = 'Paused';
export const ANNOUNCE_FINISHED = 'Playback finished';
export const ANNOUNCE_UNAVAILABLE = 'Recording unavailable';

// Reused from the site-wide live region.
export const ID_ANNOUNCEMENTS = 'announcements';

// Keyboard / wheel shortcuts.
export const KEY_SPACE = ' ';
export const KEY_ARROW_LEFT = 'ArrowLeft';
export const KEY_ARROW_RIGHT = 'ArrowRight';

// Defaults for terminal-width estimation from the asciinema header.
export const CELL_EM_WIDTH = 0.6;
export const TERMINAL_WIDTH_MIN_EM = 30;
export const TERMINAL_WIDTH_MAX_EM = 90;

// Fetch timeout for .cast file loads.
export const LOAD_TIMEOUT_MS = 5000;

// .cast event types that produce visible output ('o' output, 'i' input echo).
const OUTPUT_EVENT_TYPES = new Set(['o', 'i']);

/** True when the asciinema event type is rendered as terminal output. */
export function isOutputEvent(event) {
  return event != null && OUTPUT_EVENT_TYPES.has(event.type);
}

/**
 * Split a .cast frame's data into visible lines.
 * Strip carriage returns so progress-bar redraws collapse cleanly.
 */
export function splitCastFrame(data) {
  if (typeof data !== 'string') return [];
  return data.replace(/\r/g, '').split('\n');
}

/** Clamp elapsed milliseconds into [0, durationMs]. */
export function clampElapsed(targetMs, durationMs) {
  if (typeof targetMs !== 'number' || Number.isNaN(targetMs)) return 0;
  if (typeof durationMs !== 'number' || durationMs <= 0) return 0;
  return Math.max(0, Math.min(durationMs, targetMs));
}

/**
 * Compute the elapsed delta from a rAF timestamp, the previous start
 * timestamp, and the playback speed multiplier.
 */
export function computeElapsedDelta(timestamp, startTime, speed) {
  if (typeof timestamp !== 'number' || typeof startTime !== 'number') return 0;
  if (typeof speed !== 'number' || speed <= 0) return 0;
  return (timestamp - startTime) * speed;
}

/**
 * Estimate the terminal width (in em units) from the asciinema column
 * count. Returns null when the value is missing or out of the
 * usable range, so callers can skip the override.
 */
export function estimatedTerminalWidth(cols, {
  cellEm = CELL_EM_WIDTH,
  minEm = TERMINAL_WIDTH_MIN_EM,
  maxEm = TERMINAL_WIDTH_MAX_EM,
} = {}) {
  if (typeof cols !== 'number' || cols <= 0) return null;
  const estimate = cols * cellEm;
  if (estimate <= minEm || estimate >= maxEm) return null;
  return estimate;
}

/** True when the keydown is a player transport shortcut. */
export function isPlaybackShortcut(event) {
  if (!event) return false;
  return event.key === KEY_SPACE ||
         event.key === KEY_ARROW_LEFT ||
         event.key === KEY_ARROW_RIGHT;
}

/** True when the wheel event should scrub (Shift+wheel with non-zero delta). */
export function isScrubWheel(event) {
  if (!event) return false;
  if (!event.shiftKey) return false;
  if (typeof event.deltaY !== 'number' || event.deltaY === 0) return false;
  return true;
}

/**
 * Convert a wheel delta into a seek delta (one SEEK_STEP_MS per
 * notional notch). Sign-preserving.
 */
export function wheelSeekDelta(deltaY) {
  if (typeof deltaY !== 'number' || Number.isNaN(deltaY) || deltaY === 0) return 0;
  return Math.sign(deltaY) * SEEK_STEP_MS;
}

/** Compute the initial state bag for a fresh player instance. */
export function initialPlayerState() {
  return {
    playing: false,
    finished: false,
    elapsed: 0,
    eventIdx: 0,
    startTime: 0,
    rafId: null,
    speed: 1,
  };
}
