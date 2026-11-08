import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Test at 390px with fix applied
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8421/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelectorAll('.construction-gate, [class*="gate"]').forEach(el => el.style.display = 'none');
  });
  await page.waitForTimeout(300);
  
  const before390 = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    vpW: window.innerWidth,
  }));
  console.log(`Home @390px before fix: scrollW=${before390.scrollW} vpW=${before390.vpW}`);
  
  // Apply fix
  await page.addStyleTag({
    content: `@container (max-width: 680px) { .experiment-row { min-width: 0; overflow: hidden; } }`
  });
  await page.waitForTimeout(200);
  
  const after390 = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    vpW: window.innerWidth,
  }));
  console.log(`Home @390px after fix:  scrollW=${after390.scrollW} vpW=${after390.vpW}`);
  
  // Check experiment-row rendering at 390px with fix
  const rowCheck = await page.evaluate(() => {
    const rows = document.querySelectorAll('.experiment-row');
    if (!rows.length) return 'no rows';
    const first = rows[0];
    const style = getComputedStyle(first);
    const rect = first.getBoundingClientRect();
    return {
      gridCols: style.gridTemplateColumns,
      width: Math.round(rect.width),
      display: style.display,
    };
  });
  console.log(`  experiment-row at 390px with fix:`, JSON.stringify(rowCheck));
  
  // Also verify no visual regression at 1440px with fix
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:8421/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelectorAll('.construction-gate, [class*="gate"]').forEach(el => el.style.display = 'none');
  });
  
  await page.addStyleTag({
    content: `@container (max-width: 680px) { .experiment-row { min-width: 0; overflow: hidden; } }`
  });
  await page.waitForTimeout(200);
  
  const afterFix1440 = await page.evaluate(() => {
    const scrollW = document.documentElement.scrollWidth;
    const vpW = window.innerWidth;
    // Check experiment-row rendering
    const rows = document.querySelectorAll('.experiment-row');
    const firstRow = rows[0];
    const rowStyle = getComputedStyle(firstRow);
    const rowRect = firstRow.getBoundingClientRect();
    return {
      scrollW, vpW,
      rowWidth: Math.round(rowRect.width),
      rowGridCols: rowStyle.gridTemplateColumns,
      overflow: rowStyle.overflow,
    };
  });
  console.log(`\nHome @1440px with fix: scrollW=${afterFix1440.scrollW} vpW=${afterFix1440.vpW}`);
  console.log(`  row width=${afterFix1440.rowWidth} gridCols=${afterFix1440.rowGridCols} overflow=${afterFix1440.overflow}`);
  
  await browser.close();
})();
