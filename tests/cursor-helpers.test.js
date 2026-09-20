import test from 'node:test';
import assert from 'node:assert/strict';

import {
  INTERACTIVE_SELECTOR,
  IMAGE_SELECTOR,
  TRAIL_COUNT,
  LERP_SPEED,
  LERP_REDUCED,
  RING_LERP_MULTIPLIER,
  TRAIL_SPEED_THRESHOLD,
  lerp,
  cursorStateFor,
  cursorIsTextInput,
  cursorFramePositions,
  cursorTransform,
  trailOpacity,
  advanceTrails,
} from '../scripts/cursor-helpers.js';

test('selectors document the expected elements', () => {
  assert.match(INTERACTIVE_SELECTOR, /a, button/);
  assert.match(INTERACTIVE_SELECTOR, /role="button"/);
  assert.match(INTERACTIVE_SELECTOR, /input|textarea/);
  assert.match(IMAGE_SELECTOR, /\.artifact|figure/);
  assert.match(IMAGE_SELECTOR, /\.project-card img/);
});

test('tuning constants are the documented values', () => {
  assert.equal(TRAIL_COUNT, 3);
  assert.equal(LERP_SPEED, 0.15);
  assert.equal(LERP_REDUCED, 0.35);
  assert.equal(RING_LERP_MULTIPLIER, 0.85);
  assert.equal(TRAIL_SPEED_THRESHOLD, 8);
});

test('lerp is a + (b-a) * t', () => {
  assert.equal(lerp(0, 10, 0.5), 5);
  assert.equal(lerp(0, 10, 0), 0);
  assert.equal(lerp(0, 10, 1), 10);
  assert.equal(lerp(-10, 10, 0.25), -5);
  assert.equal(lerp(0, 0, 0.5), 0);
});

test('cursorStateFor returns "default" for null/undefined', () => {
  assert.equal(cursorStateFor(null), 'default');
  assert.equal(cursorStateFor(undefined), 'default');
});

test('cursorIsTextInput matches textarea and contenteditable', () => {
  // bare fakes that satisfy the .matches contract
  const ta = { matches: (sel) => sel.includes('textarea') };
  assert.equal(cursorIsTextInput(ta), true);
  const ce = { matches: (sel) => sel.includes('contenteditable') };
  assert.equal(cursorIsTextInput(ce), true);
});

test('cursorIsTextInput matches bare text/password inputs but not button inputs', () => {
  // The selector passed to matches is:
  //   'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"])'
  const textInput = {
    matches: (sel) => sel.startsWith('input:not'),
  };
  assert.equal(cursorIsTextInput(textInput), true);
  const buttonInput = { matches: () => false };
  assert.equal(cursorIsTextInput(buttonInput), false);
  assert.equal(cursorIsTextInput(null), false);
});

test('cursorTransform formats the CSS translate string', () => {
  assert.equal(cursorTransform(0, 0), 'translate(0px, 0px)');
  assert.equal(cursorTransform(12.5, -8), 'translate(12.5px, -8px)');
});

test('trailOpacity returns 0 below threshold', () => {
  for (const i of [0, 1, 2]) {
    assert.equal(trailOpacity(i, 0), 0);
    assert.equal(trailOpacity(i, TRAIL_SPEED_THRESHOLD), 0);
  }
});

test('trailOpacity returns positive values above threshold', () => {
  assert(trailOpacity(0, 16) > 0);
  assert(trailOpacity(1, 16) > 0);
  assert(trailOpacity(2, 16) > 0);
});

test('trailOpacity decreases with index', () => {
  // For a given speed above threshold, opacities ramp down
  const speed = 40;
  assert(trailOpacity(0, speed) > trailOpacity(1, speed));
  assert(trailOpacity(1, speed) > trailOpacity(2, speed));
});

test('trailOpacity returns 0 for indices outside the ramp', () => {
  assert.equal(trailOpacity(-1, 100), 0);
  assert.equal(trailOpacity(3, 100), 0);
});

test('cursorFramePositions integrates the lerp chain', () => {
  // At rest: dot and ring both at 0, mouse jumps to 100.
  // dotX moves toward 100 by t=0.15 -> 15.
  // ringX moves toward (input dot=0) by t=0.1275 -> still 0.
  // Ring tracks dot *across the next frame*.
  const next = cursorFramePositions(
    { mouseX: 100, mouseY: 100, dotX: 0, dotY: 0, ringX: 0, ringY: 0 },
    LERP_SPEED
  );
  assert.equal(next.dotX, 15);
  assert.equal(next.dotY, 15);
  // ring follows the previous dot, not the freshly-computed one.
  assert.equal(next.ringX, 0);
  assert.equal(next.ringY, 0);
});

test('cursorFramePositions: ring converges in a second frame', () => {
  // Frame 1: dot moves from 0 toward mouse=100 by t=0.15 -> 15
  //          ring moves from 0 toward (old) dot=0 by 0.1275 -> 0
  const frame1 = cursorFramePositions(
    { mouseX: 100, mouseY: 100, dotX: 0, dotY: 0, ringX: 0, ringY: 0 },
    LERP_SPEED
  );
  assert.equal(frame1.dotX, 15);
  assert.equal(frame1.ringX, 0);

  // Frame 2: dot moves from 15 toward 100 by 0.15 -> 27.75
  //          ring moves from 0 toward (old) dot=15 by 0.1275 -> 1.9125
  const frame2 = cursorFramePositions(
    { mouseX: 100, mouseY: 100, dotX: frame1.dotX, dotY: frame1.dotY, ringX: frame1.ringX, ringY: frame1.ringY },
    LERP_SPEED
  );
  // floating-point: check with a small tolerance
  assert(Math.abs(frame2.dotX - 27.75) < 1e-9);
  assert(Math.abs(frame2.ringX - 1.9125) < 1e-9);
});

test('cursorFramePositions is idempotent at the equilibrium', () => {
  // When dot/mouse are aligned, the lerp leaves positions unchanged
  const next = cursorFramePositions(
    { mouseX: 50, mouseY: 50, dotX: 50, dotY: 50, ringX: 50, ringY: 50 },
    LERP_SPEED
  );
  assert.equal(next.dotX, 50);
  assert.equal(next.ringX, 50);
});

test('advanceTrails shifts the position array forward', () => {
  const prev = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
  ];
  const next = advanceTrails(prev, { x: 0, y: 0 });
  assert.deepEqual(next, [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ]);
});

test('advanceTrails leaves the original array untouched', () => {
  const prev = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ];
  const before = JSON.parse(JSON.stringify(prev));
  advanceTrails(prev, { x: 99, y: 99 });
  assert.deepEqual(prev, before);
});

test('advanceTrails handles a single trail', () => {
  assert.deepEqual(
    advanceTrails([{ x: 5, y: 5 }], { x: 10, y: 10 }),
    [{ x: 10, y: 10 }]
  );
});
