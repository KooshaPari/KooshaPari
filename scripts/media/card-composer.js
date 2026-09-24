/**
 * Generative card image composer for projects missing real screenshots.
 *
 * Produces unique Canvas-based abstract visuals seeded from project metadata.
 * Cards are visually distinct by technology stack and project category.
 *
 * Modules
 *   card-canvas.js             canvas painters (background, shapes, text, badges)
 *   card-icons.js              category icon shapes
 *   card-composer-tokens.js    seeded RNG, tech accent resolution, image manifest
 *
 * This module owns the render pipeline, the per-slug cache, and the
 * DOM application pass. Output is a data URL suitable for
 * background-image or img src. Only generates for projects without a
 * real image in the manifest.
 */

import {
  CARD_WIDTH,
  CARD_HEIGHT,
  drawBackground,
  drawShapes,
  drawConnections,
  drawNoise,
  drawTitleWatermark,
  drawCategoryIconOverlay,
  drawTechBadges,
  drawTitleLabel,
} from './card-canvas.js';
import {
  PROJECTS_WITH_IMAGES,
  mulberry32,
  hashString,
  resolveAccentColors,
} from './card-composer-tokens.js';

/* ─── Full card render pipeline ─── */

function renderToDataURL(project) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');

  const slug = project.slug || project.title || '';
  const seed = hashString(slug);
  const rng = mulberry32(seed);

  const techs = project.technologies || [];
  const category = project.category || '';
  const title = project.title || slug;

  const accentColors = resolveAccentColors(techs);
  const primaryAccent = accentColors[0];

  drawBackground(ctx, primaryAccent);
  const centers = drawShapes(ctx, rng, accentColors);
  drawConnections(ctx, rng, centers, accentColors);
  drawNoise(ctx);

  drawTitleWatermark(ctx, title);
  drawCategoryIconOverlay(ctx, category, primaryAccent);
  drawTechBadges(ctx, techs, primaryAccent);
  drawTitleLabel(ctx, title, primaryAccent);

  return canvas.toDataURL('image/webp', 0.85);
}

/* ─── Public API ─── */

const cache = new Map();

/**
 * Generate a unique abstract card image for a project.
 * Returns a data URL string (WebP). Results are cached per slug.
 *
 * @param {{ slug: string, title: string, technologies?: string[], category?: string }} project
 * @returns {string} data URL
 */
export function composeCardImage(project) {
  const slug = project?.slug ?? project?.id ?? '';
  if (cache.has(slug)) return cache.get(slug);

  const dataUrl = renderToDataURL(project);
  cache.set(slug, dataUrl);
  return dataUrl;
}

/**
 * Auto-apply generated card images to all `.work-catalog__featured-project`
 * elements that are missing a real image.
 *
 * @param {Array} projects - The PROJECTS array from data/projects.js
 */
export function initCardComposer(projects = []) {
  const projectMap = new Map();
  for (const p of projects) {
    projectMap.set(p.slug || p.id, p);
  }

  const cards = document.querySelectorAll('.work-catalog__featured-project');

  for (const card of cards) {
    if (card.querySelector('.work-catalog__featured-image')) continue;

    const link = card.getAttribute('href') || '';
    const slugMatch = link.match(/\/work\/(.+)$/);
    if (!slugMatch) continue;

    const slug = decodeURIComponent(slugMatch[1]);
    if (PROJECTS_WITH_IMAGES.has(slug)) continue;

    const meta = projectMap.get(slug) || {};
    const h3 = card.querySelector('h3');
    const title = meta.title || h3?.textContent || slug;

    const dataUrl = composeCardImage({
      slug,
      title,
      technologies: meta.technologies || [],
      category: meta.category || '',
    });

    const imageDiv = document.createElement('div');
    imageDiv.className = 'work-catalog__featured-image';

    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `Generated abstract card for ${title}`;
    img.loading = 'lazy';
    img.decoding = 'async';

    imageDiv.appendChild(img);

    const statusP = card.querySelector('.work-catalog__featured-status');
    if (statusP?.nextElementSibling) {
      card.insertBefore(imageDiv, statusP.nextElementSibling);
    } else {
      card.prepend(imageDiv);
    }
  }
}
