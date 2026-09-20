/* ================================================================
   lightbox.js — Full-screen image lightbox for project galleries.

   Finds all .case-gallery img and .case-hero img elements,
   adds click-to-expand with overlay, keyboard nav, swipe, and
   caption display. Touch/reduced-motion safe.
   ================================================================ */

import {
  OVERLAY_CLASS,
  ACTIVE_CLASS,
  CLASS_IMG,
  CLASS_CAPTION,
  CLASS_FIGURE,
  CLASS_CLOSE_BTN,
  CLASS_PREV_BTN,
  CLASS_NEXT_BTN,
  CLASS_COUNTER,
  SELECTOR_IMAGES,
  ICON_CLOSE,
  ICON_PREV,
  ICON_NEXT,
  KEY_ESCAPE,
  KEY_ARROW_LEFT,
  KEY_ARROW_RIGHT,
  ZOOM_CURSOR,
  nextIndex,
  prevIndex,
  counterText,
  swipeDirection,
  shouldShowNav,
} from './lightbox-helpers.js';

/** @returns {boolean} */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Build and attach the lightbox overlay to the document body.
 * Returns the overlay element.
 */
function createOverlay() {
  if (document.querySelector(`.${OVERLAY_CLASS}`)) {
    return document.querySelector(`.${OVERLAY_CLASS}`);
  }

  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Image lightbox');
  overlay.tabIndex = -1;

  const img = document.createElement('img');
  img.className = CLASS_IMG;
  img.alt = '';

  const caption = document.createElement('figcaption');
  caption.className = CLASS_CAPTION;

  const figure = document.createElement('figure');
  figure.className = CLASS_FIGURE;
  figure.appendChild(img);
  figure.appendChild(caption);

  const closeBtn = document.createElement('button');
  closeBtn.className = CLASS_CLOSE_BTN;
  closeBtn.setAttribute('aria-label', 'Close lightbox');
  closeBtn.innerHTML = ICON_CLOSE;

  const prevBtn = document.createElement('button');
  prevBtn.className = CLASS_PREV_BTN;
  prevBtn.setAttribute('aria-label', 'Previous image');
  prevBtn.innerHTML = ICON_PREV;

  const nextBtn = document.createElement('button');
  nextBtn.className = CLASS_NEXT_BTN;
  nextBtn.setAttribute('aria-label', 'Next image');
  nextBtn.innerHTML = ICON_NEXT;

  const counter = document.createElement('div');
  counter.className = CLASS_COUNTER;

  overlay.appendChild(figure);
  overlay.appendChild(closeBtn);
  overlay.appendChild(prevBtn);
  overlay.appendChild(nextBtn);
  overlay.appendChild(counter);
  document.body.appendChild(overlay);

  return overlay;
}

/**
 * Initialize lightbox on all eligible images within a root element.
 * @param {Element} [root=document]
 */
export function initLightbox(root = document) {
  const images = root.querySelectorAll(SELECTOR_IMAGES);
  if (!images.length) return;

  const overlay = createOverlay();
  const overlayImg = overlay.querySelector(`.${CLASS_IMG}`);
  const overlayCaption = overlay.querySelector(`.${CLASS_CAPTION}`);
  const overlayCounter = overlay.querySelector(`.${CLASS_COUNTER}`);
  const closeBtn = overlay.querySelector(`.${CLASS_CLOSE_BTN}`);
  const prevBtn = overlay.querySelector('.lightbox-prev');
  const nextBtn = overlay.querySelector('.lightbox-next');

  let currentIndex = 0;
  let galleryImages = [];
  let touchStartX = 0;
  let touchStartY = 0;

  function showImage(index) {
    if (index < 0 || index >= galleryImages.length) return;
    currentIndex = index;
    const src = galleryImages[index].src;
    const alt = galleryImages[index].alt || '';
    overlayImg.src = src;
    overlayImg.alt = alt;
    overlayCaption.textContent = alt;
    overlayCounter.textContent = counterText(index, galleryImages.length);

    const visible = shouldShowNav(galleryImages.length);
    prevBtn.style.display = visible ? '' : 'none';
    nextBtn.style.display = visible ? '' : 'none';
    overlayCounter.style.display = visible ? '' : 'none';
  }

  function open(index) {
    galleryImages = Array.from(images);
    showImage(index);
    overlay.classList.add(ACTIVE_CLASS);
    overlay.focus();
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove(ACTIVE_CLASS);
    document.body.style.overflow = '';
    overlayImg.src = '';
  }

  function next() {
    showImage(nextIndex(currentIndex, galleryImages.length));
  }

  function prev() {
    showImage(prevIndex(currentIndex, galleryImages.length));
  }

  images.forEach((img, i) => {
    img.style.cursor = ZOOM_CURSOR;
    img.addEventListener('click', (e) => {
      e.preventDefault();
      open(i);
    });
  });

  closeBtn.addEventListener('click', close);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains(CLASS_FIGURE)) {
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains(ACTIVE_CLASS)) return;
    if (e.key === KEY_ESCAPE) close();
    if (e.key === KEY_ARROW_RIGHT) next();
    if (e.key === KEY_ARROW_LEFT) prev();
  });

  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  overlay.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const direction = swipeDirection(dx, dy);
    if (direction === 'next') next();
    else if (direction === 'prev') prev();
  }, { passive: true });
}

// Re-export for callers that import the orchestrator module.
export {
  nextIndex,
  prevIndex,
  counterText,
  swipeDirection,
  shouldShowNav,
};
