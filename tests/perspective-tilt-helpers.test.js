import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_MAX_TILT,
  DEFAULT_SCALE,
  DEFAULT_SPEED,
  DEFAULT_PERSPECTIVE,
  TILT_EASING,
  clamp,
  normalizeClientPoint,
  tiltFromPointer,
  resetTransformString,
  glareBackground,
  parseTiltAttrs,
  tiltTransition,
} from '../scripts/perspective-tilt-helpers.js';

test('defaults are the documented values', () => {
  assert.equal(DEFAULT_MAX_TILT, 12);
  assert.equal(DEFAULT_SCALE, 1.02);
  assert.equal(DEFAULT_SPEED, 400);
  assert.equal(DEFAULT_PERSPECTIVE, 800);
  assert.match(TILT_EASING, /cubic-bezier/);
});

test('clamp restricts to [min, max]', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(clamp(-10, -8, 8), -8);
});

test('normalizeClientPoint returns (0, 0) at center', () => {
  const result = normalizeClientPoint(200, 100, { width: 400, height: 200 });
  assert.equal(result.normalX, 0);
  assert.equal(result.normalY, 0);
});

test('normalizeClientPoint returns (-1, -1) at top-left', () => {
  const result = normalizeClientPoint(0, 0, { width: 400, height: 200 });
  assert.equal(result.normalX, -1);
  assert.equal(result.normalY, -1);
});

test('normalizeClientPoint returns (+1, +1) at bottom-right', () => {
  const result = normalizeClientPoint(400, 200, { width: 400, height: 200 });
  assert.equal(result.normalX, 1);
  assert.equal(result.normalY, 1);
});

test('tiltFromPointer applies positive scale by default', () => {
  const t = tiltFromPointer(0, 0, 12, 1.02);
  assert.match(t, /perspective\(800px\)/);
  assert.match(t, /rotateX\(0deg\)/);
  assert.match(t, /scale3d\(1\.02, 1\.02, 1\)/);
});

test('tiltFromPointer inverts Y axis (top tilts forward)', () => {
  // pointer at top: normalY = -1 -> tiltX should be -12 (top forward = positive pitch when inverted)
  const t = tiltFromPointer(0, -1, 12, 1.02);
  // rotateX uses inverted-Y formula: tiltX = clamp(normalY * maxTilt, ...)
  // with normalY = -1, tiltX = -12
  assert.match(t, /rotateX\(-12deg\)/);
  assert.match(t, /rotateY\(0deg\)/);
});

test('tiltFromPointer inverts X axis', () => {
  // pointer on the right: normalX = 1 -> tiltY = clamp(-1 * 12, ...) = -12
  const t = tiltFromPointer(1, 0, 12, 1.02);
  assert.match(t, /rotateY\(-12deg\)/);
});

test('tiltFromPointer respects custom perspective', () => {
  const t = tiltFromPointer(0, 0, 12, 1.02, 1200);
  assert.match(t, /perspective\(1200px\)/);
});

test('tiltFromPointer clamps to maxTilt at corners', () => {
  const t = tiltFromPointer(2, 2, 12, 1.02);
  assert.match(t, /rotateX\(12deg\)/);
  assert.match(t, /rotateY\(-12deg\)/);
});

test('resetTransformString produces scale 1 and 0-deg rotations', () => {
  const t = resetTransformString();
  assert.match(t, /perspective\(800px\)/);
  assert.match(t, /rotateX\(0deg\)/);
  assert.match(t, /rotateY\(0deg\)/);
  assert.match(t, /scale3d\(1, 1, 1\)/);
});

test('resetTransformString respects custom perspective', () => {
  const t = resetTransformString(1000);
  assert.match(t, /perspective\(1000px\)/);
});

test('glareBackground maps pointer to percent', () => {
  const bg = glareBackground(200, 100, { width: 400, height: 200 });
  assert.match(bg, /50%/);   // 200/400 = 50%
  assert.match(bg, /50%/);   // 100/200 = 50%
  assert.match(bg, /radial-gradient/);
});

test('glareBackground uses 0% at top-left and 100% at bottom-right', () => {
  const tl = glareBackground(0, 0, { width: 400, height: 200 });
  assert.match(tl, /0% 0%/);
  const br = glareBackground(400, 200, { width: 400, height: 200 });
  assert.match(br, /100% 100%/);
});

test('glareBackground uses translucent white core fading to transparent', () => {
  const bg = glareBackground(100, 50, { width: 200, height: 100 });
  assert.match(bg, /rgba\(255,255,255,0\.15\)/);
  assert.match(bg, /transparent 60%/);
});

test('parseTiltAttrs reads numeric data-tilt-* attributes', () => {
  const r = parseTiltAttrs({ tiltMax: '20', tiltScale: '1.05', tiltSpeed: '300', tiltGlare: 'true' });
  assert.equal(r.maxTilt, 20);
  assert.equal(r.scale, 1.05);
  assert.equal(r.speed, 300);
  assert.equal(r.enableGlare, true);
});

test('parseTiltAttrs falls back to defaults for empty values', () => {
  const r = parseTiltAttrs({});
  assert.equal(r.maxTilt, DEFAULT_MAX_TILT);
  assert.equal(r.scale, DEFAULT_SCALE);
  assert.equal(r.speed, DEFAULT_SPEED);
  assert.equal(r.enableGlare, false);
});

test('parseTiltAttrs treats tiltGlare="false" as disabled', () => {
  const r = parseTiltAttrs({ tiltGlare: 'false' });
  assert.equal(r.enableGlare, false);
});

test('parseTiltAttrs handles non-numeric garbage by falling back', () => {
  const r = parseTiltAttrs({ tiltMax: 'abc', tiltScale: 'xyz', tiltSpeed: 'qrs' });
  assert.equal(r.maxTilt, DEFAULT_MAX_TILT);
  assert.equal(r.scale, DEFAULT_SCALE);
  assert.equal(r.speed, DEFAULT_SPEED);
});

test('parseTiltAttrs accepts explicit fallback overrides', () => {
  const r = parseTiltAttrs({}, { maxTilt: 5, scale: 1.1, speed: 200, perspective: 600 });
  assert.equal(r.maxTilt, 5);
  assert.equal(r.scale, 1.1);
  assert.equal(r.speed, 200);
  assert.equal(r.perspective, 600);
});

test('tiltTransition includes speed and easing', () => {
  const t = tiltTransition(400);
  assert.match(t, /transform 400ms/);
  assert.match(t, /cubic-bezier\(0\.03, 0\.98, 0\.52, 0\.99\)/);
});

test('tiltTransition defaults to DEFAULT_SPEED', () => {
  const t = tiltTransition();
  assert.match(t, /transform 400ms/);
});
