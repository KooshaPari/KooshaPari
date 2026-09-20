/**
 * Custom Precision Cursor System
 *
 * Crosshair dot (6px) + outer ring (32px) with smooth lerp following.
 * States: default, hover, click, text, image.
 * Trail effect on fast movement. Touch / reduced-motion safe.
 *
 * @module cursor
 */

import {
  INTERACTIVE_SELECTOR,
  IMAGE_SELECTOR,
  TRAIL_COUNT,
  LERP_SPEED,
  LERP_REDUCED,
  cursorStateFor,
  cursorIsTextInput,
  cursorFramePositions,
  cursorTransform,
  trailOpacity,
  advanceTrails,
} from './cursor-helpers.js';

// Re-export so any caller that pulls `cursorIsTextInput` from cursor.js still works
export { cursorIsTextInput, INTERACTIVE_SELECTOR, IMAGE_SELECTOR };

/** Whether the device supports fine pointer input. */
function hasFinePointer() {
  return matchMedia('(pointer: fine)').matches;
}

/** Whether the user prefers reduced motion. */
function prefersReducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Create and mount the cursor DOM elements.
 * Returns { dot, ring, trails[] }.
 */
function createDOM() {
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');

  const trails = [];
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const t = document.createElement('div');
    t.className = 'cursor-trail';
    t.setAttribute('aria-hidden', 'true');
    document.body.appendChild(t);
    trails.push({ el: t, x: 0, y: 0 });
  }

  document.body.appendChild(ring);
  document.body.appendChild(dot);

  return { dot, ring, trails };
}

/**
 * Initialise the custom cursor system.
 * Safe to call multiple times; subsequent calls are no-ops.
 */
export function initCursor() {
  if (!hasFinePointer()) return;
  if (document.querySelector('.cursor-dot')) return; // already mounted

  const reduced = prefersReducedMotion();
  const lerpSpeed = reduced ? LERP_REDUCED : LERP_SPEED;

  const { dot, ring, trails } = createDOM();

  // ---- state ----
  let mouseX = -100;
  let mouseY = -100;
  let dotX = -100;
  let dotY = -100;
  let ringX = -100;
  let ringY = -100;
  let currentState = 'default';
  let raf = null;
  let prevMouseX = -100;
  let prevMouseY = -100;

  // ---- event handlers ----

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function onMouseDown() {
    ring.classList.add('cursor-ring--click');
  }

  function onMouseUp() {
    ring.classList.remove('cursor-ring--click');
  }

  function onMouseEnter() {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  }

  function onMouseLeave() {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  }

  function onPointerOver(e) {
    applyState(cursorStateFor(e.target));
  }

  function applyState(next) {
    if (next === currentState) return;

    // Remove previous state classes
    dot.classList.remove('cursor-dot--text', 'cursor-dot--image');
    ring.classList.remove('cursor-ring--hover');

    currentState = next;

    switch (next) {
      case 'hover':
        ring.classList.add('cursor-ring--hover');
        break;
      case 'text':
        dot.classList.add('cursor-dot--text');
        break;
      case 'image':
        dot.classList.add('cursor-dot--image');
        ring.classList.add('cursor-ring--hover');
        break;
      // 'default' — no extra classes
    }
  }

  // ---- animation loop ----

  function tick() {
    const next = cursorFramePositions(
      { mouseX, mouseY, dotX, dotY, ringX, ringY },
      lerpSpeed
    );
    dotX = next.dotX;
    dotY = next.dotY;
    ringX = next.ringX;
    ringY = next.ringY;

    dot.style.transform = cursorTransform(dotX, dotY);
    ring.style.transform = cursorTransform(ringX, ringY);

    // Trail: store position history and update trail dots
    if (!reduced) {
      const speed = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      const trailPositions = advanceTrails(
        trails.map((t) => ({ x: t.x, y: t.y })),
        { x: dotX, y: dotY }
      );

      for (let i = 0; i < trails.length; i++) {
        const tr = trailPositions[i] || { x: 0, y: 0 };
        trails[i].x = tr.x;
        trails[i].y = tr.y;
        trails[i].el.style.transform = cursorTransform(trails[i].x, trails[i].y);
        trails[i].el.style.opacity = String(trailOpacity(i, speed));
      }
    }

    raf = requestAnimationFrame(tick);
  }

  // ---- bind ----
  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mousedown', onMouseDown, { passive: true });
  document.addEventListener('mouseup', onMouseUp, { passive: true });
  document.addEventListener('mouseenter', onMouseEnter);
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('pointerover', onPointerOver, { passive: true });

  // Start animation
  raf = requestAnimationFrame(tick);

  // ---- cleanup export (for SPA route changes or teardown) ----
  window.__cursorCleanup = () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('mouseenter', onMouseEnter);
    document.removeEventListener('mouseleave', onMouseLeave);
    document.removeEventListener('pointerover', onPointerOver);
    dot.remove();
    ring.remove();
    trails.forEach((t) => t.el.remove());
  };
}
