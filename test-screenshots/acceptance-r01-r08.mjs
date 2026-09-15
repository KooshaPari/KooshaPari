import { chromium } from 'playwright';

const BASE = 'https://www.kooshapari.com';
const DIR = '/Users/kooshapari/CodeProjects/Phenotype/repos/koosha-phenotype/test-screenshots';

const results = [];

function log(id, status, msg) {
  results.push({ id, status, msg });
  console.log(`${id}: ${status} - ${msg}`);
}

async function dismissGate(page) {
  await page.evaluate(() => {
    const gate = document.getElementById('construction-gate');
    if (gate) gate.remove();
    document.querySelectorAll('[class*="construction"]').forEach(el => {
      if (el.id === 'construction-gate' || el.className?.includes?.('construction-gate')) el.remove();
    });
    document.body.classList.remove('construction-locked');
    document.body.style.overflow = '';
  });
}

async function getPageText(page) {
  return (await page.textContent('body')) || '';
}

// ─────────────────────────────────────────────
// R01: Provenance visibility on /work/sharecli
// ─────────────────────────────────────────────
async function testR01(page) {
  await page.goto(`${BASE}/work/sharecli`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await dismissGate(page);
  await page.waitForTimeout(500);

  const bodyText = await getPageText(page);
  await page.screenshot({ path: `${DIR}/r01_sharecli.png`, fullPage: true });

  const hasFilename = /github-pass1-after\.md/i.test(bodyText);
  const hasEvidenceLedger = /EVIDENCE_LEDGER/i.test(bodyText);

  // Look for evidence/provenance section
  const evidenceInfo = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    const evidenceHeadings = headings.filter(h =>
      /evidence|provenance|source|citation|reference|materials|docs|files/i.test(h.textContent)
    );
    // Also check for sections with relevant class/id
    const sections = document.querySelectorAll('[class*="evidence"], [class*="provenance"], [class*="source"], [class*="citation"], [id*="evidence"], [id*="provenance"]');
    return {
      headings: evidenceHeadings.map(h => h.textContent.trim()),
      sectionCount: sections.length,
      sectionClasses: Array.from(sections).map(s => s.className).slice(0, 5),
    };
  });

  // Collect all visible labels used for evidence sources
  const labels = await page.evaluate(() => {
    const textNodes = [];
    const walk = (el) => {
      if (el.offsetParent !== null || getComputedStyle(el).display !== 'none') {
        if (el.children.length === 0 && el.textContent.trim()) {
          textNodes.push(el.textContent.trim());
        }
      }
      for (const child of el.children) walk(child);
    };
    walk(document.body);
    return textNodes.filter(t => /evidence|source|provenance|material|citation|file|repo|commit/i.test(t)).slice(0, 20);
  });

  if (hasFilename || hasEvidenceLedger) {
    log('R01', 'FAIL', `Found internal filename or EVIDENCE_LEDGER in visible text. filename=${hasFilename}, EVIDENCE_LEDGER=${hasEvidenceLedger}`);
  } else if (evidenceInfo.headings.length > 0 || evidenceInfo.sectionCount > 0) {
    log('R01', 'PASS', `No internal filenames visible. Evidence section headings: ${JSON.stringify(evidenceInfo.headings)}. Labels found: ${JSON.stringify(labels.slice(0, 5))}`);
  } else {
    log('R01', 'PASS', `No internal filenames or EVIDENCE_LEDGER visible. No dedicated evidence/provenance section found. Page does not expose provenance.`);

  }

  return { bodyText, evidenceInfo, labels };
}

