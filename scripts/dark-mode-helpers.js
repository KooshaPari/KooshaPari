/**
 * Pure helpers for the dark-mode toggle system.
 *
 * The orchestrator (dark-mode.js) is DOM-bound; this file owns:
 *
 *   - STORAGE_KEY: the localStorage key for the manual override
 *   - TRANSITION_MS: how long the theme-transitioning class stays applied
 *   - SUN_SVG, MOON_SVG: inline 20px viewBox icon strings
 *   - THEME_VALUES: the two valid themes
 *   - validateStored(value): parse raw localStorage value into a valid theme
 *     or null (pure — does not touch storage)
 *   - resolveTheme(manualOverride, systemPrefersDark): the active theme,
 *     manual override wins
 *   - nextTheme(current): toggle helper for click handlers
 *   - iconForTheme(theme): the SVG string for the toggle button
 *   - ariaPressedFor(theme): 'true' for dark, 'false' for light
 *   - dataThemeAttribute(theme): the string written to [data-theme]
 */

export const STORAGE_KEY = 'koosha-atelier-theme';
export const TRANSITION_MS = 300;
export const THEME_VALUES = ['light', 'dark'];

export const SUN_SVG = /*html*/ `<svg width="20" height="20" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true">
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1" x2="12" y2="3"/>
  <line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1" y1="12" x2="3" y2="12"/>
  <line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`;

export const MOON_SVG = /*html*/ `<svg width="20" height="20" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true">
  <path d="M21 12.79A9 9 0 1 1 11.21 3
           7 7 0 0 0 21 12.79z"/>
</svg>`;

/**
 * Parse a raw localStorage value into a valid theme, or null.
 *
 * @param {string|null|undefined} value
 * @returns {'light' | 'dark' | null}
 */
export function validateStored(value) {
  if (value === 'light' || value === 'dark') return value;
  return null;
}

/**
 * Resolve the active theme. Manual override always wins; otherwise
 * the system preference decides.
 *
 * @param {'light' | 'dark' | null} manualOverride
 * @param {boolean} systemPrefersDark
 * @returns {'light' | 'dark'}
 */
export function resolveTheme(manualOverride, systemPrefersDark) {
  if (manualOverride === 'light' || manualOverride === 'dark') return manualOverride;
  return systemPrefersDark ? 'dark' : 'light';
}

/**
 * Toggle the current theme.
 *
 * @param {'light' | 'dark'} current
 * @returns {'light' | 'dark'}
 */
export function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

/**
 * The SVG icon for the toggle button in a given theme. The button
 * shows the icon for the theme that *will be applied on click*, so
 * `iconForTheme('light')` shows MOON (clicking would switch to dark).
 *
 * @param {'light' | 'dark'} theme
 * @returns {string}
 */
export function iconForTheme(theme) {
  return theme === 'dark' ? MOON_SVG : SUN_SVG;
}

/**
 * The aria-pressed value for the toggle button in a given theme.
 * aria-pressed="true" means "dark mode is active".
 *
 * @param {'light' | 'dark'} theme
 * @returns {'true' | 'false'}
 */
export function ariaPressedFor(theme) {
  return theme === 'dark' ? 'true' : 'false';
}

/**
 * The string written to [data-theme] on the document root.
 *
 * @param {'light' | 'dark'} theme
 * @returns {'light' | 'dark'}
 */
export function dataThemeAttribute(theme) {
  return theme === 'dark' ? 'dark' : 'light';
}
