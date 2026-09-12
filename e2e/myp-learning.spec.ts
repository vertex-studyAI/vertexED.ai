import { expect, test } from '@playwright/test';

const viewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 900 },
  { width: 390, height: 844 },
] as const;

test('MYP hub and lesson remain usable across required viewports', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/myp');
    await expect(page.getByRole('heading', { name: 'Every subject. A stronger place to start.' })).toBeVisible();
    await expect(page.locator('.myp-subject-card')).toHaveCount(17);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.goto('/myp/subjects/physics/motion');
    await expect(page.getByRole('heading', { name: 'Make an attempt.' })).toBeAttached();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('MYP practice works by keyboard and honours reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/physics/motion');

  const answer = page.getByLabel('Your answer', { exact: true });
  await answer.fill('Average speed is 600 divided by 150, which is 4 m/s.');
  await answer.press('Tab');
  await expect(page.getByRole('button', { name: 'Save draft' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Hints' })).toBeVisible();

  await page.goto('/myp');
  const transitionDuration = await page.locator('.myp-subject-card').first().evaluate(
    (element) => getComputedStyle(element).transitionDuration,
  );
  expect(transitionDuration).toBe('0s');
});
