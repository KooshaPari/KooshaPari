import test from 'node:test';
import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// Minimal FakeImg for testing without a real browser.
// Mirrors the element contract used by dom.js (addEventListener,
// removeAttribute, classList, dataset) so onImageFallback can be
// exercised in plain Node.js.
// ---------------------------------------------------------------------------

class FakeImg {
  constructor() {
    this.nodeType = 1;
    this.tagName = 'IMG';
    this._attrs = new Map();
    this._classes = new Set();
    this._listeners = {};
    this.dataset = {};
    this.parentElement = null;
  }
  getAttribute(k) { return this._attrs.get(k) ?? null; }
  setAttribute(k, v) { this._attrs.set(k, String(v)); }
  removeAttribute(k) { this._attrs.delete(k); }
  addEventListener(type, fn, opts) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push({ fn, once: opts?.once });
  }
  removeEventListener(type, fn) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter((l) => l.fn !== fn);
  }
  get classList() {
    const self = this;
    return {
      add(c) { self._classes.add(c); },
      has(c) { return self._classes.has(c); },
      remove(c) { self._classes.delete(c); },
    };
  }
  /** Simulate the browser firing an 'error' event on the img. */
  _dispatchError() {
    const handlers = [...(this._listeners['error'] ?? [])];
    for (const h of handlers) {
      h.fn();
      if (h.once) {
        this._listeners['error'] = (this._listeners['error'] ?? []).filter(
          (l) => l.fn !== h.fn,
        );
      }
    }
  }
}

const { onImageFallback } = await import('../scripts/components/dom.js');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('onImageFallback returns img element unchanged on success path', () => {
  const img = new FakeImg();
  img.setAttribute('src', '/real.webp');
  img.setAttribute('alt', 'A real photo');
  const result = onImageFallback(img);
  assert.strictEqual(result, img, 'should return the same element for chaining');
  assert.strictEqual(img.getAttribute('src'), '/real.webp', 'src untouched before error');
});

test('on error: broken src removed to avoid browser broken-image icon', () => {
  const img = new FakeImg();
  img.setAttribute('src', '/missing.webp');
  img.setAttribute('alt', 'Missing product photo');
  onImageFallback(img);
  img._dispatchError();
  assert.strictEqual(img.getAttribute('src'), null, 'src removed on error');
  assert.strictEqual(img.getAttribute('srcset'), null, 'srcset removed on error');
});

test('on error: meaningful alt preserved and promoted to title tooltip', () => {
  const img = new FakeImg();
  img.setAttribute('src', '/missing.webp');
  img.setAttribute('alt', 'GMK Arch keycap set overview');
  onImageFallback(img);
  img._dispatchError();
  assert.strictEqual(img.getAttribute('alt'), 'GMK Arch keycap set overview');
  assert.strictEqual(img.getAttribute('title'), 'GMK Arch keycap set overview');
});

test('on error: fallback class and data-fallback attribute applied', () => {
  const img = new FakeImg();
  img.setAttribute('src', '/missing.webp');
  img.setAttribute('alt', 'Test image');
  onImageFallback(img);
  img._dispatchError();
  assert.ok(img.classList.has('img-fallback'), 'fallback class present');
  assert.strictEqual(img.dataset.fallback, 'true');
});

test('on error: custom fallbackClass option respected', () => {
  const img = new FakeImg();
  img.setAttribute('src', '/missing.webp');
  img.setAttribute('alt', 'Custom class');
  onImageFallback(img, { fallbackClass: 'my-fallback' });
  img._dispatchError();
  assert.ok(img.classList.has('my-fallback'));
  assert.ok(!img.classList.has('img-fallback'));
});

test('on error: short or empty alt does not set title', () => {
  const img = new FakeImg();
  img.setAttribute('src', '/missing.webp');
  img.setAttribute('alt', '');
  onImageFallback(img);
  img._dispatchError();
  assert.strictEqual(img.getAttribute('title'), null, 'no title for empty alt');
});

test('on error: single-char alt also too short for title', () => {
  const img = new FakeImg();
  img.setAttribute('src', '/missing.webp');
  img.setAttribute('alt', 'x');
  onImageFallback(img);
  img._dispatchError();
  assert.strictEqual(img.getAttribute('title'), null, 'no title for single-char alt');
});

test('error handler fires only once even on repeated errors', () => {
  const img = new FakeImg();
  img.setAttribute('src', '/missing.webp');
  img.setAttribute('alt', 'Once only');
  onImageFallback(img);
  img._dispatchError();
  assert.ok(img.classList.has('img-fallback'));
  // Second dispatch should be a no-op (handler was removed)
  img._dispatchError();
  assert.ok(img.classList.has('img-fallback'), 'stable after second error');
});

