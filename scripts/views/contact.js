import { el } from '../components/dom.js';

export function renderContact(root) {
  root.replaceChildren(
    el('section', { class: 'view active portfolio-view' },
      el('p', { class: 'eyebrow' }, 'CONTACT'),
      el('h1', {}, 'Let\u2019s build something consequential.'),
      el('p', { class: 'lede' }, 'For engineering, technical product, and program conversations:'),
      el('div', { class: 'contact-channels' },
        el('div', { class: 'contact-channel' },
          el('h2', {}, 'Email'),
          el('p', {}, 'Best for project inquiries, collaborations, and detailed conversations.'),
          el('a', {
            href: 'mailto:inquiry@ramdesigns.xyz?subject=Portfolio%20inquiry',
            'aria-label': 'Email Koosha Paridehpour',
          }, 'inquiry@ramdesigns.xyz'),
        ),
        el('div', { class: 'contact-channel' },
          el('h2', {}, 'GitHub'),
          el('p', {}, 'Open source work, issues, and technical discussions.'),
          el('a', {
            href: 'https://github.com/KooshaPari',
            target: '_blank',
            rel: 'noreferrer',
          }, 'github.com/KooshaPari'),
        ),
        el('div', { class: 'contact-channel' },
          el('h2', {}, 'LinkedIn'),
          el('p', {}, 'Professional background and mutual connections.'),
          el('a', {
            href: 'https://www.linkedin.com/in/koosha-paridehpour-1079b61b5/',
            target: '_blank',
            rel: 'noreferrer',
          }, 'LinkedIn profile'),
        ),
      ),
      el('p', { class: 'contact-note' },
        'Looking for project details? ',
        el('a', { href: '/work', class: 'text-link' }, 'Browse the work catalog'),
        '.',
      ),
    ),
  );
}
