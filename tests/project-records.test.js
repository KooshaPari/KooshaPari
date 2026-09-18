import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { PROJECTS } from '../data/projects.js';
import { orderFeaturedProjects } from '../scripts/views/home.js';

test('portfolio records have unique slugs and required evidence fields', () => {
  const slugs = PROJECTS.map((project) => project.slug);
  assert.equal(new Set(slugs).size, slugs.length);

  for (const project of PROJECTS) {
    for (const key of ['title', 'summary', 'status', 'category', 'lens', 'evidence']) {
      assert.ok(project[key], `${project.slug} missing ${key}`);
    }
  }
});

test('fork entries preserve upstream provenance', () => {
  const forkSlugs = [
    'phenotype-omlx',
    'cliproxyapi-plusplus',
    'agentapi-plusplus',
    'mcpforge',
    'forgecode',
    'frostify',
  ];

  for (const slug of forkSlugs) {
    assert.ok(
      PROJECTS.find((project) => project.slug === slug)?.provenance,
      `${slug} missing provenance`,
    );
  }
});

test('featured records include authored artifact presentation', () => {
  for (const project of PROJECTS.filter((entry) => entry.featured)) {
    assert.ok(project.presentation?.type, `${project.slug} missing presentation.type`);
    assert.ok(project.presentation?.alt, `${project.slug} missing presentation.alt`);
    assert.ok(project.presentation?.annotations?.engineering, `${project.slug} missing engineering annotation`);
    assert.ok(project.presentation?.annotations?.product, `${project.slug} missing product annotation`);
  }
});

test('selected homepage assets distinguish deployed derivatives from retained sources', async () => {
  for (const slug of ['gmk-arch', 'witf']) {
    const project = PROJECTS.find((entry) => entry.slug === slug);
    assert.ok(project.presentation.assets, `${slug} missing selected asset provenance`);
    assert.equal(project.presentation.assets.length, project.gallery.length);

    for (const asset of project.presentation.assets.filter(a => a.sha256)) {
      assert.ok(asset.src, `${slug} asset missing deployed src`);
      assert.ok(asset.alt, `${slug} asset missing authored alt`);
      assert.match(asset.sha256, /^[a-f0-9]{64}$/);
      assert.ok(asset.width > 0 && asset.height > 0, `${slug} asset missing dimensions`);
      assert.ok(asset.retainedSource, `${slug} asset missing retained source record`);
      assert.match(asset.retainedSource.sha256, /^[a-f0-9]{64}$/);
      assert.ok(asset.retainedSource.width > 0 && asset.retainedSource.height > 0);
      assert.equal(asset.ownership, 'review-pending');
      assert.equal(asset.licensing, 'review-pending');

      const bytes = await readFile(`.${asset.src}`);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
    }
  }
});

test('public project data keeps retained source locations private', async () => {
  const source = await readFile(new URL('../data/projects.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /web-migration|retainedSource\s*:\s*\{[^}]*\bpath\s*:|\bmanifest\s*:/s);

  for (const asset of PROJECTS.flatMap((project) => project.presentation?.assets ?? []).filter(a => a.provenance)) {
    assert.match(asset.provenance, /retained source and custody record are private/i);
    assert.match(asset.retainedSource.sha256, /^[a-f0-9]{64}$/);
    assert.ok(asset.retainedSource.width > 0 && asset.retainedSource.height > 0);
  }
});

test('deployed hero asset byte hashes and dimensions match the recorded derivatives exactly', () => {
  const expected = {
    'gmk-arch': [['73362047e4efa5f89a2d355f732425ab7afe3a206f3c4d421dade1cefc10a11a', 354, 90]],
    witf: [
      ['591bf05bcaa4e2b35b4b79afe9757fe4f279a18e736b4fccd37d633fef5c3935', 1600, 900],
      ['79fad510e12f861fc95c1f2d918cd8871882310827cab495578f479d9afb8ac8', 1600, 900],
    ],
  };
  for (const [slug, values] of Object.entries(expected)) {
    const assets = PROJECTS.find((project) => project.slug === slug).presentation.assets.filter(a => a.sha256);
    assert.deepEqual(assets.map(({ sha256, width, height }) => [sha256, width, height]), values);
  }
});

test('homepage featured order responds to the active lens while keeping WITF first', () => {
  const engineering = orderFeaturedProjects(PROJECTS, 'engineering').map(({ slug }) => slug);
  const product = orderFeaturedProjects(PROJECTS, 'product').map(({ slug }) => slug);

  assert.deepEqual(engineering, [
    'witf',
    'sharecli',
    'substrate',
    'phenotype-omlx',
    'netweave',
    'gmk-arch',
    'omniroute',
  ]);
  assert.deepEqual(product, [
    'witf',
    'gmk-arch',
    'sharecli',
    'substrate',
    'phenotype-omlx',
    'netweave',
    'omniroute',
  ]);
});

// State matrix coverage: §13 evidence field on all featured records (string path)
test('all featured records have §13 Evidence Panel field (non-empty evidence string)', () => {
  for (const project of PROJECTS.filter((p) => p.featured)) {
    assert.ok(
      typeof project.evidence === 'string' && project.evidence.length > 0,
      `${project.slug} missing evidence (§13 provenance reference)`,
    );
  }
});

// State matrix coverage: §7 lens annotations on featured records
test('all featured records have §7 lens annotations per COMPONENT_STATE_MATRIX', () => {
  for (const project of PROJECTS.filter((p) => p.featured)) {
    assert.ok(
      project.presentation?.annotations?.engineering,
      `${project.slug} missing presentation.annotations.engineering (§7 lens)`,
    );
    assert.ok(
      project.presentation?.annotations?.product,
      `${project.slug} missing presentation.annotations.product (§7 lens)`,
    );
  }
});

// State matrix coverage: §13 asset provenance (src + sha256) on all gallery assets
// Only projects with structured assets (homepage hero projects) need this — others use simple gallery paths
test('homepage hero projects (gmk-arch, witf) have §13 asset provenance (src + sha256 + dimensions)', () => {
  const heroSlugs = ['gmk-arch', 'witf'];
  for (const slug of heroSlugs) {
    const project = PROJECTS.find((p) => p.slug === slug);
    assert.ok(
      project.presentation?.assets?.length > 0,
      `${slug} missing presentation.assets (§13 provenance)`,
    );
    for (const asset of project.presentation.assets.filter(a => a.sha256)) {
      assert.ok(asset.src, `${slug} asset missing src`);
      assert.match(
        asset.sha256,
        /^[a-f0-9]{64}$/,
        `${slug} asset missing valid sha256`,
      );
      assert.ok(
        asset.width > 0 && asset.height > 0,
        `${slug} asset missing dimensions`,
      );
      assert.equal(asset.ownership, 'review-pending');
      assert.equal(asset.licensing, 'review-pending');
    }
  }
});
