import { el } from '../components/dom.js';

/**
 * Archive view: chronological list of historical projects.
 * Uses generic catalog markup classes — no new CSS.
 */

function archiveProject(project) {
  const href = `/work/${encodeURIComponent(project.slug)}`;
  const meta = `${project.category} / ${project.status}`;

  return el(
    'li',
    { class: 'work-catalog__archive-item' },
    el('span', { class: 'work-catalog__archive-mark', 'aria-hidden': 'true' }, '---'),
    el('div', {},
      el('h3', {},
        el('a', { href, class: 'work-catalog__project-link' }, project.title),
      ),
      el('p', { class: 'work-catalog__meta' }, meta),
      el('p', { class: 'work-catalog__summary' }, project.summary),
    ),
  );
}

export function renderArchive(root, { projects }) {
  const historical = projects
    .filter((p) => p.status === 'historical')
    .sort((a, b) => a.title.localeCompare(b.title));

  root.replaceChildren(
    el('section', { class: 'view active portfolio-view work-catalog' },
      el('p', { class: 'eyebrow' }, 'ARCHIVE'),
      el('h1', {}, 'Archive'),
      el('p', { class: 'lede' }, 'Historical, deprecated, and completed work with preserved records.'),
      historical.length > 0
        ? el('ol', { class: 'work-catalog__archive-list' },
            historical.map(archiveProject),
          )
        : el('p', {}, 'No historical projects recorded yet.'),
    ),
  );
}
