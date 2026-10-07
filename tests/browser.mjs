import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };
const events = [];
const config = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'));
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/event') {
      let body = '';
      for await (const chunk of req) body += chunk;
      events.push(JSON.parse(body));
      res.writeHead(204).end();
      return;
    }
    const name = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    const file = resolve(root, extname(name) ? name : `${name}.html`);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || !types[extname(file)]) {
      res.writeHead(404).end();
      return;
    }
    for (const { key, value } of config.headers[0].headers) res.setHeader(key, value);
    res.setHeader('Content-Type', types[extname(file)]);
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/servicos', '/obrigado', '/404', '/privacidade', '/termos', '/reembolso']) {
      await page.goto(origin + path);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${path}/${width}: overflow`);
      assert.equal(await page.locator('main h1').count(), 1);
      if (path === '/' || path === '/servicos') {
        await page.screenshot({ path: resolve(tmpdir(), `dkf-ready-${width}-${path === '/' ? 'home' : 'store'}.png`), fullPage: true });
      }
    }
  }
  assert.equal(events.some(event => event.event === 'lead_success'), false, 'Opening the thank-you page is not a submitted contact');
  await page.goto(origin + '/');
  await page.locator('[data-menu-button]').click();
  assert.equal(await page.locator('[data-menu-button]').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-mobile-menu]').isVisible(), false);
  assert.equal(await page.locator('[data-menu-button]').evaluate(el => el === document.activeElement), true);

  await page.goto(origin + '/servicos?categoria=ia');
  assert.ok(await page.locator('[data-product-card]:visible').count() > 0);
  assert.equal(await page.locator('[data-product-card]:visible').evaluateAll(cards => cards.every(card => card.dataset.category === 'ia')), true);
  await page.locator('[data-store-search]').fill('no-product-matches-this-text');
  assert.equal(await page.locator('[data-product-card]:visible').count(), 0);
  await page.locator('[data-store-search]').fill('');
  await page.locator('.service-select[data-service="Edição de fotos"]').click();
  assert.equal(await page.locator('#selectServico').inputValue(), 'Edição de fotos');
  assert.match(await page.locator('#selectPacote').inputValue(), /25/);

  await page.goto(origin + '/');
  assert.equal(await page.locator('[name="_next"]').inputValue(), origin + '/obrigado');
  await page.locator('[name="nome"]').fill('Teste local');
  await page.locator('[name="whatsapp"]').fill('(51) 99999-9999');
  await page.locator('[name="mensagem"]').fill('Teste automatizado local, sem enviar dados reais.');
  await page.evaluate(() => { document.querySelector('form').dataset.startedAt = String(Date.now() - 3000); });
  let submissions = 0;
  await page.route('https://formspree.io/**', async route => {
    submissions += 1;
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Local form fixture</h1>' });
  });
  assert.equal(await page.evaluate(() => {
    const form = document.querySelector('form');
    const first = new Event('submit', { cancelable: true });
    const second = new Event('submit', { cancelable: true });
    form.dispatchEvent(first);form.dispatchEvent(second);
    return !first.defaultPrevented && second.defaultPrevented;
  }), true, 'A second submit must be blocked while sending');
  assert.equal(submissions, 0, 'No real contact request was sent');
  await page.goto(origin + '/obrigado');
  await page.waitForFunction(() => sessionStorage.getItem('dkf_lead_pending') === '');
  await page.reload();
  await page.waitForLoadState('networkidle');
  assert.equal(events.filter(event => event.event === 'lead_success').length, 1);

  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
  });
  await page.goto(origin + '/obrigado');
  assert.deepEqual(errors, []);
  console.log('PASS browser: 7 pages, desktop/mobile, filters, briefing, form duplicate guard, dynamic return URL, optional storage; no real messages or payments.');
} finally {
  await browser?.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
