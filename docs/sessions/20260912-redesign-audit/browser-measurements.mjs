import { chromium } from '../../../node_modules/playwright/index.mjs';
import AxeBuilder from '../../../node_modules/@axe-core/playwright/dist/index.mjs';
import { PROJECTS } from '../../../data/projects.js';
import { POSTS } from '../../../data/posts.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const out = 'output/playwright/redesign-audit';
await mkdir(out, { recursive: true });
let server;
try { await fetch('http://127.0.0.1:4197/'); } catch {
  server = spawn(process.execPath, ['scripts/preview-server.js']);
  for (let i = 0; i < 50; i++) {
    try { await fetch('http://127.0.0.1:4197/'); break; } catch { await new Promise(r => setTimeout(r, 100)); }
  }
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
async function visit(path) {
  await page.goto(`http://127.0.0.1:4197${path}`, { waitUntil: 'networkidle' });
  const gate = page.locator('#construction-gate');
  if (await gate.isVisible()) await page.locator('#construction-continue').click();
}
const paths = ['/', '/engineering', '/product', '/work', '/resume', '/contact', '/blog', ...PROJECTS.map(p => `/work/${p.slug}`), ...POSTS.map(p => `/blog/${p.slug}`), '/not-a-real-route'];
const rows = [];
const selected = ['/', '/work', '/work/sharecli', '/work/omniroute', '/work/netweave', '/work/substrate', '/work/phenotype-omlx', '/work/gmk-arch', '/work/witf', '/resume', '/contact', '/blog'];
try {
  for (const width of [390, 760, 1080, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of paths) {
      errors.length = 0;
      await visit(path);
      const row = await page.evaluate(() => {
        const box = e => { const r = e.getBoundingClientRect(); return { x:r.x,y:r.y,w:r.width,h:r.height }; };
        return {
          heading: document.querySelector('main h1')?.textContent,
          styles: [...document.styleSheets].map(s => s.href),
          overflow: [...document.querySelectorAll('main *')].filter(e => { const r=e.getBoundingClientRect(); return r.width>0 && (r.right>innerWidth+1 || r.left < -1); }).slice(0,15).map(e => ({ tag:e.tagName, class:String(e.className), ...box(e) })),
          hero:[...document.querySelectorAll('.hero-plate > *')].map(e => ({class:e.className,...box(e)})),
          placeholders: document.querySelectorAll('.hero-plate__placeholder').length,
          svg:[...document.querySelectorAll('main svg')].map(e=>({namespace:e.namespaceURI,...box(e)})),
          bodyWidth:document.documentElement.scrollWidth,
          lens:document.documentElement.dataset.lens,
        };
      });
      rows.push({ path, width, ...row, errors:[...errors] });
      if ([390,1440].includes(width) && selected.includes(path)) {
        await page.screenshot({ path:`${out}/${path.replaceAll('/','_') || 'home'}-${width}.png` });
      }
    }
    console.log(`Completed ${width}: ${paths.length} routes`);
  }
  const axe = [];
  for (const width of [390,1440]) {
    await page.setViewportSize({width,height:1000});
    for (const path of selected) {
      await visit(path);
      const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      axe.push({path,width,violations:result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    }
  }
  await page.setViewportSize({width:1440,height:1000});
  await visit('/');
  await page.locator('nav[aria-label="Primary navigation"] a[href="/work"]').click();
  const spaWork = await page.evaluate(()=>({styles:[...document.styleSheets].map(s=>s.href),display:getComputedStyle(document.querySelector('.work-catalog__featured-list')).display}));
  await page.screenshot({path:`${out}/spa-work-1440.png`});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.work-catalog__featured-project').first().hover();
  const reducedHover = await page.locator('.work-catalog__featured-image img').first().evaluate(e=>({transform:getComputedStyle(e).transform,transition:getComputedStyle(e).transition}));
  await visit('/work/sharecli');
  const buttons = page.locator('.sharecli-workbench__controls button');
  await buttons.nth(1).focus();
  await page.keyboard.press('Enter');
  const focusAfter = await page.evaluate(()=>({tag:document.activeElement.tagName,class:document.activeElement.className,text:document.activeElement.textContent.slice(0,100)}));
  await writeFile(`${out}/measurements.json`, JSON.stringify({browser:browser.version(),paths,rows,axe,spaWork,reducedHover,focusAfter},null,2));
  console.log(JSON.stringify({routes:paths.length,rows:rows.length,overflowRows:rows.filter(r=>r.overflow.length).length,axeRuns:axe.length,axeFailures:axe.filter(r=>r.violations.length).length,spaWork,reducedHover,focusAfter},null,2));
} finally { await browser.close(); server?.kill(); }
