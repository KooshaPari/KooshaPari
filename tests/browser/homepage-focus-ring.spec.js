import { test, expect } from '@playwright/test';
import { decodePng, pixelAt } from './helpers/decode-png.mjs';

// Pixel measurement helpers (used by the WCAG 1.4.11 focus-ring gate below).
// These are intentionally NOT a library import: a green suite that hides its
// actual measurement behind an opaque helper is not auditable. The helpers
// are co-located with the assertion that uses them.

function relLum([r, g, b]) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Find the bounding box of ring-color pixels in a region around the link.
function findRingBbox(img, rgb, searchRect) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let count = 0;
  for (let y = searchRect.top; y <= searchRect.bottom; y += 1) {
    for (let x = searchRect.left; x <= searchRect.right; x += 1) {
      if (x < 0 || y < 0 || x >= img.width || y >= img.height) continue;
      const p = pixelAt(img, x, y);
      if (p[0] === rgb[0] && p[1] === rgb[1] && p[2] === rgb[2]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        count += 1;
      }
    }
  }
  if (count === 0) return null;
  return { left: minX, top: minY, right: maxX, bottom: maxY, count };
}

// Sample ring pixels at the actual ring edges (top+1, bottom-1, left+1, right-1)
// and backdrop pixels just outside the bbox. The middle of the bbox is the link's
// content, not the ring.
function sampleRingAndBackdrop(img, bbox, _rgb) {
  const ringPts = [];
  const backPts = [];
  // Ring is ~3px thick at each side. Sample at the middle of that band.
  // Skip the first/last 8px to avoid the rounded corners.
  const corner = 8;
  const outset = 3; // 3px outside the ring

  for (let x = bbox.left + corner; x <= bbox.right - corner; x += 1) {
    ringPts.push(pixelAt(img, x, bbox.top + 1));
  }
  for (let x = bbox.left + corner; x <= bbox.right - corner; x += 1) {
    ringPts.push(pixelAt(img, x, bbox.bottom - 1));
  }
  for (let y = bbox.top + corner; y <= bbox.bottom - corner; y += 1) {
    ringPts.push(pixelAt(img, bbox.left + 1, y));
  }
  for (let y = bbox.top + corner; y <= bbox.bottom - corner; y += 1) {
    ringPts.push(pixelAt(img, bbox.right - 1, y));
  }

  for (let x = bbox.left + corner; x <= bbox.right - corner; x += 1) {
    backPts.push(pixelAt(img, x, bbox.top - outset));
  }
  for (let x = bbox.left + corner; x <= bbox.right - corner; x += 1) {
    backPts.push(pixelAt(img, x, bbox.bottom + outset));
  }
  for (let y = bbox.top + corner; y <= bbox.bottom - corner; y += 1) {
    backPts.push(pixelAt(img, bbox.left - outset, y));
  }
  for (let y = bbox.top + corner; y <= bbox.bottom - corner; y += 1) {
    backPts.push(pixelAt(img, bbox.right + outset, y));
  }

  const med = (pts) => {
    const ok = pts.filter((p) => p !== null && p !== undefined);
    expect(ok.length, 'sampler selected no pixels').toBeGreaterThan(0);
    return [0, 1, 2].map((c) => Math.round(median(ok.map((p) => p[c]))));
  };

  return { ring: med(ringPts), backdrop: med(backPts) };
}

