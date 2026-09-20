import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCastTimeline,
  formatClock,
  formatPosition,
  indexAt,
  parseCast,
  SEEK_PAGE_MS,
  SEEK_STEP_MS,
  SPEED_LADDER,
  timelineDuration,
} from '../scripts/media/cast-timeline.js';

const CAST_FIXTURE = [
  JSON.stringify({ version: 2, term: { cols: 80, rows: 24 }, title: 'demo' }),
  JSON.stringify([0.5, 'o', 'hello']),
  JSON.stringify([0.25, 'o', ' world']),
  JSON.stringify([1.25, 'o', '\r\n$ ']),
].join('\n');

test('parseCast reads the header and keeps typed events in order', () => {
  const { header, events } = parseCast(CAST_FIXTURE);

  assert.equal(header.version, 2);
  assert.equal(header.term.cols, 80);
  assert.equal(events.length, 3);
  assert.deepEqual(events[0], { dt: 0.5, type: 'o', data: 'hello' });
  assert.equal(events[2].data, '\r\n$ ');
});

test('parseCast tolerates blank lines and skips malformed rows', () => {
  const raw = [
    JSON.stringify({ version: 2 }),
    '',
    JSON.stringify([0.1, 'o', 'kept']),
    '{"not":"an event"}',
    JSON.stringify([0.1]),
    JSON.stringify([0.2, 'o', 'also kept']),
  ].join('\n');

  const { events } = parseCast(raw);
  assert.deepEqual(events.map((e) => e.data), ['kept', 'also kept']);
});

test('parseCast rejects an empty file instead of yielding a null header', () => {
  assert.throws(() => parseCast('   \n  \n'), /empty cast file/);
});

test('buildCastTimeline converts relative offsets into absolute seconds', () => {
  const { events } = parseCast(CAST_FIXTURE);
  const timeline = buildCastTimeline(events);

  assert.deepEqual(timeline.map((e) => e.time), [0.5, 0.75, 2]);
  assert.equal(timelineDuration(timeline), 2000);
});

test('timelineDuration is zero for an empty timeline', () => {
  assert.equal(timelineDuration([]), 0);
  assert.equal(timelineDuration(buildCastTimeline([])), 0);
});

test('indexAt finds how many events are due at a given time', () => {
  const timeline = buildCastTimeline(parseCast(CAST_FIXTURE).events);

  assert.equal(indexAt(timeline, 0), 0);
  assert.equal(indexAt(timeline, 500), 1, 'inclusive of the exact event time');
  assert.equal(indexAt(timeline, 499), 0);
  assert.equal(indexAt(timeline, 750), 2);
  assert.equal(indexAt(timeline, 5000), 3, 'past the end returns the full length');
});

test('indexAt agrees with a linear scan across the whole timeline', () => {
  const timeline = buildCastTimeline(parseCast(CAST_FIXTURE).events);
  const linear = (ms) => timeline.filter((e) => e.time * 1000 <= ms).length;

  for (let ms = 0; ms <= 2500; ms += 25) {
    assert.equal(indexAt(timeline, ms), linear(ms), `mismatch at ${ms}ms`);
  }
});

test('formatClock renders m:ss and rolls over to h:mm:ss', () => {
  assert.equal(formatClock(0), '0:00');
  assert.equal(formatClock(1000), '0:01');
  assert.equal(formatClock(59000), '0:59');
  assert.equal(formatClock(60000), '1:00');
  assert.equal(formatClock(61500), '1:01');
  assert.equal(formatClock(3599000), '59:59');
  assert.equal(formatClock(3600000), '1:00:00');
  assert.equal(formatClock(-500), '0:00', 'negative input clamps to zero');
});

test('formatPosition matches the APG aria-valuetext shape', () => {
  assert.equal(formatPosition(12000, 64000), '0:12 of 1:04');
});

test('the speed ladder is sorted and includes normal speed', () => {
  assert.deepEqual([...SPEED_LADDER].sort((a, b) => a - b), SPEED_LADDER);
  assert.ok(SPEED_LADDER.includes(1));
  assert.ok(SEEK_STEP_MS > 0);
  assert.ok(SEEK_PAGE_MS > SEEK_STEP_MS, 'page seek must be the coarser step');
});
