/* ================================================================
   lightbox.js — Full-screen image lightbox for project galleries.

   Finds all .case-gallery img and .case-hero img elements,
   adds click-to-expand with overlay, keyboard nav, swipe, and
   caption display. Touch/reduced-motion safe.
   ================================================================ */

const OVERLAY_CLASS = 'lightbox-overlay';
const ACTIVE_CLASS = 'lightbox-active';

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
  img.className = 'lightbox-img';
  img.alt = '';

  const caption = document.createElement('figcaption');
  caption.className = 'lightbox-caption';

  const figure = document.createElement('figure');
  figure.className = 'lightbox-figure';
  figure.appendChild(img);
  figure.appendChild(caption);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close lightbox');
  closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'lightbox-nav lightbox-prev';
  prevBtn.setAttribute('aria-label', 'Previous image');
  prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'lightbox-nav lightbox-next';
  nextBtn.setAttribute('aria-label', 'Next image');
  nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

  const counter = document.createElement('div');
  counter.className = 'lightbox-counter';

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
  const images = root.querySelectorAll(
    '.case-gallery img, .case-hero img, .project-card-image'
  );
  if (!images.length) return;

  const overlay = createOverlay();
  const overlayImg = overlay.querySelector('.lightbox-img');
  const overlayCaption = overlay.querySelector('.lightbox-caption');
  const overlayCounter = overlay.querySelector('.lightbox-counter');
  const closeBtn = overlay.querySelector('.lightbox-close');
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
    overlayCounter.textContent = `${index + 1} / ${galleryImages.length}`;

    // Show/hide nav buttons based on gallery size
    prevBtn.style.display = galleryImages.length > 1 ? '' : 'none';
    nextBtn.style.display = galleryImages.length > 1 ? '' : 'none';
    overlayCounter.style.display = galleryImages.length > 1 ? '' : 'none';
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
    showImage((currentIndex + 1) % galleryImages.length);
  }

  function prev() {
    showImage((currentIndex - 1 + galleryImages.length) % galleryImages.length);
  }

  // Click on images to open
  images.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      open(i);
    });
  });

  // Close button
  closeBtn.addEventListener('click', close);

  // Click overlay background to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('lightbox-figure')) {
      close();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains(ACTIVE_CLASS)) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Nav buttons
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  // Touch swipe
  overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  overlay.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
  }, { passive: true });
}
