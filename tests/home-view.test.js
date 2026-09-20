// Home view — tests for the lens-aware identity and featured-rail logic.
//
// We exercise the pure helpers directly (getLensProfile, orderFeaturedProjects)
// and the full render via renderHome() against a linkedom document. The DOM
// output is inspected for lens-specific copy and the APG-relevant structural
// attributes, but we do not try to test every visual class — the e2e suite
// covers that on the real homepage.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseHTML } from 'linkedom';
import { getLensProfile, orderFeaturedProjects, renderHome } from '../scripts/views/home.js';

const dom = () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  return document;
};

// Sample project records covering the lens-relevant fields the home view reads.
// featured + presentation must be true to appear on the rail.
const sampleProjects = [
  { slug: 'witf', featured: true, presentation: { hero: 'h' } },
  { slug: 'sharecli', featured: true, presentation: { hero: 'h' } },
  { slug: 'substrate', featured: true, presentation: { hero: 'h' } },
  { slug: 'phenotype-omlx', featured: true, presentation: { hero: 'h' } },
  { slug: 'archive-only', featured: false, presentation: { hero: 'h' } },
  { slug: 'no-presentation', featured: true, presentation: null },
];

// getLensProfile: returns the right profile data for each known lens and falls
// back to a combined "default" profile when the lens is unknown or absent.
test('getLensProfile returns the engineering profile for engineering lens', () => {
  const profile = getLensProfile('engineering');
  assert.equal(profile.label, 'Engineering');
  assert.equal(profile.atelierClass, 'home-identity--engineering');
  assert.equal(profile.isDefault, false);
  assert.ok(Array.isArray(profile.domains), 'engineering lens lists technical domains');
  assert.ok(profile.domains.length >= 4, 'engineering domains are at least four');
  assert.equal(profile.featuredTitle, 'Engineering projects');
  assert.equal(profile.featuredEyebrow, 'engineering studies');
});

test('getLensProfile returns the product profile for product lens', () => {
  const profile = getLensProfile('product');
  assert.equal(profile.label, 'Product');
  assert.equal(profile.atelierClass, 'home-identity--product');
  assert.equal(profile.isDefault, false);
  assert.equal(profile.domains, null, 'product lens omits inline domain taxonomy');
  assert.equal(profile.featuredTitle, 'Product projects');
  assert.equal(profile.featuredEyebrow, 'product studies');
});

test('getLensProfile falls back to the default atelier profile for an unknown lens', () => {
  const profile = getLensProfile('unknown-lens');
  assert.equal(profile.isDefault, true);
  assert.equal(profile.label, 'Technical Atelier');
  assert.equal(profile.atelierClass, 'home-identity');
  assert.match(profile.heading, /build software systems/i);
  assert.equal(profile.domains, null);
  assert.ok(profile.reading, 'default profile surfaces a reading-state hint');
});

test('getLensProfile surfaces the same navLinks shape for every lens', () => {
  for (const lens of ['engineering', 'product', 'unknown']) {
    const profile = getLensProfile(lens);
    assert.ok(Array.isArray(profile.navLinks), `${lens} navLinks must be an array`);
    for (const link of profile.navLinks) {
      assert.equal(typeof link.href, 'string', 'each navLink has a string href');
      assert.equal(typeof link.label, 'string', 'each navLink has a string label');
      assert.ok(link.href.startsWith('/'), 'navLink href is a same-origin path');
    }
  }
});

// orderFeaturedProjects: priority order is lens-specific, unfeatured projects
// and projects without a presentation record drop out of the rail entirely.
test('orderFeaturedProjects returns lens-priority order for engineering', () => {
  const ordered = orderFeaturedProjects(sampleProjects, 'engineering').map((p) => p.slug);
  // Engineering priority: witf, sharecli, substrate, phenotype-omlx, netweave, gmk-arch.
  // Our sample lacks netweave and gmk-arch; the four featured-with-presentation records
  // are emitted in that order. archive-only (featured=false) and no-presentation
  // (presentation=null) are filtered out.
  assert.deepEqual(ordered, ['witf', 'sharecli', 'substrate', 'phenotype-omlx']);
});

test('orderFeaturedProjects returns lens-priority order for product', () => {
  const ordered = orderFeaturedProjects(sampleProjects, 'product').map((p) => p.slug);
  // Product priority: witf, gmk-arch, sharecli, substrate, phenotype-omlx, netweave.
  // Our sample has witf, sharecli, substrate, phenotype-omlx — same four records,
  // but the relative order between sharecli and substrate changes.
  assert.equal(ordered[0], 'witf');
  assert.ok(ordered.includes('sharecli'));
  assert.ok(ordered.includes('substrate'));
  assert.ok(ordered.includes('phenotype-omlx'));
});

