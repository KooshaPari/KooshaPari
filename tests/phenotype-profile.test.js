import test from 'node:test';
import assert from 'node:assert/strict';
import * as phenotype from '../data/phenotype.js';
import { PUBLIC_RECORD } from '../data/phenotype-public-record.js';

test('data/phenotype.js re-exports PUBLIC_RECORD from its own module', () => {
  assert.equal(phenotype.PUBLIC_RECORD, PUBLIC_RECORD);
  assert.equal(phenotype.PUBLIC_RECORD.generatedAt, '2026-08-25');
});

test('phenotype profile module exposes its full public import surface', () => {
  const expected = [
    'EDUCATION',
    'IDENTITY',
    'PERSONAS',
    'PHENOTYPE',
    'PUBLIC_RECORD',
    'RECRUITER_STATS',
    'ROLES',
    'SOURCE',
    'TIMELINE',
  ];
  assert.deepEqual(Object.keys(phenotype).sort(), expected);
});

test('resume-derived profile data stays intact after the public-record split', () => {
  assert.equal(phenotype.IDENTITY.handle, 'kooshapari');
  assert.equal(phenotype.ROLES.length, 4);
  assert.equal(phenotype.EDUCATION.degrees.length, 2);
  assert.equal(phenotype.TIMELINE.length, phenotype.ROLES.length);
  assert.ok(phenotype.PERSONAS.product.competencies.length > 0);
  assert.ok(phenotype.PERSONAS.engineering.competencies.length > 0);
});

test('public record keeps its citation-backed findings', () => {
  assert.ok(PUBLIC_RECORD.resumeVsPublic.length > 0);
  for (const entry of PUBLIC_RECORD.resumeVsPublic) {
    assert.ok(entry.claim, 'every comparison row states a claim');
    assert.ok(entry.verdict, 'every comparison row states a verdict');
    assert.ok(Array.isArray(entry.citations) && entry.citations.length > 0);
  }
  assert.equal(PUBLIC_RECORD.socialHandles.length, 21);
  assert.equal(PUBLIC_RECORD.notFound.length, 7);
  assert.ok(PUBLIC_RECORD.legalEntity);
  assert.ok(PUBLIC_RECORD.trademark.mark);
  assert.ok(PUBLIC_RECORD.patents.claimed);
});
