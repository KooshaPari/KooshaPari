#!/usr/bin/env node
/**
 * Method Verification Script — 2026-09-13 Next Batch QA Review
 *
 * Isolated headless Playwright verification of baseline claims:
 * 1. Construction gate accessibility state (hidden/inert vs. visible)
 * 2. Focus-visible measurement validity (computed style vs. actual Tab focus)
 * 3. Route denominator (which routes are actually served)
 * 4. Desktop overflow verification
 *
 * Owns: fresh server + fresh browser, no system capture.
 */

import { chromium } from 'playwright';
import { spawn, execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4197; // Different from baseline to avoid conflicts
const BASE = `http://127.0.0.1:${PORT}`;
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

// All routes that should be tested — derived from dist/ filesystem + vercel.json rewrites
const ALL_ROUTES = [
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
  // 4 excluded from baseline — verify they are served
  '/work/agentapi-plusplus',
  '/work/cliproxyapi-plusplus',
  '/work/forgecode',
  '/work/mcpforge',
];

async function startServer() {
  const child = spawn('node', ['scripts/preview-server.js'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(PORT) },
  });
  child.stderr.on('data', (data) => {
    // Don't pollute output
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { child.kill(); reject(new Error('Server timeout')); }, 15000);
    const poll = async () => {
      try {
        const res = await fetch(BASE);
        if (res.ok) { clearTimeout(timeout); resolve(); return; }
      } catch {}
      setTimeout(poll, 200);
    };
    setTimeout(poll, 500);
  });
  return child;
}

/**
 * Test 1: Construction gate state analysis
 * Determine whether the "Under construction" H1 is hidden/inert
 */
async function testConstructionGate(context, vp) {
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 15000 });

  const gateState = await page.evaluate(() => {
    const gate = document.getElementById('construction-gate');
    const site = document.getElementById('construction-site');
    if (!gate || !site) return { error: 'gate or site element not found' };

    const cs = window.getComputedStyle(gate);
    const gateRect = gate.getBoundingClientRect();
    const gateHidden = gate.hidden;
    const gateAriaHidden = gate.getAttribute('aria-hidden');
    const siteInert = site.inert;
    const bodyLocked = document.body.classList.contains('construction-locked');

    // Check if gate is visually rendered
    const gateVisible = cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';

    // Count h1s inside gate vs. inside site
    const gateH1s = gate.querySelectorAll('h1');
    const siteH1s = site.querySelectorAll('h1');

    return {
      gateHidden,
      gateAriaHidden,
      gateDisplay: cs.display,
      gateVisibility: cs.visibility,
      gateOpacity: cs.opacity,
      gateVisible,
      gateRectWidth: gateRect.width,
      gateRectHeight: gateRect.height,
      siteInert,
      bodyLocked,
      gateH1Count: gateH1s.length,
      gateH1Texts: Array.from(gateH1s).map(h => h.textContent?.trim()),
      siteH1Count: siteH1s.length,
      siteH1Texts: Array.from(siteH1s).map(h => h.textContent?.trim()),
      totalH1Count: gateH1s.length + siteH1s.length,
      // Check if site children are actually inert
      siteFirstChildInert: site.querySelector('[inert]') !== null,
      // Check if gate role and aria
      gateRole: gate.getAttribute('role'),
      gateAriaModal: gate.getAttribute('aria-modal'),
    };
  });

  await page.close();
  return gateState;
}

/**
 * Test 2: Focus-visible measurement
 * Tab through elements and check computed style BEFORE and AFTER focus
 */
async function testFocusVisible(context, vp) {
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 15000 });

  // First, dismiss the construction gate to access main content
  await page.evaluate(() => {
    const gate = document.getElementById('construction-gate');
    const site = document.getElementById('construction-site');
    if (gate) {
      gate.hidden = true;
      gate.setAttribute('aria-hidden', 'true');
    }
    if (site) site.inert = false;
    document.documentElement.dataset.construction = 'entered';
    document.body.classList.remove('construction-locked');
  });

  const results = await page.evaluate(() => {
    const interactive = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const elements = [];
    let withDefaultVisibleFocus = 0;
    let withFocusRingCSS = 0;

    interactive.forEach((el, i) => {
      if (i >= 20) return; // Sample first 20

      const cs = window.getComputedStyle(el);
      const defaultOutline = cs.outlineStyle;
      const defaultBoxShadow = cs.boxShadow;

      // Check if :focus-visible rule is in any stylesheet
      const hasFocusVisibleRule = (() => {
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule.selectorText && rule.selectorText.includes(':focus-visible')) {
                // Check if this rule could apply to this element
                if (el.matches(rule.selectorText.replace(/:focus-visible/g, ''))) {
                  return true;
                }
              }
            }
          } catch {} // Cross-origin sheets
        }
        return false;
      })();

      elements.push({
        tag: el.tagName,
        text: (el.textContent || '').trim().slice(0, 40),
        href: el.getAttribute('href')?.slice(0, 60),
        defaultOutlineStyle: defaultOutline,
        defaultBoxShadow: defaultBoxShadow === 'none' ? 'none' : defaultBoxShadow.slice(0, 80),
        hasFocusVisibleCSS: hasFocusVisibleRule,
        index: i,
      });

      if (defaultOutline !== 'none' || (defaultBoxShadow !== 'none' && defaultBoxShadow !== '')) {
        withDefaultVisibleFocus++;
      }
      if (hasFocusVisibleRule) withFocusRingCSS++;
    });

    return {
      totalInteractive: interactive.length,
      sampled: elements.length,
      withDefaultVisibleFocus,
      withFocusRingCSS,
      elements,
    };
  });

  // Now actually Tab through first few elements and check focus-visible
  const tabResults = [];
  await page.keyboard.press('Tab'); // First Tab
  await page.keyboard.press('Tab'); // Second Tab
  await page.keyboard.press('Tab'); // Third Tab

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        text: (el.textContent || '').trim().slice(0, 40),
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        outlineColor: cs.outlineColor,
        boxShadow: cs.boxShadow === 'none' ? 'none' : cs.boxShadow.slice(0, 120),
        offsetWidth: el.offsetWidth,
        offsetHeight: el.offsetHeight,
        // Check if element is actually visible
        isVisible: el.offsetWidth > 0 && el.offsetHeight > 0,
      };
    });
    tabResults.push(focused);
  }

  await page.close();
  return { computedAnalysis: results, tabFocusResults: tabResults };
}

