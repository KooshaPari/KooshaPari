import { el } from '../components/dom.js';

export function renderResume(root) {
  root.replaceChildren(
    el('section', { class: 'view active portfolio-view' },
      el('p', { class: 'eyebrow' }, 'RESUME'),
      el('h1', {}, 'Two ways to read the work'),
      el('div', { class: 'resume-grid' },
        el('article', { class: 'resume-card' },
          el('h2', {}, 'Engineering'),
          el('p', {}, 'Systems, agent infrastructure, runtimes, observability, and developer tooling.'),
          el('span', { class: 'muted' }, 'Canonical PDF link pending'),
        ),
        el('article', { class: 'resume-card' },
          el('h2', {}, 'Product / Program'),
          el('p', {}, 'Technical products, commercialization, manufacturing, and cross-functional execution.'),
          el('span', { class: 'muted' }, 'Canonical PDF link pending'),
        ),
      ),
    ),
  );
}

