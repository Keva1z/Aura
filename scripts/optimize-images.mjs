// Оптимизация фотографий моделей: ресайз + сжатие (mozjpeg) + мобильный вариант.
// Десктопный размер перезаписывает оригинал, рядом создаётся `*-sm.jpg` для мобильных.
//
// Запуск (sharp не входит в зависимости проекта, ставится отдельно):
//   npm i sharp        # один раз
//   node scripts/optimize-images.mjs
//
// После добавления новых фото в public/images/models/ прогоните скрипт ещё раз.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images', 'models');
const files = readdirSync(dir).filter((f) => /^model-\d+\.jpg$/.test(f));

const DESKTOP_W = 840; // слайд на десктопе ≤420px → 840 хватает для 2x
const MOBILE_W = 640; // вариант для телефонов

const kb = (p) => (statSync(p).size / 1024).toFixed(0);

for (const file of files) {
  const path = join(dir, file);
  const before = kb(path);
  // читаем в буфер, чтобы безопасно перезаписать тот же файл
  const input = readFileSync(path);
  const base = file.replace(/\.jpg$/, '');

  await sharp(input)
    .resize({ width: DESKTOP_W, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true })
    .toFile(path);

  const smPath = join(dir, `${base}-sm.jpg`);
  await sharp(input)
    .resize({ width: MOBILE_W, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(smPath);

  console.log(`✓ ${file}: ${before}KB → ${kb(path)}KB  (+ ${base}-sm.jpg ${kb(smPath)}KB)`);
}
console.log('done');
