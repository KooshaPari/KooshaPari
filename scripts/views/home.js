import { createArtifact, physicalPlate } from '../components/artifact.js';
import { el } from '../components/dom.js';

const LENS_PRIORITY = {
  engineering: ['witf', 'sharecli', 'substrate', 'phenotype-omlx', 'netweave', 'gmk-arch'],
  product: ['witf', 'gmk-arch', 'sharecli', 'substrate', 'phenotype-omlx', 'netweave'],
};

export function orderFeaturedProjects(projects, lens) {
  const priority = LENS_PRIORITY[lens] ?? LENS_PRIORITY.engineering;
  const order = new Map(priority.map((slug, index) => [slug, index]));

  return projects
    .filter((project) => project.featured && project.presentation)
    .toSorted((a, b) => (order.get(a.slug) ?? priority.length) - (order.get(b.slug) ?? priority.length));
}

function identityBlock(lens) {
  const reading = lens === 'product'
    ? 'Product decisions are read through demand, economics, manufacturing, fulfillment, and outcomes.'
    : 'Engineering decisions are read through architecture, runtime constraints, interfaces, and verification.';

  return el(
    'div',
    { class: 'home-identity' },
    el('p', { class: 'atelier-label' }, 'Koosha Paridehpour / Technical Atelier'),
    el('h1', {}, 'Software systems, technical products, and the infrastructure between them.'),
    el(
      'p',
      { class: 'home-intro' },
      'A working studio archive spanning systems software, technical product and program leadership, computational research, and complex physical products.',
    ),
    el('p', { class: 'home-reading', 'aria-live': 'polite' }, reading),
    el(
      'nav',
      { class: 'home-primary-links', 'aria-label': 'Portfolio readings' },
      el('a', { href: '#engineering' }, 'Read Engineering'),
      el('a', { href: '#product' }, 'Read Product'),
    ),
  );
}

export function renderHome(root, { projects, lens = 'engineering' }) {
  const featured = orderFeaturedProjects(projects, lens);
  const [witf, ...sequence] = featured;
  const titleId = 'home-featured-title';

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
      openingArtifact,
    ),
    el(
      'section',
      { class: 'home-featured', 'aria-labelledby': titleId },
      el(
        'header',
        { class: 'home-featured-heading' },
        el('p', { class: 'atelier-label' }, `${lens} lens / selected studies`),
        el('h2', { id: titleId }, 'Artifacts, systems sheets, and experiment notes'),
        el('p', {}, 'The same practice, reordered by the decisions each lens brings forward.'),
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
