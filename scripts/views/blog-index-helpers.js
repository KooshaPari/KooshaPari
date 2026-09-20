/**
 * Pure helper for rendering a blog post card.
 *
 * Lives next to scripts/views/blog-index.js but without the DOM binding —
 * accepts an `el` factory so the orchestrator can pass `components/dom.el`
 * while tests can pass a tiny stub that records what was built.
 */

export function postCard(post, el) {
  const tags = post.tags?.length
    ? el('div', { class: 'post-card-tags' },
        post.tags.map((t) => el('span', { class: 'tag' }, t)))
    : null;

  return el('article', { class: 'post-card' },
    el('div', { class: 'post-card-top' },
      el('span', { class: 'eyebrow' }, post.provenance ?? 'Writing'),
      el('span', { class: 'post-card-meta' },
        el('time', { datetime: post.date }, post.date),
        el('span', { 'aria-hidden': 'true' }, '·'),
        el('span', {}, post.readingTime ?? ''),
      ),
    ),
    el('h2', {}, el('a', { href: '/blog/' + post.slug, class: 'card-title-link' }, post.title)),
    el('p', { class: 'post-card-excerpt' }, post.excerpt),
    tags,
  );
}
