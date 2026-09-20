import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CLASS_LINE,
  CLASS_SPEED_BTN_ACTIVE,
  CLASS_STATE_PAUSED,
  CLASS_STATE_FINISHED,
  CLASS_VISUALLY_HIDDEN,
  ATTR_DATA_SRC,
  ATTR_DATA_TITLE,
  ATTR_DATA_SPEED,
  ATTR_DATA_STATE,
  SELECTOR_PLAYER,
  PLAY_GLYPH,
  PAUSE_GLYPH,
  LABEL_PLAY,
  LABEL_PAUSE,
  ANNOUNCE_PLAYING,
  ANNOUNCE_PAUSED,
  ANNOUNCE_FINISHED,
  ANNOUNCE_UNAVAILABLE,
  ID_ANNOUNCEMENTS,
  KEY_SPACE,
  KEY_ARROW_LEFT,
  KEY_ARROW_RIGHT,
  LOAD_TIMEOUT_MS,
  CELL_EM_WIDTH,
  TERMINAL_WIDTH_MIN_EM,
  TERMINAL_WIDTH_MAX_EM,
  isOutputEvent,
  splitCastFrame,
  clampElapsed,
  computeElapsedDelta,
  estimatedTerminalWidth,
  isPlaybackShortcut,
  isScrubWheel,
  wheelSeekDelta,
  initialPlayerState,
} from '../scripts/media/cast-player-helpers.js';

test('constants: stable class and attribute names', () => {
  assert.equal(CLASS_LINE, 'cast-player__line');
  assert.equal(CLASS_SPEED_BTN_ACTIVE, 'cast-player__speed-btn--active');
  assert.equal(CLASS_STATE_PAUSED, 'cast-player--paused');
  assert.equal(CLASS_STATE_FINISHED, 'cast-player--finished');
  assert.equal(ATTR_DATA_SRC, 'data-src');
  assert.equal(ATTR_DATA_TITLE, 'data-title');
  assert.equal(ATTR_DATA_SPEED, 'data-speed');
  assert.equal(SELECTOR_PLAYER, '.cast-player[data-src]');
});

test('constants: glyphs and labels', () => {
  assert.equal(PLAY_GLYPH, '\u25b6');
  assert.equal(PAUSE_GLYPH, '\u23f8');
  assert.equal(LABEL_PLAY, 'Play');
  assert.equal(LABEL_PAUSE, 'Pause');
});

test('constants: announcements and id', () => {
  assert.equal(ID_ANNOUNCEMENTS, 'announcements');
  assert.ok(ANNOUNCE_PLAYING);
  assert.ok(ANNOUNCE_PAUSED);
  assert.ok(ANNOUNCE_FINISHED);
  assert.ok(ANNOUNCE_UNAVAILABLE);
});

test('constants: timing and bounds', () => {
  assert.equal(LOAD_TIMEOUT_MS, 5000);
  assert.equal(CELL_EM_WIDTH, 0.6);
  assert.equal(TERMINAL_WIDTH_MIN_EM, 30);
  assert.equal(TERMINAL_WIDTH_MAX_EM, 90);
});

test('isOutputEvent: o and i are output, anything else is not', () => {
  assert.equal(isOutputEvent({ type: 'o', data: 'hi' }), true);
  assert.equal(isOutputEvent({ type: 'i', data: 'hi' }), true);
  assert.equal(isOutputEvent({ type: 'r', data: '' }), false);
  assert.equal(isOutputEvent({ type: 'x', data: '' }), false);
  assert.equal(isOutputEvent({}), false);
  assert.equal(isOutputEvent(null), false);
  assert.equal(isOutputEvent(undefined), false);
});

test('splitCastFrame: splits on \\n and strips \\r', () => {
  assert.deepEqual(splitCastFrame('a\nb\nc'), ['a', 'b', 'c']);
  assert.deepEqual(splitCastFrame('a\r\nb'), ['a', 'b']);
  assert.deepEqual(splitCastFrame('foo\rbar\r\nbaz'), ['foobar', 'baz']);
  assert.deepEqual(splitCastFrame(''), ['']);
  assert.deepEqual(splitCastFrame(null), []);
  assert.deepEqual(splitCastFrame(undefined), []);
  assert.deepEqual(splitCastFrame(42), []);
});

test('clampElapsed: clamps into [0, duration]', () => {
  assert.equal(clampElapsed(500, 1000), 500);
  assert.equal(clampElapsed(0, 1000), 0);
  assert.equal(clampElapsed(1000, 1000), 1000);
  assert.equal(clampElapsed(-100, 1000), 0);
  assert.equal(clampElapsed(1500, 1000), 1000);
});

