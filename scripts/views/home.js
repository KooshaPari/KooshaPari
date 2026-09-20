import { createArtifact, physicalPlate } from '../components/artifact.js';
import { el } from '../components/dom.js';
import { IDENTITY } from '../../data/phenotype.js';

/**
 * Per-lens project priority order. The featured rail is sorted by the array order
 * for the requested lens, with anything not in the list landing at the end. This is
 * a tiny lookup rather than a real sort: visitors care about which stories are
 * surfaced first, not about alphabetical correctness.
 */
const LENS_PRIORITY = {
  engineering: ['witf', 'sharecli', 'substrate', 'phenotype-omlx', 'netweave', 'gmk-arch'],
  product: ['witf', 'gmk-arch', 'sharecli', 'substrate', 'phenotype-omlx', 'netweave'],
};

/**
 * Per-lens identity profile. Surfaced as data so identityBlock() and renderHome()
 * cannot drift on lens-specific copy, label, or featured-section title.
 *
 * `domains` is optional — only the engineering lens names its technical domains
 * inline, because the product lens leans on the featured rail rather than a
 * separate domain taxonomy.
 */
const LENS_PROFILES = {
  engineering: {
    label: 'Engineering',
    atelierClass: 'home-identity--engineering',
    heading: 'OS-adjacent runtimes, agent infrastructure, distributed backends, and compiler-/kernel-aware engineering.',
    intro: 'I work at the systems boundary \u2014 where process management, provider routing, and runtime constraints shape what software can actually do.',
    domains: [
      { name: 'Systems & Runtime', desc: 'OS-adjacent runtimes, process management, FUSE, Tokio async runtimes' },
      { name: 'Distributed Backends', desc: 'Provider routing, circuit breakers, SSE streaming, budget enforcement' },
      { name: 'AI / Agent Infrastructure', desc: 'Multi-provider dispatch, agent orchestration, MCP tooling, observability' },
      { name: 'Performance & Tooling', desc: 'Rust performance cores, speculative decoding, evaluation harnesses' },
    ],
    navLinks: [
      { href: '/product', label: 'Read Product' },
      { href: '/resume', label: 'View Resume' },
    ],
    featuredEyebrow: 'engineering studies',
    featuredTitle: 'Engineering projects',
    featuredLede: 'Systems, runtimes, and infrastructure \u2014 ordered by technical depth.',
  },
  product: {
    label: 'Product',
    atelierClass: 'home-identity--product',
    heading: 'Leads cross-functional execution, ships commercial outcomes, owns product economics end-to-end.',
    intro: 'I lead cross-functional execution from ambiguous initiative to working product. My work spans hardware launches, international distribution, and AI product strategy.',
    domains: null,
    navLinks: [
      { href: '/engineering', label: 'Read Engineering' },
      { href: '/resume', label: 'View Resume' },
    ],
    featuredEyebrow: 'product studies',
    featuredTitle: 'Product projects',
    featuredLede: 'Hardware launches, distribution, and outcomes \u2014 ordered by commercial impact.',
  },
};

/**
 * Return the profile for `lens`, falling back to the default atelier profile.
 * The default profile is the combined view used when no lens is requested
 * (i.e. the homepage on first visit, before the visitor chooses a lens).
 *
 * @param {string} lens
 * @returns {object & { isDefault: boolean }}
 */
export function getLensProfile(lens) {
  if (LENS_PROFILES[lens]) return { ...LENS_PROFILES[lens], isDefault: false };
  // Default atelier profile — homepage on first visit.
  return {
    label: 'Technical Atelier',
    atelierClass: 'home-identity',
    heading: 'I build software systems and technical products \u2014 from distributed routing infrastructure to physical hardware launches.',
    intro: 'This is where I show the work.',
    reading: 'Engineering lens: architecture, runtime constraints, interfaces, and verification.',
    domains: null,
    navLinks: [
      { href: '/engineering', label: 'Read Engineering' },
      { href: '/product', label: 'Read Product' },
    ],
    primaryContact: true,
    featuredEyebrow: `${lens} lens / selected studies`,
    featuredTitle: 'Selected projects',
    featuredLede: 'Same work, reordered by the decisions each lens brings forward.',
    isDefault: true,
  };
}

/**
 * Sort and filter projects so the featured rail reflects the requested lens's
 * priorities. Projects without a featured flag or a presentation record are
 * dropped entirely; the rest land in the order the lens priority dictates.
 *
 * @param {Array<object>} projects
 * @param {string} lens
 * @returns {Array<object>}
 */
