import { el } from '../components/dom.js';

export function renderNotFound(root) {
  root.replaceChildren(
    el('section', { class: 'view active portfolio-view not-found' },
      el('p', { class: 'eyebrow' }, '404'),
      el('h1', {}, 'This page is not in the atelier.'),
      el('p', { class: 'lede' }, 'The requested route does not match a published portfolio page.'),
      el('a', { href: '/work', class: 'cta cta-eng' }, 'Browse work'),
    ),
  );
}
