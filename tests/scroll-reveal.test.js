/**
 * The scroll-reveal orchestrator, exercised through its public API.
 *
 * `scripts/scroll-reveal.js` owns the IntersectionObserver and
 * MutationObserver lifecycle and the scroll safety net; its pure helpers
 * are covered by `tests/scroll-reveal-helpers.test.js`. The module reaches
 * for three browser globals Node does not provide (`IntersectionObserver`,
 * `MutationObserver`, `window`), each stubbed below with a recorder so the
 * test can drive the observer callbacks by hand and then assert on what the
 * module asked the browser to do.
 *
 * The module is a singleton: one observer, one mutation observer, one scroll
 * binding, one initialized flag, so a second `initScrollReveal()` call is a
 * refresh rather than a fresh start. That is also how a browser uses it: one
 * instance per page. The tests therefore share a single instance, loaded once
 * at the top of the file, and follow the order a page would: the system
 * initializes, then content arrives and is refreshed.
 *
 * The assertions describe behavior a reader gets: an element marked for reveal
 * is hidden until it enters the viewport, a reader who prefers reduced motion
 * sees it immediately, and an element already on screen at load does not stay
 * invisible.
 */

import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { SELECTOR } from '../scripts/scroll-reveal-helpers.js';

// One module instance for the file. The test runner gives each test file its
// own module registry, so this stays a true singleton without the coverage
// cost of re-importing the module by path.
const reveal = await import('../scripts/scroll-reveal.js');

const HIDDEN = 'reveal-hidden';
const VISIBLE = 'reveal-visible';
const REVEAL = 'data-reveal';
const OFFSCREEN = { top: 2000, bottom: 2100 };

/** Records what it was asked to observe; the test delivers entries by hand. */
class FakeIntersectionObserver {
  constructor(callback, options) {
    Object.assign(this, {
      callback,
      options,
      observed: [],
      unobserved: [],
      disconnected: false,
    });
    FakeIntersectionObserver.instances.push(this);
  }

  observe(el) { this.observed.push(el); }
  unobserve(el) { this.unobserved.push(el); }
  disconnect() { this.disconnected = true; }

  /** Deliver an intersecting entry for `el`. */
  enter(el) { this.callback([{ target: el, isIntersecting: true }], this); }
  /** Deliver a non-intersecting entry for `el`. */
  leave(el) { this.callback([{ target: el, isIntersecting: false }], this); }

  static latest() { return FakeIntersectionObserver.instances.at(-1); }
}
FakeIntersectionObserver.instances = [];

/** Records the observed target; the test delivers mutations by hand. */
class FakeMutationObserver {
  constructor(callback) {
    Object.assign(this, { callback, target: null, options: null });
    FakeMutationObserver.instances.push(this);
  }

  observe(target, options) {
    this.target = target;
    this.options = options;
  }

  disconnect() { this.target = null; }

  /** Deliver added nodes to the observer. */
  add(nodes) { this.callback([{ addedNodes: nodes }], this); }

  static latest() { return FakeMutationObserver.instances.at(-1); }
}
FakeMutationObserver.instances = [];

// The observers the module most recently constructed, and the two shape
// assertions the tests make about an element's reveal state.
const observer = () => FakeIntersectionObserver.latest();
const mutationObserver = () => FakeMutationObserver.latest();
const has = (el, cls) => el.classList.contains(cls);

/** Fire every scroll handler the module registered. */
const scroll = () => scrollListeners.forEach((handler) => handler());

const GLOBAL_KEYS = [
  'document',
  'window',
  'IntersectionObserver',
  'MutationObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'Node',
];
const saved = Object.fromEntries(GLOBAL_KEYS.map((key) => [key, globalThis[key]]));

let document = null;
let scrollListeners = [];
let reducedMotion = false;

/** Give an element a viewport rectangle, since linkedom has no layout. */
function setRect(el, rect) {
  el.getBoundingClientRect = () => ({
    top: rect.top,
    bottom: rect.bottom,
    left: 0,
    right: 0,
    width: rect.width ?? 100,
    height: rect.height ?? 50,
  });
}

/** Build a reveal element carrying any extra attributes and append it. */
function addReveal(attrs = {}) {
  const el = document.createElement('div');
  el.setAttribute(REVEAL, 'up');
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  document.body.appendChild(el);
  return el;
}

// The elements that exist when the page initializes. One is off screen, one
// is on screen: the second is revealed by the up-front sweep at init.
let initHidden = null;
let initVisible = null;

