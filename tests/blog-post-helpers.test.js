import test from 'node:test';
import assert from 'node:assert/strict';

import { renderBlock } from '../scripts/views/blog-post-helpers.js';

function makeStub() {
  const calls = [];
  const el = (tag, attrs = {}, ...children) => {
    calls.push({ tag, attrs, children: children.flat().filter((c) => c != null) });
    return { tag, attrs, children };
  };
  el.calls = calls;
  return el;
}

test('renderBlock maps heading with default level=2', () => {
  const el = makeStub();
  const out = renderBlock({ type: 'heading', text: 'Hi' }, el);
  assert.equal(el.calls[0].tag, 'h2');
  assert.equal(out.tag, 'h2');
  assert.equal(el.calls[0].attrs.class, 'post-heading');
});

test('renderBlock clamps heading level to [2, 3] (4 -> h3)', () => {
  const el = makeStub();
  const out = renderBlock({ type: 'heading', level: 4, text: 'Hi' }, el);
  assert.equal(out.tag, 'h3');
});

test('renderBlock clamps heading level to [2, 3] (1 -> h2)', () => {
  const el = makeStub();
  const out = renderBlock({ type: 'heading', level: 1, text: 'Hi' }, el);
  assert.equal(out.tag, 'h2');
});

test('renderBlock maps para to <p>', () => {
  const el = makeStub();
  const out = renderBlock({ type: 'para', text: 'body' }, el);
  assert.equal(out.tag, 'p');
  assert.equal(out.attrs.class, 'post-para');
});

test('renderBlock maps list to <ul> with <li> children', () => {
  const el = makeStub();
  const out = renderBlock({ type: 'list', items: ['a', 'b', 'c'] }, el);
  assert.equal(out.tag, 'ul');
  const liTags = el.calls.filter((c) => c.tag === 'li');
  assert.equal(liTags.length, 3);
});

test('renderBlock maps quote / code / hr / note', () => {
  const tagMap = [
    ['quote', 'blockquote'],
    ['code', 'pre'],
    ['hr', 'hr'],
    ['note', 'aside'],
  ];
  for (const [type, tag] of tagMap) {
    const el = makeStub();
    const out = renderBlock({ type, text: 'x' }, el);
    assert.equal(out.tag, tag, `${type} -> ${tag}`);
  }
});

test('renderBlock returns null for unknown types', () => {
  const el = makeStub();
  const out = renderBlock({ type: 'mystery' }, el);
  assert.equal(out, null);
});