// ─────────────────────────────────────────────
// R02: No-JS fallback on /work/sharecli
// ─────────────────────────────────────────────
async function testR02() {
  const browser = await chromium.launch({ headless: true });

  // No-JS context
  const noJsCtx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const noJsPage = await noJsCtx.newPage();
  await noJsPage.goto(`${BASE}/work/sharecli`, { waitUntil: 'networkidle', timeout: 30000 });
  await noJsPage.screenshot({ path: `${DIR}/r02_nojs.png`, fullPage: true });

  const noscriptInfo = await noJsPage.evaluate(() => {
    const noscript = document.querySelector('noscript');
    return {
      exists: !!noscript,
      content: noscript ? noscript.textContent.trim().substring(0, 500) : null,
      innerHtml: noscript ? noscript.innerHTML.substring(0, 500) : null,
    };
  });

  const noJsText = (await noJsPage.textContent('body')) || '';
  await noJsCtx.close();

  // JS context for comparison
  const jsCtx = await browser.newContext({ javaScriptEnabled: true, viewport: { width: 1440, height: 900 } });
  const jsPage = await jsCtx.newPage();
  await jsPage.goto(`${BASE}/work/sharecli`, { waitUntil: 'networkidle', timeout: 30000 });
  await dismissGate(jsPage);
  const jsText = (await jsPage.textContent('body')) || '';
  await jsCtx.close();
  await browser.close();

  const noJsHasContent = noJsText.length > 50;
  const hasShareCliMention = /sharecli|share.?cli/i.test(noscriptInfo.content || '') || /sharecli|share.?cli/i.test(noJsText);

  if (!noscriptInfo.exists) {
    log('R02', 'FAIL', `No <noscript> element found. Page text length: ${noJsText.length}`);
  } else if (!noscriptInfo.content || noscriptInfo.content.length < 10) {
    log('R02', 'FAIL', `<noscript> exists but has no meaningful content. Content: "${noscriptInfo.content}"`);
  } else {
    log('R02', 'PASS', `<noscript> has meaningful content: "${noscriptInfo.content.substring(0, 120)}..." ShareCLI mentioned: ${hasShareCliMention}. JS page text: ${jsText.length} chars, No-JS page text: ${noJsText.length} chars`);
  }

  return { noscriptInfo, noJsTextLen: noJsText.length, jsTextLen: jsText.length };
}

// ─────────────────────────────────────────────
// R06: Direct-link routes
// ─────────────────────────────────────────────
async function testR06(page) {
  const checks = [];

  // Check /work/sharecli
  await page.goto(`${BASE}/work/sharecli`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await dismissGate(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/r06_sharecli_direct.png` });

  const h1Sharecli = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
  const onSharecli = page.url().includes('/work/sharecli');
  checks.push({ step: 'direct /work/sharecli', h1: h1Sharecli, onRoute: onSharecli });

  // Refresh
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await dismissGate(page);
  const h1AfterRefresh = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
  const onSharecliAfterRefresh = page.url().includes('/work/sharecli');
  checks.push({ step: 'after refresh', h1: h1AfterRefresh, onRoute: onSharecliAfterRefresh });

  // Check /resume
  await page.goto(`${BASE}/resume`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await dismissGate(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/r06_resume_direct.png` });

  const h1Resume = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
  const onResume = page.url().includes('/resume');
  checks.push({ step: 'direct /resume', h1: h1Resume, onRoute: onResume });

  const allPass =
    checks[0].h1?.toLowerCase().includes('sharecli') && checks[0].onRoute &&
    checks[1].h1?.toLowerCase().includes('sharecli') && checks[1].onRoute &&
    checks[2].h1?.toLowerCase().includes('experience') && checks[2].onRoute;

  if (allPass) {
    log('R06', 'PASS', `Direct links work: /work/sharecli h1="${checks[0].h1}", refresh h1="${checks[1].h1}", /resume h1="${checks[2].h1}"`);
  } else {
    log('R06', 'FAIL', `Direct link issue: ${JSON.stringify(checks)}`);
  }

  return checks;
}

