import { chromium } from 'playwright';

const RESULTS = [];

async function auditPage(page, url, label, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  
  // Wait for construction gate dismissal
  await page.waitForTimeout(1500);
  
  // Try to dismiss construction gate if present
  const gate = await page.$('.construction-gate, [class*="gate"], [id*="gate"]');
  if (gate) {
    const visible = await gate.isVisible();
    if (visible) {
      // Try clicking dismiss/close
      const dismissBtn = await gate.$('button, .close, [class*="close"], [class*="dismiss"]');
      if (dismissBtn) {
        await dismissBtn.click().catch(() => {});
        await page.waitForTimeout(500);
      }
    }
  }
  
  // Also try closing any overlay/modal
  await page.evaluate(() => {
    document.querySelectorAll('.construction-gate, [class*="gate"]').forEach(el => {
      el.style.display = 'none';
    });
  });
  
  await page.waitForTimeout(300);
  
  // Check scrollWidth vs viewport
  const scrollMetrics = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    const viewportWidth = window.innerWidth;
    return { docWidth, bodyWidth, clientWidth, viewportWidth };
  });
  
  const hasOverflow = scrollMetrics.docWidth > scrollMetrics.viewportWidth;
  
  if (!hasOverflow) {
    return { url, label, viewport: viewport.width, hasOverflow: false, metrics: scrollMetrics, elements: [] };
  }
  
  // Find elements that cause horizontal overflow
  const overflowElements = await page.evaluate((vpWidth) => {
    const results = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      
      // Skip hidden elements
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
      
      // Check if element extends past viewport
      const extendsRight = rect.right > vpWidth + 1; // 1px tolerance
      const extendsLeft = rect.left < -1;
      
      if (extendsRight || extendsLeft) {
        // Get selector
        let selector = '';
        if (el.id) {
          selector = '#' + el.id;
        } else {
          const parent = el.parentElement;
          const index = parent ? Array.from(parent.children).indexOf(el) + 1 : 1;
          const tag = el.tagName.toLowerCase();
          const cls = el.className && typeof el.className === 'string' 
            ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') 
            : '';
          selector = (parent && parent.id ? '#' + parent.id + ' > ' : '') + tag + cls + ':nth-child(' + index + ')';
        }
        
        // Check if it's a positioned/transformed element that could be decorative offscreen
        const isDecorative = (
          style.position === 'fixed' || 
          style.position === 'absolute' ||
          style.transform !== 'none' ||
          el.hasAttribute('aria-hidden')
        );
        
        results.push({
          selector,
          tag: el.tagName,
          className: typeof el.className === 'string' ? el.className.substring(0, 120) : '',
          id: el.id || '',
          rect: { 
            top: Math.round(rect.top), 
            right: Math.round(rect.right), 
            bottom: Math.round(rect.bottom), 
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          computedStyle: {
            position: style.position,
            display: style.display,
            overflow: style.overflow,
            overflowX: style.overflowX,
            width: style.width,
            maxWidth: style.maxWidth,
            left: style.left,
            right: style.right,
            transform: style.transform.substring(0, 100),
            boxSizing: style.boxSizing,
            margin: style.margin,
            padding: style.padding,
            marginRight: style.marginRight,
            marginLeft: style.marginLeft,
            paddingRight: style.paddingRight,
            paddingLeft: style.paddingLeft,
          },
          isDecorative,
          extendsRight: rect.right > vpWidth + 1,
          extendsLeft: rect.left < -1,
          overflowX: el.parentElement ? getComputedStyle(el.parentElement).overflowX : '',
        });
      }
    }
    
    // Sort: non-decorative first, then by how far they extend
    results.sort((a, b) => {
      if (a.isDecorative !== b.isDecorative) return a.isDecorative ? 1 : -1;
      return b.rect.right - a.rect.right;
    });
    
    return results;
  }, scrollMetrics.viewportWidth);
  
  return { url, label, viewport: viewport.width, hasOverflow: true, metrics: scrollMetrics, elements: overflowElements };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const routes = [
    { url: 'http://127.0.0.1:8421/', label: 'Home (index)' },
    { url: 'http://127.0.0.1:8421/engineering', label: 'Engineering' },
    { url: 'http://127.0.0.1:8421/product', label: 'Product' },
  ];
  
  const viewports = [
    { width: 1440, height: 900, label: 'desktop' },
    { width: 390, height: 844, label: 'mobile' },
  ];
  
  for (const route of routes) {
    for (const vp of viewports) {
      const result = await auditPage(page, route.url, route.label, vp);
      RESULTS.push(result);
      console.log(`\n=== ${route.label} @ ${vp.width}px ===`);
      console.log(`  scrollWidth: ${result.metrics.docWidth}, viewport: ${result.metrics.viewportWidth}`);
      console.log(`  overflow: ${result.hasOverflow}`);
      if (result.hasOverflow) {
        console.log(`  overflow elements: ${result.elements.length}`);
        // Show first 5 non-decorative elements
        const nonDeco = result.elements.filter(e => !e.isDecorative);
        for (const el of nonDeco.slice(0, 8)) {
          console.log(`    ${el.tag}#${el.id || '(none)'} .${el.className.substring(0,60)}`);
          console.log(`      rect: right=${el.rect.right} left=${el.rect.left} width=${el.rect.width}`);
          console.log(`      computed: w=${el.computedStyle.width} maxW=${el.computedStyle.maxWidth} overflow=${el.computedStyle.overflowX} pos=${el.computedStyle.position}`);
          console.log(`      margin: ${el.computedStyle.margin}  padding: ${el.computedStyle.padding}`);
          console.log(`      extendsRight=${el.extendsRight} extendsLeft=${el.extendsLeft}`);
        }
        if (nonDeco.length === 0) {
          console.log('    (all overflow elements are decorative/fixed-positioned)');
        }
      }
    }
  }
  
  // Write JSON results
  const fs = await import('fs');
  fs.writeFileSync('/Users/<REDACTED>/CodeProjects/Phenotype/repos/worktrees/<REDACTED>-public-sync-20260909/output/redesign-audit/2026-09-13-overflow-trace/results.json', JSON.stringify(RESULTS, null, 2));
  
  await browser.close();
})();
