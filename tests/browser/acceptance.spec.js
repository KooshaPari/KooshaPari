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

test.describe('Static asset links', () => {
  // The resume download used to point at /koosha-paridehpour-resume.pdf while
  // the file is published under /public/. It rendered a perfectly ordinary
  // download link and returned 404, which no presence-based assertion in this
  // suite would ever have noticed. This resolves every root-absolute asset URL
  // that a built page actually emits, so a mistyped or un-staged path fails
  // loudly instead of shipping.
  const ASSET_PATTERN =
    /\.(pdf|png|jpe?g|svg|gif|webp|avif|ico|css|js|json|mp4|webm|wasm|cast|glb|gltf|txt|xml|woff2?)$/i;

  const ROUTES = ['/', '/resume', '/work', '/contact', '/engineering', '/product'];

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
