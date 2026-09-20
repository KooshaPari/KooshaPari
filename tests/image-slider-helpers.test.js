import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clamp,
  nextSliderPct,
  easeOutCubic,
  lerp,
  slideValue,
} from '../scripts/media/image-slider-helpers.js';

test('clamp pins values to the [min, max] range', () => {
  assert.equal(clamp(50, 0, 100), 50);
  assert.equal(clamp(-5, 0, 100), 0);
  assert.equal(clamp(150, 0, 100), 100);
  assert.equal(clamp(0, 0, 100), 0);
  assert.equal(clamp(100, 0, 100), 100);
});

test('nextSliderPct advances forward with ArrowRight and ArrowDown by the configured step', () => {
  assert.equal(nextSliderPct(50, { key: 'ArrowRight' }, { step: 2 }), 52);
  assert.equal(nextSliderPct(50, { key: 'ArrowDown' }, { step: 2 }), 52);
});

test('nextSliderPct steps backward with ArrowLeft and ArrowUp', () => {
  assert.equal(nextSliderPct(50, { key: 'ArrowLeft' }, { step: 2 }), 48);
  assert.equal(nextSliderPct(50, { key: 'ArrowUp' }, { step: 2 }), 48);
});

test('nextSliderPct uses the big step when shiftKey is held', () => {
  assert.equal(nextSliderPct(50, { key: 'ArrowRight', shiftKey: true }, { step: 2, bigStep: 10 }), 60);
  assert.equal(nextSliderPct(50, { key: 'ArrowLeft', shiftKey: true }, { step: 2, bigStep: 10 }), 40);
});

test('nextSliderPct clamps forward and backward movement to the [0, 100] range', () => {
  assert.equal(nextSliderPct(99, { key: 'ArrowRight' }, { step: 2 }), 100);
  assert.equal(nextSliderPct(99, { key: 'ArrowRight', shiftKey: true }, { step: 2, bigStep: 10 }), 100);
  assert.equal(nextSliderPct(1, { key: 'ArrowLeft' }, { step: 2 }), 0);
  assert.equal(nextSliderPct(1, { key: 'ArrowLeft', shiftKey: true }, { step: 2, bigStep: 10 }), 0);
});

test('nextSliderPct jumps to Home and End endpoints', () => {
  assert.equal(nextSliderPct(50, { key: 'Home' }), 0);
  assert.equal(nextSliderPct(50, { key: 'End' }), 100);
});

test('nextSliderPct returns null for unrecognised keys so callers can pass through', () => {
  assert.equal(nextSliderPct(50, { key: 'Enter' }), null);
  assert.equal(nextSliderPct(50, { key: 'PageUp' }), null);
  assert.equal(nextSliderPct(50, { key: ' ' }), null);
  assert.equal(nextSliderPct(50, {}), null);
});

test('nextSliderPct defaults to step=2 and bigStep=10 when no options are passed', () => {
  assert.equal(nextSliderPct(50, { key: 'ArrowRight' }), 52);
  assert.equal(nextSliderPct(50, { key: 'ArrowRight', shiftKey: true }), 60);
});

test('easeOutCubic maps [0,1] to [0,1] monotonically with the expected curve', () => {
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.ok(easeOutCubic(0.5) > 0.85, `expected fast initial movement, got ${easeOutCubic(0.5)}`);
  for (const t of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]) {
    assert.ok(easeOutCubic(t) <= 1, `eased value exceeds 1 at t=${t}`);
  }
});

test('lerp interpolates linearly between a and b', () => {
  assert.equal(lerp(0, 100, 0), 0);
  assert.equal(lerp(0, 100, 1), 100);
  assert.equal(lerp(0, 100, 0.5), 50);
  assert.equal(lerp(20, 80, 0.25), 35);
});

test('slideValue eases between from and to across the animation duration', () => {
  assert.equal(slideValue(0, 100, 0, 420), 0);
  assert.equal(slideValue(0, 100, 420, 420), 100);
  // Halfway through the duration, ease-out cubic returns 0.875 of the distance.
  const mid = slideValue(0, 100, 210, 420);
  assert.ok(Math.abs(mid - 87.5) < 0.001, `expected 87.5, got ${mid}`);
});

test('slideValue clamps to the endpoints when elapsed time exceeds the duration', () => {
  assert.equal(slideValue(10, 90, 800, 420), 90);
  assert.equal(slideValue(90, 10, 800, 420), 10);
});

test('slideValue with zero duration returns the target immediately', () => {
  assert.equal(slideValue(50, 100, 0, 0), 100);
});
