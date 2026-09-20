import test from 'node:test';
import assert from 'node:assert/strict';

import {
  COMPACT_SECTIONS,
  defaultSectionsFor,
  sectionLookupFor,
} from '../scripts/views/project-detail-helpers.js';

test('COMPACT_SECTIONS exposes curated copy for each compact project', () => {
  const expected = [
    'byteport', 'tracera', 'dss-cipher',
    'cliproxyapi-plusplus', 'agentapi-plusplus',
    'mcpforge', 'forgecode', 'frostify',
  ];
  for (const slug of expected) {
    assert.ok(COMPACT_SECTIONS[slug], `missing compact sections for ${slug}`);
    assert.ok(COMPACT_SECTIONS[slug].length >= 2, `${slug} should have >=2 sections`);
  }
});

test('Every compact entry is a [heading, paragraph] tuple of strings', () => {
  for (const [slug, sections] of Object.entries(COMPACT_SECTIONS)) {
    for (const section of sections) {
      assert.equal(Array.isArray(section), true, `${slug} entry should be a tuple`);
      assert.equal(section.length, 2, `${slug} entry should have 2 parts`);
      assert.equal(typeof section[0], 'string', `${slug} heading should be a string`);
      assert.equal(typeof section[1], 'string', `${slug} body should be a string`);
    }
  }
});

test('defaultSectionsFor picks the physical-product trio', () => {
  const sections = defaultSectionsFor({ category: 'physical-product' });
  const headings = sections.map(([h]) => h);
  assert.deepEqual(headings, ['Context', 'Decisions', 'Outcome']);
});

test('defaultSectionsFor picks the engineering trio for everything else', () => {
  const categories = ['ai-infrastructure', 'ai-ml', 'developer-tools', 'cloud', 'systems', 'simulation', 'design', undefined];
  for (const category of categories) {
    const sections = defaultSectionsFor({ category });
    const headings = sections.map(([h]) => h);
    assert.deepEqual(headings, ['Problem', 'Architecture', 'Verification']);
  }
});

test('sectionLookupFor honours caseStudy.sections override first', () => {
  const override = [['Custom', 'Body']];
  const out = sectionLookupFor({ slug: 'frostify', caseStudy: { sections: override } });
  assert.deepEqual(out, override);
});

test('sectionLookupFor falls back to compact sections for curated slugs', () => {
  const out = sectionLookupFor({ slug: 'frostify' });
  assert.equal(out, COMPACT_SECTIONS.frostify);
});

test('sectionLookupFor falls back to defaultSectionsFor when neither override nor compact applies', () => {
  const project = { slug: 'unknown', category: 'ai-ml' };
  const out = sectionLookupFor(project);
  assert.deepEqual(out.map(([h]) => h), ['Problem', 'Architecture', 'Verification']);
});

test('sectionLookupFor defaults to physical-product fallback when category is missing', () => {
  // No slug match, no category -> falls into the non-physical branch
  // (defaultSectionsFor treats undefined as 'engineering').
  const out = sectionLookupFor({ slug: 'unknown' });
  assert.deepEqual(out.map(([h]) => h), ['Problem', 'Architecture', 'Verification']);
});
