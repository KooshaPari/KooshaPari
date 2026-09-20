import test from 'node:test';
import assert from 'node:assert/strict';

import {
  STORAGE_KEY,
  TRANSITION_MS,
  THEME_VALUES,
  SUN_SVG,
  MOON_SVG,
  validateStored,
  resolveTheme,
  nextTheme,
  iconForTheme,
  ariaPressedFor,
  dataThemeAttribute,
} from '../scripts/dark-mode-helpers.js';

test('STORAGE_KEY is the documented localStorage key', () => {
  assert.equal(STORAGE_KEY, 'koosha-atelier-theme');
});

test('TRANSITION_MS is 300ms', () => {
  assert.equal(TRANSITION_MS, 300);
});

test('THEME_VALUES is [light, dark]', () => {
  assert.deepEqual(THEME_VALUES, ['light', 'dark']);
});

test('SUN_SVG and MOON_SVG are distinct 20x20 inline SVG strings', () => {
  assert.notEqual(SUN_SVG, MOON_SVG);
  assert.match(SUN_SVG, /<svg width="20"/);
  assert.match(MOON_SVG, /<svg width="20"/);
  assert.match(SUN_SVG, /aria-hidden="true"/);
  assert.match(MOON_SVG, /aria-hidden="true"/);
});

test('SUN_SVG contains the sun rays', () => {
  assert.match(SUN_SVG, /<circle cx="12" cy="12" r="5"/);
  // 8 radial lines around the center
  const rayCount = (SUN_SVG.match(/<line /g) || []).length;
  assert.equal(rayCount, 8);
});

test('MOON_SVG contains the crescent path', () => {
  assert.match(MOON_SVG, /M21 12.79/);
});

test('validateStored accepts the two valid theme strings', () => {
  assert.equal(validateStored('light'), 'light');
  assert.equal(validateStored('dark'), 'dark');
});

test('validateStored rejects anything else', () => {
  assert.equal(validateStored(null), null);
  assert.equal(validateStored(undefined), null);
  assert.equal(validateStored(''), null);
  assert.equal(validateStored('auto'), null);
  assert.equal(validateStored('DARK'), null);
  assert.equal(validateStored(123), null);
  assert.equal(validateStored({}), null);
});

test('resolveTheme returns manualOverride when it is a valid theme', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('resolveTheme falls back to system preference when no override', () => {
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme(null, false), 'light');
  assert.equal(resolveTheme(undefined, true), 'dark');
});

test('resolveTheme ignores invalid overrides', () => {
  assert.equal(resolveTheme('garbage', true), 'dark');
  assert.equal(resolveTheme('garbage', false), 'light');
});

test('nextTheme toggles between light and dark', () => {
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'light');
});

test('iconForTheme maps dark to MOON and light to SUN', () => {
  assert.equal(iconForTheme('dark'), MOON_SVG);
  assert.equal(iconForTheme('light'), SUN_SVG);
});

test('ariaPressedFor maps dark to "true" and light to "false"', () => {
  assert.equal(ariaPressedFor('dark'), 'true');
  assert.equal(ariaPressedFor('light'), 'false');
});

test('dataThemeAttribute normalises to one of light/dark', () => {
  assert.equal(dataThemeAttribute('dark'), 'dark');
  assert.equal(dataThemeAttribute('light'), 'light');
  assert.equal(dataThemeAttribute('garbage'), 'light');
});
