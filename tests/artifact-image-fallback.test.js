import test from 'node:test';
import assert from 'node:assert/strict';

class FakeNode {
  constructor(tagName = '#text', textContent = '') {
    this.nodeType = tagName === '#text' ? 3 : 1;
    this.tagName = tagName;
    this.textContent = textContent;
    this.children = [];
    this.attributes = new Map();
  }
  set className(v) { this.setAttribute('class', v); }
  get className() { return this.getAttribute('class') ?? ''; }
  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  getAttribute(k) { return this.attributes.get(k) ?? null; }
  append(...n) { this.children.push(...n); }
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

// ---------------------------------------------------------------------------
// renderArchiveSpecimen must not invent nonexistent image paths
// ---------------------------------------------------------------------------

const { PROJECTS } = await import('../data/projects.js');
const { renderProjectVisual } = await import('../scripts/media/project-visuals.js');

const ARCHIVE_SLUGS = ['mcpforge', 'forgecode', 'frostify'];

for (const slug of ARCHIVE_SLUGS) {
  test(`renderArchiveSpecimen for ${slug} must not reference nonexistent card.webp`, () => {
    installDocument();
    const project = PROJECTS.find((p) => p.slug === slug);
    assert.ok(project, `project ${slug} not found in PROJECTS`);

    const visual = renderProjectVisual(project, { lens: 'engineering', mode: 'detail' });
    if (!visual) return; // null means no image rendered, which is fine

    const imgs = findAll(visual, (n) => n.tagName === 'img');
    for (const img of imgs) {
      const src = img.getAttribute('src');
      if (src) {
        assert.ok(
          !src.includes('/card.webp') || slug === 'omniroute',
          `${slug}: img src references nonexistent card.webp: ${src}`,
        );
      }
    }
  });
}

test('renderArchiveSpecimen for mcpforge renders without crashing', () => {
  installDocument();
  const project = PROJECTS.find((p) => p.slug === 'mcpforge');
  const visual = renderProjectVisual(project, { lens: 'engineering', mode: 'detail' });
  assert.ok(visual, 'renderArchiveSpecimen returned null for mcpforge');
});

test('renderArchiveSpecimen for forgecode renders without crashing', () => {
  installDocument();
  const project = PROJECTS.find((p) => p.slug === 'forgecode');
  const visual = renderProjectVisual(project, { lens: 'engineering', mode: 'detail' });
  assert.ok(visual, 'renderArchiveSpecimen returned null for forgecode');
});

test('renderArchiveSpecimen for frostify renders without crashing', () => {
  installDocument();
  const project = PROJECTS.find((p) => p.slug === 'frostify');
  const visual = renderProjectVisual(project, { lens: 'engineering', mode: 'detail' });
  assert.ok(visual, 'renderArchiveSpecimen returned null for frostify');
});

test('archive projects without gallery show placeholder, not broken image', () => {
  installDocument();
  for (const slug of ARCHIVE_SLUGS) {
    const project = PROJECTS.find((p) => p.slug === slug);
    const visual = renderProjectVisual(project, { lens: 'engineering', mode: 'detail' });
    const imgs = findAll(visual, (n) => n.tagName === 'img');
    for (const img of imgs) {
      const src = img.getAttribute('src') ?? '';
      assert.doesNotMatch(src, /\/projects\/mcpforge\/card\.webp/);
      assert.doesNotMatch(src, /\/projects\/forgecode\/card\.webp/);
      assert.doesNotMatch(src, /\/projects\/frostify\/card\.webp/);
    }
  }
});
