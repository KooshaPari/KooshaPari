import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const BUNDLED_DIR = resolve(ROOT, 'bundled');

// The two project-specific workbenches are dynamically imported from
// project-detail.js, so their bodies must stay out of the main bundle —
// otherwise every visitor downloads ~30 KB of code that only the sharecli
// and netweave project pages actually render. The markers below come in two
// strengths: the header-comment markers catch accidental re-imports under
// the current esbuild config (which preserves top-of-file `// X Workbench`
// comments), while the content-string markers catch any re-import that
// survives esbuild's `minify: true` step (which strips comments by default
// but preserves string-literal values like the `coalesced-stand` role used
// inside sharecli-workbench.js and the `following vehicle` text used
// inside netweave-workbench.js). Both layers are required: a regression
// that re-bundles the workbenches would put the content strings back into
// the main bundle even after the header comments are stripped.
const SHARE_CLI_MARKER = 'ShareCLI Workbench';
const NETWEAVE_MARKER = 'Netweave Workbench';
const SHARE_CLI_CONTENT_MARKER = 'coalesced-stand';
const NETWEAVE_CONTENT_MARKER = 'following vehicle';

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

test('main bundle does not inline the sharecli workbench content (string marker)', () => {
  // `coalesced-stand` is a string-literal value inside sharecli-workbench.js's
  // `objectRoles` array. esbuild's `minify: true` strips comments (so the
  // header-marker test above could in principle pass with a false negative),
  // but it preserves string literals. This test guarantees the workbench
  // body is genuinely out of the main bundle, not just its header comment.
  const bundle = currentBundleSource();
  assert.doesNotMatch(
    bundle,
    new RegExp(SHARE_CLI_CONTENT_MARKER),
    'coalesced-stand role value lives only in sharecli-workbench.js; if it surfaces in the main bundle, the workbench was re-bundled instead of dynamically imported',
  );
});

test('main bundle does not inline the netweave workbench content (string marker)', () => {
  // `following vehicle` is a string-literal value used in netweave-workbench.js's
  // `objectLabel` and `relationship` fields. Same rationale as the sharecli
  // content test: this catches a regression that the header-marker test
  // could miss if esbuild's `legalComments` policy ever changes to `none`.
  const bundle = currentBundleSource();
  assert.doesNotMatch(
    bundle,
    new RegExp(NETWEAVE_CONTENT_MARKER),
    'following vehicle text lives only in netweave-workbench.js; if it surfaces in the main bundle, the workbench was re-bundled instead of dynamically imported',
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