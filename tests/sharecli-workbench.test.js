import test from 'node:test';
import assert from 'node:assert/strict';
import { createShareCliWorkbench, SHARECLI_STATES } from '../scripts/media/sharecli-workbench.js';

test('ShareCLI workbench exposes four bounded illustrative runtime states', () => {
  assert.deepEqual(SHARECLI_STATES.map((state) => state.id), ['burst', 'coalesce', 'observe', 'recover']);
  assert.ok(SHARECLI_STATES.every((state) => state.title && state.description && state.readerSequence));
  assert.ok(SHARECLI_STATES.every((state) => !/throughput|latency|live telemetry|terminal recording/i.test(`${state.title} ${state.description}`)));
});

test('ShareCLI workbench is visitor-stepped and resettable without playback', () => {
  const workbench = createShareCliWorkbench();
  assert.deepEqual(workbench.get(), { state: 0 });
  assert.equal(workbench.next(), true);
  assert.deepEqual(workbench.get(), { state: 1 });
  assert.equal(workbench.selectState(3), true);
  assert.deepEqual(workbench.get(), { state: 3 });
  assert.equal(workbench.selectState(4), false);
  assert.equal(workbench.reset(), true);
  assert.deepEqual(workbench.get(), { state: 0 });
  assert.equal(typeof workbench.play, 'undefined');
});

test('ShareCLI workbench keeps its fixture and static-fallback limits visible', () => {
  const workbench = createShareCliWorkbench();
  assert.match(workbench.fallbackText(), /static/i);
  assert.match(workbench.fallbackText(), /reduced motion/i);
  assert.match(workbench.evidenceBoundary(), /fixture/i);
  assert.match(workbench.evidenceBoundary(), /not.*terminal/i);
});
