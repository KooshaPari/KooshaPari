import test from 'node:test';
import assert from 'node:assert/strict';

import { createLensState } from '../scripts/lens-state.js';

test('lens state accepts engineering and product values', () => {
  const state = createLensState('engineering');
  const values = [];
  const unsubscribe = state.subscribe((value) => values.push(value));

  assert.equal(state.get(), 'engineering');
  assert.equal(state.set('product'), true);
  assert.equal(state.get(), 'product');
  assert.deepEqual(values, ['product']);

  unsubscribe();
  state.set('engineering');
  assert.deepEqual(values, ['product']);
});

test('lens state rejects unsupported values without notifying', () => {
  const state = createLensState('not-a-lens');
  const values = [];
  state.subscribe((value) => values.push(value));

  assert.equal(state.get(), 'engineering');
  assert.equal(state.set('not-a-lens'), false);
  assert.equal(state.get(), 'engineering');
  assert.deepEqual(values, []);
});
