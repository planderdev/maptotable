import {chromium,webkit} from 'playwright';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const results=[];
const waitOpen=page=>page.waitForFunction(()=>{
  const button=document.querySelector('[data-menu-close]'),lines=[...button.querySelectorAll('line')];
  return button.classList.contains('is-expanded')&&getComputedStyle(lines[0]).opacity==='0'&&lines.every(line=>line.getAnimations().every(animation=>animation.playState!=='running'));
});
const waitClosed=page=>page.waitForFunction(()=>!document.querySelector('#mobile-menu').open&&document.activeElement===document.querySelector('.menu-toggle'));
try{
  for(const [engineName,engine,options] of [['Chrome',chromium,{channel:'chrome'}],['WebKit',webkit,{}]]){
    const browser=await engine.launch({headless:true,...options});
    try{
      for(const width of [360,390,767]){
        const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.goto('http://127.0.0.1:8080/',{waitUntil:'networkidle'});
        const original=await page.locator('.site-header').evaluate(header=>{
          const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height};};
          return {logo:rect(header.querySelector('.wordmark')),button:rect(header.querySelector('.menu-toggle'))};
        });
        assert.equal(await page.locator('.menu-toggle').evaluate(el=>getComputedStyle(el).borderWidth),'0px');
        if(engineName==='Chrome'&&width===390)await page.screenshot({path:'docs/screenshots/menu-closed-mobile.png'});
        await page.locator('.menu-toggle').click();await waitOpen(page);
        const opened=await page.locator('#mobile-menu').evaluate(dialog=>{
          const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height};};
          const button=dialog.querySelector('[data-menu-close]');
          return {logo:rect(dialog.querySelector('.wordmark')),button:rect(button),border:getComputedStyle(button).borderWidth,lines:[...button.querySelectorAll('line')].map(line=>({transform:getComputedStyle(line).transform,opacity:getComputedStyle(line).opacity}))};
        });
        for(const part of ['logo','button'])for(const key of ['left','top','width','height'])assert(Math.abs(original[part][key]-opened[part][key])<1,`${engineName} ${width}: ${part} ${key} alignment`);
        assert.equal(opened.border,'0px');assert.equal(opened.lines[0].opacity,'0');assert(opened.lines[1].transform.includes('0.707'));
        if(engineName==='Chrome'&&width===390)await page.screenshot({path:'docs/screenshots/menu-open-mobile.png'});
        await page.locator('[data-menu-close]').click();await page.waitForTimeout(80);
        assert(await page.locator('#mobile-menu').evaluate(el=>el.open),'Reverse animation remains visible');
        if(engineName==='Chrome'&&width===390)await page.screenshot({path:'docs/screenshots/menu-closing-mobile.png'});
        await waitClosed(page);
        const extras=[];
        if(width===390){
          await page.locator('.menu-toggle').click();await page.locator('[data-menu-close]').click();await waitClosed(page);extras.push('rapid open/close');
          await page.locator('.menu-toggle').click();await waitOpen(page);
          await page.locator('#mobile-menu nav a').last().focus();await page.keyboard.press('Tab');
          assert(await page.locator('#mobile-menu').evaluate(el=>el.contains(document.activeElement)));
          await page.keyboard.press('Shift+Tab');assert(await page.locator('#mobile-menu nav a').last().evaluate(el=>el===document.activeElement));extras.push('forward/reverse focus trap');
          await page.locator('#mobile-menu nav a').last().click();await page.waitForURL('**/index.html#program');await page.waitForLoadState('networkidle');
          assert(await page.locator('#mobile-menu').evaluate(el=>!el.open));extras.push('navigation after reverse animation');
          await page.locator('.menu-toggle').click();await waitOpen(page);await page.setViewportSize({width:800,height:844});
          await page.waitForFunction(()=>!document.querySelector('#mobile-menu').open&&document.activeElement===document.querySelector('.site-header .wordmark'));extras.push('desktop resize reset');
        }
        assert.equal(errors.length,0);results.push({engine:engineName,width,original,opened,extras,status:'passed'});await page.close();
      }
    }finally{await browser.close();}
  }
}catch(error){results.push({status:'failed',failure:error.stack});process.exitCode=1;console.error(error);}
finally{await writeFile('docs/mobile-menu-results.json',JSON.stringify(results,null,2));console.log(`${results.filter(result=>result.status==='passed').length} menu layouts passed`);}
