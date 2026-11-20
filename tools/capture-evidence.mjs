import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===390?844:1000});
  await page.goto('http://127.0.0.1:8080/',{waitUntil:'networkidle'});
  await page.screenshot({path:`docs/screenshots/home-${width}.png`});
  for(const [id,name] of [['say','introduction'],['list','stories'],['join','participation'],['program','programs']]){
    await page.evaluate(id=>{document.activeElement?.blur();document.getElementById(id).scrollIntoView({block:'start',behavior:'instant'});},id);
    await page.screenshot({path:`docs/screenshots/${name}-${width}.png`});
  }
  await page.goto('http://127.0.0.1:8080/story.html?id=1',{waitUntil:'networkidle'});await page.screenshot({path:`docs/screenshots/story-${width}.png`});
  await page.goto('http://127.0.0.1:8080/design-system.php#actions',{waitUntil:'networkidle'});await page.screenshot({path:`docs/screenshots/components-${width}.png`});
}
await browser.close();
