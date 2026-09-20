/**
 * image-reveal.js — Image load choreography with stylish reveal animations.
 *
 * Detects all <img> elements on page load and via MutationObserver.
 * Supports data-src lazy loading, data-reveal-style hints, and
 * respects prefers-reduced-motion.
 *
 * Export: initImageReveal()
 */

import {
  PLACEHOLDER_FADE_DELAY_MS,
  CLASS_REVEALED,
  CLASS_IMG,
  CLASS_CONTAINER,
  CLASS_PLACEHOLDER,
  ATTR_REVEAL_STYLE,
  ATTR_REVEAL_PROCESSED,
  ATTR_DATA_SRC,
  VAR_REVEAL_ASPECT,
  pickRevealStyle,
  isValidRevealStyle,
  aspectRatioVar,
  backgroundImageFor,
  cleanupDelayMs,
  wipeRightInitialClipPath,
  wipeRightFinalClipPath,
  zoomFadeInitial,
  zoomFadeFinal,
  curtainInitialClipPath,
  curtainFinalClipPath,
  pixelateInitial,
  pixelateFinal,
  transitionFor,
  transitionsFor,
} from './image-reveal-helpers.js';

/**
 * Check whether the user prefers reduced motion.
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Pick a reveal style: use data-reveal-style if set, otherwise random.
 * @param {HTMLImageElement} img
 * @returns {string}
 */
function pickRevealStyleForImg(img) {
  return pickRevealStyle(img.getAttribute(ATTR_REVEAL_STYLE));
}

/**
 * Set up clip-path / filter transitions on an image element.
 * @param {HTMLImageElement} img
 * @param {string} style
 */
function applyRevealStyle(img, style) {
  img.setAttribute(ATTR_REVEAL_STYLE, style);

  switch (style) {
    case 'wipe-right': {
      // Start hidden: inset from left
      img.style.clipPath = wipeRightInitialClipPath();
      img.style.transition = 'none';
      // Force reflow
      void img.offsetHeight;
      img.style.transition = transitionFor('clip-path');
      requestAnimationFrame(() => {
        img.style.clipPath = wipeRightFinalClipPath();
      });
      break;
    }

    case 'zoom-fade': {
      const init = zoomFadeInitial();
      const fin = zoomFadeFinal();
      img.style.transform = init.transform;
      img.style.filter = init.filter;
      img.style.opacity = init.opacity;
      img.style.transition = 'none';
      void img.offsetHeight;
      img.style.transition = transitionsFor(['transform', 'filter', 'opacity']);
      requestAnimationFrame(() => {
        img.style.transform = fin.transform;
        img.style.filter = fin.filter;
        img.style.opacity = fin.opacity;
      });
      break;
    }

    case 'curtain': {
      img.style.clipPath = curtainInitialClipPath();
      img.style.transition = 'none';
      void img.offsetHeight;
      img.style.transition = transitionFor('clip-path');
      requestAnimationFrame(() => {
        img.style.clipPath = curtainFinalClipPath();
      });
      break;
    }

    case 'pixelate': {
      const init = pixelateInitial();
      const fin = pixelateFinal();
      img.style.filter = init.filter;
      img.style.opacity = init.opacity;
      img.style.transition = 'none';
      void img.offsetHeight;
      img.style.transition = transitionsFor(['filter', 'opacity']);
      requestAnimationFrame(() => {
        img.style.filter = fin.filter;
        img.style.opacity = fin.opacity;
      });
      break;
    }
  }
}

/**
 * Remove inline transition styles so the image renders normally after reveal.
 * @param {HTMLImageElement} img
 */
function cleanupAfterReveal(img) {
  setTimeout(() => {
    // Add .revealed so CSS rules override the hidden state.
    img.classList.add(CLASS_REVEALED);
    img.style.clipPath = '';
    img.style.transform = '';
    img.style.filter = '';
    img.style.opacity = '';
    img.style.transition = '';
  }, cleanupDelayMs());
}

/**
 * Create the container + placeholder around a bare <img>.
 * @param {HTMLImageElement} img
 * @returns {HTMLDivElement} The container element.
 */