// ─────────────────────────────────────────────
// R07: Download links on /work/sharecli
// ─────────────────────────────────────────────
async function testR07(page) {
  await page.goto(`${BASE}/work/sharecli`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await dismissGate(page);
  await page.waitForTimeout(300);

  const downloads = await page.evaluate(() => {
    // Links with download attribute
    const withDownload = Array.from(document.querySelectorAll('a[download]')).map(a => ({
      text: a.textContent.trim().substring(0, 80),
      href: a.href,
      download: a.getAttribute('download'),
    }));
    // Links pointing to .cast files
    const castLinks = Array.from(document.querySelectorAll('a[href$=".cast"]')).map(a => ({
      text: a.textContent.trim().substring(0, 80),
      href: a.href,
    }));
    // Links to .md, .pdf, .zip, etc.
    const docLinks = Array.from(document.querySelectorAll('a[href$=".md"], a[href$=".pdf"], a[href$=".zip"], a[href$=".txt"], a[href$=".json"]')).map(a => ({
      text: a.textContent.trim().substring(0, 80),
      href: a.href,
    }));
    return { withDownload, castLinks, docLinks };
  });

  const total = downloads.withDownload.length + downloads.castLinks.length;

  if (total === 0) {
    log('R07', 'INFO', `No download-attribute links or .cast links found. Document links: ${downloads.docLinks.length}. Doc links: ${JSON.stringify(downloads.docLinks.slice(0, 5))}`);
  } else {
    log('R07', 'PASS', `Found ${downloads.withDownload.length} download-attribute links, ${downloads.castLinks.length} .cast links. URLs: ${JSON.stringify([...downloads.withDownload, ...downloads.castLinks].map(d => d.href).slice(0, 5))}`);
  }

  return downloads;
}

// ─────────────────────────────────────────────
// R08: No internal docs in visible text
// ─────────────────────────────────────────────
async function testR08(page) {
  const routes = [
    { path: '/', name: 'homepage' },
    { path: '/work', name: 'work' },
    { path: '/work/sharecli', name: 'sharecli' },
    { path: '/resume', name: 'resume' },
    { path: '/contact', name: 'contact' },
  ];

  const forbidden = ['EVIDENCE_LEDGER', 'prompt_inventory', 'RESVAULT', '.env', 'SUPABASE_KEY'];
  const findings = [];

  for (const route of routes) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await dismissGate(page);
    await page.waitForTimeout(300);

    const text = await getPageText(page);
    await page.screenshot({ path: `${DIR}/r08_${route.name}.png`, fullPage: false });

    for (const term of forbidden) {
      // Use a regex that handles .env specially (escape the dot)
      const escaped = term.replace(/\./g, '\\.');
      const regex = new RegExp(escaped, 'i');
      if (regex.test(text)) {
        // Find surrounding context
        const idx = text.search(regex);
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + term.length + 40);
        const context = text.substring(start, end).replace(/\n/g, ' ');
        findings.push({ route: route.name, term, context: `...${context}...` });
      }
    }
  }

  if (findings.length === 0) {
    log('R08', 'PASS', `No internal doc terms found across all ${routes.length} routes (EVIDENCE_LEDGER, prompt_inventory, RESVAULT, .env, SUPABASE_KEY)`);
  } else {
    for (const f of findings) {
      log('R08', 'FAIL', `Found "${f.term}" on ${f.route}: ${f.context}`);
    }
  }

  return findings;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function main() {
  console.log('=== Acceptance Tests R01-R08: kooshapari.com ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // Dismiss construction gate on first visit
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await dismissGate(page);
    await page.waitForTimeout(500);

    await testR01(page);
    await testR06(page);
    await testR07(page);
    await testR08(page);
  } catch (err) {
    console.error(`FATAL: ${err.message}`);
  } finally {
    await context.close();
    await browser.close();
  }

  // R02 needs its own browser contexts (JS vs no-JS)
  try {
    await testR02();
  } catch (err) {
    console.error(`R02 FATAL: ${err.message}`);
  }

  // Summary table
  console.log('\n=== SUMMARY ===');
  console.log('ID   | STATUS | MESSAGE');
  console.log('-----|--------|--------');
  for (const r of results) {
    const id = r.id.padEnd(4);
    const status = r.status.padEnd(6);
    const msg = r.msg.length > 100 ? r.msg.substring(0, 97) + '...' : r.msg;
    console.log(`${id} | ${status} | ${msg}`);
  }

  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const info = results.filter(r => r.status === 'INFO').length;
  console.log(`\nTotal: ${results.length} | PASS: ${pass} | FAIL: ${fail} | INFO: ${info}`);
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
