/**
 * scroll-choreography-helpers.test.js — Unit tests for pure helpers.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  STAGGER_BASE_MS,
  BEAT_DURATION_MS,
  HERO_ANIMATION_CLEANUP_MS,
  PARALLAX_DEPTH_PX,
  SCALE_NEAR_FULL,
  SEQUENCE_OBSERVER_THRESHOLD,
  SEQUENCE_OBSERVER_ROOT_MARGIN,
  HERO_OBSERVER_THRESHOLD,
  HERO_CLIP_INSET,
  HERO_CLIP_EXPANDED,
  HERO_CLIP_TRANSITION,
  HIDDEN_TRANSFORM,
  HIDDEN_OPACITY,
  CLASS_REVEAL_HIDDEN,
  CLASS_REVEAL_VISIBLE,
  SELECTOR_ARTIFACT,
  SELECTOR_HERO_MEDIA,
  SELECTOR_ARTIFACT_SEQUENCE,
  SELECTOR_HERO_PLATE,
  revealDelayFor,
  parallaxOffsetFor,
  parallaxScaleFor,
  normalizedDistance,
  parallaxVarsFor,
} from '../scripts/scroll-choreography-helpers.js';

test('revealDelayFor multiplies index by STAGGER_BASE_MS', () => {
  assert.equal(revealDelayFor(0), 0);
  assert.equal(revealDelayFor(1), STAGGER_BASE_MS);
  assert.equal(revealDelayFor(3), STAGGER_BASE_MS * 3);
});

test('revealDelayFor matches the previous inline STAGGER_BASE * index', () => {
  for (let i = 0; i < 10; i++) {
    assert.equal(revealDelayFor(i), i * 120);
  }
});

test('normalizedDistance is zero when artifact center equals viewport center', () => {
  // viewport center at 400, artifact center at 400 -> distance = 0
  const rect = { top: 300, height: 200 };
  assert.equal(normalizedDistance(rect, 800), 0);
});

test('normalizedDistance is positive when artifact is below viewport center', () => {
  // artifact center at 600, viewport center at 400, vh = 800
  // distance = (600 - 400) / 800 = 0.25
  const rect = { top: 500, height: 200 };
  assert.equal(normalizedDistance(rect, 800), 0.25);
});

test('normalizedDistance is negative when artifact is above viewport center', () => {
  const rect = { top: 100, height: 200 };
  // center = 200, vh = 800, viewport center = 400
  // distance = (200 - 400) / 800 = -0.25
  assert.equal(normalizedDistance(rect, 800), -0.25);
});

test('parallaxOffsetFor uses PARALLAX_DEPTH_PX multiplier', () => {
  const rect = { top: 500, height: 200 };
  // distance = 0.25 -> offset = 0.25 * -15 = -3.75
  assert.equal(parallaxOffsetFor(rect, 800), 0.25 * PARALLAX_DEPTH_PX);
});

test('parallaxOffsetFor is zero when artifact is centered', () => {
  const rect = { top: 300, height: 200 };
  assert.equal(parallaxOffsetFor(rect, 800), 0);
});

test('parallaxOffsetFor is negative when artifact is below center', () => {
  // Below center -> positive distance -> negative offset (moves up)
  const rect = { top: 800, height: 200 };
  // center = 900, viewport center = 400, vh = 800
  // distance = (900 - 400) / 800 = 0.625
  // offset = 0.625 * -15 = -9.375
  assert.equal(parallaxOffsetFor(rect, 800), 0.625 * PARALLAX_DEPTH_PX);
});

test('parallaxOffsetFor is positive when artifact is above center', () => {
  // Above center -> negative distance -> positive offset (moves down)
  const rect = { top: -100, height: 200 };
  // center = 0, vh = 800, viewport center = 400
  // distance = (0 - 400) / 800 = -0.5
  // offset = -0.5 * -15 = 7.5
  assert.equal(parallaxOffsetFor(rect, 800), -0.5 * PARALLAX_DEPTH_PX);
});

test('parallaxScaleFor returns 1 when distance is 0', () => {
  assert.equal(parallaxScaleFor(0), 1);
});

test('parallaxScaleFor returns a value less than 1 when distance is positive', () => {
  assert.ok(parallaxScaleFor(0.25) < 1);
});

test('parallaxScaleFor clamps to SCALE_NEAR_FULL for large distances', () => {
  // distance 10 -> 1 - 0.1 = 0.9, but clamp to 0.98 -> 0.98
  assert.equal(parallaxScaleFor(10), SCALE_NEAR_FULL);
  assert.equal(parallaxScaleFor(100), SCALE_NEAR_FULL);
});

test('parallaxScaleFor clamps symmetrically for negative distance', () => {
  assert.equal(parallaxScaleFor(-5), SCALE_NEAR_FULL);
});

test('parallaxScaleFor is monotonically decreasing in |distance| up to clamp', () => {
  const s0 = parallaxScaleFor(0);
  const s1 = parallaxScaleFor(0.5);
  const s2 = parallaxScaleFor(1);
  assert.ok(s0 >= s1);
  assert.ok(s1 >= s2);
  assert.ok(s2 >= SCALE_NEAR_FULL);
});

test('parallaxVarsFor produces px strings', () => {
  const rect = { top: 500, height: 200 };
  const vh = 800;
  const result = parallaxVarsFor(rect, vh);
  assert.equal(result.parallaxY, `${parallaxOffsetFor(rect, vh)}px`);
  // scale is a number, coerced to string
  assert.equal(typeof result.parallaxScale, 'string');
  assert.equal(parseFloat(result.parallaxScale), parallaxScaleFor(normalizedDistance(rect, vh)));
});

test('parallaxVarsFor matches exact previous values for centered rect', () => {
  const rect = { top: 300, height: 200 };
  const result = parallaxVarsFor(rect, 800);
  assert.equal(result.parallaxY, '0px');
  assert.equal(result.parallaxScale, '1');
});

test('HIDDEN_TRANSFORM encodes translateY 32px scale 0.97', () => {
  assert.match(HIDDEN_TRANSFORM, /translateY\(32px\)/);
  assert.match(HIDDEN_TRANSFORM, /scale\(0\.97\)/);
});

test('HIDDEN_OPACITY is the literal "0" string for CSS', () => {
  assert.equal(HIDDEN_OPACITY, '0');
});

test('HERO_CLIP_INSET encodes inset 8% and round 12px', () => {
  assert.match(HERO_CLIP_INSET, /inset\(8%/);
  assert.match(HERO_CLIP_INSET, /round 12px/);
});

test('HERO_CLIP_EXPANDED is the fully open inset with no rounding', () => {
  assert.match(HERO_CLIP_EXPANDED, /inset\(0%/);
  assert.match(HERO_CLIP_EXPANDED, /round 0px/);
});

test('HERO_CLIP_TRANSITION uses the spring-y cubic-bezier curve', () => {
  assert.match(HERO_CLIP_TRANSITION, /cubic-bezier\(0\.34, 1\.56, 0\.64, 1\)/);
});

test('HERO_ANIMATION_CLEANUP_MS equals BEAT_DURATION_MS + 200', () => {
  assert.equal(HERO_ANIMATION_CLEANUP_MS, BEAT_DURATION_MS + 200);
});

test('SEQUENCE_OBSERVER threshold and rootMargin match the inline constants', () => {
  assert.equal(SEQUENCE_OBSERVER_THRESHOLD, 0.1);
  assert.equal(SEQUENCE_OBSERVER_ROOT_MARGIN, '0px 0px -60px 0px');
});

test('HERO_OBSERVER threshold matches the inline 0.2', () => {
  assert.equal(HERO_OBSERVER_THRESHOLD, 0.2);
});

test('CSS class names match the kit conventions', () => {
  assert.equal(CLASS_REVEAL_HIDDEN, 'reveal-hidden');
  assert.equal(CLASS_REVEAL_VISIBLE, 'reveal-visible');
});

test('selectors match the home page markup', () => {
  assert.equal(SELECTOR_ARTIFACT, '.artifact');
  assert.equal(SELECTOR_HERO_MEDIA, '.artifact-media');
  assert.equal(SELECTOR_ARTIFACT_SEQUENCE, '.home-artifact-sequence');
  assert.equal(SELECTOR_HERO_PLATE, '.home-opening-artifact');
});
