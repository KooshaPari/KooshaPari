import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

test('publication outputs exclude macOS Finder metadata at every depth', async () => {
  for (const root of ['dist', '.vercel/output/static']) {
    const entries = await readdir(root, { recursive: true });
    assert.deepEqual(entries.filter((entry) => entry.split('/').at(-1) === '.DS_Store'), [], root);
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
    'scripts/media/cast-player.js',
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
    'styles/bundled/core.css',
    'styles/bundled/components.css',
    'styles/bundled/pages.css',
  ];
  // JS files are minified in dist/ (comments stripped) — verify they exist,
  // but don't byte-compare against unminified source.
  for (const file of files.filter(f => f.endsWith('.js'))) {
    const built = await readFile(`.vercel/output/static/${file}`).catch(() => null);
    assert.ok(built, `missing JS in Vercel output: ${file}`);
    assert.ok(built.length > 0, `empty JS in Vercel output: ${file}`);
  }
  // CSS bundles are minified in styles/bundled/ — verify they exist and are non-empty.
  for (const file of files.filter(f => f.endsWith('.css'))) {
    const [source, built] = await Promise.all([
      readFile(file),
      readFile(`.vercel/output/static/${file}`),
    ]);
    assert.ok(built.length > 0, `empty CSS in Vercel output: ${file}`);
    assert.deepEqual(built, source, `stale CSS in Vercel output: ${file}`);
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
