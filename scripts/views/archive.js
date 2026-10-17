/* ================================================================
   Archive view — lists every project with status: 'historical' from
   data/projects.js, grouped by category. Long-form, low-chrome: the
   archive is a record of what shipped or existed, not a marketing
   surface. Upstream/provenance attributions and external links are
   preserved as on every other surface.
   ================================================================ */

import { el } from '../components/dom.js';
import { PROJECTS } from '../../data/projects.js';

const CATEGORY_LABELS = {
  'physical-product': 'Physical products',
  'developer-tools': 'Developer tools',
  design: 'Design',
};

function archiveRow(project) {
  const external = project.provenance ?? project.evidence ?? project.repo;
  const linkHref = project.repo ?? project.links?.[0]?.[1];
  const linkLabel = project.links?.[0]?.[0] ?? (project.repo ? 'Repository' : 'Source');

  return el('article', { class: 'archive-row', 'data-reveal': 'up' },
    el('header', { class: 'archive-row__header' },
      el('h3', { class: 'archive-row__title' },
        linkHref
          ? el('a', { href: linkHref, target: '_blank', rel: 'noreferrer' }, project.title)
          : project.title,
      ),
      el('p', { class: 'archive-row__meta' },
        project.provenance
          ? el('span', { class: 'archive-row__provenance' }, project.provenance)
          : null,
        project.evidence
          ? el('span', { class: 'archive-row__evidence' }, `Evidence: ${project.evidence}`)
          : null,
      ),
    ),
    el('p', { class: 'archive-row__summary' }, project.summary),
    project.links?.length
      ? el('ul', { class: 'archive-row__links' },
          ...project.links.map(([label, href]) =>
            el('li', {},
              el('a', { href, target: '_blank', rel: 'noreferrer' }, label),
            ),
          ),
        )
      : null,
  );
}

function archiveGroup(category, projects) {
  return el('section', { class: 'archive-group', 'data-reveal': 'up' },
    el('h2', { class: 'archive-group__title' }, CATEGORY_LABELS[category] ?? category),
    el('div', { class: 'archive-group__list' },
      ...projects.map(archiveRow),
    ),
  );
}

export function renderArchive(root) {
  const historical = PROJECTS.filter((p) => p.status === 'historical');

  const grouped = historical.reduce((acc, p) => {
    const key = p.category ?? 'other';
    (acc[key] ??= []).push(p);
    return acc;
  }, {});

  const intro = historical.length
    ? el('p', {
        class: 'lede',
        'data-reveal': 'up',
        'data-reveal-delay': '60',
      },
        `${historical.length} ${historical.length === 1 ? 'entry' : 'entries'}. ` +
        'Historical work is preserved for provenance and discoverability. ' +
        'Some entries are still publicly available; others are upstream-fork ' +
        'references with attribution intact.',
      )
    : el('p', { class: 'lede', 'data-reveal': 'up' }, 'No historical entries on file.');

  root.replaceChildren(
    el('section', { class: 'view active archive-view' },
      el('p', { class: 'eyebrow', 'data-reveal': 'up' }, 'ARCHIVE'),
      el('h1', { 'data-reveal': 'up', 'data-reveal-delay': '30' },
        'Historical work, preserved.',
      ),
      intro,
      el('div', { class: 'archive-groups' },
        ...Object.entries(grouped).map(([cat, list]) => archiveGroup(cat, list)),
      ),
    ),
  );
}
