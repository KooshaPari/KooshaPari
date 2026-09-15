import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir=fileURLToPath(new URL('.',import.meta.url));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage();
for (const role of ['swe','pm','tpm','universal']) {
await page.goto('file://'+resolve(dir,role+'.html'));
await page.pdf({path:resolve(dir,role+'.pdf'),format:'Letter',printBackground:true,preferCSSPageSize:true});
}
await browser.close();
