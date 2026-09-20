/**
 * transitions-helpers.test.js — Unit tests for transition pure helpers.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DURATION_OUT_MS,
  DURATION_IN_MS,
  DEBOUNCE_MS,
  SAFETY_NET_BUFFER_MS,
  CLASS_PREPARING,
  CLASS_OUT,
  CLASS_IN,
  CLASS_VISIBLE,
  SELECTOR_VIEW_ROOT,
  VIEW_ROOT_ID,
  transitionPlan,
  safetyNetMs,
  shouldReplaceQueue,
  totalTransitionMs,
} from '../scripts/transitions-helpers.js';

test('DURATION_OUT_MS matches the previous DURATION_OUT constant', () => {
  assert.equal(DURATION_OUT_MS, 180);
});

test('DURATION_IN_MS matches the previous DURATION_IN constant', () => {
  assert.equal(DURATION_IN_MS, 250);
});

test('DEBOUNCE_MS matches the previous DEBOUNCE_MS constant', () => {
  assert.equal(DEBOUNCE_MS, 100);
});

test('SAFETY_NET_BUFFER_MS is 30', () => {
  assert.equal(SAFETY_NET_BUFFER_MS, 30);
});

test('CSS class constants match the orchestrator\'s expectations', () => {
  assert.equal(CLASS_PREPARING, 'view-transition-preparing');
  assert.equal(CLASS_OUT, 'view-transition-out');
  assert.equal(CLASS_IN, 'view-transition-in');
  assert.equal(CLASS_VISIBLE, 'is-visible');
});

test('view-root constants', () => {
  assert.equal(SELECTOR_VIEW_ROOT, '#view-root');
  assert.equal(VIEW_ROOT_ID, 'view-root');
});

test('transitionPlan returns "native" when supported and motion is allowed', () => {
  assert.equal(
    transitionPlan({ prefersReducedMotion: false, viewTransitionsSupported: true }),
    'native'
  );
});

test('transitionPlan returns "manual" when prefers-reduced-motion is set', () => {
  assert.equal(
    transitionPlan({ prefersReducedMotion: true, viewTransitionsSupported: true }),
    'manual'
  );
});

test('transitionPlan returns "manual" when View Transitions API is missing', () => {
  assert.equal(
    transitionPlan({ prefersReducedMotion: false, viewTransitionsSupported: false }),
    'manual'
  );
});

test('transitionPlan returns "manual" when both reduced motion and missing API', () => {
  assert.equal(
    transitionPlan({ prefersReducedMotion: true, viewTransitionsSupported: false }),
    'manual'
  );
});

test('safetyNetMs adds the buffer to the duration', () => {
  assert.equal(safetyNetMs(180), 210);
  assert.equal(safetyNetMs(250), 280);
});

test('safetyNetMs respects an explicit buffer argument', () => {
  assert.equal(safetyNetMs(100, 50), 150);
  assert.equal(safetyNetMs(100, 0), 100);
});

test('safetyNetMs(DURATION_OUT_MS) matches the previous setTimeout value', () => {
  // Previous: setTimeout(onEnd, DURATION_OUT + 30) = 180 + 30 = 210
  assert.equal(safetyNetMs(DURATION_OUT_MS), 210);
});

test('safetyNetMs(DURATION_IN_MS) matches the previous setTimeout value', () => {
  // Previous: setTimeout(onEnd, DURATION_IN + 30) = 250 + 30 = 280
  assert.equal(safetyNetMs(DURATION_IN_MS), 280);
});

test('shouldReplaceQueue is true when a transition is in flight', () => {
  assert.equal(shouldReplaceQueue(true), true);
});

test('shouldReplaceQueue is false when no transition is in flight', () => {
  assert.equal(shouldReplaceQueue(false), false);
});

test('totalTransitionMs equals DURATION_OUT_MS + DURATION_IN_MS', () => {
  assert.equal(totalTransitionMs(), DURATION_OUT_MS + DURATION_IN_MS);
});
