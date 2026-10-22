/* Parent view - under construction.
   The previous roster view was removed from the public site. */
import { el } from '../components/dom.js';

export function renderParent(root) {
  const view = el(
    'section',
    { class: 'parent-snapshot' },
    el('h2', { class: 'parent-snapshot__title' }, 'Under construction'),
    el('p', {}, 'This page is not available yet.'),
  );
  root.replaceChildren(view);
  return { refreshMs: 0 };
}
