import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CARD_WIDTH,
  CARD_HEIGHT,
  SKIP,
  PROJECTS,
  projectsNeedingCards,
} from '../scripts/media/generate-cards-tokens.js';

test('Card dimensions match the static card slot used by card-composer', () => {
  assert.equal(CARD_WIDTH, 800);
  assert.equal(CARD_HEIGHT, 450);
  assert.equal(CARD_WIDTH / CARD_HEIGHT, 16 / 9);
});

test('PROJECTS rows carry slug, title, technologies, and category', () => {
  for (const project of PROJECTS) {
    assert.ok(typeof project.slug === 'string' && project.slug.length > 0);
    assert.ok(typeof project.title === 'string' && project.title.length > 0);
    assert.ok(Array.isArray(project.technologies) && project.technologies.length > 0);
    assert.ok(typeof project.category === 'string' && project.category.length > 0);
  }
});

test('PROJECTS slugs are unique (no double generation)', () => {
  const slugs = PROJECTS.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('PROJECTS categories align with card-icons.js (no icon fallback)', () => {
  // If we generate a card for an unknown category, card-icons falls back to
  // 'gears'. The current list is known to map cleanly to the dispatcher.
  const known = new Set([
    'ai-infrastructure', 'ai-ml', 'developer-tools',
    'cloud', 'systems', 'simulation', 'design', 'physical-product',
  ]);
  for (const project of PROJECTS) {
    assert.ok(known.has(project.category), `${project.slug} has unknown category ${project.category}`);
  }
});

test('projectsNeedingCards excludes the SKIP set', () => {
  const needed = projectsNeedingCards();
  for (const project of needed) {
    assert.ok(!SKIP.has(project.slug), `${project.slug} is in SKIP but projectsNeedingCards returned it`);
  }
  assert.equal(needed.length, PROJECTS.length - PROJECTS.filter((p) => SKIP.has(p.slug)).length);
});
