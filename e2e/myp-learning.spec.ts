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
    await expect(page.getByRole('heading', { name: 'Depth is labelled, not implied.' })).toBeVisible();
    await expect(page.getByText('36', { exact: true })).toBeVisible();
    await expect(page.getByText('108', { exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/myp-hub-${viewport.width}.png`, fullPage: true, animations: 'disabled' });

    await page.goto('/myp/subjects/physics/motion');
    await expect(page.getByRole('heading', { name: 'Place the idea.' })).toBeAttached();
    await expect(page.getByRole('heading', { name: 'Make an attempt.' })).toBeAttached();
    await expect(page.getByRole('heading', { name: 'Make it survive the page.' })).toBeAttached();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/myp-lesson-${viewport.width}.png`, fullPage: true, animations: 'disabled' });
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

test('MYP self-review records evidence checks and restores a scheduled retry', async ({ page }) => {
  await page.goto('/myp/subjects/physics/motion');
  await page.getByLabel('Your answer', { exact: true }).fill('Average speed is distance divided by elapsed time, so 600 m divided by 150 s gives 4 m/s.');
  await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
  const criterion = page.getByRole('checkbox').first();
  await criterion.check();
  await page.getByLabel('Confidence after checking').selectOption('developing');
  await page.getByRole('button', { name: 'Retry in 3 days' }).click();
  await expect(page.getByText(/Review saved\. Retry due .* self-report, not a mastery score\./)).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('Confidence after checking')).toHaveValue('developing');
  await expect(criterion).toBeChecked();
  await expect(page.getByText(/Review restored\. Retry due/)).toBeVisible();
});

test('unreviewed imported guides fail closed and route learners to original modules', async ({ page }) => {
  await page.goto('/study-guides/myp/biology/cells-and-organisation');
  await expect(page.getByRole('heading', { name: 'Use the original learning modules.' })).toBeVisible();
  await expect(page.getByText(/245 imported guide pages are unavailable/)).toBeVisible();
  await expect(page.locator('.study-guides-markdown')).toHaveCount(0);
  await page.getByRole('link', { name: 'Open MYP 5 learning modules' }).click();
  await expect(page).toHaveURL(/\/myp$/);
  await expect(page.getByRole('heading', { name: 'Every subject. A stronger place to start.' })).toBeVisible();
});