test('orderFeaturedProjects drops unfeatured and presentation-less records', () => {
  const ordered = orderFeaturedProjects(sampleProjects, 'engineering');
  assert.equal(ordered.length, 4);
  assert.ok(!ordered.find((p) => p.slug === 'archive-only'),
    'unfeatured records must be dropped');
  assert.ok(!ordered.find((p) => p.slug === 'no-presentation'),
    'records without presentation must be dropped');
});

test('orderFeaturedProjects falls back to engineering priority for unknown lens', () => {
  const a = orderFeaturedProjects(sampleProjects, 'engineering').map((p) => p.slug);
  const b = orderFeaturedProjects(sampleProjects, 'something-unknown').map((p) => p.slug);
  assert.deepEqual(a, b, 'unknown lens must fall back to engineering priority');
});

// renderHome: full integration — mounts into a linkedom document and inspects
// the lens-aware identity block and the featured rail.
test('renderHome mounts the engineering lens identity with domains and nav', () => {
  const document = dom();
  const root = document.createElement('div');
  const view = renderHome(root, { projects: sampleProjects, lens: 'engineering' });
  // Container class carries the lens so downstream CSS / reveal scripts can branch.
  assert.equal(view.getAttribute('data-lens'), 'engineering');
  assert.match(view.className, /home-view--engineering/);
  // The engineering intro lists its domains as h3s inside an engineering-domains block.
  const domainHeadings = [...view.querySelectorAll('.engineering-domain__name')];
  assert.ok(domainHeadings.length >= 4, 'engineering intro surfaces at least four domains');
  for (const heading of domainHeadings) {
    assert.equal(heading.tagName.toLowerCase(), 'h3', 'domain names use h3 for axe heading order');
  }
  // Nav links reflect the engineering profile.
  const navLinks = [...view.querySelectorAll('.home-primary-links a')];
  const hrefs = navLinks.map((a) => a.getAttribute('href'));
  assert.ok(hrefs.includes('/product'), 'engineering nav links to /product');
  assert.ok(hrefs.includes('/resume'), 'engineering nav links to /resume');
});

test('renderHome mounts the product lens identity without domains', () => {
  const document = dom();
  const root = document.createElement('div');
  const view = renderHome(root, { projects: sampleProjects, lens: 'product' });
  assert.equal(view.getAttribute('data-lens'), 'product');
  assert.match(view.className, /home-view--product/);
  const domainHeadings = [...view.querySelectorAll('.engineering-domain__name')];
  assert.equal(domainHeadings.length, 0, 'product intro has no inline domains');
  const navLinks = [...view.querySelectorAll('.home-primary-links a')];
  const hrefs = navLinks.map((a) => a.getAttribute('href'));
  assert.ok(hrefs.includes('/engineering'), 'product nav links to /engineering');
  assert.ok(hrefs.includes('/resume'), 'product nav links to /resume');
});

test('renderHome uses the default atelier profile when no lens is supplied', () => {
  const document = dom();
  const root = document.createElement('div');
  const view = renderHome(root, { projects: sampleProjects, lens: 'unknown' });
  assert.equal(view.getAttribute('data-lens'), 'unknown');
  // The default profile keeps a contact link, which lens-specific intros drop.
  const contact = view.querySelector('.home-contact a[href^="mailto:"]');
  assert.ok(contact, 'default profile must surface a mailto contact link');
  // No domains block for the default profile.
  const domainHeadings = [...view.querySelectorAll('.engineering-domain__name')];
  assert.equal(domainHeadings.length, 0, 'default profile has no inline domains');
});

test('renderHome mounts the featured rail with lens-specific copy', () => {
  const document = dom();
  const root = document.createElement('div');
  const view = renderHome(root, { projects: sampleProjects, lens: 'engineering' });
  const eyebrow = view.querySelector('.home-featured .atelier-label');
  const title = view.querySelector('.home-featured h2');
  assert.equal(eyebrow.textContent, 'engineering studies');
  assert.equal(title.textContent, 'Engineering projects');
  // The sequence after the opening artifact includes the remaining featured records.
  // WITF is consumed as the opening artifact; the rest fill the sequence.
  const sequenceArtifacts = [...view.querySelectorAll('.home-artifact-sequence > *')];
  assert.equal(sequenceArtifacts.length, 3,
    'four featured records minus one opening artifact = three sequence slots');
});

test('renderHome renders an empty section when no featured projects exist', () => {
  const document = dom();
  const root = document.createElement('div');
  const view = renderHome(root, { projects: [], lens: 'engineering' });
  assert.match(view.className, /home-empty/, 'empty state must surface a home-empty section');
  assert.match(view.textContent, /Featured project records are unavailable/);
});
