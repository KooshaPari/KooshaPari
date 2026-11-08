#!/usr/bin/env node
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKTREE = '/Users/<REDACTED>/CodeProjects/Phenotype/repos/worktrees/<REDACTED>-public-sync-20260909';

function mimeFor(p) {
  const ext = path.extname(p).toLowerCase();
  return { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }[ext] ?? 'application/octet-stream';
}

function startServer(root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let url = decodeURIComponent(req.url.split('?')[0]);
      if (url === '/') url = '/index.html';
      const fp = path.join(root, url);
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not Found'); return; }
        res.writeHead(200, { 'Content-Type': mimeFor(fp) });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

const results = [];
function record(id, pass, detail) { results.push({ id, pass: !!pass, detail }); }

(async () => {
  const { server, port } = await startServer(WORKTREE);
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Server: ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  console.log(`Chromium launched (fresh headless)`);

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // ── Step 1: Enable reader mode ──
  await page.keyboard.press('r');
  await page.waitForTimeout(500);
  const readerAttr = await page.$eval('html', el => el.dataset.reader);
  record('reader-active', readerAttr === 'true', `data-reader="${readerAttr}"`);

  // ── Step 2: Open project-index dialog ──
  // Use the non-reader-toggle index-trigger button
  await page.click('button.index-trigger:not(.reader-toggle)');
  await page.waitForTimeout(500);
  const dialogOpen = await page.$eval('dialog.project-index', d => d.open).catch(() => false);
  record('dialog-opens', dialogOpen === true, `dialog.open=${dialogOpen}`);

  // ── Step 3: Escape with EMPTY search → dialog closes, focus returns ──
  const searchValEmpty = await page.$eval('.project-index-search', el => el.value);
  record('search-empty-before-escape', searchValEmpty === '', `search="${searchValEmpty}"`);

  // Record trigger element before Escape
  const triggerTag = await page.evaluate(() => document.activeElement?.tagName);
  console.log(`Focus before Escape: ${triggerTag}`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  const dialogAfterEsc = await page.$eval('dialog.project-index', d => d.open).catch(() => true);
  record('escape-empty-closes-dialog', dialogAfterEsc === false, `dialog.open=${dialogAfterEsc}`);

  // Focus should return to the Index trigger button
  const focusAfterClose = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName}.${el.className}` : 'none';
  });
  console.log(`Focus after dialog close: ${focusAfterClose}`);
  const focusReturned = focusAfterClose.includes('index-trigger') || focusAfterClose.includes('button');
  record('focus-return-after-close', focusReturned, `activeElement: ${focusAfterClose}`);

  // ── Step 4: Re-open, type search, Escape clears (nonempty) ──
  await page.click('button.index-trigger:not(.reader-toggle)');
  await page.waitForTimeout(400);
  const dialogReopened = await page.$eval('dialog.project-index', d => d.open).catch(() => false);
  record('dialog-reopens', dialogReopened === true, `dialog.open=${dialogReopened}`);

  await page.keyboard.type('zzz-nomatch');
  await page.waitForTimeout(200);
  const searchValTyped = await page.$eval('.project-index-search', el => el.value);
  record('search-nonempty-typed', searchValTyped === 'zzz-nomatch', `search="${searchValTyped}"`);

  // Escape should clear search, NOT close dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const searchValAfterEsc = await page.$eval('.project-index-search', el => el.value);
  record('escape-nonempty-clears-search', searchValAfterEsc === '', `after="${searchValAfterEsc}"`);

  const dialogStillOpen = await page.$eval('dialog.project-index', d => d.open).catch(() => false);
  record('escape-nonempty-dialog-stays-open', dialogStillOpen === true, `dialog.open=${dialogStillOpen}`);

  // Verify clear button state: search should be empty, no "clear" button visible
  const clearBtn = await page.$('.project-index-search::-webkit-search-cancel-button').catch(() => null);
  // (search input[type=search] may show a clear button when nonempty)

  // ── Step 5: ArrowDown / ArrowUp / Home with real Tab/focus ──
  await page.focus('.project-index-search');
  await page.waitForTimeout(100);

  // Home → first link
  await page.keyboard.press('Home');
  await page.waitForTimeout(150);
  const homeTag = await page.evaluate(() => document.activeElement?.tagName);
  const homeText = await page.evaluate(() => document.activeElement?.textContent?.trim()?.slice(0, 30));
  record('home-focuses-first-item', homeTag === 'A', `tag=${homeTag} text="${homeText}"`);
  console.log(`Home → ${homeTag}: "${homeText}"`);

  // ArrowDown → next item
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(150);
  const adTag = await page.evaluate(() => document.activeElement?.tagName);
  const adText = await page.evaluate(() => document.activeElement?.textContent?.trim()?.slice(0, 30));
  record('arrow-down-moves-focus', adTag === 'A', `tag=${adTag} text="${adText}"`);
  console.log(`ArrowDown → ${adTag}: "${adText}"`);

  // ArrowUp → back to first
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(150);
  const auTag = await page.evaluate(() => document.activeElement?.tagName);
  const auText = await page.evaluate(() => document.activeElement?.textContent?.trim()?.slice(0, 30));
  record('arrow-up-moves-focus', auTag === 'A', `tag=${auTag} text="${auText}"`);
  console.log(`ArrowUp → ${auTag}: "${auText}"`);

  // ArrowUp from first → should go to search
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(150);
  const auSearchTag = await page.evaluate(() => document.activeElement?.tagName);
  const auSearchClass = await page.evaluate(() => document.activeElement?.className);
  record('arrow-up-from-first-goes-to-search', auSearchTag === 'INPUT', `tag=${auSearchTag} class="${auSearchClass}"`);
  console.log(`ArrowUp from first → ${auSearchTag}: "${auSearchClass}"`);

  // Close dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // ── Step 6: Image failure interception ──
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Inventory all images
  const allImgs = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src, alt: img.alt,
    hasPicture: img.parentElement?.tagName === 'PICTURE',
    srcset: img.srcset || '',
    parentSrcsets: img.parentElement?.tagName === 'PICTURE'
      ? Array.from(img.parentElement.querySelectorAll('source')).map(s => s.srcset) : []
  })));
  console.log(`\nImages on page: ${allImgs.length}`);
  for (const img of allImgs.slice(0, 8)) {
    const shortSrc = img.src?.replace(baseUrl, '')?.slice(0, 50) ?? 'none';
    console.log(`  ${img.hasPicture ? 'PICTURE' : 'IMG'} src=${shortSrc} alt="${img.alt?.slice(0,40)}" srcset=${img.srcset?.slice(0,30)}`);
  }

  // Pick targets to fail
  const plainImg = allImgs.find(i => !i.hasPicture && i.src);
  const pictImg = allImgs.find(i => i.hasPicture && i.src);
  const targets = [];
  if (plainImg) targets.push({ ...plainImg, type: 'plain' });
  if (pictImg) targets.push({ ...pictImg, type: 'picture' });

  record('images-found-for-intercept', targets.length >= 1,
    `plain=${!!plainImg} picture=${!!pictImg} total=${allImgs.length}`);
  console.log(`Will fail: ${targets.map(t => `${t.type} ${t.src?.replace(baseUrl, '')?.slice(0, 40)}`).join(', ')}`);

  // Track requests
  const reqCounts = new Map();
  page.on('request', r => {
    if (r.resourceType() === 'image') {
      reqCounts.set(r.url(), (reqCounts.get(r.url()) ?? 0) + 1);
    }
  });

  // Route to abort target images
  const failedUrls = new Set();
  await ctx.route('**/*', async route => {
    const url = route.request().url();
    const shouldFail = targets.some(t => {
      try { return url.includes(path.basename(new URL(t.src).pathname)); } catch { return false; }
    });
    if (shouldFail) { failedUrls.add(url); await route.abort('failed'); }
    else await route.continue();
  });

  // Reload to trigger image loads
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Check fallback state for each failed target
  for (const t of targets) {
    const bn = path.basename(new URL(t.src).pathname);
    const state = await page.evaluate(({ b, a }) => {
      for (const img of document.querySelectorAll('img')) {
        if (img.src.includes(b) || (img.alt && img.alt === a)) {
          return {
            hasSrc: img.hasAttribute('src'),
            hasSrcset: img.hasAttribute('srcset'),
            fallback: img.dataset.fallback,
            hasClass: img.classList.contains('img-fallback'),
            alt: img.alt,
            title: img.title,
            picCleared: img.parentElement?.tagName === 'PICTURE'
              ? Array.from(img.parentElement.querySelectorAll('source')).every(s => !s.hasAttribute('srcset'))
              : null
          };
        }
      }
      return null;
    }, { b: bn, a: t.alt });

    console.log(`\n${t.type} (${bn.slice(0,30)}):`, JSON.stringify(state));

    if (state) {
      record(`${t.type}-src-removed`, !state.hasSrc, `src present: ${state.hasSrc}`);
      record(`${t.type}-srcset-removed`, !state.hasSrcset, `srcset present: ${state.hasSrcset}`);
      record(`${t.type}-fallback-class`, state.hasClass, `img-fallback class: ${state.hasClass}`);
      record(`${t.type}-fallback-data`, state.fallback === 'true', `data-fallback: ${state.fallback}`);
      if (t.type === 'picture') {
        record('picture-srcset-neutralized', state.picCleared === true, `srcsets cleared: ${state.picCleared}`);
      }
      record(`${t.type}-alt-preserved`, !!state.alt, `alt: "${(state.alt || '').slice(0, 60)}"`);
      // Title should be set when alt > 2 chars
      if (state.alt && state.alt.trim().length > 2) {
        record(`${t.type}-title-promoted`, state.title === state.alt, `title: "${(state.title || '').slice(0, 60)}"`);
      }
    } else {
      record(`${t.type}-not-found`, false, 'img element not found in DOM');
    }
  }

  // Check no repeated requests for failed URLs
  for (const url of failedUrls) {
    const count = reqCounts.get(url) ?? 0;
    record('no-repeated-failed-requests', count <= 2,
      `${url.replace(baseUrl, '').slice(0, 40)} count: ${count}`);
  }

  // Verify successful images unaffected
  const okImgs = await page.$$eval('img:not([data-fallback])', imgs => imgs.filter(i => i.naturalWidth > 0).length);
  record('successful-images-unaffected', okImgs > 0, `${okImgs} images loaded OK`);

  // ── Cleanup ──
  await browser.close();
  server.close();

  // Write JSON
  const report = { timestamp: new Date().toISOString(), serverPort: port, baseUrl, results };
  fs.writeFileSync(path.join(__dirname, 'browser-integration-results.json'), JSON.stringify(report, null, 2));

  console.log('\n═══ RESULTS ═══');
  for (const r of results) {
    console.log(`  ${r.pass ? '✓ PASS' : '✗ FAIL'}  ${r.id}: ${r.detail}`);
  }
  const fails = results.filter(r => !r.pass);
  console.log(`\nTotal: ${results.length} | Pass: ${results.length - fails.length} | Fail: ${fails.length}`);
  process.exit(fails.length > 0 ? 1 : 0);
})();
