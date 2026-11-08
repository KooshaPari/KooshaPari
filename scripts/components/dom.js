export const $ = (selector, root = document) => root.querySelector(selector);

export const $$ = (selector, root = document) => [
  ...root.querySelectorAll(selector),
];

export function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'class') {
      node.className = value;
    } else if (key === 'html') {
      node.innerHTML = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value != null) {
      node.setAttribute(key, value);
    }
  }

  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }

  return node;
}

/**
 * Attach a graceful image load-error fallback to an <img> element.
 *
 * On error the broken `src` is removed so the browser shows alt text
 * instead of the broken-image icon. When the <img> lives inside a
 * <picture>, sibling <source> srcset values are also neutralised so
 * the browser cannot fall back to them after the primary src clears.
 * A hook class and data attribute are added for optional CSS styling.
 * The element stays in the DOM preserving layout and caption context.
 *
 * The alt text is preserved (required for accessibility) and promoted
 * to a visible title when long enough. width/height are untouched to
 * maintain aspect-ratio / layout stability.
 *
 * Prerender-safe: addEventListener works in linkedom; the error event
 * never fires during prerender because images do not actually load.
 *
 * @param {HTMLImageElement} img
 * @param {object} [opts]
 * @param {string} [opts.fallbackClass='img-fallback'] - class added on fallback
 * @returns {HTMLImageElement} the same element (chainable with el())
 */
export function onImageFallback(img, { fallbackClass = 'img-fallback' } = {}) {
  if (!img || typeof img.addEventListener !== 'function') return img;

  function handleError() {
    img.removeEventListener('error', handleError);
    // Remove src and srcset from the <img> itself.
    img.removeAttribute('src');
    img.removeAttribute('srcset');
    // If this <img> lives inside a <picture>, neutralise sibling
    // <source> srcset attributes to prevent the browser from trying
    // them as fallback candidates after we clear src.
    const parent = img.parentElement;
    if (parent && parent.tagName === 'PICTURE') {
      const sources = parent.querySelectorAll('source');
      for (let i = 0; i < sources.length; i++) {
        sources[i].removeAttribute('srcset');
      }
    }
    img.classList.add(fallbackClass);
    img.dataset.fallback = 'true';
    const alt = (img.getAttribute('alt') ?? '').trim();
    if (alt.length > 2) img.setAttribute('title', alt);
  }

  img.addEventListener('error', handleError, { once: true });
  return img;
}
