import test from 'node:test';
import assert from 'node:assert/strict';

import { DIAGRAM_TOKENS, isMobileViewport } from '../scripts/media/diagram-tokens.js';

test('DIAGRAM_TOKENS exposes the full set of surfaces the diagrams consume', () => {
  assert.equal(DIAGRAM_TOKENS.mobileBreakpoint, 600);
  assert.equal(typeof DIAGRAM_TOKENS.node, 'object');
  assert.equal(typeof DIAGRAM_TOKENS.text, 'object');
  assert.equal(typeof DIAGRAM_TOKENS.index, 'object');
  assert.equal(typeof DIAGRAM_TOKENS.edge, 'object');
  assert.equal(typeof DIAGRAM_TOKENS.fallback, 'object');
  assert.equal(typeof DIAGRAM_TOKENS.caption, 'object');
});

test('DIAGRAM_TOKENS.node.uses CSS variable references for themed rendering', () => {
  assert.equal(DIAGRAM_TOKENS.node.fill, 'var(--surface)');
  assert.equal(DIAGRAM_TOKENS.node.stroke, 'var(--rule)');
});

test('DIAGRAM_TOKENS.edge references the shared arrow marker', () => {
  assert.equal(DIAGRAM_TOKENS.edge.markerEnd, 'url(#diagram-arrow)');
});

test('isMobileViewport returns false when there is no matchMedia API (SSR)', () => {
  assert.equal(isMobileViewport(null), false);
  assert.equal(isMobileViewport({}), false);
});

test('isMobileViewport returns true when matchMedia reports a match', () => {
  const win = { matchMedia: () => ({ matches: true }) };
  assert.equal(isMobileViewport(win), true);
});

test('isMobileViewport returns false when matchMedia reports no match', () => {
  const win = { matchMedia: () => ({ matches: false }) };
  assert.equal(isMobileViewport(win), false);
});

test('isMobileViewport uses the shared breakpoint constant', () => {
  let queriedWith;
  const win = {
    matchMedia: (q) => { queriedWith = q; return { matches: true }; },
  };
  isMobileViewport(win);
  assert.equal(queriedWith, `(max-width: ${DIAGRAM_TOKENS.mobileBreakpoint}px)`);
});
