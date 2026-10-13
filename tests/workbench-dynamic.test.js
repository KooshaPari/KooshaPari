import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const BUNDLED_DIR = resolve(ROOT, 'bundled');

// The two project-specific workbenches are dynamically imported from
// project-detail.js, so their bodies must stay out of the main bundle —
// otherwise every visitor downloads ~30 KB of code that only the sharecli
// and netweave project pages actually render. The markers below are unique
// substrings of each file's source: sharecli-workbench.js carries
// `// ShareCLI Workbench —` in its header, and netweave-workbench.js carries
// `// Netweave Workbench —` after the same edit. If either returns to the
// bundle, these assertions trip before the regression hits the wire.
const SHARE_CLI_MARKER = 'ShareCLI Workbench';
const NETWEAVE_MARKER = 'Netweave Workbench';

function currentBundleSource() {
  // The bundler writes content-hashed filenames and clears stale bundles on
  // every run, so we walk the manifest to find the live one rather than
  // hard-coding the hash. The manifest is checked in to track the
  // logical-name -> hashed-file mapping.
  const manifestPath = resolve(BUNDLED_DIR, 'manifest.json');
  assert.ok(existsSync(manifestPath), 'manifest.json must exist after a bundle run');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const hashedName = manifest['app.bundle.js'];
  const fullPath = resolve(BUNDLED_DIR, hashedName);
  assert.ok(existsSync(fullPath), `expected bundled file ${hashedName} to exist`);
  return readFileSync(fullPath, 'utf8');
}

test('main bundle does not inline the sharecli workbench body', () => {
  const bundle = currentBundleSource();
  assert.doesNotMatch(
    bundle,
    new RegExp(SHARE_CLI_MARKER),
    'sharecli-workbench.js must be dynamically imported, not bundled into the IIFE',
  );
});

test('main bundle does not inline the netweave workbench body', () => {
  const bundle = currentBundleSource();
  assert.doesNotMatch(
    bundle,
    new RegExp(NETWEAVE_MARKER),
    'netweave-workbench.js must be dynamically imported, not bundled into the IIFE',
  );
});

test('sharecli and netweave workbench source files still exist on disk', () => {
  // Dynamic imports only work if the source stays in the repo tree. A
  // well-meaning "cleanup" that deletes the files would break the live
  // site on every sharecli / netweave page render.
  assert.ok(existsSync(resolve(ROOT, 'scripts/media/sharecli-workbench.js')));
  assert.ok(existsSync(resolve(ROOT, 'scripts/media/netweave-workbench.js')));
});

test('project-detail.js no longer statically imports either workbench', () => {
  const source = readFileSync(resolve(ROOT, 'scripts/views/project-detail.js'), 'utf8');
  // Match the static `from '../media/<name>.js'` form, not the dynamic
  // `import('/scripts/media/<name>.js')` form (which uses an absolute URL).
  assert.doesNotMatch(
    source,
    /from\s+['"]\.\.\/media\/sharecli-workbench\.js['"]/,
    'static import of sharecli-workbench.js must be removed',
  );
  assert.doesNotMatch(
    source,
    /from\s+['"]\.\.\/media\/netweave-workbench\.js['"]/,
    'static import of netweave-workbench.js must be removed',
  );
});

test('project-detail.js dynamically imports each workbench by absolute URL', () => {
  const source = readFileSync(resolve(ROOT, 'scripts/views/project-detail.js'), 'utf8');
  // The bundler concatenates the IIFE and serves it from
  // `/bundled/app.bundle.<hash>.js`. A relative `import('../media/...')` would
  // resolve against that URL and 404 in production — the absolute URL keeps
  // it stable for both dev-server.js (which serves the scripts/ tree) and
  // the deployed dist/.
  assert.match(
    source,
    /import\(\s*['"]\/scripts\/media\/netweave-workbench\.js['"]\s*\)/,
    'netweave workbench must be dynamically imported via absolute URL',
  );
  assert.match(
    source,
    /import\(\s*['"]\/scripts\/media\/sharecli-workbench\.js['"]\s*\)/,
    'sharecli workbench must be dynamically imported via absolute URL',
  );
});

test('bundled directory contains exactly the hashed bundle and the manifest', () => {
  // The bundler cleans stale hashed bundles on every run; only the live one
  // (named in manifest.json) should remain. Leftover hashes would silently
  // ship to visitors via old CDN edges.
  const files = readdirSync(BUNDLED_DIR).sort();
  const manifest = JSON.parse(readFileSync(resolve(BUNDLED_DIR, 'manifest.json'), 'utf8'));
  assert.deepEqual(files, [manifest['app.bundle.js'], 'manifest.json'].sort());
});