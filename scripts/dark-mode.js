/**
 * dark-mode.js — Phenotype dark mode toggle with system preference detection.
 *
 * ============================================================
 * REQUIRED CSS ADDITIONS (to be added in styles/tokens.css)
 * ============================================================
 *
 * [data-theme="dark"] {
 *   --surface: var(--graphite-950);
 *   --ink: var(--paper-100);
 *   --surface-raised: var(--graphite-900);
 *   --ink-muted: var(--concrete-500);
 *   --rule: color-mix(in oklch, var(--paper-100) 24%, transparent);
 *   --precision-rule: color-mix(in oklch, var(--paper-100) 18%, transparent);
 *   --precision-rule-strong: color-mix(in oklch, var(--paper-100) 36%, transparent);
 *   --shadow-card: 0 1px 0 var(--precision-rule);
 *   --shadow-specimen: 0.65rem 0.65rem 0 color-mix(in oklch, var(--paper-100) 14%, transparent);
 *   --surface-inset: var(--graphite-900);
 *   color-scheme: dark;
 * }
 *
 * Accent colors (teal, olive, arch) stay unchanged.
 *
 * Also add to tokens.css:
 *
 * .theme-transitioning,
 * .theme-transitioning *,
 * .theme-transitioning *::before,
 * .theme-transitioning *::after {
 *   transition: background-color 0.3s, color 0.3s, border-color 0.3s !important;
 * }
 *
 * ============================================================
 */

import {
  STORAGE_KEY,
  TRANSITION_MS,
  validateStored,
  resolveTheme,
  nextTheme,
  iconForTheme,
  ariaPressedFor,
  dataThemeAttribute,
} from './dark-mode-helpers.js';

/** @type {'light' | 'dark' | null} Manual override (null = follow system). */
let manualOverride = null;

/** @type {(() => void) | null} Cleanup for OS listener. */
let cleanupListener = null;

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

function readStored() {
  try {
    return validateStored(localStorage.getItem(STORAGE_KEY));
  } catch { /* SSR / private-browsing */ }
  return null;
}

function systemPreference() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function activeTheme() {
  return resolveTheme(manualOverride, systemPreference());
}

function applyToDOM(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', dataThemeAttribute(theme));

  // Smooth transition — add class, remove after TRANSITION_MS
  root.classList.add('theme-transitioning');
  setTimeout(() => root.classList.remove('theme-transitioning'), TRANSITION_MS);
}

function persist(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch { /* ignore */ }
}

function updateButton(btn, theme) {
  if (!btn) return;
  btn.setAttribute('aria-pressed', ariaPressedFor(theme));
  btn.innerHTML = iconForTheme(theme);
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Initialise the dark mode system.
 *
 * @param {object} [opts]
 * @param {HTMLElement} [opts.toolbar] — Container where the toggle button
 *   will be prepended (typically `.atelier-tools`).
 * @param {HTMLElement} [opts.insertBefore] — Insert toggle before this node
 *   inside the toolbar. Falls back to prepending.
 * @returns {{ toggle: HTMLButtonElement }} The toggle button element.
 */
export function initDarkMode({ toolbar, insertBefore } = {}) {
  // 1. Restore stored preference
  manualOverride = readStored();

  // 2. Apply initial theme before first paint (attribute must exist early)
  const initial = activeTheme();
  document.documentElement.setAttribute('data-theme', dataThemeAttribute(initial));

  // 3. Build toggle button
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dark-mode-toggle';
  btn.setAttribute('aria-label', 'Toggle dark mode');
  btn.setAttribute('aria-pressed', ariaPressedFor(initial));
  btn.innerHTML = iconForTheme(initial);

  btn.addEventListener('click', () => {
    const next = nextTheme(activeTheme());
    setTheme(next);
  });

  // 4. Insert into toolbar if provided
  if (toolbar) {
    if (insertBefore && insertBefore.parentNode === toolbar) {
      toolbar.insertBefore(btn, insertBefore);
    } else {
      toolbar.prepend(btn);
    }
  }

  // 5. Listen for OS preference changes (only when no manual override)
  if (typeof window !== 'undefined') {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (manualOverride !== null) return; // user chose explicitly
      const next = e.matches ? 'dark' : 'light';
      applyToDOM(next);
      updateButton(btn, next);
    };
    mql.addEventListener('change', handler);
    cleanupListener = () => mql.removeEventListener('change', handler);
  }

  return { toggle: btn };
}

/**
 * Set the theme explicitly.
 * @param {'light' | 'dark'} theme
 */
export function setTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') return;
  manualOverride = theme;
  persist(theme);
  applyToDOM(theme);

  const btn = document.querySelector('.dark-mode-toggle');
  updateButton(btn, theme);
}

/**
 * Get the currently active theme.
 * @returns {'light' | 'dark'}
 */
export function getTheme() {
  return activeTheme();
}
