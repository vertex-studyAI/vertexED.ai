import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { selectTheme } from './theme-controls';

test('application diagram captures keep titles and language glyphs clear of sticky navigation', async ({ page }, info) => {
  test.setTimeout(120000);
  const manifest = JSON.parse(await readFile('public/learning-library/manifest.json', 'utf8'));
  const ids = ['atomic-models', 'hindi-sentence-structure', 'words-in-context'];
  const entries = manifest.entries.filter((entry: { id: string }) => ids.includes(entry.id));
  await page.route('**/learning-library/manifest.json', route => route.fulfill({ json: { ...manifest, entries } }));
  await page.route('**/learning-library/*.json', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/manifest.json')) return route.fulfill({ json: { ...manifest, entries } });
    if (entries.some((entry: { json: string }) => entry.json === path)) return route.fulfill({ contentType: 'application/json', body: await readFile(`public${path}`, 'utf8') });
    return route.continue();
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const entry of entries) {
    const lesson = JSON.parse(await readFile(`public${entry.json}`, 'utf8'));
    await page.goto(`/resources/foundations/${entry.id}`, { waitUntil: 'domcontentloaded' });
    const diagram = page.getByRole('figure', { name: lesson.diagrams.at(-1).title });
    await expect(diagram).toBeVisible();
    for (const width of [1440, 1024, 390]) {
      // A tall capture viewport fits the complete diagram beneath the real sticky
      // navigation. The main reader suite separately checks 900px-high viewports.
      await page.setViewportSize({ width, height: 1400 });
      for (const theme of ['light', 'dark'] as const) {
        await selectTheme(page, theme);
        const banner = await page.getByRole('banner').boundingBox();
        await diagram.evaluate((element, offset) => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - offset, behavior: 'instant' }), (banner?.height ?? 140) + 24);
        const bounds = (await diagram.boundingBox())!;
        const chrome = (await page.getByRole('banner').boundingBox())!;
        expect(bounds.y).toBeGreaterThanOrEqual(chrome.y + chrome.height);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(1400);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
        await diagram.screenshot({ path: info.outputPath(`${entry.id}-${width}-${theme}.png`), animations: 'disabled' });
      }
    }
  }
});
