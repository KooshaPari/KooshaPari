import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  // Product page
  await page.goto('http://127.0.0.1:8421/product', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelectorAll('.construction-gate, [class*="gate"]').forEach(el => el.style.display = 'none');
  });
  await page.waitForTimeout(300);

  const prod = await page.evaluate(() => {
    const sheets = document.querySelectorAll('.experiment-sheet');
    const results = [];
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      const sheetRect = sheet.getBoundingClientRect();
      const sheetStyle = getComputedStyle(sheet);
      const artifact = sheet.closest('.artifact');
      const artifactRect = artifact?.getBoundingClientRect();
      const artifactStyle = artifact ? getComputedStyle(artifact) : null;
      
      const rows = sheet.querySelectorAll('.experiment-row');
      const rowData = [];
      for (const row of rows) {
        const rowRect = row.getBoundingClientRect();
        const rowStyle = getComputedStyle(row);
        rowData.push({
          rect: { w: Math.round(rowRect.width), l: Math.round(rowRect.left) },
          gridCols: rowStyle.gridTemplateColumns,
          contentWidth: row.scrollWidth,
        });
      }
      
      results.push({
        index: i,
        artifactClass: artifact?.className,
        artifactW: artifactRect ? Math.round(artifactRect.width) : null,
        sheetW: Math.round(sheetRect.width),
        sheetGridCols: sheetStyle.gridTemplateColumns,
        rows: rowData,
      });
    }
    return results;
  });
  
  console.log('=== Product @ 1440px ===');
  for (const item of prod) {
    console.log(`\n  sheet #${item.index}: artifact=${item.artifactClass} artifactW=${item.artifactW} sheetW=${item.sheetW}`);
    console.log(`  sheet gridCols: ${item.sheetGridCols}`);
    for (let r = 0; r < item.rows.length; r++) {
      const row = item.rows[r];
      console.log(`  row[${r}]: w=${row.rect.w} contentW=${row.contentWidth} gridCols=${row.gridCols}`);
    }
  }
  
  // Now test the fix hypothesis: add min-width:0 to experiment-row inside container query
  // First, let's inject the fix and re-test
  await page.addStyleTag({
    content: `@container (max-width: 680px) {
      .experiment-row { min-width: 0; overflow: hidden; }
    }`
  });
  await page.waitForTimeout(200);
  
  const fixResult = await page.evaluate(() => {
    const scrollW = document.documentElement.scrollWidth;
    const vpW = window.innerWidth;
    const sheets = document.querySelectorAll('.experiment-sheet');
    let anyOverflow = false;
    for (const sheet of sheets) {
      if (sheet.scrollWidth > sheet.clientWidth + 1) anyOverflow = true;
    }
    return { scrollW, vpW, anyOverflow };
  });
  
  console.log(`\n  After injecting min-width:0 fix: scrollWidth=${fixResult.scrollW} viewport=${fixResult.vpW} sheetOverflow=${fixResult.anyOverflow}`);
  
  // Now test on home page too
  await page.goto('http://127.0.0.1:8421/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelectorAll('.construction-gate, [class*="gate"]').forEach(el => el.style.display = 'none');
  });
  await page.waitForTimeout(300);
  
  // Apply fix
  await page.addStyleTag({
    content: `@container (max-width: 680px) {
      .experiment-row { min-width: 0; overflow: hidden; }
    }`
  });
  await page.waitForTimeout(200);
  
  const homeFix = await page.evaluate(() => {
    return {
      scrollW: document.documentElement.scrollWidth,
      vpW: window.innerWidth,
    };
  });
  console.log(`\n  Home after fix: scrollWidth=${homeFix.scrollW} viewport=${homeFix.vpW}`);
  
  // Also test without overflow:hidden, just min-width:0
  await page.addStyleTag({
    content: `@container (max-width: 680px) {
      .experiment-row { min-width: 0 !important; }
      .experiment-row p { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    }`
  });
  await page.waitForTimeout(200);
  
  const homeFix2 = await page.evaluate(() => {
    return {
      scrollW: document.documentElement.scrollWidth,
      vpW: window.innerWidth,
    };
  });
  console.log(`  Home after min-width:0+ellipsis fix: scrollWidth=${homeFix2.scrollW} viewport=${homeFix2.vpW}`);
  
  await browser.close();
})();
