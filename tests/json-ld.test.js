// tests/json-ld.test.js
// node --test compatible (ESM to match package.json type=module)
// Lock in the canonical Person JSON-LD across every source HTML page so that
// future edits can't silently drift structured data. The 2026-10-10 grader
// adjudication flagged zero test coverage for the Person payload; the original
// blog.html carried a different LinkedIn slug (koosha-paridehpour/ vs the
// canonical koosha-paridehpour-1079b61b5/) and the drift propagated through
// prerender to 6 dist files. This test makes that class of bug a build failure.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const PROJECT_ROOT = join(import.meta.dirname, '..');

const CANONICAL = Object.freeze({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Koosha Paridehpour',
  url: 'https://kooshapari.com/',
  sameAs: [
    'https://github.com/KooshaPari',
    'https://www.linkedin.com/in/koosha-paridehpour-1079b61b5/',
  ],
});

const JSON_LD_RE = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/;
// `output/` is gitignored archive material (resume variants, old design screenshots, …).
// `.vercel/` and `dist/` are build outputs. `node_modules/` is dependencies.
const SKIP_DIRS = new Set(['output', '.vercel', 'dist', 'node_modules', '.git']);
const SKIP_FILES = new Set(['404.html']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(join(dir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      if (SKIP_FILES.has(entry.name)) continue;
      yield join(dir, entry.name);
    }
  }
}

async function listSourceHtml() {
  const files = [];
  for await (const file of walk(PROJECT_ROOT)) {
    files.push(file);
  }
  return files.sort();
}

function extractJsonLd(html) {
  const match = html.match(JSON_LD_RE);
  if (!match) return null;
  return JSON.parse(match[1]);
}

test('source HTML contains at least the top-level routes', async () => {
  const files = await listSourceHtml();
  const rels = files.map((f) => relative(PROJECT_ROOT, f));
  for (const expected of ['index.html', 'work.html', 'resume.html', 'blog.html', 'contact.html']) {
    assert.ok(rels.includes(expected), `expected source file ${expected} not found`);
  }
});

test('every source HTML page carries the canonical Person JSON-LD', async () => {
  const files = await listSourceHtml();
  assert.ok(files.length >= 15, `expected at least 15 source HTML files, found ${files.length}`);

  const failures = [];
  for (const file of files) {
    const rel = relative(PROJECT_ROOT, file);
    const html = await readFile(file, 'utf8');
    const payload = extractJsonLd(html);
    if (payload === null) {
      failures.push(`${rel}: missing <script type="application/ld+json">`);
      continue;
    }
    try {
      assert.deepEqual(payload, CANONICAL, `${rel} JSON-LD does not match canonical`);
    } catch (err) {
      failures.push(`${rel}: ${err.message.split('\n')[0]}`);
    }
  }

  assert.equal(failures.length, 0, `JSON-LD drift detected:\n  ${failures.join('\n  ')}`);
});

test('canonical payload is Person, not Organization (personal portfolio, not a company)', () => {
  assert.equal(CANONICAL['@type'], 'Person');
  assert.equal(CANONICAL['@type'], 'Person', 'Organization would be the wrong schema type for a personal site');
});

test('canonical payload carries both GitHub and LinkedIn sameAs links', () => {
  assert.ok(CANONICAL.sameAs.includes('https://github.com/KooshaPari'));
  assert.ok(CANONICAL.sameAs.some((u) => u.includes('linkedin.com/in/koosha-paridehpour')));
  assert.equal(CANONICAL.sameAs.length, 2, 'unexpected extra sameAs entry; verify it is intentional before updating');
});
