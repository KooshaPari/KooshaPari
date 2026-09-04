import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requiredStaticFiles = ['index.html', 'scripts/app.js', 'styles/base.css'];

test('static deployment source includes the SPA entrypoint and core assets', () => {
  for (const file of requiredStaticFiles) {
    assert.ok(existsSync(file), `missing ${file} from deployment source`);
  }
});

test('Vercel configuration serves the source directory as static output', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  assert.equal(config.outputDirectory, '.');
  assert.ok(Array.isArray(config.rewrites));
  assert.ok(config.rewrites.some(({ source, destination }) => source === '/' && destination === '/index.html'));
});

