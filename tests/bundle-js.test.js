import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, cpSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

// `node --test` runs test files concurrently, and build-output.test.js reads the
// real bundled/ tree. Rebuilding in place let the bundler's stale-hash cleanup
// delete a file another test was reading, failing intermittently with ENOENT.
// Every rebuild here runs against a throwaway copy of the repo instead.
function withRepoCopy(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'koosha-js-bundle-'));
  try {
    cpSync(ROOT, dir, {
      recursive: true,
      filter: (src) => {
        const rel = src.slice(ROOT.length);
        return !rel.includes('/node_modules') && !rel.includes('/.git');
      },
    });
    // The bundler imports esbuild, so the copy needs the installed dependency
    // tree. Symlinking node_modules resolves it without duplicating it.
    symlinkSync(resolve(ROOT, 'node_modules'), join(dir, 'node_modules'), 'dir');
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function currentBundle(root) {
  const manifest = JSON.parse(readFileSync(resolve(root, 'bundled/manifest.json'), 'utf8'));
  return readFileSync(resolve(root, 'bundled', manifest['app.bundle.js']), 'utf8');
}

test('bundle build succeeds and emits a parseable IIFE', () => {
  withRepoCopy(root => {
    const out = execFileSync(process.execPath, ['scripts/bundle-js.js'], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.match(out, /Bundled \d+ modules/);
    const bundle = currentBundle(root);
    assert.doesNotThrow(() => new Function(bundle), 'bundle must parse as valid JS');
    assert.doesNotMatch(bundle, /\bfrom\s*["'][^"']+["']\s*;?\s*$/m, 'no dangling import/export-from clause');
  });
});

test('bundle inlines re-exported modules instead of dropping them', () => {
  withRepoCopy(root => {
    // data/phenotype.js re-exports PUBLIC_RECORD from phenotype-public-record.js.
    // The bundler must walk that dependency and inline its body; before support
    // for `export ... from`, the statement was neither followed nor stripped and
    // the build aborted with a transform error.
    execFileSync(process.execPath, ['scripts/bundle-js.js'], { cwd: root, encoding: 'utf8' });
    const bundle = currentBundle(root);
    assert.match(bundle, /Santa Monica/, 'IDENTITY from data/phenotype.js is bundled');
    assert.match(bundle, /Script Kiddie/, 'PUBLIC_RECORD body from the re-exported module is bundled');
  });
});

test('bundle manifest points at the only emitted bundle', () => {
  withRepoCopy(root => {
    execFileSync(process.execPath, ['scripts/bundle-js.js'], { cwd: root, encoding: 'utf8' });
    const manifest = JSON.parse(readFileSync(resolve(root, 'bundled/manifest.json'), 'utf8'));
    const files = readdirSync(resolve(root, 'bundled')).filter(f => f.endsWith('.js'));
    assert.deepEqual(files, [manifest['app.bundle.js']]);
  });
});
