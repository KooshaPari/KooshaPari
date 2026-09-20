// Per READER_MODE.md spec:
// - Trigger: R key (global), Reader toggle click, prefers-reduced-motion: reduce (if user hasn't toggled before)
// - Exit: R key, toggle click, Esc; resizing preserves the visitor's choice
// - DOM: html[data-reader="true"] applied globally
// - Persistence: localStorage reads/writes

import {
  READER_STORAGE_KEY,
  READER_TOGGLED_KEY,
  ID_ANNOUNCEMENTS,
  ID_READER_TOGGLE,
  SELECTOR_VIEW_ROOT_HEADING,
  DATA_READER,
  SR_ONLY_CSS,
  shouldIgnoreShortcut,
  isReaderKey,
  isEscapeKey,
  initialReaderMode,
  readerAttrValue,
  readerAnnouncement,
} from './reader-state-helpers.js';

let readerMode = false;
let readers = new Set();
let initReady = false;

function announce(message) {
  const region = document.getElementById(ID_ANNOUNCEMENTS);
  if (region) region.textContent = message;
}

function applyReaderMode(on = true) {
  readerMode = on;
  document.documentElement.dataset[DATA_READER] = readerAttrValue(on);

  announce(readerAnnouncement(on));

  // Focus management per spec
  if (on) {
    const firstHeading = document.querySelector(SELECTOR_VIEW_ROOT_HEADING);
    firstHeading?.setAttribute('tabindex', '-1');
    firstHeading?.focus?.();
  } else {
    document.getElementById(ID_READER_TOGGLE)?.focus?.();
  }

  for (const subscriber of readers) subscriber(readerMode);
}

function initReader() {
  if (initReady) return;
  initReady = true;

  let prefersReducedMotion = false;
  try {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch { /* retain default when media queries are unavailable */ }

  let storedValue = null;
  try {
    storedValue = localStorage.getItem(READER_STORAGE_KEY);
  } catch { /* storage can be unavailable */ }

  readerMode = initialReaderMode({ prefersReducedMotion, storedValue });
  document.documentElement.dataset[DATA_READER] = readerAttrValue(readerMode);

  // Ensure live region exists
  if (!document.getElementById(ID_ANNOUNCEMENTS)) {
    const region = document.createElement('div');
    region.id = ID_ANNOUNCEMENTS;
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.style.cssText = SR_ONLY_CSS;
    document.body.appendChild(region);
  }

  // Keyboard handler: R key (global, not in input)
  document.addEventListener('keydown', (e) => {
    if (shouldIgnoreShortcut(e)) return;
    if (isReaderKey(e)) {
      e.preventDefault();
      toggleReader();
    }
  });

  // Escape exits Reader Mode
  document.addEventListener('keydown', (e) => {
    if (isEscapeKey(e) && readerMode && !e.defaultPrevented) {
      applyReaderMode(false);
      persistReader();
    }
  });

  // Resizing must not override the visitor's Reader preference.
}

function toggleReader() {
  applyReaderMode(!readerMode);
  persistReader();
}

function persistReader() {
  // Persist user choice
  try {
    localStorage.setItem(READER_STORAGE_KEY, readerMode.toString());
    localStorage.setItem(READER_TOGGLED_KEY, 'true');
  } catch {
    /* ignore */
  }
}

export function createReaderState() {
  initReader();

  return {
    get() {
      return readerMode;
    },

    set(value) {
      applyReaderMode(Boolean(value));
      persistReader();
    },

    toggle() {
      toggleReader();
    },

    subscribe(subscriber) {
      readers.add(subscriber);
      return () => readers.delete(subscriber);
    },

    // Called from lensState.subscribe for sync
    syncWithLens(lensState) {
      return lensState.subscribe((lens) => {
        // In Reader Mode, lens toggle still works; nothing extra needed here
      });
    },
  };
}
