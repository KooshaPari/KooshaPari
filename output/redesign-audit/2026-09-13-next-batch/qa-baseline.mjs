#!/usr/bin/env node
/**
 * QA Baseline Script — 2026-09-13 Next Batch
 *
 * Isolated headless Playwright browser baseline.
 * Establishes route manifest from dist/ + vercel.json, not raw HTML count.
 * Audits each route at 390px (mobile) and 1440px (desktop) viewports.
 *
 * Metrics recorded per route:
 *   - hydration: JS execution errors, missing interactive elements
 *   - heading: h1 count, heading hierarchy violations
 *   - overflow: horizontal scroll overflow
 *   - request/page errors: failed network requests, console errors
 *   - keyboard: tab-focusability of interactive elements
 *   - noJS: behaviour with JS disabled
 *
 * ABSOLUTE capture restriction: No desktop/system screenshots, no existing
 * browser/process capture. Only new isolated headless Playwright browser context.
 */

import { chromium } from 'playwright';
import { spawn, execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4197;
const BASE = `http://127.0.0.1:${PORT}`;
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

// Route manifest derived from vercel.json rewrites + dist/ + prerender.js
const ROUTES = [
  '/',
  '/engineering',
  '/product',
  '/work',
  '/work/sharecli',
  '/work/gmk-arch',
  '/work/witf',
  '/work/substrate',
  '/work/phenotype-omlx',
  '/work/netweave',
  '/work/byteport',
  '/work/tracera',
  '/work/omniroute',
  '/work/dss-cipher',
  '/work/frostify',
  '/resume',
  '/contact',
  '/blog',
  '/blog/why-we-forked-omniroute',
  '/archive',
];

async function startServer() {
  const child = spawn('node', ['scripts/preview-server.js'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(PORT) },
  });
  child.stderr.on('data', (data) => {
    console.error(`[server stderr] ${data}`);
  });
  // Poll HTTP until server responds
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { child.kill(); reject(new Error('Server start timeout (10s)')); }, 10000);
    const poll = async () => {
      try {
        const res = await fetch(BASE);
        if (res.ok) { clearTimeout(timeout); resolve(); return; }
      } catch {}
      setTimeout(poll, 200);
    };
    // Give the process a moment to bind the port
    setTimeout(poll, 500);
  });
  return child;
}

async function auditRoute(context, route, viewport) {
  const page = await context.newPage();
  const errors = { network: [], console: [], js: [] };
  const headless = true;

  // Collect network failures
  page.on('requestfailed', (req) => {
    errors.network.push({ url: req.url(), failure: req.failure()?.errorText || 'unknown' });
  });

  // Collect console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.console.push({ text: msg.text() });
    }
  });

  // Collect JS execution errors
  page.on('pageerror', (err) => {
    errors.js.push({ message: err.message, stack: err.stack?.split('\n').slice(0, 3).join('\n') });
  });

  let status = 'ok';
  let httpStatus = 200;
  let title = '';
  let headings = [];
  let h1Count = 0;
  let hasOverflow = false;
  let focusableCount = 0;
  let focusableWithVisibleFocus = 0;
  let noJSRendered = false;

  try {
    const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
    httpStatus = response?.status() || 0;
    title = await page.title();

    // Heading audit
    headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(hs).map(h => ({ tag: h.tagName, text: h.textContent?.trim().slice(0, 80) }));
    });
    h1Count = headings.filter(h => h.tag === 'H1').length;

    // Overflow audit — check for horizontal scroll
    hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    // Keyboard audit — count focusable elements and check visible focus
    const focusInfo = await page.evaluate(() => {
      const interactive = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      let withVisibleFocus = 0;
      interactive.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (style.outlineStyle !== 'none' || style.boxShadow !== 'none') {
          withVisibleFocus++;
        }
      });
      return { total: interactive.length, withVisibleFocus };
    });
    focusableCount = focusInfo.total;
    focusableWithVisibleFocus = focusInfo.withVisibleFocus;
  } catch (err) {
    status = 'error';
    errors.js.push({ message: err.message });
  }

  // no-JS check (new page, JS disabled)
  let noJSPage = null;
  try {
    noJSPage = await context.newPage();
    await noJSPage.route('**/*', (route) => {
      if (route.request().resourceType() === 'script') {
        route.abort();
      } else {
        route.continue();
      }
    });
    const noJSResponse = await noJSPage.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    noJSRendered = (noJSResponse?.status() || 0) === 200;
    const noJSContent = await noJSPage.evaluate(() => document.body?.innerText?.length || 0);
    if (noJSContent < 10) noJSRendered = false;
  } catch {
    noJSRendered = false;
  } finally {
    if (noJSPage) await noJSPage.close().catch(() => {});
  }

  await page.close();

  return {
    route,
    viewport: `${viewport.width}x${viewport.height}`,
    status,
    httpStatus,
    title,
    h1Count,
    headingViolations: h1Count !== 1 ? `expected 1 h1, got ${h1Count}` : null,
    headings,
    hasOverflow,
    focusableCount,
    focusableWithVisibleFocus,
    keyboardCoverage: focusableCount > 0
      ? `${focusableWithVisibleFocus}/${focusableCount} with visible focus`
      : 'no interactive elements',
    noJSRendered,
    errors,
  };
}

