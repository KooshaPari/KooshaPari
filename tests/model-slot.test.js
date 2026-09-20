import test from 'node:test';
import assert from 'node:assert/strict';

import { canLoadModel } from '../scripts/media/model-slot.js';

test('canLoadModel rejects when modelUrl is missing', () => {
  assert.equal(canLoadModel({ webglAvailable: true }), false);
});

test('canLoadModel rejects when WebGL is unavailable', () => {
  assert.equal(canLoadModel({ modelUrl: '/m.glb', webglAvailable: false }), false);
});

test('canLoadModel rejects under reduced motion', () => {
  assert.equal(canLoadModel({ modelUrl: '/m.glb', webglAvailable: true, reducedMotion: true }), false);
});

test('canLoadModel accepts a model URL with WebGL and motion enabled', () => {
  assert.equal(canLoadModel({ modelUrl: '/m.glb', webglAvailable: true, reducedMotion: false }), true);
});

test('canLoadModel defaults webglAvailable and reducedMotion to false', () => {
  assert.equal(canLoadModel({ modelUrl: '/m.glb' }), false);
});

test('canLoadModel handles an empty call (no model surface at all)', () => {
  assert.equal(canLoadModel(), false);
});
