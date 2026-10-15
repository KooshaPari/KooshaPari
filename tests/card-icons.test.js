import test from 'node:test';
import assert from 'node:assert/strict';

import { CATEGORY_ICONS, drawCategoryIcon, hexToRgba } from '../scripts/media/card-icons.js';

/**
 * Recording 2D-context mock. Method calls and property writes both land in a
 * single ordered `log` as { kind: 'op'|'set', ... }, so a test can assert the
 * state an individual drawing op ran under — not just the final state, which an
 * icon is free to overwrite afterwards. `calls` is the op-only projection for
 * the common case of counting or scanning emitted geometry.
 * Mirrors the mock in card-canvas.test.js so the two suites read alike.
 */
function makeCtx() {
  const log = [];
  const store = {
    log,
    globalAlpha: 1,
    fillStyle: null,
    strokeStyle: null,
    lineWidth: 1,
    lineCap: '',
    lineJoin: '',
    font: '',
  };
  const ctx = new Proxy(store, {
    get(target, prop) {
      if (prop === 'calls') return log.filter((e) => e.kind === 'op');
      if (prop in target) return target[prop];
      target[prop] = (...args) => log.push({ kind: 'op', op: String(prop), args });
      return target[prop];
    },
    set(target, prop, value) {
      log.push({ kind: 'set', prop: String(prop), value });
      target[prop] = value;
      return true;
    },
  });
  return ctx;
}

/** Snapshot of `prop` as of just after the nth (default: first) occurrence of `op`. */
const stateAtOp = (ctx, op, prop, nth = 0) => {
  const seen = { n: 0 };
  let value;
  for (const entry of ctx.log) {
    if (entry.kind === 'set' && entry.prop === prop) value = entry.value;
    if (entry.kind === 'op' && entry.op === op && seen.n === nth) {
      seen.n += 1;
      return value;
    }
  }
  assert.fail(`expected the icon to issue ${op}() at least ${nth + 1} time(s)`);
};

const countOp = (ctx, op) => ctx.calls.filter((c) => c.op === op).length;

/** Draw with a fresh ctx through `draw`, then count recorded ops named `op`. */
const countOf = (draw, op) => {
  const ctx = makeCtx();
  draw(ctx);
  return countOp(ctx, op);
};

test('CATEGORY_ICONS covers every documented product category', () => {
  const categories = [
    'ai-infrastructure',
    'ai-ml',
    'developer-tools',
    'cloud',
    'systems',
    'simulation',
    'design',
    'physical-product',
  ];
  for (const category of categories) {
    assert.ok(CATEGORY_ICONS[category], `missing icon for ${category}`);
  }
});

test('every CATEGORY_ICONS value maps to a known icon type (not an arbitrary string)', () => {
  const known = new Set(['router', 'neural', 'gears', 'cloud', 'terminal', 'graph', 'palette', 'cube']);
  for (const [category, icon] of Object.entries(CATEGORY_ICONS)) {
    assert.ok(known.has(icon), `${category} maps to unknown icon "${icon}"`);
  }
});

test('CATEGORY_ICONS maps each category to a unique icon type', () => {
  const icons = Object.values(CATEGORY_ICONS);
  assert.equal(new Set(icons).size, icons.length);
});

test('CATEGORY_ICONS maps cleanly to the categories consumed by the work index', () => {
  // Cross-check that the keys here align with the lens families the rest
  // of the site uses; if any drop, the dispatcher will silently fall back
  // to 'gears' and we want test coverage to catch that.
  assert.equal(CATEGORY_ICONS['ai-infrastructure'], 'router');
  assert.equal(CATEGORY_ICONS['ai-ml'], 'neural');
  assert.equal(CATEGORY_ICONS['developer-tools'], 'gears');
  assert.equal(CATEGORY_ICONS['cloud'], 'cloud');
  assert.equal(CATEGORY_ICONS['systems'], 'terminal');
  assert.equal(CATEGORY_ICONS['simulation'], 'graph');
  assert.equal(CATEGORY_ICONS['design'], 'palette');
  assert.equal(CATEGORY_ICONS['physical-product'], 'cube');
});

/* ─── drawCategoryIcon dispatcher ─── */

test('drawCategoryIcon applies the shared stroke setup before dispatching', () => {
  const ctx = makeCtx();
  drawCategoryIcon(ctx, 'cloud', '#00add8');

  assert.equal(ctx.strokeStyle, '#00add8');
  assert.equal(ctx.fillStyle, 'none');
  assert.equal(ctx.lineWidth, 2.2);
  assert.equal(ctx.lineCap, 'round');
  assert.equal(ctx.lineJoin, 'round');
  // The shared setup leaves alpha at the dimmed 0.35 baseline; individual
  // icons raise it locally where they fill rather than stroke.
  assert.equal(ctx.globalAlpha, 0.35);
  assert.ok(ctx.calls.length > 0, 'the dispatcher must emit drawing operations');
});

