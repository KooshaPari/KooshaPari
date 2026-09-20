import {
  LENSES,
  LENS_SET,
  DEFAULT_LENS,
  LENS_STORAGE_KEY,
  LENS_PROMPT_KEY,
  isValidLens,
  resolveInitialLens,
} from './lens-state-helpers.js';

function readUrlSearch() {
  try {
    return window.location.search;
  } catch {
    return '';
  }
}

function readStoredLens() {
  try {
    return localStorage.getItem(LENS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function initialLens() {
  if (typeof window === 'undefined') return DEFAULT_LENS;
  return resolveInitialLens({
    urlSearch: readUrlSearch(),
    storedValue: readStoredLens(),
  });
}

export function createLensState(initial) {
  let current = isValidLens(initial) ? initial : initialLens();
  const subscribers = new Set();

  function persist(value) {
    try {
      localStorage.setItem(LENS_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  if (isValidLens(initial)) persist(current);

  return {
    get() {
      return current;
    },

    set(next) {
      if (!isValidLens(next)) return false;
      if (next === current) return true;

      current = next;
      persist(next);

      for (const subscriber of subscribers) subscriber(current);
      return true;
    },

    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },

    /**
     * Returns true if this is a first-time visitor (no lens prompt seen yet).
     * Marks as prompted after call.
     */
    isFirstVisit() {
      try {
        return !localStorage.getItem(LENS_PROMPT_KEY);
      } catch {
        return false;
      }
    },

    markPrompted() {
      try {
        localStorage.setItem(LENS_PROMPT_KEY, '1');
      } catch {
        /* ignore */
      }
    },
  };
}
