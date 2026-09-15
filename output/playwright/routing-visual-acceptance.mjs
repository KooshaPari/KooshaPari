import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const dir = 'output/playwright/2026-09-09-routing-visual-acceptance';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const [device, viewport] of [['desktop', {width:1440,height:1000}], ['mobile',{width:390,height:844}]]) {
    const context = await browser.newContext({viewport});
    const page = await context.newPage();
    for (const [name, path] of [['home','/'],['omniroute','/work/omniroute'],['netweave','/work/netweave']]) {
      await page.goto('http://127.0.0.1:58624'+path);
      await page.screenshot({path:`${dir}/${name}-${device}.png`,fullPage:true});
      results.push({name,device,...await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,svg:[...document.querySelectorAll('svg')].map(x=>({namespace:x.namespaceURI,viewBox:x.getAttribute('viewBox')})),animations:document.getAnimations().length}))});
      if(name==='home') {
        const topology=page.locator('[data-topology="omniroute"]');
        await topology.screenshot({path:`${dir}/omniroute-home-topology-${device}.png`});
        results.push({name:'omniroute-home-bounds',device,bounds:await topology.evaluate(s=>[...s.querySelectorAll('[data-node]')].map(g=>{const t=g.querySelector('text').getBBox(),r=g.querySelector('rect').getBBox();return {id:g.dataset.node,label:[t.x,t.y,t.width,t.height],rect:[r.x,r.y,r.width,r.height]};}))});
      }
      if(name==='netweave') {
        await page.getByRole('tab',{name:'Overview',exact:true}).focus();
        for(let press=1;press<=2;press++) {
          await page.keyboard.press('ArrowRight');
          results.push({name:'netweave-keyboard',device,press,focus:await page.evaluate(()=>({tag:document.activeElement.tagName,role:document.activeElement.getAttribute('role'),text:document.activeElement.textContent.slice(0,60)})),selected:await page.locator('[role="tab"][aria-selected="true"]').textContent()});
        }
        const group=page.getByRole('group',{name:'Illustrative traffic states',exact:true});
        await group.getByRole('button',{name:'Approach',exact:true}).click();
        await page.keyboard.press('ArrowRight');
        results.push({name:'netweave-state-arrow',device,selected:await page.locator('[role="tab"][aria-selected="true"]').textContent(),focusTag:await page.evaluate(()=>document.activeElement.tagName)});
        await page.locator('.netweave-field-figure').screenshot({path:`${dir}/netweave-approach-${device}.png`});
        results.push({name:'netweave-controls',device,count:await group.count(),oldGeneric:await page.getByRole('button',{name:/^State [123]$/}).count(),pressed:await group.getByRole('button',{name:'Approach',exact:true}).getAttribute('aria-pressed'),image:await page.locator('.netweave-specimen img').evaluate(i=>i.currentSrc),text:await page.locator('.netweave-specimen [aria-live]').textContent()});
      }
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(()=>localStorage.clear());
    await page.reload();
    await page.screenshot({path:`${dir}/netweave-reduced-reader-${device}.png`,fullPage:true});
    results.push({name:'reduced-reader',device,reader:await page.locator('html').getAttribute('data-reader')});
    await context.close();
  }
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:58624/work/netweave');
  await page.screenshot({path:`${dir}/netweave-nojs-mobile.png`,fullPage:true});
  results.push({name:'netweave-nojs',buttons:await page.locator('button').count(),images:await page.locator('img').count(),text:await page.locator('main').innerText()});
  await writeFile(`${dir}/observations.json`,JSON.stringify(results,null,2));
  console.log(JSON.stringify(results.filter(x=>x.name!=='netweave-nojs'),null,2));
  await context.close();
} finally { await browser.close(); }
