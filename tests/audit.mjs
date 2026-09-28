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
  const idSet = new Set(ids);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) fail(file, `IDs duplicados: ${[...new Set(duplicates)].join(', ')}`);

  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    if (!idSet.has(match[1])) fail(file, `âncora interna sem destino: #${match[1]}`);
  }

  if (/<section\b[^>]*id="faq"[\s\S]*?<details\s+open\b/.test(html)) {
    fail(file, 'FAQ não deve abrir perguntas por padrão');
  }

  for (const match of html.matchAll(/<img\b([^>]+)>/g)) {
    if (!/\balt="[^"]*"/.test(match[1])) fail(file, 'imagem sem texto alternativo');
    if (!/\bwidth="\d+"/.test(match[1]) || !/\bheight="\d+"/.test(match[1])) {
      fail(file, 'imagem sem width e height');
    }
  }

  for (const match of html.matchAll(/<a\b([^>]+target="_blank"[^>]*)>/g)) {
    if (!/rel="[^"]*noopener[^"]*"/.test(match[1])) fail(file, 'link externo sem noopener');
  }

  for (const match of html.matchAll(/<a\b([^>]*)aria-label="([^"]+)"([^>]*)>([^<]+)<\/a>/g)) {
    const visibleText = match[4].trim().toLowerCase();
    if (visibleText && !match[2].toLowerCase().includes(visibleText)) {
      fail(file, `nome acessível não contém o texto visível: ${visibleText}`);
    }
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

  if (html.includes('<form')) {
    for (const match of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)) {
      const attrs = match[1];
      const body = match[2];
      if (!/\bdata-secure-form\b/.test(attrs)) fail(file, 'formulário sem proteção JS progressiva');
      if (!/name="form_started_at"/.test(body)) fail(file, 'formulário sem timestamp anti-spam');
      if (!/name="_gotcha"/.test(body)) fail(file, 'formulário sem honeypot');
      if (!/data-form-status/.test(body) || !/aria-live="polite"/.test(body)) {
        fail(file, 'formulário sem status acessível');
      }
      if (/<textarea\b/.test(body) && !/<textarea\b[^>]*\bminlength="\d+"/.test(body)) {
        fail(file, 'textarea sem minlength');
      }
      if (/<textarea\b/.test(body) && !/<textarea\b[^>]*\bmaxlength="\d+"/.test(body)) {
        fail(file, 'textarea sem maxlength');
      }
    }
  }
}

const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
if (!home.includes('name="robots" content="index, follow, max-image-preview:large"')) {
  fail('index.html', 'sem robots indexável com preview grande');
}
if (!home.includes('name="twitter:image:alt"')) fail('index.html', 'sem texto alternativo para imagem do Twitter Card');

const store = readFileSync(new URL('../servicos.html', import.meta.url), 'utf8');
if (!store.includes('name="robots" content="index, follow, max-image-preview:large"')) {
  fail('servicos.html', 'sem robots indexável com preview grande');
}
if (!store.includes('name="twitter:image:alt"')) fail('servicos.html', 'sem texto alternativo para imagem do Twitter Card');
if (/Planner Digital 2025|Reels e Stories 2025|TikTok do Zero ao Viral 2025/.test(store)) {
  fail('servicos.html', 'contém produto datado retirado da vitrine');
}
if (store.includes('https://pay.kiwify.com.br/ipSMY6X')) {
  fail('servicos.html', 'expõe checkout genérico antes da confirmação do escopo');
}
const productCards = [...store.matchAll(/<article class="digital-card[^>]+itemscope itemtype="https:\/\/schema.org\/Product"/g)];
if (productCards.length !== 13) fail('servicos.html', `esperados 13 produtos estruturados; encontrados ${productCards.length}`);

for (const requiredFile of ['site.webmanifest', 'apple-touch-icon.png', 'favicon-192.png', 'favicon-512.png']) {
  if (!existsSync(new URL(`../${requiredFile}`, import.meta.url))) fail(requiredFile, 'arquivo obrigatório ausente');
}

const notFound = readFileSync(new URL('../404.html', import.meta.url), 'utf8');
if (!notFound.includes('name="description"')) fail('404.html', 'sem meta description');
if (!notFound.includes('noindex, follow')) fail('404.html', 'sem noindex follow');

const thanks = readFileSync(new URL('../obrigado.html', import.meta.url), 'utf8');
if (!thanks.includes('name="description"')) fail('obrigado.html', 'sem meta description');
if (!thanks.includes('noindex, follow')) fail('obrigado.html', 'sem noindex follow');

const manifest = JSON.parse(readFileSync(new URL('../site.webmanifest', import.meta.url), 'utf8'));
if (!manifest.icons?.every((icon) => icon.purpose?.includes('maskable'))) {
  fail('site.webmanifest', 'ícones sem finalidade maskable');
}

const securityTxt = readFileSync(new URL('../.well-known/security.txt', import.meta.url), 'utf8');
for (const requiredLine of ['Contact:', 'Policy:', 'Canonical:', 'Expires:']) {
  if (!securityTxt.includes(requiredLine)) fail('security.txt', `sem ${requiredLine}`);
}

try {
  JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
} catch (error) {
  fail('vercel.json', error.message);
}

const sitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
if (!sitemap.includes('<lastmod>')) fail('sitemap.xml', 'sem datas de atualização');
if (!sitemap.includes('<lastmod>2026-09-28</lastmod>')) fail('sitemap.xml', 'datas de atualização desatualizadas');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Auditoria local concluída em ${htmlFiles.length} páginas.`);
