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

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
const STAGGER_BASE = 120; // ms between each card's entrance
const BEAT_DURATION = 800; // ms for each animation beat

/**
 * Apply staggered reveal delays to artifact sequence children.
 */
function choreographArtifactSequence(container) {
  if (REDUCED_MOTION.matches) return;

  const cards = container.querySelectorAll('.artifact');
  cards.forEach((card, index) => {
    // Set stagger delay based on position
    const delay = index * STAGGER_BASE;
    card.style.transitionDelay = `${delay}ms`;

    // Apply initial hidden state if not already set
    if (!card.classList.contains('reveal-visible') && !card.classList.contains('reveal-hidden')) {
      card.classList.add('reveal-hidden');
      card.style.opacity = '0';
      card.style.transform = 'translateY(32px) scale(0.97)';
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
          const cards = entry.target.querySelectorAll('.artifact');
          cards.forEach((card, index) => {
            const delay = index * STAGGER_BASE;
            setTimeout(() => {
              card.classList.remove('reveal-hidden');
              card.classList.add('reveal-visible');
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
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
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

  const media = heroPlate.querySelector('.artifact-media');
  if (!media) return;

  // Apply clip-path reveal to hero media
  media.style.clipPath = 'inset(8% 8% 8% 8% round 12px)';
  media.style.transition = 'clip-path 1s cubic-bezier(0.16, 1, 0.3, 1)';

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // Reveal: expand clip-path to full
          requestAnimationFrame(() => {
            media.style.clipPath = 'inset(0% 0% 0% 0% round 0px)';
          });
          // Clean up after animation
          setTimeout(() => {
            media.style.clipPath = '';
            media.style.transition = '';
          }, BEAT_DURATION + 200);
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.2 }
  );

  observer.observe(heroPlate);
  return observer;
}

/**
 * Add subtle parallax depth to artifact containers on scroll.
 */
function addArtifactParallax(container) {
  if (REDUCED_MOTION.matches) return;

  const artifacts = container.querySelectorAll('.artifact');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      artifacts.forEach((artifact) => {
        const rect = artifact.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        const artifactCenter = rect.top + rect.height / 2;
        const distance = (artifactCenter - viewportCenter) / window.innerHeight;

        // Subtle Y parallax: cards move slightly slower than scroll
        const parallaxY = distance * -15;
        // Subtle scale: cards slightly larger when centered
        const scale = 1 + Math.abs(distance) * -0.01;

        artifact.style.setProperty('--parallax-y', `${parallaxY}px`);
        artifact.style.setProperty('--parallax-scale', `${Math.max(0.98, scale)}`);
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

  // Find artifact sequences on home page
  const sequences = document.querySelectorAll('.home-artifact-sequence');
  sequences.forEach((container) => {
    choreographArtifactSequence(container);
    observeArtifactSequence(container);
    addArtifactParallax(container);
  });

  // Find hero plates
  const heroPlates = document.querySelectorAll('.home-opening-artifact');
  heroPlates.forEach((plate) => {
    choreographHeroPlate(plate);
  });
}
