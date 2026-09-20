import test from 'node:test';
import assert from 'node:assert/strict';

import { CATEGORY_ICONS } from '../scripts/media/card-icons.js';

test('CATEGORY_ICONS covers every documented product category', () => {
  const categories = [
    'ai-infrastructure',
    'ai-ml',
    'developer-tools',
    'cloud',
    'systems',
    'simulation',
    'design',
    'physical-product',
  ];
  for (const category of categories) {
    assert.ok(CATEGORY_ICONS[category], `missing icon for ${category}`);
  }
});

test('every CATEGORY_ICONS value maps to a known icon type (not an arbitrary string)', () => {
  const known = new Set(['router', 'neural', 'gears', 'cloud', 'terminal', 'graph', 'palette', 'cube']);
  for (const [category, icon] of Object.entries(CATEGORY_ICONS)) {
    assert.ok(known.has(icon), `${category} maps to unknown icon "${icon}"`);
  }
});

test('CATEGORY_ICONS maps each category to a unique icon type', () => {
  const icons = Object.values(CATEGORY_ICONS);
  assert.equal(new Set(icons).size, icons.length);
});

test('CATEGORY_ICONS maps cleanly to the categories consumed by the work index', () => {
  // Cross-check that the keys here align with the lens families the rest
  // of the site uses; if any drop, the dispatcher will silently fall back
  // to 'gears' and we want test coverage to catch that.
  assert.equal(CATEGORY_ICONS['ai-infrastructure'], 'router');
  assert.equal(CATEGORY_ICONS['ai-ml'], 'neural');
  assert.equal(CATEGORY_ICONS['developer-tools'], 'gears');
  assert.equal(CATEGORY_ICONS['cloud'], 'cloud');
  assert.equal(CATEGORY_ICONS['systems'], 'terminal');
  assert.equal(CATEGORY_ICONS['simulation'], 'graph');
  assert.equal(CATEGORY_ICONS['design'], 'palette');
  assert.equal(CATEGORY_ICONS['physical-product'], 'cube');
});
