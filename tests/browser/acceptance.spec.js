import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PROJECTS } from '../../data/projects.js';
import { POSTS } from '../../data/posts.js';

const BASE = 'http://127.0.0.1:4197';

test.describe('Homepage', () => {
  test('homepage loads with title, navigation, and hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    for (const href of ['/work', '/blog', '/resume', '/contact']) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
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
        for (const href of ['/work', '/blog', '/resume', '/contact']) {
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
        for (const href of ['/work', '/blog', '/resume', '/contact']) {
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
        for (const href of ['/work', '/blog', '/resume', '/contact']) {
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
