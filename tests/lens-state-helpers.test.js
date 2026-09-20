import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LENSES,
  LENS_SET,
  DEFAULT_LENS,
  LENS_STORAGE_KEY,
  LENS_PROMPT_KEY,
  isValidLens,
  resolveInitialLens,
} from '../scripts/lens-state-helpers.js';

test('LENSES: frozen array of valid lens identifiers', () => {
  assert.ok(Array.isArray(LENSES));
  assert.equal(Object.isFrozen(LENSES), true);
  assert.deepEqual([...LENSES], ['engineering', 'product']);
});

test('LENS_SET: lookup set contains LENSES', () => {
  for (const lens of LENSES) assert.equal(LENS_SET.has(lens), true);
  assert.equal(LENS_SET.size, LENSES.length);
});

test('DEFAULT_LENS: engineering', () => {
  assert.equal(DEFAULT_LENS, 'engineering');
});

test('storage keys: stable', () => {
  assert.equal(LENS_STORAGE_KEY, 'koosha-atelier-lens');
  assert.equal(LENS_PROMPT_KEY, 'koosha-atelier-lens-prompted');
});

test('isValidLens: known identifiers', () => {
  assert.equal(isValidLens('engineering'), true);
  assert.equal(isValidLens('product'), true);
});

test('isValidLens: rejects unknown and empty', () => {
  assert.equal(isValidLens('design'), false);
  assert.equal(isValidLens(''), false);
  assert.equal(isValidLens(null), false);
  assert.equal(isValidLens(undefined), false);
  assert.equal(isValidLens(42), false);
  assert.equal(isValidLens({}), false);
});

test('resolveInitialLens: defaults to engineering', () => {
  assert.equal(resolveInitialLens(), 'engineering');
  assert.equal(resolveInitialLens({}), 'engineering');
});

test('resolveInitialLens: URL beats storage', () => {
  assert.equal(
    resolveInitialLens({ urlSearch: '?lens=product', storedValue: 'engineering' }),
    'product',
  );
});

test('resolveInitialLens: storage beats default', () => {
  assert.equal(
    resolveInitialLens({ storedValue: 'product', defaultValue: 'engineering' }),
    'product',
  );
});

test('resolveInitialLens: invalid URL falls through to storage', () => {
  assert.equal(
    resolveInitialLens({ urlSearch: '?lens=design', storedValue: 'product' }),
    'product',
  );
});

test('resolveInitialLens: invalid URL with no storage returns default', () => {
  assert.equal(
    resolveInitialLens({ urlSearch: '?lens=design', storedValue: null }),
    'engineering',
  );
});

test('resolveInitialLens: invalid storage falls through to default', () => {
  assert.equal(
    resolveInitialLens({ storedValue: 'design' }),
    'engineering',
  );
});

test('resolveInitialLens: accepts URL search with leading ?', () => {
  assert.equal(resolveInitialLens({ urlSearch: '?lens=product' }), 'product');
});

test('resolveInitialLens: accepts URL search without leading ?', () => {
  assert.equal(resolveInitialLens({ urlSearch: 'lens=product' }), 'product');
});

test('resolveInitialLens: tolerates other query params', () => {
  assert.equal(
    resolveInitialLens({ urlSearch: '?foo=bar&lens=product&baz=qux' }),
    'product',
  );
});

test('resolveInitialLens: empty string urlSearch behaves as no URL', () => {
  assert.equal(resolveInitialLens({ urlSearch: '' }), 'engineering');
});

test('resolveInitialLens: non-string urlSearch is ignored', () => {
  assert.equal(resolveInitialLens({ urlSearch: 42 }), 'engineering');
});

test('resolveInitialLens: custom defaultValue', () => {
  assert.equal(
    resolveInitialLens({ defaultValue: 'product' }),
    'product',
  );
});
