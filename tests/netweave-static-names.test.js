// tests/netweave-static-names.test.js
// node --test compatible (ESM to match package.json type=module)
//
// Lock in the no-JS NetWeave content guarantee: the prerendered
// `work/netweave.html` must name every workbench view (Overview, Route,
// Traffic, Evidence, Notes) that the interactive workbench exposes when
// JavaScript is enabled. The source template places that list inside
// `<noscript>` as a child of `<main id="view-root">`, and
// `renderProjectDetail()` calls `root.replaceChildren(...)`. The prerender
// round-trip must put that fallback back.

import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { prerenderProjects } from '../scripts/prerender.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const VIEW_NAMES = Object.freeze([
  'Overview',
  'Route',
  'Traffic',
  'Evidence',
  'Notes',
]);
const BODY_NAV_HREFS = Object.freeze(['/', '/work', '/resume', '/contact', '/blog']);
const HEAD_CLOSE = '</head>';
const NOSCRIPT_RE = /<noscript\b[^>]*>([\s\S]*?)<\/noscript>/g;
const HREF_RE = /href="([^"]+)"/g;

test('prerendered netweave document preserves the five workbench view names for a no-JS reader', async () => {
  const tempPublication = await mkdtemp(join(tmpdir(), 'netweave-static-'));
  try {
    await mkdir(join(tempPublication, 'work'), { recursive: true });
    await cp(
      join(PROJECT_ROOT, 'work', 'sharecli.html'),
      join(tempPublication, 'work', 'sharecli.html'),
    );
    await cp(
      join(PROJECT_ROOT, 'work', 'netweave.html'),
      join(tempPublication, 'work', 'netweave.html'),
    );

    await prerenderProjects(tempPublication);

    const prerendered = await readFile(
      join(tempPublication, 'work', 'netweave.html'),
      'utf8',
    );

    for (const name of VIEW_NAMES) {
      assert.ok(
        prerendered.includes(name),
        `prerendered work/netweave.html must contain "${name}" so a no-JS reader sees the workbench view`,
      );
    }

    const buttonCount = (prerendered.match(/<button\b/g) ?? []).length;
    assert.equal(
      buttonCount,
      0,
      'prerendered work/netweave.html must still ship zero <button> elements (no-JS path stays inert)',
    );

    const headEnd = prerendered.indexOf(HEAD_CLOSE);
    assert.ok(headEnd !== -1, 'prerendered work/netweave.html must include </head>');
    const bodySlice = prerendered.slice(headEnd);
    const hrefs = new Set();
    for (const noscript of bodySlice.matchAll(NOSCRIPT_RE)) {
      for (const href of noscript[1].matchAll(HREF_RE)) {
        hrefs.add(href[1]);
      }
    }
    for (const href of BODY_NAV_HREFS) {
      assert.ok(
        hrefs.has(href),
        `body noscript must still expose the internal href ${href} after prerender`,
      );
    }
  } finally {
    await rm(tempPublication, { recursive: true, force: true });
  }
});