function wrapImage(img) {
  // Already wrapped
  if (img.parentElement && img.parentElement.classList.contains(CLASS_CONTAINER)) {
    return img.parentElement;
  }

  const container = document.createElement('div');
  container.className = CLASS_CONTAINER;

  // Propagate intrinsic dimensions so the container reserves space
  // before the image loads (prevents CLS).
  const aspect = aspectRatioVar(
    img.getAttribute('width'),
    img.getAttribute('height')
  );
  if (aspect) {
    container.style.setProperty(VAR_REVEAL_ASPECT, aspect);
  }

  // Insert container before the image, then move image into it
  img.parentElement.insertBefore(container, img);
  container.appendChild(img);

  // Build placeholder — sample the image's current colour or use paper
  const placeholder = document.createElement('div');
  placeholder.className = CLASS_PLACEHOLDER;
  placeholder.setAttribute('aria-hidden', 'true');
  container.insertBefore(placeholder, img);

  // If image has an immediate src, use it as blurred backdrop
  const bgImage = backgroundImageFor(img.src);
  if (bgImage) {
    placeholder.style.backgroundImage = bgImage;
  }

  // Mark image for styling
  img.classList.add(CLASS_IMG);

  return container;
}

/**
 * Observe an <img> for load and reveal it.
 * @param {HTMLImageElement} img
 */
function observeImage(img) {
  // Handle data-src lazy-load pattern
  if (img.dataset.src && !img.src) {
    const realSrc = img.dataset.src;
    img.removeAttribute(ATTR_DATA_SRC);

    // Create a temporary Image to preload the real source
    const preloader = new Image();
    preloader.onload = () => {
      img.src = realSrc;
      revealImage(img);
    };
    preloader.src = realSrc;
    return;
  }

  // If already loaded (cached)
  if (img.complete && img.naturalWidth > 0) {
    wrapImage(img);
    revealImage(img);
    return;
  }

  // Wait for the load event
  const onLoad = () => {
    img.removeEventListener('load', onLoad);
    wrapImage(img);
    revealImage(img);
  };
  img.addEventListener('load', onLoad);

  // Handle error gracefully — still reveal without animation
  img.addEventListener('error', () => {
    img.removeEventListener('load', onLoad);
    wrapImage(img);
    img.classList.add(CLASS_IMG);
    img.classList.add(CLASS_REVEALED);
    const container = img.closest(`.${CLASS_CONTAINER}`);
    const ph = container?.querySelector(`.${CLASS_PLACEHOLDER}`);
    if (ph) ph.classList.add('loaded');
  }, { once: true });
}

/**
 * Trigger the reveal animation on a loaded image.
 * @param {HTMLImageElement} img
 */
function revealImage(img) {
  const container = img.closest(`.${CLASS_CONTAINER}`);
  const placeholder = container?.querySelector(`.${CLASS_PLACEHOLDER}`);

  if (prefersReducedMotion()) {
    // Instant show — no animation
    img.classList.add(CLASS_IMG);
    if (placeholder) placeholder.classList.add('loaded');
    return;
  }

  const style = pickRevealStyleForImg(img);
  applyRevealStyle(img, style);

  // Fade out placeholder after a short stagger
  setTimeout(() => {
    if (placeholder) placeholder.classList.add('loaded');
  }, PLACEHOLDER_FADE_DELAY_MS);

  cleanupAfterReveal(img);
}

/**
 * Scan the DOM for unprocessed images and start observing them.
 * @param {Element} [root=document.body]
 */
function scanImages(root = document.body) {
  const images = root.querySelectorAll(`img:not([${ATTR_REVEAL_PROCESSED}])`);
  images.forEach((img) => {
    img.setAttribute(ATTR_REVEAL_PROCESSED, 'true');
    observeImage(img);
  });
}

/**
 * Initialize image reveal choreography.
 *
 * Call once on page load. Sets up MutationObserver to handle
 * dynamically added images (e.g. SPA route transitions).
 *
 * @returns {{ disconnect: () => void }} Call disconnect() to tear down.
 */
export function initImageReveal() {
  // Initial scan
  scanImages();

  // Watch for new images (SPA navigation, lazy components)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'IMG') {
            scanImages(node);
          } else if (node.querySelectorAll) {
            scanImages(node);
          }
        }
      }

      // Re-scan on attribute changes (e.g. src updated for lazy load)
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        const el = mutation.target;
        if (el.tagName === 'IMG' && el.getAttribute(ATTR_REVEAL_PROCESSED)) {
          // Re-trigger reveal for src changes (lazy load swap)
          el.removeAttribute(ATTR_REVEAL_PROCESSED);
          observeImage(el);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', ATTR_DATA_SRC],
  });

  return {
    disconnect() {
      observer.disconnect();
    },
  };
}

// Re-export for callers that import the orchestrator module.
export {
  pickRevealStyle,
  aspectRatioVar,
  backgroundImageFor,
  isValidRevealStyle,
};
