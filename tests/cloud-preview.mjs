import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const origin=process.env.CLOUD_PREVIEW_URL||'http://127.0.0.1:8090';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];const failures=[];let checks=0;page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
const check=(condition,message)=>{assert.ok(condition,message);checks++;};
for(const path of ['/','/story/1.html','/story/2.html','/story/3.html','/join.html','/join/2.html','/design-system.html']){
  const response=await page.goto(origin+path,{waitUntil:'networkidle'});check(response.status()===200,path+' serves');
  check(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),path+' no overflow');
  check(await page.evaluate(()=>[...document.images].every(i=>!i.complete||i.naturalWidth>0)),path+' images');
}
await page.goto(origin+'/',{waitUntil:'networkidle'});check(await page.locator('.hero').evaluate(el=>el.offsetWidth===innerWidth&&el.offsetHeight===innerHeight),'Hero fills viewport');
await page.locator('.story-card[data-story-id="2"] a').click();await page.waitForLoadState('networkidle');check((await page.locator('h1').innerText())==='이야기 02','Correct story rendered');
await page.locator('.story-join .button').click();await page.waitForLoadState('networkidle');check((await page.locator('.join-context').innerText()).includes('02'),'Join context retained');
await page.locator('#q0').fill('미리보기 검수');await page.locator('[data-step="0"] [data-step-next]').click();await page.locator('[data-step="1"] [data-step-back]').click();check(await page.locator('#q0').inputValue()==='미리보기 검수','Join state retained');
await page.goto(origin+'/story.html?id=3',{waitUntil:'networkidle'});check(page.url().endsWith('/story/3.html'),'Legacy story URL redirects');
await page.goto(origin+'/join.html?id=1',{waitUntil:'networkidle'});check(page.url().endsWith('/join/1.html'),'Legacy join URL redirects');
check(errors.length===0,'No JavaScript errors');check(failures.length===0,'No broken requests');
const result={checks,status:'passed',errors,failures};await writeFile('docs/cloud-preview-results.json',JSON.stringify(result,null,2));console.log(result);await browser.close();
