import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:8421/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelectorAll('.construction-gate, [class*="gate"]').forEach(el => el.style.display = 'none');
  });
  await page.waitForTimeout  (300);

  // Approach: binary search for which element is wider than viewport
  // Check every element's scrollWidth, clientWidth, offsetWidth
  const analysis = await page.evaluate(() => {
    const vpW = window.innerWidth;
    const results = [];
    
    // Check document level
    results.push({
      level: 'document',
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      offsetWidth: document.documentElement.offsetWidth,
      bodyScrollWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      bodyOffsetWidth: document.body.offsetWidth,
    });
    
    // Walk the tree and find any element whose scrollWidth > its clientWidth
    const walk = (el, depth, path) => {
      if (depth > 20) return;
      if (el.nodeType !== 1) return;
      
      const sw = el.scrollWidth;
      const cw = el.clientWidth;
      const ow = el.offsetWidth;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      
      if (sw > cw + 1 && el !== document.documentElement) {
        let sel = el.tagName.toLowerCase();
        if (el.id) sel = '#' + el.id;
        else if (el.className && typeof el.className === 'string') {
          sel += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
        }
        
        results.push({
          level: depth,
          path: path,
          sel,
          id: el.id || '',
          scrollWidth: sw,
          clientWidth: cw,
          offsetWidth: ow,
          rectRight: Math.round(rect.right),
          rectLeft: Math.round(rect.left),
          overflowX: style.overflowX,
          overflow: style.overflow,
          position: style.position,
          maxWidth: style.maxWidth,
          width: style.width,
          display: style.display,
        });
      }
      
      for (const child of el.children) {
        const childPath = path + ' > ' + (child.id ? '#'+child.id : child.tagName.toLowerCase() + (child.className && typeof child.className === 'string' ? '.' + child.className.trim().split(/\s+/)[0] : ''));
        walk(child, depth + 1, childPath);
      }
    };
    
    walk(document.documentElement, 0, 'html');
    return results;
  });
  
  console.log('=== Home @ 1440px: scrollWidth analysis ===');
  for (const item of analysis) {
    console.log(JSON.stringify(item));
  }
  
  // Now do the same for engineering and product
  for (const route of ['/engineering', '/product']) {
    await page.goto('http://127.0.0.1:8421' + route, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      document.querySelectorAll('.construction-gate, [class*="gate"]').forEach(el => el.style.display = 'none');
    });
    await page.waitForTimeout(300);
    
    const r = await page.evaluate(() => {
      const vpW = window.innerWidth;
      const results = [];
      results.push({
        level: 'document',
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
      });
      
      const walk = (el, depth) => {
        if (depth > 20 || el.nodeType !== 1) return;
        const sw = el.scrollWidth;
        const cw = el.clientWidth;
        if (sw > cw + 1 && el !== document.documentElement) {
          let sel = el.tagName.toLowerCase();
          if (el.id) sel = '#' + el.id;
          else if (el.className && typeof el.className === 'string')
            sel += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
          results.push({
            level: depth,
            sel,
            id: el.id || '',
            scrollWidth: sw,
            clientWidth: cw,
            overflowX: getComputedStyle(el).overflowX,
            position: getComputedStyle(el).position,
          });
        }
        for (const child of el.children) walk(child, depth + 1);
      };
      walk(document.documentElement, 0);
      return results;
    });
    
    console.log(`\n=== ${route} @ 1440px ===`);
    for (const item of r) console.log(JSON.stringify(item));
  }
  
  await browser.close();
})();
