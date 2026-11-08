import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCastLines, stripAnsi, createCastReplay } from '../scripts/media/cast-replay.js';

// --- stripAnsi tests ---

test('stripAnsi removes ANSI CSI sequences', () => {
  assert.equal(stripAnsi('\x1b[31mhello\x1b[0m'), 'hello');
  assert.equal(stripAnsi('no escapes here'), 'no escapes here');
  assert.equal(stripAnsi(''), '');
  assert.equal(stripAnsi(null), '');
});

test('stripAnsi removes OSC and charset sequences', () => {
  assert.equal(stripAnsi('before\x1b]0;title\x07after'), 'beforeafter');
  assert.equal(stripAnsi('A\x1b(BB'), 'AB');
});

test('stripAnsi handles 50KB payload with mixed ANSI without hanging', () => {
  const chunk = '\x1b[32mabc\x1b[0m\x1b]0;title\x07';
  const repeats = Math.ceil(50000 / chunk.length);
  const payload = chunk.repeat(repeats);
  const start = Date.now();
  const result = stripAnsi(payload);
  const elapsed = Date.now() - start;
  assert.equal(result.length, repeats * 3);
  assert.ok(elapsed < 500, `50KB ANSI strip took ${elapsed}ms, expected <500`);
});

// --- parseCastLines tests ---

test('parseCastLines parses valid asciinema v2 with output frames', () => {
  const raw = [
    '{"version":3,"term":{"cols":80,"rows":24},"title":"test"}',
    '[1.0,"o","hello "]',
    '[0.5,"o","world"]',
    '[0.0,"x","0"]',
  ].join('\n');
  const result = parseCastLines(raw);
  assert.ok(result.header);
  assert.equal(result.header.version, 3);
  assert.equal(result.frames.length, 3);
  assert.equal(result.frames[0].delay, 1.0);
  assert.equal(result.frames[0].type, 'o');
  assert.equal(result.frames[0].payload, 'hello ');
  assert.equal(result.frames[1].payload, 'world');
  assert.equal(result.frames[2].type, 'x');
  assert.ok(result.totalDuration > 1.4);
  assert.equal(result.error, null);
});

test('parseCastLines returns empty result for empty input', () => {
  const result = parseCastLines('');
  assert.equal(result.frames.length, 0);
  assert.equal(result.header, null);
  assert.ok(result.error);
});

test('parseCastLines reports error for malformed JSON and continues parsing', () => {
  const raw = [
    '{"version":3}',
    'NOT_JSON',
    '[0.1,"o","ok"]',
  ].join('\n');
  const result = parseCastLines(raw);
  assert.ok(result.error);
  assert.match(result.error, /line 2/);
  assert.equal(result.frames.length, 1);
  assert.equal(result.frames[0].payload, 'ok');
});

test('parseCastLines skips non-array event lines', () => {
  const raw = [
    '{"version":3}',
    '{"weird":"object"}',
    '["not","enough","items"]',
    '[0.1,"o","text"]',
  ].join('\n');
  const result = parseCastLines(raw);
  assert.equal(result.frames.length, 1);
});

test('parseCastLines calculates correct total duration', () => {
  const raw = [
    '{"version":3}',
    '[1.5,"o","a"]',
    '[2.0,"o","b"]',
    '[0.5,"o","c"]',
  ].join('\n');
  const result = parseCastLines(raw);
  assert.equal(result.totalDuration, 4.0);
});

// --- createCastReplay tests ---

test('createCastReplay returns no-op for empty frames', () => {
  const replay = createCastReplay([]);
  assert.equal(replay.play(), false);
  assert.equal(replay.getCurrentText(), '');
  assert.equal(replay.getPlaying(), false);
});

test('createCastReplay respects reduced motion (0 delay, synchronous)', () => {
  const frames = [
    { delay: 0, type: 'o', payload: 'hello' },
    { delay: 0, type: 'o', payload: ' world' },
  ];
  const replay = createCastReplay(frames, { reducedMotion: true });
  replay.play();
  // All 0-delay frames are batched and emitted synchronously in reduced-motion mode.
  assert.equal(replay.getPlaying(), false);
  assert.equal(replay.getCurrentText(), 'hello world');
});

test('createCastReplay play/pause/restart lifecycle works', () => {
  const frames = [
    { delay: 10, type: 'o', payload: 'a' },
    { delay: 10, type: 'o', payload: 'b' },
  ];
  const replay = createCastReplay(frames, { reducedMotion: true });
  assert.equal(replay.play(), true);
  assert.equal(replay.play(), false);
  assert.equal(replay.getPlaying(), true);
  replay.pause();
  assert.equal(replay.getPlaying(), false);
  replay.restart();
  assert.equal(replay.getElapsed(), 0);
  assert.equal(replay.getPlaying(), false);
});

test('createCastReplay abort cleans up timer', () => {
  const frames = [{ delay: 0.5, type: 'o', payload: 'text' }];
  const replay = createCastReplay(frames, { reducedMotion: false });
  replay.play();
  assert.equal(replay.getPlaying(), true);
  replay.stop();
  assert.equal(replay.getPlaying(), false);
  assert.equal(replay.getElapsed(), 0);
});

test('createCastReplay ignores input frames and uses output frames only', () => {
  const frames = [
    { delay: 0, type: 'i', payload: 'typed' },
    { delay: 0, type: 'o', payload: 'result' },
  ];
  const replay = createCastReplay(frames, { reducedMotion: true });
  replay.play();
  assert.equal(replay.getCurrentText(), 'result');
});

test('createCastReplay preserves recorded timing order', () => {
  const events = [];
  const frames = [
    { delay: 0, type: 'o', payload: 'A' },
    { delay: 0, type: 'o', payload: 'B' },
    { delay: 0, type: 'o', payload: 'C' },
  ];
  const replay = createCastReplay(frames, {
    reducedMotion: true,
    onStateChange: (s) => { events.push(s.text); },
  });
  replay.play();
  // All 0-delay frames batch into one emission; final text preserves order.
  assert.ok(events.length >= 1);
  assert.equal(events[events.length - 1], 'ABC');
});
