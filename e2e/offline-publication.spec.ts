import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('real offline cache reopens the app, excludes held content and preserves private storage', async ({ page, context }, info) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/study-tools');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const panel = page.getByRole('region', { name: 'Offline study' });
  await expect(panel.getByText('The app and available public materials are saved offline on this device.', { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => localStorage.setItem('vertexed-private-offline-fixture', 'Keep my private draft.'));
  await context.setOffline(true);
  await page.reload();
  await expect(panel.getByText('Offline', { exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Check for updates', exact: true })).toBeDisabled();
  await expect(page.getByText('Formula references are awaiting subject review', { exact: true })).toBeVisible();
  await page.goto('/myp/subjects/physics');
  await expect(page.getByText('This topic is awaiting subject review.', { exact: true })).toBeVisible();
  await page.goto('/resources/ib-math-aa-ai-guide');
  await expect(page.getByText('Awaiting subject review', { exact: true })).toBeVisible();
  const inventory = await page.evaluate(async () => {
    const names = (await caches.keys()).filter(name => name.startsWith('vertexed-public-v1-'));
    return Promise.all(names.map(async name => (await (await caches.open(name)).keys()).map(request => new URL(request.url).pathname)));
  });
  expect(inventory).toHaveLength(1);
  expect(inventory[0]).toContain('/index.html');
  expect(inventory[0].some(path => /^\/(api|auth|ap-content|myp5-content|study-guides)\//.test(path) && path !== '/myp5-content/manifest.json')).toBe(false);
  expect(inventory[0].every(path => path.startsWith('/assets/') || ['/index.html', '/logo.png', '/app-mark.svg', '/favicon.ico', '/myp5-content/manifest.json'].includes(path))).toBe(true);
  const catalogue = await page.evaluate(async () => (await fetch('/myp5-content/manifest.json')).json());
  expect(catalogue.subjects).toEqual([]);
  await page.goto('/study-tools');
  await panel.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('offline-held-content-390.png'), animations: 'disabled' });
  const remove = panel.getByRole('button', { name: 'Remove offline copy', exact: true });
  await remove.focus();
  await page.keyboard.press('Enter');
  await expect(panel.getByRole('button', { name: 'Keep offline copy', exact: true })).toBeFocused();
  await panel.getByRole('button', { name: 'Confirm removal', exact: true }).click();
  await expect(panel.getByText('The offline copy is turned off on this device.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('vertexed-private-offline-fixture'))).toBe('Keep my private draft.');
  expect(await page.evaluate(async () => (await caches.keys()).filter(name => name.startsWith('vertexed-public-v1-')))).toEqual([]);
  await context.setOffline(false);
});
