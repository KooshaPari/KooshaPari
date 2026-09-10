import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDiagram, diagramFromCaseStudy } from '../scripts/media/diagrams.js';
import { createNetWeaveFrame } from '../scripts/media/netweave-field.js';
import { supportsLayeredMotion } from '../scripts/media/layered-image.js';
import { canLoadModel } from '../scripts/media/model-slot.js';
import { PROJECTS } from '../data/projects.js';

test('diagram contract requires unique nodes and valid edge endpoints', () => {
  assert.equal(validateDiagram({ nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ from: 'a', to: 'b' }] }).valid, true);
  assert.equal(validateDiagram({ nodes: [{ id: 'a' }, { id: 'a' }], edges: [] }).valid, false);
});

test('NetWeave uses deterministic illustrative data', () => {
  assert.deepEqual(createNetWeaveFrame(7, 3), createNetWeaveFrame(7, 3));
  assert.equal(createNetWeaveFrame(7, 3).length, 3);
  assert.ok(diagramFromCaseStudy(PROJECTS.find(({ slug }) => slug === 'netweave')).nodes.length >= 2);
});

test('progressive media defaults to a static, reduced-motion-safe fallback', () => {
  assert.equal(supportsLayeredMotion({ reducedMotion: true }), false);
  assert.equal(supportsLayeredMotion({ coarsePointer: true }), false);
  assert.equal(canLoadModel({ modelUrl: '/witf.glb', webglAvailable: true }), true);
  assert.equal(canLoadModel({ modelUrl: '/witf.glb', webglAvailable: true, reducedMotion: true }), false);
});
