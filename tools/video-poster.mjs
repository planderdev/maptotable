import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:720}});
await page.goto('http://127.0.0.1:8080/');
const meta=await page.evaluate(async()=>{
  const video=document.createElement('video');video.src='/assets/video/sea-waves-pixabay.mp4';video.muted=true;video.style.cssText='position:fixed;inset:0;width:1280px;height:720px;object-fit:cover;z-index:1000';document.body.append(video);
  await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=reject});
  video.currentTime=3;await new Promise(resolve=>video.onseeked=resolve);
  return {duration:video.duration,width:video.videoWidth,height:video.videoHeight};
});
await page.locator('body>video').screenshot({path:'public/assets/video/sea-waves-poster.jpg',type:'jpeg',quality:85});
await writeFile('docs/video-source.json',JSON.stringify({source:'https://pixabay.com/videos/waves-water-sea-ocean-landscape-22183/',download:'https://cdn.pixabay.com/video/2019/03/21/22183-712840599_medium.mp4',creator:'Artvan93',license:'https://pixabay.com/service/license-summary/',role:'Exhibition atmosphere only; no claim of Jeju location or participant footage',...meta},null,2));
console.log(meta);await browser.close();
