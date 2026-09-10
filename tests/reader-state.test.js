import test from 'node:test';
import assert from 'node:assert/strict';

test('Reader initializes, honors saved choices, and handles keyboard focus', async () => {
  const original = { document: globalThis.document, window: globalThis.window, localStorage: globalThis.localStorage };
  try {
    for (const saved of [null, 'false', 'true']) {
      const handlers = [];
      const storage = new Map(saved === null ? [] : [['koosha-atelier-reader', saved]]);
      const heading = { setAttribute() {}, focus() { this.focused = true; } };
      const toggle = { focus() { this.focused = true; } };
      globalThis.localStorage = { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) };
      globalThis.window = { matchMedia: () => ({ matches: true }) };
      globalThis.document = {
        documentElement: { dataset: {} }, body: { appendChild() {} },
        getElementById: id => id === 'reader-toggle' ? toggle : null,
        createElement: () => ({ setAttribute() {}, style: {} }),
        querySelector: selector => selector.startsWith('#view-root') ? heading : null,
        addEventListener: (_, callback) => handlers.push(callback),
      };
      const { createReaderState } = await import(`../scripts/reader-state.js?scenario=${saved}`);
      const state = createReaderState();
      assert.equal(state.get(), saved !== 'false');
      state.set(false);
      const key = (options = {}) => {
        const event = { key: 'r', target: { closest: () => null }, preventDefault() { this.defaultPrevented = true; }, ...options };
        handlers.forEach(handler => handler(event));
      };
      key({ ctrlKey: true });
      key({ target: { isContentEditable: true } });
      key({ target: { closest: () => ({}) } });
      assert.equal(state.get(), false);
      key();
      assert.equal(state.get(), true);
      assert.equal(heading.focused, true);
      assert.equal(storage.get('koosha-atelier-reader'), 'true');
      key({ key: 'Escape' });
      assert.equal(state.get(), false);
      assert.equal(toggle.focused, true);
      assert.equal(storage.get('koosha-atelier-reader'), 'false');
    }
  } finally { Object.assign(globalThis, original); }
});
