import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/*  Hybrid-shell regression tests — isolated headless browser.
    Uses dist preview server (port 4197) for JS rendering.
    Injects source CSS to test actual hybrid-shell.css under development.
    NEVER attaches to system browser or existing processes.
    Test runner PID recorded for evidence chain. */

const BASE = 'http://127.0.0.1:4197';
const CSS_PATH = resolve('styles/hybrid-shell.css');
let browser, page;

before(async () => {
  console.log(`TEST_RUNNER_PID=${process.pid}`);
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
});

after(async () => { if (browser) await browser.close(); });

/** Dismiss construction gate if present */
async function dismissGate() {
  const gate = page.locator('.construction-gate__continue');
  if (await gate.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(500);
  }
}

/** Inject source CSS into page, replacing the dist version */
async function injectSourceCSS() {
  const css = readFileSync(CSS_PATH, 'utf8');
  await page.evaluate((sourceCSS) => {
    const links = document.querySelectorAll('link[href*="hybrid-shell"]');
    links.forEach(l => l.remove());
    const style = document.createElement('style');
    style.dataset.testSource = 'hybrid-shell';
    style.textContent = sourceCSS;
    document.head.appendChild(style);
  }, css);
}

/* ---- Defect 1: lens-control overflow:hidden clips focus ring ---- */

describe('lens-control focus ring visibility', () => {
  it('focus-visible box-shadow is not clipped by overflow:hidden', async () => {
    await page.goto(BASE + '/');
    await dismissGate();
    await page.waitForSelector('.lens-control button', { timeout: 8000 });
    await injectSourceCSS();

    // Tab to first lens button: skip-link(1) + identity(2) + Work(3) + Writing(4)
    //   + Resume(5) + Contact(6) + Engineering(7)
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(80);

    const shadow = await page.evaluate(() => {
      const el = document.activeElement;
      return getComputedStyle(el).boxShadow;
    });

    assert.notEqual(shadow, 'none',
      'lens button focus-visible box-shadow must not be none (overflow:hidden clips it)');
    assert.ok(shadow.length > 0,
      'lens button focus-visible box-shadow must have value');
  });
});

/* ---- Defect 2: search input focus-visible ring ---- */

describe('project-index-search input focus-visible', () => {
  it('search input shows focus-visible ring on keyboard focus', async () => {
    await page.goto(BASE + '/');
    await dismissGate();
    await page.waitForSelector('.atelier-header', { timeout: 8000 });
    await injectSourceCSS();

    await page.evaluate(() => {
      const div = document.createElement('div');
      div.className = 'project-index-search';
      div.innerHTML = '<input type="text" placeholder="Search" />';
      document.body.appendChild(div);
    });

    // Use actual keyboard Tab to trigger :focus-visible (programmatic .focus() does not).
    // Tab forward repeatedly until the search input is focused.
    const maxTabs = 40;
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(30);
      const isTarget = await page.evaluate(() =>
        document.activeElement?.classList.contains('project-index-search')
          || document.activeElement?.closest('.project-index-search') !== null
      );
      if (isTarget) break;
    }
    await page.waitForTimeout(80);

    const shadow = await page.evaluate(() => {
      const el = document.activeElement;
      return getComputedStyle(el).boxShadow;
    });

    assert.notEqual(shadow, 'none',
      'search input focus-visible must show box-shadow ring (not just border-color)');
  });
});

/* ---- Defect 3: reader-toggle hidden by base.css in reader mode ---- */

describe('reader mode toggle visibility', () => {
  it('reader-toggle is visible when body[data-reader="true"]', async () => {
    await page.goto(BASE + '/');
    await dismissGate();
    await page.waitForSelector('.atelier-header', { timeout: 8000 });
    await injectSourceCSS();

    await page.evaluate(() => {
      const tools = document.querySelector('.atelier-tools');
      if (!tools) return;
      const btn = document.createElement('button');
      btn.className = 'reader-toggle index-trigger';
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = 'Reader';
      tools.appendChild(btn);
    });

    await page.evaluate(() => {
      document.body.setAttribute('data-reader', 'true');
    });
    await page.waitForTimeout(80);

    const display = await page.evaluate(() => {
      const btn = document.querySelector('.reader-toggle');
      if (!btn) return 'NO_ELEMENT';
      return getComputedStyle(btn).display;
    });

    assert.notEqual(display, 'none',
      'reader-toggle must remain visible in reader mode (base.css hides .index-trigger with equal specificity)');
  });
});

/* ---- Defect 4: mobile touch target min-height at 560px ---- */

