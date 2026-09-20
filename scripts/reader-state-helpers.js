// Pure helpers for the Reader Mode state machine.
// Side effects (DOM updates, localStorage writes, event listeners)
// live in scripts/reader-state.js; this file is testable in isolation.

export const READER_STORAGE_KEY = 'koosha-atelier-reader';
export const READER_TOGGLED_KEY = 'koosha-atelier-reader-toggled';
export const ID_ANNOUNCEMENTS = 'announcements';
export const ID_READER_TOGGLE = 'reader-toggle';
export const SELECTOR_VIEW_ROOT_HEADING = '#view-root h1, #view-root h2';
export const DATA_READER = 'reader';

export const ANNOUNCE_ACTIVE = 'Reader mode active';
export const ANNOUNCE_INACTIVE = 'Reader mode inactive';

// Standard visually-hidden styling for an aria-live region.
export const SR_ONLY_CSS =
  'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;' +
  ' overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';

/**
 * True when the keydown should NOT trigger app shortcuts.
 * Mirrors the browser heuristic: ignore typing in inputs, modifier keys,
 * autorepeat, and consumed events.
 */
export function shouldIgnoreShortcut(event) {
  if (!event) return true;
  if (event.defaultPrevented) return true;
  if (event.isComposing) return true;
  if (event.repeat) return true;
  if (event.ctrlKey || event.metaKey || event.altKey) return true;
  const target = event.target;
  if (target?.isContentEditable) return true;
  if (target?.closest?.('input, textarea, select, [role="textbox"]')) return true;
  return false;
}

/** True when the event is the Reader Mode toggle key (case-insensitive 'r'). */
export function isReaderKey(event) {
  return typeof event?.key === 'string' && event.key.toLowerCase() === 'r';
}

/** True when the event is the Escape key. */
export function isEscapeKey(event) {
  return event?.key === 'Escape';
}

/** Parse a stored boolean: 'true' -> true, 'false' -> false, anything else -> null. */
export function parseStoredBoolean(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

/**
 * Resolve the initial reader mode.
 * Priority: parsed stored value > prefersReducedMotion > defaultValue.
 * Stored value wins so the user's explicit toggle survives across reloads
 * (per READER_MODE.md).
 */
export function initialReaderMode({
  prefersReducedMotion = false,
  storedValue = null,
  defaultValue = false,
} = {}) {
  const stored = parseStoredBoolean(storedValue);
  if (stored !== null) return stored;
  if (prefersReducedMotion) return true;
  return defaultValue;
}

/** Data attribute string for the current reader mode. */
export function readerAttrValue(on) {
  return on ? 'true' : 'false';
}

/** Screen-reader announcement text for the current reader mode. */
export function readerAnnouncement(on) {
  return on ? ANNOUNCE_ACTIVE : ANNOUNCE_INACTIVE;
}
