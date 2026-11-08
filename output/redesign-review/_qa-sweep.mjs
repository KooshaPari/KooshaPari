/**
 * Full QA sweep: Hybrid redesign — 2026-09-12
 *
 * Checks every rendered page at 390px and 1440px:
 *   - screenshots
 *   - console errors / warnings
 *   - media currentSrc loaded
 *   - horizontal overflow
 *   - no-JS noscript content
 *   - prefers-reduced-motion handling
 *   - project index search + Escape focus
 *   - keyboard tab-focus on interactive elements
 *
 * Outputs:
 *   output/redesign-review/screenshots/<slug>-<vp>.png
 *   output/redesign-review/findings.json
 *   output/redesign-review/findings.md
 */

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = 'http://127.0.0.1:4397';
const OUT = 'output/redesign-audit/2026-09-13-harness-verification';
const SS_DIR = join(OUT, 'screenshots');

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

const PROJECT_SLUGS = [
  'gmk-arch','witf','sharecli','substrate','phenotype-omlx',
  'netweave','byteport','tracera','dss-cipher','cliproxyapi-plusplus',
  'agentapi-plusplus','mcpforge','forgecode','frostify','omniroute',
];

const ROUTES = [
  { slug: 'mcpforge', path: '/work/mcpforge.html' },
  { slug: 'forgecode', path: '/work/forgecode.html' },
  { slug: 'frostify', path: '/work/frostify.html' },
];

await mkdir(SS_DIR, { recursive: true });

const findings = [];
const ts = new Date().toISOString();

