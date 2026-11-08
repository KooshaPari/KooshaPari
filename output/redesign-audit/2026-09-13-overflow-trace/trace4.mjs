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
  await page.waitForTimeout(300);

  // Detailed inspection of the experiment-sheet and its parents
  const details = await page.evaluate(() => {
    const results = [];
    
    // Get all experiment-sheets
    const sheets = document.querySelectorAll('.experiment-sheet');
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      const sheetRect = sheet.getBoundingClientRect();
      const sheetStyle = getComputedStyle(sheet);
      
      // Get parent artifact
      const artifact = sheet.closest('.artifact');
      const artifactRect = artifact ? artifact.getBoundingClientRect() : null;
      const artifactStyle = artifact ? getComputedStyle(artifact) : null;
      
      // Get experiment-row children
      const rows = sheet.querySelectorAll('.experiment-row');
      const rowData = [];
      for (const row of rows) {
        const rowRect = row.getBoundingClientRect();
        const rowStyle = getComputedStyle(row);
        const rowChildren = Array.from(row.children).map(c => ({
          tag: c.tagName,
          text: c.textContent.substring(0, 40),
          rect: { w: Math.round(c.getBoundingClientRect().width), l: Math.round(c.getBoundingClientRect().left) },
          style: {
            gridCol: getComputedStyle(c).gridColumn,
            overflow: getComputedStyle(c).overflow,
            minWidth: getComputedStyle(c).minWidth,
            width: getComputedStyle(c).width,
          }
        }));
        
        rowData.push({
          rect: { w: Math.round(rowRect.width), h: Math.round(rowRect.height), l: Math.round(rowRect.left) },
          style: {
            gridCols: rowStyle.gridTemplateColumns,
            width: rowStyle.width,
            display: rowStyle.display,
            overflow: rowStyle.overflow,
          },
          children: rowChildren,
        });
      }
      
      results.push({
        index: i,
        sheet: {
          rect: { w: Math.round(sheetRect.width), l: Math.round(sheetRect.left) },
          style: {
            display: sheetStyle.display,
            gridCols: sheetStyle.gridTemplateColumns,
            width: sheetStyle.width,
            maxWidth: sheetStyle.maxWidth,
          },
        },
        artifact: artifact ? {
          rect: { w: Math.round(artifactRect.width), l: Math.round(artifactRect.left) },
          style: {
            display: artifactStyle.display,
            gridCols: artifactStyle.gridTemplateColumns,
            padding: artifactStyle.padding,
            width: artifactStyle.width,
            containerType: artifactStyle.containerType,
          },
          className: artifact.className,
        } : null,
        rows: rowData,
      });
    }
    
    // Also check the home-artifact-sequence grid
    const seq = document.querySelector('.home-artifact-sequence');
    if (seq) {
      const seqStyle = getComputedStyle(seq);
      results.push({
        _homeArtifactSequence: true,
        style: {
          display: seqStyle.display,
          gridCols: seqStyle.gridTemplateColumns,
          width: seqStyle.width,
        }
      });
    }
    
    return results;
  });
  
  for (const item of details) {
    if (item._homeArtifactSequence) {
      console.log('\n.home-artifact-sequence:', JSON.stringify(item.style, null, 2));
      continue;
    }
    console.log(`\n--- experiment-sheet #${item.index} ---`);
    console.log('  artifact:', item.artifact?.className);
    console.log('  artifact rect:', item.artifact?.rect);
    console.log('  artifact style:', JSON.stringify(item.artifact?.style, null, 2));
    console.log('  sheet rect:', item.sheet.rect);
    console.log('  sheet style:', JSON.stringify(item.sheet.style, null, 2));
    for (let r = 0; r < item.rows.length; r++) {
      const row = item.rows[r];
      console.log(`  row[${r}]: rect=${JSON.stringify(row.rect)} gridCols=${row.style.gridCols}`);
      for (const c of row.children) {
        console.log(`    child: "${c.text}" rect=${JSON.stringify(c.rect)} gridCol=${c.style.gridCol} overflow=${c.style.overflow}`);
      }
    }
  }
  
  await browser.close();
})();
