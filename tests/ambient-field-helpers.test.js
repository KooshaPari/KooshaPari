import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PARTICLE_COLOR,
  LINE_COLOR,
  NODE_COLOR,
  DESKTOP_COUNT,
  MOBILE_COUNT,
  MIN_COUNT,
  LINE_DISTANCE,
  NODE_RADIUS,
  DUST_RADIUS,
  SPEED_MIN,
  SPEED_MAX,
  createParticle,
  buildParticles,
  ambientStep,
  splitParticles,
  staticPositions,
} from '../scripts/media/ambient-field-helpers.js';

test('createParticle seeds position, velocity, phase deterministically from index', () => {
  const a = createParticle(1000, 500, 7, false);
  const b = createParticle(1000, 500, 7, false);
  assert.deepEqual(a, b);

  const c = createParticle(1000, 500, 8, false);
  assert.notEqual(a.x, c.x);
  assert.notEqual(a.vx, c.vx);
});

test('createParticle honours the SPEED_MIN/MAX contract on velocity', () => {
  for (let i = 0; i < 32; i++) {
    const p = createParticle(1200, 600, i, false);
    assert.ok(p.vx >= SPEED_MIN && p.vx <= SPEED_MAX, `vx ${p.vx} out of range for index ${i}`);
    assert.ok(p.vy >= SPEED_MIN && p.vy <= SPEED_MAX, `vy ${p.vy} out of range for index ${i}`);
  }
});

test('createParticle marks the node flag and zero-initialises the pulse', () => {
  const p = createParticle(1200, 600, 0, true);
  assert.equal(p.isNode, true);
  assert.equal(p.nodePulse, 0);
  assert.equal(p.nodePulseDir, 1);

  const dust = createParticle(1200, 600, 1, false);
  assert.equal(dust.isNode, false);
});

test('buildParticles returns MIN_COUNT particles when lowEnd is true', () => {
  const dust = buildParticles(1200, 600, true);
  assert.equal(dust.length, MIN_COUNT);
  assert.ok(dust.every((p) => !p.isNode), 'low-end path emits no nodes');
});

test('buildParticles returns MOBILE_COUNT particles when width is below the mobile breakpoint', () => {
  const dust = buildParticles(500, 800, false);
  assert.equal(dust.length, MOBILE_COUNT);
  assert.ok(dust.every((p) => !p.isNode), 'mobile viewport emits no nodes');
});

test('buildParticles returns DESKTOP_COUNT particles and sprinkles one node per eight', () => {
  const dust = buildParticles(1200, 800, false);
  assert.equal(dust.length, DESKTOP_COUNT);

  const nodes = dust.filter((p) => p.isNode);
  assert.equal(nodes.length, 8);
  assert.ok(nodes.every((p) => p.isNode));
});

test('ambientStep advances particle positions by velocity * step', () => {
  const p = createParticle(1200, 600, 0, false);
  const startX = p.x;
  const startY = p.y;

  ambientStep([p], 1200, 600, 0, 1);

  assert.notEqual(p.x, startX);
  assert.notEqual(p.y, startY);
});

test('ambientStep wraps particles around the canvas edges with a LINE_DISTANCE pad', () => {
  const farRight = createParticle(1200, 600, 0, false);
  farRight.x = 1200 + LINE_DISTANCE + 1;
  ambientStep([farRight], 1200, 600, 0, 1);
  assert.ok(farRight.x < 0, `expected wrap to negative side, got ${farRight.x}`);
  assert.ok(farRight.x >= -LINE_DISTANCE, `pad exceeded, x = ${farRight.x}`);

  const farLeft = createParticle(1200, 600, 0, false);
  farLeft.x = -LINE_DISTANCE - 1;
  ambientStep([farLeft], 1200, 600, 0, 1);
  assert.ok(farLeft.x > 1200, `expected wrap to right side, got ${farLeft.x}`);
});

test('ambientStep bounces nodePulse between 0 and 1 across many frames', () => {
  const node = createParticle(1200, 600, 0, true);
  let minPulse = 0;
  let maxPulse = 0;
  for (let frame = 0; frame < 2000; frame++) {
    ambientStep([node], 1200, 600, frame, 1);
    if (node.nodePulse < minPulse) minPulse = node.nodePulse;
    if (node.nodePulse > maxPulse) maxPulse = node.nodePulse;
    assert.ok(node.nodePulse >= 0 && node.nodePulse <= 1, `pulse out of bounds at frame ${frame}: ${node.nodePulse}`);
  }
  assert.ok(maxPulse >= 0.99, `nodePulse never reached 1 over 2000 frames (max ${maxPulse})`);
  assert.ok(minPulse <= 0.01, `nodePulse never returned to 0 (min ${minPulse})`);
});

test('ambientStep does not mutate dust-only particles outside the pulse code path', () => {
  const dust = createParticle(1200, 600, 1, false);
  const before = { ...dust };
  ambientStep([dust], 1200, 600, 0, 1);
  assert.equal(dust.nodePulse, before.nodePulse);
  assert.equal(dust.nodePulseDir, before.nodePulseDir);
});

test('splitParticles partitions a list into dust and nodes', () => {
  const list = [
    createParticle(1200, 600, 0, true),
    createParticle(1200, 600, 1, false),
    createParticle(1200, 600, 2, false),
    createParticle(1200, 600, 3, true),
  ];
  const { dust, nodes } = splitParticles(list);
  assert.equal(dust.length, 2);
  assert.equal(nodes.length, 2);
  assert.ok(dust.every((p) => !p.isNode));
  assert.ok(nodes.every((p) => p.isNode));
});

test('staticPositions emits three positions scaled to the canvas size', () => {
  const positions = staticPositions(1000, 500);
  assert.equal(positions.length, 3);
  assert.equal(positions[0].x, 250);
  assert.equal(positions[0].y, 175);
  assert.equal(positions[1].x, 550);
  assert.equal(positions[1].y, 300);
  assert.equal(positions[2].x, 780);
  assert.equal(positions[2].y, 140);
});

test('color constants match the documented palette', () => {
  assert.match(PARTICLE_COLOR, /^rgba\(126, 186, 181, 0\.3\)$/);
  assert.match(LINE_COLOR, /^rgba\(126, 186, 181, 0\.08\)$/);
  assert.match(NODE_COLOR, /^rgba\(126, 186, 181, 0\.6\)$/);
  assert.equal(DUST_RADIUS, 1);
  assert.equal(NODE_RADIUS.min, 3);
  assert.equal(NODE_RADIUS.max, 4);
});
