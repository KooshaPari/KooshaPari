import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PROJECTS } from '../../data/projects.js';
import { POSTS } from '../../data/posts.js';
async function dismissConstructionGate(page) {
  const gate = page.locator('#construction-gate');
  if (await gate.isVisible()) await page.locator('#construction-continue').click();
}

test('fresh visitor sees the gate, dismisses for the session, and no-JS keeps native Continue', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#construction-gate')).toBeVisible();
  await expect(page.locator('#construction-continue')).toBeFocused();
  await expect(page.locator('#construction-title')).toHaveText('Under construction');
  await page.locator('#construction-continue').click();
  await expect(page.locator('#construction-gate')).toBeHidden();
  await page.reload();
  await expect(page.locator('#construction-gate')).toBeHidden();
  await context.close();

  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto('/');
  await expect(noJsPage.locator('#construction-continue')).toHaveAttribute('href', '#construction-entered');
  await noJsContext.close();
});

test('all public routes show the gate to a fresh visitor', async ({ browser }) => {
  const routes = ['/', '/engineering', '/product', '/work', '/resume', '/contact', '/blog', '/work/sharecli', '/blog/why-we-forked-omniroute'];
  for (const route of routes) {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(route);
      await expect(page.locator('#construction-gate')).toBeVisible();
      await expect(page.locator('#construction-site')).toHaveAttribute('inert', '');
      await page.locator('#construction-continue').click();
    } finally { await context.close(); }
  }
});

test('native no-JS Continue exposes the page without blocking content', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto('/work/sharecli');
    await expect(page.locator('#construction-continue')).toHaveAttribute('href', '#construction-entered');
    await expect(page.locator('main h1')).toHaveText('ShareCLI');
    await page.locator('#construction-continue').click();
    await expect(page).toHaveURL(/#construction-entered$/);
    await expect(page.locator('main h1')).toHaveText('ShareCLI');
  } finally { await context.close(); }
});
test('Reader shortcut, persistence, reduced motion and focus', async ({ page }) => {
  await page.goto('/work/sharecli');
  await dismissConstructionGate(page);
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

test('clean navigation and saved lens', async ({ page }) => {
  await page.goto('/');
  await dismissConstructionGate(page);
  await page.getByRole('link', { name: 'Read Product', exact: true }).click();
  await expect(page).toHaveURL(/\/product$/);
  await expect(page.locator('html')).toHaveAttribute('data-lens', 'product');
  await page.goto('/work/sharecli');
  await dismissConstructionGate(page);
  await expect(page.locator('html')).toHaveAttribute('data-lens', 'product');
  await page.getByRole('link', { name: 'Back to work' }).click();
  await expect(page).toHaveURL(/\/work$/);
  await page.goBack();
  await dismissConstructionGate(page);
  await expect(page.locator('#view-root h1')).toHaveText('ShareCLI');
  await page.getByRole('button', { name: 'Index', exact: true }).click();
  await page.locator('dialog a[href="/work/substrate"]').click();
  await expect(page).toHaveURL(/\/work\/substrate$/);
  await dismissConstructionGate(page);
  await expect(page.locator('#view-root h1')).toHaveText('Substrate');
});

test('all project pages have no-JavaScript content and downloads', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    for (const project of PROJECTS) {
      await page.goto(`http://127.0.0.1:4197/work/${project.slug}`);
      await expect(page.locator('main h1')).toHaveText(project.title);
      await expect(page.locator('main')).toContainText(project.summary);
      await expect(page.locator('button')).toHaveCount(0);
      for (const href of ['/work', '/blog', '/resume', '/contact']) {
        await expect(page.locator(`header a[href="${href}"]`).first()).toBeVisible();
      }
    }
    await page.goto('http://127.0.0.1:4197/work/sharecli');
    await expect(page.locator('#construction-continue')).toHaveAttribute('href', '#construction-entered');
    await page.locator('#construction-continue').click();
    await expect(page.locator('#construction-gate')).toBeHidden();
    const pending = page.waitForEvent('download');
    await page.locator('a[download]').first().click();
    expect((await pending).suggestedFilename()).toBe('sharecli-help-real.cast');
  } finally { await context.close(); }
});

test('top-level navigation pages have no-JavaScript content and clean links', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const pages = [
    ['/', 'Software systems, technical products, and the infrastructure between them.'],
    ['/engineering', 'Software systems, technical products, and the infrastructure between them.'],
    ['/product', 'Software systems, technical products, and the infrastructure between them.'],
    ['/work', 'Work'],
    ['/resume', 'Two ways to read the work'],
    ['/contact', 'Let’s build something consequential.'],
    ['/blog', 'Writing'],
  ];
  try {
    for (const [path, heading] of pages) {
      await page.goto(`http://127.0.0.1:4197${path}`);
      await expect(page.locator('main h1')).toHaveText(heading);
      for (const href of ['/work', '/blog', '/resume', '/contact']) {
        await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
      }
    }
    await page.goto('http://127.0.0.1:4197/blog');
    await expect(page.locator('main a[href="/blog/why-we-forked-omniroute"]')).toBeVisible();
  } finally { await context.close(); }
});

test('published blog posts have no-JavaScript content and clean navigation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    for (const post of POSTS) {
      await page.goto(`http://127.0.0.1:4197/blog/${post.slug}`);
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

test('ShareCLI desktop and mobile accessibility', async ({ page }, testInfo) => {
  for (const width of [1440, 1280, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/work/sharecli');
  await dismissConstructionGate(page);
    await expect(page.locator('main h1')).toHaveText('ShareCLI');
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    await testInfo.attach(`axe-${width}`, { body: JSON.stringify(result.violations), contentType: 'application/json' });
    expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.length }))).toEqual([]);
    const overflow = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0,80) })));
    expect(overflow, `overflow at ${width}px`).toEqual([]);
  }
});
