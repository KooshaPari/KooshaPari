/**
 * Pure block-to-element mapping for blog posts.
 *
 * The orchestrator (blog-post.js) is DOM-bound; this file accepts an `el`
 * factory so it can be unit-tested with a tiny stub.
 *
 * Block types handled:
 *   - heading (h2/h3, level clamped to [2, 3])
 *   - para
 *   - list
 *   - quote
 *   - code
 *   - hr
 *   - note
 *
 * Unknown types return null — the caller can decide to skip them or
 * surface an error.
 */

export function renderBlock(block, el) {
  switch (block.type) {
    case 'heading': {
      const level = block.level ?? 2;
      const tag = 'h' + Math.min(Math.max(level, 2), 3);
      return el(tag, { class: 'post-heading' }, block.text);
    }
    case 'para':
      return el('p', { class: 'post-para' }, block.text);
    case 'list':
      return el('ul', { class: 'post-list-block' },
        block.items.map((item) => el('li', {}, item)),
      );
    case 'quote':
      return el('blockquote', { class: 'post-quote' }, block.text);
    case 'code':
      return el('pre', { class: 'post-code' },
        el('code', {}, block.text));
    case 'hr':
      return el('hr', { class: 'post-divider' });
    case 'note':
      return el('aside', { class: 'post-note' }, block.text);
    default:
      return null;
  }
}
