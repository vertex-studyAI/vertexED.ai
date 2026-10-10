import { expect, test } from '@playwright/test';

test('adaptive controls produce a misconception-specific follow-up without horizontal overflow', async ({ page }) => {
  await page.goto('/features');
  const practice = page.locator('.adaptive-practice');
  await practice.scrollIntoViewIfNeeded();
  await expect(practice.getByRole('heading', { name: 'One problem. One traceable next step.' })).toBeVisible();

  await practice.getByLabel('Subject').selectOption('Physics');
  await practice.getByLabel('Topic').selectOption('Forces');
  await practice.getByLabel('Difficulty').selectOption('intermediate');
  await practice.getByLabel('Type').selectOption('numeric');
  await expect(practice.getByText(/5\.0.*kg.*block.*22.*N/s)).toBeVisible();

  await practice.getByLabel(/Your answer/).fill('5.8');
  await practice.getByRole('button', { name: 'Check reasoning' }).click();
  await expect(practice.getByText('friction direction', { exact: true })).toBeVisible();
  await expect(practice.getByText(/friction opposes relative sliding/i)).toBeVisible();
  await expect(practice.getByRole('button', { name: /Isolate this gap/ })).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth + 1));
});

test('adaptive practice remains usable with reduced motion at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/features');
  const practice = page.locator('.adaptive-practice');
  await practice.scrollIntoViewIfNeeded();
  await expect(practice.getByLabel('Subject')).toBeVisible();
  await practice.getByLabel('Subject').focus();
  await expect(practice.getByLabel('Subject')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
});
