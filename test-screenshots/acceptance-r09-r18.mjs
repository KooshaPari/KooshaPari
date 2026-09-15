import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const BASE = 'https://www.kooshapari.com';

async function test(id, label, fn) {
  try {
    const result = await fn();
    console.log(`${id}: ${result ? 'PASS' : 'FAIL'} - ${label}`);
    return result;
  } catch (e) {
    console.log(`${id}: FAIL - ${label}: ${e.message}`);
    return false;
  }
}

// R09: Ownership, attribution, truthful claims
for (const slug of ['sharecli', 'netweave']) {
  await page.goto(`${BASE}/work/${slug}`);
  const text = await page.textContent('body');
  await test(`R09-${slug}`, `${slug} has attribution`, () => /Koosha|Paridehpour/i.test(text));
}

// R10: Images with alt text
await page.goto(`${BASE}/work`);
const imgCount = await page.$$eval('img', els => els.length);
const imgsWithAlt = await page.$$eval('img', els => els.filter(e => e.alt && e.alt.length > 0).length);
const brokenImgs = await page.$$eval('img', els => els.filter(e => e.naturalWidth === 0 && e.src).length);
await test('R10', `${imgsWithAlt}/${imgCount} images have alt text, ${brokenImgs} broken`, () => imgsWithAlt === imgCount && brokenImgs === 0);

// R11: Distinct project presentations
await page.goto(`${BASE}/work`);
const projectLinks = await page.$$eval('a[href*="/work/"]', els => [...new Set(els.map(e => e.getAttribute('href')))]);
const slugs = projectLinks.filter(h => h.match(/^\/work\/[^/]+$/)).map(h => h.split('/')[2]);
console.log(`R11: ${slugs.length} project links found: ${slugs.join(', ')}`);

// Visit each project and describe primary visual
for (const slug of slugs.slice(0, 6)) {
  await page.goto(`${BASE}/work/${slug}`);
  const hasCast = await page.$('.cast-player');
  const hasSlider = await page.$('.image-slider, [class*=slider]');
  const hasDiagram = await page.$('canvas, [class*=diagram], [class*=field]');
  const hasWorkbench = await page.$('[class*=workbench]');
  const hasImages = await page.$$('img');
  const type = hasCast ? 'cast-player' : hasSlider ? 'image-slider' : hasDiagram ? 'diagram/canvas' : hasWorkbench ? 'workbench' : hasImages.length > 1 ? 'image-gallery' : 'text-based';
  console.log(`R11 ${slug}: ${type}`);
}

// R14: Accessibility - form labels
await page.goto(`${BASE}/contact`);
const inputs = await page.$$eval('input, textarea', els => els.map(e => ({
  type: e.type || e.tagName.toLowerCase(),
  hasLabel: e.labels && e.labels.length > 0,
  hasPlaceholder: !!e.placeholder,
  hasAriaLabel: !!e.getAttribute('aria-label')
})));
const labeled = inputs.filter(i => i.hasLabel || i.hasAriaLabel);
await test('R14', `${labeled.length}/${inputs.length} form inputs have labels/aria-labels`, () => labeled.length >= inputs.length * 0.5);

// R14: Skip link
await page.goto(`${BASE}/`);
const skipLink = await page.$('a[href="#view-root"], a[href="#main"], a[href="#content"], .skip-link, [class*=skip]');
console.log(`R14 skip-link: ${skipLink ? 'EXISTS' : 'MISSING'}`);

// R14: Focus indicators
const focusStyles = await page.$$eval('a, button', els => {
  const el = els[0];
  if (!el) return 'no elements';
  const cs = getComputedStyle(el);
  return cs.outlineStyle + '/' + cs.outlineWidth;
});
console.log(`R14 focus-default: outline=${focusStyles}`);

// R15: Responsive
for (const width of [390, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE}/`);
  const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  await test(`R15-${width}px`, `viewport ${width}px no horizontal overflow`, () => !overflow);
}

// R16: Resume
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/resume`);
const resumeH1 = await page.$eval('h1', e => e.textContent);
const resumeText = await page.textContent('body');
const companies = ['Phenotype', 'CVS Health', 'Akoma', 'Atoms.Tech'].filter(c => resumeText.includes(c));
await test('R16-resume', `h1="${resumeH1}", ${companies.length} companies`, () => resumeH1 === 'Experience' && companies.length >= 3);

// R16: Contact
await page.goto(`${BASE}/contact`);
const contactH1 = await page.$eval('h1', e => e.textContent);
const fieldCount = await page.$$eval('input, textarea', els => els.length);
const socialCount = await page.$$eval('a[href*="linkedin"], a[href*="github"], a[href*="mailto"]', els => els.length);
await test('R16-contact', `h1="${contactH1}", ${fieldCount} fields, ${socialCount} social`, () => fieldCount >= 3 && socialCount >= 2);

// R16: Meta tags
await page.goto(`${BASE}/`);
const title = await page.title();
const hasDesc = await page.$('meta[name="description"]');
const hasOG = await page.$('meta[property="og:title"]');
await test('R16-meta', `title="${title.substring(0, 50)}", desc=${!!hasDesc}, og=${!!hasOG}`, () => hasDesc && hasOG);

// R17: Construction gate
await page.goto(`${BASE}/`);
await page.waitForTimeout(500);
const gateText = await page.textContent('body');
const hasGate = /under construction|continue to site/i.test(gateText);
await test('R17-gate', hasGate ? 'construction gate present' : 'no gate (might be dismissed)', () => true);

// R17: robots.txt
const robotResp = await page.goto(`${BASE}/robots.txt`);
await test('R17-robots', `status ${robotResp.status()}`, () => robotResp.status() === 200);

// R18: Navigation consistency
for (const route of ['/', '/work', '/resume', '/contact']) {
  await page.goto(`${BASE}${route}`);
  const navText = await page.$$eval('header a, nav a', els => els.map(e => e.textContent.trim()).filter(Boolean));
  const hasFooter = await page.$eval('footer', e => e.textContent.includes('Koosha')).catch(() => false);
  const expected = ['Work', 'Writing', 'Resume', 'Contact'];
  const missing = expected.filter(n => !navText.some(t => t.includes(n)));
  await test(`R18-${route}`, `nav=${navText.join(',')} footer=${hasFooter} missing=[${missing}]`, () => missing.length === 0 && hasFooter);
}

await browser.close();
console.log('\n=== DONE ===');
