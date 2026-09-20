// WITF viewer pure helpers — extracted from scripts/media/witf-viewer.js.
//
// These tests exercise the helpers in isolation, using a linkedom document so we
// do not need a real browser. The orchestrator (scripts/media/witf-viewer.js) is
// intentionally not tested here because it owns a three.js scene and async GLB
// load — those concerns are verified manually on each deploy via the e2e suite
// (`tests/browser/acceptance.spec.js`) which mounts the real home page and asserts
// the WITF viewer renders without crashing.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseHTML } from 'linkedom';
import {
  withTimeout,
  webglSupported,
  prefersReducedMotion,
  isCoarsePointer,
  showPoster,
  createLoadingIndicator,
  createHint,
  fadeHint,
  createLazyLoadGate,
  createVisibilityToggle,
  _resetWebglCacheForTests,
} from '../scripts/media/witf-viewer-helpers.js';
import {
  POSTER_SRC,
  POSTER_ALT,
  GLB_PATH,
  VIEWER_GATE_MARGIN,
  THREE_LOAD_TIMEOUT_MS,
} from '../scripts/media/witf-poster.js';

// Build a minimal DOM environment for tests that touch the DOM. linkedom gives
// us document + element factories; we do not need to attach to globalThis because
// every helper accepts a container argument or pulls document off the container.
const dom = () => {
  const { document } = parseHTML('<html><body></body></html>');
  return document;
};

// withTimeout: rejects when the inner promise does not settle within ms.
// The timer must always clear so a late rejection cannot surface as an
// unhandled one after the race has already resolved.
test('withTimeout rejects after ms and clears the timer', async () => {
  const slow = new Promise(() => {}); // never resolves
  await assert.rejects(
    () => withTimeout(slow, 30, 'slow test'),
    /slow test timed out after 30ms/,
  );
});

test('withTimeout resolves when the inner promise resolves first', async () => {
  const fast = Promise.resolve('ok');
  const result = await withTimeout(fast, 1000, 'fast test');
  assert.equal(result, 'ok');
});

// webglSupported: cached, single probe per session, releases the probe context.
// We stub createElement so the test does not depend on real WebGL availability.
test('webglSupported caches the probe result across calls', () => {
  _resetWebglCacheForTests();
  const calls = [];
  const fakeCreate = (tag) => {
    calls.push(tag);
    return {
      getContext: () => ({ getExtension: () => ({ loseContext: () => {} }) }),
    };
  };
  const first = webglSupported({ createElement: fakeCreate });
  const second = webglSupported({ createElement: fakeCreate });
  assert.equal(first, true);
  assert.equal(second, true);
  assert.equal(calls.length, 1, 'createElement must only fire on the first probe');
});

test('webglSupported returns false when getContext throws', () => {
  _resetWebglCacheForTests();
  const fakeCreate = () => ({ getContext: () => { throw new Error('no webgl'); } });
  assert.equal(webglSupported({ createElement: fakeCreate }), false);
});

// prefersReducedMotion + isCoarsePointer: take a MediaQueryList shape and read
// its `matches` boolean. The matchMedia call only fires when no mq is supplied.
test('prefersReducedMotion reads from the supplied MediaQueryList', () => {
  assert.equal(prefersReducedMotion({ matches: true }), true);
  assert.equal(prefersReducedMotion({ matches: false }), false);
});

test('isCoarsePointer reads from the supplied MediaQueryList', () => {
  assert.equal(isCoarsePointer({ matches: true }), true);
  assert.equal(isCoarsePointer({ matches: false }), false);
});

// showPoster: replaces container contents with a single image carrying the right
// src/alt and the right lazy/async hints so the browser can defer the load.
test('showPoster mounts a single lazy-loaded image with the canonical src/alt', () => {
  const document = dom();
  const container = document.createElement('div');
  // Pre-existing child proves the poster REPLACES, not appends.
  const old = document.createElement('p');
  old.textContent = 'placeholder';
  container.appendChild(old);
  const img = showPoster(container);
  assert.equal(container.children.length, 1, 'pre-existing children must be removed');
  assert.equal(img.getAttribute('src'), POSTER_SRC, 'src matches POSTER_SRC constant');
  assert.equal(img.getAttribute('alt'), POSTER_ALT, 'alt matches POSTER_ALT constant');
  assert.equal(img.getAttribute('loading'), 'lazy', 'poster must defer');
  assert.equal(img.getAttribute('decoding'), 'async', 'poster must decode async');
  assert.match(img.style.cssText || '', /aspect-ratio:16\/9/, 'poster must lock aspect ratio');
});

test('showPoster accepts an override src/alt for testing or alternate assets', () => {
  const document = dom();
  const container = document.createElement('div');
  const img = showPoster(container, { src: '/test/poster.webp', alt: 'test alt' });
  assert.equal(img.getAttribute('src'), '/test/poster.webp');
  assert.equal(img.getAttribute('alt'), 'test alt');
});

// createLoadingIndicator: appends a div with the loading class and the default
// (or overridden) text. The orchestrator removes this element on success.
test('createLoadingIndicator appends a div with the loading class', () => {
  const document = dom();
  const container = document.createElement('div');
  const el = createLoadingIndicator(container);
  assert.ok(el, 'returns the created element');
  assert.equal(el.className, 'witf-viewer-loading');
  assert.match(el.textContent, /Loading 3D model/, 'default text indicates 3D model');
  assert.ok(container.contains(el), 'indicator must be attached to the container');
});

test('createLoadingIndicator honours an override text', () => {
  const document = dom();
  const container = document.createElement('div');
  const el = createLoadingIndicator(container, 'Custom loading copy');
  assert.equal(el.textContent, 'Custom loading copy');
});

