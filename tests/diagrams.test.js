import test from 'node:test';
import assert from 'node:assert/strict';

import { validateDiagram, diagramFromCaseStudy } from '../scripts/media/diagrams.js';

test('validateDiagram rejects an empty node list', () => {
  assert.equal(validateDiagram({ nodes: [], edges: [] }).valid, false);
});

test('validateDiagram rejects fewer than two nodes', () => {
  const out = validateDiagram({ nodes: [{ id: 'a' }], edges: [] });
  assert.equal(out.valid, false);
});

test('validateDiagram rejects duplicate node ids', () => {
  const out = validateDiagram({
    nodes: [{ id: 'a' }, { id: 'a' }],
    edges: [],
  });
  assert.equal(out.valid, false);
});

test('validateDiagram rejects edges whose endpoints are not declared', () => {
  const out = validateDiagram({
    nodes: [{ id: 'a' }, { id: 'b' }],
    edges: [{ from: 'a', to: 'ghost' }],
  });
  assert.equal(out.valid, false);
});

test('validateDiagram accepts a fully-formed two-node, one-edge diagram', () => {
  const out = validateDiagram({
    nodes: [{ id: 'a' }, { id: 'b' }],
    edges: [{ from: 'a', to: 'b' }],
  });
  assert.equal(out.valid, true);
  assert.equal(out.edges.length, 1);
});

test('validateDiagram defaults to empty node/edge lists when called with no args', () => {
  const out = validateDiagram();
  assert.equal(out.valid, false);
  assert.deepEqual(out.nodes, []);
  assert.deepEqual(out.edges, []);
});

test('diagramFromCaseStudy derives nodes and edges from the diagram block', () => {
  const project = {
    summary: 'fallback summary',
    presentation: { alt: 'rolled-up summary' },
    caseStudy: { diagram: 'Source\n|\nv\nSink' },
  };
  const def = diagramFromCaseStudy(project);
  // The '|' and 'v' lines are filtered as ASCII-art artefacts, leaving Source and Sink.
  assert.equal(def.nodes.length, 2);
  assert.deepEqual(def.nodes.map(({ label }) => label), ['Source', 'Sink']);
  assert.equal(def.edges.length, 1);
  assert.equal(def.summary, 'rolled-up summary');
});

test('diagramFromCaseStudy falls back to project.summary when no presentation is supplied', () => {
  const project = {
    summary: 'project summary',
    caseStudy: { diagram: 'A\nB' },
  };
  const def = diagramFromCaseStudy(project);
  assert.equal(def.summary, 'project summary');
});

test('diagramFromCaseStudy produces a chain-style edge list for multi-node diagrams', () => {
  const project = {
    summary: '',
    caseStudy: { diagram: 'first\nsecond\nthird' },
  };
  const def = diagramFromCaseStudy(project);
  // first->second, second->third
  assert.equal(def.edges.length, def.nodes.length - 1);
  // Each edge references known ids.
  const ids = new Set(def.nodes.map(({ id }) => id));
  for (const { from, to } of def.edges) {
    assert.ok(ids.has(from) && ids.has(to));
  }
});
