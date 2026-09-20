// tests/visual-ascii.test.js
// node --test compatible (ESM to match package.json type=module)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const asciiPath = path.join(__dirname, '..', 'scripts', 'components', 'visual-ascii.js');
const mod = await import(asciiPath);

test('statusWidget returns 9 lines, fixed width 42', () => {
  const out = mod.statusWidget();
  const lines = out.split('\n');
  assert.equal(lines.length, 9);
  for (const line of lines) {
    assert.ok(line.length === 42, `line "${line}" length ${line.length} != 42`);
  }
});

test('statusWidget contains the SYSTEM ONLINE label', () => {
  const out = mod.statusWidget();
  assert.match(out, /SYSTEM ONLINE/);
  assert.match(out, /READY/);
});

test('statusGlyph maps every status in data/projects.js', () => {
  const knownStatuses = [
    'historical',
    'current',
    'research',
    'upstream-contribution',
    'historical prototype',
  ];
  for (const s of knownStatuses) {
    const glyph = mod.statusGlyph(s);
    assert.ok(typeof glyph === 'string' && glyph.length === 1, `glyph for ${s} should be 1 char, got "${glyph}"`);
  }
  assert.equal(mod.statusGlyph('unknown'), '?');
});

test('evidenceChip throws on unknown kind', () => {
  assert.throws(() => mod.evidenceChip('nope'), /Unknown evidence chip kind/);
});

test('evidenceChip renders all four canonical kinds', () => {
  const kinds = mod.allEvidenceChipKinds();
  assert.equal(kinds.length, 4);
  for (const k of kinds) {
    const out = mod.evidenceChip(k);
    assert.ok(out.length > 0);
    assert.match(out, /\+-/);
  }
});

test('evidenceChip external substitutes host', () => {
  const out = mod.evidenceChip('external', { host: 'github.com/x' });
  assert.match(out, /github\.com\/x/);
  assert.doesNotMatch(out, /<host>/);
});

test('evidenceChip upstream substitutes pr count and days', () => {
  const out = mod.evidenceChip('upstream', { prCount: '101', days: '28' });
  assert.match(out, /101/);
  assert.match(out, /28/);
  assert.doesNotMatch(out, /<PR count>/);
  assert.doesNotMatch(out, /<days>/);
});

test('projectSpine renders an 11-line frame for 3 metrics', () => {
  const out = mod.projectSpine('gmk-arch', 'keycap set', ['~4,900', '~$432K', '142K+']);
  const lines = out.split('\n');
  assert.ok(lines.length >= 11, `spine has ${lines.length} lines`);
  assert.match(out, /gmk-arch/);
  assert.match(out, /keycap set/);
  assert.match(out, /~4,900/);
  assert.match(out, /~\$432K/);
});

test('projectSpine caps at 3 metrics', () => {
  const out = mod.projectSpine('test', 'role', ['a', 'b', 'c', 'd', 'e']);
  const lines = out.split('\n');
  assert.equal(lines.length, 11);
  assert.doesNotMatch(out, /\|\s+d\s+\|/);
  assert.doesNotMatch(out, /\|\s+e\s+\|/);
});

test('WIDGETS export exposes all four widgets', () => {
  assert.equal(typeof mod.WIDGETS.status, 'function');
  assert.equal(typeof mod.WIDGETS.evidence, 'function');
  assert.equal(typeof mod.WIDGETS.spine, 'function');
  assert.equal(typeof mod.WIDGETS.glyph, 'function');
});

test('file size <= 500 LOC (hard cap)', () => {
  const text = fs.readFileSync(asciiPath, 'utf8');
  const lines = text.split('\n').length;
  assert.ok(lines <= 500, `${lines} > 500`);
  assert.ok(lines <= 350, `target 350 exceeded: ${lines}`);
});

test('all widgets are pure (no DOM access, no side effects)', () => {
  // Smoke: calling each widget function twice yields the same output.
  const a1 = mod.statusWidget();
  const a2 = mod.statusWidget();
  assert.equal(a1, a2);
  const b1 = mod.evidenceChip('canonical');
  const b2 = mod.evidenceChip('canonical');
  assert.equal(b1, b2);
});