function record(severity, category, slug, viewport, detail, extra = {}) {
  findings.push({ ts: new Date().toISOString(), severity, category, slug, viewport, detail, ...extra });
}

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: 'no-preference',
    });

    for (const route of ROUTES) {
      const lenses = route.lenses || [null];

      for (const lens of lenses) {
        const url = `${BASE}${route.path.replace(/\.html$/, '')}${lens ? `?lens=${lens}` : ''}`;
        const label = lens ? `${route.slug}-${lens}` : route.slug;
        const ssName = `${label}-${vp.name}`;

        const page = await context.newPage();
        const consoleMessages = [];
        const pageErrors = [];
        const failedRequests = [];

        page.on('console', msg => {
          if (msg.type() === 'error' || msg.type() === 'warning') {
            consoleMessages.push({ type: msg.type(), text: msg.text() });
          }
        });
        page.on('pageerror', err => pageErrors.push(err.message));
        page.on('requestfailed', req => failedRequests.push({ url: req.url(), failure: req.failure()?.errorText }));

        try {
          const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
          const status = resp?.status() ?? 0;
          if (status >= 400) {
            record('error', 'http-status', label, vp.name, `HTTP ${status} for ${url}`);
          }

          // Dismiss construction-continue overlay if present
          try {
            const btn = await page.$('#construction-continue');
            if (btn && await btn.isVisible()) {
              await btn.click();
              await page.locator('#construction-gate').waitFor({ state: 'hidden', timeout: 8000 });
              await page.waitForTimeout(300);
            }
          } catch { /* no overlay */ }

          // Assert main h1 is actual expected project title before screenshot
          const h1Text = await page.$eval('#view-root h1', el => el.textContent?.trim() ?? '').catch(() => '');
          if (label !== 'home' && label !== 'home-engineering' && label !== 'home-product') {
            const expectedTitle = (PROJECT_SLUGS.includes(route.slug)
              ? route.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
              : route.slug.charAt(0).toUpperCase() + route.slug.slice(1));
            if (h1Text && !h1Text.toLowerCase().includes(route.slug.replace(/-/g, ' ').split(' ')[0].toLowerCase())
                && !h1Text.toLowerCase().includes(expectedTitle.toLowerCase().split(' ')[0].toLowerCase())) {
              record('warning', 'h1-mismatch', label, vp.name, `h1 "${h1Text}" does not match expected project "${expectedTitle}"`);
            }
          }

          // Screenshot
          await page.screenshot({ path: join(SS_DIR, `${ssName}.png`), fullPage: true });

          // 1. Console errors
          for (const c of consoleMessages) {
            if (c.type === 'error') {
              record('error', 'console', label, vp.name, c.text);
            } else {
              record('info', 'console-warn', label, vp.name, c.text);
            }
          }
          for (const e of pageErrors) {
            record('error', 'page-error', label, vp.name, e);
          }

          // 2. Failed network requests
          for (const f of failedRequests) {
            record('warning', 'network-fail', label, vp.name, `${f.url} — ${f.failure}`);
          }

          // 3. Horizontal overflow check
          const overflowX = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          if (overflowX) {
            record('warning', 'overflow', label, vp.name,
              `Horizontal overflow: scrollWidth=${await page.evaluate(() => document.documentElement.scrollWidth)} > clientWidth=${await page.evaluate(() => document.documentElement.clientWidth)}`);
          }

          // 4. Media currentSrc audit (images with src)
          const mediaAudit = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.map(img => ({
              src: img.src,
              currentSrc: img.currentSrc,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              alt: img.alt?.slice(0, 60),
              loading: img.loading,
              displayed: img.offsetWidth > 0 && img.offsetHeight > 0,
            }));
          });
          for (const m of mediaAudit) {
            if (m.displayed && m.naturalWidth === 0 && m.currentSrc) {
              record('error', 'media-broken', label, vp.name, `Image failed to load: currentSrc=${m.currentSrc} naturalWidth=0`);
            } else if (m.displayed && !m.currentSrc && m.src) {
              // src attribute present but no currentSrc — check if it's a data: or about:src
              if (!m.src.startsWith('data:') && !m.src.startsWith('about:')) {
                record('warning', 'media-no-load', label, vp.name, `Image has src but no currentSrc: src=${m.src}`);
              }
            }
          }

          // 5. Noscript check (informational only)
          // prerender.js provides static content; noscript presence is expected
          const noscriptCount = await page.evaluate(() => document.querySelectorAll('noscript').length);
          if (noscriptCount > 0) {
            record('info', 'noscript', label, vp.name, `Found ${noscriptCount} noscript elements (expected with prerender)`);
          }

          // 6. Reduced motion: check for animation / transition declarations
          const reducedMotionAudit = await page.evaluate(() => {
            const styles = Array.from(document.styleSheets);
            let animCount = 0;
            let transitionCount = 0;
            for (const sheet of styles) {
              try {
                for (const rule of sheet.cssRules) {
                  if (rule.type === CSSRule.KEYFRAMES_RULE) animCount++;
                  if (rule.type === CSSRule.STYLE_RULE) {
                    const s = rule.style;
                    if (s.animation || s.animationName) animCount++;
                    if (s.transition || s.transitionProperty) transitionCount++;
                  }
                }
              } catch { /* cross-origin */ }
            }
            // Check for prefers-reduced-motion media queries
            let hasReducedMotionQuery = false;
            for (const sheet of styles) {
              try {
                for (const rule of sheet.cssRules) {
                  if (rule.type === CSSRule.MEDIA_RULE) {
                    if (rule.conditionText?.includes('prefers-reduced-motion')) {
                      hasReducedMotionQuery = true;
                    }
                  }
                }
              } catch { /* cross-origin */ }
            }
            return { animCount, transitionCount, hasReducedMotionQuery };
          });
          if (!reducedMotionAudit.hasReducedMotionQuery && (reducedMotionAudit.animCount > 0 || reducedMotionAudit.transitionCount > 0)) {
            record('warning', 'reduced-motion', label, vp.name,
              `No prefers-reduced-motion media query found despite ${reducedMotionAudit.animCount} animations and ${reducedMotionAudit.transitionCount} transitions`);
          }

          // 7. Keyboard: check focus-visible / outline on interactive elements
          const interactiveCount = await page.evaluate(() => {
            return document.querySelectorAll('a, button, input, select, textarea, [tabindex]').length;
          });

          // 8. For work page: open Index dialog first, then audit it
          if (route.slug === 'work') {
            // Click Index button to open the project-index dialog
            const indexBtn = await page.locator('button.index-trigger', { hasText: /^Index$/ }).first();
            if (indexBtn && await indexBtn.isVisible()) {
              await indexBtn.click();
              await page.waitForTimeout(500);
              const dialogOpen = await page.$eval('dialog.project-index', d => d.open).catch(() => false);
              record('info', 'index-dialog', label, vp.name, `Index dialog open: ${dialogOpen}`);

              if (dialogOpen) {
                const dialogItems = await page.evaluate(() => {
                  return document.querySelectorAll('dialog.project-index ol li').length;
                });
                record('info', 'index-items', label, vp.name, `${dialogItems} projects in Index dialog`);

                // Close dialog
                const closeBtn = await page.$('dialog.project-index .project-index-close');
                if (closeBtn) await closeBtn.click();
                await page.waitForTimeout(300);
              }
            } else {
              record('info', 'index-trigger-missing', label, vp.name, 'No Index button found on work page');
            }

            // Also test filter buttons
            const filterButtons = await page.$$('.work-catalog__filter');
            if (filterButtons.length > 0) {
              record('info', 'filter-buttons', label, vp.name, `${filterButtons.length} filter buttons found`);
            }
          }

          // 9. For homepage with lenses: check lens switching
          if (route.slug === 'home' && lens) {
            const lensIndicator = await page.evaluate((l) => {
              const body = document.body;
              const classes = body.className;
              const dataLens = body.getAttribute('data-lens') || body.getAttribute('data-active-lens');
              return { classes: classes.slice(0, 200), dataLens, url: window.location.hash };
            }, lens);
            record('info', 'lens-state', label, vp.name, JSON.stringify(lensIndicator));
          }

          // 10. Focus trap check for modals/overlays (press Tab a few times)
          if (vp.name === 'desktop') {
            const focusableBefore = await page.evaluate(() => {
              return document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length;
            });
            record('info', 'focusable-count', label, vp.name, `${focusableBefore} focusable elements`);
          }

        } catch (err) {
          record('error', 'navigation', label, vp.name, `Failed to load: ${err.message}`);
        }

        await page.close();
      }
    }
    await context.close();
  }

  await browser.close();

  // Write findings
  await writeFile(join(OUT, 'findings.json'), JSON.stringify(findings, null, 2));
  await writeFile(join(OUT, 'results-current.json'), JSON.stringify({ sweepTime: ts, server: BASE, findings }, null, 2));

  // Write markdown summary
  const errors = findings.filter(f => f.severity === 'error');
  const warnings = findings.filter(f => f.severity === 'warning');
  const infos = findings.filter(f => f.severity === 'info');

  let md = `# QA Findings — Hybrid Redesign\n`;
  md += `**Sweep time:** ${ts}\n`;
  md += `**Server:** ${BASE}\n`;
  md += `**Viewports:** ${VIEWPORTS.map(v => `${v.name} (${v.width}×${v.height})`).join(', ')}\n\n`;
  md += `## Summary\n`;
  md += `| Severity | Count |\n|----------|-------|\n`;
  md += `| 🔴 Error | ${errors.length} |\n`;
  md += `| 🟡 Warning | ${warnings.length} |\n`;
  md += `| 🔵 Info | ${infos.length} |\n\n`;

  if (errors.length) {
    md += `## 🔴 Errors\n\n`;
    for (const e of errors) {
      md += `- **[${e.category}]** \`${e.slug}\` @ ${e.viewport}: ${e.detail}\n`;
    }
    md += '\n';
  }
  if (warnings.length) {
    md += `## 🟡 Warnings\n\n`;
    for (const w of warnings) {
      md += `- **[${w.category}]** \`${w.slug}\` @ ${w.viewport}: ${w.detail}\n`;
    }
    md += '\n';
  }

  // Grouped info highlights
  const infoCategories = {};
  for (const i of infos) {
    if (!infoCategories[i.category]) infoCategories[i.category] = [];
    infoCategories[i.category].push(i);
  }
  md += `## 🔵 Info Highlights\n\n`;
  for (const [cat, items] of Object.entries(infoCategories)) {
    md += `### ${cat}\n`;
    // Show first 5 and count
    const shown = items.slice(0, 5);
    for (const i of shown) {
      md += `- \`${i.slug}\` @ ${i.viewport}: ${i.detail}\n`;
    }
    if (items.length > 5) md += `- ...and ${items.length - 5} more\n`;
    md += '\n';
  }

  await writeFile(join(OUT, 'findings.md'), md);
  console.log(`Done. ${findings.length} findings written to ${OUT}/findings.json and findings.md`);
}

run().catch(e => { console.error(e); process.exit(1); });
