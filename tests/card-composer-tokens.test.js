import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PROJECTS_WITH_IMAGES,
  TECH_COLORS,
  mulberry32,
  hashString,
  pick,
  resolveAccentColors,
} from '../scripts/media/card-composer-tokens.js';

test('mulberry32 returns a deterministic stream for a given seed', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 8; i++) {
    assert.equal(a(), b());
  }
});

test('mulberry32 produces values in [0, 1) over many draws', () => {
  const rng = mulberry32(123);
  for (let i = 0; i < 1000; i++) {
    const v = rng();
    assert.ok(v >= 0 && v < 1, `value ${v} at ${i} should be in [0,1)`);
  }
});

test('mulberry32 is reproducible across processes for the same seed', () => {
  // First draw of seed 0 is a fixed reference value; the visual output of
  // every generated card image depends on this being stable across machines.
  const rng = mulberry32(0);
  assert.ok(Math.abs(rng() - 0.26642920868471265) < 1e-9);
});

test('hashString is deterministic and returns a 32-bit unsigned integer', () => {
  const a = hashString('netweave');
  const b = hashString('netweave');
  const c = hashString('sharecli');
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.ok(Number.isInteger(a));
  assert.ok(a >= 0 && a <= 0xffffffff, `expected uint32, got ${a}`);
});

test('hashString distinguishes common projects and never collides on simple shifts', () => {
  assert.notEqual(hashString('netweave'), hashString('netweaves'));
  assert.notEqual(hashString('a'), hashString('b'));
  assert.notEqual(hashString('a'), hashString('A'));
});

test('pick returns an element from the array using the supplied rng', () => {
  const arr = ['x', 'y', 'z'];
  // Force rng() === 0 -> arr[0]; rng() === 0.99 -> arr[2].
  assert.equal(pick(() => 0, arr), 'x');
  assert.equal(pick(() => 0.5, arr), arr[1]);
  assert.equal(pick(() => 0.9999, arr), 'z');
});

test('resolveAccentColors falls back to the default palette when no tech is supplied', () => {
  assert.equal(resolveAccentColors(undefined).length, 3);
  assert.equal(resolveAccentColors([]).length, 3);
  assert.equal(resolveAccentColors(null).length, 3);
});

test('resolveAccentColors remaps known technologies to their colour swatches', () => {
  const result = resolveAccentColors(['Rust', 'TypeScript']);
  assert.deepEqual(result, [TECH_COLORS.Rust, TECH_COLORS.TypeScript]);
});

test('resolveAccentColors pads to three colours when fewer tech entries map', () => {
  const result = resolveAccentColors(['Rust']);
  assert.equal(result.length, 3);
  assert.equal(result[0], TECH_COLORS.Rust);
});

test('resolveAccentColors returns all mapped entries when there are two or more', () => {
  const result = resolveAccentColors(['Rust', 'Go', 'TypeScript', 'Python', 'Swift']);
  assert.equal(result.length, 5);
  assert.deepEqual(result, [
    TECH_COLORS.Rust,
    TECH_COLORS.Go,
    TECH_COLORS.TypeScript,
    TECH_COLORS.Python,
    TECH_COLORS.Swift,
  ]);
});

test('resolveAccentColors drops unknown technology entries', () => {
  const result = resolveAccentColors(['Rust', 'Not-a-Real-Tech', 'TypeScript']);
  assert.deepEqual(result, [TECH_COLORS.Rust, TECH_COLORS.TypeScript]);
});

test('PROJECTS_WITH_IMAGES lists the eight projects with real card art', () => {
  assert.ok(PROJECTS_WITH_IMAGES.has('netweave'));
  assert.ok(PROJECTS_WITH_IMAGES.has('witf'));
  assert.ok(PROJECTS_WITH_IMAGES.has('gmk-arch'));
  assert.ok(PROJECTS_WITH_IMAGES.has('dss-cipher'));
  assert.ok(PROJECTS_WITH_IMAGES.has('substrate'));
  assert.ok(PROJECTS_WITH_IMAGES.has('phenotype-omlx'));
  assert.ok(PROJECTS_WITH_IMAGES.has('omniroute'));
  assert.ok(PROJECTS_WITH_IMAGES.has('sharecli'));
  assert.equal(PROJECTS_WITH_IMAGES.size, 8);
});

test('hashString then mulberry32 produces the same starting state for the same project', () => {
  // This is the exact pipeline the renderer uses: project slug -> FNV-1a hash
  // -> mulberry32 PRNG. Two calls for the same slug must yield the same stream.
  const seed = hashString('netweave');
  const a = mulberry32(seed);
  const b = mulberry32(seed);
  assert.equal(a(), b());
  assert.equal(a(), b());
});
