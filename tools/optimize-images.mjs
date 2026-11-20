import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
for(const dir of ['','s']){
  const source=`media/${dir}`;
  const target=`public/media/${dir}`;
  await mkdir(target,{recursive:true});
  for(const name of await readdir(source)){
    if(name.endsWith('.jpg'))await sharp(`${source}/${name}`).webp({quality:82}).toFile(`${target}/${name.replace('.jpg','.webp')}`);
  }
}
await sharp('public/assets/images/food-memory.png').webp({quality:84}).toFile('public/assets/images/food-memory.webp');
for(const width of [480,960]) await sharp('public/assets/images/food-memory.png').resize({width}).webp({quality:82}).toFile(`public/assets/images/food-memory-${width}.webp`);
await sharp('public/assets/video/sea-waves-poster.jpg').webp({quality:82}).toFile('public/assets/video/sea-waves-poster.webp');
await mkdir('public/assets/images/programs',{recursive:true});
for(const name of ['workshop','village','dining','popup']) {
  for(const width of [480,960]) await sharp(`media/generated/programs/${name}.png`).resize({width}).webp({quality:82}).toFile(`public/assets/images/programs/${name}-${width}.webp`);
}
console.log('Created WebP delivery variants; original images retained.');
