import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { injectConstructionGate } from '../scripts/construction-shell.js';
import { initializeConstructionGate } from '../scripts/construction-gate.js';

test('every HTML shell receives first-paint gate and native Continue fallback once', () => {
  const html = injectConstructionGate('<html><head></head><body><main>Deep route</main></body></html>');
  assert.equal(injectConstructionGate(html), html);
  const { document } = parseHTML(html);
  assert.equal(document.querySelector('#construction-site main').textContent, 'Deep route');
  assert.equal(document.querySelector('#construction-gate').getAttribute('role'), 'dialog');
  assert.equal(document.querySelector('#construction-continue').getAttribute('href'), '#construction-entered');
  assert.ok(document.querySelector('head script').textContent.includes('sessionStorage'));
});

test('Continue restores background and persists only for the session', () => {
  const { document } = parseHTML(injectConstructionGate('<html><head></head><body><main>Site</main></body></html>'));
  let stored;
  const storage = { getItem: () => null, setItem: (key, value) => { stored = [key, value]; } };
  initializeConstructionGate(document, storage);
  const site = document.querySelector('#construction-site');
  assert.equal(site.inert, true);
  document.querySelector('#construction-continue').click();
  assert.equal(site.inert, false);
  assert.equal(document.documentElement.dataset.construction, 'entered');
  assert.deepEqual(stored, ['portfolio-construction-entered', 'yes']);
});

test('blocked session storage getter never prevents entry', () => {
  const { document } = parseHTML(injectConstructionGate('<html><head></head><body><main>Site</main></body></html>'));
  const original = globalThis.sessionStorage;
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get() { throw Error('denied'); } });
  try {
    initializeConstructionGate(document);
    document.querySelector('#construction-continue').click();
    assert.equal(document.querySelector('#construction-site').inert, false);
  } finally {
    Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: original });
  }
});

