import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = mkdtempSync(resolve(tmpdir(), 'dkf-origin-test-'));
const files = ['index.html', 'servicos.html', 'obrigado.html', '404.html', 'privacidade.html', 'termos.html', 'reembolso.html', 'robots.txt', 'sitemap.xml', '.well-known/security.txt'];
try {
  mkdirSync(resolve(root, 'scripts'));
  mkdirSync(resolve(root, '.well-known'));
  for (const file of [...files, 'scripts/configure-origin.mjs']) copyFileSync(new URL(`../${file}`, import.meta.url), resolve(root, file));
  const before = readFileSync(resolve(root, 'servicos.html'), 'utf8');
  const links = value => [...value.matchAll(/https:\/\/pay\.kiwify\.com\.br\/[^"\s]+/g)].map(match => match[0]);
  const script = resolve(root, 'scripts/configure-origin.mjs');
  execFileSync(process.execPath, [script, 'https://dkf-test.example']);
  for (const file of files) assert.ok(!readFileSync(resolve(root, file), 'utf8').includes('https://dkf-consultoria.vercel.app'));
  const after = readFileSync(resolve(root, 'servicos.html'), 'utf8');
  assert.deepEqual(links(after), links(before));
  for (const url of ['http://unsafe.example', 'https://user:secret@example.com', 'https://example.com/path', 'https://example.com/?key=value']) {
    assert.throws(() => execFileSync(process.execPath, [script, url], { stdio: 'pipe' }));
    assert.equal(readFileSync(resolve(root, 'servicos.html'), 'utf8'), after);
  }
  console.log('PASS domain configuration: URLs changed only in an isolated copy; checkout links unchanged; invalid origins rejected.');
} finally {
  assert.ok(root.startsWith(resolve(tmpdir()) + sep + 'dkf-origin-test-'));
  rmSync(root, { recursive: true, force: true });
}
