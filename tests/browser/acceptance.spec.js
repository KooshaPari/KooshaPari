import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PROJECTS } from '../../data/projects.js';
import { POSTS } from '../../data/posts.js';
import { decodePng, pixelAt } from './helpers/decode-png.mjs';

const BASE = 'http://127.0.0.1:4197';

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
  test('homepage loads with title, navigation, and hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    for (const href of ['/work', '/resume', '/contact']) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test('hero WITF board renders beside the copy on every lens page', async ({ page }) => {
    for (const path of ['/', '/engineering', '/product']) {
      await page.goto(path);
      const row = page.locator('.home-opening__artifact-row');
      const board = row.locator('.home-witf-board');
      await expect(board).toBeVisible();
      // All three hero routes share the desktop two-column grid; only the
      // <=760px breakpoint stacks them.
      await expect(row).toHaveCSS('grid-column-start', '2');

      // The board is the artifact, not a framed material card: the full
      // material chrome stays in the rail below and never returns to the hero.
      await expect(row.locator('.artifact')).toHaveCount(0);
      await expect(board.locator('figcaption')).toHaveText('WITF Board / historical');

      const boxes = await page.evaluate(() => {
        const boardRect = document.querySelector('.home-witf-board').getBoundingClientRect();
        const identityRect = document.querySelector('.home-identity').getBoundingClientRect();
        return {
          boardLeft: boardRect.left,
          identityRight: identityRect.right,
          boardWidth: boardRect.width,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });
      expect(boxes.boardLeft, `${path}: board must sit right of the hero copy`).toBeGreaterThan(boxes.identityRight);
      expect(boxes.boardWidth, `${path}: board must be visible in the right column`).toBeGreaterThan(0);
      expect(boxes.overflow, `${path}: hero must not overflow horizontally`).toBe(false);

      // The viewer gate opens once the board approaches the viewport. The
      // board must resolve to a live canvas or the static poster, never an
      // empty container. (The headless gate can be slow, so allow for the
      // import + GLB load rather than asserting synchronously.)
      await board.scrollIntoViewIfNeeded();
      await expect(board.locator('#witf-viewer canvas, #witf-viewer img')).toBeVisible({ timeout: 20000 });

      // A canvas alone is not enough: the board carries data-reveal="up", and
      // a stuck .reveal-hidden board would still report a visible box because
      // opacity:0 is laid out. Assert the revealed outcome directly.
      await expect(board).toHaveCSS('opacity', '1', { timeout: 5000 });
    }
  });

  test('homepage has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const critical = result.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(critical.map(v => ({ id: v.id, nodes: v.nodes.length }))).toEqual([]);
  });

  // A gate that cannot fail is not a gate. The design system resolves nearly
  // every translucent colour through color-mix(); when those mixed in oklch
  // they serialised with a `none` component and axe threw on every node, so
  // the colour-contrast rule reported 0 passes and 0 violations on a site
  // whose headings measured 1.14:1. Asserting "no violations" alone would have
  // passed in that state.
  //
  // Two separate invariants, because they fail for different reasons:
  //   - violations must be zero: a real readability regression
  //   - the rule must actually evaluate, and the number of nodes it cannot
  //     decide must not grow past the recorded ceiling: a coverage regression
  //
  // The residual "incomplete" nodes are axe limitations, not defects. Its own
  // reasons, measured 2026-09-19, are only three: the element is overlapped by
  // a decorative element, the element contains an image node (an inline icon
  // next to text), or a pseudo-element sits over it. None of those can be
  // decided from computed colour, and none of them mean the text is unreadable.
  // Ceilings are counts of axe's "incomplete" (undecidable) contrast nodes, not
  // allowances. Each was measured from real runs at 1440x900; raising one should
  // be a deliberate, justified edit.
  const INCOMPLETE_CEILING = {
    // Each value is the observed incomplete count plus two, measured over three
    // consecutive runs once syspolicyd had stopped consuming the host. All
    // three runs returned identical counts per route, so the measurements are
    // stable and the slack is a deliberate two-node margin rather than a
    // guess. A regression above one of these means more elements stopped being
    // decidable, which is how a colour silently regressed before.
    '/': 9,
    '/work': 2,
    '/blog': 17,
    // Previously unswept: a contrast regression on these four routes would not
    // have been caught at all.
    '/resume': 7,
    '/contact': 3,
    '/engineering': 9,
    '/product': 9,
  };

  test('colour contrast is evaluated, and reported violations are zero', async ({ page }) => {
    for (const [path, ceiling] of Object.entries(INCOMPLETE_CEILING)) {
      await page.goto(path);
      // axe reads computed style, and the reveal animation drives .lede from
      // opacity 0 to 1 over 0.5s with a 0.1s delay. Measured mid-transition, axe
      // blends the semi-transparent text against the page background and reports
      // a false contrast failure: /resume showed 6 "violations" at 2 frames
      // and 0 at 10, all on .lede. Waiting out the transition is the fix.
      //
      // Bounded rather than waitForLoadState('networkidle'): under host load
      // that wait can hang past the test timeout, which it did at load 137.
      await page
        .waitForTimeout(700)
        .catch(() => {});
      // The 700ms settle covers CSS reveal, but the WITF viewer lazy-loads
      // three.js from CDN and appends its WebGL canvas + interaction hint on a
      // network timeline, and the ambient canvas paints in its own frame.
      // axe's overlap/imgNode verdicts flip depending on whether that has
      // landed when it samples: '/' incompletes moved 7 -> 10 with no product
      // change, which is this gate's failure mode. Wait for whichever of those
      // exist on this route to be laid out, bounded at 3s so a CDN/WebGL
      // fallback cannot hang the run (empty match on routes without them).
      await page
        .waitForFunction(
          () => {
            const witf = document.getElementById('witf-viewer');
            const witfSettled = !witf || witf.childElementCount > 0;
            const media = [
              ...document.querySelectorAll(
                '.ambient-field-canvas, #witf-viewer canvas, #witf-viewer img',
              ),
            ];
            return (
              witfSettled &&
              media.every((el) => el.getBoundingClientRect().width > 0)
            );
          },
          null,
          { timeout: 3000 },
        )
        .catch(() => {});
      const result = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
      const contrast = result.violations.find(v => v.id === 'color-contrast');
      const passed = result.passes.find(v => v.id === 'color-contrast');
      const incomplete = result.incomplete.find(v => v.id === 'color-contrast');

      expect(
        contrast?.nodes.map(n => n.target.join(' ')) ?? [],
        `${path}: contrast violations`,
      ).toEqual([]);

      expect(
        passed?.nodes.length ?? 0,
        `${path}: axe evaluated no element for colour contrast — the rule is blind`,
      ).toBeGreaterThan(0);

      expect(
        incomplete?.nodes.length ?? 0,
        `${path}: contrast coverage regressed; more nodes are undecidable than the recorded ceiling. `
        + 'A colour may have started serialising with a "none" component again.',
      ).toBeLessThanOrEqual(ceiling);
    }
  });

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

