import test from 'node:test';
import assert from 'node:assert/strict';

import {
  VIEWPORT_MARGIN,
  clampValue,
  isInViewport,
  calculateTranslateY,
  transformFor,
  parseParallaxAttrs,
  REDUCED_TRANSFORM,
  DEFAULT_SPEED,
  DEFAULT_OFFSET,
  DEFAULT_CLAMP_FALLBACK,
} from '../scripts/parallax-helpers.js';

test('VIEWPORT_MARGIN is 200px', () => {
  assert.equal(VIEWPORT_MARGIN, 200);
});

test('clampValue restricts value to [-max, max]', () => {
  assert.equal(clampValue(5, 12), 5);
  assert.equal(clampValue(-5, 12), -5);
  assert.equal(clampValue(15, 12), 12);
  assert.equal(clampValue(-15, 12), -12);
});

test('isInViewport true when rect overlaps the visible band', () => {
  assert.equal(isInViewport({ top: 100, bottom: 200 }, 800), true);
});

test('isInViewport true when rect is just below the viewport within margin', () => {
  // top = 850, viewport = 800, margin = 200 -> bottom edge 50 past the end, but top is 50 past
  // condition: rect.bottom >= -margin && rect.top <= viewportHeight + margin
  // rect.bottom (1000) >= -200 ✓, rect.top (850) <= 1000 ✓
  assert.equal(isInViewport({ top: 850, bottom: 1000 }, 800), true);
});

test('isInViewport false when rect is far below the viewport', () => {
  // top = 2000, bottom = 2200 -> top > viewportHeight + margin (1000)
  assert.equal(isInViewport({ top: 2000, bottom: 2200 }, 800), false);
});

test('isInViewport true when rect is just above the viewport within margin', () => {
  // top = -100, bottom = 100 -> bottom >= -200 ✓, top <= 800 + 200 ✓
  assert.equal(isInViewport({ top: -100, bottom: 100 }, 800), true);
});

test('isInViewport false when rect is far above the viewport', () => {
  // top = -1000, bottom = -500 -> bottom < -200
  assert.equal(isInViewport({ top: -1000, bottom: -500 }, 800), false);
});

test('isInViewport accepts a custom margin', () => {
  // top = 850, bottom = 1000, viewportHeight = 800
  // margin = 50: top (850) is at the threshold (viewport + margin)
  assert.equal(isInViewport({ top: 850, bottom: 1000 }, 800, 50), true);
  // tighter margin: 49 -> top exceeds viewport + margin
  assert.equal(isInViewport({ top: 850, bottom: 1000 }, 800, 49), false);
  // larger margin: 300 -> top well within viewport + margin
  assert.equal(isInViewport({ top: 850, bottom: 1000 }, 800, 300), true);
});

test('calculateTranslateY multiplies scroll by speed and adds offset', () => {
  assert.equal(calculateTranslateY(1000, 0.3, 0, 10000), 300);
  assert.equal(calculateTranslateY(1000, 0.7, 0, 10000), 700);
  assert.equal(calculateTranslateY(1000, 1.2, 0, 10000), 1200);
});

test('calculateTranslateY applies offset after speed multiplication', () => {
  assert.equal(calculateTranslateY(0, 1, 50, 10000), 50);
  assert.equal(calculateTranslateY(100, 1, -25, 10000), 75);
});

test('calculateTranslateY clamps to [-max, max]', () => {
  assert.equal(calculateTranslateY(100000, 1, 0, 500), 500);
  assert.equal(calculateTranslateY(-100000, 1, 0, 500), -500);
});

test('transformFor formats translateY CSS', () => {
  assert.equal(transformFor(150), 'translateY(150px)');
  assert.equal(transformFor(-42), 'translateY(-42px)');
  assert.equal(transformFor(0), 'translateY(0px)');
});

test('transformFor returns null for null/undefined input', () => {
  assert.equal(transformFor(null), null);
  assert.equal(transformFor(undefined), null);
});

test('REDUCED_TRANSFORM is "none"', () => {
  assert.equal(REDUCED_TRANSFORM, 'none');
});

test('parseParallaxAttrs reads numeric strings', () => {
  assert.deepEqual(parseParallaxAttrs({ speed: '0.5', offset: '10', clamp: '800' }, 1000), {
    speed: 0.5,
    offset: 10,
    clamp: 800,
  });
});

test('parseParallaxAttrs falls back to defaults for empty values', () => {
  assert.deepEqual(parseParallaxAttrs({ speed: '', offset: null, clamp: undefined }, 1000), {
    speed: DEFAULT_SPEED,
    offset: DEFAULT_OFFSET,
    clamp: 1000,
  });
});

test('parseParallaxAttrs falls back to viewportHeight when clamp is empty', () => {
  assert.equal(parseParallaxAttrs({ speed: '0.3' }, 600).clamp, 600);
});

test('parseParallaxAttrs handles non-numeric strings by falling back to default', () => {
  // Number('abc') is NaN -> not finite -> default
  assert.deepEqual(parseParallaxAttrs({ speed: 'abc' }, 1000), {
    speed: DEFAULT_SPEED,
    offset: DEFAULT_OFFSET,
    clamp: 1000,
  });
});

test('DEFAULT_CLAMP_FALLBACK is null', () => {
  assert.equal(DEFAULT_CLAMP_FALLBACK, null);
});
