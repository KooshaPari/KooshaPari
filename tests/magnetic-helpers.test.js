import test from 'node:test';
import assert from 'node:assert/strict';

import {
  STIFFNESS,
  DAMPING,
  MASS,
  MAX_X,
  MAX_Y,
  REDUCED_SCALE,
  AUTO_SELECTORS,
  clamp,
  createState,
  step,
  isAtRest,
  transformString,
  chooseDt,
  INITIAL_TRANSFORM,
} from '../scripts/magnetic-helpers.js';

test('constants match the documented spring and visual limits', () => {
  assert.equal(STIFFNESS, 150);
  assert.equal(DAMPING, 15);
  assert.equal(MASS, 1);
  assert.equal(MAX_X, 12);
  assert.equal(MAX_Y, 8);
  assert.equal(REDUCED_SCALE, 1.04);
});

test('AUTO_SELECTORS lists the three known selectors', () => {
  assert.deepEqual(AUTO_SELECTORS, [
    '.atelier-nav a',
    '.home-primary-links a',
    '.lens-control button',
  ]);
});

test('clamp restricts value to [-max, max]', () => {
  assert.equal(clamp(5, 12), 5);
  assert.equal(clamp(-5, 12), -5);
  assert.equal(clamp(15, 12), 12);
  assert.equal(clamp(-15, 12), -12);
  assert.equal(clamp(0, 12), 0);
});

test('createState returns a fresh zero-velocity state', () => {
  const a = createState();
  const b = createState();
  assert.notEqual(a, b);
  assert.deepEqual(a, { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 });
  // Mutating a does not affect b
  a.x = 100;
  assert.equal(b.x, 0);
});

test('step integrates spring physics toward target', () => {
  const s = createState();
  s.targetX = 10;
  s.targetY = 5;
  step(s, 0.016);
  // After one frame, displacement should be > 0 (pulling toward target)
  assert.ok(s.x > 0, `expected x > 0, got ${s.x}`);
  assert.ok(s.y > 0, `expected y > 0, got ${s.y}`);
  assert.ok(s.vx > 0);
  assert.ok(s.vy > 0);
});

test('step oscillates and converges back to origin after target is reset', () => {
  const s = createState();
  s.targetX = 12;
  // Run for 2 seconds to reach steady state at target
  for (let i = 0; i < 200; i++) step(s, 0.016);
  assert.ok(Math.abs(s.x - 12) < 0.01, `should converge to target, got ${s.x}`);
  // Now release
  s.targetX = 0;
  for (let i = 0; i < 200; i++) step(s, 0.016);
  assert.ok(Math.abs(s.x) < 0.01, `should converge back to origin, got ${s.x}`);
  assert.ok(Math.abs(s.vx) < 0.01, `velocity should converge to 0, got ${s.vx}`);
});

test('step with dt=0 is a no-op (except when at rest with zero target)', () => {
  const s = createState();
  s.x = 1;
  s.y = -2;
  s.vx = 3;
  s.vy = 4;
  step(s, 0);
  assert.equal(s.x, 1);
  assert.equal(s.y, -2);
  assert.equal(s.vx, 3);
  assert.equal(s.vy, 4);
});

test('isAtRest returns true when all four values are below 0.01', () => {
  const s = createState();
  assert.equal(isAtRest(s), true);
  s.x = 0.005;
  assert.equal(isAtRest(s), true);
  s.x = 0.02;
  assert.equal(isAtRest(s), false);
  s.x = 0;
  s.vx = 0.02;
  assert.equal(isAtRest(s), false);
});

test('transformString returns null when at rest', () => {
  assert.equal(transformString(createState()), null);
});

test('transformString formats a translate() string with 2dp precision', () => {
  const s = createState();
  s.x = 1.23456;
  s.y = -7.89012;
  assert.equal(transformString(s), 'translate(1.23px, -7.89px)');
});

test('chooseDt returns 16ms default on the first frame', () => {
  assert.equal(chooseDt(1000, 0), 0.016);
});

test('chooseDt computes delta and clamps to 64ms when the tab was backgrounded', () => {
  // normal frame: 16ms gap
  assert.equal(chooseDt(1016, 1000), 0.016);
  // backgrounded tab: gap > 64ms is clamped
  assert.equal(chooseDt(2000, 1000), 0.064);
});

test('INITIAL_TRANSFORM is the empty string used to clear a transform', () => {
  assert.equal(INITIAL_TRANSFORM, '');
});

test('full spring system: apply step repeatedly and observe convergence at target', () => {
  const s = createState();
  s.targetX = 12;
  // Run for 5 seconds
  let peakSpeed = 0;
  for (let i = 0; i < 500; i++) {
    step(s, 0.016);
    peakSpeed = Math.max(peakSpeed, Math.hypot(s.vx, s.vy));
  }
  // After 5s, x should be at target and velocity near zero
  assert.ok(Math.abs(s.x - 12) < 0.01, `expected x near target 12, got ${s.x}`);
  assert.ok(Math.abs(s.vx) < 0.01, `expected velocity near 0, got ${s.vx}`);
  // Peak speed should be non-trivial (oscillation occurred)
  assert.ok(peakSpeed > 0, 'expected non-zero peak speed');
});