test.describe('Navigation', () => {
  test('clean navigation between pages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Read Product', exact: true }).click();
    await expect(page).toHaveURL(/\/product$/);
    await expect(page.locator('html')).toHaveAttribute('data-lens', 'product');

    await page.goto('/work/sharecli');
    await expect(page.locator('html')).toHaveAttribute('data-lens', 'product');

    await page.getByRole('link', { name: 'Back to work' }).click();
    await expect(page).toHaveURL(/\/work$/);

    await page.goBack();
    await expect(page.locator('#view-root h1')).toHaveText('ShareCLI');

    await page.getByRole('button', { name: 'Index', exact: true }).click();
    await page.locator('dialog a[href="/work/substrate"]').click();
    await expect(page).toHaveURL(/\/work\/substrate$/);
    await expect(page.locator('#view-root h1')).toHaveText('Substrate');
  });

  test('all navigation pages have content and links', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      for (const path of ['/', '/engineering', '/product', '/work', '/resume', '/contact', '/blog']) {
        await page.goto(`${BASE}${path}`);
        await expect(page.locator('main h1')).toBeVisible();
        for (const href of ['/work', '/resume', '/contact']) {
          await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
        }
      }
      await page.goto(`${BASE}/blog`);
      await expect(page.locator('main a[href="/blog/why-we-forked-omniroute"]')).toBeVisible();
    } finally { await context.close(); }
  });
});

