import { test, expect } from '@playwright/test';
import { BASE } from './helpers/acceptance-support.js';

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