test('drawCategoryIcon routes each mapped category to a distinct icon drawing', () => {
  // Distinct per-category signatures: the ops recorded for one category must
  // not be a copy of another. This catches a dispatcher that ignores its
  // switch and always draws the same thing.
  const signatures = new Map();
  for (const category of Object.keys(CATEGORY_ICONS)) {
    const ctx = makeCtx();
    drawCategoryIcon(ctx, category, '#3178c6');
    signatures.set(category, ctx.calls.map((c) => c.op).join(','));
  }

  assert.equal(countOf((c) => drawCategoryIcon(c, 'ai-infrastructure', '#fff'), 'arcTo'), 20,
    'router icon emits five rounded boxes, four arcTo corners each');
  assert.equal(countOf((c) => drawCategoryIcon(c, 'ai-ml', '#fff'), 'arc'), 6,
    'neural icon draws exactly six node discs');
  assert.equal(countOf((c) => drawCategoryIcon(c, 'systems', '#fff'), 'fillText'), 1,
    'terminal icon draws exactly one prompt glyph');
  assert.equal(countOf((c) => drawCategoryIcon(c, 'developer-tools', '#fff'), 'closePath'), 2,
    'gears icon draws two closed toothed outlines');
  assert.equal(countOf((c) => drawCategoryIcon(c, 'cloud', '#fff'), 'arc'), 3,
    'cloud silhouette is built from three arcs');
  assert.equal(countOf((c) => drawCategoryIcon(c, 'simulation', '#fff'), 'arc'), 5,
    'graph icon draws five node discs');
  assert.equal(countOf((c) => drawCategoryIcon(c, 'design', '#fff'), 'ellipse'), 1,
    'palette icon draws one swatch ellipse outline');
  assert.equal(countOf((c) => drawCategoryIcon(c, 'physical-product', '#fff'), 'closePath'), 1,
    'cube icon closes exactly one face');

  // Distinctness: no two categories emit the identical op sequence.
  const unique = new Set(signatures.values());
  assert.equal(unique.size, signatures.size, 'each category must draw a distinguishable op sequence');
});

test('drawCategoryIcon falls back to the gears icon for an unknown category', () => {
  const unknown = makeCtx();
  drawCategoryIcon(unknown, 'no-such-category', '#e8734a');
  const gears = makeCtx();
  drawCategoryIcon(gears, 'developer-tools', '#e8734a'); // developer-tools -> gears

  assert.deepEqual(unknown.calls, gears.calls,
    'an unmapped category must draw the same geometry as the gears category');
  assert.equal(countOf((c) => drawCategoryIcon(c, 'no-such-category', '#fff'), 'closePath'), 2,
    'the fallback draws both gear tooth outlines');
});

/* ─── hexToRgba ─── */

test('hexToRgba converts a 6-digit hex to an rgba() string with the given alpha', () => {
  assert.equal(hexToRgba('#e8734a', 0.5), 'rgba(232,115,74,0.5)');
  assert.equal(hexToRgba('#000000', 1), 'rgba(0,0,0,1)');
  // Accepts hex without the leading '#', matching the palette swatch call sites.
  assert.equal(hexToRgba('ffffff', 0), 'rgba(255,255,255,0)');
});

/* ─── per-icon geometry assertions ─── */

test('router icon draws a central box with four port boxes plus a filled hub dot', () => {
  const ctx = makeCtx();
  drawCategoryIcon(ctx, 'ai-infrastructure', '#3178c6');

  // Five rounded boxes (hub + four ports) => 5 roundRect x 4 arcTo each.
  assert.equal(countOp(ctx, 'arcTo'), 20);
  // The hub dot is the only fill, and it is filled with the accent at 0.4.
  const fills = ctx.calls.filter((c) => c.op === 'fill');
  assert.equal(fills.length, 1);
  assert.deepEqual(fills[0].args, []);
  assert.equal(ctx.fillStyle, '#3178c6');
});

test('neural icon draws six node discs and a fully-connected-ish edge set', () => {
  const ctx = makeCtx();
  drawCategoryIcon(ctx, 'ai-ml', '#3178c6');

  assert.equal(countOp(ctx, 'arc'), 6, 'one disc per node');
  // Each node is both filled and stroked.
  assert.equal(countOp(ctx, 'fill'), 6);
  // 15 unordered pairs; the predicate keeps |i-j|<=2 pairs plus (0,5).
  // Counted pairs: (0,1)(0,2)(1,2)(1,3)(2,3)(2,4)(3,4)(3,5)(4,5) + (0,5) = 10.
  const lineTos = ctx.calls.filter((c) => c.op === 'lineTo').length;
  assert.equal(lineTos, 10, 'neural edge predicate must draw exactly the ten kept connections');
});

