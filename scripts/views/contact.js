import { el } from '../components/dom.js';

export function renderContact(root) {
  root.replaceChildren(
    el('section', { class: 'view active portfolio-view' },
      el('p', { class: 'eyebrow' }, 'CONTACT'),
      el('h1', {}, 'Let\u2019s build something consequential.'),
      el('p', { class: 'lede' }, 'For engineering, technical product, and program conversations:'),
      el('div', { class: 'contact-links' },
        el('a', { href: 'mailto:inquiry@ramdesigns.xyz' }, 'Email'),
        el('a', { href: 'https://github.com/KooshaPari', target: '_blank', rel: 'noreferrer' }, 'GitHub'),
        el('a', { href: 'https://www.linkedin.com/in/koosha-paridehpour-1079b61b5/', target: '_blank', rel: 'noreferrer' }, 'LinkedIn'),
      ),
    ),
  );
}

