import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SELECTOR,
  DEFAULT_DISTANCE,
  VALID_REVEALS,
  DEFAULT_OPTIONS,
  REVEAL_DISTANCE_CSS_VAR,
  parseRevealDistance,
  parseRevealDelay,
  distanceCssVar,
  delayStyle,
  hasRevealAttribute,
  safeInteger,
} from '../scripts/scroll-reveal-helpers.js';

test('SELECTOR is [data-reveal]', () => {
  assert.equal(SELECTOR, '[data-reveal]');
});

test('DEFAULT_DISTANCE is 24', () => {
  assert.equal(DEFAULT_DISTANCE, 24);
});

test('VALID_REVEALS contains the documented variants', () => {
  for (const v of ['left', 'right', 'up', 'down', 'fade', 'scale', 'rotate']) {
    assert.equal(VALID_REVEALS.has(v), true);
  }
});

test('DEFAULT_OPTIONS documents threshold + rootMargin', () => {
  assert.equal(DEFAULT_OPTIONS.threshold, 0.1);
  assert.equal(DEFAULT_OPTIONS.rootMargin, '0px 0px -40px 0px');
});

test('REVEAL_DISTANCE_CSS_VAR is --reveal-distance', () => {
  assert.equal(REVEAL_DISTANCE_CSS_VAR, '--reveal-distance');
});

test('parseRevealDistance parses positive integer values', () => {
  assert.equal(parseRevealDistance({ revealDistance: '48' }), 48);
  assert.equal(parseRevealDistance({ revealDistance: '12' }), 12);
});

test('parseRevealDistance falls back to DEFAULT_DISTANCE for missing/invalid input', () => {
  assert.equal(parseRevealDistance({}), DEFAULT_DISTANCE);
  assert.equal(parseRevealDistance({ revealDistance: '' }), DEFAULT_DISTANCE);
  assert.equal(parseRevealDistance({ revealDistance: 'abc' }), DEFAULT_DISTANCE);
  assert.equal(parseRevealDistance({ revealDistance: '0' }), DEFAULT_DISTANCE);
  assert.equal(parseRevealDistance({ revealDistance: '-5' }), DEFAULT_DISTANCE);
  assert.equal(parseRevealDistance(null), DEFAULT_DISTANCE);
});

test('parseRevealDelay parses positive integer values', () => {
  assert.equal(parseRevealDelay({ revealDelay: '200' }), 200);
  assert.equal(parseRevealDelay({ revealDelay: '0' }), null);
  assert.equal(parseRevealDelay({ revealDelay: '-50' }), null);
});

test('parseRevealDelay returns null for missing/invalid input', () => {
  assert.equal(parseRevealDelay({}), null);
  assert.equal(parseRevealDelay({ revealDelay: 'abc' }), null);
  assert.equal(parseRevealDelay({ revealDelay: '' }), null);
  assert.equal(parseRevealDelay(null), null);
});

test('distanceCssVar returns null at the default', () => {
  assert.equal(distanceCssVar(DEFAULT_DISTANCE), null);
});

test('distanceCssVar returns px string otherwise', () => {
  assert.equal(distanceCssVar(48), '48px');
  // distance 0 is finite and != DEFAULT_DISTANCE, so it produces '0px'.
  // CSS treats 0px as a no-op but the helper is mechanical.
  assert.equal(distanceCssVar(0), '0px');
  // Negative distances are still finite -> raw px string is produced.
  // The orchestrator is responsible for upstream validation.
  assert.equal(distanceCssVar(-5), '-5px');
  // Non-finite values return null.
  assert.equal(distanceCssVar(NaN), null);
});

test('delayStyle formats ms string with positive values', () => {
  assert.equal(delayStyle(200), '200ms');
  assert.equal(delayStyle(1), '1ms');
});

test('delayStyle returns null when no override is needed', () => {
  assert.equal(delayStyle(null), null);
  assert.equal(delayStyle(undefined), null);
  assert.equal(delayStyle(0), null);
  assert.equal(delayStyle(-10), null);
});

test('hasRevealAttribute detects the data-reveal attribute', () => {
  assert.equal(hasRevealAttribute({ reveal: 'up' }), true);
  assert.equal(hasRevealAttribute({ reveal: '' }), true);
  assert.equal(hasRevealAttribute({}), false);
  assert.equal(hasRevealAttribute(null), false);
});

test('safeInteger returns non-negative integers, NaN -> 0', () => {
  assert.equal(safeInteger(5), 5);
  assert.equal(safeInteger('5'), 5);
  assert.equal(safeInteger(0), 0);
  assert.equal(safeInteger(-3), 0);
  assert.equal(safeInteger('abc'), 0);
  assert.equal(safeInteger(null), 0);
  assert.equal(safeInteger(undefined), 0);
});

test('safeInteger preserves large positive values', () => {
  assert.equal(safeInteger(9999), 9999);
  assert.equal(safeInteger('12000'), 12000);
});
