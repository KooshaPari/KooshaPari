import test from 'node:test';
import assert from 'node:assert/strict';

import { GROUPS, partitionProjects } from '../scripts/components/project-index-helpers.js';

test('GROUPS has 7 groups in expected order', () => {
  assert.equal(GROUPS.length, 7);
  const labels = GROUPS.map(([label]) => label);
  assert.deepEqual(labels, ['Featured', 'Systems', 'AI / ML', 'Physical Products', 'Research', 'Archive', 'Compact']);
});

test('GROUPS predicates are callable functions', () => {
  for (const [label, predicate] of GROUPS) {
    assert.equal(typeof predicate, 'function', `${label} should have a predicate`);
    assert.doesNotThrow(() => predicate({}), `${label} predicate should accept any object`);
  }
});

test('partitionProjects drops empty groups', () => {
  const result = partitionProjects([{ slug: 'a', category: 'systems' }]);
  for (const [, entries] of result) assert.ok(entries.length > 0);
});

test('partitionProjects assigns each project to the first matching group only', () => {
  const projects = [
    { slug: 'a', category: 'systems', featured: true },
    { slug: 'b', category: 'systems' },
  ];
  const groups = partitionProjects(projects);
  const featured = groups.find(([label]) => label === 'Featured');
  const systems = groups.find(([label]) => label === 'Systems');
  assert.deepEqual(featured[1].map((p) => p.slug), ['a']);
  assert.deepEqual(systems[1].map((p) => p.slug), ['b']);
});

test('partitionProjects groups AI / ML by both ai-ml and ai-infrastructure categories', () => {
  const projects = [
    { slug: 'ml', category: 'ai-ml' },
    { slug: 'infra', category: 'ai-infrastructure' },
    { slug: 'other', category: 'systems' },
  ];
  const groups = partitionProjects(projects);
  const aiMl = groups.find(([label]) => label === 'AI / ML');
  assert.deepEqual(aiMl[1].map((p) => p.slug).sort(), ['infra', 'ml']);
});

test('partitionProjects treats Research as status === "research" OR category === "simulation"', () => {
  const projects = [
    { slug: 'r1', status: 'research' },
    { slug: 'r2', category: 'simulation' },
    { slug: 'r3', status: 'research', category: 'simulation' },
  ];
  const groups = partitionProjects(projects);
  const research = groups.find(([label]) => label === 'Research');
  assert.deepEqual(research[1].map((p) => p.slug).sort(), ['r1', 'r2', 'r3']);
});

test('partitionProjects puts unassigned projects under Compact', () => {
  const projects = [
    { slug: 'odd', category: 'mystery' },
  ];
  const groups = partitionProjects(projects);
  const compact = groups.find(([label]) => label === 'Compact');
  assert.deepEqual(compact[1].map((p) => p.slug), ['odd']);
});

test('partitionProjects returns an empty array for an empty list', () => {
  assert.deepEqual(partitionProjects([]), []);
});

test('partitionProjects puts historical projects under Archive, not Compact', () => {
  const projects = [{ slug: 'h', status: 'historical', category: 'mystery' }];
  const groups = partitionProjects(projects);
  const archive = groups.find(([label]) => label === 'Archive');
  const compact = groups.find(([label]) => label === 'Compact');
  assert.deepEqual(archive[1].map((p) => p.slug), ['h']);
  assert.equal(compact, undefined);
});

test('partitionProjects handles a project that matches no specific group and goes to Compact', () => {
  const projects = [
    { slug: 's', category: 'systems' },
    { slug: 'odd', category: 'mystery' },
  ];
  const groups = partitionProjects(projects);
  const compact = groups.find(([label]) => label === 'Compact');
  assert.deepEqual(compact[1].map((p) => p.slug), ['odd']);
});