test('clampElapsed: handles bad inputs', () => {
  assert.equal(clampElapsed(NaN, 1000), 0);
  assert.equal(clampElapsed('500', 1000), 0);
  assert.equal(clampElapsed(500, 0), 0);
  assert.equal(clampElapsed(500, -1), 0);
});

test('computeElapsedDelta: (timestamp - startTime) * speed', () => {
  assert.equal(computeElapsedDelta(1000, 500, 2), 1000);  // (1000-500)*2 = 1000
  assert.equal(computeElapsedDelta(1500, 500, 1), 1000);  // 1000ms
  assert.equal(computeElapsedDelta(500, 500, 1), 0);
});

test('computeElapsedDelta: defensive against bad speed/types', () => {
  assert.equal(computeElapsedDelta(1000, 500, 0), 0);
  assert.equal(computeElapsedDelta(1000, 500, -1), 0);
  assert.equal(computeElapsedDelta('1000', 500, 1), 0);
  assert.equal(computeElapsedDelta(1000, '500', 1), 0);
});

test('estimatedTerminalWidth: returns em value in range', () => {
  // 100 cols * 0.6 = 60em, between 30 and 90 → returns 60
  assert.equal(estimatedTerminalWidth(100), 60);
});

test('estimatedTerminalWidth: rejects out-of-range', () => {
  assert.equal(estimatedTerminalWidth(40), null);   // 24em, below 30
  assert.equal(estimatedTerminalWidth(200), null);  // 120em, above 90
});

test('estimatedTerminalWidth: rejects bad inputs', () => {
  assert.equal(estimatedTerminalWidth(0), null);
  assert.equal(estimatedTerminalWidth(-10), null);
  assert.equal(estimatedTerminalWidth(null), null);
  assert.equal(estimatedTerminalWidth(undefined), null);
  assert.equal(estimatedTerminalWidth('100'), null);
});

test('estimatedTerminalWidth: honors custom cellEm', () => {
  assert.equal(estimatedTerminalWidth(50, { cellEm: 1 }), 50);
  assert.equal(estimatedTerminalWidth(50, { cellEm: 0.5 }), null);  // 25em below default minEm=30
  assert.equal(estimatedTerminalWidth(50, { cellEm: 0.5, minEm: 20 }), 25);
  assert.equal(estimatedTerminalWidth(50, { cellEm: 0.5, minEm: 25 }), null);  // at boundary: <=
});

test('isPlaybackShortcut: space and arrows only', () => {
  assert.equal(isPlaybackShortcut({ key: KEY_SPACE }), true);
  assert.equal(isPlaybackShortcut({ key: KEY_ARROW_LEFT }), true);
  assert.equal(isPlaybackShortcut({ key: KEY_ARROW_RIGHT }), true);
  assert.equal(isPlaybackShortcut({ key: 'a' }), false);
  assert.equal(isPlaybackShortcut({ key: 'Enter' }), false);
  assert.equal(isPlaybackShortcut({}), false);
  assert.equal(isPlaybackShortcut(null), false);
});

test('isScrubWheel: shift + nonzero deltaY', () => {
  assert.equal(isScrubWheel({ shiftKey: true, deltaY: 100 }), true);
  assert.equal(isScrubWheel({ shiftKey: true, deltaY: -100 }), true);
  assert.equal(isScrubWheel({ shiftKey: true, deltaY: 0 }), false);
  assert.equal(isScrubWheel({ shiftKey: false, deltaY: 100 }), false);
  assert.equal(isScrubWheel({ deltaY: 100 }), false);
  assert.equal(isScrubWheel(null), false);
});

test('wheelSeekDelta: sign-preserving step', () => {
  assert.equal(wheelSeekDelta(100), 5000);  // SEEK_STEP_MS * sign
  assert.equal(wheelSeekDelta(-100), -5000);
  assert.equal(wheelSeekDelta(0), 0);
  assert.equal(wheelSeekDelta(NaN), 0);
});

test('initialPlayerState: defaults', () => {
  const s = initialPlayerState();
  assert.equal(s.playing, false);
  assert.equal(s.finished, false);
  assert.equal(s.elapsed, 0);
  assert.equal(s.eventIdx, 0);
  assert.equal(s.startTime, 0);
  assert.equal(s.rafId, null);
  assert.equal(s.speed, 1);
});

test('initialPlayerState: returns fresh object each call', () => {
  const a = initialPlayerState();
  const b = initialPlayerState();
  assert.notEqual(a, b);
  a.playing = true;
  assert.equal(b.playing, false);
});
