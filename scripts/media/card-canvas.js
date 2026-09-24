/* ================================================================
   Card canvas — painting primitives for the generative card composer.

   Every drawing routine that fills the 800x450 card viewport lives
   here: gradient background, seeded geometric shapes, connecting
   curves, film-noise overlay, watermark/label text, tech badges, and
   the category-icon overlay. card-composer.js owns the render
   pipeline, cache, and DOM application; this module owns the canvas
   brushwork so both files stay under the 350-line target.
   ================================================================ */

import { drawCategoryIcon, roundRect, hexToRgba } from './card-icons.js';
import { pick } from './card-composer-tokens.js';

export const CARD_WIDTH = 800;
export const CARD_HEIGHT = 450;

/* ─── Design tokens ─── */

export const COLORS = {
  teal: '#7EBAB5',
  olive: '#737c4c',
  arch: '#3f8795',
  graphite950: '#171a18',
  graphite900: '#20231f',
  white: '#ffffff',
};

/* ─── Background ─── */

export function drawBackground(ctx, primaryAccent) {
  const grad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  grad.addColorStop(0, COLORS.graphite950);
  grad.addColorStop(1, COLORS.graphite900);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const rad = ctx.createRadialGradient(
    CARD_WIDTH * 0.72, CARD_HEIGHT * 0.28, 0,
    CARD_WIDTH * 0.72, CARD_HEIGHT * 0.28, CARD_WIDTH * 0.55,
  );
  rad.addColorStop(0, hexToRgba(primaryAccent, 0.07));
  rad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
}

/* ─── Geometric background shapes ─── */

export function drawShapes(ctx, rng, accentColors) {
  const shapeCount = 3 + Math.floor(rng() * 3);
  const centers = [];

  for (let i = 0; i < shapeCount; i++) {
    const color = pick(rng, accentColors);
    const cx = 60 + rng() * (CARD_WIDTH - 120);
    const cy = 50 + rng() * (CARD_HEIGHT - 100);
    centers.push({ x: cx, y: cy });

    ctx.save();
    ctx.globalAlpha = 0.06 + rng() * 0.10;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;

    const shape = rng();
    if (shape < 0.3) {
      const r = 30 + rng() * 70;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha += 0.04;
      ctx.stroke();
    } else if (shape < 0.6) {
      const w = 40 + rng() * 100;
      const h = 30 + rng() * 60;
      const rot = (rng() - 0.5) * 0.35;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    } else if (shape < 0.82) {
      const len = 50 + rng() * 140;
      const angle = rng() * Math.PI * 2;
      ctx.lineWidth = 1.5 + rng() * 2;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(angle) * len / 2, cy - Math.sin(angle) * len / 2);
      ctx.lineTo(cx + Math.cos(angle) * len / 2, cy + Math.sin(angle) * len / 2);
      ctx.stroke();
    } else {
      const r = 18 + rng() * 35;
      ctx.lineWidth = 1.5 + rng() * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  return centers;
}

/* ─── Connecting lines between shapes ─── */

export function drawConnections(ctx, rng, centers, accentColors) {
  if (centers.length < 2) return;
  ctx.save();

  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      if (i === 0 || rng() < 0.55) {
        const a = centers[i];
        const b = centers[j];
        ctx.globalAlpha = 0.05 + rng() * 0.06;
        ctx.strokeStyle = pick(rng, accentColors);
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4 + rng() * 6, 6 + rng() * 8]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        const mx = (a.x + b.x) / 2 + (rng() - 0.5) * 70;
        const my = (a.y + b.y) / 2 + (rng() - 0.5) * 50;
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.stroke();
        ctx.globalAlpha = 0.12;
        ctx.setLineDash([]);
        ctx.fillStyle = pick(rng, accentColors);
        ctx.beginPath();
        ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.setLineDash([]);
  ctx.restore();
}

/* ─── Noise texture overlay ─── */

export function drawNoise(ctx) {
  const imageData = ctx.getImageData(0, 0, CARD_WIDTH, CARD_HEIGHT);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 12;
    d[i]     = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(imageData, 0, 0);
}

/* ─── Project title watermark (large, faint) ─── */

export function drawTitleWatermark(ctx, title) {
  if (!title) return;
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.fillStyle = COLORS.white;
  ctx.font = '700 150px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxW = CARD_WIDTH * 0.85;
  let text = title;
  while (ctx.measureText(text).width > maxW && text.length > 3) {
    text = text.slice(0, -1);
  }
  if (text !== title) text += '...';

  ctx.fillText(text, CARD_WIDTH / 2, CARD_HEIGHT / 2 + 10);
  ctx.restore();
}

/* ─── Project title label (readable, bottom-left) ─── */

export function drawTitleLabel(ctx, title, accent) {
  if (!title) return;
  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = COLORS.white;
  ctx.font = '600 22px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(title, 32, CARD_HEIGHT - 34);

  const tw = ctx.measureText(title).width;
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, CARD_HEIGHT - 28);
  ctx.lineTo(32 + tw, CARD_HEIGHT - 28);
  ctx.stroke();
  ctx.restore();
}

/* ─── Tech stack badge strip ─── */

export function drawTechBadges(ctx, technologies, accent) {
  if (!technologies?.length) return;
  ctx.save();

  const badges = technologies.slice(0, 4);
  let x = 32;
  const y = CARD_HEIGHT - 58;

  ctx.font = '600 11px "Space Grotesk", sans-serif';

  for (const tech of badges) {
    const tw = ctx.measureText(tech).width;
    const padX = 10;
    const bw = tw + padX * 2;
    const bh = 20;

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = accent;
    roundRect(ctx, x, y - bh + 5, bw, bh, 4);
    ctx.fill();

    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.globalAlpha = 0.85;
    ctx.fillStyle = COLORS.white;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tech, x + padX, y - bh / 2 + 5);

    x += bw + 6;
  }
  ctx.restore();
}

/* ─── Category icon in upper-right quadrant ─── */

export function drawCategoryIconOverlay(ctx, category, accent) {
  const ox = CARD_WIDTH * 0.78;
  const oy = CARD_HEIGHT * 0.30;
  ctx.save();
  ctx.translate(ox, oy);
  drawCategoryIcon(ctx, category, accent);
  ctx.restore();
}
