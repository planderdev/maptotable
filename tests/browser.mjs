import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.TEST_URL || 'http://127.0.0.1:8080';
await mkdir('docs/screenshots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = { environment: 'Windows / Chrome headless, local PHP 8.5.5', widths: [], checks: [], accessibility: [], errors: [], brokenRequests: [] };
const context = await browser.newContext({ viewport: { width:1440, height:1000 } });
const page = await context.newPage();
page.on('pageerror',e => results.errors.push(e.message));
page.on('response',r => { if (r.status() >= 400 && r.url().startsWith(base) && !r.url().includes('id=4') && !r.url().includes('missing')) results.brokenRequests.push(`${r.status()} ${r.url()}`); });
const load = async path => { await page.goto(base+path, { waitUntil:'networkidle' }); await page.evaluate(()=>document.fonts.ready); };
const check = (name, condition) => { assert.ok(condition,name); results.checks.push(name); };

try {
  for (const width of [360,390,768,1024,1440,1920]) {
    await page.setViewportSize({ width, height:1000 });
    for (const path of ['/index.html','/story.html?id=1','/join.html?id=1','/design-system.php']) {
      await load(path);
      const metrics = await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth,fonts:document.fonts.check('700 16px Unbounded')&&document.fonts.check('400 16px "Pretendard Variable"'),broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),hero:document.querySelector('.hero--immersive')?.getBoundingClientRect().toJSON()}));
      check(`No page overflow ${width} ${path}`,metrics.scroll<=width);
      check(`Fonts loaded ${width} ${path}`,metrics.fonts);
      check(`Images loaded ${width} ${path}`,metrics.broken.length===0);
      if(path==='/index.html')check(`Full bleed viewport hero ${width}`,metrics.hero.width===width&&metrics.hero.height===1000&&metrics.hero.x===0&&metrics.hero.y===0);
      if(width>=768)check(`Header navigation centered without overlap ${width} ${path}`,await page.locator('.desktop-nav').evaluate(nav=>{const n=nav.getBoundingClientRect(),logo=document.querySelector('.site-header .wordmark').getBoundingClientRect(),join=document.querySelector('.header-join').getBoundingClientRect();return Math.abs(n.left+n.width/2-innerWidth/2)<1&&logo.right+8<n.left&&n.right+8<join.left;}));
      results.widths.push({width,path,...metrics});
      if ([390,1440].includes(width)) await page.screenshot({path:`docs/screenshots/${path.includes('design-system')?'design-system':path.includes('story')?'story':path.includes('join')?'join':'home'}-${width}.png`,fullPage:false});
      if(path==='/index.html'){
        await page.locator('#program').scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>!!document.querySelector('.program-carousel .swiper').swiper);
        await page.locator('.program-card-photo').first().waitFor({state:'visible'});
        await page.waitForFunction(()=>{const i=document.querySelector('.program-card-photo');return i.complete&&i.naturalWidth>0;});
        const program=await page.locator('.program-carousel .swiper').evaluate(el=>{const slides=[...el.querySelectorAll('.swiper-slide')].map(s=>s.getBoundingClientRect()),b=el.getBoundingClientRect(),heading=document.querySelector('.program-heading');return {x:b.x,width:b.width,viewport:document.documentElement.clientWidth,gap:slides[1].left-slides[0].right,configured:el.swiper.params.spaceBetween,inset:slides[0].left,heading:heading.getBoundingClientRect().left+parseFloat(getComputedStyle(heading).paddingLeft),free:el.swiper.params.freeMode.enabled};});
        const gap=width>=1200?40:width>=768?24:16;
        check(`Full bleed program rail ${width}`,program.x===0&&program.width===program.viewport);
        check(`Program spaceBetween ${width}`,Math.abs(program.gap-gap)<1&&program.configured===gap);
        check(`Program heading and first card align ${width}`,Math.abs(program.inset-program.heading)<1&&program.free);
        if([390,1440].includes(width)){
          await page.waitForFunction(()=>getComputedStyle(document.querySelector('.program-card')).opacity==='1');
          await page.screenshot({path:`docs/screenshots/program-fullbleed-${width}.png`});
        }
      }
    }
  }
  await page.setViewportSize({width:1440,height:1000});
  await load('/index.html');
  check('AOS initializes locally',await page.evaluate(()=>!!window.AOS&&document.documentElement.classList.contains('aos-ready')));
  check('AOS leaves existing motion owners alone',await page.locator('.hero [data-aos],.intro-narrative [data-aos],.intro-reading [data-aos],.swiper-wrapper[data-aos],.story-card[data-aos],.join-form [data-aos]').count()===0);
  check('Below-fold AOS entry waits for scroll',await page.locator('.join-invitation-grid > div').evaluate(el=>el.hasAttribute('data-aos')&&!el.classList.contains('aos-animate')));
  await page.locator('#join').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.join-invitation-grid > div').classList.contains('aos-animate'));
  await page.waitForTimeout(700);
  check('AOS section reveals after entering viewport',await page.locator('.join-invitation-grid > div').evaluate(el=>getComputedStyle(el).opacity==='1'));
  await page.screenshot({path:'docs/screenshots/aos-participation-1440.png'});
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
  check('AOS entry stays revealed on reverse scroll',await page.locator('.join-invitation-grid > div').evaluate(el=>el.classList.contains('aos-animate')));
  check('Only three published story entries shown',await page.locator('.story-card').count()===3);
  check('Three published entries',await page.locator('.story-card[data-status=published] a').count()===3);
  check('Pending stories not rendered',await page.locator('.story-card[data-status=pending]').count()===0);
  check('Story section white with three-line heading',await page.locator('.stories-rise').evaluate(el=>getComputedStyle(el).backgroundColor==='rgb(255, 255, 255)'&&[...el.querySelectorAll('h2 span')].map(s=>s.textContent).join('/')==='음식/삶/기억'&&!el.querySelector('.section-heading p')));
  check('Hero has no pin or extra scroll height',await page.evaluate(()=>!ScrollTrigger.getById('opening')&&!document.querySelector('.opening').classList.contains('is-pinned')&&document.querySelector('.opening').offsetHeight===1000&&getComputedStyle(document.querySelector('.hero')).position==='relative'));
  check('Hero previous control disabled at first photo',await page.locator('.hero-prev').isDisabled());
  for(const i of [0,1,2,3,4,5,4,3,2,1,0]){
    if(i>0&&i<=5&&Number(await page.locator('.opening').getAttribute('data-current-scene'))<i)await page.locator('.hero-next').click();
    else if(Number(await page.locator('.opening').getAttribute('data-current-scene'))>i)await page.locator('.hero-prev').click();
    await page.waitForTimeout(600);
    const actual=await page.evaluate(()=>({index:Number(document.querySelector('.opening').dataset.currentScene),owner:Number(document.querySelector('.hero-scene.is-active').dataset.owner),progress:Number(document.querySelector('.hero-progress').getAttribute('aria-valuenow')),count:document.querySelector('.hero-count').textContent}));
    check(`Hero button navigation preserves photo mapping ${i}`,actual.index===i&&actual.owner===Math.floor(i/2)+1&&actual.progress===i+1&&actual.count===`${i+1} / 6`);
    if(i===5)check('Hero next control disabled at last photo',await page.locator('.hero-next').isDisabled());
  }
  const heroBox=await page.locator('.hero-slider').boundingBox();
  await page.mouse.move(heroBox.width*.8,heroBox.height*.45);await page.mouse.down();await page.mouse.move(heroBox.width*.2,heroBox.height*.45,{steps:14});await page.mouse.up();await page.waitForTimeout(600);
  check('Hero mouse drag advances photo',await page.locator('.opening').getAttribute('data-current-scene')==='1');
  await page.locator('.hero-slider').press('ArrowRight');await page.waitForTimeout(600);
  check('Hero keyboard right advances photo',await page.locator('.hero-count').innerText()==='3 / 6');
  await page.locator('.hero-slider').press('ArrowLeft');await page.waitForTimeout(600);
  check('Hero keyboard left restores previous photo',await page.locator('.hero-count').innerText()==='2 / 6');
  await page.evaluate(()=>scrollTo(0,450));await page.waitForTimeout(200);
  check('Vertical scroll leaves hero photo unchanged and moves hero out',await page.locator('.hero').evaluate(el=>Math.abs(el.getBoundingClientRect().top+450)<2&&document.querySelector('.opening').dataset.currentScene==='1'));
  await page.evaluate(()=>scrollTo(0,0));
  check('Hero retains title, subcopy and lower-right navigation',await page.locator('.hero-content').evaluate(el=>!!el.querySelector('h1')&&!!el.querySelector('.hero-subcopy')&&!!el.querySelector('[role=progressbar]')&&el.querySelectorAll('button').length===2&&el.querySelector('.hero-controls').getBoundingClientRect().left>innerWidth/2));
  check('Neutral token is exact',await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--neutral-900').trim()==='#121212'));
  check('Header record link is primary',await page.locator('.header-join').evaluate(el=>el.classList.contains('button--primary')&&getComputedStyle(el).backgroundColor==='rgb(240, 130, 58)'));
  check('Visible media captions and attribution removed',await page.locator('figcaption,a[href*="pixabay"]').count()===0);
  const introPin=await page.evaluate(()=>{const t=ScrollTrigger.getById('introduction');return {start:t.start,end:t.end};});
  for (const progress of [0,.55,1,0]) {
    await page.evaluate(({introPin,progress})=>{scrollTo(0,introPin.start+(introPin.end-introPin.start)*progress);ScrollTrigger.update();},{introPin,progress});
    await page.waitForTimeout(800);
    const state=await page.evaluate(()=>({stage:document.querySelector('.intro-stage').getBoundingClientRect().toJSON(),lines:[...document.querySelectorAll('.intro-mask-text')].map(el=>({opacity:Number(getComputedStyle(el).opacity),clip:getComputedStyle(el).clipPath})),images:document.querySelectorAll('.intro-narrative img').length}));
    check(`Intro stays pinned at ${progress}`,Math.abs(state.stage.y)<2&&state.images===0);
    if(progress===1){check('Intro title fully reveals',state.lines.every(l=>l.opacity===1&&l.clip==='inset(0px 0% 0px 0px)'));await page.screenshot({path:'docs/screenshots/intro-mask-1440.png'});}
    if(progress===0)check('Intro returns to masked title',state.lines.every(l=>l.opacity<.6));
  }
  check('Intro contains three sentences in one shared stage',await page.locator('.intro-reading-stage .intro-sentence').count()===3);
  check('Intro has no former two-column media layout',await page.locator('.intro-grid,.intro-still,.intro-photo').count()===0);
  const readingPin=await page.evaluate(()=>{const t=ScrollTrigger.getById('intro-reading');return {start:t.start,end:t.end};});
  for(const [progress,index] of [[.1,0],[.5,1],[.9,2],[.5,1],[.1,0]]){
    await page.evaluate(({readingPin,progress})=>{scrollTo(0,readingPin.start+(readingPin.end-readingPin.start)*progress);ScrollTrigger.update();},{readingPin,progress});
    await page.waitForTimeout(800);
    const state=await page.evaluate(()=>({stage:document.querySelector('.intro-reading-stage').getBoundingClientRect().top,header:document.querySelector('.site-header').offsetHeight,rows:[...document.querySelectorAll('.intro-sentence')].map(el=>el.getBoundingClientRect().left),font:parseFloat(getComputedStyle(document.querySelector('.intro-sentence-text')).fontSize)}));
    check(`Reading stage stays below header at ${progress}`,Math.abs(state.stage-state.header)<2);
    check(`Reading sentence ${index+1} centered on forward/reverse scroll`,Math.abs(state.rows[index])<1&&state.rows.every((x,i)=>i===index||Math.abs(x)>100));
    check(`Reading font limited to 38px at ${progress}`,state.font<=38);
    check(`Reading text, marquee and CTA share one screen at ${progress}`,await page.locator('.intro-reading-stage').evaluate((stage,index)=>{const rect=el=>el.getBoundingClientRect(),window=rect(stage.querySelector('.intro-sentence-window')),text=rect(stage.querySelectorAll('.intro-sentence-text')[index]),photos=rect(stage.querySelector('.photo-marquee')),button=rect(stage.querySelector('.intro-reading-actions a'));return text.top>=window.top&&text.bottom<=window.bottom&&window.bottom<=photos.top&&photos.bottom<button.top&&button.bottom<=innerHeight&&photos.width<=innerWidth;},index));
    if(progress===.5&&index===1)await page.screenshot({path:'docs/screenshots/intro-horizontal-1440.png'});
  }
  await page.evaluate(readingPin=>{scrollTo(0,readingPin.start+(readingPin.end-readingPin.start)*1.1/3.6);ScrollTrigger.update();},readingPin);await page.waitForTimeout(800);
  check('Reading transition slides horizontally',await page.locator('.intro-sentence').evaluateAll(rows=>rows[0].getBoundingClientRect().left < -100&&rows[1].getBoundingClientRect().left>100));
  check('Story browse CTA is primary below marquee',await page.locator('.intro-reading-actions a').evaluate(el=>el.classList.contains('button--primary')&&el.getAttribute('href')==='#list'&&getComputedStyle(el).backgroundColor==='rgb(240, 130, 58)'&&el.closest('.intro-reading-actions').previousElementSibling.matches('.photo-marquee')));
  await page.locator('[data-marquee]').scrollIntoViewIfNeeded();await page.mouse.move(0,0);
  await page.waitForTimeout(150);const marqueeBefore=await page.locator('.photo-marquee-track').evaluate(el=>getComputedStyle(el).transform);
  await page.waitForTimeout(400);
  check('Photo marquee moves left',await page.locator('.photo-marquee-track').evaluate((el,before)=>getComputedStyle(el).transform!==before,marqueeBefore));
  await page.locator('[data-marquee]').focus();
  check('Photo marquee pauses with keyboard focus',await page.locator('.photo-marquee-track').evaluate(el=>getComputedStyle(el).animationPlayState==='paused'));
  await page.locator('.media-interlude--immersive').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const v=document.querySelector('[data-ambient] video');return !v.paused&&v.videoWidth>0;});
  check('Pixabay video autoplays muted inline',await page.locator('[data-ambient] video').evaluate(v=>!v.paused&&v.muted&&v.playsInline));
  check('Film has no visible stop button',await page.locator('#film button').count()===0);
  await page.locator('#ambient-sea').press('Space');check('Film keyboard pause works',await page.locator('[data-ambient] video').evaluate(v=>v.paused));
  await load('/index.html#list');
  check('Direct list anchor avoids replay',await page.locator('#list').evaluate(el=>Math.abs(el.getBoundingClientRect().top)<2));
  const galleryTop=await page.locator('#list').evaluate(el=>el.getBoundingClientRect().top+scrollY);
  const readRise=()=>page.evaluate(()=>({heading:document.querySelector('.stories-title-layer h2').getBoundingClientRect().top,card:document.querySelector('.story-grid--rise .story-card').getBoundingClientRect().top}));
  await page.waitForTimeout(600);const galleryStart=await readRise();
  await page.evaluate(top=>{scrollTo(0,top+400);ScrollTrigger.update();},galleryTop);await page.waitForTimeout(700);
  const galleryForward=await readRise();
  check('Story heading remains stationary',Math.abs(galleryForward.heading-galleryStart.heading)<2);
  check('Story cards rise with scroll',galleryForward.card<galleryStart.card-400);
  await page.screenshot({path:'docs/screenshots/stories-rise-1440.png'});
  await page.evaluate(top=>{scrollTo(0,top);ScrollTrigger.update();},galleryTop);await page.waitForTimeout(700);
  check('Reverse scroll restores story cards',Math.abs((await readRise()).card-galleryStart.card)<2);
  await page.evaluate(top=>{const height=document.querySelector('.stories-exhibition').offsetHeight;scrollTo(0,top+height-300);ScrollTrigger.update();},galleryTop);await page.waitForTimeout(100);
  check('Story sticky title stays inside its section',await page.locator('.stories-exhibition').evaluate(el=>el.querySelector('h2').getBoundingClientRect().bottom<=el.getBoundingClientRect().bottom+2));
  await page.evaluate(top=>{scrollTo(0,top);ScrollTrigger.update();},galleryTop);await page.waitForTimeout(600);
  check('Published stories alternate right left right',await page.locator('.story-grid--rise .story-card').evaluateAll(cards=>{const x=cards.map(el=>el.getBoundingClientRect().left);return x[0]>x[1]&&Math.abs(x[0]-x[2])<2;}));
  for(const id of [1,2,3]){
    const storyLink=page.locator(`.story-grid--rise [data-story-id="${id}"] a`);await storyLink.focus();await page.keyboard.press('Enter');await page.waitForLoadState('networkidle');
    check(`Rising story ${id} keyboard link opens correct detail`,(await page.locator('h1').innerText())===`이야기 0${id}`);
    await load('/index.html#list');
  }
  await page.locator('#program').scrollIntoViewIfNeeded();
  const rail=page.locator('.program-carousel .swiper');
  await rail.focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450);
  check('Carousel keyboard',await rail.evaluate(el=>el.swiper.activeIndex)>0);
  await page.locator('.carousel-prev').first().click();await page.waitForTimeout(450);
  check('Carousel previous button',await rail.evaluate(el=>el.swiper.activeIndex)===0);
  const box=await rail.boundingBox();
  await page.mouse.move(box.x+box.width*.75,box.y+180);await page.mouse.down();await page.mouse.move(box.x+box.width*.2,box.y+180,{steps:15});await page.mouse.up();await page.waitForTimeout(500);
  check('Carousel mouse drag',await rail.evaluate(el=>el.swiper.activeIndex)>0);
  for (const id of [1,2,3]) {
    await load(`/story.html?id=${id}`);
    check(`Story ${id} next published`,await page.locator('.next-story>a').first().getAttribute('href')===`/story.html?id=${id===3?1:id+1}`);
    check(`Story ${id} join context`,await page.locator('.story-join .button').getAttribute('href')===`/join.html?id=${id}`);
  }
  const pending=await page.goto(`${base}/story.html?id=4`);check('Pending detail not published',pending.status()===404);
  await page.setViewportSize({width:390,height:844});
  await load('/join.html?id=2');
  check('Story-specific entry context',(await page.locator('.join-context').innerText()).includes('이야기 02'));
  const post=[];page.on('request',r=>{if(r.method()==='POST')post.push(r.url());});
  await page.locator('#q0').fill('검수용 기억 <script>alert(1)</script>');
  await page.locator('[data-step="0"] [data-step-next]').click();
  check('New question focused',await page.evaluate(()=>document.activeElement===document.querySelector('[data-step="1"] h2')));
  await page.locator('[data-step="1"] [data-step-back]').click();
  check('Previous input retained',(await page.locator('#q0').inputValue()).includes('검수용 기억'));
  await page.locator('[data-step="0"] [data-step-next]').click();
  await page.locator('[data-step="1"] [data-step-next]').click();
  await page.locator('[data-step="2"] [data-step-next]').click();
  await page.locator('[data-step="3"] [data-step-next]').click();
  check('Private consent default',await page.locator('input[name=consent][value=no]').isChecked());
  await page.locator('input[name=consent][value=yes]').check();
  await page.locator('[data-step="4"] [data-step-back]').click();
  await page.locator('[data-step="3"] [data-step-next]').click();
  check('Consent retained',await page.locator('input[name=consent][value=yes]').isChecked());
  await page.locator('[data-form-finish]').click();
  check('Demo is explicitly not saved',(await page.locator('.join-done').innerText()).includes('저장하지 않았습니다'));
  check('User content escaped',await page.locator('.join-recap script').count()===0);
  const downloadPromise=page.waitForEvent('download');await page.locator('[data-export]').click();const download=await downloadPromise;
  check('Local export works',download.suggestedFilename().endsWith('.txt'));
  check('Demo sends no POST',post.length===0);
  const menuOrigin=await page.locator('.site-header').evaluate(header=>{const rect=el=>el.getBoundingClientRect().toJSON();return {logo:rect(header.querySelector('.wordmark')),button:rect(header.querySelector('.menu-toggle'))};});
  await page.locator('.menu-toggle').click();
  check('Mobile menu opens',await page.locator('#mobile-menu').evaluate(el=>el.open));
  await page.waitForFunction(()=>document.querySelector('#mobile-menu').classList.contains('is-menu-open'));
  check('Three Lucide menu lines animate into X',await page.locator('[data-menu-close]').evaluate(el=>el.querySelectorAll('line').length===3&&[...el.querySelectorAll('line')].some(line=>line.getAnimations().some(animation=>animation.playState==='running'))));
  await page.waitForTimeout(350);
  check('Opened menu logo and control match header positions',await page.locator('#mobile-menu').evaluate((dialog,origin)=>{const positions={logo:dialog.querySelector('.wordmark').getBoundingClientRect(),button:dialog.querySelector('[data-menu-close]').getBoundingClientRect()};return Object.entries(positions).every(([part,rect])=>['left','top','width','height'].every(key=>Math.abs(rect[key]-origin[part][key])<1));},menuOrigin));
  check('Mobile menu control has no border',await page.locator('[data-menu-close]').evaluate(el=>getComputedStyle(el).borderWidth==='0px'));
  const menuAxe=await new AxeBuilder({page}).include('#mobile-menu').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  results.accessibility.push({path:'/join.html [open mobile menu]',violations:menuAxe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
  await page.screenshot({path:'docs/screenshots/menu-open-mobile.png'});
  await page.keyboard.press('Escape');
  check('Escape waits for reverse menu animation',await page.locator('#mobile-menu').evaluate(el=>el.open&&el.classList.contains('is-closing')));
  await page.waitForFunction(()=>!document.querySelector('#mobile-menu').open&&document.activeElement===document.querySelector('.menu-toggle'));
  check('Mobile menu closes and restores focus',await page.evaluate(()=>!document.querySelector('#mobile-menu').open&&document.activeElement===document.querySelector('.menu-toggle')));
  await page.setViewportSize({width:1440,height:1000});
  await load('/design-system.php');
  await page.locator('#ds-search').fill('textarea');
  check('English component search',await page.locator('.ds-search-results a').count()>0);
  await page.locator('#ds-search').fill('동의');
  check('Korean component search',await page.locator('.ds-search-results a').count()>0);
  await page.locator('#ds-search').press('ArrowDown');
  check('Search keyboard access',await page.evaluate(()=>document.activeElement.closest('.ds-search-results')!==null));
  await page.keyboard.press('Enter');
  check('Search navigates to correct section',new URL(page.url()).hash==='#fields');
  await page.context().grantPermissions(['clipboard-read','clipboard-write']);
  await page.locator('[data-copy=code-field]').click();
  check('Code copy works',(await page.evaluate(()=>navigator.clipboard.readText())).includes('textareaField'));
  await page.locator('[data-demo-play]').click();await page.waitForTimeout(100);
  check('Motion demo plays',await page.locator('.motion-demo-target').evaluate(el=>el.getAnimations().length>0));
  await page.locator('.motion-choice input').check();await page.locator('[data-demo-play]').click();
  check('Reduced motion demo static',await page.locator('.motion-demo-target').evaluate(el=>el.getAnimations().length===0));
  for (const path of ['/index.html','/story.html?id=1','/join.html','/design-system.php']) {
    await load(path);
    // Scan the completed visible state of every entrance, after real scroll traversal.
    for(const target of await page.locator('[data-aos]').all()){
      await target.scrollIntoViewIfNeeded();
      await page.waitForFunction(el=>el.classList.contains('aos-animate'),await target.elementHandle());
    }
    await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(850);
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    results.accessibility.push({path,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
  }
  await page.emulateMedia({reducedMotion:'reduce'});await load('/index.html');
  check('Reduced motion disables AOS styling',await page.evaluate(()=>!document.documentElement.classList.contains('aos-ready')));
  check('Reduced AOS content remains readable',await page.locator('[data-aos]').evaluateAll(elements=>elements.every(el=>getComputedStyle(el).opacity==='1'&&getComputedStyle(el).transform==='none')));
  check('Reduced motion removes pin',await page.locator('.opening').evaluate(el=>!el.classList.contains('is-pinned')));
  check('Reduced hero transitions instantly',await page.locator('.hero-slider').evaluate(el=>el.swiper.params.speed===0));
  await page.locator('.hero-next').click();check('Reduced hero remains navigable',await page.locator('.hero-count').innerText()==='2 / 6');
  check('Reduced marquee remains static',await page.locator('.photo-marquee-track').evaluate(el=>getComputedStyle(el).animationName==='none'));
  check('Reduced intro lines are readable',await page.locator('.intro-mask-text').evaluateAll(lines=>lines.every(el=>getComputedStyle(el).opacity==='1')));
  check('Reduced motion removes introduction pin',await page.locator('.intro-narrative').evaluate(el=>!el.classList.contains('is-pinned')));
  check('Reduced horizontal reading returns to readable vertical text',await page.locator('.intro-reading-sequence').evaluate(el=>!el.classList.contains('is-pinned')&&[...el.querySelectorAll('.intro-sentence')].every((row,i,rows)=>getComputedStyle(row).transform==='none'&&(i===0||row.getBoundingClientRect().top>=rows[i-1].getBoundingClientRect().bottom))));
  check('Reduced motion keeps story heading in normal flow',await page.locator('.stories-title-layer').evaluate(el=>getComputedStyle(el).position==='relative'));
  check('Reduced motion removes story movement',await page.locator('.story-grid--rise .story-card').evaluateAll(cards=>cards.every(el=>getComputedStyle(el).transform==='none')));
  check('Reduced motion keeps all story navigation',await page.locator('.story-card[data-status=published] a').count()===3);
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await nojs.goto(base+'/index.html');check('No JS story links',await nojs.locator('.story-card a').count()===3);
  check('No JS AOS content stays visible',await nojs.locator('[data-aos]').evaluateAll(elements=>elements.every(el=>getComputedStyle(el).opacity==='1')));
  check('No JS hero exposes six native-scroll photos',await nojs.locator('.hero-slider').evaluate(el=>el.querySelectorAll('img').length===6&&getComputedStyle(el).overflowX==='auto'));
  check('No JS introduction keeps all three paragraphs readable',await nojs.locator('.intro-sentence').evaluateAll(rows=>rows.length===3&&rows.every((row,i)=>getComputedStyle(row).transform==='none'&&(i===0||row.getBoundingClientRect().top>=rows[i-1].getBoundingClientRect().bottom))));
  await nojs.goto(base+'/join.html');check('No JS all questions readable',await nojs.locator('.join-step:not(.join-done)').count()===5);await nojs.close();
  const blocked=await browser.newPage({viewport:{width:390,height:844}});await blocked.route('**/vendor/**',r=>r.abort());await blocked.goto(base+'/index.html');
  check('Library failure keeps stories readable',await blocked.locator('.story-card a').count()===3&&await blocked.locator('.hero-title').isVisible());
  await blocked.locator('.hero-next').click();await blocked.waitForFunction(()=>document.querySelector('.hero-count').textContent==='2 / 6');
  check('Library failure keeps native hero controls usable',await blocked.locator('.hero-slider').evaluate(el=>!el.swiper&&el.scrollLeft>0));await blocked.close();
  const noAos=await browser.newPage({viewport:{width:390,height:844}});await noAos.route('**/vendor/aos.js',r=>r.abort());await noAos.goto(base+'/index.html',{waitUntil:'networkidle'});
  check('AOS load failure leaves content visible',await noAos.locator('[data-aos]').evaluateAll(elements=>elements.every(el=>getComputedStyle(el).opacity==='1')));await noAos.close();
  check('No JavaScript errors',results.errors.length===0);check('No broken local requests',results.brokenRequests.length===0);
  check('WCAG automated rules pass',results.accessibility.every(a=>a.violations.length===0));
} catch(error) { results.failure=error.stack;process.exitCode=1;console.error(error); }
finally { await writeFile('docs/browser-results.json',JSON.stringify(results,null,2)); console.log(`${results.checks.length} checks, ${results.accessibility.length} accessibility scans`);await browser.close(); }
