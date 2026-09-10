import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('OmniRoute static metadata retains its contribution boundary', async () => {
  const html = await readFile('work/omniroute.html', 'utf8');
  assert.match(html, /<title>OmniRoute — Koosha Paridehpour<\/title>/);
  assert.match(html, /https:\/\/kooshapari\.com\/work\/omniroute/);
  assert.match(html, /External contribution to OmniRoute/);
  assert.doesNotMatch(html, /Technical Atelier<\/title>/);
});

test('SPA metadata updates every route-level social field', async () => {
  const source = await readFile('scripts/app.js', 'utf8');
  for (const selector of [
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:url"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
  ]) {
    assert.match(source, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