// createHint: picks the right copy for the visitor's pointer type. Coarse-pointer
// visitors (touch) get pinch-to-zoom; mouse visitors get drag-and-scroll.
test('createHint uses touch copy for coarse pointers', () => {
  const document = dom();
  const container = document.createElement('div');
  const el = createHint(container, { coarse: true });
  assert.match(el.textContent, /pinch/i, 'touch copy mentions pinch');
  assert.doesNotMatch(el.textContent, /scroll/i, 'touch copy does not mention scroll');
});

test('createHint uses mouse copy for fine pointers', () => {
  const document = dom();
  const container = document.createElement('div');
  const el = createHint(container, { coarse: false });
  assert.match(el.textContent, /scroll/i, 'mouse copy mentions scroll');
  assert.doesNotMatch(el.textContent, /pinch/i, 'mouse copy does not mention pinch');
});

// fadeHint: idempotent — once faded, subsequent calls must not double-apply the
// hidden class. The orchestrator may call fadeHint from both the interaction
// listener and the auto-fade timer; they race on visibility.
test('fadeHint applies the hidden class once and is idempotent', () => {
  const document = dom();
  const hint = document.createElement('div');
  hint.className = 'witf-viewer-hint';
  fadeHint(hint, { hiddenClass: 'witf-viewer-hint--hidden', fadeMs: 0 });
  assert.match(hint.className, /witf-viewer-hint--hidden/, 'hidden class applied');
  // Capture the class after the first call so we can prove it does not change.
  const after = hint.className;
  fadeHint(hint, { hiddenClass: 'witf-viewer-hint--hidden', faded: true, fadeMs: 0 });
  assert.equal(hint.className, after, 'second call must not re-apply or remove the class');
});

test('fadeHint is a no-op when hintEl is null', () => {
  // Should not throw.
  fadeHint(null, { hiddenClass: 'witf-viewer-hint--hidden' });
});

// createLazyLoadGate: returns an observer that fires onReady once when the
// container intersects. We stub IntersectionObserver so the test does not need
// a browser; the stub captures the observe() call and lets us trigger the
// intersection manually.
test('createLazyLoadGate fires onReady when the observer reports intersection', () => {
  const document = dom();
  const container = document.createElement('div');
  let registeredCallback = null;
  let observedTarget = null;
  class StubIO {
    constructor(cb, opts) {
      registeredCallback = cb;
      this.opts = opts;
    }
    observe(target) { observedTarget = target; }
    disconnect() {}
  }
  let ready = null;
  const gate = createLazyLoadGate((el) => { ready = el; }, { io: StubIO });
  assert.equal(gate.kind, 'io');
  gate.observe(container);
  assert.equal(observedTarget, container, 'gate must observe the container');
  assert.ok(registeredCallback, 'gate must register a callback');
  // Now simulate an intersection event.
  registeredCallback([{ isIntersecting: true }]);
  assert.equal(ready, container, 'onReady must fire with the container');
});

test('createLazyLoadGate disconnects after firing so the observer does not leak', () => {
  const document = dom();
  const container = document.createElement('div');
  let disconnectCount = 0;
  class StubIO {
    constructor(cb) { this.cb = cb; }
    observe() {}
    disconnect() { disconnectCount += 1; }
  }
  const gate = createLazyLoadGate(() => {}, { io: StubIO });
  gate.observe(container);
  gate.disconnect();
  assert.ok(disconnectCount >= 1, 'disconnect() must call the underlying observer disconnect');
});

// createVisibilityToggle: builds an observer that flips a single boolean via the
// supplied onChange callback. The animation loop reads the flag to skip draws
// when the container is offscreen — the core efficiency win of the WITF viewer.
test('createVisibilityToggle reports isIntersecting via onChange', () => {
  const document = dom();
  const container = document.createElement('div');
  let registeredCallback = null;
  class StubIO {
    constructor(cb) { registeredCallback = cb; }
    observe() {}
    disconnect() {}
  }
  const changes = [];
  const toggle = createVisibilityToggle(container, {
    onChange: (enabled) => changes.push(enabled),
    io: StubIO,
  });
  assert.equal(toggle.kind, 'io');
  // Simulate visibility events: onscreen then offscreen.
  registeredCallback([{ isIntersecting: true }, { isIntersecting: false }]);
  assert.deepEqual(changes, [true, false], 'onChange must fire for each entry');
});

test('createVisibilityToggle returns a noop when IntersectionObserver is unavailable', () => {
  const document = dom();
  const container = document.createElement('div');
  const toggle = createVisibilityToggle(container, { io: null });
  assert.equal(toggle.kind, 'noop', 'no IO must produce a noop toggle');
});

// Constants: the asset URL surface is small but stable. Lock it down so a
// rename of the GLB path cannot ship silently.
test('WITF asset constants point at the canonical paths and timings', () => {
  assert.match(POSTER_SRC, /\/public\/projects\/witf\/hero-blender\.webp$/);
  assert.match(POSTER_ALT, /WITF Board split Alice keyboard/);
  assert.match(GLB_PATH, /\/public\/projects\/witf\/witf-keyboard\.glb$/);
  assert.match(VIEWER_GATE_MARGIN, /^\d+px$/, 'gate margin must be a CSS length');
  assert.equal(typeof THREE_LOAD_TIMEOUT_MS, 'number');
  assert.ok(THREE_LOAD_TIMEOUT_MS >= 1000 && THREE_LOAD_TIMEOUT_MS <= 30_000,
    'three.js timeout must be between 1s and 30s');
});
