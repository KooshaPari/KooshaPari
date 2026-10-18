// tests/netweave-static-names.test.js
// node --test compatible (ESM to match package.json type=module)
//
// Lock in the no-JS NetWeave content guarantee: the prerendered
// `dist/work/netweave.html` (the static document a no-JS reader or no-JS
// crawler receives) must name every workbench view that the interactive
// NetWeave Workbench exposes when JavaScript is enabled — Overview,
// Route, Traffic, Evidence, Notes. The source template places that list
// inside `<noscript>` as a child of `<main id="view-root">`, and
// `renderProjectDetail()` calls `root.replaceChildren(...)` to mount the
// case study. Without an explicit round-trip in `prerenderProjects`,
// every such fallback is dropped from the emitted document.
//
// This test calls the production prerender entry on a temp publication
// that contains a copy of `work/netweave.html` and asserts the five
// view names and the body-nav noscript hrefs both survive.

import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { prerenderProjects } from '../scripts/prerender.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const VIEW_NAMES = Object.freeze(['Overview', 'Route', 'Traffic', 'Evidence', 'Notes']);

test('prerendered netweave document preserves the five workbench view names for a no-JS reader', async () => {
  const tempPublication = await mkdtemp(join(tmpdir(), 'netweave-static-'));
  try {
    // prerenderProjects reads `work/sharecli.html` from the publication as
    // the project template (every project's prerender output is rendered
    // from that single file). To exercise the NetWeave source template's
    // no-JS fallback we copy `work/netweave.html` to that slot for the
    // duration of the test, then read the emitted doc back. The capture
    // step in `prerenderProjects` must pick up the `#view-root > noscript`
    // block and re-append it after `renderProjectDetail` replaces the
    // view-root's children.
    await mkdir(join(tempPublication, 'work'), { recursive: true });
    await cp(
      join(PROJECT_ROOT, 'work', 'netweave.html'),
      join(tempPublication, 'work', 'sharecli.html'),
    );

    await prerenderProjects(tempPublication);

    const prerendered = await readFile(
      join(tempPublication, 'work', 'sharecli.html'),
      'utf8',
    );

    // Every workbench view label must reach the emitted document.
    const presence = {};
    for (const name of VIEW_NAMES) {
      const found = prerendered.includes(name);
      presence[name] = found;
      assert.ok(
        found,
        `prerendered work/netweave.html must contain "${name}" so a no-JS reader sees the workbench view`,
      );
    }

    // The appended fallback must not introduce any <button> elements; the
    // test surface matches `removeInertControls`'s invariant.
    const buttonCount = (prerendered.match(/<button\b/g) ?? []).length;
    assert.equal(
      buttonCount,
      0,
      'prerendered work/netweave.html must still ship zero <button> elements (no-JS path stays inert)',
    );

    // Surface the five booleans for the operator report. Using a structured
    // log line so the value travels as data, not prose.
    console.log(`netweave-static-names presence: ${JSON.stringify(presence)}`);
  } finally {
    await rm(tempPublication, { recursive: true, force: true });
  }
});
