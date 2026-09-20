/**
 * perspective-tilt.js — Interactive 2.5D perspective tilt on cards and hero images.
 *
 * Applies CSS perspective transforms based on pointer position,
 * creating a depth effect without WebGL. Inspired by the
 * frontend-3d-agent-kit's 2.5D fallback recipe.
 *
 * Attributes:
 *   data-tilt          Enable tilt on this element
 *   data-tilt-max      Maximum tilt angle in degrees (default 12)
 *   data-tilt-glare    Enable glare effect (default false)
 *   data-tilt-scale    Scale on hover (default 1.02)
 *   data-tilt-speed    Transition speed in ms (default 400)
 *
 * Export: initPerspectiveTilt()
 */

import {
  normalizeClientPoint,
  tiltFromPointer,
  resetTransformString,
  glareBackground,
  parseTiltAttrs,
  tiltTransition,
} from './perspective-tilt-helpers.js';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Create the glare overlay element.
 */
function createGlare(container) {
  const glare = document.createElement('div');
  glare.className = 'tilt-glare';
  glare.setAttribute('aria-hidden', 'true');
  container.style.position = container.style.position || 'relative';
  container.appendChild(glare);
  return glare;
}

/**
 * Set up tilt behavior on a single element.
 */
function setupTilt(el) {
  if (el._tiltSetup) return;
  el._tiltSetup = true;

  const opts = parseTiltAttrs(el.dataset);
  const { maxTilt, scale, speed, perspective, enableGlare } = opts;

  let glareEl = null;
  if (enableGlare) {
    glareEl = createGlare(el);
  }

  // Set base transition
  el.style.transition = tiltTransition(speed);
  el.style.transformStyle = 'preserve-3d';
  el.style.willChange = 'transform';

  function onMove(e) {
    if (REDUCED_MOTION.matches) return;

    const rect = el.getBoundingClientRect();
    const { normalX, normalY } = normalizeClientPoint(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect
    );

    el.style.transform = tiltFromPointer(normalX, normalY, maxTilt, scale, perspective);

    if (glareEl) {
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;
      glareEl.style.background = glareBackground(pointerX, pointerY, rect);
      glareEl.style.opacity = '1';
    }
  }

  function onLeave() {
    el.style.transition = tiltTransition(speed);
    el.style.transform = resetTransformString(perspective);
    if (glareEl) {
      glareEl.style.opacity = '0';
    }
  }

  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', onLeave, { passive: true });

  // Store cleanup function
  el._tiltCleanup = () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    el.style.transition = '';
    el.style.transform = '';
    el.style.transformStyle = '';
    el.style.willChange = '';
    if (glareEl) glareEl.remove();
  };
}

/**
 * Scan DOM for [data-tilt] elements and set them up.
 */
function scanTiltElements(root = document) {
  const elements = root.querySelectorAll('[data-tilt]');
  elements.forEach(setupTilt);
}

/**
 * Initialize perspective tilt system.
 */
export function initPerspectiveTilt(root = document) {
  if (REDUCED_MOTION.matches) return;

  scanTiltElements(root);

  // Watch for dynamically added elements
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches?.('[data-tilt]')) {
          setupTilt(node);
        }
        if (node.querySelectorAll) {
          scanTiltElements(node);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return {
    refresh(root = document) {
      scanTiltElements(root);
    },
    disconnect() {
      observer.disconnect();
    },
  };
}
