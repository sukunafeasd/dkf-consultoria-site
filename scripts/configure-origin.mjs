import { readFileSync, writeFileSync } from 'node:fs';

const value = process.argv[2];
if (!value) throw new Error('Informe a URL publica: node scripts/configure-origin.mjs https://seu-dominio');
const url = new URL(value);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
  throw new Error('Use apenas uma origem HTTPS, sem caminho, senha, parametros ou fragmento.');
}
const homePath = new URL('../index.html', import.meta.url);
const home = readFileSync(homePath, 'utf8');
const canonical = home.match(/<link rel="canonical" href="(https:\/\/[^\"]+)"/);
if (!canonical) throw new Error('Origem atual nao encontrada no canonical da pagina inicial.');
const previous = new URL(canonical[1]).origin;
const files = ['index.html', 'servicos.html', 'obrigado.html', '404.html', 'privacidade.html', 'termos.html', 'reembolso.html', 'robots.txt', 'sitemap.xml', '.well-known/security.txt'];
const updates = files.map(name => {
  const path = new URL(`../${name}`, import.meta.url);
  return { path, text: readFileSync(path, 'utf8').split(previous).join(url.origin) };
});
for (const { path, text } of updates) writeFileSync(path, text);
console.log(`URLs publicas atualizadas: ${previous} -> ${url.origin}. Links Kiwify e contatos preservados. Nenhum deploy foi realizado.`);
