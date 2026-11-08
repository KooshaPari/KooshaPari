import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../scripts/router.js';

// ---------------------------------------------------------------------------
// parseRoute — archive
// ---------------------------------------------------------------------------

test('parseRoute recognizes /archive', () => {
  assert.deepEqual(parseRoute('/archive'), { view: 'archive' });
});

test('parseRoute rejects extra segments on /archive', () => {
  assert.deepEqual(parseRoute('/archive/anything'), { view: 'not-found' });
});

// ---------------------------------------------------------------------------
// parseRoute — static route extra-segment rejection
// ---------------------------------------------------------------------------

test('parseRoute rejects extra segments on /resume and /contact', () => {
  assert.deepEqual(parseRoute('/resume/foo'), { view: 'not-found' });
  assert.deepEqual(parseRoute('/contact/bar'), { view: 'not-found' });
});

// ---------------------------------------------------------------------------
// parseRoute — malformed encoded project paths
// ---------------------------------------------------------------------------

test('parseRoute returns not-found for malformed percent-encoded slug', () => {
  const route = parseRoute('/work/%zzz');
  assert.equal(route.view, 'not-found');
});

test('parseRoute returns not-found for malformed percent-encoded blog slug', () => {
  const route = parseRoute('/blog/%zzz');
  assert.equal(route.view, 'not-found');
});

// ---------------------------------------------------------------------------
// Archive view renders actual historical projects
// ---------------------------------------------------------------------------

class FakeNode {
  constructor(tagName = '#text', textContent = '') {
    this.nodeType = tagName === '#text' ? 3 : 1;
    this.tagName = tagName;
    this.textContent = textContent;
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
  }
  set className(v) { this.setAttribute('class', v); }
  get className() { return this.getAttribute('class') ?? ''; }
  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  getAttribute(k) { return this.attributes.get(k) ?? null; }
  append(...n) { this.children.push(...n); }
  replaceChildren(...n) { this.children = [...n]; }
}

function installDocument() {
  globalThis.document = {
    createElement: (tag) => new FakeNode(tag),
    createTextNode: (text) => new FakeNode('#text', String(text)),
  };
}

function findAll(node, pred, result = []) {
  if (pred(node)) result.push(node);
  for (const c of node.children) findAll(c, pred, result);
  return result;
}

function text(node) {
  return node.nodeType === 3 ? node.textContent : node.children.map(text).join('');
}

// Import the actual PROJECTS data to verify real historical entries
const { PROJECTS } = await import('../data/projects.js');
const { renderArchive } = await import('../scripts/views/archive.js');

const HISTORICAL = PROJECTS.filter((p) => p.status === 'historical');

test('archive view renders every historical project from PROJECTS', () => {
  installDocument();
  const root = new FakeNode('main');
  renderArchive(root, { projects: PROJECTS });

  const links = findAll(root, (n) => n.tagName === 'a' && n.getAttribute('href')?.startsWith('/work/'));
  assert.ok(links.length >= HISTORICAL.length, `expected >= ${HISTORICAL.length} links, got ${links.length}`);

  for (const p of HISTORICAL) {
    const found = links.find((n) => n.getAttribute('href') === `/work/${p.slug}`);
    assert.ok(found, `missing link for historical project: ${p.slug}`);
    assert.equal(text(found), p.title, `link text mismatch for ${p.slug}`);
  }
});

test('archive view links are unique and point to valid /work/:slug paths', () => {
  installDocument();
  const root = new FakeNode('main');
  renderArchive(root, { projects: PROJECTS });

  const hrefs = findAll(root, (n) => n.tagName === 'a')
    .map((n) => n.getAttribute('href'))
    .filter((h) => h?.startsWith('/work/'));
  const unique = new Set(hrefs);
  assert.equal(hrefs.length, unique.size, 'duplicate archive links detected');
  for (const h of hrefs) {
    assert.match(h, /^\/work\/[\w-]+$/, `malformed link href: ${h}`);
  }
});

test('archive view does not invent dates or years', () => {
  installDocument();
  const root = new FakeNode('main');
  renderArchive(root, { projects: PROJECTS });

  const allText = text(root);
  // No 4-digit year sequence that isn't part of a slug or project name
  const yearMatches = allText.match(/\b(19|20)\d{2}\b/g) ?? [];
  assert.equal(yearMatches.length, 0, `archive view contains date-like text: ${yearMatches.join(', ')}`);
});
