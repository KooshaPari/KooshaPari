// Per READER_MODE.md spec:
// - Trigger: R key (global), Reader toggle click, prefers-reduced-motion: reduce (if user hasn't toggled before)
// - Exit: R key, toggle click, Esc, viewport >1200px (optional)
// - DOM: body[data-reader="true"] applied globally
// - Persistence: localStorage reads/writes

let readerMode = false;
let readers = new Set();
let initReady = false;

function announce(message) {
  const region = document.getElementById('announcements');
  if (region) region.textContent = message;
}

function applyReaderMode(on = true) {
  readerMode = on;
  document.documentElement.dataset.reader = on ? 'true' : 'false';

  const announcement = on ? 'Reader mode active' : 'Reader mode inactive';
  announce(announcement);

  // Focus management per spec
  if (on) {
    const firstHeading = document.querySelector('#canvas h1, #canvas h2');
    firstHeading?.focus?.();
  } else {
    document.getElementById('reader-toggle')?.focus?.();
  }

  for (const subscriber of readers) subscriber(readerMode);
}

function initReader() {
  if (initReady) return;
  initReady = true;

  // Ensure live region exists
  if (!document.getElementById('announcements')) {
    const region = document.createElement('div');
    region.id = 'announcements';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.style.cssText = `
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
    `;
    document.body.appendChild(region);
  }

  // Keyboard handler: R key (global, not in input)
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r' && !e.target.matches('input, textarea, select')) {
      e.preventDefault();
      toggleReader();
    }
  });

  // Escape exits Reader Mode
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && readerMode) applyReaderMode(false);
  });

  // Optional viewport exit (if enabled)
  let mq = null;
  try {
    mq = window.matchMedia('(min-width: 1200px)');
    const check = () => {
      if (mq.matches) applyReaderMode(false);
    };
    mq.addEventListener('change', check);
  } catch {
    /* ignore */
  }
}

function toggleReader() {
  applyReaderMode(!readerMode);
  // Persist user choice
  try {
    localStorage.setItem('koosha-atelier-reader', readerMode.toString());
    localStorage.setItem('koosha-atelier-reader-toggled', 'true');
  } catch {
    /* ignore */
  }
}

export function createReaderState() {
  let initialized = false;

  return {
    get() {
      return readerMode;
    },

    set(value) {
      if (!initialized) {
        initialized = true;
        initReader();
      }
      applyReaderMode(Boolean(value));
    },

    toggle() {
      if (!initialized) {
        initialized = true;
        initReader();
      }
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
