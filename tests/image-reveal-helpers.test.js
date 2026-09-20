/**
 * image-reveal-helpers.test.js — Unit tests for image reveal pure helpers.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  REVEAL_STYLES,
  TRANSITION_DURATION_MS,
  EASING,
  CLEANUP_BUFFER_MS,
  PLACEHOLDER_FADE_DELAY_MS,
  CLASS_REVEALED,
  CLASS_IMG,
  CLASS_CONTAINER,
  CLASS_PLACEHOLDER,
  ATTR_REVEAL_STYLE,
  ATTR_REVEAL_PROCESSED,
  ATTR_DATA_SRC,
  VAR_REVEAL_ASPECT,
  pickRevealStyle,
  isValidRevealStyle,
  aspectRatioVar,
  backgroundImageFor,
  cleanupDelayMs,
  wipeRightInitialClipPath,
  wipeRightFinalClipPath,
  zoomFadeInitial,
  zoomFadeFinal,
  curtainInitialClipPath,
  curtainFinalClipPath,
  pixelateInitial,
  pixelateFinal,
  transitionFor,
  transitionsFor,
} from '../scripts/image-reveal-helpers.js';

test('REVEAL_STYLES contains exactly the four orchestrator styles', () => {
  assert.deepEqual(REVEAL_STYLES, ['wipe-right', 'zoom-fade', 'curtain', 'pixelate']);
});

test('constants match the previous inline values', () => {
  assert.equal(TRANSITION_DURATION_MS, 800);
  assert.equal(EASING, 'cubic-bezier(0.16, 1, 0.3, 1)');
  assert.equal(CLEANUP_BUFFER_MS, 50);
  assert.equal(PLACEHOLDER_FADE_DELAY_MS, 80);
});

test('cleanupDelayMs adds buffer to duration', () => {
  assert.equal(cleanupDelayMs(), 850);
});

test('class / attribute constants match the orchestrator', () => {
  assert.equal(CLASS_REVEALED, 'revealed');
  assert.equal(CLASS_IMG, 'image-reveal-img');
  assert.equal(CLASS_CONTAINER, 'image-reveal-container');
  assert.equal(CLASS_PLACEHOLDER, 'image-reveal-placeholder');
  assert.equal(ATTR_REVEAL_STYLE, 'data-reveal-style');
  assert.equal(ATTR_REVEAL_PROCESSED, 'data-reveal-processed');
  assert.equal(ATTR_DATA_SRC, 'data-src');
  assert.equal(VAR_REVEAL_ASPECT, '--reveal-aspect');
});

test('pickRevealStyle returns the attr when it is a known style', () => {
  assert.equal(pickRevealStyle('wipe-right'), 'wipe-right');
  assert.equal(pickRevealStyle('zoom-fade'), 'zoom-fade');
  assert.equal(pickRevealStyle('curtain'), 'curtain');
  assert.equal(pickRevealStyle('pixelate'), 'pixelate');
});

test('pickRevealStyle falls back to random for an unknown attr', () => {
  // All four known styles are reachable via Math.random() = 0.0 → index 0
  // or 0.99 → index 3.
  assert.equal(pickRevealStyle('not-a-style', () => 0.0), REVEAL_STYLES[0]);
  assert.equal(pickRevealStyle('not-a-style', () => 0.99), REVEAL_STYLES[3]);
});

test('pickRevealStyle falls back when attr is empty / null / undefined', () => {
  assert.equal(pickRevealStyle('', () => 0), REVEAL_STYLES[0]);
  assert.equal(pickRevealStyle(null, () => 0.5), REVEAL_STYLES[2]);
  assert.equal(pickRevealStyle(undefined, () => 0.99), REVEAL_STYLES[3]);
});

test('isValidRevealStyle recognises the four known styles', () => {
  for (const style of REVEAL_STYLES) {
    assert.equal(isValidRevealStyle(style), true);
  }
});

test('isValidRevealStyle rejects unknown / empty / null styles', () => {
  assert.equal(isValidRevealStyle('unknown'), false);
  assert.equal(isValidRevealStyle(''), false);
  assert.equal(isValidRevealStyle(null), false);
  assert.equal(isValidRevealStyle(undefined), false);
});

test('aspectRatioVar formats valid width/height pairs', () => {
  assert.equal(aspectRatioVar(1200, 800), '1200 / 800');
  assert.equal(aspectRatioVar('1920', '1080'), '1920 / 1080');
});

test('aspectRatioVar returns null for missing or invalid dimensions', () => {
  assert.equal(aspectRatioVar(null, 100), null);
  assert.equal(aspectRatioVar(100, null), null);
  assert.equal(aspectRatioVar(undefined, undefined), null);
  assert.equal(aspectRatioVar(0, 100), null);
  assert.equal(aspectRatioVar(100, 0), null);
  assert.equal(aspectRatioVar(-50, 100), null);
  assert.equal(aspectRatioVar('abc', 100), null);
});

test('backgroundImageFor returns a url() string for normal sources', () => {
  assert.equal(backgroundImageFor('https://example.com/a.png'), 'url(https://example.com/a.png)');
  assert.equal(backgroundImageFor('/local/path.jpg'), 'url(/local/path.jpg)');
});

test('backgroundImageFor returns null for empty / data: URIs', () => {
  assert.equal(backgroundImageFor(''), null);
  assert.equal(backgroundImageFor(null), null);
  assert.equal(backgroundImageFor(undefined), null);
  assert.equal(backgroundImageFor('data:image/png;base64,...'), null);
});

test('wipe-right clip-path values', () => {
  assert.equal(wipeRightInitialClipPath(), 'inset(0 100% 0 0)');
  assert.equal(wipeRightFinalClipPath(), 'inset(0)');
});

test('zoom-fade initial / final state', () => {
  assert.deepEqual(zoomFadeInitial(), {
    transform: 'scale(1.05)',
    filter: 'blur(10px)',
    opacity: '0',
  });
  assert.deepEqual(zoomFadeFinal(), {
    transform: 'scale(1)',
    filter: 'blur(0)',
    opacity: '1',
  });
});

test('curtain clip-path values', () => {
  assert.equal(curtainInitialClipPath(), 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)');
  assert.equal(
    curtainFinalClipPath(),
    'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
  );
});

test('pixelate initial / final state', () => {
  assert.deepEqual(pixelateInitial(), {
    filter: 'contrast(20) saturate(0) blur(6px)',
    opacity: '0',
  });
  assert.deepEqual(pixelateFinal(), {
    filter: 'contrast(1) saturate(1) blur(0)',
    opacity: '1',
  });
});

test('transitionFor builds the standard CSS transition string', () => {
  assert.equal(transitionFor('clip-path'), 'clip-path 800ms cubic-bezier(0.16, 1, 0.3, 1)');
  assert.equal(transitionFor('opacity', 250), 'opacity 250ms cubic-bezier(0.16, 1, 0.3, 1)');
  assert.equal(transitionFor('transform', 500, 'ease-out'), 'transform 500ms ease-out');
});

test('transitionsFor joins multiple properties with ", "', () => {
  assert.equal(
    transitionsFor(['transform', 'filter', 'opacity']),
    'transform 800ms cubic-bezier(0.16, 1, 0.3, 1), '
      + 'filter 800ms cubic-bezier(0.16, 1, 0.3, 1), '
      + 'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)'
  );
});

test('transitionsFor skips empty entries', () => {
  assert.equal(transitionsFor(['filter', 'opacity']), 'filter 800ms cubic-bezier(0.16, 1, 0.3, 1), opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)');
});
