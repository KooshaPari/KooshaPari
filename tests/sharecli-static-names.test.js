// tests/sharecli-static-names.test.js
// node --test compatible (ESM to match package.json type=module)
//
// Lock in the no-JS ShareCLI content guarantee: the prerendered
// `dist/work/sharecli.html` (the static document a no-JS reader or no-JS
// crawler receives) must name every illustrative runtime state —
// Burst, Coalesce, Observe, Recover — that the interactive Workbench
// exposes when JavaScript is enabled. The source template places that
// list inside `<noscript>` as a child of `<main id="view-root">`, and
// `renderProjectDetail()` calls `root.replaceChildren(...)` to mount the
// case study. Without an explicit round-trip in `prerenderProjects`,
// every such fallback is dropped from the emitted document.
//
// This test calls the production prerender entry on a temp publication
// that contains a copy of `work/sharecli.html` and asserts the four
// state names and the body-nav noscript hrefs both survive.

import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { prerenderProjects } from '../scripts/prerender.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const STATE_NAMES = Object.freeze(['Burst', 'Coalesce', 'Observe', 'Recover']);
const BODY_NAV_HREFS = Object.freeze(['/', '/work', '/resume', '/contact', '/blog']);
const HEAD_CLOSE = '</head>';
const NOSCRIPT_RE = /<noscript\b[^>]*>([\s\S]*?)<\/noscript>/g;
const HREF_RE = /href="([^"]+)"/g;

test('prerendered sharecli document preserves the four runtime state names for a no-JS reader', async () => {
  const tempPublication = await mkdtemp(join(tmpdir(), 'sharecli-static-'));
  try {
    // prerenderProjects reads `work/sharecli.html` from the publication
    // and writes `work/<slug>.html` for each project in PROJECTS. A
    // minimal staging surface (just the template) is sufficient.
    await mkdir(join(tempPublication, 'work'), { recursive: true });
    await cp(
      join(PROJECT_ROOT, 'work', 'sharecli.html'),
      join(tempPublication, 'work', 'sharecli.html'),
    );

    await prerenderProjects(tempPublication);

    const prerendered = await readFile(
      join(tempPublication, 'work', 'sharecli.html'),
      'utf8',
    );

    // Every illustrative state name must reach the emitted document.
    for (const name of STATE_NAMES) {
      assert.ok(
        prerendered.includes(name),
        `prerendered work/sharecli.html must contain "${name}" so a no-JS reader sees the runtime state`,
      );
    }

    // The appended fallback must not introduce any <button> elements; the
    // test surface matches `removeInertControls`'s invariant.
    const buttonCount = (prerendered.match(/<button\b/g) ?? []).length;
    assert.equal(
      buttonCount,
      0,
      'prerendered work/sharecli.html must still ship zero <button> elements (no-JS path stays inert)',
    );

    // Body-nav noscript (the app-level fallback with /, /work, ...) was
    // already preserved by `removeInertControls`’s behavior; assert it
    // survived too so the new fallback cannot have side-effected it.
    const headEnd = prerendered.indexOf(HEAD_CLOSE);
    assert.ok(headEnd !== -1, 'prerendered work/sharecli.html must include </head>');
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
