import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const results=[];
for(const [name,engine,device,options] of [
  ['Chrome / Pixel 7 emulation',chromium,devices['Pixel 7'],{channel:'chrome'}],
  ['WebKit 26.0 / iPhone 13 viewport emulation on Windows',webkit,devices['iPhone 13'],{}],
]){
  const browser=await engine.launch({headless:true,...options});
  const context=await browser.newContext({...device});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const checks=[];const check=(label,condition)=>{assert.ok(condition,`${name}: ${label}`);checks.push(label);};
  try{
    for(const path of ['/','/story.html?id=3','/join.html','/design-system.php']){
      await page.goto('http://127.0.0.1:8080'+path,{waitUntil:'networkidle'});
      check('No overflow '+path,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      check('Fonts ready '+path,await page.evaluate(async()=>{await document.fonts.ready;return document.fonts.check('700 16px Unbounded')&&document.fonts.check('400 16px "Pretendard Variable"');}));
    }
    await page.goto('http://127.0.0.1:8080/story.html?id=1',{waitUntil:'networkidle'});
    const rail=page.locator('.photo-carousel .swiper');await rail.scrollIntoViewIfNeeded();
    check('Gallery initialized',await rail.evaluate(el=>!!el.swiper));
    if(engine===chromium){
      const cdp=await context.newCDPSession(page);const box=await rail.boundingBox();
      const x=box.x+box.width*.8,y=box.y+180;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
      for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*20,y}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForTimeout(500);check('Actual emulated touch swipe',await rail.evaluate(el=>el.swiper.activeIndex)>0);
    }else{
      await page.locator('.carousel-next').click();await page.waitForTimeout(500);check('Gallery next button',await rail.evaluate(el=>el.swiper.activeIndex)>0);
    }
    const menuOrigin=await page.locator('.site-header').evaluate(header=>({logo:header.querySelector('.wordmark').getBoundingClientRect().toJSON(),button:header.querySelector('.menu-toggle').getBoundingClientRect().toJSON()}));
    await page.locator('.menu-toggle').click();
    await page.waitForFunction(()=>{const button=document.querySelector('[data-menu-close]');return getComputedStyle(button.querySelector('line')).opacity==='0'&&[...button.querySelectorAll('line')].every(line=>line.getAnimations().every(animation=>animation.playState!=='running'));});
    check('Mobile menu logo and close control preserve header geometry',await page.locator('#mobile-menu').evaluate((dialog,origin)=>{const targets={logo:dialog.querySelector('.wordmark'),button:dialog.querySelector('[data-menu-close]')};return Object.entries(targets).every(([part,el])=>{const r=el.getBoundingClientRect();return ['left','top','width','height'].every(key=>Math.abs(r[key]-origin[part][key])<1);});},menuOrigin));
    check('Mobile close uses rotated Lucide lines without border',await page.locator('[data-menu-close]').evaluate(el=>getComputedStyle(el).borderWidth==='0px'&&el.querySelectorAll('line').length===3&&getComputedStyle(el.querySelector('line')).opacity==='0'));
    await page.keyboard.press('Escape');check('Menu reverses before closing',await page.locator('#mobile-menu').evaluate(el=>el.open&&el.classList.contains('is-closing')));
    await page.waitForFunction(()=>!document.querySelector('#mobile-menu').open&&document.activeElement===document.querySelector('.menu-toggle'));
    check('Menu closes',await page.locator('#mobile-menu').evaluate(el=>!el.open));
    await page.goto('http://127.0.0.1:8080/',{waitUntil:'networkidle'});
    check('Mobile hero has no pinned scroll',await page.locator('.opening').evaluate(el=>!el.classList.contains('is-pinned')&&Math.abs(el.getBoundingClientRect().height-innerHeight)<2&&!ScrollTrigger.getById('opening')));
    if(engine===chromium){
      const heroTouch=await context.newCDPSession(page),heroBox=await page.locator('.hero-slider').boundingBox();
      const hx=heroBox.width*.82,hy=heroBox.height*.5;
      await heroTouch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:hx,y:hy}]});
      for(let i=1;i<=12;i++)await heroTouch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:hx-i*20,y:hy}]});
      await heroTouch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(650);
      check('Hero actual touch swipe updates counter',await page.locator('.hero-count').innerText()==='2 / 6');
    }else{
      await page.locator('.hero-next').click();await page.waitForTimeout(650);
      check('Hero mobile next control updates counter',await page.locator('.hero-count').innerText()==='2 / 6');
    }
    check('Mobile hero controls fit at lower right',await page.locator('.hero-controls').evaluate(el=>{const b=el.getBoundingClientRect(),last=el.querySelector('.hero-next').getBoundingClientRect(),progress=document.querySelector('.hero-progress').getBoundingClientRect();return b.right<=innerWidth&&b.left>progress.right&&last.left>innerWidth/2&&b.bottom<=innerHeight&&b.bottom>innerHeight-60&&[...el.querySelectorAll('button')].every(button=>button.getBoundingClientRect().width>=44);}));
    if(engine===chromium)await page.screenshot({path:'docs/screenshots/hero-swipe-mobile.png'});
    const introPin=await page.evaluate(()=>{const t=ScrollTrigger.getById('introduction');return {start:t.start,end:t.end};});
    for(const progress of [.2,.7,1,.2]){
      await page.evaluate(({introPin,progress})=>{scrollTo(0,introPin.start+(introPin.end-introPin.start)*progress);ScrollTrigger.update();},{introPin,progress});
      await page.waitForTimeout(800);
      check('Mobile intro pins forward/reverse '+progress,await page.locator('.intro-stage').evaluate(el=>Math.abs(el.getBoundingClientRect().top)<2));
      check('Mobile intro has no horizontal overflow '+progress,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(progress===1){check('Mobile title fully reveals without photos',await page.locator('.intro-narrative').evaluate(el=>!el.querySelector('img')&&[...el.querySelectorAll('.intro-mask-text')].every(line=>getComputedStyle(line).opacity==='1')));check('Mobile narrative highlights life, seasons and memory',await page.locator('.intro-highlight').evaluateAll(words=>words.map(el=>el.textContent).join('/')==='삶/계절/기억'&&words.every(el=>getComputedStyle(el).backgroundColor==='rgb(240, 130, 58)'&&getComputedStyle(el).color==='rgb(18, 18, 18)')));}
    }
    const readingPin=await page.evaluate(()=>{const t=ScrollTrigger.getById('intro-reading');return {start:t.start,end:t.end};});
    for(const [progress,index] of [[.1,0],[.5,1],[.9,2]]){
      await page.evaluate(({readingPin,progress})=>{scrollTo(0,readingPin.start+(readingPin.end-readingPin.start)*progress);ScrollTrigger.update();},{readingPin,progress});await page.waitForTimeout(800);
      check(`Mobile reading sentence ${index+1} centered in same stage`,await page.locator('.intro-reading-stage').evaluate((stage,index)=>{const row=stage.querySelectorAll('.intro-sentence')[index],text=row.querySelector('p').getBoundingClientRect();return Math.abs(stage.getBoundingClientRect().top-document.querySelector('.site-header').offsetHeight)<2&&Math.abs(row.getBoundingClientRect().left)<1&&text.top>=stage.getBoundingClientRect().top&&text.bottom<=stage.getBoundingClientRect().bottom;},index));
      check(`Mobile sentence ${index+1}, photos and button remain together`,await page.locator('.intro-reading-stage').evaluate((stage,index)=>{const text=stage.querySelectorAll('p')[index].getBoundingClientRect(),window=stage.querySelector('.intro-sentence-window').getBoundingClientRect(),photos=stage.querySelector('.photo-marquee').getBoundingClientRect(),button=stage.querySelector('.intro-reading-actions a').getBoundingClientRect();return text.bottom<=window.bottom&&window.bottom<=photos.top&&photos.bottom<button.top&&button.bottom<=innerHeight&&photos.left>=0&&photos.right<=innerWidth;},index));
      if(engine===chromium&&index===1)await page.screenshot({path:'docs/screenshots/intro-horizontal-mobile.png'});
    }
    check('Mobile browse turns dark on the primary reading background',await page.locator('.intro-reading-actions a').evaluate(el=>el.classList.contains('button--dark')&&!el.classList.contains('button--primary')&&getComputedStyle(el).backgroundColor==='rgb(18, 18, 18)'&&getComputedStyle(el.closest('.intro-reading')).backgroundColor==='rgb(240, 130, 58)'&&el.closest('.intro-reading-actions').previousElementSibling.matches('.photo-marquee')));
    await page.goto('http://127.0.0.1:8080/index.html#list',{waitUntil:'networkidle'});
    const storyTop=await page.locator('#list').evaluate(el=>el.getBoundingClientRect().top+scrollY);
    await page.waitForTimeout(600);
    const firstY=await page.locator('.story-grid--rise .story-card').first().evaluate(el=>el.getBoundingClientRect().top);
    await page.evaluate(top=>{scrollTo(0,top+250);ScrollTrigger.update();},storyTop);await page.waitForTimeout(700);
    check('Mobile story cards rise',await page.locator('.story-grid--rise .story-card').first().evaluate(el=>el.getBoundingClientRect().top)<firstY-250);
    check('Mobile story heading stays below header',await page.locator('.stories-title-layer').evaluate(el=>Math.abs(el.getBoundingClientRect().top-document.querySelector('.site-header').offsetHeight)<2));
    check('Mobile story title centered behind half-width staggered cards',await page.locator('.stories-exhibition').evaluate(section=>{const title=section.querySelector('h2').getBoundingClientRect(),layer=section.querySelector('.stories-title-layer').getBoundingClientRect(),cards=[...section.querySelectorAll('.story-card')].map(el=>el.getBoundingClientRect());return Math.abs(title.left+title.width/2-innerWidth/2)<2&&Math.abs(title.top+title.height/2-layer.top-layer.height/2)<2&&cards.every(card=>card.width<innerWidth/2)&&cards[0].left>innerWidth/2&&cards[1].right<innerWidth/2&&cards[2].left>innerWidth/2;}));
    check('Mobile story portraits use reference proportions and overlaid titles',await page.locator('.story-grid--rise .story-card').evaluateAll(cards=>cards.every(card=>{const image=card.querySelector('.story-card-image').getBoundingClientRect(),title=card.querySelector('h3').getBoundingClientRect();return Math.abs(image.width/image.height-.8)<.001&&title.top>=image.top&&title.bottom<=image.bottom;})));
    check('Mobile story section has no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(engine===chromium)await page.screenshot({path:'docs/screenshots/stories-rise-mobile.png'});
    await page.locator('.story-grid--rise [data-story-id="2"] a').click();await page.waitForLoadState('networkidle');
    check('Mobile rising story link opens correct detail',(await page.locator('h1').innerText())==='이야기 02');
    await page.goto('http://127.0.0.1:8080/index.html#program',{waitUntil:'networkidle'});
    check('Mobile AOS initialized',await page.evaluate(()=>!!window.AOS&&document.documentElement.classList.contains('aos-ready')));
    const programRail=page.locator('.program-carousel .swiper');
    check('Program full bleed with 16px spacing',await programRail.evaluate(el=>el.getBoundingClientRect().width===document.documentElement.clientWidth&&el.swiper.params.spaceBetween===16));
    if(engine===chromium){
      const programTouch=await context.newCDPSession(page),programBox=await programRail.boundingBox();
      const px=programBox.x+programBox.width*.8,py=programBox.y+180;
      const start=await programRail.evaluate(el=>el.swiper.translate);
      await programTouch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:px,y:py}]});
      for(let i=1;i<=12;i++)await programTouch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:px-i*20,y:py}]});
      await programTouch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(600);
      check('Program actual touch swipe',await programRail.evaluate(el=>el.swiper.translate)<start-100);
    }else{
      await page.locator('.program-carousel .carousel-next').click();await page.waitForTimeout(500);
      check('Program next navigation',await programRail.evaluate(el=>el.swiper.activeIndex)>0);
    }
    check('Program no horizontal page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>{const s=document.querySelector('.program-carousel .swiper').swiper;return !s.params.freeMode.momentum&&s.params.speed===0;});
    check('Mobile reduced AOS stays readable',await page.locator('[data-aos]').evaluateAll(elements=>elements.every(el=>getComputedStyle(el).opacity==='1'&&getComputedStyle(el).transform==='none')));
    check('Reduced motion disables program momentum',await programRail.evaluate(el=>!el.swiper.params.freeMode.momentum&&el.swiper.params.speed===0));
    await page.goto('http://127.0.0.1:8080/',{waitUntil:'networkidle'});
    check('Reduced motion unpins',await page.locator('.opening').evaluate(el=>!el.classList.contains('is-pinned')));
    check('Mobile hero has three title lines',await page.locator('.hero-title span').evaluateAll(spans=>spans.map(s=>s.textContent).join('/')==='MAP/TO/TABLE'&&spans[0].getBoundingClientRect().top<spans[1].getBoundingClientRect().top&&spans[1].getBoundingClientRect().top<spans[2].getBoundingClientRect().top));
    check('Mobile header primary remains visible',await page.locator('.header-join').isVisible());
    check('Reduced introduction unpins',await page.locator('.intro-narrative').evaluate(el=>!el.classList.contains('is-pinned')));
    check('Reduced reading unpins and shows all sentences',await page.locator('.intro-reading-sequence').evaluate(el=>!el.classList.contains('is-pinned')&&[...el.querySelectorAll('.intro-sentence')].every(row=>getComputedStyle(row).transform==='none')));
    check('Reduced photo marquee stays static',await page.locator('.photo-marquee-track').evaluate(el=>getComputedStyle(el).animationName==='none'));
    check('Reduced motion retains three story links',await page.locator('.story-card[data-status=published] a').count()===3);
    await page.locator('.menu-toggle').click();
    check('Reduced menu opens with static X',await page.locator('[data-menu-close]').evaluate(el=>getComputedStyle(el.querySelector('line')).opacity==='0'&&el.querySelector('line').getAnimations().length===0));
    await page.locator('[data-menu-close]').click();await page.waitForFunction(()=>!document.querySelector('#mobile-menu').open);
    check('Reduced menu closes without delayed motion',await page.locator('#mobile-menu').evaluate(el=>!el.open));
    check('No JavaScript errors',errors.length===0);
    results.push({name,checks,errors,status:'passed'});
  }catch(e){results.push({name,checks,errors,status:'failed',failure:e.stack});process.exitCode=1;}
  await browser.close();
}
await writeFile('docs/mobile-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
