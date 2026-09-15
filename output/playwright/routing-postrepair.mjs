import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
const dir='output/playwright/2026-09-09-postrepair-final';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const observations=[];
try {
for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
 const context=await browser.newContext({viewport}); const page=await context.newPage();
 for(const [name,path] of [['home','/'],['omniroute','/work/omniroute'],['netweave','/work/netweave']]) {
  await page.goto('http://127.0.0.1:62592'+path);
  observations.push({name,device,...await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,readers:[...document.querySelectorAll('.case-diagram-reader,[data-topology-reader]')].map(n=>({visible:n.getBoundingClientRect().height>0,font:getComputedStyle(n).fontSize,text:n.textContent.slice(0,160)})),svg:[...document.querySelectorAll('svg')].map(n=>({width:n.getBoundingClientRect().width,labels:[...n.querySelectorAll('text')].map(t=>({text:t.textContent,pixelHeight:t.getBoundingClientRect().height}))}))}))});
  await page.screenshot({path:`${dir}/${name}-${device}.png`,fullPage:true});
  if(name==='home'&&device==='desktop') await page.locator('[data-artifact="omniroute"]').screenshot({path:`${dir}/omniroute-home-desktop.png`});
  if(name==='netweave') {
   await page.getByRole('tab',{name:'Overview',exact:true}).focus();
   for(let count=1;count<=2;count++) {await page.keyboard.press('ArrowRight');observations.push({name:'tab-arrow',device,count,...await page.evaluate(()=>({focus:document.activeElement.textContent,role:document.activeElement.getAttribute('role'),selected:document.querySelector('[role="tab"][aria-selected="true"]').textContent}))});}
   await page.getByRole('button',{name:'Approach',exact:true}).click(); await page.keyboard.press('ArrowRight');
   observations.push({name:'state-arrow',device,selected:await page.locator('[role="tab"][aria-selected="true"]').textContent(),image:await page.locator('.netweave-specimen img').getAttribute('src')});
   await page.getByRole('button',{name:'Reset',exact:true}).click();
   observations.push({name:'reset',device,selected:await page.locator('[role="tab"][aria-selected="true"]').textContent(),image:await page.locator('.netweave-specimen img').getAttribute('src')});
   await page.locator('.case-diagram').screenshot({path:`${dir}/netweave-diagram-${device}.png`});
  }
 }
 await context.close();
}
await writeFile(`${dir}/observations.json`,JSON.stringify(observations,null,2));
console.log(JSON.stringify(observations));
}finally{await browser.close();}
