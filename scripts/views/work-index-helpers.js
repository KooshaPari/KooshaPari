/**
 * Pure helpers for the work index view.
 *
 * The orchestrator (work-index.js) is DOM-bound; this file is what the
 * orchestrator imports and what the unit tests exercise.
 *
 *   - FILTERS: the chip definitions shown in the filter bar
 *   - matches(project, filter): predicate used to filter the project list
 *   - card(project, el): the per-project DOM tree (factory-injected so the
 *     test can assert structure without the components/dom.js runtime)
 */

export const FILTERS = [
  ['all', 'All work'],
  ['engineering', 'Engineering'],
  ['product', 'Product'],
  ['systems', 'Systems'],
  ['ai-ml', 'AI/ML'],
  ['developer-tools', 'Developer Tools'],
  ['cloud', 'Cloud'],
  ['physical-product', 'Physical Product'],
  ['historical', 'Historical'],
];

export function matches(project, filter) {
  if (filter === 'all') return true;
  if (filter === 'historical') return project.status === 'historical';
  if (filter === 'engineering' || filter === 'product') return Boolean(project.lens?.includes(filter));
  if (filter === 'ai-ml') return project.category === 'ai-ml' || project.category === 'ai-infrastructure';
  return project.category === filter;
}

export function card(project, el) {
  return el('article', { class: 'project-card' },
    project.gallery?.[0] ? el('img', { class: 'project-card-image', src: project.gallery[0], alt: project.title + ' project image', loading: 'lazy', width: '1200', height: '700' }) : null,
    el('div', { class: 'project-card-top' },
      el('span', { class: 'eyebrow' }, project.category),
      el('span', { class: 'status-pill' }, project.status),
    ),
    el('h2', {}, el('a', { href: '#work/' + project.slug, class: 'card-title-link' }, project.title)),
    el('p', {}, project.summary),
    project.technologies?.length ? el('div', { class: 'tag-row' }, project.technologies.map(t => el('span', { class: 'tag' }, t))) : null,
    project.repo ? el('a', { href: project.repo, target: '_blank', rel: 'noreferrer', class: 'text-link' }, 'View repository') : null,
  );
}