describe('mobile touch target sizing', () => {
  it('lens buttons maintain >=40px touch target at 560px', async () => {
    await page.setViewportSize({ width: 560, height: 800 });
    await page.goto(BASE + '/');
    await dismissGate();
    await page.waitForSelector('.lens-control button', { timeout: 8000 });
    await injectSourceCSS();

    const btn = page.locator('.lens-control button').first();
    const box = await btn.boundingBox();

    assert.ok(box, 'lens button must have bounding box');
    assert.ok(box.height >= 40,
      `lens button height ${box.height}px must be >= 40px (WCAG 2.5.5 target size)`);
  });
});

/* ---- Defect 5: horizontal overflow regression at 390/768/1440 ---- */

describe('no horizontal page overflow', () => {
  const viewports = [
    { width: 390, height: 844, label: 'mobile-390' },
    { width: 768, height: 1024, label: 'tablet-768' },
    { width: 1440, height: 900, label: 'desktop-1440' },
  ];
  const pages = ['/', '/engineering', '/product'];

  for (const vp of viewports) {
    for (const path of pages) {
      it(`${path} at ${vp.label}: scrollWidth <= clientWidth`, async () => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(BASE + path);
        await dismissGate();
        await page.waitForSelector('.atelier-header', { timeout: 8000 });
        await injectSourceCSS();
        await page.waitForTimeout(200);

        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        assert.ok(scrollWidth <= clientWidth,
          `${path} @${vp.label}: scrollWidth(${scrollWidth}) must be <= clientWidth(${clientWidth})`);
      });
    }
  }
});

/* ---- Defect 6: experiment-row text remains readable (not clipped) ---- */

describe('experiment-row text readability', () => {
  it('experiment-row labels and descriptions are visible at 680px container', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/');
    await dismissGate();
    await page.waitForSelector('.experiment-row', { timeout: 8000 });
    await injectSourceCSS();
    await page.waitForTimeout(200);

    // At 1440px, artifacts are ~614-689px wide, triggering @container (max-width: 680px)
    const rows = await page.locator('.experiment-row').all();
    assert.ok(rows.length > 0, 'must have experiment rows on home page');

    for (const row of rows) {
      const textContent = await row.textContent();
      assert.ok(textContent && textContent.trim().length > 0,
        'experiment row must have visible text content');

      // Check that <strong> label is not clipped (has non-zero bounding box)
      const strong = row.locator('strong');
      const box = await strong.boundingBox();
      assert.ok(box && box.width > 0 && box.height > 0,
        `experiment row label must have visible bounding box (got ${JSON.stringify(box)})`);
    }
  });

  it('experiment-row grid reflows to 2 columns inside 680px container', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/');
    await dismissGate();
    await page.waitForSelector('.experiment-row', { timeout: 8000 });
    await injectSourceCSS();
    await page.waitForTimeout(200);

    const gridCols = await page.evaluate(() => {
      const row = document.querySelector('.experiment-row');
      return row ? getComputedStyle(row).gridTemplateColumns : 'NONE';
    });

    // Should be 2-column: "2rem minmax(6rem, 1fr)" resolves to 2 tracks, not 3
    const trackCount = gridCols.split(' ').filter(t => t !== '').length;
    assert.ok(trackCount <= 2,
      `experiment-row grid must have <=2 tracks at 680px container (got ${trackCount}: ${gridCols})`);
  });
});

/* ---- Defect 7: experiment-row does not overflow at 440px container ---- */

describe('experiment-row no overflow at 440px container', () => {
  it('experiment-row has min-width:0 in 440px container query', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/');
    await dismissGate();
    await page.waitForSelector('.experiment-row', { timeout: 8000 });
    await injectSourceCSS();
    await page.waitForTimeout(200);

    // Check that the 440px container query rule applies min-width:0
    const minWidth = await page.evaluate(() => {
      const row = document.querySelector('.experiment-row');
      return row ? getComputedStyle(row).minWidth : 'NONE';
    });

    // min-width should be "0px" (from our rule), not "auto" (default)
    assert.ok(minWidth === '0px',
      `experiment-row min-width must be 0px (got ${minWidth})`);
  });

  it('no experiment-row content extends beyond parent scrollWidth at any viewport', async () => {
    const widths = [390, 680, 768, 1080, 1440];
    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(BASE + '/');
      await dismissGate();
      await page.waitForSelector('.experiment-row', { timeout: 8000 });
      await injectSourceCSS();
      await page.waitForTimeout(150);

      const overflow = await page.evaluate(() => {
        const rows = document.querySelectorAll('.experiment-row');
        for (const row of rows) {
          if (row.scrollWidth > row.clientWidth + 2) {
            return { scrollW: row.scrollWidth, clientW: row.clientWidth };
          }
        }
        return null;
      });

      assert.equal(overflow, null,
        `experiment-row overflows at ${w}px viewport: scrollWidth=${overflow?.scrollW} clientWidth=${overflow?.clientW}`);
    }
  });
});
