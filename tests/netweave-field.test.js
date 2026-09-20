import test from 'node:test';
import assert from 'node:assert/strict';

import { createNetWeaveFrame } from '../scripts/media/netweave-field.js';

test('createNetWeaveFrame produces exactly `count` vehicle entries', () => {
  const frame = createNetWeaveFrame(1, 12);
  assert.equal(frame.length, 12);
});

test('createNetWeaveFrame assigns deterministic ids starting at 0', () => {
  const frame = createNetWeaveFrame(1, 6);
  frame.forEach((entry, index) => assert.equal(entry.id, index));
});

test('createNetWeaveFrame coordinates fall within [0, 100]', () => {
  const frame = createNetWeaveFrame(42, 50);
  frame.forEach((entry) => {
    assert.ok(entry.x >= 0 && entry.x <= 100, `x=${entry.x} out of range`);
    assert.ok(entry.y >= 0 && entry.y <= 100, `y=${entry.y} out of range`);
  });
});

test('createNetWeaveFrame congestion is 0..3 (lanes)', () => {
  const frame = createNetWeaveFrame(7, 30);
  frame.forEach((entry) => assert.ok(entry.congestion >= 0 && entry.congestion <= 3));
});

test('createNetWeaveFrame is deterministic for the same seed', () => {
  const a = createNetWeaveFrame(99, 8);
  const b = createNetWeaveFrame(99, 8);
  assert.deepEqual(a, b);
});

test('createNetWeaveFrame with different seeds diverges', () => {
  const a = createNetWeaveFrame(1, 8);
  const b = createNetWeaveFrame(2, 8);
  assert.notDeepEqual(a, b);
});

test('createNetWeaveFrame coerces float seeds to uint32', () => {
  // 1.5 | 0 === 1 — same as seed=1
  const a = createNetWeaveFrame(1.5, 4);
  const b = createNetWeaveFrame(1, 4);
  assert.deepEqual(a, b);
});

test('createNetWeaveFrame seed=0 advances past the constant; not stuck at zero', () => {
  const frame = createNetWeaveFrame(0, 4);
  const totalZeros = frame.reduce((acc, e) => acc + (e.x === 0 ? 1 : 0) + (e.y === 0 ? 1 : 0), 0);
  assert.ok(totalZeros < 8, 'PRNG should not emit mostly-zero coordinates');
});