test('successful image: no fallback state applied', () => {
  const img = new FakeImg();
  img.setAttribute('src', '/real.webp');
  img.setAttribute('alt', 'Loaded image');
  onImageFallback(img);
  // No error dispatched
  assert.strictEqual(img.getAttribute('src'), '/real.webp');
  assert.strictEqual(img.dataset.fallback, undefined, 'no fallback flag');
  assert.ok(!img.classList.has('img-fallback'));
});

test('onImageFallback handles null and non-element gracefully', () => {
  assert.doesNotThrow(() => onImageFallback(null));
  assert.doesNotThrow(() => onImageFallback(undefined));
  assert.doesNotThrow(() => onImageFallback({}));
  assert.strictEqual(onImageFallback(null), null);
  assert.strictEqual(onImageFallback(undefined), undefined);
});

test('returns input passthrough for non-element with no addEventListener', () => {
  const bare = { tagName: 'IMG' };
  const result = onImageFallback(bare);
  assert.strictEqual(result, bare, 'passthrough for non-element');
});

test('prerender compatibility: handler attaches in Node.js without browser globals', () => {
  // Node.js test runner has no real window/document; the helper
  // must still attach the listener without throwing.
  const img = new FakeImg();
  img.setAttribute('src', '/prerender.webp');
  img.setAttribute('alt', 'Prerender safe');
  assert.doesNotThrow(() => onImageFallback(img));
  // Handler is attached but will never fire in prerender
  assert.strictEqual(img.getAttribute('src'), '/prerender.webp');
});

test('el()-style chaining: onImageFallback(el(...)) returns element', () => {
  // Simulate the el() return pattern callers will use
  const img = new FakeImg();
  img.setAttribute('src', '/photo.webp');
  img.setAttribute('alt', 'Chained');
  const result = onImageFallback(img);
  assert.strictEqual(result, img);
  // Verify the element still works normally
  result._dispatchError();
  assert.ok(result.classList.has('img-fallback'));
});

test('layout preserved: width/height attributes untouched on error', () => {
  const img = new FakeImg();
  img.setAttribute('src', '/missing.webp');
  img.setAttribute('alt', 'Layout test');
  img.setAttribute('width', '1200');
  img.setAttribute('height', '800');
  onImageFallback(img);
  img._dispatchError();
  assert.strictEqual(img.getAttribute('width'), '1200', 'width preserved');
  assert.strictEqual(img.getAttribute('height'), '800', 'height preserved');
});

test('alt text fully preserved on error for accessibility', () => {
  const longAlt = 'ShareCLI process runtime material boundary showing concurrent coding-agent resource observation.';
  const img = new FakeImg();
  img.setAttribute('src', '/missing.webp');
  img.setAttribute('alt', longAlt);
  onImageFallback(img);
  img._dispatchError();
  assert.strictEqual(img.getAttribute('alt'), longAlt, 'full alt text preserved');
});

// ---------------------------------------------------------------------------
// <picture><source> srcset neutralisation tests
// ---------------------------------------------------------------------------

/** Minimal FakePicture that supports querySelectorAll('source'). */
class FakePicture {
  constructor() {
    this.nodeType = 1;
    this.tagName = 'PICTURE';
    this._sources = [];
  }
  appendSource(srcset) {
    const src = new FakeImg();
    src.tagName = 'SOURCE';
    src.setAttribute('srcset', srcset);
    this._sources.push(src);
  }
  querySelectorAll() { return this._sources; }
}

test('on error inside <picture>: sibling source srcset values neutralised', () => {
  const picture = new FakePicture();
  picture.appendSource('/mobile.webp');
  picture.appendSource('/desktop.webp');
  const img = new FakeImg();
  img.parentElement = picture;
  img.setAttribute('src', '/broken.webp');
  img.setAttribute('alt', 'Material boundary image');
  onImageFallback(img);
  img._dispatchError();
  // img src removed
  assert.strictEqual(img.getAttribute('src'), null, 'img src removed');
  // both source srcset neutralised
  for (const s of picture._sources) {
    assert.strictEqual(s.getAttribute('srcset'), null, `source srcset cleared`);
  }
  // fallback state applied
  assert.ok(img.classList.has('img-fallback'));
  assert.strictEqual(img.dataset.fallback, 'true');
});

test('on error outside <picture>: source srcset untouched (no-op parent)', () => {
  const img = new FakeImg();
  img.parentElement = { tagName: 'DIV', querySelectorAll: () => [] };
  img.setAttribute('src', '/broken.webp');
  img.setAttribute('alt', 'Plain image');
  onImageFallback(img);
  img._dispatchError();
  assert.strictEqual(img.getAttribute('src'), null);
  assert.ok(img.classList.has('img-fallback'));
});

test('on error: img with no parentElement still works', () => {
  const img = new FakeImg();
  img.parentElement = null;
  img.setAttribute('src', '/broken.webp');
  img.setAttribute('alt', 'No parent');
  onImageFallback(img);
  img._dispatchError();
  assert.strictEqual(img.getAttribute('src'), null);
  assert.ok(img.classList.has('img-fallback'));
});