test('terminal icon tints the screen with the accent at 6% and draws a $ prompt', () => {
  const ctx = makeCtx();
  drawCategoryIcon(ctx, 'systems', '#3178c6');

  // The screen wash is the first fill and must use an accent-derived rgba, not
  // a hardcoded literal, so the screen follows the caller's accent. (Read the
  // state at the fill, not the final fillStyle: the prompt pass overwrites it.)
  assert.equal(countOp(ctx, 'fill'), 1, 'only the screen area is filled');
  assert.equal(stateAtOp(ctx, 'fill', 'fillStyle'), hexToRgba('#3178c6', 0.06),
    'screen wash uses the accent at the documented 6% alpha');

  // The prompt glyph and cursor bar are drawn with the raw accent afterwards.
  const [glyph] = ctx.calls.filter((c) => c.op === 'fillText');
  assert.deepEqual(glyph.args, ['$', -14, -2], 'prompt glyph is drawn at the documented offset');
  assert.equal(stateAtOp(ctx, 'fillText', 'font'), '11px monospace');
  const [cursor] = ctx.calls.filter((c) => c.op === 'fillRect');
  assert.deepEqual(cursor.args, [-20, -12, 2, 14], 'one prompt cursor bar at the documented offset');
  assert.equal(stateAtOp(ctx, 'fillText', 'fillStyle'), '#3178c6',
    'the prompt pass switches fillStyle back to the raw accent');
  assert.equal(stateAtOp(ctx, 'fillText', 'globalAlpha'), 0.6,
    'the prompt pass raises alpha over the shared 0.35 baseline');
});

test('gears icon draws two interlocking gears with teeth and hubs', () => {
  const ctx = makeCtx();
  drawCategoryIcon(ctx, 'developer-tools', '#3178c6');

  // Each gear: one toothed outline (closePath) + one hub arc.
  assert.equal(countOp(ctx, 'arc'), 2, 'two gear hubs');
  assert.equal(countOp(ctx, 'closePath'), 2, 'two toothed outlines');
  // The large gear has 8 teeth and the small has 6. Every tooth emits three
  // lineTo calls (rise to a2, drop to a3, step to a4); only i === 0 emits a
  // moveTo to start the path. So 8 * 3 + 6 * 3 tooth vertices, plus exactly
  // two moveTo calls (one per gear path).
  assert.equal(countOp(ctx, 'lineTo'), 8 * 3 + 6 * 3);
  assert.equal(countOp(ctx, 'moveTo'), 2, 'each gear path starts with a single moveTo');
  assert.equal(countOp(ctx, 'stroke'), 4, 'two toothed outlines plus two hubs');
});

test('cloud icon draws an upload arrow beneath the cloud outline', () => {
  const ctx = makeCtx();
  drawCategoryIcon(ctx, 'cloud', '#3178c6');

  assert.equal(countOp(ctx, 'arc'), 3, 'three arcs compose the cloud silhouette');
  // Two strokes: the silhouette, then the arrow path.
  assert.equal(countOp(ctx, 'stroke'), 2);
  // Arrow shaft reaches y = -6 (upward from the baseline at 14).
  const shaft = ctx.calls.find((c) => c.op === 'lineTo' && c.args[1] === -6);
  assert.deepEqual(shaft.args, [0, -6], 'upload arrow must point up from the cloud baseline');
});

test('graph icon draws five nodes and its five declared edges', () => {
  const ctx = makeCtx();
  drawCategoryIcon(ctx, 'simulation', '#3178c6');

  assert.equal(countOp(ctx, 'arc'), 5, 'one disc per graph node');
  // Five edges declared in EDGES; each moveTo/lineTo pair, and the node discs
  // use arc() rather than lineTo, so exactly five lineTo calls belong to edges.
  assert.equal(countOp(ctx, 'lineTo'), 5, 'the five declared edges only');
  assert.equal(countOp(ctx, 'stroke'), 5);
});

test('palette icon draws five translucent swatches inside one ellipse outline', () => {
  const ctx = makeCtx();
  drawCategoryIcon(ctx, 'design', '#3178c6');

  assert.equal(countOp(ctx, 'arc'), 5, 'one swatch per palette colour');
  assert.equal(countOp(ctx, 'ellipse'), 1, 'one elliptical palette outline');
  // The swatch wash must come from the accent-derived rgba, not a raw hex.
  assert.equal(ctx.lineWidth, 1.5, 'palette overrides lineWidth for the swatch pass');
  assert.equal(ctx.strokeStyle, '#3178c6', 'swatch outline returns to the accent colour');
});

test('cube icon draws a hexagonal face, a top face, and a centre spine', () => {
  const ctx = makeCtx();
  drawCategoryIcon(ctx, 'physical-product', '#3178c6');

  // Three sub-paths: closed face (closePath), top face, vertical spine.
  assert.equal(countOp(ctx, 'beginPath'), 3);
  assert.equal(countOp(ctx, 'closePath'), 1, 'only the main cube face is closed');
  assert.equal(countOp(ctx, 'stroke'), 3);
  // s = 22; the face is defined by the exact documented vertex list.
  const [firstMove] = ctx.calls.filter((c) => c.op === 'moveTo');
  assert.deepEqual(firstMove.args, [-22, 22 * 0.4], 'cube face starts at the documented left vertex');
});
