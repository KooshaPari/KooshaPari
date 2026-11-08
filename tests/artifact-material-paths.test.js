import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// materialVisualFrame must not point to nonexistent hybrid-materials assets
// ---------------------------------------------------------------------------

function installDocument() {
  globalThis.document = {
    createElement: (tag) => {
      const el = {
        tagName: tag,
        children: [],
        nodeType: 1,
        attributes: new Map(),
        setAttribute(k, v) { this.attributes.set(k, String(v)); },
        getAttribute(k) { return this.attributes.get(k) ?? null; },
        append(...n) { this.children.push(...n); },
        set className(v) { this.setAttribute('class', v); },
        get className() { return this.getAttribute('class') ?? ''; },
      };
      return el;
    },
    createTextNode: (text) => ({
      nodeType: 3, textContent: String(text), children: [],
    }),
  };
}

function findAll(node, pred, result = []) {
  if (pred(node)) result.push(node);
  for (const c of node.children) findAll(c, pred, result);
  return result;
}

const ROOT = resolve(import.meta.dirname, '..');

const { createExperimentNote } = await import('../scripts/components/artifact.js');

const NETWEAVE_RECORD = {
  id: 'netweave',
  slug: 'netweave',
  title: 'NetWeave',
  status: 'historical prototype',
  category: 'simulation',
  lens: ['engineering'],
  summary: 'Go traffic simulation combining directed-graph routing with disjoint cellular automata.',
  presentation: {
    type: 'experiment-note',
    alt: 'Traffic-simulation study.',
    annotations: { engineering: 'Test annotation.' },
    media: { width: 1600, height: 1100 },
  },
};

test('materialVisualFrame for netweave must not reference nonexistent hybrid-materials images', () => {
  installDocument();
  const article = createExperimentNote(NETWEAVE_RECORD, 'engineering');
  const imgs = findAll(article, (n) => n.tagName === 'img');

  const realImages = imgs.filter((img) => {
    const src = img.getAttribute('src');
    return src && src.includes('/hybrid-materials/');
  });

  assert.equal(realImages.length, 0,
    'netweave should not produce hybrid-materials img elements (no netweave-desktop.webp or netweave-mobile.webp exists)',
  );
});

test('hybrid-materials images referenced by materialVisualFrame actually exist on disk', () => {
  installDocument();
  const slugs = ['sharecli', 'substrate', 'phenotype-omlx'];
  for (const slug of slugs) {
    const desktopPath = resolve(ROOT, `public/projects/hybrid-materials/${slug}-desktop.webp`);
    const mobilePath = resolve(ROOT, `public/projects/hybrid-materials/${slug}-mobile.webp`);
    assert.ok(existsSync(desktopPath), `${slug}-desktop.webp must exist`);
    assert.ok(existsSync(mobilePath), `${slug}-mobile.webp must exist`);
  }
});

test('hybrid-materials netweave images do NOT exist on disk (defect proof)', () => {
  const desktopPath = resolve(ROOT, 'public/projects/hybrid-materials/netweave-desktop.webp');
  const mobilePath = resolve(ROOT, 'public/projects/hybrid-materials/netweave-mobile.webp');
  assert.ok(!existsSync(desktopPath), 'netweave-desktop.webp should not exist (no 3D render)');
  assert.ok(!existsSync(mobilePath), 'netweave-mobile.webp should not exist (no 3D render)');
});
