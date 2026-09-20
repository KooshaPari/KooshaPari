import test from 'node:test';
import assert from 'node:assert/strict';

import { supportsLayeredMotion } from '../scripts/media/layered-image.js';

test('supportsLayeredMotion rejects reduced motion', () => {
  assert.equal(supportsLayeredMotion({ reducedMotion: true }), false);
});

test('supportsLayeredMotion rejects coarse pointer (touch)', () => {
  assert.equal(supportsLayeredMotion({ coarsePointer: true }), false);
});

test('supportsLayeredMotion defaults both flags to false and so accepts by default', () => {
  assert.equal(supportsLayeredMotion({}), true);
});

test('supportsLayeredMotion accepts when both are false', () => {
  assert.equal(supportsLayeredMotion({ reducedMotion: false, coarsePointer: false }), true);
});

test('supportsLayeredMotion handles an empty call', () => {
  assert.equal(supportsLayeredMotion(), true);
});
