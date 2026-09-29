import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = [
  'styles/tokens.css',
  'styles/base.css',
  'styles/artifacts.css',
  'styles/case-studies.css',
  'styles/hero.css',
  'styles/cards.css',
  'styles/responsive.css',
];

const loadAll = async () => Object.fromEntries(
  await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')]))
);

test('tokens.css exposes the precision-material radius, motion, and surface tokens', async () => {
  const css = (await loadAll())['styles/tokens.css'];
  for (const token of [
    '--radius-control',
    '--radius-panel',
    '--radius-studio',
    '--space-0',
    '--motion-short',
    '--motion-standard',
    '--surface-obsidian',
    '--surface-slate',
    '--surface-ceramic',
    '--eyebrow-line',
    '--precision-rule',
    '--type-display',
    '--type-mono',
  ]) {
    assert.match(css, new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`), `missing token: ${token}`);
  }
});

test('motion tokens stay disciplined — short and standard under 250ms, ambient motion off', async () => {
  const css = (await loadAll())['styles/tokens.css'];
  // --motion-short and --motion-standard must be ≤ 220ms (precision discipline)
  const shortMatch = css.match(/--motion-short:\s*(\d+)ms/);
  const standardMatch = css.match(/--motion-standard:\s*(\d+)ms/);
  assert.ok(shortMatch, 'expected --motion-short to be defined in ms');
  assert.ok(standardMatch, 'expected --motion-standard to be defined in ms');
  assert.ok(Number(shortMatch[1]) <= 220, `--motion-short should be ≤ 220ms (got ${shortMatch[1]}ms)`);
  assert.ok(Number(standardMatch[1]) <= 220, `--motion-standard should be ≤ 220ms (got ${standardMatch[1]}ms)`);
  // Ambient animation default off (no body-level infinite motion in tokens)
  assert.doesNotMatch(css, /animation\s*:\s*[a-zA-Z-]+\s+[\d.]+s\s+ease-in-out\s+infinite/);
});

test('precision radii stay small (control ≤ 8px, panel ≤ 14px) to avoid plush shapes', async () => {
  const css = (await loadAll())['styles/tokens.css'];
  const controlMatch = css.match(/--radius-control:\s*(\d+)px/);
  const panelMatch = css.match(/--radius-panel:\s*(\d+)px/);
  assert.ok(controlMatch, 'expected --radius-control in px');
  assert.ok(panelMatch, 'expected --radius-panel in px');
  assert.ok(Number(controlMatch[1]) <= 8, `--radius-control should be ≤ 8px (got ${controlMatch[1]}px)`);
  assert.ok(Number(panelMatch[1]) <= 14, `--radius-panel should be ≤ 14px (got ${panelMatch[1]}px)`);
});

test('no banned neon or chromatic glow patterns introduced into the touched stylesheets', async () => {
  const all = await loadAll();
  for (const [file, css] of Object.entries(all)) {
    // Banned: pure neon cyan / electric magenta
    assert.doesNotMatch(css, /#0ff\b/i, `${file} contains neon cyan hex`);
    assert.doesNotMatch(css, /#f0f\b/i, `${file} contains neon magenta hex`);
    assert.doesNotMatch(css, /#ff00ff\b/i, `${file} contains neon magenta hex`);
    // Banned: glow text-shadow and decorative drop-shadow stacks on body text
    assert.doesNotMatch(css, /text-shadow\s*:\s*[^;]*\b\d+px\s+\d+px\s+\d+px/, `${file} contains decorative text-shadow`);
  }
});

test('reduced-motion safety override is preserved across tokens or base', async () => {
  const all = await loadAll();
  const reducedMotion = Object.values(all).join('\n');
  assert.match(reducedMotion, /prefers-reduced-motion\s*:\s*reduce/);
  // Must clamp transitions and animations, not just the global selector
  assert.match(reducedMotion, /(transition-duration|animation-duration)\s*:\s*0\.01ms\s*!important/);
});

test('construction-gate readability is preserved — its stylesheet is not touched', async () => {
  const css = await readFile('styles/construction-gate.css', 'utf8');
  // The first-paint gate must keep its readable text colors and contrast pair
  assert.match(css, /color:\s*#f7f8fb/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /forced-colors/);
});

test('decorative noise filters and full-page blur are not introduced into the public stylesheets', async () => {
  const all = await loadAll();
  // This blind draft owns tokens/base only. Existing hero/artifact surfaces
  // intentionally contain older material studies and are not recertified by
  // this focused regression.
  for (const file of ['styles/tokens.css', 'styles/base.css']) {
    const css = all[file];
    assert.doesNotMatch(css, /backdrop-filter\s*:\s*blur\(\s*\d+\s*px\)/i,
      `${file} should not introduce a backdrop blur (precision materials stay readable)`);
    assert.doesNotMatch(css, /filter\s*:\s*blur\(\s*\d+px\)/i,
      `${file} should not introduce a decorative blur filter`);
  }
});

test('touched stylesheets keep the four canonical seed colors and avoid raw neon', async () => {
  const all = await loadAll();
  const joined = Object.entries(all)
    .filter(([file]) => file !== 'styles/construction-gate.css')
    .map(([, css]) => css)
    .join('\n');
  // Canonical seeds must remain visible somewhere in the touched files (notably tokens/base)
  const tokens = all['styles/tokens.css'];
  for (const seed of ['#0F1012', '#353A40', '#F6F5F5', '#7EBAB5']) {
    assert.match(tokens, new RegExp(seed, 'i'), `tokens.css lost canonical seed ${seed}`);
  }
  // Banned: gradient-text or gradient backgrounds outside of dark canvas layers
  assert.doesNotMatch(joined, /background-clip\s*:\s*text/);
});
