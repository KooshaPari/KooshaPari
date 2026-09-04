import test from 'node:test';
import assert from 'node:assert/strict';

import { parseRoute, routeToHash } from '../scripts/router.js';

test('parseRoute recognizes portfolio views', () => {
  for (const view of ['home', 'work', 'resume', 'contact', 'blog']) {
    assert.deepEqual(parseRoute(`/${view}`), { view });
  }
});

test('parseRoute separates project detail slugs', () => {
  assert.deepEqual(parseRoute('/work/sharecli'), { view: 'project', slug: 'sharecli' });
  assert.deepEqual(parseRoute('/blog/post-title'), { view: 'post', slug: 'post-title' });
});

test('parseRoute recognizes lens routes from path', () => {
  assert.deepEqual(parseRoute('/engineering'), { view: 'engineering', lens: 'engineering' });
  assert.deepEqual(parseRoute('/product'), { view: 'product', lens: 'product' });
});

test('parseRoute falls back to home for empty and unknown routes', () => {
  assert.deepEqual(parseRoute(''), { view: 'home' });
  assert.deepEqual(parseRoute('/unknown'), { view: 'home' });
});

test('routeToHash serializes views and project details', () => {
  assert.equal(routeToHash({ view: 'work' }), '#work');
  assert.equal(routeToHash({ view: 'project', slug: 'sharecli' }), '#work/sharecli');
  assert.equal(routeToHash({ view: 'product' }), '#product');
});
