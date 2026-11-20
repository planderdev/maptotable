import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const results=[];
for(const [name,engine,options,viewport] of [
  ['Chrome desktop',chromium,{channel:'chrome'},{viewport:{width:1440,height:900}}],
  ['Chrome mobile',chromium,{channel:'chrome'},{...devices['Pixel 7']}],
  ['WebKit iPhone viewport',webkit,{}, {...devices['iPhone 13']}],
]){
  const browser=await engine.launch({headless:true,...options});
  const page=await browser.newPage(viewport);
  const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  const check=(label,condition)=>{assert.ok(condition,name+': '+label);checks.push(label);};
  try{
    await page.goto('http://127.0.0.1:8080/',{waitUntil:'networkidle'});
    const requests=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name));
    check('Only first hero image requested before scroll',requests.filter(r=>r.includes('/media/')).length===1);
    check('Offscreen poster and video are deferred',!requests.some(r=>r.includes('sea-waves-poster')||r.endsWith('.mp4')));
    await page.goto('http://127.0.0.1:8080/index.html#film',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>{const v=document.querySelector('#ambient-sea');return !v.paused&&v.videoWidth>0;});
    check('Video anchor starts at viewport top',await page.locator('#film').evaluate(el=>Math.abs(el.getBoundingClientRect().top)<2));
    check('Video automatically plays muted inline',await page.locator('#ambient-sea').evaluate(v=>!v.paused&&v.muted&&v.playsInline&&v.loop));
    check('Video fills viewport without gutters',await page.locator('#film .ambient-video').evaluate(el=>{const b=el.getBoundingClientRect();return b.x===0&&b.width===document.documentElement.clientWidth&&Math.abs(b.height-innerHeight)<2;}));
    check('Overlay stays inside video',await page.locator('.video-statement').evaluate(el=>{const b=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();return b.left>=p.left&&b.right<=p.right&&el.scrollWidth<=el.clientWidth&&getComputedStyle(el).color==='rgb(245, 245, 242)';}));
    const before=await page.locator('#ambient-sea').evaluate(v=>v.currentTime);
    await page.waitForTimeout(400);
    check('Video time advances',await page.locator('#ambient-sea').evaluate(v=>v.currentTime)>before);
    check('Film stop button removed',await page.locator('#film button').count()===0);
    if(name==='Chrome desktop')await page.screenshot({path:'docs/screenshots/video-overlay-1440.png'});
    if(name==='Chrome mobile')await page.screenshot({path:'docs/screenshots/video-overlay-mobile.png'});
    await page.locator('#program').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('#ambient-sea').paused);
    check('Offscreen video stops',await page.locator('#ambient-sea').evaluate(v=>v.paused));
    await page.locator('#film').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>!document.querySelector('#ambient-sea').paused);
    check('Visible film resumes automatically',await page.locator('#ambient-sea').evaluate(v=>!v.paused));
    await page.locator('#ambient-sea').press('Space');
    await page.locator('#program').scrollIntoViewIfNeeded();
    await page.locator('#film').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
    check('Explicit pause is preserved on return',await page.locator('#ambient-sea').evaluate(v=>v.paused));
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.reload({waitUntil:'networkidle'});await page.locator('#film').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
    check('Reduced motion shows static poster',await page.locator('#ambient-sea').evaluate(v=>v.paused&&v.poster.endsWith('sea-waves-poster.webp')));
    await page.locator('#ambient-sea').press('Space');
    await page.waitForFunction(()=>!document.querySelector('#ambient-sea').paused);
    check('Reduced motion still allows manual play',await page.locator('#ambient-sea').evaluate(v=>!v.paused));
    check('No page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check('No JavaScript errors',errors.length===0);

    results.push({name,status:'passed',checks,errors});
  }catch(error){results.push({name,status:'failed',checks,errors,failure:error.stack});process.exitCode=1;}
  finally{await browser.close();}
}
await writeFile('docs/media-results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(r=>({name:r.name,status:r.status,checks:r.checks.length,failure:r.failure})),null,2));
