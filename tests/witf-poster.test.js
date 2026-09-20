import test from 'node:test';
import assert from 'node:assert/strict';

import {
  POSTER_SRC,
  POSTER_ALT,
  GLB_PATH,
  VIEWER_GATE_MARGIN,
  THREE_LOAD_TIMEOUT_MS,
} from '../scripts/media/witf-poster.js';

test('WITF poster constants point at the served WebP / GLB assets', () => {
  assert.match(POSTER_SRC, /^\/public\/projects\/witf\/.+\.webp$/);
  assert.match(GLB_PATH, /^\/public\/projects\/witf\/.+\.glb$/);
});

test('WITF poster alt text describes the keyboard render', () => {
  assert.match(POSTER_ALT, /WITF/i);
  assert.match(POSTER_ALT, /Alice/i);
});

test('VIEWER_GATE_MARGIN is a length-value string usable for IntersectionObserver rootMargin', () => {
  assert.match(VIEWER_GATE_MARGIN, /^\d+(?:\.\d+)?(?:px|%)$/);
});

test('THREE_LOAD_TIMEOUT_MS is a positive integer between 1s and 60s', () => {
  assert.equal(Number.isInteger(THREE_LOAD_TIMEOUT_MS), true);
  assert.ok(THREE_LOAD_TIMEOUT_MS >= 1000);
  assert.ok(THREE_LOAD_TIMEOUT_MS <= 60000);
});
