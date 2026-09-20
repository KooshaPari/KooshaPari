import test from 'node:test';
import assert from 'node:assert/strict';

import {
  VIEW_ROUTES,
  LENS_VIEWS,
  normalizeHash,
  parseSegments,
  parseRoute,
  applyLens,
  routeToPath,
  routeToHash,
} from '../scripts/router-helpers.js';

test('VIEW_ROUTES contains all named views', () => {
  for (const v of ['home', 'engineering', 'product', 'work', 'resume', 'contact', 'blog']) {
    assert.equal(VIEW_ROUTES.has(v), true);
  }
});

test('LENS_VIEWS is engineering and product only', () => {
  assert.deepEqual([...LENS_VIEWS].sort(), ['engineering', 'product']);
});

test('normalizeHash strips leading #', () => {
  assert.equal(normalizeHash('#/resume'), '/resume');
  assert.equal(normalizeHash('resume'), 'resume');
  assert.equal(normalizeHash(''), '');
  assert.equal(normalizeHash(undefined), '');
});

test('parseSegments strips leading slashes and filters empties', () => {
  assert.deepEqual(parseSegments('//work/foo'), ['work', 'foo']);
  assert.deepEqual(parseSegments('/work/'), ['work']);
  assert.deepEqual(parseSegments('///'), []);
  assert.deepEqual(parseSegments(''), []);
});

test('parseRoute returns home for empty input', () => {
  assert.deepEqual(parseRoute(''), { view: 'home' });
  assert.deepEqual(parseRoute('/'), { view: 'home' });
  assert.deepEqual(parseRoute('#'), { view: 'home' });
  assert.deepEqual(parseRoute('   '), { view: 'home' });
});

test('parseRoute parses the lens routes', () => {
  assert.deepEqual(parseRoute('/engineering'), { view: 'engineering', lens: 'engineering' });
  assert.deepEqual(parseRoute('/product'), { view: 'product', lens: 'product' });
});

test('parseRoute parses work index and project detail', () => {
  assert.deepEqual(parseRoute('/work'), { view: 'work' });
  assert.deepEqual(parseRoute('/work/foo'), { view: 'project', slug: 'foo' });
});

test('parseRoute decodes URI-encoded slugs', () => {
  assert.deepEqual(parseRoute('/work/hello%20world'), { view: 'project', slug: 'hello world' });
});

test('parseRoute parses blog index and post detail', () => {
  assert.deepEqual(parseRoute('/blog'), { view: 'blog' });
  assert.deepEqual(parseRoute('/blog/bar'), { view: 'post', slug: 'bar' });
});

test('parseRoute returns home for malformed slug', () => {
  // '%%%' is not a valid URI escape sequence — decodeURIComponent throws
  assert.deepEqual(parseRoute('/work/%'), { view: 'home' });
  assert.deepEqual(parseRoute('/blog/%'), { view: 'home' });
});

test('parseRoute parses static top-level views', () => {
  assert.deepEqual(parseRoute('/resume'), { view: 'resume' });
  assert.deepEqual(parseRoute('/contact'), { view: 'contact' });
});

test('parseRoute returns not-found for unknown paths', () => {
  assert.deepEqual(parseRoute('/zzz'), { view: 'not-found' });
  assert.deepEqual(parseRoute('/unknown/page'), { view: 'not-found' });
});

test('parseRoute parses legacy hash routes', () => {
  assert.deepEqual(parseRoute('#/resume'), { view: 'resume' });
  assert.deepEqual(parseRoute('#work/foo'), { view: 'project', slug: 'foo' });
});

test('parseRoute: lens routes match the bare first segment', () => {
  // The lens routes match on the first segment regardless of length.
  // /engineering and /engineering/extra both resolve to engineering with lens.
  assert.deepEqual(parseRoute('/engineering'), { view: 'engineering', lens: 'engineering' });
  assert.deepEqual(parseRoute('/engineering/extra'), { view: 'engineering', lens: 'engineering' });
});

test('applyLens lifts lens from ?lens= query', () => {
  assert.deepEqual(
    applyLens({ view: 'home' }, 'lens=engineering'),
    { view: 'home', lens: 'engineering' },
  );
  assert.deepEqual(
    applyLens({ view: 'product' }, 'lens=product&foo=bar'),
    { view: 'product', lens: 'product' },
  );
});

test('applyLens ignores invalid lens values', () => {
  assert.deepEqual(applyLens({ view: 'home' }, 'lens=foo'), { view: 'home' });
  assert.deepEqual(applyLens({ view: 'home' }, ''), { view: 'home' });
});

test('applyLens uses URLSearchParams correctly', () => {
  assert.deepEqual(
    applyLens({ view: 'home' }, '?lens=engineering'),
    { view: 'home', lens: 'engineering' },
  );
});

test('routeToPath produces the right path for each view', () => {
  // home has no special case in the switch — default falls through
  assert.equal(routeToPath({ view: 'home' }), '/home');
  assert.equal(routeToPath({ view: 'engineering' }), '/engineering');
  assert.equal(routeToPath({ view: 'product' }), '/product');
  assert.equal(routeToPath({ view: 'work' }), '/work');
  assert.equal(routeToPath({ view: 'blog' }), '/blog');
  assert.equal(routeToPath({ view: 'resume' }), '/resume');
  assert.equal(routeToPath({ view: 'contact' }), '/contact');
  assert.equal(routeToPath({ view: 'project', slug: 'foo' }), '/work/foo');
  assert.equal(routeToPath({ view: 'post', slug: 'bar' }), '/blog/bar');
  // unknown views land on the default branch: `/${view}`
  assert.equal(routeToPath({ view: 'not-found' }), '/not-found');
});

test('routeToPath URL-encodes slugs', () => {
  assert.equal(routeToPath({ view: 'project', slug: 'hello world' }), '/work/hello%20world');
});

test('routeToHash uses # prefix with view name', () => {
  assert.equal(routeToHash({ view: 'home' }), '#home');
  assert.equal(routeToHash({ view: 'engineering' }), '#engineering');
  assert.equal(routeToHash({ view: 'work' }), '#work');
});

test('routeToHash encodes project and post slugs', () => {
  assert.equal(routeToHash({ view: 'project', slug: 'foo' }), '#work/foo');
  assert.equal(routeToHash({ view: 'post', slug: 'bar' }), '#blog/bar');
});

test('routeToHash treats unknown views as home', () => {
  assert.equal(routeToHash({ view: 'not-found' }), '#home');
  assert.equal(routeToHash(null), '#home');
  assert.equal(routeToHash(undefined), '#home');
});

test('parseRoute is the inverse of routeToPath for view-only routes', () => {
  for (const view of ['home', 'engineering', 'product', 'work', 'blog', 'resume', 'contact']) {
    const path = routeToPath({ view });
    const parsed = parseRoute(path);
    assert.equal(parsed.view, view);
  }
});

test('round-trip a project slug with URI encoding', () => {
  const slug = 'hello world';
  const path = routeToPath({ view: 'project', slug });
  assert.deepEqual(parseRoute(path), { view: 'project', slug });
});
