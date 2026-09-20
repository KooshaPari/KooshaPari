/**
 * scroll-choreography.js — Enhanced scroll-driven entrance choreography.
 *
 * Applies staggered, cinematic entrance animations to project artifact
 * sequences on the home page. Uses the kit's beat pattern:
 *   Beat 1: silhouette (scale from small, fade in)
 *   Beat 2: construction (slide up, full opacity)
 *   Beat 3: finish (settled state)
 *
 * Works with the existing scroll-reveal system but adds:
 *   - Staggered delays based on card order
 *   - Multi-stage clip-path reveals for hero images
 *   - Parallax depth on artifact containers
 *   - Smooth easing curves for premium feel
 *
 * Export: initScrollChoreography()
 */

import {
  SEQUENCE_OBSERVER_THRESHOLD,
  SEQUENCE_OBSERVER_ROOT_MARGIN,
  HERO_OBSERVER_THRESHOLD,
  HERO_CLIP_INSET,
  HERO_CLIP_EXPANDED,
  HERO_CLIP_TRANSITION,
  HERO_ANIMATION_CLEANUP_MS,
  HIDDEN_TRANSFORM,
  HIDDEN_OPACITY,
  CLASS_REVEAL_HIDDEN,
  CLASS_REVEAL_VISIBLE,
  SELECTOR_ARTIFACT,
  SELECTOR_HERO_MEDIA,
  SELECTOR_ARTIFACT_SEQUENCE,
  SELECTOR_HERO_PLATE,
  revealDelayFor,
  parallaxOffsetFor,
  parallaxScaleFor,
  normalizedDistance,
  parallaxVarsFor,
} from './scroll-choreography-helpers.js';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Apply staggered reveal delays to artifact sequence children.
 */
function choreographArtifactSequence(container) {
  if (REDUCED_MOTION.matches) return;

  const cards = container.querySelectorAll(SELECTOR_ARTIFACT);
  cards.forEach((card, index) => {
    const delay = revealDelayFor(index);
    card.style.transitionDelay = `${delay}ms`;

    if (
      !card.classList.contains(CLASS_REVEAL_VISIBLE) &&
      !card.classList.contains(CLASS_REVEAL_HIDDEN)
    ) {
      card.classList.add(CLASS_REVEAL_HIDDEN);
      card.style.opacity = HIDDEN_OPACITY;
      card.style.transform = HIDDEN_TRANSFORM;
    }
  });
}

/**
 * Set up IntersectionObserver for artifact sequence stagger.
 */
function observeArtifactSequence(container) {
  if (REDUCED_MOTION.matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll(SELECTOR_ARTIFACT);
          cards.forEach((card, index) => {
            const delay = revealDelayFor(index);
            setTimeout(() => {
              card.classList.remove(CLASS_REVEAL_HIDDEN);
              card.classList.add(CLASS_REVEAL_VISIBLE);
              card.style.opacity = '';
              card.style.transform = '';
              card.style.transitionDelay = '';
            }, delay);
          });
          observer.unobserve(entry.target);
        }
      }
    },
    {
      threshold: SEQUENCE_OBSERVER_THRESHOLD,
      rootMargin: SEQUENCE_OBSERVER_ROOT_MARGIN,
    }
  );

  observer.observe(container);
  return observer;
}

/**
 * Enhance hero plate entrance with clip-path reveal.
 */
function choreographHeroPlate(heroPlate) {
  if (REDUCED_MOTION.matches) return;

  const media = heroPlate.querySelector(SELECTOR_HERO_MEDIA);
  if (!media) return;

  media.style.clipPath = HERO_CLIP_INSET;
  media.style.transition = HERO_CLIP_TRANSITION;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            media.style.clipPath = HERO_CLIP_EXPANDED;
          });
          setTimeout(() => {
            media.style.clipPath = '';
            media.style.transition = '';
          }, HERO_ANIMATION_CLEANUP_MS);
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: HERO_OBSERVER_THRESHOLD }
  );

  observer.observe(heroPlate);
  return observer;
}

/**
 * Add subtle parallax depth to artifact containers on scroll.
 */
function addArtifactParallax(container) {
  if (REDUCED_MOTION.matches) return;

  const artifacts = container.querySelectorAll(SELECTOR_ARTIFACT);
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      artifacts.forEach((artifact) => {
        const rect = artifact.getBoundingClientRect();
        const { parallaxY, parallaxScale } = parallaxVarsFor(rect, window.innerHeight);
        artifact.style.setProperty('--parallax-y', parallaxY);
        artifact.style.setProperty('--parallax-scale', parallaxScale);
      });
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}

/**
 * Initialize scroll choreography.
 */
export function initScrollChoreography() {
  if (REDUCED_MOTION.matches) return;

  const sequences = document.querySelectorAll(SELECTOR_ARTIFACT_SEQUENCE);
  sequences.forEach((container) => {
    choreographArtifactSequence(container);
    observeArtifactSequence(container);
    addArtifactParallax(container);
  });

  const heroPlates = document.querySelectorAll(SELECTOR_HERO_PLATE);
  heroPlates.forEach((plate) => {
    choreographHeroPlate(plate);
  });
}

// Re-export helpers for callers that import the orchestrator module.
export {
  revealDelayFor,
  parallaxOffsetFor,
  parallaxScaleFor,
  normalizedDistance,
  parallaxVarsFor,
};