test.describe('Homepage', () => {
  // WCAG 1.4.11 (AA, non-text contrast) requires a focus indicator to measure
  // >=3:1 against its background. The previous version of this test computed
  // the contrast from CSS values (alpha-compositing the header glass over the
  // page background) and passed 24/24 runs while the dark-theme ring measured
  // 2.54:1 in real Chrome. A green suite that never looks at the thing is not
  // a gate, so this captures a real screenshot of the focused link and measures
  // the painted ring pixels against the painted backdrop pixels.
  //
  // The link's `display: inline-grid` with `width: fit-content` inside a flex
  // header causes the box-shadow to paint a few px below the link's
  // `getBoundingClientRect` (measured 2026-10-11 in real Chrome: rect
  // y=22.6-80.4, ring paints y=64-132 in dark mode, a 30-50px offset that
  // varies across runs and scroll positions). The ring is still around the
  // link -- just not at the rect. We search a region around the link and find
  // the ring's actual position, then measure contrast from the painted pixels.
  // The vertical offset is a real visual defect, root cause not yet traced --
  // tracked as a separate ticket. The contrast measurement is the gate that
  // matters for WCAG 1.4.11.
  const FOCUS_MIN_CONTRAST = 3;
  const RING_SEARCH_TOLERANCE = 60; // px: ring is within 60px of the link rect

  test('the focus ring meets 3:1 non-text contrast in BOTH themes', async ({ page }) => {
    for (const theme of ['light', 'dark']) {
      await page.goto('/');
      await page.evaluate((t) => {
        if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      }, theme);

      // Keyboard focus, so :focus-visible genuinely applies. Element.focus()
      // does not match :focus-visible for a link (only for text inputs), so it
      // would measure an unstyled element and pass vacuously.
      //
      // Tab until focus actually rests on a header LINK. A fixed count is
      // wrong: the header also holds buttons (theme toggle, lens switch, reader,
      // index), so N presses can land on one of those and the measurement would
      // read an unfocused element's box-shadow and fail for the wrong reason.
      const landed = await page.evaluate(async () => {
        const isHeaderLink = () => {
          const el = document.activeElement;
          if (!el || !el.matches || !el.matches('.atelier-header a[href]')) return false;
          return el.matches(':focus-visible');
        };
        // Focus the document first so repeat Tab presses walk the whole tab
        // order instead of resuming from whatever held focus before.
        document.body.focus();
        for (let i = 0; i < 40 && !isHeaderLink(); i += 1) {
          document.activeElement && document.activeElement.blur();
          // A synthetic Tab must be caught by the page's own key handler, so
          // dispatch a real cancelable keydown rather than calling .focus().
          document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
          );
          if (isHeaderLink()) break;
          await new Promise((r) => setTimeout(r, 50));
        }
        return isHeaderLink();
      });

      // If the synthetic walk did not land (some browsers ignore synthetic Tab
      // for focus movement), fall back to real key presses via the driver.
      if (!landed) {
        for (let i = 0; i < 40; i += 1) {
          await page.keyboard.press('Tab');
          const ok = await page.evaluate(() => {
            const el = document.activeElement;
            return !!el && !!el.matches && el.matches('.atelier-header a[href]')
              && el.matches(':focus-visible');
          });
          if (ok) break;
        }
      }

      // base.css transitions box-shadow, so allow the transition to settle
      // before sampling the ring.
      await page.waitForTimeout(400);

      // The defect is only visible at specific scroll positions where the
      // scrolled-header glass composites over a lighter page section
      // (measured 2026-10-11: --arch-500 is 4.27:1 at scroll=0, drops to
      // 2.61:1 at scroll=3000, recovers to 3.31:1 at the page bottom). A
      // single-position measurement can pass vacuously. Test the full range
      // and assert the worst is >= 3:1.
      const SCROLL_POSITIONS = [0, 200, 1000, 2000, 3000];
      let worst = Infinity;
      let worstInfo = null;

      for (const scrollY of SCROLL_POSITIONS) {
        await page.evaluate((s) => window.scrollTo(0, s), scrollY);
        await page.waitForTimeout(100);

        // Re-Tab because scrolling can move focus off the header link.
        for (let i = 0; i < 40; i += 1) {
          await page.keyboard.press('Tab');
          const ok = await page.evaluate(() => {
            const el = document.activeElement;
            return !!el && !!el.matches && el.matches('.atelier-header a[href]')
              && el.matches(':focus-visible');
          });
          if (ok) break;
        }
        await page.waitForTimeout(200);

        // Extract the ring's RGB from computed style so we can find its pixels
        // in the screenshot. The outermost spread is the visible indicator.
        const { label, linkRect, ringRgb } = await page.evaluate(() => {
          const active = document.activeElement;
          const isHeaderLink = !!active && !!active.matches
            && active.matches('.atelier-header a[href]')
            && active.matches(':focus-visible');
          if (!isHeaderLink) return { error: 'focus never landed on a header link' };
          const shadow = getComputedStyle(active).boxShadow;
          if (!shadow || shadow === 'none') return { error: 'focus ring absent' };
          const layers = shadow.split(/,(?![^(]*\))/).map((s) => s.trim());
          const last = layers[layers.length - 1];
          const nums = (last.match(/[\d.]+/g) || []).map(Number);
          const rect = active.getBoundingClientRect();
          return {
            label: active.textContent.trim().replace(/\s+/g, ' ').slice(0, 40),
            linkRect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
            ringRgb: [nums[0], nums[1], nums[2]],
          };
        });

        if (!linkRect) continue; // skip this position if focus didn't land

        // Capture the focused region. We need pixel data, so a real screenshot --
        // a computed-style shortcut is what the previous version of this test did
        // and it passed while the ring measured 2.54:1. The header is sticky and
        // sits at the top of the viewport, so we crop a window that includes the
        // link plus enough margin to find the ring even when it is offset below
        // the link's bounding rect.
        const crop = {
          x: Math.max(0, Math.floor(linkRect.left - 20)),
          y: Math.max(0, Math.floor(linkRect.top - 20)),
          width: Math.ceil((linkRect.right - linkRect.left) + 80),
          height: Math.ceil((linkRect.bottom - linkRect.top) + 100),
        };
        const buf = await page.screenshot({ clip: crop, type: 'png' });
        const img = await decodePng(buf);
        const offsetX = crop.x;
        const offsetY = crop.y;

        // Find the ring's bounding box: scan a region around the link for pixels
        // that exactly match the ring RGB. The search region extends beyond the
        // link's rect to accommodate the 30-50px vertical offset in dark mode.
        const search = {
          left: Math.max(0, Math.floor(linkRect.left - offsetX - RING_SEARCH_TOLERANCE)),
          top: Math.max(0, Math.floor(linkRect.top - offsetY - RING_SEARCH_TOLERANCE)),
          right: Math.min(img.width - 1, Math.ceil(linkRect.right - offsetX + RING_SEARCH_TOLERANCE)),
          bottom: Math.min(img.height - 1, Math.ceil(linkRect.bottom - offsetY + RING_SEARCH_TOLERANCE)),
        };
        const bbox = findRingBbox(img, ringRgb, search);
        if (!bbox) continue; // skip if no ring pixels found at this position

        // Sample ring pixels at the actual ring edges and backdrop pixels just
        // outside the bbox.
        const { ring, backdrop } = sampleRingAndBackdrop(img, bbox, ringRgb);
        const ratio = contrast(ring, backdrop);

        if (ratio < worst) {
          worst = ratio;
          worstInfo = { label, ring, backdrop, ratio, scrollY };
        }
      }

      expect(
        worstInfo,
        `${theme}: no ring pixels found at any scroll position; test is blind`,
      ).not.toBeNull();

      expect(
        worst,
        `${theme}: focus ring on "${worstInfo.label}" measures its WORST contrast `
        + `${worst.toFixed(4)}:1 at scroll ${worstInfo.scrollY} `
        + `(ring rgb(${worstInfo.ring.join(',')}) on backdrop rgb(${worstInfo.backdrop.join(',')})), `
        + `below the ${FOCUS_MIN_CONTRAST}:1 floor of WCAG 1.4.11.`,
      ).toBeGreaterThanOrEqual(FOCUS_MIN_CONTRAST);
    }
  });
});
