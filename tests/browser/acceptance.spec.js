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
  // The ceilings below are the counts measured on 2026-09-19 at 1440x900 after
  // every fix in this pass; raising one should be a deliberate, justified edit.
  const INCOMPLETE_CEILING = { '/': 22, '/work': 16, '/blog': 15 };

  test('colour contrast is evaluated, and reported violations are zero', async ({ page }) => {
    for (const [path, ceiling] of Object.entries(INCOMPLETE_CEILING)) {
      await page.goto(path);
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