test.describe('Project Pages', () => {
  test('all project pages render with title, summary, and navigation', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      for (const project of PROJECTS) {
        await page.goto(`${BASE}/work/${project.slug}`);
        await expect(page.locator('main h1')).toHaveText(project.title);
        await expect(page.locator('main')).toContainText(project.summary);
        await expect(page.locator('button')).toHaveCount(0);
        for (const href of ['/work', '/resume', '/contact']) {
          await expect(page.locator(`header a[href="${href}"]`).first()).toBeVisible();
        }
      }
    } finally { await context.close(); }
  });
});

test.describe('Blog', () => {
  test('blog posts render with title, excerpt, and navigation', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      for (const post of POSTS) {
        await page.goto(`${BASE}/blog/${post.slug}`);
        await expect(page.locator('main h1')).toHaveText(post.title);
        await expect(page.locator('main')).toContainText(post.excerpt);
        await expect(page.locator('button')).toHaveCount(0);
        await expect(page.locator('main footer.post-footer a')).toHaveAttribute('href', '/blog');
        for (const href of ['/work', '/resume', '/contact']) {
          await expect(page.locator(`header a[href="${href}"]`).first()).toBeVisible();
        }
      }
    } finally { await context.close(); }
  });
});

test.describe('ShareCLI', () => {
  test('ShareCLI has heading and download', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}/work/sharecli`);
      await expect(page.locator('main h1')).toHaveText('ShareCLI');
      const pending = page.waitForEvent('download');
      await page.locator('a[download]').first().click({ force: true });
      expect((await pending).suggestedFilename()).toBe('sharecli-help-real.cast');
    } finally { await context.close(); }
  });

  test('ShareCLI accessibility across viewports', async ({ page }, testInfo) => {
    for (const width of [1440, 1280, 768, 390, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/work/sharecli');
      await expect(page.locator('main h1')).toHaveText('ShareCLI');
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      await testInfo.attach(`axe-${width}`, {
        body: JSON.stringify(result.violations),
        contentType: 'application/json',
      });
      expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.length }))).toEqual([]);
      const overflow = await page.evaluate(() =>
        [...document.querySelectorAll('main *')]
          .filter(el => el.getBoundingClientRect().right > innerWidth + 1)
          .map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0, 80) })),
      );
      expect(overflow, `overflow at ${width}px`).toEqual([]);
    }
  });
});

test.describe('Reader Mode', () => {
  test('Reader shortcut, persistence, reduced motion and focus', async ({ page }) => {
    await page.goto('/work/sharecli');
    await page.keyboard.press('r');
    await expect(page.locator('html')).toHaveAttribute('data-reader', 'true');
    await expect(page.locator('#view-root h1')).toBeFocused();
    await expect(page.locator('#reader-toggle')).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-reader', 'true');
    await page.keyboard.press('Escape');
    await expect(page.locator('#reader-toggle')).toBeFocused();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-reader', 'false');
    await page.evaluate(() => localStorage.clear());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-reader', 'true');
    await page.locator('#reader-toggle').click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-reader', 'false');
  });
});

// --- Scroll-reveal regression coverage -------------------------------------
//
// The site-wide reveal outage (e7b69ad) was invisible to every existing check.
// The hero assertion above only proved the WITF board's opacity, which is
// revealed on load rather than by scrolling, and the pre-fix bundle raised no
// error: the reveal system scanned '[data-count-to]', matched nothing, and
// simply never ran. So the tests below drive the behaviour that actually
// failed: elements below the fold that must transition out of .reveal-hidden
// only after they are scrolled into view.
test.describe('Scroll reveal', () => {
  const REVEAL_ROUTES = ['/', '/engineering', '/product', '/work', '/resume', '/contact'];

  test('every content route ships [data-reveal] elements for the reveal system to find', async ({ page }) => {
    // A route with zero [data-reveal] elements cannot fail a reveal assertion,
    // so it would silently pass while the system was completely broken. Assert
    // the fixture exists before asserting anything about its state.
    // /blog is excluded deliberately: it renders 0 [data-reveal] elements, so it
    // has nothing for the reveal system to do. Counting it here would report a
    // coverage gap that no fix can close, and would make the route list drift
    // every time a new page lands without reveal markup.
    for (const path of REVEAL_ROUTES) {
      await page.goto(path);
      const count = await page.locator('[data-reveal]').count();
      expect(count, `${path} must contain [data-reveal] elements to be verifiable`).toBeGreaterThan(0);
    }
  });

  // /resume, not /work: scroll-choreography independently adds .reveal-visible
  // to .artifact elements, so a probe on a route with artifacts can be revealed
  // by a different code path and pass even when the reveal system is inert.
  // That is exactly how the original outage survived every existing check.
  test('below-fold reveal elements un-hide only once scrolled into view', async ({ page }) => {
    await page.goto('/resume');
    await page.waitForLoadState('networkidle');

    const before = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('[data-reveal]')];
      // Find a reveal element that starts below the fold, so the test depends
      // on the IntersectionObserver firing rather than on load-time reveal.
      const offscreen = nodes.find((el) => el.getBoundingClientRect().top > window.innerHeight);
      if (!offscreen) return { found: false, total: nodes.length };
      offscreen.setAttribute('data-reveal-probe', 'below-fold');
      return {
        found: true,
        total: nodes.length,
        hidden: offscreen.classList.contains('reveal-hidden'),
        visible: offscreen.classList.contains('reveal-visible'),
      };
    });

    // A short page cannot prove scroll-driven reveal, and the claim is left
    // unproven rather than asserted.
    expect(before.found, 'expected at least one below-fold [data-reveal] element').toBe(true);
    expect(before.hidden, 'probe must start hidden or the test proves nothing').toBe(true);
    expect(before.visible, 'probe must not already be revealed before scrolling').toBe(false);

    await page.locator('[data-reveal-probe="below-fold"]').scrollIntoViewIfNeeded();

    // Assert the revealed outcome, not the presence of a box: a stuck
    // .reveal-hidden element is still laid out at opacity 0.
    await expect(page.locator('[data-reveal-probe="below-fold"]')).toHaveClass(/reveal-visible/, {
      timeout: 5000,
    });
    await expect(page.locator('[data-reveal-probe="below-fold"]')).toHaveCSS('opacity', '1', {
      timeout: 5000,
    });
  });

  test('no [data-reveal] element is left stuck after a full scroll', async ({ page }) => {
    for (const path of REVEAL_ROUTES) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Walk the page in viewport-sized steps so every reveal target is
      // genuinely intersected, then WAIT FOR SCROLLING TO ACTUALLY FINISH
      // before reading final state. The site sets scroll-behavior: smooth, so a
      // fixed sleep races the animation: a 250ms settle was observed landing
      // 279px short of the true maximum (scrollY 2102 of 2381), which reported
      // below-the-fold elements as "stuck" when the user would have scrolled
      // to them. Awaiting the real scroll position removes the race.
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.8);
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 90));
        }
        window.scrollTo(0, document.body.scrollHeight);
      });
      // Settle: wait until scrollY is at the document maximum, then let the
      // reveal transition finish.
      await page
        .waitForFunction(
          () =>
            Math.abs(
              window.scrollY -
                (document.documentElement.scrollHeight - window.innerHeight),
            ) < 2,
          null,
          { timeout: 10000 },
        )
        .catch(() => {
          // A page shorter than the viewport never scrolls; that is not a failure.
        });
      await page.waitForTimeout(400);

      const result = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll('[data-reveal]')];
        // An element that is display:none, zero-height, or inside a collapsed
        // ancestor can never intersect the viewport, so its staying hidden is
        // correct behaviour rather than a stuck reveal. Only elements that
        // actually occupy space and are in the document flow are asserted.
        const renderable = nodes.filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          return el.getClientRects().length > 0 && !el.closest('[hidden]');
        });
        return {
          total: nodes.length,
          renderable: renderable.length,
          stuck: renderable
            .filter((el) => !el.classList.contains('reveal-visible'))
            .map((el) => {
              const r = el.getBoundingClientRect();
              return `${el.tagName.toLowerCase()}.${el.className.split(' ')[0]} top=${Math.round(r.top)} h=${Math.round(r.height)}`;
            }),
        };
      });

      // A route whose reveal elements are all non-renderable proves nothing, so
      // the count of asserted elements is reported rather than assumed.
      expect(
        result.renderable,
        `${path}: no renderable [data-reveal] elements to assert on (${result.total} in DOM)`,
      ).toBeGreaterThan(0);
      expect(
        result.stuck,
        `${path}: renderable elements left unrevealed after a full scroll`,
      ).toEqual([]);
    }
  });

  // The test above scrolls the whole page, which makes the IntersectionObserver
  // fire on its own and therefore cannot tell whether the safety net works.
  // The bug the safety net exists to fix is different: the observer's
  // rootMargin keeps a reveal target inside a 40px band at the end of the
  // document from ever crossing its threshold, so it stays hidden while fully
  // on screen. That reproduces on a direct load with no scrolling at all.
  test('reveal elements at the very end of the page are visible without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const checked = [];
    for (const path of REVEAL_ROUTES) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(400);

      const result = await page.evaluate(() => {
        const hidden = [...document.querySelectorAll('[data-reveal].reveal-hidden')]
          .filter(el => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            if (el.closest('[hidden]') || el.getClientRects().length === 0) return false;
            // Already inside the viewport on load: the observer should have
            // caught these on its own.
            return r.top < window.innerHeight && r.bottom > 0;
          });
        return {
          count: hidden.length,
          sample: hidden.slice(0, 3).map(el => {
            const r = el.getBoundingClientRect();
            return `${el.tagName.toLowerCase()}.${el.className.split(' ')[0]} top=${Math.round(r.top)}`;
          }),
        };
      });

      if (result.count > 0) {
        checked.push(`${path}: ${result.count} hidden but on screen (${result.sample.join(', ')})`);
      }
    }

    expect(
      checked,
      'reveal targets rendered inside the viewport on load but still hidden; '
      + 'the safety net in scroll-reveal.js is not covering them',
    ).toEqual([]);
  });
});

test.describe('Parent view', () => {
  // The /parent/ view (added in 6f9478f) is the consolidated cockpit landing
  // and is fully JS-rendered: the static HTML only carries the wrapper and
  // the aria-live region. The 9 agent cards, the ASCII snapshot frame, and
  // the refresh stamp are built at runtime by scripts/views/parent.js once
  // the bundle hydrates. This test waits for the JS-rendered children, then
  // asserts the authored roster and its 3+3+3 state distribution.
  test('renders 9 agent cards across 3 state kinds with a snapshot frame and a refresh stamp', async ({ page }) => {
    const response = await page.goto(`${BASE}/parent/`);
    expect(response?.ok(), '/parent/: page itself did not load').toBeTruthy();

    // The agent list is JS-rendered; wait for the first card to appear.
    const agents = page.locator('.parent-agent');
    await expect(agents).toHaveCount(9, { timeout: 10_000 });

    // 3+3+3 state distribution: 3 current, 3 research, 3 historical.
    // The state is encoded in the pill's class as
    // `parent-agent__pill--<state>` (see scripts/views/parent.js:78).
    for (const state of ['current', 'research', 'historical']) {
      await expect(
        page.locator(`.parent-agent__pill--${state}`),
        `${state}: expected 3 pills`,
      ).toHaveCount(3);
    }

    // The snapshot frame is a <pre> with 9 agent rows + 3 border rows +
    // 1 summary row = 13 lines.
    const frame = page.locator('.parent-snapshot__frame');
    await expect(frame).toBeVisible();
    await expect(frame).toContainText('9 agents');

    // The refresh stamp is the <p class="parent-stamp"> element painted by
    // renderParent() on first render and refreshed every 900_000 ms.
    const stamp = page.locator('.parent-stamp');
    await expect(stamp).toBeVisible();
    await expect(stamp).toContainText('Snapshot');

    // The aria-live region announces refreshes; this is the
    // accessibility hook called out in the 13th-pass preamble.
    await expect(page.locator('[aria-live]').first()).toBeVisible();
  });
});

test.describe('Static asset links', () => {
  // The resume download used to point at /koosha-paridehpour-resume.pdf while
  // the file is published under /public/. It rendered a perfectly ordinary
  // download link and returned 404, which no presence-based assertion in this
  // suite would ever have noticed. This resolves every root-absolute asset URL
  // that a built page actually emits, so a mistyped or un-staged path fails
  // loudly instead of shipping.
  const ASSET_PATTERN =
    /\.(pdf|png|jpe?g|svg|gif|webp|avif|ico|css|js|json|mp4|webm|wasm|cast|glb|gltf|txt|xml|woff2?)$/i;

  const ROUTES = ['/', '/resume', '/work', '/contact', '/engineering', '/product', '/parent', '/blog', '/archive'];

  for (const path of ROUTES) {
    test(`${path}: every root-absolute asset link resolves`, async ({ page }) => {
      const response = await page.goto(`${BASE}${path}`);
      expect(response?.ok(), `${path}: page itself did not load`).toBeTruthy();

      const urls = await page.evaluate(() => {
        const found = new Set();
        for (const node of document.querySelectorAll('[href], [src]')) {
          const raw = node.getAttribute('href') || node.getAttribute('src') || '';
          if (!raw.startsWith('/') || raw.startsWith('//')) continue;
          found.add(raw.split('#')[0].split('?')[0]);
        }
        return [...found].filter(Boolean);
      });

      const assets = urls.filter((u) => ASSET_PATTERN.test(u));
      expect(
        assets.length,
        `${path}: no asset URLs found, so this test cannot fail meaningfully`,
      ).toBeGreaterThan(0);

      const broken = [];
      for (const url of assets) {
        const res = await page.request.get(`${BASE}${url}`);
        if (!res.ok()) broken.push(`${res.status()} ${url}`);
      }

      expect(broken, `${path}: asset links that do not resolve`).toEqual([]);
    });
  }
});

test.describe('Cast player', () => {
  // The cast player was previously assumed unreachable because nothing outside
  // a test emits a `.cast-player[data-src]`. It is not unreachable: ShareCLI's
  // page ships two real recordings. An assertion that only checked the element
  // existed would pass with an empty terminal, so this one is written against
  // decoded output instead.
  test('ShareCLI recordings load and render decoded terminal output', async ({ page }) => {
    const failures = [];
    page.on('pageerror', (e) => failures.push(e.message));

    const requested = [];
    page.on('response', (r) => {
      if (r.url().endsWith('.cast')) requested.push({ ok: r.ok(), status: r.status(), url: r.url() });
    });

    await page.goto(`${BASE}/work/sharecli`);
    await page.waitForSelector('.cast-player', { timeout: 15_000 });

    const players = page.locator('.cast-player');
    expect(await players.count(), 'no cast players rendered on /work/sharecli').toBeGreaterThan(0);

    // The recording must actually be fetched, not merely referenced.
    await expect
      .poll(() => requested.length, { timeout: 15_000, message: 'no .cast recording was requested' })
      .toBeGreaterThan(0);
    expect(
      requested.filter((r) => !r.ok).map((r) => `${r.status} ${r.url}`),
      'a recording request failed',
    ).toEqual([]);

    // Empty until playback starts. This is the assertion that would catch a
    // player which renders its chrome but never decodes the file.
    // Each recording is its own `article.sharecli-recording` containing a nested
    // `.cast-player` wrapper, so the player has to be scoped to a single article.
    // Locating `.cast-player` on its own spans both recordings and matches two
    // Play controls, which is a strict-mode violation rather than a failure.
    const first = page.locator('article.sharecli-recording').first();
    const output = first.locator('.cast-player__output');
    await first.getByRole('button', { name: 'Play', exact: true }).click();

    await expect
      .poll(() => output.innerText().then((t) => t.trim().length).catch(() => 0),
        { timeout: 20_000, message: 'cast player produced no decoded output after play' })
      .toBeGreaterThan(100);

    expect(failures, 'page errors while the cast player initialised').toEqual([]);
  });
});

test.describe('Lightbox', () => {
  // Same story as the cast player. initLightbox targets
  // `.case-gallery img, .case-hero img, .project-card-image`, and gmk-arch
  // ships both gallery and hero images, so the lightbox is live on a real route.
  test('clicking a case image opens the lightbox, advances, and closes on Escape', async ({ page }) => {
    await page.goto(`${BASE}/work/gmk-arch`);

    const openables = page.locator('.case-gallery img, .case-hero img, .project-card-image');
    expect(
      await openables.count(),
      'no image matched the lightbox selector on /work/gmk-arch',
    ).toBeGreaterThan(1);

    // The overlay element is created once at init and revealed with a class, so
    // "hidden" means "not active" rather than "absent from the DOM".
    const overlay = page.locator('.lightbox-overlay').first();
    await expect(overlay, 'lightbox overlay was never created').toHaveCount(1);
    await expect(overlay, 'lightbox must not be active before a click')
      .not.toHaveClass(/lightbox-active/);

    await openables.first().click();
    await expect(overlay).toHaveClass(/lightbox-active/, { timeout: 10_000 });

    const counter = page.locator('.lightbox-counter').first();
    await expect(counter, 'lightbox shows no position counter').toBeVisible();
    const initial = (await counter.innerText()).trim();
    expect(initial, 'counter should read like "n / total"').toMatch(/^\d+\s*\/\s*\d+$/);

    await page.locator('.lightbox-next').first().click();
    await expect
      .poll(async () => (await counter.innerText()).trim(), { timeout: 10_000 })
      .not.toBe(initial);

    await page.keyboard.press('Escape');
    await expect(overlay).not.toHaveClass(/lightbox-active/, { timeout: 10_000 });
  });

  test('metric counters run their animation and settle on the exact authored text', async ({ page }) => {
    await page.goto(`${BASE}/work/gmk-arch`);

    const metrics = page.locator('[data-count-to]');
    expect(
      await metrics.count(),
      '/work/gmk-arch defines metrics but rendered no counters',
    ).toBeGreaterThan(0);

    const targets = await metrics.evaluateAll(ns =>
      ns.map(n => n.getAttribute('data-count-to')));

    // A counter only runs when the value parses to a positive number. Assert
    // the animation actually fired by checking the implementation's own
    // per-element latch; without it the module is silently inert, which is the
    // failure mode that matters and that text assertions alone cannot see.
    for (const target of targets) {
      const node = page.locator(`[data-count-to="${target}"]`).first();
      await node.scrollIntoViewIfNeeded();
      await expect
        .poll(async () => node.evaluate(n => !!n._counterAnimated), { timeout: 10_000 })
        .toBe(true);
    }

    // The final frame writes the authored attribute back verbatim, so the
    // settled text must equal the authored target exactly, prefixes, currency
    // markers and unit suffixes included.
    for (const target of targets) {
      const node = page.locator(`[data-count-to="${target}"]`).first();
      await expect
        .poll(async () => (await node.innerText()).trim(), { timeout: 10_000 })
        .toBe(target.trim());
    }
  });
});