/**
 * Test 3: Route denominator verification
 * Check which routes actually serve HTTP 200 on the preview server
 */
async function testRouteDenominator(context) {
  const routeStatus = [];
  for (const route of ALL_ROUTES) {
    const page = await context.newPage();
    try {
      const res = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const status = res?.status() || 0;
      const title = await page.title();
      const h1Count = await page.evaluate(() => document.querySelectorAll('h1').length);
      const bodyLen = await page.evaluate(() => document.body?.innerText?.length || 0);
      routeStatus.push({ route, status, title: title.slice(0, 60), h1Count, bodyLen });
    } catch (e) {
      routeStatus.push({ route, status: 'error', error: e.message?.slice(0, 80) });
    }
    await page.close();
  }
  return routeStatus;
}

/**
 * Test 4: Desktop overflow verification on representative routes
 */
async function testOverflow(context) {
  const overflowResults = [];
  const sampleRoutes = ['/', '/engineering', '/product', '/work', '/work/sharecli', '/contact'];

  for (const route of sampleRoutes) {
    const vp = { width: 1440, height: 900 };
    const ctx = await context.browser().newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
      }));
      overflowResults.push({ route, viewport: `${vp.width}x${vp.height}`, ...overflow });
    } catch (e) {
      overflowResults.push({ route, error: e.message?.slice(0, 80) });
    }
    await page.close();
    await ctx.close();
  }
  return overflowResults;
}

async function main() {
  const server = await startServer();
  console.log(`Server PID: ${server.pid}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const browserPid = browser.contexts()[0]?._browser?._browserProcess?.pid || 'unknown';
  console.log(`Browser PID: ${browserPid}`);

  const gitRev = (() => {
    try { return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); }
    catch { return 'unknown'; }
  })();

  const findings = { meta: { generated: new Date().toISOString(), gitRev, serverPID: server.pid, browserPID: browserPid } };

  try {
    // Test 1: Construction gate on desktop viewport
    console.log('\n=== TEST 1: Construction Gate State ===');
    const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    findings.constructionGate = await testConstructionGate(ctx1, VIEWPORTS[1]);
    await ctx1.close();
    console.log(JSON.stringify(findings.constructionGate, null, 2));

    // Test 2: Focus-visible measurement
    console.log('\n=== TEST 2: Focus-Visible Measurement ===');
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    findings.focusVisible = await testFocusVisible(ctx2, VIEWPORTS[1]);
    await ctx2.close();
    console.log('Computed analysis:');
    console.log(`  Total interactive: ${findings.focusVisible.computedAnalysis.totalInteractive}`);
    console.log(`  With default visible focus: ${findings.focusVisible.computedAnalysis.withDefaultVisibleFocus}`);
    console.log(`  With :focus-visible CSS: ${findings.focusVisible.computedAnalysis.withFocusRingCSS}`);
    console.log('Tab focus results:');
    findings.focusVisible.tabFocusResults.forEach((r, i) => {
      if (r) {
        console.log(`  Tab ${i+1}: <${r.tag}> "${r.text.slice(0,30)}" outline=${r.outlineStyle} box-shadow=${r.boxShadow.slice(0,50)} visible=${r.isVisible}`);
      }
    });

    // Test 3: Route denominator
    console.log('\n=== TEST 3: Route Denominator ===');
    const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    findings.routeDenominator = await testRouteDenominator(ctx3);
    await ctx3.close();
    const served = findings.routeDenominator.filter(r => r.status === 200);
    const notServed = findings.routeDenominator.filter(r => r.status !== 200);
    console.log(`Routes served (HTTP 200): ${served.length}`);
    console.log(`Routes not served: ${notServed.length}`);
    if (notServed.length) console.log('Not served:', JSON.stringify(notServed));

    // Test 4: Overflow
    console.log('\n=== TEST 4: Desktop Overflow ===');
    const ctx4 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    findings.overflow = await testOverflow(ctx4);
    await ctx4.close();
    findings.overflow.forEach(r => {
      console.log(`  ${r.route}: scrollW=${r.scrollWidth} clientW=${r.clientWidth} overflow=${r.hasHorizontalOverflow}`);
    });

  } finally {
    server.kill('SIGTERM');
    await browser.close();
  }

  const outPath = join(__dirname, 'verify-results.json');
  writeFileSync(outPath, JSON.stringify(findings, null, 2));
  console.log(`\nResults saved to ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
