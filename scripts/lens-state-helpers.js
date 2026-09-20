// Pure helpers for the Lens state machine.
// Side effects (localStorage reads/writes, subscriber fanout) live in
// scripts/lens-state.js; this file is testable in isolation.

/** All valid lens identifiers. */
export const LENSES = Object.freeze(['engineering', 'product']);

/** Frozen lookup set. Use has() to validate lens identifiers. */
export const LENS_SET = new Set(LENSES);

/** Default lens for first-time visitors. */
export const DEFAULT_LENS = 'engineering';

export const LENS_STORAGE_KEY = 'koosha-atelier-lens';
export const LENS_PROMPT_KEY = 'koosha-atelier-lens-prompted';

/** True when the value is a known lens identifier. */
export function isValidLens(value) {
  return LENS_SET.has(value);
}

/**
 * Resolve the initial lens.
 * Priority: URL ?lens= > localStorage > defaultValue.
 * Invalid stored/URL values are silently ignored.
 */
export function resolveInitialLens({
  urlSearch = '',
  storedValue = null,
  defaultValue = DEFAULT_LENS,
} = {}) {
  // 1. URL ?lens=
  if (typeof urlSearch === 'string' && urlSearch.length > 0) {
    try {
      const params = new URLSearchParams(urlSearch.startsWith('?') ? urlSearch.slice(1) : urlSearch);
      const urlLens = params.get('lens');
      if (isValidLens(urlLens)) return urlLens;
    } catch {
      /* malformed search string */
    }
  }

  // 2. localStorage
  if (isValidLens(storedValue)) return storedValue;

  // 3. Default
  return defaultValue;
}
