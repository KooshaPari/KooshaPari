import test from 'node:test';
import assert from 'node:assert/strict';

import { WORK_FILTERS, matchesWorkFilter } from '../scripts/work-filters.js';

const system = { status: 'current', category: 'systems', lens: ['engineering'] };
const physical = { status: 'historical', category: 'physical-product', lens: ['product', 'engineering'] };
const aiResearch = { status: 'research', category: 'ai-ml', lens: ['engineering'] };
const aiInfrastructure = { status: 'current', category: 'ai-infrastructure', lens: ['engineering'] };
const developerTool = { status: 'current', category: 'developer-tools', lens: ['engineering'] };
const cloud = { status: 'current', category: 'cloud', lens: ['engineering', 'product'] };

test('work filters expose the approved catalog values', () => {
  assert.deepEqual(
    WORK_FILTERS.map(([value]) => value),
    ['all', 'engineering', 'product', 'systems', 'ai-ml', 'developer-tools', 'cloud', 'physical-product', 'historical'],
  );
});

test('matchesWorkFilter includes representative records for every approved filter', () => {
  assert.equal(matchesWorkFilter(system, 'all'), true);
  assert.equal(matchesWorkFilter(system, 'engineering'), true);
  assert.equal(matchesWorkFilter(physical, 'product'), true);
  assert.equal(matchesWorkFilter(system, 'systems'), true);
  assert.equal(matchesWorkFilter(aiResearch, 'ai-ml'), true);
  assert.equal(matchesWorkFilter(aiInfrastructure, 'ai-ml'), true);
  assert.equal(matchesWorkFilter(developerTool, 'developer-tools'), true);
  assert.equal(matchesWorkFilter(cloud, 'cloud'), true);
  assert.equal(matchesWorkFilter(physical, 'physical-product'), true);
  assert.equal(matchesWorkFilter(physical, 'historical'), true);
});

test('matchesWorkFilter excludes non-matching and unknown filters', () => {
  assert.equal(matchesWorkFilter(system, 'product'), false);
  assert.equal(matchesWorkFilter(system, 'not-a-filter'), false);
});
