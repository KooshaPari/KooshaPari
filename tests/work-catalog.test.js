import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CATALOG_GROUPS,
  buildWorkCatalog,
  classifyCatalogProject,
  familyForSlug,
  familyStyle,
} from '../scripts/views/work.js';

const projects = [
  { slug: 'featured', featured: true, status: 'current', category: 'systems', lens: ['engineering'] },
  { slug: 'compact', status: 'current', category: 'cloud', lens: ['engineering', 'product'] },
  { slug: 'oldest', status: 'historical', category: 'design', lens: ['product'], archiveDate: '2020-01-15' },
  { slug: 'newest', status: 'historical', category: 'developer-tools', lens: ['engineering'], archiveDate: '2024-06-01' },
  { slug: 'undated', status: 'historical', category: 'developer-tools', lens: ['engineering'] },
  { slug: 'featured-historical', featured: true, status: 'historical', category: 'physical-product', lens: ['product'] },
];

test('catalog classification is a disjoint featured, compact, archive partition', () => {
  assert.equal(classifyCatalogProject(projects[0]), 'featured');
  assert.equal(classifyCatalogProject(projects[1]), 'compact');
  assert.equal(classifyCatalogProject(projects[2]), 'archive');
  assert.equal(classifyCatalogProject(projects[5]), 'featured');
});

test('buildWorkCatalog preserves approved filtering and stable group contracts', () => {
  const catalog = buildWorkCatalog(projects, 'engineering');

  assert.equal(catalog.filter, 'engineering');
  assert.equal(catalog.total, 4);
  assert.deepEqual(catalog.groups.map(({ kind, label }) => [kind, label]), CATALOG_GROUPS.map(({ kind, label }) => [kind, label]));
  assert.deepEqual(catalog.groups[0].projects.map(({ slug }) => slug), ['featured']);
  assert.deepEqual(catalog.groups[1].projects.map(({ slug }) => slug), ['compact']);
  assert.deepEqual(catalog.groups[2].projects.map(({ slug }) => slug), ['newest', 'undated']);
});

test('buildWorkCatalog does not mutate records or the source array', () => {
  const source = [...projects];
  const before = structuredClone(projects);

  const catalog = buildWorkCatalog(source, 'all');

  assert.equal(catalog.total, projects.length);
  assert.deepEqual(source, before);
  assert.deepEqual(projects, before);
});

test('archive drawers sort dated records newest first and retain undated source order last', () => {
  const catalog = buildWorkCatalog(projects, 'all');

  assert.deepEqual(
    catalog.groups.find(({ kind }) => kind === 'archive').projects.map(({ slug }) => slug),
    ['newest', 'oldest', 'undated'],
  );
});

test('familyForSlug resolves known slugs to their accent family', () => {
  assert.equal(familyForSlug('netweave'), 'netweave');
  assert.equal(familyForSlug('sharecli'), 'sharecli');
  assert.equal(familyForSlug('witf'), 'physical');
  assert.equal(familyForSlug('gmk-arch'), 'physical');
  assert.equal(familyForSlug('phenotype-omlx'), 'omlx');
});

test('familyForSlug returns null for unknown slugs so callers can skip family styling', () => {
  assert.equal(familyForSlug('not-a-real-project'), null);
  assert.equal(familyForSlug(''), null);
});

test('familyStyle emits the active-then-rest fallback chain for accent and ink', () => {
  const style = familyStyle('netweave');

  assert.match(style, /--family-accent: var\(--family-netweave-active, var\(--family-netweave\)\)/);
  assert.match(style, /--family-accent-ink: var\(--family-netweave-ink-active, var\(--family-netweave-ink, var\(--family-netweave-active, var\(--family-netweave\)\)\)/);
});
