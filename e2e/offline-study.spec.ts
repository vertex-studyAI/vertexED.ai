import { test, expect } from '@playwright/test';

// This suite verifies the installed public cache and must use the real worker,
// including when invoked through a fixture config that blocks workers by default.
test.use({ serviceWorkers: 'allow' });

test('installed public lessons and formula tools reopen offline without private response caches', async ({ page, context }) => {
  await page.goto('/study-tools?formula=ohm');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await expect(page.getByText('The app and public MYP and AP lessons are available offline on this device.', { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('region', { name: 'Offline study' }).getByText('Offline', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Check for updates', exact: true })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Ohm’s law', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Try a question' }).click();
  await page.getByLabel('Your answer (A)', { exact: true }).fill('0.5');
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText('That numerical value matches.', { exact: true })).toBeVisible();
  await page.goto('/myp/subjects/physics');
  await expect(page.getByRole('complementary', { name: 'Physics topics' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Build the concept', exact: true })).toBeVisible();
  const inventory = await page.evaluate(async () => {
    const names = (await caches.keys()).filter(name => name.startsWith('vertexed-public-v1-'));
    return Promise.all(names.map(async name => (await (await caches.open(name)).keys()).map(request => new URL(request.url).pathname)));
  });
  expect(inventory).toHaveLength(1);
  expect(inventory[0]).toContain('/myp5-content/physics.json');
  expect(inventory[0]).toContain('/ap-content/biology.json');
  expect(inventory[0].every(path => path.startsWith('/assets/') || path.startsWith('/myp5-content/') || path.startsWith('/ap-content/')
    || ['/index.html', '/logo.png', '/app-mark.svg', '/favicon.ico'].includes(path))).toBe(true);
  await context.setOffline(false);
});

for (const width of [1440, 1024, 390]) {
  test(`offline study controls preserve private storage and support keyboard at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/study-tools');
    await expect(page.getByText('The app and public MYP and AP lessons are available offline on this device.', { exact: true })).toBeVisible({ timeout: 30000 });
    const panel = page.getByRole('region', { name: 'Offline study' });
    await panel.scrollIntoViewIfNeeded();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(value); }, theme);
      await page.screenshot({ path: info.outputPath(`offline-${width}-${theme}.png`), animations: 'disabled' });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    if (width === 1440) {
      await panel.getByRole('button', { name: 'Check for updates', exact: true }).click();
      await expect(panel.getByText('Your offline copy is up to date.', { exact: true })).toBeVisible();
    }
    await page.evaluate(() => localStorage.setItem('private-test-sentinel', 'keep'));
    const remove = page.getByRole('button', { name: 'Remove offline copy', exact: true });
    await remove.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Keep offline copy', exact: true })).toBeFocused();
    await page.screenshot({ path: info.outputPath(`offline-${width}-remove.png`), animations: 'disabled' });
    await page.keyboard.press('Enter');
    await expect(remove).toBeFocused();
    await expect(page.getByText('The app and public MYP and AP lessons are available offline on this device.', { exact: true })).toBeVisible();
    await remove.click();
    await page.getByRole('button', { name: 'Confirm removal', exact: true }).click();
    await expect(page.getByText('The offline copy is turned off on this device.', { exact: true })).toBeVisible();
    await expect(panel.getByText('Your offline copy is up to date.', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('private-test-sentinel'))).toBe('keep');
    expect(await page.evaluate(async () => (await caches.keys()).filter(key => key.startsWith('vertexed-public-v1-')))).toEqual([]);
    await page.reload();
    await expect(page.getByText('The offline copy is turned off on this device.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Download offline copy', exact: true }).click();
    await expect(page.getByText('The app and public MYP and AP lessons are available offline on this device.', { exact: true })).toBeVisible({ timeout: 30000 });
  });
}
