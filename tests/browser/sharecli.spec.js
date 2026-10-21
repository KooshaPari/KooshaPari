import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { BASE } from './helpers/acceptance-support.js';

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
