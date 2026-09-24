import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

function currentBundle() {
  const manifest = JSON.parse(readFileSync(resolve(ROOT, 'bundled/manifest.json'), 'utf8'));
  return readFileSync(resolve(ROOT, 'bundled', manifest['app.bundle.js']), 'utf8');
}

test('bundle build succeeds and emits a parseable IIFE', () => {
  const out = execFileSync(process.execPath, ['scripts/bundle-js.js'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.match(out, /Bundled \d+ modules/);
  const bundle = currentBundle();
  assert.doesNotThrow(() => new Function(bundle), 'bundle must parse as valid JS');
  assert.doesNotMatch(bundle, /\bfrom\s*["'][^"']+["']\s*;?\s*$/m, 'no dangling import/export-from clause');
});

test('bundle inlines re-exported modules instead of dropping them', () => {
  // data/phenotype.js re-exports PUBLIC_RECORD from phenotype-public-record.js.
  // The bundler must walk that dependency and inline its body; before support
  // for `export ... from`, the statement was neither followed nor stripped and
  // the build aborted with a transform error.
  const bundle = currentBundle();
  assert.match(bundle, /Santa Monica/, 'IDENTITY from data/phenotype.js is bundled');
  assert.match(bundle, /Script Kiddie/, 'PUBLIC_RECORD body from the re-exported module is bundled');
});

test('bundle manifest points at the only emitted bundle', () => {
  const manifest = JSON.parse(readFileSync(resolve(ROOT, 'bundled/manifest.json'), 'utf8'));
  const files = readdirSync(resolve(ROOT, 'bundled')).filter(f => f.endsWith('.js'));
  assert.deepEqual(files, [manifest['app.bundle.js']]);
});
