import test from 'node:test';
import assert from 'node:assert/strict';

import {
  annotation,
  topologyLabels,
  experimentRows,
  ARTIFACT_FAMILY_MAP,
  createArtifactHeader,
  createAnnotationBlock,
  createTopologyNodes,
} from '../scripts/components/artifact-helpers.js';

function makeStubEl() {
  const calls = [];
  const flatten = (kids) => kids.flatMap(k => Array.isArray(k) ? flatten(k) : [k]);
  const make = (tag, attrs = {}, ...kids) => {
    const children = flatten(kids);
    calls.push({ tag, attrs, children });
    return { tag, attrs, children };
  };
  return { el: make, calls };
}

test('annotation prefers the lens-specific presentation annotation', () => {
  const result = annotation({ presentation: { annotations: { product: 'p', engineering: 'e' } }, summary: 's' }, 'product');
  assert.equal(result, 'p');
});

test('annotation falls back to engineering when lens is not present', () => {
  const result = annotation({ presentation: { annotations: { engineering: 'e' } }, summary: 's' }, 'product');
  assert.equal(result, 'e');
});

test('annotation falls back to summary when no annotations are present', () => {
  assert.equal(annotation({ presentation: {}, summary: 'plain' }, 'engineering'), 'plain');
  assert.equal(annotation({ presentation: {}, summary: 'plain' }, 'product'), 'plain');
  assert.equal(annotation({}, 'engineering'), undefined);
});

test('topologyLabels returns the custom substrate set when slug is "substrate"', () => {
  const labels = topologyLabels({ slug: 'substrate' });
  assert.deepEqual(labels, ['HTTP / CLI / MCP / A2A', 'policy + budget', 'health + fallback', 'provider execution']);
});

test('topologyLabels returns the generic agent set for everything else', () => {
  const labels = topologyLabels({ slug: 'omniroute' });
  assert.deepEqual(labels, ['agent bursts', 'process observation', 'coalesce + queue', 'shared host state']);
});

test('experimentRows returns the custom netweave set when slug is "netweave"', () => {
  const rows = experimentRows({ slug: 'netweave' });
  assert.equal(rows.length, 4);
  assert.deepEqual(rows[0], ['Route layer', 'A* over directed road graph']);
});

test('experimentRows returns the generic fork-delta set for everything else', () => {
  const rows = experimentRows({ slug: 'omlx' });
  assert.equal(rows.length, 4);
  assert.deepEqual(rows[0], ['Upstream', 'jundot/omlx / attributed']);
});

test('ARTIFACT_FAMILY_MAP has all 8 known slugs and no unknown ones', () => {
  assert.equal(Object.keys(ARTIFACT_FAMILY_MAP).length, 8);
  for (const slug of ['netweave', 'sharecli', 'omniroute', 'gmk-arch', 'witf', 'dss-cipher', 'substrate', 'phenotype-omlx']) {
    assert.ok(ARTIFACT_FAMILY_MAP[slug], `missing family for ${slug}`);
  }
  assert.equal(ARTIFACT_FAMILY_MAP['gmk-arch'], 'physical');
  assert.equal(ARTIFACT_FAMILY_MAP['witf'], 'physical');
});

test('createArtifactHeader builds a header with atelier-label, h2 link, summary', () => {
  const { el, calls } = makeStubEl();
  const out = createArtifactHeader({ slug: 's', title: 'T', summary: 'sum' }, 'Material artifact', el);
  assert.equal(out.tag, 'header');
  assert.equal(out.attrs.class, 'artifact-header');
  // call order: p (label), a (link child), h2 (parent), p (summary child), header (root)
  // but children of h2 are evaluated before h2, and children of header are evaluated before header
  const labelP = calls.find(c => c.tag === 'p' && c.attrs.class === 'atelier-label');
  const link = calls.find(c => c.tag === 'a' && c.attrs.href === '/work/s');
  const summaryP = calls.find(c => c.tag === 'p' && c.attrs.class === 'artifact-summary');
  assert.ok(labelP);
  assert.deepEqual(labelP.children, ['Material artifact']);
  assert.ok(link);
  assert.deepEqual(link.children, ['T']);
  assert.ok(summaryP);
  assert.deepEqual(summaryP.children, ['sum']);
});

test('createAnnotationBlock uses "P" for product lens and "E" otherwise', () => {
  {
    const { el, calls } = makeStubEl();
    createAnnotationBlock({ summary: 'x' }, 'product', el);
    const badge = calls.find(c => c.tag === 'span' && c.attrs['aria-hidden'] === 'true');
    assert.deepEqual(badge.children, ['P']);
  }
  {
    const { el, calls } = makeStubEl();
    createAnnotationBlock({ summary: 'x' }, 'engineering', el);
    const badge = calls.find(c => c.tag === 'span' && c.attrs['aria-hidden'] === 'true');
    assert.deepEqual(badge.children, ['E']);
  }
});

test('createAnnotationBlock uses the lens-preferred annotation text', () => {
  const { el, calls } = makeStubEl();
  createAnnotationBlock(
    { presentation: { annotations: { product: 'product-text' } }, summary: 'fallback' },
    'product',
    el,
  );
  const p = calls.find(c => c.tag === 'p' && c.children[0] === 'product-text');
  assert.ok(p);
});

test('createTopologyNodes emits N nodes with 2-digit padded labels and N-1 arrows', () => {
  const { el, calls } = makeStubEl();
  const out = createTopologyNodes(['one', 'two', 'three'], el);
  // 3 nodes + 2 arrows
  const nodes = calls.filter(c => c.tag === 'div' && c.attrs.class === 'systems-node');
  const arrows = calls.filter(c => c.tag === 'span' && c.attrs.class === 'systems-route');
  assert.equal(nodes.length, 3);
  assert.equal(arrows.length, 2);
  // padded numbers in the first child span of each node
  const numbers = calls.filter(c => c.tag === 'span' && c.children[0] === '01' || c.children[0] === '02' || c.children[0] === '03');
  // filter again with explicit
  const labels = calls
    .filter(c => c.tag === 'span')
    .map(c => c.children[0])
    .filter(v => ['01', '02', '03'].includes(v));
  assert.deepEqual(labels.sort(), ['01', '02', '03']);
  assert.ok(out);
});

test('createTopologyNodes emits no arrow after a single-node topology', () => {
  const { el, calls } = makeStubEl();
  createTopologyNodes(['only'], el);
  const arrows = calls.filter(c => c.tag === 'span' && c.attrs.class === 'systems-route');
  assert.equal(arrows.length, 0);
});