before(() => {
  ({ document } = parseHTML('<html><body></body></html>'));
  globalThis.document = document;
  globalThis.window = {
    document,
    innerHeight: 800,
    matchMedia: (query) => ({
      matches: reducedMotion && query.includes('prefers-reduced-motion'),
      media: query,
    }),
    addEventListener: (type, handler) => {
      if (type === 'scroll') scrollListeners.push(handler);
    },
  };
  globalThis.IntersectionObserver = FakeIntersectionObserver;
  globalThis.MutationObserver = FakeMutationObserver;
  globalThis.Node = { ELEMENT_NODE: 1 };
  // The module coalesces scans onto an animation frame. Running the callback
  // immediately keeps the test synchronous and deterministic.
  globalThis.requestAnimationFrame = (cb) => {
    cb();
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {};

  initHidden = addReveal();
  initVisible = addReveal();
  setRect(initVisible, { top: 100, bottom: 200 });

  reveal.initScrollReveal();
});

after(() => {
  for (const key of GLOBAL_KEYS) {
    if (saved[key] === undefined) delete globalThis[key];
    else globalThis[key] = saved[key];
  }
});

test('init hides an element that is not yet on screen', () => {
  assert.equal(has(initHidden, HIDDEN), true, 'a pristine element is hidden before it is seen');
  assert.equal(has(initHidden, VISIBLE), false, 'a pristine element is not visible yet');
  assert.ok(observer().observed.includes(initHidden), 'the hidden element is handed to the observer');
});

test('an element that enters the viewport becomes visible', () => {
  const el = addReveal();
  reveal.refreshObserver();
  assert.equal(has(el, HIDDEN), true);

  observer().enter(el);

  assert.equal(has(el, VISIBLE), true, 'the element is revealed once it intersects');
  assert.equal(has(el, HIDDEN), false, 'the hidden state is removed when the element is revealed');
});

test('an element that leaves the viewport stays hidden', () => {
  const el = addReveal();
  reveal.refreshObserver();

  observer().leave(el);

  assert.equal(has(el, VISIBLE), false, 'a non-intersecting element is not revealed');
});

test('an element already on screen at load is revealed', () => {
  assert.equal(
    has(initVisible, VISIBLE),
    true,
    'an element inside the viewport is revealed without scrolling',
  );
});

test('a reader who prefers reduced motion sees elements immediately', () => {
  reducedMotion = true;
  try {
    const el = addReveal();
    reveal.refreshObserver();
    assert.equal(has(el, HIDDEN), false, 'reduced motion skips the hidden state');
    assert.equal(has(el, VISIBLE), true, 'reduced motion reveals the element outright');
  } finally {
    reducedMotion = false;
  }
});

test('a custom reveal distance is published as a CSS variable', () => {
  const el = addReveal({ 'data-reveal-distance': '48' });
  reveal.refreshObserver();
  assert.equal(
    el.style.getPropertyValue('--reveal-distance'),
    '48px',
    'the custom distance is published to CSS',
  );
});

test('a stagger delay is published as a transition delay', () => {
  const el = addReveal({ 'data-reveal-delay': '120' });
  reveal.refreshObserver();

  observer().enter(el);

  assert.equal(
    el.style.transitionDelay,
    '120ms',
    'the stagger delay reaches the element when it is revealed',
  );
});

test('an element below the fold stays hidden until it is scrolled to', () => {
  const el = addReveal();
  setRect(el, OFFSCREEN);
  reveal.refreshObserver();

  assert.equal(has(el, VISIBLE), false, 'an element below the viewport is not revealed');
  assert.equal(has(el, HIDDEN), true, 'an element below the viewport stays hidden');
});

test('the scroll safety net reveals an element that scrolls into view', () => {
  const el = addReveal();
  setRect(el, OFFSCREEN);
  reveal.refreshObserver();
  assert.equal(has(el, VISIBLE), false);

  // The element scrolls up into the viewport.
  setRect(el, { top: 300, bottom: 400 });
  scroll();

  assert.equal(has(el, VISIBLE), true, 'scrolling the element into view reveals it');
});

test('a non-rendering element is left alone by the scroll safety net', () => {
  const el = addReveal();
  setRect(el, { top: 100, bottom: 200, width: 0, height: 0 });
  reveal.refreshObserver();

  scroll();

  assert.equal(has(el, VISIBLE), false, 'an element with no box is never revealed');
});

test('a reveal element inside an added subtree is picked up', () => {
  // The mutation path scans the added node's descendants. An element's own
  // querySelectorAll does not include the element itself, so the reveal
  // element lives inside a wrapper that is added to the document.
  const wrapper = document.createElement('div');
  const el = document.createElement('div');
  el.setAttribute(REVEAL, 'up');
  wrapper.appendChild(el);
  document.body.appendChild(wrapper);

  mutationObserver().add([wrapper]);

  assert.equal(has(el, HIDDEN), true, 'a reveal element added later is hidden before it is seen');
  assert.ok(observer().observed.includes(el), 'the added element is handed to the observer');
});

test('a text node added to the document is ignored', () => {
  const count = observer().observed.length;

  mutationObserver().add([document.createTextNode('plain text')]);

  assert.equal(observer().observed.length, count, 'a text node is not observed');
});

test('the observer is configured with the documented options', () => {
  const { threshold, rootMargin } = observer().options;
  assert.equal(threshold, 0.1, 'the reveal threshold is 0.1');
  assert.equal(rootMargin, '0px 0px -40px 0px', 'the reveal waits for the lower line');
});

test('the mutation observer watches the document body for added children', () => {
  const mutations = mutationObserver();
  assert.equal(mutations.target.tagName, 'BODY', 'the body is watched');
  assert.equal(mutations.options.childList, true, 'added children are noticed');
  assert.equal(mutations.options.subtree, true, 'nested additions are noticed');
});

test('a second init call refreshes rather than duplicating the observer', () => {
  const count = FakeIntersectionObserver.instances.length;

  reveal.initScrollReveal();

  assert.equal(
    FakeIntersectionObserver.instances.length,
    count,
    'a repeat init reuses the existing observer',
  );
});

test('the reveal selector matches the documented attribute', () => {
  assert.equal(SELECTOR, '[data-reveal]', 'the selector is the documented one');
});
