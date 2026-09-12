import { expect, test } from '@playwright/test';

test('curriculum desk and Humanities studio fit the required viewports', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));

  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/curricula');
    await expect(page.getByRole('heading', { name: /Choose the course/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);

    await page.getByRole('button', { name: /DP/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: /IB DP revision desk/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Study Planner/ })).toHaveAttribute('href', '/curricula/ib-dp/study-planner');

    await page.goto('/resources/ib-myp-humanities-guide');
    await expect(page.getByRole('heading', { name: /Build an answer/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  }

  expect(runtimeErrors).toEqual([]);
});

test('Humanities studio is keyboard operable and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/resources/ib-myp-humanities-guide');

  const tabs = page.getByRole('tablist', { name: 'Humanities writing tools' });
  await tabs.getByRole('tab', { name: 'Research question' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: 'OPVL' })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Evaluate value for your investigation.' })).toBeVisible();

  const panel = page.locator('.humanities-panel:visible');
  await expect.poll(() => panel.evaluate(element => getComputedStyle(element).animationName)).toBe('none');
});

test('client-side route changes restore the page to the top', async ({ page }) => {
  await page.goto('/curricula');
  await page.locator('.curriculum-humanities-feature').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'Open the Humanities answer studio' }).click();
  await expect(page).toHaveURL(/\/resources\/ib-myp-humanities-guide$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
