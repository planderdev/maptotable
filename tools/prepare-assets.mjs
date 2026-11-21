import { mkdir, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const target = path.join(root, 'public/assets/vendor');
await mkdir(target, { recursive: true });
for (const [src, dest] of [
  ['gsap/dist/gsap.min.js', 'gsap.min.js'],
  ['gsap/dist/ScrollTrigger.min.js', 'ScrollTrigger.min.js'],
  ['swiper/swiper-bundle.min.js', 'swiper-bundle.min.js'],
  ['swiper/swiper-bundle.min.css', 'swiper-bundle.min.css'],
  ['aos/dist/aos.js', 'aos.js'],
  ['aos/dist/aos.css', 'aos.css'],
  ['aos/LICENSE', 'aos.LICENSE'],
]) await copyFile(path.join(root, 'node_modules', src), path.join(target, dest));
await mkdir(path.join(target, 'icons'), { recursive: true });
for (const icon of ['arrow-up-right', 'arrow-right', 'arrow-left', 'arrow-down', 'plus', 'minus', 'menu', 'x', 'check', 'copy', 'search', 'play', 'pause', 'rotate-ccw', 'image', 'file-text', 'video', 'download', 'chevron-down', 'chevron-right', 'utensils', 'map-pin', 'history', 'notebook-pen']) {
  await copyFile(path.join(root, 'node_modules/lucide-static/icons', `${icon}.svg`), path.join(target, 'icons', `${icon}.svg`));
}
await mkdir(path.join(root, 'public/media/s'), { recursive: true });
await mkdir(path.join(root, 'public/media/cut'), { recursive: true });
for (const dir of ['', 's', 'cut']) {
  for (const entry of await readdir(path.join(root, 'media', dir), { withFileTypes: true })) {
    if (entry.isFile()) await copyFile(path.join(root, 'media', dir, entry.name), path.join(root, 'public/media', dir, entry.name));
  }
}
console.log('Prepared local AOS, GSAP, Swiper, Lucide and original media.');
