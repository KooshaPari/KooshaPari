import { chromium } from 'playwright';

async function auditPage(page, url, label, vpWidth) {
  await page.setViewportSize({ width: vpWidth, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  
  // Dismiss construction gate
  await page.evaluate(() => {
    document.querySelectorAll('.construction-gate, [class*="gate"]').forEach(el => {
      el.style.display = 'none';
    });
  });
  await page.waitForTimeout(300);
  
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  if (scrollW <= vpWidth) {
    console.log(`\n=== ${label} @ ${vpWidth}px === NO OVERFLOW (scrollWidth=${scrollW})`);
    return;
  }
  
  console.log(`\n=== ${label} @ ${vpWidth}px === OVERFLOW scrollWidth=${scrollW}`);
  
  // Dump ALL elements extending past viewport (unfiltered)
  const allOver = await page.evaluate((vpW) => {
    const results = [];
    const walk = (el, depth) => {
      if (depth > 15) return;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      
      const extendsRight = rect.right > vpW + 0.5;
      const extendsLeft = rect.left < -0.5;
      
      if (extendsRight || extendsLeft) {
        // Build CSS selector
        let sel = '';
        if (el.id) sel = '#' + el.id;
        else {
          const p = el.parentElement;
          if (p) {
            const idx = Array.from(p.children).indexOf(el) + 1;
            const tag = el.tagName.toLowerCase();
            const cls = (el.className && typeof el.className === 'string')
              ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
              : '';
            sel = tag + cls + ':nth-child(' + idx + ')';
          } else {
            sel = el.tagName.toLowerCase();
          }
        }
        
        // Walk up to find overflow:hidden container
        let overflowClip = null;
        let parent = el.parentElement;
        while (parent && parent !== document.documentElement) {
          const ps = getComputedStyle(parent);
          if (ps.overflow === 'hidden' || ps.overflowX === 'hidden' || ps.overflowX === 'clip') {
            overflowClip = {
              tag: parent.tagName,
              id: parent.id,
              className: (typeof parent.className === 'string') ? parent.className.substring(0, 80) : '',
              overflowX: ps.overflowX,
              overflow: ps.overflow,
            };
            break;
          }
          parent = parent.parentElement;
        }
        
        results.push({
          depth,
          sel,
          tag: el.tagName,
          id: el.id || '',
          cls: (typeof el.className === 'string') ? el.className.substring(0, 100) : '',
          rect: { right: Math.round(rect.right), left: Math.round(rect.left), width: Math.round(rect.width), top: Math.round(rect.top) },
          computed: {
            position: style.position,
            overflowX: style.overflowX,
            width: style.width,
            maxWidth: style.maxWidth,
            transform: style.transform !== 'none' ? style.transform.substring(0, 80) : 'none',
            marginRight: style.marginRight,
            paddingLeft: style.paddingLeft,
          },
          overflowClip,
        });
      }
      
      for (const child of el.children) {
        walk(child, depth + 1);
      }
    };
    walk(document.documentElement, 0);
    return results;
  }, vpWidth);
  
  // Show non-decorative first
  const nonDeco = allOver.filter(e => e.computed.position !== 'fixed' && e.computed.position !== 'absolute' && e.computed.transform === 'none');
  const deco = allOver.filter(e => !(e.computed.position !== 'fixed' && e.computed.position !== 'absolute' && e.computed.transform === 'none'));
  
  console.log(`  Non-decorative extending elements: ${nonDeco.length}`);
  for (const el of nonDeco.slice(0, 12)) {
    console.log(`    [d=${el.depth}] ${el.sel} (id=${el.id})`);
    console.log(`      rect: right=${el.rect.right} left=${el.rect.left} w=${el.rect.width} top=${el.rect.top}`);
    console.log(`      style: pos=${el.computed.position} overflowX=${el.computed.overflowX} w=${el.computed.width} maxW=${el.computed.maxWidth} marginR=${el.computed.marginRight} padL=${el.computed.paddingLeft}`);
    if (el.overflowClip) {
      console.log(`      PARENT clip: ${el.overflowClip.tag}#${el.overflowClip.id} .${el.overflowClip.className.substring(0,50)} overflow=${el.overflowClip.overflowX}`);
    }
  }
  
  console.log(`  Decorative extending elements: ${deco.length}`);
  for (const el of deco.slice(0, 5)) {
    console.log(`    [d=${el.depth}] ${el.sel} (id=${el.id}) pos=${el.computed.position} transform=${el.computed.transform}`);
    console.log(`      rect: right=${el.rect.right} left=${el.rect.left} w=${el.rect.width} top=${el.rect.top}`);
  }
  
  // Also check html/body overflow settings
  const rootOverflow = await page.evaluate(() => {
    const html = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    return {
      html: { overflow: html.overflow, overflowX: html.overflowX },
      body: { overflow: body.overflow, overflowX: body.overflowX },
    };
  });
  console.log(`  Root overflow: html=${rootOverflow.html.overflowX} body=${rootOverflow.body.overflowX}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const routes = [
    ['http://127.0.0.1:8421/', 'Home'],
    ['http://127.0.0.1:8421/engineering', 'Engineering'],
    ['http://127.0.0.1:8421/product', 'Product'],
  ];
  
  for (const [url, label] of routes) {
    await auditPage(page, url, label, 1440);
  }
  
  await browser.close();
})();
