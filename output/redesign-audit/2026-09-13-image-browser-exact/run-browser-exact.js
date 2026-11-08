#!/usr/bin/env node
/**
 * Playwright Chromium browser-exact audit.
 * 3 slugs × 2 viewports = 6 cases.
 * Isolated loopback server, no git mutation, no source edits.
 */
import { chromium } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const DIST = resolve(ROOT, 'dist');
const OUT = __dirname;

const SLUGS = ['mcpforge', 'forgecode', 'frostify'];
const VIEWPORTS = [
  { width: 390, height: 844, label: 'mobile-390' },
  { width: 1440, height: 1000, label: 'desktop-1440' },
];

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.json': 'application/json', '.txt': 'text/plain',
  '.ico': 'image/x-icon',
};

function startServer(root) {
  return new Promise((res) => {
    const server = http.createServer((req, response) => {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
      if (!extname(file)) file += '.html';
      try { fs.accessSync(file); } catch {
        if (extname(pathname)) { response.writeHead(404); response.end('Not found'); return; }
        response.statusCode = 404;
        file = resolve(root, 'root.html');
      }
      response.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream');
      response.end(fs.readFileSync(file));
    });
    server.listen(0, '127.0.0.1', () => { res({ server, port: server.address().port }); });
  });
}

async function auditSlug(page, slug, viewport, baseURL) {
  const url = baseURL + '/work/' + slug;
  const caseId = slug + '@' + viewport.label;
  const result = {
    caseId, slug,
    viewport: { width: viewport.width, height: viewport.height },
    url, timestamp: new Date().toISOString(),
    h1: { present: false, text: null },
    overflow: { detected: false, elements: [] },
    httpErrors: [], pageErrors: [], requestFailures: [], images: [],
    browserLaunch: true,
  };

  await page.setViewportSize({ width: viewport.width, height: viewport.height });

  const pageErrors = [];
  page.on('pageerror', (err) => { pageErrors.push({ message: String(err.message || err), stack: err.stack || null }); });

  const requestFailures = [];
  page.on('requestfailed', (req) => {
    requestFailures.push({ url: req.url(), failure: req.failure()?.errorText || 'unknown', resourceType: req.resourceType() });
  });

  const httpErrors = [];
  page.on('response', (resp) => {
    if (resp.status() >= 400) httpErrors.push({ url: resp.url(), status: resp.status(), statusText: resp.statusText() });
  });

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    result.httpStatus = response?.status() ?? null;
    // Dismiss construction gate
    const gate = page.locator('#construction-gate');
    if (await gate.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.locator('#construction-continue').click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch (err) { result.navigateError = String(err.message || err); }

  // H1 check
  try {
    const h1 = page.locator('main h1').first();
    const visible = await h1.isVisible({ timeout: 3000 });
    result.h1 = { present: visible, text: visible ? (await h1.textContent())?.trim() || null : null };
  } catch { result.h1 = { present: false, text: null }; }

  // Overflow check
  try {
    result.overflow = await page.evaluate(() => {
      const els = [...document.querySelectorAll('main *')].filter(
        (el) => el.getBoundingClientRect().right > window.innerWidth + 1
      ).map((el) => ({ tag: el.tagName, class: el.className, right: Math.round(el.getBoundingClientRect().right), vpWidth: window.innerWidth }));
      return { detected: els.length > 0, elements: els };
    });
  } catch (err) { result.overflow = { detected: false, elements: [], error: String(err) }; }

  // Image src collection
  try {
    result.images = await page.evaluate(() =>
      [...document.querySelectorAll('img')].map((img) => ({
        src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
        alt: img.alt || '', complete: img.complete,
        broken: img.complete && img.naturalWidth === 0,
      }))
    );
  } catch (err) { result.images = []; result.imagesError = String(err); }

  result.httpErrors = httpErrors;
  result.pageErrors = pageErrors;
  result.requestFailures = requestFailures;
  return result;
}

async function main() {
  const { server, port } = await startServer(DIST);
  const baseURL = 'http://127.0.0.1:' + port;
  console.log('Server on', baseURL);

  const results = [];
  const browser = await chromium.launch({ headless: true });
  try {
    for (const slug of SLUGS) {
      for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await ctx.newPage();
        try {
          console.log('Auditing', slug, '@', vp.label, '...');
          const r = await auditSlug(page, slug, vp, baseURL);
          results.push(r);
          console.log('  h1=' + r.h1.present + ' overflow=' + r.overflow.detected +
            ' imgs=' + r.images.length + ' httpErr=' + r.httpErrors.length +
            ' pageErr=' + r.pageErrors.length + ' reqFail=' + r.requestFailures.length);
        } catch (err) {
          results.push({ caseId: slug + '@' + vp.label, slug, viewport: { width: vp.width, height: vp.height }, error: String(err.message || err), browserLaunch: true });
          console.error('  ERROR:', err.message);
        } finally { await ctx.close(); }
      }
    }
  } finally { await browser.close(); server.close(); }

  // Write JSON
  const jsonPath = resolve(OUT, 'browser-exact-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log('JSON:', jsonPath);

  // Write report
  let md = '# Browser Exact Audit — ' + new Date().toISOString() + '\n\n';
  md += '**Slugs**: ' + SLUGS.join(', ') + '  \n';
  md += '**Viewports**: ' + VIEWPORTS.map(v => v.label + ' (' + v.width + 'x' + v.height + ')').join(', ') + '  \n';
  md += '**Server**: Isolated loopback on port ' + port + '  \n';
  md += '**Cases**: ' + results.length + ' total\n\n';
  md += '## Summary\n\n';
  md += '| Case | h1 | Overflow | HTTP Errors | Page Errors | Request Failures | Images |\n';
  md += '|------|-----|----------|-------------|-------------|------------------|--------|\n';
  for (const r of results) {
    const h1 = r.h1?.present ? 'Y' : 'N';
    const ovf = r.overflow?.detected ? 'Y(' + r.overflow.elements.length + ')' : 'N';
    const http = r.httpErrors?.length ? 'Y(' + r.httpErrors.length + ')' : 'N';
    const pe = r.pageErrors?.length ? 'Y(' + r.pageErrors.length + ')' : 'N';
    const rf = r.requestFailures?.length ? 'Y(' + r.requestFailures.length + ')' : 'N';
    const imgs = r.images?.length ?? 0;
    md += '| ' + r.caseId + ' | ' + h1 + ' | ' + ovf + ' | ' + http + ' | ' + pe + ' | ' + rf + ' | ' + imgs + ' |\n';
  }
  md += '\n## Detailed Findings\n\n';
  for (const r of results) {
    md += '### ' + r.caseId + '\n\n';
    md += '- **URL**: ' + r.url + '\n';
    md += '- **Viewport**: ' + r.viewport.width + 'x' + r.viewport.height + '\n';
    md += '- **H1**: ' + (r.h1?.present ? '"' + r.h1.text + '"' : 'NOT FOUND') + '\n';
    md += '- **Overflow**: ' + (r.overflow?.detected ? 'YES (' + r.overflow.elements.length + ')' : 'None') + '\n';
    if (r.httpErrors?.length) {
      md += '- **HTTP Errors**:\n';
      for (const e of r.httpErrors) md += '  - ' + e.status + ' ' + e.statusText + ': ' + e.url + '\n';
    }
    if (r.pageErrors?.length) {
      md += '- **Page Errors**:\n';
      for (const e of r.pageErrors) md += '  - ' + e.message + '\n';
    }
    if (r.requestFailures?.length) {
      md += '- **Request Failures**:\n';
      for (const f of r.requestFailures) md += '  - ' + f.failure + ': ' + f.url + ' (' + f.resourceType + ')\n';
    }
    const brokenImgs = (r.images || []).filter(i => i.broken);
    md += '- **Images**: ' + (r.images?.length || 0) + ' total' + (brokenImgs.length ? ', ' + brokenImgs.length + ' broken' : '') + '\n';
    for (const img of (r.images || [])) {
      md += '  - ' + (img.broken ? 'BROKEN' : 'OK') + ' src="' + img.src + '" (' + img.naturalWidth + 'x' + img.naturalHeight + ')\n';
    }
    md += '\n';
  }
  md += '## Evidence\n\n';
  md += '- **Browser**: Playwright Chromium (headless)\n';
  md += '- **Script**: run-browser-exact.js\n';
  md += '- **JSON**: browser-exact-results.json\n';
  md += '- **Port**: ' + port + '\n';
  md += '- **Date**: ' + new Date().toISOString() + '\n';

  fs.writeFileSync(resolve(OUT, 'REPORT.md'), md);
  console.log('Report:', resolve(OUT, 'REPORT.md'));
}

main().catch((err) => { console.error('FATAL:', err); process.exit(1); });
