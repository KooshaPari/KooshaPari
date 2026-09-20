import test from 'node:test';
import assert from 'node:assert/strict';

import { formatYear, formatYearRange } from '../scripts/views/resume-helpers.js';

test('formatYear returns the year portion of a YYYY-MM string', () => {
  assert.equal(formatYear('2024-08'), '2024');
  assert.equal(formatYear('1999-12'), '1999');
});

test('formatYear renders the literal "Present" for the magic keyword', () => {
  assert.equal(formatYear('present'), 'Present');
});

test('formatYear renders "Present" for missing input', () => {
  assert.equal(formatYear(''), 'Present');
  assert.equal(formatYear(null), 'Present');
  assert.equal(formatYear(undefined), 'Present');
});

test('formatYear works on date strings without dashes (passes through)', () => {
  // Defensive: the helper does not crash; it just splits on '-' and takes the first segment.
  assert.equal(formatYear('2024'), '2024');
});

test('formatYearRange builds an en-dash separated string with both years', () => {
  assert.equal(formatYearRange('2020-04', '2022-11'), '2020 \u2013 2022');
});

test('formatYearRange renders "Present" when end is "present"', () => {
  assert.equal(formatYearRange('2024-08', 'present'), '2024 \u2013 Present');
});

test('formatYearRange handles both-end missing gracefully', () => {
  assert.equal(formatYearRange(undefined, undefined), 'Present \u2013 Present');
});
