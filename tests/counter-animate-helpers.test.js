import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_DURATION,
  easingOut,
  parseMetricText,
  formatNumber,
  counterFrameText,
} from '../scripts/counter-animate-helpers.js';

test('DEFAULT_DURATION is 1200ms', () => {
  assert.equal(DEFAULT_DURATION, 1200);
});

test('easingOut is cubic ease-out', () => {
  assert.equal(easingOut(0), 0);
  assert.equal(easingOut(1), 1);
  // mid-curve: 1 - (1-0.5)^3 = 1 - 0.125 = 0.875
  assert.equal(easingOut(0.5), 0.875);
  // Ease-out: moves fast early, slows at the end.
  // t=0.25 -> eased=0.578 (rapid early progress)
  assert(easingOut(0.25) > 0.25);
  // t=0.75 -> eased=0.984 (almost done)
  assert(easingOut(0.75) > 0.75);
  // The curve is monotonically non-decreasing.
  assert(easingOut(0.5) > easingOut(0.25));
  assert(easingOut(0.75) > easingOut(0.5));
});

test('easingOut respects domain endpoints', () => {
  assert(easingOut(0) >= 0 && easingOut(0) <= 1);
  assert(easingOut(1) >= 0 && easingOut(1) <= 1);
});

test('parseMetricText parses a plain integer', () => {
  assert.deepEqual(parseMetricText('101'), {
    value: 101,
    prefix: '',
    suffix: '',
    format: 'integer',
  });
});

test('parseMetricText parses a comma-separated integer', () => {
  assert.deepEqual(parseMetricText('4,900'), {
    value: 4900,
    prefix: '',
    suffix: '',
    format: 'comma',
  });
});

test('parseMetricText captures a leading prefix', () => {
  assert.deepEqual(parseMetricText('~$432'), {
    value: 432,
    prefix: '~$',
    suffix: '',
    format: 'integer',
  });
});

test('parseMetricText captures a trailing suffix', () => {
  assert.deepEqual(parseMetricText('432K'), {
    value: 432,
    prefix: '',
    suffix: 'K',
    format: 'integer',
  });
});

test('parseMetricText combines prefix + suffix', () => {
  assert.deepEqual(parseMetricText('~$432K'), {
    value: 432,
    prefix: '~$',
    suffix: 'K',
    format: 'integer',
  });
});

test('parseMetricText captures prefix-as-suffix for labeled units', () => {
  assert.deepEqual(parseMetricText('28 days'), {
    value: 28,
    prefix: '',
    suffix: ' days',
    format: 'integer',
  });
});

test('parseMetricText detects decimal numbers', () => {
  assert.deepEqual(parseMetricText('1.5x'), {
    value: 1.5,
    prefix: '',
    suffix: 'x',
    format: 'decimal',
  });
});

test('parseMetricText handles the tilde prefix alone', () => {
  assert.deepEqual(parseMetricText('~4,900'), {
    value: 4900,
    prefix: '~',
    suffix: '',
    format: 'comma',
  });
});

test('parseMetricText trims whitespace', () => {
  assert.deepEqual(parseMetricText('  4,200  ').value, 4200);
});

test('parseMetricText returns the none shape for non-matches', () => {
  assert.deepEqual(parseMetricText('hello'), {
    value: 0,
    prefix: '',
    suffix: '',
    format: 'none',
  });
});

test('formatNumber uses commas for the comma format', () => {
  assert.equal(formatNumber(4900, 'comma'), '4,900');
  assert.equal(formatNumber(1234567, 'comma'), '1,234,567');
});

test('formatNumber uses one decimal place for the decimal format', () => {
  assert.equal(formatNumber(1.234, 'decimal'), '1.2');
  assert.equal(formatNumber(1.456, 'decimal'), '1.5');
  // Mid-animation ticks still show 1 decimal
  assert.equal(formatNumber(0, 'decimal'), '0.0');
});

test('formatNumber rounds integers to nearest whole', () => {
  assert.equal(formatNumber(99.6, 'integer'), '100');
  assert.equal(formatNumber(99.4, 'integer'), '99');
});

test('formatNumber treats integer and none the same', () => {
  assert.equal(formatNumber(123, 'integer'), '123');
  assert.equal(formatNumber(123, 'none'), '123');
});

test('counterFrameText composes prefix + formatted + suffix', () => {
  const parsed = parseMetricText('~$432K');
  // progress 1.0 -> full target
  assert.equal(counterFrameText(parsed, 1), '~$432K');
});

test('counterFrameText at 0 progress is zero-filled', () => {
  const parsed = parseMetricText('4,900');
  assert.equal(counterFrameText(parsed, 0), '0');
});

test('counterFrameText at 0.5 progress round-trips with eased value', () => {
  const parsed = parseMetricText('100');
  // value=100, format=integer, eased=0.5 -> current = 50
  assert.equal(counterFrameText(parsed, 0.5), '50');
});

test('counterFrameText preserves decimal format mid-animation', () => {
  const parsed = parseMetricText('1.5x');
  // current = 1.5 * eased
  assert.equal(counterFrameText(parsed, 0), '0.0x');
  assert.equal(counterFrameText(parsed, 1), '1.5x');
});

test('counterFrameText with comma format renders thousands separators', () => {
  const parsed = parseMetricText('4,200');
  // eased = 0.5 -> current = 2100
  assert.equal(counterFrameText(parsed, 0.5), '2,100');
});
