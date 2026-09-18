import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { PROJECTS } from '../data/projects.js';
import { POSTS } from '../data/posts.js';

const TOP_LEVEL_PAGES = [
  ['index', 'OS-adjacent runtimes, agent infrastructure, distributed backends, and compiler-/kernel-aware engineering.'],
  ['engineering', 'OS-adjacent runtimes, agent infrastructure, distributed backends, and compiler-/kernel-aware engineering.'],
  ['product', 'Leads cross-functional execution, ships commercial outcomes, owns product economics end-to-end.'],
  ['work', 'Work'],
  ['resume', 'Experience'],
  ['contact', 'Let’s build something.'],
  ['blog', 'Writing'],
];

test('published top-level navigation pages retain meaningful static content', async () => {
  for (const [name, heading] of TOP_LEVEL_PAGES) {
    const { document } = parseHTML(await readFile(`dist/${name}.html`, 'utf8'));
    const main = document.getElementById('view-root');
    assert.equal(main.querySelector('h1').textContent, heading);
    assert.ok(main.textContent.trim().length > heading.length);
    assert.equal(main.querySelectorAll('button').length, 0);
    for (const href of ['/work', '/blog', '/resume', '/contact']) {
      assert.ok(document.querySelector(`a[href="${href}"]`), `${name} static navigation misses ${href}`);
    }
  }
});

test('every published project has meaningful static content and truthful provenance', async () => {
  for (const project of PROJECTS) {
    const { document } = parseHTML(await readFile(`dist/work/${project.slug}.html`, 'utf8'));
    const main = document.getElementById('view-root');
    assert.equal(main.querySelector('h1').textContent, project.title);
    assert.ok(main.textContent.includes(project.summary));
    for (const [, copy] of project.caseStudy?.sections ?? []) assert.ok(main.textContent.includes(copy));
    assert.equal(main.querySelector('a.back-link').getAttribute('href'), '/work');
    assert.equal(document.querySelectorAll('button').length, 0);
    for (const href of ['/work', '/blog', '/resume', '/contact']) {
      assert.ok(document.querySelector(`header a[href="${href}"]`), `${project.slug} static navigation misses ${href}`);
    }
    assert.doesNotMatch(main.textContent, /github-pass1-after\.md|EVIDENCE_LEDGER\.md/);
    if (project.slug === 'sharecli') assert.equal(main.querySelectorAll('a[download]').length, 2);
  }
});

test('every published blog post has meaningful static content and clean navigation', async () => {
  for (const post of POSTS) {
    const { document } = parseHTML(await readFile(`dist/blog/${post.slug}.html`, 'utf8'));
    const main = document.getElementById('view-root');
    assert.equal(main.querySelector('h1').textContent, post.title);
    assert.ok(main.textContent.includes(post.excerpt));
    for (const block of post.body.filter((entry) => entry.type === 'para')) {
      assert.ok(main.textContent.includes(block.text));
    }
    assert.equal(main.querySelector('footer.post-footer a').getAttribute('href'), '/blog');
    assert.equal(document.querySelectorAll('button').length, 0);
    for (const href of ['/work', '/blog', '/resume', '/contact']) {
      assert.ok(document.querySelector(`header a[href="${href}"]`), `${post.slug} static navigation misses ${href}`);
    }
    assert.equal(document.title, `${post.title} — Koosha Paridehpour`);
    assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), `https://kooshapari.com/blog/${post.slug}`);
  }
});