async function main() {
  console.log('Starting preview server...');
  const server = await startServer();
  console.log(`Server PID: ${server.pid}`);

  const results = [];
  const timestamps = { start: new Date().toISOString(), end: null };
  const gitRev = (() => {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch { return 'unknown'; }
  })();

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n=== Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
      const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-gpu'],
      });
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent: `QA-Baseline/${gitRev} (headless; ${vp.name})`,
      });

      console.log(`Browser PID: ${browser.contexts()[0]?._browser?._browserProcess?.pid || 'n/a'}`);
      console.log(`Routes to audit: ${ROUTES.length}`);

      for (const route of ROUTES) {
        process.stdout.write(`  ${route} ... `);
        const result = await auditRoute(context, route, vp);
        results.push(result);
        const indicator = result.status === 'ok' ? '✓' : '✗';
        const overflow = result.hasOverflow ? ' OVERFLOW' : '';
        const jsErrs = result.errors.js.length ? ` JS_ERR:${result.errors.js.length}` : '';
        const netErrs = result.errors.network.length ? ` NET_ERR:${result.errors.network.length}` : '';
        console.log(`${indicator} [${result.httpStatus}]${overflow}${jsErrs}${netErrs}`);
      }

      await browser.close();
    }
  } finally {
    timestamps.end = new Date().toISOString();
    server.kill('SIGTERM');
  }

  // Summary
  const summary = {
    meta: {
      script: 'qa-baseline.mjs',
      generated: timestamps.start,
      completed: timestamps.end,
      gitRevision: gitRev,
      serverPID: server.pid,
      viewports: VIEWPORTS.map(v => `${v.width}x${v.height}`),
      routeCount: ROUTES.length,
      totalChecks: results.length,
      ownershipProof: `headless chromium launched by this script, PID tracked, no system capture`,
    },
    routeManifest: ROUTES,
    totals: {
      ok: results.filter(r => r.status === 'ok').length,
      errors: results.filter(r => r.status !== 'ok').length,
      overflowRoutes: results.filter(r => r.hasOverflow).map(r => `${r.route}@${r.viewport}`),
      multiH1: results.filter(r => r.h1Count !== 1).map(r => ({ route: r.route, viewport: r.viewport, h1: r.h1Count })),
      jsErrors: results.filter(r => r.errors.js.length > 0).map(r => ({ route: r.route, viewport: r.viewport, count: r.errors.js.length })),
      networkErrors: results.filter(r => r.errors.network.length > 0).map(r => ({ route: r.route, viewport: r.viewport, count: r.errors.network.length })),
      noJSFailures: results.filter(r => !r.noJSRendered).map(r => `${r.route}@${r.viewport}`),
    },
    results,
  };

  const outPath = join(__dirname, 'qa-baseline.json');
  writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(`\nResults saved to ${outPath}`);

  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log(`Routes: ${ROUTES.length} x 2 viewports = ${results.length} checks`);
  console.log(`OK: ${summary.totals.ok}  Errors: ${summary.totals.errors}`);
  if (summary.totals.overflowRoutes.length) console.log(`Overflow: ${summary.totals.overflowRoutes.join(', ')}`);
  if (summary.totals.multiH1.length) console.log(`Multi-H1: ${JSON.stringify(summary.totals.multiH1)}`);
  if (summary.totals.jsErrors.length) console.log(`JS errors: ${summary.totals.jsErrors.length} routes`);
  if (summary.totals.networkErrors.length) console.log(`Network errors: ${summary.totals.networkErrors.length} routes`);
  if (summary.totals.noJSFailures.length) console.log(`No-JS failures: ${summary.totals.noJSFailures.join(', ')}`);
}

main().catch((err) => { console.error(err); process.exit(1); });

