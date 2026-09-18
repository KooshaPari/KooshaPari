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

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Clamp a value between min and max.
 */
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

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

  const maxTilt = parseFloat(el.dataset.tiltMax) || 12;
  const scale = parseFloat(el.dataset.tiltScale) || 1.02;
  const speed = parseInt(el.dataset.tiltSpeed, 10) || 400;
  const enableGlare = el.dataset.tiltGlare === 'true';

  let glareEl = null;
  if (enableGlare) {
    glareEl = createGlare(el);
  }

  // Set base transition
  el.style.transition = `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
  el.style.transformStyle = 'preserve-3d';
  el.style.willChange = 'transform';

  function onMove(e) {
    if (REDUCED_MOTION.matches) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Normalize to -1..1
    const normalX = (x - centerX) / centerX;
    const normalY = (y - centerY) / centerY;

    // Calculate tilt (invert Y so top-tilts-forward)
    const tiltX = clamp(normalY * maxTilt, -maxTilt, maxTilt);
    const tiltY = clamp(-normalX * maxTilt, -maxTilt, maxTilt);

    el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, 1)`;

    if (glareEl) {
      // Position glare based on pointer
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glareEl.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
      glareEl.style.opacity = '1';
    }
  }

  function onLeave() {
    el.style.transition = `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
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
