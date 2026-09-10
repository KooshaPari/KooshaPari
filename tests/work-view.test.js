import test from 'node:test';
import assert from 'node:assert/strict';

import { renderWorkCatalog } from '../scripts/views/work.js';

class FakeNode {
  constructor(tagName = '#text', textContent = '') {
    this.nodeType = tagName === '#text' ? 3 : 1;
    this.tagName = tagName;
    this.textContent = textContent;
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
  }

  set className(value) { this.setAttribute('class', value); }
  get className() { return this.getAttribute('class') ?? ''; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  click() { this.listeners.get('click')?.({ currentTarget: this }); }
  focus() { globalThis.document.activeElement = this; }
}

function installDocument() {
  globalThis.document = {
    createElement: (tag) => new FakeNode(tag),
    createTextNode: (text) => new FakeNode('#text', String(text)),
  };
}

function findAll(node, predicate, result = []) {
  if (predicate(node)) result.push(node);
  for (const child of node.children) findAll(child, predicate, result);
  return result;
}

function text(node) {
  return node.nodeType === 3 ? node.textContent : node.children.map(text).join('');
}

const projects = [
  { slug: 'featured', title: 'Featured', summary: 'Featured project', featured: true, status: 'current', category: 'systems', lens: ['engineering'] },
  { slug: 'compact', title: 'Compact', summary: 'Compact project', status: 'current', category: 'cloud', lens: ['engineering'] },
  { slug: 'archive', title: 'Archive', summary: 'Archive project', status: 'historical', category: 'design', lens: ['product'], archiveDate: '2020-01-15' },
];

test('Work view renders accessible filters, a live total, and distinct catalog structures', () => {
  installDocument();
  const root = new FakeNode('main');

  renderWorkCatalog(root, { projects });

  const filters = findAll(root, (node) => node.tagName === 'button');
  assert.equal(filters.length, 9);
  assert.equal(filters[0].getAttribute('aria-pressed'), 'true');
  assert.equal(filters[0].getAttribute('type'), 'button');
  assert.equal(findAll(root, (node) => node.getAttribute('aria-live') === 'polite').length, 1);
  assert.equal(findAll(root, (node) => node.getAttribute('data-presentation') === 'featured').length, 1);
  assert.equal(findAll(root, (node) => node.getAttribute('data-presentation') === 'specimen-sheet').length, 1);
  assert.equal(findAll(root, (node) => node.tagName === 'details').length, 1);
  assert.equal(findAll(root, (node) => node.tagName === 'a' && node.getAttribute('href') === '/work/featured').length, 1);
});

test('Work filters rerender the live count and pressed state without changing the route', () => {
  installDocument();
  const root = new FakeNode('main');

  renderWorkCatalog(root, { projects });
  findAll(root, (node) => node.tagName === 'button' && text(node) === 'Engineering')[0].click();

  const filters = findAll(root, (node) => node.tagName === 'button');
  assert.equal(filters.find((node) => text(node) === 'Engineering').getAttribute('aria-pressed'), 'true');
  assert.equal(filters.find((node) => text(node) === 'All work').getAttribute('aria-pressed'), 'false');
  assert.match(text(findAll(root, (node) => node.getAttribute('aria-live') === 'polite')[0]), /^2 projects$/);
  assert.equal(findAll(root, (node) => node.tagName === 'details').length, 0);
  assert.equal(globalThis.document.activeElement, filters.find((node) => text(node) === 'Engineering'));
});
