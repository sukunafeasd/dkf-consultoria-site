import { readdir } from 'node:fs/promises';
import { dirname, extname, join, parse } from 'node:path';
import sharp from 'sharp';

const roots = ['assets/site', 'assets/products'];

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : path;
  }))).flat();
};

for (const root of roots) {
  const files = (await walk(root)).filter((file) =>
    ['.jpg', '.jpeg'].includes(extname(file).toLowerCase()) && !parse(file).name.startsWith('og-')
  );
  for (const file of files) {
    const output = join(dirname(file), `${parse(file).name}.webp`);
    const outputSmall = join(dirname(file), `${parse(file).name}-480.webp`);
    await sharp(file).webp({ quality: 82 }).toFile(output);
    await sharp(file).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputSmall);
  }
}

console.log('Imagens WebP geradas.');
