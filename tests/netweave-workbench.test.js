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
  assert.deepEqual(workbench.get(), { view: 'overview', state: 0, motion: false });
  assert.equal(workbench.nextView(), true);
  assert.equal(workbench.get().view, 'route');
  assert.equal(workbench.previousView(), true);
  assert.equal(workbench.get().view, 'overview');
  assert.equal(workbench.selectState(2), true);
  assert.equal(workbench.get().state, 2);
  assert.equal(workbench.reset(), true);
  assert.deepEqual(workbench.get(), { view: 'overview', state: 0, motion: false });
  assert.equal(workbench.selectView('missing'), false);
});

test('Workbench never schedules playback and describes its no-JS fallback', () => {
  const workbench = createNetWeaveWorkbench();
  assert.equal(typeof workbench.play, 'undefined');
  assert.match(workbench.fallbackText(), /static poster/i);
  assert.match(workbench.fallbackText(), /reduced motion/i);
});

test('Each state names objects first and assigns explicit highlighted-follower and stationary-lead roles', () => {
  for (const state of NETWEAVE_STATES) {
    assert.ok(state.objectLabel && typeof state.objectLabel === 'string', 'state must expose an object-first label');
    assert.match(state.objectLabel, /following vehicle|stationary lead vehicle/i, 'object-first label must use the object vocabulary');
    assert.ok(state.relationship && typeof state.relationship === 'string', 'state must expose a relationship summary');
    assert.ok(Array.isArray(state.vehicleRoles) && state.vehicleRoles.length === 4, 'state must declare the role of every vehicle on the lane');
    assert.ok(state.vehicleRoles.includes('following') && state.vehicleRoles.includes('stationary-lead'), 'lane must contain following and stationary-lead objects');
    assert.ok(state.vehicleRoles.filter((role) => role === 'stationary-lead').length === 1, 'exactly one stationary-lead vehicle');
    assert.ok(state.vehicleRoles.filter((role) => role === 'following').length === 3, 'exactly three following vehicles');
    assert.ok(state.highlightedRole === 'following', 'highlighted object is the following vehicle, never the stationary lead');
    assert.ok(state.leadRole === 'stationary-lead', 'stationary lead is explicitly the role of the rightmost vehicle');
    assert.ok(Number.isInteger(state.gapCells) && state.gapCells >= 0 && state.gapCells <= 2, 'gap cells are explicit, bounded, and not measured telemetry');
  }
});

test('Workbench exposes a motion-by-choice API that defaults to off and never auto-plays', () => {
  const workbench = createNetWeaveWorkbench();
  assert.equal(typeof workbench.setMotionEnabled, 'function', 'workbench must expose a setMotionEnabled API');
  assert.equal(workbench.isMotionEnabled(), false, 'motion defaults to off so reduced-motion and no-JS parity hold by default');
  const flips = [];
  workbench.subscribe(({ motion }) => flips.push(motion));
  workbench.setMotionEnabled(true);
  workbench.setMotionEnabled(false);
  workbench.setMotionEnabled(false);
  assert.deepEqual(flips, [true, false], 'subscribers learn motion state changes; redundant calls do not emit');
  assert.equal(workbench.isMotionEnabled(), false, 'motion is again off after toggle-back');
  assert.equal(typeof workbench.play, 'undefined', 'no playback scheduling API exists');
  assert.equal(workbench.get().motion, false, 'motion preference is exposed in the public state snapshot');
});

test('Workbench parity text covers static, no-JavaScript, and reduced-motion contexts', () => {
  const workbench = createNetWeaveWorkbench();
  assert.equal(typeof workbench.parityText, 'function', 'workbench must expose a parity text API');
  const text = workbench.parityText();
  assert.match(text, /no.?javascript|no.?js|without javascript/i);
  assert.match(text, /reduced motion/i);
  assert.match(text, /static/i);
  assert.doesNotMatch(text, /analytics|telemetry|tracking|fetch\(|xhr|sendBeacon|google-analytics/i, 'parity text must not imply any telemetry or network behavior');
});

test('Workbench exposes a role lookup that returns highlighted-follower and stationary-lead objects for a state', () => {
  const workbench = createNetWeaveWorkbench();
  assert.equal(typeof workbench.getStateRoles, 'function', 'workbench must expose getStateRoles');
  const roles = workbench.getStateRoles(0);
  assert.equal(roles.highlighted, 'following');
  assert.equal(roles.lead, 'stationary-lead');
  assert.equal(roles.followers.length, 3);
  assert.equal(roles.leadIsStationary, true, 'lead is stationary, never the highlighted object');
  assert.throws(() => workbench.getStateRoles(99), /out of range|invalid/i, 'role lookup rejects unknown state indices');
});
