import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

// `node --test` runs test files concurrently, and build-output.test.js reads the
// real styles/bundled/ and bundled/ trees. If these tests rebuilt in place, the
// bundlers' stale-hash cleanup would delete files another file was reading and
// the suite failed intermittently with ENOENT. So every rebuild here runs
// against a throwaway copy of the repo, leaving the real build outputs untouched.
function withRepoCopy(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'koosha-css-bundle-'));
  try {
    cpSync(ROOT, dir, {
      recursive: true,
      filter: (src) => {
        const rel = src.slice(ROOT.length);
        return !rel.includes('/node_modules') && !rel.includes('/.git');
      },
    });
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function componentsBundle(root) {
  const manifest = JSON.parse(readFileSync(resolve(root, 'styles/bundled/manifest.json'), 'utf8'));
  return readFileSync(resolve(root, 'styles/bundled', manifest['components.css']), 'utf8');
}

test('every styles file is assigned to exactly one bundle', () => {
  withRepoCopy(root => {
    const out = execFileSync(process.execPath, ['scripts/bundle-css.js'], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.doesNotMatch(out, /not assigned to any bundle/, 'no CSS file is orphaned from the bundles');
  });
});

test('artifact physical variants stay ordered directly after base artifact rules', () => {
  // styles/artifacts.css (549 lines) was split into a base file and
  // artifact-physical.css at the same cascade position. If these two ever move
  // apart in scripts/bundle-css.js, the physical-card overrides silently lose
  // to the base rules they are meant to override.
  const source = readFileSync(resolve(ROOT, 'scripts/bundle-css.js'), 'utf8');
  const components = source.slice(source.indexOf("'components.css'"), source.indexOf("'pages.css'"));
  const order = [...components.matchAll(/'([\w-]+\.css)'/g)].map(m => m[1]);
  const base = order.indexOf('artifacts.css');
  const physical = order.indexOf('artifact-physical.css');
  assert.ok(base !== -1 && physical !== -1, 'both artifact files are in the components bundle');
  assert.equal(physical, base + 1, 'artifact-physical.css must directly follow artifacts.css');
});

test('components bundle carries the full artifact rule set after the split', () => {
  withRepoCopy(root => {
    execFileSync(process.execPath, ['scripts/bundle-css.js'], { cwd: root, encoding: 'utf8' });
    const css = componentsBundle(root);
    // Base file rules.
    assert.match(css, /\.artifact-badge/);
    assert.match(css, /\.artifact-media/);
    // Moved physical/ASCII-spine rules.
    assert.match(css, /\.artifact--physical \.artifact-media/);
    assert.match(css, /\.ascii-spine/);
  });
});
