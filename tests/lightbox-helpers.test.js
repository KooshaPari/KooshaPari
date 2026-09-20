/**
 * lightbox-helpers.test.js — Unit tests for lightbox pure helpers.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  OVERLAY_CLASS,
  ACTIVE_CLASS,
  CLASS_IMG,
  CLASS_CAPTION,
  CLASS_FIGURE,
  CLASS_CLOSE_BTN,
  CLASS_PREV_BTN,
  CLASS_NEXT_BTN,
  CLASS_COUNTER,
  SELECTOR_IMAGES,
  ICON_CLOSE,
  ICON_PREV,
  ICON_NEXT,
  SWIPE_MIN_DISTANCE,
  KEY_ESCAPE,
  KEY_ARROW_LEFT,
  KEY_ARROW_RIGHT,
  ZOOM_CURSOR,
  nextIndex,
  prevIndex,
  counterText,
  isHorizontalSwipe,
  swipeDirection,
  shouldShowNav,
} from '../scripts/lightbox-helpers.js';

test('nextIndex increments by 1', () => {
  assert.equal(nextIndex(0, 4), 1);
  assert.equal(nextIndex(2, 4), 3);
});

test('nextIndex wraps around at the end', () => {
  assert.equal(nextIndex(3, 4), 0);
  assert.equal(nextIndex(4, 5), 0);
});

test('nextIndex returns current when total is 0 (defensive)', () => {
  assert.equal(nextIndex(0, 0), 0);
  assert.equal(nextIndex(7, 0), 7);
});

test('nextIndex returns current when total is negative', () => {
  assert.equal(nextIndex(2, -1), 2);
});

test('prevIndex decrements by 1', () => {
  assert.equal(prevIndex(2, 4), 1);
  assert.equal(prevIndex(3, 4), 2);
});

test('prevIndex wraps to the end when at 0', () => {
  assert.equal(prevIndex(0, 4), 3);
});

test('prevIndex returns current when total is 0', () => {
  assert.equal(prevIndex(0, 0), 0);
  assert.equal(prevIndex(5, 0), 5);
});

test('counterText formats as "N / M"', () => {
  assert.equal(counterText(0, 5), '1 / 5');
  assert.equal(counterText(4, 5), '5 / 5');
  assert.equal(counterText(2, 7), '3 / 7');
});

test('isHorizontalSwipe returns true when |dx| > |dy| and over threshold', () => {
  assert.equal(isHorizontalSwipe(100, 20), true);
  assert.equal(isHorizontalSwipe(-100, -20), true);
});

test('isHorizontalSwipe returns false when vertical movement dominates', () => {
  assert.equal(isHorizontalSwipe(20, 100), false);
  assert.equal(isHorizontalSwipe(40, 60), false);
});

test('isHorizontalSwipe returns false when below the threshold', () => {
  // 50 == threshold -> not strictly greater
  assert.equal(isHorizontalSwipe(50, 0), false);
  assert.equal(isHorizontalSwipe(49, 0), false);
});

test('isHorizontalSwipe threshold is configurable', () => {
  // With threshold 30, a 40-px swipe qualifies.
  assert.equal(isHorizontalSwipe(40, 0, 30), true);
  assert.equal(isHorizontalSwipe(40, 100, 30), false);
  assert.equal(isHorizontalSwipe(25, 0, 30), false);
});

test('swipeDirection returns "next" for left swipe (negative dx)', () => {
  assert.equal(swipeDirection(-100, 0), 'next');
  assert.equal(swipeDirection(-60, 30), 'next');
});

test('swipeDirection returns "prev" for right swipe (positive dx)', () => {
  assert.equal(swipeDirection(100, 0), 'prev');
  assert.equal(swipeDirection(60, -30), 'prev');
});

test('swipeDirection returns null when not horizontal', () => {
  assert.equal(swipeDirection(0, 100), null);
});

test('swipeDirection returns null when below threshold', () => {
  assert.equal(swipeDirection(40, 0), null);
});

test('shouldShowNav is true when more than one image', () => {
  assert.equal(shouldShowNav(2), true);
  assert.equal(shouldShowNav(5), true);
});

test('shouldShowNav is false for 0 or 1 image', () => {
  assert.equal(shouldShowNav(0), false);
  assert.equal(shouldShowNav(1), false);
});

test('SWIPE_MIN_DISTANCE is 50', () => {
  assert.equal(SWIPE_MIN_DISTANCE, 50);
});

test('keyboard key constants match expected values', () => {
  assert.equal(KEY_ESCAPE, 'Escape');
  assert.equal(KEY_ARROW_LEFT, 'ArrowLeft');
  assert.equal(KEY_ARROW_RIGHT, 'ArrowRight');
});

test('class constants encode the overlay markup', () => {
  assert.equal(OVERLAY_CLASS, 'lightbox-overlay');
  assert.equal(ACTIVE_CLASS, 'lightbox-active');
  assert.equal(CLASS_IMG, 'lightbox-img');
  assert.equal(CLASS_CAPTION, 'lightbox-caption');
  assert.equal(CLASS_FIGURE, 'lightbox-figure');
  assert.equal(CLASS_CLOSE_BTN, 'lightbox-close');
  assert.equal(CLASS_PREV_BTN, 'lightbox-nav lightbox-prev');
  assert.equal(CLASS_NEXT_BTN, 'lightbox-nav lightbox-next');
  assert.equal(CLASS_COUNTER, 'lightbox-counter');
});

test('SELECTOR_IMAGES matches the previous inline selector', () => {
  assert.equal(
    SELECTOR_IMAGES,
    '.case-gallery img, .case-hero img, .project-card-image'
  );
});

test('icon SVGs contain the expected shapes', () => {
  // Close icon: two crossed lines
  assert.match(ICON_CLOSE, /line x1="18"/);
  assert.match(ICON_CLOSE, /line x1="6"/);
  // Prev: chevron pointing left
  assert.match(ICON_PREV, /polyline points="15 18 9 12 15 6"/);
  // Next: chevron pointing right
  assert.match(ICON_NEXT, /polyline points="9 18 15 12 9 6"/);
});

test('ZOOM_CURSOR is the zoom-in cursor value', () => {
  assert.equal(ZOOM_CURSOR, 'zoom-in');
});
