// tests/route-coherence.test.js
// node --test compatible (ESM to match package.json type=module)
//
// Advertise-what-you-serve coherence. This exists because a dead `archive.html`
// shipped for months: a full <head> with an empty <main id="view-root">, no
// scripts/views/archive.js, absent from prerender's TOP_LEVEL_ROUTES, and
// unrouted — parseRoute('/archive') returned { view: 'not-found' }. It passed
// the existing nav test purely through its <noscript> block, because
// internal-nav.test.js only asserts a noscript EXISTS and lists the required
// hrefs; nothing ever demanded a real view or a link to /archive.
//
// The defect class is "a page is advertised but renders not-found" (or renders
// an empty prerender shell). Three invariants close it:
//
//   (a) every URL in sitemap.xml resolves to a real route (not 'not-found')
//   (b) every built page has non-zero prerendered #view-root content, except
//       explicitly allow-listed shells
//   (c) sitemap and the built page set agree — no advertised URL lacks a page
//
// Together these mean a URL can only be published once a view, a prerender
// entry, and a staged document all exist for it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { parseRoute } from '../scripts/router-helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DIST = join(PROJECT_ROOT, 'dist');
const SITEMAP = join(PROJECT_ROOT, 'sitemap.xml');

const VIEW_ROOT_RE = /<main id="view-root">([\s\S]*?)<\/main>/;
const LOC_RE = /<loc>([^<]+)<\/loc>/g;

// Built documents that legitimately carry an empty #view-root.
//
// root.html is a byte copy of index.html staged as the deploy-only clean-URL
// fallback (Vercel reserves index.html for its transform; scripts/stage-publication.js
// copies root -> root.html AFTER prerendering, so the copy can never carry
// prerendered markup). It is not a routable page and is deliberately absent
// from TOP_LEVEL_ROUTES. Nothing else may appear here: a new empty entry means
// a page that renders nothing for no-JS visitors and for crawlers that do not
// execute the app bundle.
const EMPTY_VIEW_ROOT_ALLOWLIST = Object.freeze([
  'root.html',
]);

// Read every staged .html document, relative to dist/, as a sorted list.
async function builtPages() {
  const entries = await readdir(DIST, { recursive: true });
  return entries.filter((name) => name.endsWith('.html')).sort();
}

// The <loc> paths in sitemap.xml, normalized to a site-root path so they can be
// matched against router input and against staged filenames.
async function sitemapPaths() {
  const xml = await readFile(SITEMAP, 'utf8');
  const paths = [];
  for (const [, loc] of xml.matchAll(LOC_RE)) {
    const url = new URL(loc);
    paths.push(url.pathname);
  }
  return paths;
}

// A sitemap path maps to a staged filename by its clean-URL rewrite: the
// top-level `/` is index.html, everything else is `<path>.html`. Paths are
// relative and forward-slashed so they line up with readdir output.
function stagedNameFor(pathname) {
  const clean = pathname.replace(/\/+$/, '').replace(/^\/+/, '');
  if (clean === '') return 'index.html';
  return `${clean}.html`;
}

test('every sitemap URL resolves to a real route, not not-found', async () => {
  const paths = await sitemapPaths();
  assert.ok(paths.length > 0, 'sitemap.xml must advertise at least one URL');

  const unroutable = [];
  for (const path of paths) {
    const { view } = parseRoute(path);
    if (view === 'not-found') unroutable.push(path);
  }

  assert.deepEqual(
    unroutable,
    [],
    `sitemap advertises URLs the router cannot resolve (they would render not-found):\n  ${unroutable.join('\n  ')}`,
  );
});

test('every staged page has prerendered #view-root content unless allow-listed', async () => {
  const pages = await builtPages();
  assert.ok(pages.length > 0, 'expected staged HTML pages in dist/');

  const empty = [];
  for (const page of pages) {
    if (EMPTY_VIEW_ROOT_ALLOWLIST.includes(page)) continue;
    const html = await readFile(join(DIST, page), 'utf8');
    const match = html.match(VIEW_ROOT_RE);
    assert.ok(match, `${page} has no <main id="view-root">; cannot verify prerendered content`);
    if (match[1].trim().length === 0) empty.push(page);
  }

  assert.deepEqual(
    empty,
    [],
    `staged pages with an empty prerendered #view-root (dead shells — either give them a\n` +
    `  prerender entry in scripts/prerender.js or delete them):\n  ${empty.join('\n  ')}`,
  );
});

test('sitemap and staged pages agree: no advertised URL lacks a built page', async () => {
  const paths = await sitemapPaths();
  const staged = new Set(await builtPages());

  const unbuilt = paths
    .map(stagedNameFor)
    .filter((name) => !staged.has(name));

  assert.deepEqual(
    unbuilt,
    [],
    `sitemap URLs with no staged document (they would fall through to root.html):\n  ${unbuilt.join('\n  ')}`,
  );
});

test('every staged page is advertised: no orphan documents', async () => {
  // The mirror of the check above. A staged page absent from the sitemap is not
  // a defect by itself — root.html is a fallback, not a destination — but any
  // other orphan means a page ships that no crawler is told about.
  const advertised = new Set((await sitemapPaths()).map(stagedNameFor));
  const orphans = (await builtPages()).filter((name) => !advertised.has(name));

  assert.deepEqual(
    orphans.sort(),
    [...EMPTY_VIEW_ROOT_ALLOWLIST].sort(),
    `staged pages missing from sitemap.xml (add a <loc> or drop the page):\n  ${orphans.join('\n  ')}`,
  );
});
