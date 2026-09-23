import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const rootPath = fileURLToPath(root);
const failures = [];
const htmlFiles = readdirSync(root).filter((name) => extname(name) === '.html');

const fail = (file, message) => failures.push(`${file}: ${message}`);

for (const file of htmlFiles) {
  const html = readFileSync(new URL(file, root), 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) fail(file, `IDs duplicados: ${[...new Set(duplicates)].join(', ')}`);

  for (const match of html.matchAll(/<img\b([^>]+)>/g)) {
    if (!/\balt="[^"]*"/.test(match[1])) fail(file, 'imagem sem texto alternativo');
    if (!/\bwidth="\d+"/.test(match[1]) || !/\bheight="\d+"/.test(match[1])) {
      fail(file, 'imagem sem width e height');
    }
  }

  for (const match of html.matchAll(/<a\b([^>]+target="_blank"[^>]*)>/g)) {
    if (!/rel="[^"]*noopener[^"]*"/.test(match[1])) fail(file, 'link externo sem noopener');
  }

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|#|\/\/)/.test(value)) continue;
    const clean = value.split(/[?#]/)[0];
    if (!clean) continue;
    const localPath = clean.startsWith('/') ? clean.slice(1) : clean;
    const candidates = [
      join(rootPath, localPath),
      join(rootPath, `${localPath}.html`),
      join(rootPath, localPath, 'index.html')
    ];
    if (!candidates.some(existsSync)) fail(file, `recurso local ausente: ${value}`);
  }

  for (const match of html.matchAll(/<input\b[^>]*type="tel"[^>]*pattern="([^"]+)"[^>]*>/g)) {
    try {
      const pattern = new RegExp(`^(?:${match[1]})$`, 'v');
      if (pattern.test('()      ()')) fail(file, 'telefone aceita valor sem números');
      if (!pattern.test('(51) 99999-9999')) fail(file, 'telefone rejeita exemplo válido');
    } catch (error) {
      fail(file, `pattern de telefone inválido: ${error.message}`);
    }
  }
}

try {
  JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
} catch (error) {
  fail('vercel.json', error.message);
}

const sitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
if (!sitemap.includes('<lastmod>')) fail('sitemap.xml', 'sem datas de atualização');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Auditoria local concluída em ${htmlFiles.length} páginas.`);
