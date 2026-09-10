import test from 'node:test';
import assert from 'node:assert/strict';
import { createNetWeaveWorkbench, NETWEAVE_VIEWS, NETWEAVE_STATES } from '../scripts/media/netweave-workbench.js';

test('Workbench exposes five stable inspection views and three bounded states', () => {
  assert.equal(NETWEAVE_VIEWS.length, 5);
  assert.deepEqual(NETWEAVE_VIEWS.map((view) => view.id), ['overview', 'route', 'traffic', 'evidence', 'notes']);
  assert.equal(NETWEAVE_STATES.length, 3);
  assert.ok(NETWEAVE_STATES.every((state) => state.image && state.description && state.caption));
});

test('Workbench state is keyboard friendly and reset returns to the entry view', () => {
  const workbench = createNetWeaveWorkbench();
  assert.deepEqual(workbench.get(), { view: 'overview', state: 0 });
  assert.equal(workbench.nextView(), true);
  assert.equal(workbench.get().view, 'route');
  assert.equal(workbench.previousView(), true);
  assert.equal(workbench.get().view, 'overview');
  assert.equal(workbench.selectState(2), true);
  assert.equal(workbench.get().state, 2);
  assert.equal(workbench.reset(), true);
  assert.deepEqual(workbench.get(), { view: 'overview', state: 0 });
  assert.equal(workbench.selectView('missing'), false);
});

test('Workbench never schedules playback and describes its no-JS fallback', () => {
  const workbench = createNetWeaveWorkbench();
  assert.equal(typeof workbench.play, 'undefined');
  assert.match(workbench.fallbackText(), /static poster/i);
  assert.match(workbench.fallbackText(), /reduced motion/i);
});
