import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

test('publication outputs exclude macOS Finder metadata at every depth', async () => {
  for (const root of ['dist', '.vercel/output/static']) {
    const entries = await readdir(root, { recursive: true });
    assert.deepEqual(entries.filter((entry) => entry.split('/').at(-1) === '.DS_Store'), [], root);
  }
});

// An importmap is document-scoped. Only index.html declared one, so the five
// other pages that host the WITF viewer could not resolve the bare `three`
// specifier and every 3D viewer outside the homepage degraded to a static
// poster. The build now copies the map into every staged page.
test('every staged page declares the importmap before its bundle script', async () => {
  const manifest = JSON.parse(await readFile('bundled/manifest.json', 'utf8'));
  const bundleRef = `/bundled/${manifest['app.bundle.js']}`;
  const pages = (await readdir('dist', { recursive: true }))
    .filter((name) => name.endsWith('.html'));

  assert.ok(pages.length > 0, 'expected staged HTML pages in dist/');
  for (const page of pages) {
    const html = await readFile(`dist/${page}`, 'utf8');
    const mapAt = html.indexOf('type="importmap"');
    assert.ok(mapAt !== -1, `${page} must declare an importmap`);
    // The map has to be parsed before any module that imports a bare specifier.
    const scriptAt = html.indexOf(bundleRef);
    if (scriptAt !== -1) {
      assert.ok(mapAt < scriptAt, `${page} must declare the importmap before the bundle script`);
    }
    assert.match(
      html.slice(mapAt, mapAt + 400),
      /"three"\s*:/,
      `${page} importmap must resolve the "three" specifier`,
    );
  }
});

test('Vercel static output contains only staged publication assets and matches source', async () => {
  const files = [
    'scripts/app.js',
    'scripts/construction-gate.js',
    'scripts/components/artifact.js',
    'scripts/components/dom.js',
    'scripts/components/evidence.js',
    'scripts/components/project-index.js',
    'scripts/components/shell.js',
    'scripts/lens-state.js',
    'scripts/reader-state.js',
    'scripts/router.js',
    'scripts/work-filters.js',
    'scripts/cursor.js',
    'scripts/dark-mode.js',
    'scripts/image-reveal.js',
    'scripts/magnetic.js',
    'scripts/parallax.js',
    'scripts/scroll-reveal.js',
    'scripts/transitions.js',
    'scripts/media/diagrams.js',
    'scripts/media/diagram-tokens.js',
    'scripts/media/netweave-field.js',
    'scripts/media/netweave-workbench.js',
    'scripts/media/sharecli-workbench.js',
    'scripts/media/sharecli-recording.js',
    'scripts/media/systems-plate.js',
    'scripts/media/layered-image.js',
    'scripts/media/model-slot.js',
    'scripts/media/ambient-field.js',
    'scripts/media/card-composer.js',
    'scripts/media/card-canvas.js',
    'scripts/media/cast-player.js',
    'scripts/media/cast-player-render.js',
    'scripts/media/code-annotate.js',
    'scripts/media/image-slider.js',
    'scripts/media/tech-illustrations.js',
    'scripts/views/blog-index.js',
    'scripts/views/blog-post.js',
    'scripts/views/contact.js',
    'scripts/views/home.js',
    'scripts/views/not-found.js',
    'scripts/views/project-detail.js',
    'scripts/views/resume.js',
    'scripts/views/work-index.js',
    'scripts/views/work.js',
    'data/projects.js',
    'data/posts.js',
    // CSS + JS bundles are content-hashed; the test resolves their on-disk
    // filenames through the manifests written by scripts/bundle-css.js and
    // scripts/bundle-js.js instead of hard-coding the hash.
    'styles/bundled/manifest.json',
    'bundled/manifest.json',
  ];
  // Load hashed bundle filenames from the manifests. The build emits them at
  // both the source and the Vercel output root, so we resolve to whichever
  // exists when we need to read the staged file.
  const cssManifest = JSON.parse(await readFile('styles/bundled/manifest.json', 'utf8'));
  const jsManifest = JSON.parse(await readFile('bundled/manifest.json', 'utf8'));
  const cssHashed = Object.values(cssManifest).map((name) => `styles/bundled/${name}`);
  const jsHashed = Object.values(jsManifest).map((name) => `bundled/${name}`);
  const hashedFiles = new Set([...cssHashed, ...jsHashed]);

  // JS files are minified in dist/ (comments stripped) — verify they exist,
  // but don't byte-compare against unminified source.
  for (const file of files.filter(f => f.endsWith('.js'))) {
    const built = await readFile(`.vercel/output/static/${file}`).catch(() => null);
    assert.ok(built, `missing JS in Vercel output: ${file}`);
    assert.ok(built.length > 0, `empty JS in Vercel output: ${file}`);
  }
  // CSS bundles are minified in styles/bundled/ — verify hashed files exist
  // and are byte-identical to the source-of-truth copies in styles/bundled/.
  for (const rel of cssHashed) {
    const [source, built] = await Promise.all([
      readFile(rel),
      readFile(`.vercel/output/static/${rel}`),
    ]);
    assert.ok(built.length > 0, `empty CSS in Vercel output: ${rel}`);
    assert.deepEqual(built, source, `stale CSS in Vercel output: ${rel}`);
  }
  // JS bundle in bundled/ — verify it exists, non-empty, and matches source.
  for (const rel of jsHashed) {
    const [source, built] = await Promise.all([
      readFile(rel),
      readFile(`.vercel/output/static/${rel}`),
    ]);
    assert.ok(built.length > 0, `empty JS bundle in Vercel output: ${rel}`);
    assert.deepEqual(built, source, `stale JS bundle in Vercel output: ${rel}`);
  }
  // Manifests themselves must be in Vercel output and byte-identical to source.
  for (const rel of ['styles/bundled/manifest.json', 'bundled/manifest.json']) {
    const [source, built] = await Promise.all([
      readFile(rel),
      readFile(`.vercel/output/static/${rel}`),
    ]);
    assert.deepEqual(built, source, `stale manifest in Vercel output: ${rel}`);
  }
  for (const file of ['index.html', 'engineering.html', 'product.html', 'work.html', 'resume.html', 'contact.html', 'blog.html']) {
    const [staged, built] = await Promise.all([
      readFile(`dist/${file}`),
      readFile(`.vercel/output/static/${file}`),
    ]);
    assert.deepEqual(built, staged, `Vercel output differs from generated ${file}`);
  }
  assert.deepEqual(
    await readFile('.vercel/output/static/root.html'),
    await readFile('dist/root.html'),
    'root fallback must retain the canonical home document',
  );
  const config = await readFile('vercel.json', 'utf8');
  for (const excludedPath of ['tests/', 'docs/', 'output/', '.playwright-cli/', '.*\\\\.md']) {
    assert.match(config, new RegExp(excludedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const excluded of ['tests', 'docs', 'output', '.playwright-cli', 'EVIDENCE_LEDGER.md']) {
    await assert.rejects(readFile(`.vercel/output/static/${excluded}`));
  }
});
