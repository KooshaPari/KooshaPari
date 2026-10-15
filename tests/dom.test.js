// dom.js — the foundational DOM factory every view and component builds on.
// These tests pin the three behaviours the rest of the codebase relies on:
// el()'s attribute and child coercion rules, and the $ / $$ query scoping.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { $, $$, el } from '../scripts/components/dom.js';

const dom = (body = '') => {
  const { document, window } = parseHTML(`<html><body>${body}</body></html>`);
  globalThis.document = document;
  globalThis.window = window;
  return document;
};

/* ─── el(): attributes ─── */

test('el creates the requested tag and returns a node', () => {
  dom();
  const node = el('section', { id: 'hero' });
  assert.equal(node.tagName.toLowerCase(), 'section');
  assert.equal(node.getAttribute('id'), 'hero');
});

test('el sets class via className rather than a class attribute literal', () => {
  dom();
  const node = el('div', { class: 'a b' });
  assert.equal(node.className, 'a b', 'the class shortcut must populate className');
  assert.equal(node.getAttribute('class'), 'a b');
});

test('el skips null and undefined attributes but keeps empty strings and zero', () => {
  dom();
  const node = el('div', { 'data-missing': null, 'data-absent': undefined, 'data-empty': '', 'data-zero': 0 });

  assert.equal(node.hasAttribute('data-missing'), false, 'null attributes are omitted');
  assert.equal(node.hasAttribute('data-absent'), false, 'undefined attributes are omitted');
  // These carry real meaning (an empty alt, a zero dimension), so they survive.
  assert.equal(node.getAttribute('data-empty'), '');
  assert.equal(node.getAttribute('data-zero'), '0');
});

test('el wires on* attributes as real event listeners, lowercasing the event name', () => {
  dom();
  let clicks = 0;
  const node = el('button', { onclick: () => { clicks += 1; } });

  node.dispatchEvent(new window.Event('click'));
  assert.equal(clicks, 1, 'onclick must register a listener, not an inert attribute');
  assert.equal(node.hasAttribute('onclick'), false, 'the handler must not leak as a literal attribute');
});

test('el lowercases the on* event name, so onClick and onclick both bind to click', () => {
  dom();
  const seen = [];
  const node = el('button', {
    onClick: () => seen.push('camel'),
    onclick: () => seen.push('lower'),
  });

  node.dispatchEvent(new window.Event('click'));
  // Both keys slice to the same 'click' event; the second registration wins as
  // a duplicate listener type only if the handlers differ, so both run.
  assert.deepEqual(seen, ['camel', 'lower'],
    'event-name lowercasing means onClick is not a distinct, dead handler');
});

// KNOWN BEHAVIOUR, pinned deliberately: a non-function value on an on* key
// falls through the `typeof value === 'function'` guard and is written as a
// literal attribute. A browser will not execute an inline onclick string, so
// the handler silently does nothing — which is the correct, inert outcome.
// This test documents that so a future refactor does not accidentally start
// honouring (and thereby evaluating) string handlers.
test('el writes a non-function on* value as a literal attribute, which browsers do not execute', () => {
  dom();
  const node = el('button', { onclick: 'alert(1)' });
  assert.equal(node.getAttribute('onclick'), 'alert(1)',
    'string handlers are passed through verbatim, not eval-ed or dropped');

  // Prove the string never became a listener: el() registered nothing, so a
  // dispatch on a string-only node runs no JavaScript.
  const inert = el('button', { onclick: 'window.__inlineHandlerRan = true;' });
  inert.dispatchEvent(new window.Event('click'));
  assert.equal(globalThis.__inlineHandlerRan, undefined,
    'a string attribute is never invoked as a listener');
  delete globalThis.__inlineHandlerRan;
});

test('el assigns innerHTML for the explicit html key', () => {
  dom();
  const node = el('p', { html: '<em>emphasis</em>' });
  assert.equal(node.innerHTML, '<em>emphasis</em>');
  assert.equal(node.querySelector('em').textContent, 'emphasis');
});

/* ─── el(): children ─── */

test('el appends string children as text nodes', () => {
  dom();
  const node = el('p', {}, 'hello ', 'world');
  assert.equal(node.textContent, 'hello world');
  assert.equal(node.children.length, 0, 'strings must not be parsed as markup');
});

test('el appends node children as-is', () => {
  dom();
  const strong = el('strong', {}, 'bold');
  const node = el('p', {}, 'a ', strong, ' b');
  assert.equal(node.querySelector('strong'), strong, 'child nodes are adopted, not cloned');
  assert.equal(node.textContent, 'a bold b');
});

test('el flattens nested array children into document order', () => {
  dom();
  const node = el('ul', {}, [['a', 'b'], ['c'], 'd']);
  assert.equal(node.textContent, 'abcd', 'arrays of children are flattened recursively');
  assert.deepEqual(
    [...node.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent),
    ['a', 'b', 'c', 'd'],
    'each flattened child becomes its own text node, in order',
  );
});

test('el drops null and false children so conditional rendering is terse', () => {
  dom();
  const node = el('p', {}, 'before', null, false, undefined, 'after');
  assert.equal(node.textContent, 'beforeafter',
    'nullish and false children are skipped, matching the &&-guard idiom');
});

test('el keeps numeric zero children, which is meaningful content', () => {
  dom();
  const node = el('p', {}, 0);
  assert.equal(node.textContent, '0', 'zero is content, not a falsy guard');
});

test('el stringifies non-node children so objects do not render as [object Object] silently', () => {
  dom();
  const node = el('p', {}, 42, true);
  assert.equal(node.textContent, '42true');
});

/* ─── $ and $$ scoping ─── */

test('$ returns the first match within the given root', () => {
  const document = dom('<div class="card"><span class="t">one</span><span class="t">two</span></div>');
  const root = document.querySelector('.card');

  assert.equal($('.t', root).textContent, 'one');
  assert.equal($('.missing', root), null, 'a miss is null, not a throw');
});

test('$ defaults to the global document when no root is passed', () => {
  const document = dom('<p id="solo">x</p>');
  assert.equal($('#solo'), document.querySelector('#solo'));
});

test('$$ returns a real array of every match within the root', () => {
  const document = dom('<div class="row"><i></i><i></i><i></i></div>');
  const root = document.querySelector('.row');
  const found = $$('i', root);

  assert.ok(Array.isArray(found), '$$ must return an array so map/filter work');
  assert.equal(found.length, 3);
  // Scoped: a match outside the root must not leak in.
  assert.ok(found.every((node) => root.contains(node)));
});

test('$$ returns an empty array rather than a live NodeList for no matches', () => {
  const document = dom('<div></div>');
  const found = $$('.nothing', document);
  assert.deepEqual(found, []);
  assert.equal(found.length, 0);
});

test('$$ defaults to the global document when no root is passed', () => {
  const document = dom('<b></b><b></b>');
  assert.equal($$('b').length, 2);
});
