/**
 * Pure helpers for the 404 generative-art canvas.
 *
 * The orchestrator (not-found.js) is DOM-bound; this file holds the parts
 * that can be unit-tested without a canvas context:
 *   - the shape generator (`createShapes`)
 *   - the per-frame drift, rotation, and edge wrap (`tickShapes`)
 *   - the constants shared between the orchestrator and its inline CSS
 *
 * `tickShapes` mutates the shapes array in place (the same behaviour as the
 * orchestrator, which avoids per-frame allocation), and `drawShape` is left
 * in the orchestrator because it requires a 2D rendering context.
 */

export const TEAL = '#7EBAB5';
export const SHAPE_COUNT = 18;
export const SHAPE_SPEED = 0.05;

const SHAPE_TYPES = ['triangle', 'circle', 'line'];

/**
 * Build a deterministic array of drifting geometric shapes.
 *
 * Accepts an explicit `rand` so tests can pin the sequence and a host
 * environment can pass `Math.random`. Shape count defaults to SHAPE_COUNT,
 * cycle of triangle/circle/line, sizes in [20, 100].
 */
export function createShapes(width, height, { count = SHAPE_COUNT, rand = Math.random } = {}) {
  const shapes = [];
  for (let i = 0; i < count; i++) {
    shapes.push({
      x: rand() * width,
      y: rand() * height,
      type: SHAPE_TYPES[i % SHAPE_TYPES.length],
      size: 20 + rand() * 80,
      rotation: rand() * Math.PI * 2,
      rotationSpeed: (rand() - 0.5) * 0.002,
      vx: (rand() - 0.5) * SHAPE_SPEED * 2,
      vy: (rand() - 0.5) * SHAPE_SPEED * 2,
      opacity: 0.1 + rand() * 0.1,
    });
  }
  return shapes;
}

/**
 * Advance every shape one step: drift by velocity, rotate, wrap across
 * the viewport edges so the field stays populated.
 *
 * Mutates the input array in place and returns it for caller convenience.
 */
export function tickShapes(shapes, width, height) {
  for (const shape of shapes) {
    shape.x += shape.vx;
    shape.y += shape.vy;
    shape.rotation += shape.rotationSpeed;

    if (shape.x < -shape.size) shape.x = width + shape.size;
    if (shape.x > width + shape.size) shape.x = -shape.size;
    if (shape.y < -shape.size) shape.y = height + shape.size;
    if (shape.y > height + shape.size) shape.y = -shape.size;
  }
  return shapes;
}