export function orderFeaturedProjects(projects, lens) {
  const priority = LENS_PRIORITY[lens] ?? LENS_PRIORITY.engineering;
  const order = new Map(priority.map((slug, index) => [slug, index]));

  return projects
    .filter((project) => project.featured && project.presentation)
    .toSorted((a, b) => (order.get(a.slug) ?? priority.length) - (order.get(b.slug) ?? priority.length));
}

function engineeringDomains(profile) {
  if (!profile.domains) return null;
  return el('div', { class: 'engineering-domains', 'data-reveal': 'up', 'data-reveal-delay': '200' },
    /* h2 (not p): fixes the axe heading-order audit (h1 -> h3 skip) while
       .engineering-domains__label keeps the visual identical. */
    el('h2', { class: 'engineering-domains__label' }, 'Technical domains'),
    ...profile.domains.map((d, i) => el('div', {
      class: 'engineering-domain', 'data-reveal': 'scale', 'data-reveal-delay': String(300 + i * 80),
    },
      el('h3', { class: 'engineering-domain__name' }, d.name),
      el('p', { class: 'engineering-domain__desc' }, d.desc),
    )),
  );
}

function lensNav(profile) {
  return el(
    'nav',
    { class: 'home-primary-links', 'aria-label': 'Portfolio readings' },
    ...profile.navLinks.map((link) => el('a', { href: link.href }, link.label)),
  );
}

function identityBlock(lens) {
  const profile = getLensProfile(lens);

  // Default atelier homepage shows a primary contact line + a reading-state hint.
  if (profile.isDefault) {
    return el(
      'div',
      { class: profile.atelierClass },
      el('p', { class: 'atelier-label' }, `${IDENTITY.legalName} / Technical Atelier`),
      el('h1', {}, profile.heading),
      el('p', { class: 'home-intro' }, profile.intro),
      el('p', { class: 'home-reading', 'aria-live': 'polite' }, profile.reading),
      lensNav(profile),
      el('p', { class: 'home-contact' },
        el('a', { href: `mailto:${IDENTITY.email}` }, IDENTITY.email),
      ),
    );
  }

  // Lens-specific intro: engineering shows domains, product does not.
  const domains = engineeringDomains(profile);
  return el(
    'div',
    { class: `home-identity ${profile.atelierClass}` },
    el('p', { class: 'atelier-label' }, `${IDENTITY.legalName} / ${profile.label}`),
    el('h1', {}, profile.heading),
    el('p', { class: 'home-intro' }, profile.intro),
    domains,
    lensNav(profile),
  );
}

export function renderHome(root, { projects, lens = 'engineering' }) {
  const featured = orderFeaturedProjects(projects, lens);
  const [witf, ...sequence] = featured;
  const titleId = 'home-featured-title';
  const profile = getLensProfile(lens);

  if (!witf) {
    const empty = el(
      'section',
      { class: 'home-empty' },
      el('h1', {}, 'Technical Atelier'),
      el('p', {}, 'Featured project records are unavailable.'),
    );
    root.replaceChildren(empty);
    return empty;
  }

  const openingArtifact = physicalPlate(witf, lens);
  openingArtifact.classList.add('home-opening-artifact');

  const view = el(
    'div',
    { class: `home-view home-view--${lens}`, 'data-lens': lens },
    el(
      'section',
      { class: 'home-opening', 'aria-label': 'Technical Atelier introduction and WITF artifact' },
      identityBlock(lens),
      el('div', { class: 'home-opening__artifact-row' }, openingArtifact),
    ),
    el(
      'section',
      { class: 'home-featured', 'aria-labelledby': titleId },
      el(
        'header',
        { class: 'home-featured-heading', 'data-reveal': 'fade', 'data-reveal-delay': '100' },
        el('p', { class: 'atelier-label' }, profile.featuredEyebrow),
        el('h2', { id: titleId }, profile.featuredTitle),
        el('p', {}, profile.featuredLede),
      ),
      el(
        'div',
        { class: 'home-artifact-sequence' },
        sequence.map((record, index) => {
          const artifact = createArtifact(record, lens);
          artifact.style.setProperty('--artifact-order', index);
          return artifact;
        }),
      ),
    ),
  );

  root.replaceChildren(view);
  return view;
}
