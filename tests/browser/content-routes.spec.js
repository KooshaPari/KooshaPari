import { test, expect } from '@playwright/test';
import { BASE, PROJECTS, POSTS } from './helpers/acceptance-support.js';

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

  const ROUTES = ['/', '/resume', '/work', '/contact', '/engineering', '/product', '/parent', '/blog'];

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
