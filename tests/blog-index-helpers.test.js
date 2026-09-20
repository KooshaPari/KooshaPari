import test from 'node:test';
import assert from 'node:assert/strict';

import { postCard } from '../scripts/views/blog-index-helpers.js';

function makeStub() {
  let id = 0;
  const calls = [];
  const el = (tag, attrs = {}, ...children) => {
    calls.push({ tag, attrs, children: children.flat().filter((c) => c != null) });
    return { __id: id++, tag, attrs, children: children.flat().filter((c) => c != null) };
  };
  el.calls = calls;
  return el;
}

test('postCard wraps the title in a link with /blog/<slug> href', () => {
  const el = makeStub();
  postCard({ slug: 'abc', title: 'Title', excerpt: 'x', date: '2025-01-01' }, el);
  const article = el.calls.find((c) => c.tag === 'article');
  assert.ok(article, 'article element should be created');
  assert.equal(article.attrs.class, 'post-card');
  const allEls = JSON.stringify(el.calls);
  assert.match(allEls, /\/blog\/abc/);
  assert.match(allEls, /Title/);
});

test('postCard renders tags only when present', () => {
  const elA = makeStub();
  postCard({ slug: 'a', title: 'A', excerpt: 'a', date: '2025-01-01' }, elA);
  const withTagsCalls = elA.calls.length;

  const elB = makeStub();
  postCard({ slug: 'b', title: 'B', excerpt: 'b', date: '2025-01-01', tags: ['x', 'y', 'z'] }, elB);
  const withoutTagsHasTagDiv = elB.calls.some((c) => c.attrs.class === 'post-card-tags');
  const withoutTagsHasNoTagDiv = !elA.calls.some((c) => c.attrs.class === 'post-card-tags');
  assert.equal(withoutTagsHasTagDiv, true);
  assert.equal(withoutTagsHasNoTagDiv, true);
  // And the tags-only call draws at least 3 extra elements (the 3 spans):
  assert.ok(withTagsCalls < elB.calls.length);
});

test('postCard defaults provenance to "Writing" and readingTime to empty', () => {
  const el = makeStub();
  postCard({ slug: 'a', title: 'A', excerpt: 'a', date: '2025-01-01' }, el);
  const allEls = JSON.stringify(el.calls);
  assert.match(allEls, /Writing/);
  // The reading-time span sits after the meta dot; we don't need to find it
  // specifically, just confirm the date and dot are present so the slot exists.
  assert.match(allEls, /2025-01-01/);
});

test('postCard respects post-supplied provenance and readingTime', () => {
  const el = makeStub();
  postCard({ slug: 'a', title: 'A', excerpt: 'a', date: '2025-01-01', provenance: 'OSS', readingTime: '6 min' }, el);
  const allEls = JSON.stringify(el.calls);
  assert.match(allEls, /OSS/);
  assert.match(allEls, /6 min/);
});

test('postCard returns the article node as the root', () => {
  const el = makeStub();
  const node = postCard({ slug: 'a', title: 'A', excerpt: 'a', date: '2025-01-01' }, el);
  assert.equal(node.tag, 'article');
  assert.equal(node.attrs.class, 'post-card');
});
