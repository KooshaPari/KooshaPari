import { PROJECTS } from '../../data/projects.js';
import { el } from '../components/dom.js';
import { FILTERS, matches, card } from './work-index-helpers.js';

export function renderWorkIndex(root, { projects = PROJECTS } = {}) {
  const grid = el('div', { class: 'project-grid', 'aria-live': 'polite' });
  const count = el('span', { class: 'work-filter-count', 'aria-live': 'polite' });

  const buttons = FILTERS.map(([value, label], index) =>
    el('button', {
      type: 'button', class: 'work-filter', 'data-filter': value,
      'aria-pressed': index === 0 ? 'true' : 'false',
      onclick: () => {
        const filtered = projects.filter(p => matches(p, value));
        grid.replaceChildren(...filtered.map(p => card(p, el)));
        count.textContent = filtered.length + ' ' + (filtered.length === 1 ? 'project' : 'projects');
        buttons.forEach(b => b.setAttribute('aria-pressed', b === buttons[index] ? 'true' : 'false'));
      },
    }, label),
  );

  const all = projects.filter(p => matches(p, 'all'));
  grid.append(...all.map(p => card(p, el)));
  count.textContent = all.length + ' projects';

  root.replaceChildren(
    el('section', { class: 'view active portfolio-view' },
      el('p', { class: 'eyebrow' }, 'WORK'),
      el('h1', {}, 'Work'),
      el('p', { class: 'lede' }, 'Curated projects across engineering, product, systems, AI/ML, cloud, and historical work.'),
      el('div', { class: 'work-filter-bar' },
        el('div', { class: 'work-filter-heading' },
          el('span', { class: 'section-sub' }, 'Filter by focus'), count,
        ),
        el('div', { class: 'work-filters', role: 'group', 'aria-label': 'Filter work by focus' }, buttons),
      ),
      grid,
    ),
  );
}
