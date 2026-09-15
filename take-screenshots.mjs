import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';

const SCREENSHOT_DIR = 'docs/qa-screenshots';

const pages = [
  { name: 'homepage', url: 'https://www.kooshapari.com/#/' },
  { name: 'projects', url: 'https://www.kooshapari.com/#/projects' },
  { name: 'sharecli', url: 'https://www.kooshapari.com/#/projects/sharecli' },
  { name: 'netweave', url: 'https://www.kooshapari.com/#/projects/netweave' },
  { name: 'emrvis', url: 'https://www.kooshapari.com/#/projects/emrvis' },
  { name: 'resume', url: 'https://www.kooshapari.com/#/resume' },
  { name: 'contact', url: 'https://www.kooshapari.com/#/contact' },
];

async function takeScreenshots() {
  // Ensure output directory exists
  if (!existsSync(SCREENSHOT_DIR)) {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const results = [];

  for (const page of pages) {
    console.log(`📸 Screenshotting: ${page.name} - ${page.url}`);
    const tab = await context.newPage();

    try {
      await tab.goto(page.url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait additional 2 seconds for animations/renders
      await tab.waitForTimeout(2000);

      // Scroll to bottom and back to trigger lazy loading
      await tab.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 300;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 50);
        });
      });

      // Wait for any lazy-loaded content
      await tab.waitForTimeout(1000);

      // Take full-page screenshot
      const screenshotPath = `${SCREENSHOT_DIR}/${page.name}.png`;
      await tab.screenshot({ path: screenshotPath, fullPage: true });

      // Get page title and basic info
      const title = await tab.title();
      const bodyHeight = await tab.evaluate(() => document.body.scrollHeight);
      const hasContent = await tab.evaluate(() => document.body.innerText.trim().length > 0);

      results.push({
        name: page.name,
        url: page.url,
        path: screenshotPath,
        title,
        bodyHeight,
        hasContent,
        success: true,
      });

      console.log(`  ✅ ${page.name}: title="${title}", height=${bodyHeight}px`);
    } catch (error) {
      results.push({
        name: page.name,
        url: page.url,
        success: false,
        error: error.message,
      });
      console.log(`  ❌ ${page.name}: ${error.message}`);
    } finally {
      await tab.close();
    }
  }

  await browser.close();

  // Write results JSON for analysis
  const { writeFileSync } = await import('fs');
  writeFileSync(`${SCREENSHOT_DIR}/results.json`, JSON.stringify(results, null, 2));

  console.log(`\n📊 Results saved to ${SCREENSHOT_DIR}/results.json`);
  console.log(`📸 ${results.filter(r => r.success).length}/${results.length} screenshots taken successfully`);

  return results;
}

takeScreenshots().catch(console.error);
