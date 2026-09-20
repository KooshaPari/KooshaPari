import test from 'node:test';
import assert from 'node:assert/strict';

import { FILTERS, matches, card } from '../scripts/views/work-index-helpers.js';

function makeStubEl() {
  const calls = [];
  const flatten = (kids) => kids.flatMap(k => Array.isArray(k) ? flatten(k) : [k]);
  const make = (tag, attrs = {}, ...kids) => {
    const children = flatten(kids);
    calls.push({ tag, attrs, children });
    return { tag, attrs, children };
  };
  return { el: make, calls };
}

test('FILTERS has the expected chip count and labels', () => {
  assert.equal(FILTERS.length, 9);
  assert.equal(FILTERS[0][0], 'all');
  assert.equal(FILTERS[FILTERS.length - 1][0], 'historical');
  const labels = FILTERS.map(([, label]) => label);
  for (const expected of ['All work', 'Engineering', 'Product', 'Systems', 'AI/ML', 'Developer Tools', 'Cloud', 'Physical Product', 'Historical']) {
    assert.ok(labels.includes(expected), `expected ${expected} in filter labels`);
  }
});

test('matches("all") returns true for any project', () => {
  assert.equal(matches({ category: 'systems' }, 'all'), true);
  assert.equal(matches({ category: 'historical', status: 'historical' }, 'all'), true);
});

test('matches("historical") checks status, not category', () => {
  assert.equal(matches({ status: 'historical' }, 'historical'), true);
  assert.equal(matches({ status: 'active', category: 'historical' }, 'historical'), false);
});

test('matches("engineering"/"product") looks at the lens array', () => {
  assert.equal(matches({ lens: ['engineering', 'systems'] }, 'engineering'), true);
  assert.equal(matches({ lens: ['product'] }, 'product'), true);
  assert.equal(matches({ lens: ['systems'] }, 'engineering'), false);
  assert.equal(matches({}, 'engineering'), false);
  assert.equal(matches({ lens: null }, 'product'), false);
});

test('matches("ai-ml") accepts both ai-ml and ai-infrastructure categories', () => {
  assert.equal(matches({ category: 'ai-ml' }, 'ai-ml'), true);
  assert.equal(matches({ category: 'ai-infrastructure' }, 'ai-ml'), true);
  assert.equal(matches({ category: 'systems' }, 'ai-ml'), false);
});

test('matches(other) checks the project.category exactly', () => {
  assert.equal(matches({ category: 'cloud' }, 'cloud'), true);
  assert.equal(matches({ category: 'cloud' }, 'systems'), false);
});

test('card emits an <article> with the project slug in the title link', () => {
  const { el, calls } = makeStubEl();
  const out = card({ slug: 'foo-bar', title: 'Foo Bar', category: 'systems', status: 'active', summary: 'short' }, el);
  assert.equal(out.tag, 'article');
  assert.equal(out.attrs.class, 'project-card');
  const titleLink = calls.find(c => c.tag === 'a' && c.attrs.class === 'card-title-link');
  assert.equal(titleLink.attrs.href, '#work/foo-bar');
  assert.deepEqual(titleLink.children, ['Foo Bar']);
});

test('card omits the tag row when technologies is empty', () => {
  const { el, calls } = makeStubEl();
  card({ slug: 's', title: 'T', category: 'c', status: 'active', summary: 'x', technologies: [] }, el);
  assert.ok(!calls.some(c => c.tag === 'div' && c.attrs.class === 'tag-row'));
});

test('card emits a tag row with one span per technology', () => {
  const { el, calls } = makeStubEl();
  card({ slug: 's', title: 'T', category: 'c', status: 'active', summary: 'x', technologies: ['Rust', 'WASM'] }, el);
  const row = calls.find(c => c.tag === 'div' && c.attrs.class === 'tag-row');
  assert.ok(row);
  assert.equal(row.children.length, 2);
  const tags = row.children.map(kid => {
    if (kid && kid.tag === 'span') return kid.children[0];
    return kid;
  });
  assert.deepEqual(tags, ['Rust', 'WASM']);
});

test('card emits a repo link when repo is present', () => {
  const { el, calls } = makeStubEl();
  card({ slug: 's', title: 'T', category: 'c', status: 'active', summary: 'x', repo: 'https://example.com/repo' }, el);
  const repoLink = calls.find(c => c.tag === 'a' && c.attrs.href === 'https://example.com/repo');
  assert.ok(repoLink);
  assert.equal(repoLink.attrs.target, '_blank');
  assert.deepEqual(repoLink.children, ['View repository']);
});

test('card omits the repo link when project has no repo', () => {
  const { el, calls } = makeStubEl();
  card({ slug: 's', title: 'T', category: 'c', status: 'active', summary: 'x' }, el);
  const repoLinks = calls.filter(c => c.tag === 'a' && c.children[0] === 'View repository');
  assert.equal(repoLinks.length, 0);
});
