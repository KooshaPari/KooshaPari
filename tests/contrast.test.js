// tests/contrast.test.js
// WCAG 2.2 AA contrast gate for the family badge text system.
//
// Parses styles/tokens.css (resolving var() chains) and asserts every
// family accent/ink pair holds >=4.5:1 (small text) against the
// worst-case badge background in BOTH themes: badge fill =
// color-mix(accent 12%, transparent) over the lightest surface that
// theme can place it on.
//
// Also asserts the core body-text pairs and the focus-ring non-text (3:1).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const CSS = readFileSync('styles/tokens.css', 'utf8');

// "--name: <value>;" declarations. First declaration per name wins
// (matches cascade for same-element resolution within one block).
function tokensOf(source) {
  const out = {};
  for (const m of source.matchAll(/--([a-z0-9-]+)\s*:\s*([^;{}]+);/g)) {
    if (out[m[1]] === undefined) out[m[1]] = m[2].trim();
  }
  return out;
}

// Resolve a token to a literal hex, following var(--x) chains.
function T(map, name) {
  const raw = map[name];
  assert.ok(raw !== undefined, `token --${name} not found`);
  let value = raw;
  for (let i = 0; i < 10; i++) {
    if (value.startsWith('#')) return value.toLowerCase();
    const m = value.match(/^var\(\s*--([a-z0-9-]+)\s*(?:,\s*([^)]+))?\)$/);
    assert.ok(m, `cannot resolve --${name}: "${raw}" (at "${value}")`);
    if (map[m[1]] !== undefined) value = map[m[1]];
    else if (m[2] !== undefined) value = m[2].trim();
    else assert.fail(`var() target --${m[1]} missing while resolving --${name}`);
  }
  assert.fail(`var() cycle resolving --${name}`);
}

function blockOf(source, selector) {
  // Match the selector at the start of a line followed by "{", so prose or
  // comments that merely mention the selector are not matched (a comment
  // in this very file once broke a naive indexOf approach).
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:^|\\n)\\s*${esc}\\s*\\{`);
  const m = re.exec(source);
  assert.ok(m, `selector ${selector} not found in tokens.css`);
  const open = m.index + m[0].lastIndexOf('{');
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  throw new Error(`unbalanced block for ${selector}`);
}

const rootRaw = tokensOf(CSS);
const darkRaw = { ...rootRaw, ...tokensOf(blockOf(CSS, '[data-theme="dark"]')) };

function relLum(hex) {
  const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) {
  const l1 = relLum(a);
  const l2 = relLum(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
function mix12(fg, bg) {
  const f = fg.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
  const b = bg.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
  return '#' + f.map((v, i) => Math.round(v * 0.12 + b[i] * 0.88)
    .toString(16).padStart(2, '0')).join('');
}

const FAMILIES = ['netweave', 'sharecli', 'omniroute', 'physical', 'substrate', 'omlx'];
const LENSES = ['', '-product'];
// Worst-case badge backgrounds: lightest light surface / lightest dark surface.
const LIGHT_BG = T(rootRaw, 'surface-raised'); // #faf7ef
const DARK_BG = T(darkRaw, 'surface-inset'); // graphite-800 #30332e

test('every family ink holds >=4.5:1 on its light-theme badge background', () => {
  for (const fam of FAMILIES) {
    for (const lens of LENSES) {
      const accent = T(rootRaw, `family-${fam}${lens}`);
      const ink = T(rootRaw, `family-${fam}${lens}-ink`);
      const bg = mix12(accent, LIGHT_BG);
      const ratio = contrast(ink, bg);
      assert.ok(ratio >= 4.5,
        `LIGHT ${fam}${lens}: ink ${ink} on ${bg} = ${ratio.toFixed(2)} (need 4.5)`);
    }
  }
});

test('every family ink holds >=4.5:1 on its dark-theme badge background', () => {
  for (const fam of FAMILIES) {
    for (const lens of LENSES) {
      const accent = T(darkRaw, `family-${fam}${lens}`);
      const ink = T(darkRaw, `family-${fam}${lens}-ink`);
      const bg = mix12(accent, DARK_BG);
      const ratio = contrast(ink, bg);
      assert.ok(ratio >= 4.5,
        `DARK ${fam}${lens}: ink ${ink} on ${bg} = ${ratio.toFixed(2)} (need 4.5)`);
    }
  }
});

test('dark block overrides ALL 12 family ink tokens (light values are unsafe on dark)', () => {
  const darkBlock = blockOf(CSS, '[data-theme="dark"]');
  for (const fam of FAMILIES) {
    for (const lens of LENSES) {
      const name = `family-${fam}${lens}-ink`;
      assert.match(darkBlock, new RegExp(`--${name}\\s*:\\s*#[0-9a-fA-F]{6}`),
        `dark block must override --${name}`);
      assert.notEqual(T(darkRaw, name), T(rootRaw, name),
        `--${name} dark value must differ from light value`);
    }
  }
});

test('core body-text pairs hold >=4.5:1 in both themes', () => {
  const pairs = [
    ['ink', 'surface'],
    ['ink', 'surface-raised'],
    ['ink-muted', 'surface'],
    ['ink-muted', 'surface-raised'],
  ];
  for (const [fg, bg] of pairs) {
    const light = contrast(T(rootRaw, fg), T(rootRaw, bg));
    assert.ok(light >= 4.5, `LIGHT ${fg}/${bg} = ${light.toFixed(2)} (need 4.5)`);
    const darkR = contrast(T(darkRaw, fg), T(darkRaw, bg));
    assert.ok(darkR >= 4.5, `DARK ${fg}/${bg} = ${darkR.toFixed(2)} (need 4.5)`);
  }
});

test('focus ring outer stroke holds >=3:1 in both themes (WCAG 2.4.11)', () => {
  // --focus-ring: 0 0 0 3px var(--surface), 0 0 0 6px var(--arch-500)
  const ring = T(rootRaw, 'arch-500');
  const onLight = contrast(ring, T(rootRaw, 'surface'));
  assert.ok(onLight >= 3, `arch-500 vs light surface = ${onLight.toFixed(2)} (need 3)`);
  const onDark = contrast(ring, T(darkRaw, 'surface'));
  assert.ok(onDark >= 3, `arch-500 vs dark surface = ${onDark.toFixed(2)} (need 3)`);
});
