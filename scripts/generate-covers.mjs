import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const products = [
  { file: 'automacao-ia', label: 'IA E AUTOMAÇÃO', lines: ['Automação com IA', 'para tarefas do', 'dia a dia'], accent: '#25c7d9' },
  { file: 'planner-digital', label: 'PRODUTIVIDADE', lines: ['Planner digital', 'metas rotina e', 'organização'], accent: '#25c7d9' },
  { file: 'reels-stories', label: 'INSTAGRAM', lines: ['Reels e Stories', 'planejamento de', 'conteúdo'], accent: '#f5b942' },
  { file: 'freelancer-digital', label: 'FREELANCER', lines: ['Freelancer digital', 'Portfólio e', 'prospecção'], accent: '#1fbf75' },
  { file: 'afiliados', label: 'AFILIADOS', lines: ['Renda com afiliados', 'Fundamentos para', 'começar'], accent: '#1fbf75' },
  { file: 'scripts-copy', label: 'COPYWRITING', lines: ['100 scripts', 'de copy para', 'vender nas redes'], accent: '#f5b942' },
  { file: 'marketing-digital', label: 'MARKETING', lines: ['Marketing digital', 'Guia introdutório'], accent: '#25c7d9' },
  { file: 'controle-financeiro', label: 'FINANÇAS', lines: ['Controle financeiro', 'Planilha prática'], accent: '#1fbf75' },
  { file: 'tiktok-viral', label: 'TIKTOK', lines: ['Planejamento', 'para vídeos', 'curtos'], accent: '#25c7d9' },
  { file: 'chatgpt-conteudo', label: 'CONTEÚDO COM IA', lines: ['ChatGPT para', 'criadores de', 'conteúdo'], accent: '#25c7d9' },
  { file: 'pack-luxo-viral', label: 'PACK DE VÍDEOS', lines: ['Pack Luxo Viral', '300 clipes para', 'vídeos curtos'], accent: '#f5b942' }
];

const logo = (await readFile('favicon.svg')).toString('base64');
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

for (const product of products) {
  const title = product.lines.map((line, index) =>
    `<text x="74" y="${292 + index * 82}" fill="#f8fbff" font-size="${index === 0 ? 58 : 66}" font-weight="800" font-family="Segoe UI, Arial, sans-serif">${escape(line)}</text>`
  ).join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
      <rect width="1200" height="750" fill="#07111f"/>
      <rect x="0" y="0" width="18" height="750" fill="${product.accent}"/>
      <circle cx="1060" cy="110" r="260" fill="${product.accent}" opacity=".12"/>
      <circle cx="1090" cy="670" r="340" fill="#1e6fff" opacity=".11"/>
      <path d="M760 590h350M830 530h280M900 470h210" stroke="${product.accent}" stroke-width="7" stroke-linecap="round" opacity=".75"/>
      <rect x="72" y="62" width="82" height="82" rx="18" fill="#0b1c31"/>
      <image href="data:image/svg+xml;base64,${logo}" x="72" y="62" width="82" height="82"/>
      <text x="178" y="98" fill="#f8fbff" font-size="29" font-weight="800" font-family="Segoe UI, Arial, sans-serif">DKF</text>
      <text x="178" y="128" fill="#aab7c9" font-size="19" font-weight="600" font-family="Segoe UI, Arial, sans-serif">LOJA DIGITAL</text>
      <rect x="74" y="186" width="360" height="42" rx="6" fill="${product.accent}" opacity=".16"/>
      <text x="92" y="215" fill="${product.accent}" font-size="20" font-weight="800" font-family="Segoe UI, Arial, sans-serif" letter-spacing="1">${escape(product.label)}</text>
      ${title}
      <text x="76" y="690" fill="#aab7c9" font-size="21" font-weight="600" font-family="Segoe UI, Arial, sans-serif">Material digital • acesso pela Kiwify</text>
    </svg>`;

  const image = sharp(Buffer.from(svg));
  await image.clone().jpeg({ quality: 88, mozjpeg: true }).toFile(`assets/products/${product.file}.jpg`);
  await image.clone().webp({ quality: 84 }).toFile(`assets/products/${product.file}.webp`);
  await image.clone().resize({ width: 480 }).webp({ quality: 82 }).toFile(`assets/products/${product.file}-480.webp`);
}

console.log(`${products.length} capas próprias da DKF geradas.`);
