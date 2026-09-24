import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CARD_WIDTH,
  CARD_HEIGHT,
  COLORS,
  drawBackground,
  drawShapes,
  drawConnections,
  drawNoise,
  drawTitleWatermark,
  drawTitleLabel,
  drawTechBadges,
} from '../scripts/media/card-canvas.js';
import { mulberry32, hashString } from '../scripts/media/card-composer-tokens.js';

/**
 * Recording 2D-context mock: named ops are captured in `calls`,
 * property writes land on the store, and any unlisted method is
 * auto-recorded on first use (Proxy fallback).
 */
function makeCtx({ data } = {}) {
  const calls = [];
  const store = {
    calls,
    globalAlpha: 1,
    fillStyle: null,
    strokeStyle: null,
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
    measureText: (t) => ({ width: String(t).length * 8 }),
    createLinearGradient(...args) {
      const stops = [];
      calls.push({ op: 'linearGradient', args, stops });
      return { addColorStop: (offset, color) => stops.push([offset, color]) };
    },
    createRadialGradient(...args) {
      const stops = [];
      calls.push({ op: 'radialGradient', args, stops });
      return { addColorStop: (offset, color) => stops.push([offset, color]) };
    },
    getImageData: (x, y, w, h) => ({
      data: data ?? new Uint8ClampedArray(w * h * 4).fill(128),
    }),
    putImageData: (img) => calls.push({ op: 'putImageData', data: img.data }),
  };
  return new Proxy(store, {
    get(target, prop) {
      if (prop in target) return target[prop];
      target[prop] = (...args) => calls.push({ op: String(prop), args });
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  });
}

test('drawBackground paints graphite vertical gradient plus accent radial', () => {
  const ctx = makeCtx();
  drawBackground(ctx, COLORS.teal);

  const linear = ctx.calls.find((c) => c.op === 'linearGradient');
  assert.deepEqual(linear.stops, [[0, COLORS.graphite950], [1, COLORS.graphite900]]);

  const radial = ctx.calls.find((c) => c.op === 'radialGradient');
  assert.match(radial.stops[0][1], /^rgba\(126, ?186, ?181, ?0\.07\)$/);
  assert.equal(radial.stops[1][1], 'rgba(0,0,0,0)');

  const fills = ctx.calls.filter((c) => c.op === 'fillRect');
  assert.equal(fills.length, 2);
  assert.deepEqual(fills[0].args, [0, 0, CARD_WIDTH, CARD_HEIGHT]);
});

test('drawShapes returns deterministic in-bounds centers for a seeded rng', () => {
  const seed = hashString('gmk-arch');
  const accents = [COLORS.teal, COLORS.olive];
  const ctxA = makeCtx();
  const ctxB = makeCtx();

  const a = drawShapes(ctxA, mulberry32(seed), accents);
  const b = drawShapes(ctxB, mulberry32(seed), accents);

  assert.deepEqual(a, b);
  assert.ok(a.length >= 3 && a.length <= 5, `shape count ${a.length} outside 3..5`);
  for (const p of a) {
    assert.ok(p.x >= 60 && p.x <= CARD_WIDTH - 60, `x out of bounds: ${p.x}`);
    assert.ok(p.y >= 50 && p.y <= CARD_HEIGHT - 50, `y out of bounds: ${p.y}`);
  }
});

test('drawConnections is a no-op below two centers', () => {
  const ctx = makeCtx();
  drawConnections(ctx, mulberry32(1), [{ x: 10, y: 10 }], [COLORS.teal]);
  assert.equal(ctx.calls.length, 0);
});

test('drawConnections links every center with at least the first-center pass', () => {
  const ctx = makeCtx();
  const centers = [{ x: 60, y: 50 }, { x: 400, y: 200 }, { x: 700, y: 350 }];
  drawConnections(ctx, mulberry32(7), centers, [COLORS.teal, COLORS.olive]);
  const curves = ctx.calls.filter((c) => c.op === 'quadraticCurveTo');
  // Center 0 links to every other center unconditionally: n-1 curves minimum.
  assert.ok(curves.length >= centers.length - 1, `only ${curves.length} curves`);
});

test('drawTitleWatermark skips empty titles and ellipsizes long ones', () => {
  const blank = makeCtx();
  drawTitleWatermark(blank, '');
  assert.equal(blank.calls.filter((c) => c.op === 'fillText').length, 0);

  const ctx = makeCtx();
  const long = 'x'.repeat(100);
  drawTitleWatermark(ctx, long);
  const texts = ctx.calls.filter((c) => c.op === 'fillText');
  assert.equal(texts.length, 1);
  assert.match(texts[0].args[0], /\.\.\.$/);
  assert.ok(texts[0].args[0].length < long.length);
  assert.deepEqual(texts[0].args.slice(1), [CARD_WIDTH / 2, CARD_HEIGHT / 2 + 10]);
});

test('drawTitleLabel draws bottom-left with accent underline', () => {
  const ctx = makeCtx();
  drawTitleLabel(ctx, 'Portal Console', COLORS.teal);

  const texts = ctx.calls.filter((c) => c.op === 'fillText');
  assert.deepEqual(texts[0].args, ['Portal Console', 32, CARD_HEIGHT - 34]);

  const move = ctx.calls.find((c) => c.op === 'moveTo');
  const line = ctx.calls.find((c) => c.op === 'lineTo');
  assert.deepEqual(move.args, [32, CARD_HEIGHT - 28]);
  assert.deepEqual(line.args, [32 + 'Portal Console'.length * 8, CARD_HEIGHT - 28]);
});

test('drawTechBadges skips empty stacks and caps the strip at four', () => {
  const empty = makeCtx();
  drawTechBadges(empty, [], COLORS.teal);
  assert.equal(empty.calls.length, 0);

  const missing = makeCtx();
  drawTechBadges(missing, undefined, COLORS.teal);
  assert.equal(missing.calls.length, 0);

  const ctx = makeCtx();
  drawTechBadges(ctx, ['Rust', 'Go', 'TS', 'Py', 'Wasm', 'SQL'], COLORS.teal);
  const texts = ctx.calls.filter((c) => c.op === 'fillText');
  assert.deepEqual(texts.map((t) => t.args[0]), ['Rust', 'Go', 'TS', 'Py']);
});

test('drawNoise applies bounded per-pixel jitter (deterministic stub)', () => {
  const data = new Uint8ClampedArray(16).fill(128);
  const ctx = makeCtx({ data });
  const original = Math.random;
  Math.random = () => 0.9;
  try {
    drawNoise(ctx);
  } finally {
    Math.random = original;
  }
  // n = (0.9 - 0.5) * 12 = 4.8 -> 132.8 rounds to 133 in Uint8ClampedArray.
  // Alpha (every 4th byte) is deliberately untouched by drawNoise.
  assert.deepEqual([data[0], data[1], data[2]], [133, 133, 133]);
  assert.equal(data[3], 128);
  assert.equal(data[4], 133);
  assert.equal(ctx.calls.filter((c) => c.op === 'putImageData').length, 1);
});

test('drawNoise never produces out-of-range channel values', () => {
  const data = new Uint8ClampedArray(16).fill(0);
  const ctx = makeCtx({ data });
  const original = Math.random;
  Math.random = () => 0; // n = -6; clamped at 0
  try {
    drawNoise(ctx);
  } finally {
    Math.random = original;
  }
  for (const v of data) assert.ok(v >= 0 && v <= 255);
});
