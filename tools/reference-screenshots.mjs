import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('docs/reference-screenshots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [name, url] of [['original', 'https://map-to-table.vercel.app/'], ['dminusone', 'https://www.dminusone.com/'], ['kanu', 'https://www.kanu.co.kr/limited-edition-2026kanubc']]) {
  for (const width of [1440,390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
      await page.screenshot({ path: `docs/reference-screenshots/${name}-${width}.png` });
      if (name !== 'original') {
        await page.mouse.wheel(0, 1600);
        await page.waitForTimeout(1800);
        await page.screenshot({ path: `docs/reference-screenshots/${name}-${width}-scroll.png` });
      }
      console.log(name, width, await page.title());
    } catch(e) { console.log(name, e.message); }
    await page.close();
  }
}
await browser.close();
