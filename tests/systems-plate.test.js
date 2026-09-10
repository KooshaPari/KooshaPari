import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubstratePlateDefinition } from '../scripts/media/systems-plate.js';

test('Substrate plate keeps its ownership boundary explicit', () => {
  const substrate = createSubstratePlateDefinition();

  assert.equal(substrate.views.length, 3);
  assert.match(substrate.attribution, /Substrate/);
  assert.match(substrate.attribution, /owned/);
});

test('systems plate views describe architecture, not measured telemetry', () => {
  const plate = createSubstratePlateDefinition();
  assert.ok(plate.views.every(({ description }) => !/latency|throughput|success rate|p95/i.test(description)));
  assert.ok(plate.nodes.length >= 4);
  assert.ok(plate.edges.every(({ from, to }) => plate.nodes.some((node) => node.id === from) && plate.nodes.some((node) => node.id === to)));
});
