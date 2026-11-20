import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const url='https://cdn.pixabay.com/video/2019/03/21/22183-712840599_medium.mp4';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext();
const response=await context.request.get(url);
console.log(response.status(),response.headers()['content-type']);
if(response.ok()&&response.headers()['content-type']?.includes('video')){
  const data=await response.body();await mkdir('public/assets/video',{recursive:true});await writeFile('public/assets/video/sea-waves-pixabay.mp4',data);console.log('Saved',data.length);
}
await browser.close();
