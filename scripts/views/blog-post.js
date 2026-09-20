import { POSTS } from '../../data/posts.js';
import { el } from '../components/dom.js';
import { renderBlock } from './blog-post-helpers.js';

export function renderBlogPost(root, slug) {
  const post = POSTS.find((entry) => entry.slug === slug);

  if (!post) {
    root.replaceChildren(
      el('section', { class: 'view active blog-view' },
        el('p', { class: 'eyebrow' }, 'WRITING'),
        el('h1', {}, 'Post not found'),
        el('p', { class: 'lede' },
          el('a', { href: '/blog', class: 'text-link' }, 'Back to writing'),
        ),
      ),
    );
    return;
  }

  const header = el('header', { class: 'post-header' },
    el('div', { class: 'post-header-top' },
      el('span', { class: 'eyebrow' }, post.provenance ?? 'Writing'),
      el('span', { class: 'post-card-meta' },
        el('time', { datetime: post.date }, post.date),
        el('span', { 'aria-hidden': 'true' }, '·'),
        el('span', {}, post.readingTime ?? ''),
      ),
    ),
    el('h1', { class: 'post-title' }, post.title),
    el('p', { class: 'post-subtitle' }, post.excerpt),
    post.tags?.length ? el('div', { class: 'post-card-tags' },
      post.tags.map((t) => el('span', { class: 'tag' }, t))) : null,
  );

  const article = el('article', { class: 'post-article' },
    ...post.body.map((block) => renderBlock(block, el)),
    el('footer', { class: 'post-footer' },
      el('a', { href: '/blog', class: 'text-link' }, '← All writing'),
    ),
  );

  root.replaceChildren(
    el('section', { class: 'view active blog-view' },
      header,
      article,
    ),
  );
}
