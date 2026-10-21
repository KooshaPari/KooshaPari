import { test, expect } from '@playwright/test';

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
