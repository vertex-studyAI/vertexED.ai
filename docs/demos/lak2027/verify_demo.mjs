import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
if (!process.argv[2]) throw new Error('Usage: node verify_demo.mjs NEW_OUTPUT_DIRECTORY');
const out = path.resolve(process.argv[2]);
await mkdir(out, { recursive: false });
const mime = { '.html': 'text/html', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.md': 'text/plain' };
const server = createServer(async (request, response) => {
  const file = path.resolve(root, `.${new URL(request.url, 'http://localhost').pathname}`);
  if (!file.startsWith(`${root}/`)) { response.writeHead(403).end(); return; }
  try { response.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream'); response.end(await readFile(file)); }
  catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/docs/demos/lak2027/index.html`;
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1080 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(String(error)));
const expectCounts = async (a, r, i) => {
  assert.equal(await page.locator('#accepted').textContent(), String(a));
  assert.equal(await page.locator('#rejected').textContent(), String(r));
  assert.equal(await page.locator('#incomplete').textContent(), String(i));
};
await page.goto(url);
await page.locator('#record-rows tr').first().waitFor();
await expectCounts(3, 3, 1);
await page.screenshot({ path: `${out}/1440-light.png`, fullPage: true });
await page.screenshot({ path: `${out}/movie-01.png` });
await page.locator('#missing').focus();
await page.keyboard.press('Space');
await expectCounts(2, 4, 1);
assert.match(await page.locator('#status').textContent(), /missing pre-score rejects/);
await page.screenshot({ path: `${out}/movie-02.png` });
await page.keyboard.press('Space');
await expectCounts(3, 3, 1);
await page.screenshot({ path: `${out}/movie-03.png` });
await page.locator('#withdraw').click();
await expectCounts(1, 3, 0);
assert.equal(await page.locator('#record-rows tr').count(), 4);
assert.equal(await page.locator('#missing').isDisabled(), true);
await page.screenshot({ path: `${out}/movie-04.png` });
await page.locator('#reset').click();
await expectCounts(3, 3, 1);
await page.locator('summary').click();
const pending = page.waitForEvent('download');
await page.locator('#download').click();
const download = await pending;
await download.saveAs(`${out}/aggregate.json`);
const json = JSON.parse(await readFile(`${out}/aggregate.json`, 'utf8'));
assert.equal(json.metadata.participant_rows_included, false);
assert.equal(json.metadata.session_rows_included, false);
assert.equal(json.sessions, undefined);
assert(!JSON.stringify(json).includes('example_A'));
assert.equal(json.metadata.accepted_session_count, 3);
await page.locator('#export-title').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}/movie-05.png` });
await page.locator('summary').click();
await page.evaluate(() => window.scrollTo(0, 0));
const views = [];
for (const config of [
  { width: 1024, height: 1000, colorScheme: 'dark', reducedMotion: 'no-preference' },
  { width: 390, height: 844, colorScheme: 'light', reducedMotion: 'reduce' },
]) {
  await page.setViewportSize({ width: config.width, height: config.height });
  await page.emulateMedia({ colorScheme: config.colorScheme, reducedMotion: config.reducedMotion });
  await page.screenshot({ path: `${out}/${config.width}-${config.colorScheme}.png`, fullPage: true });
  const metrics = await page.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth,
    animations: document.getAnimations().length, desk_right:document.querySelector('.desk').getBoundingClientRect().right,
    margin_right:document.querySelector('.margin').getBoundingClientRect().right,
    buttons: [...document.querySelectorAll('button')].map(b => ({ w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height })) }));
  assert(metrics.scroll <= metrics.viewport);
  assert(metrics.margin_right <= metrics.desk_right);
  assert(metrics.buttons.every(b => b.h >= 44));
  if (config.reducedMotion === 'reduce') assert.equal(metrics.animations, 0);
  views.push({ ...config, ...metrics });
}
assert.deepEqual(errors, []);
const files = ['fixture.mjs','demo.mjs','index.html','style.css'];
const hashes = {};
for (const file of files) hashes[file] = createHash('sha256').update(await readFile(`${root}/docs/demos/lak2027/${file}`)).digest('hex');
hashes.analytics_core = createHash('sha256').update(await readFile(`${root}/src/lib/pilotAnalyticsCore.mjs`)).digest('hex');
const receipt = { checked_at: new Date().toISOString(), node: process.version, browser: await browser.version(),
  result: 'PASS', evidence_type: 'constructed interactive software demonstration',
  scenarios: { initial:[3,3,1], missing_pre_score:[2,4,1], restored_zero:[3,3,1], withdrawn_A:[1,3,0], reset:[3,3,1] },
  count_order:['accepted_sessions','rejected_records','incomplete_sessions'],
  keyboard_activation: 'Space on focused missing-score button passed in both directions',
  aggregate_download: 'Parsed JSON excludes participant/session rows and example identifiers', views, page_errors: errors, hashes };
await writeFile(`${out}/verification.json`, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify({ result:receipt.result, out, browser:receipt.browser, scenarios:receipt.scenarios }));
await browser.close();
await new Promise(resolve => server.close(resolve));
