import { POSTS } from '../../data/posts.js';
import { el } from '../components/dom.js';
import { postCard } from './blog-index-helpers.js';

export function renderBlogIndex(root, { posts = POSTS } = {}) {
  root.replaceChildren(
    el('section', { class: 'view active blog-view' },
      el('p', { class: 'eyebrow' }, 'WRITING'),
      el('h1', {}, 'Writing'),
      el('p', { class: 'lede' },
        'Notes on the work — systems, OSS contributions, fork discipline, and the long arc of building infra that has to keep running.'
      ),
      el('div', { class: 'post-list' },
        posts.map((post) => postCard(post, el)),
      ),
    ),
  );
}
