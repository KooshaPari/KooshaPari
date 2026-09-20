import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TEAL,
  SHAPE_COUNT,
  SHAPE_SPEED,
  createShapes,
  tickShapes,
} from '../scripts/views/not-found-helpers.js';

test('Exposed constants match the brand accent and animation params', () => {
  assert.equal(TEAL, '#7EBAB5');
  assert.equal(SHAPE_COUNT, 18);
  assert.equal(SHAPE_SPEED, 0.05);
});

test('createShapes returns SHAPE_COUNT shapes by default', () => {
  const shapes = createShapes(1200, 800);
  assert.equal(shapes.length, SHAPE_COUNT);
});

test('createShapes honours an explicit count option', () => {
  assert.equal(createShapes(800, 600, { count: 5 }).length, 5);
  assert.equal(createShapes(800, 600, { count: 30 }).length, 30);
});

test('createShapes seeds positions within the requested viewport bounds', () => {
  const shapes = createShapes(800, 600, { rand: () => 0.5 });
  for (const shape of shapes) {
    assert.ok(shape.x >= 0 && shape.x <= 800, `x=${shape.x}`);
    assert.ok(shape.y >= 0 && shape.y <= 600, `y=${shape.y}`);
  }
});

test('createShapes sizes fall in the [20, 100] range', () => {
  const shapes = createShapes(100, 100, { rand: () => 1 });
  for (const shape of shapes) {
    assert.ok(shape.size >= 20 && shape.size <= 100);
  }
});

test('createShapes cycles triangle / circle / line in order', () => {
  const shapes = createShapes(100, 100, { rand: () => 0.1, count: 6 });
  assert.deepEqual(shapes.map((s) => s.type), [
    'triangle', 'circle', 'line',
    'triangle', 'circle', 'line',
  ]);
});

test('createShapes wraps the cycle across 18 shapes (2 full cycles per SHAPE_COUNT)', () => {
  const shapes = createShapes(100, 100, { rand: () => 0.1 });
  assert.equal(shapes.length, SHAPE_COUNT);
  const types = shapes.map((s) => s.type);
  const expected = [];
  for (let i = 0; i < SHAPE_COUNT; i++) {
    expected.push(['triangle', 'circle', 'line'][i % 3]);
  }
  assert.deepEqual(types, expected);
});

test('createShapes with a stub rand produces a fully deterministic layout', () => {
  const seq = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const makeRand = () => {
    let i = 0;
    return () => seq[(i++) % seq.length];
  };
  const a = createShapes(800, 600, { count: 3, rand: makeRand() });
  const b = createShapes(800, 600, { count: 3, rand: makeRand() });
  assert.deepEqual(a, b);
});

test('createShapes velocities centre on zero (random() - 0.5)', () => {
  // rand=0.5 yields vx = (0.5 - 0.5) * 0.1 = 0
  const shapes = createShapes(100, 100, { rand: () => 0.5, count: 4 });
  for (const shape of shapes) {
    assert.equal(shape.vx, 0);
    assert.equal(shape.vy, 0);
  }
});

test('tickShapes advances x and y by the per-shape velocity', () => {
  const shapes = [{ x: 10, y: 20, vx: 1, vy: -2, size: 5, rotation: 0, rotationSpeed: 0.1 }];
  tickShapes(shapes, 800, 600);
  assert.equal(shapes[0].x, 11);
  assert.equal(shapes[0].y, 18);
});

test('tickShapes advances rotation by rotationSpeed', () => {
  const shapes = [{ x: 0, y: 0, vx: 0, vy: 0, size: 1, rotation: 0, rotationSpeed: 0.01 }];
  tickShapes(shapes, 100, 100);
  assert.ok(Math.abs(shapes[0].rotation - 0.01) < 1e-9);
});

test('tickShapes wraps shapes that exit the left / right edges', () => {
  const offLeft = { x: -10, y: 50, vx: 0, vy: 0, size: 5, rotation: 0, rotationSpeed: 0 };
  const offRight = { x: 850, y: 50, vx: 0, vy: 0, size: 5, rotation: 0, rotationSpeed: 0 };
  tickShapes([offLeft, offRight], 800, 600);
  assert.equal(offLeft.x, 805); // wrapped to width + size
  assert.equal(offRight.x, -5); // wrapped to -size
});

test('tickShapes wraps shapes that exit the top / bottom edges', () => {
  const offTop = { x: 50, y: -10, vx: 0, vy: 0, size: 3, rotation: 0, rotationSpeed: 0 };
  const offBottom = { x: 50, y: 650, vx: 0, vy: 0, size: 3, rotation: 0, rotationSpeed: 0 };
  tickShapes([offTop, offBottom], 500, 600);
  assert.equal(offTop.y, 603); // 600 + 3
  assert.equal(offBottom.y, -3); // -size
});

test('tickShapes returns the same array (mutates in place)', () => {
  const shapes = [{ x: 0, y: 0, vx: 0, vy: 0, size: 1, rotation: 0, rotationSpeed: 0 }];
  assert.equal(tickShapes(shapes, 100, 100), shapes);
});
