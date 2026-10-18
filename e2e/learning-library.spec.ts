import { expect, test } from '@playwright/test';

test('learning library links every content collection at required widths', async ({ page }) => {
  test.setTimeout(90_000);
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/resources');
    await expect(page.getByRole('heading', { name: 'Find your topic. Take the next step.' })).toBeVisible();
    await expect(page.getByText('205', { exact: true })).toBeVisible();
    await expect(page.getByText('616', { exact: true })).toBeVisible();
    await expect(page.getByTestId('library-item')).toHaveCount(17);
    await expect(page.locator('html')).toHaveJSProperty('scrollWidth', width);
    await page.screenshot({ path: `test-results/learning-library-${width}.png`, fullPage: true });
  }

  await page.getByRole('button', { name: /Curriculum desks/ }).click();
  await expect(page.getByTestId('library-item')).toHaveCount(48);
  await page.getByRole('button', { name: /Editorial guides/ }).click();
  await expect(page.getByTestId('library-item')).toHaveCount(23);
  await page.getByRole('button', { name: /Study tools/ }).click();
  await expect(page.getByTestId('library-item')).toHaveCount(11);
  await page.getByRole('button', { name: /Archives/ }).click();
  await expect(page.getByTestId('library-item')).toHaveCount(3);
});

test('learning library supports direct topic search, keyboard filtering and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/resources');

  const search = page.getByRole('searchbox', { name: 'Search the learning library' });
  await search.fill('probability');
  await expect(page.locator('a[href="/myp/subjects/mathematics/probability"]')).toBeVisible();
  await search.fill('');
  await search.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /Curriculum desks/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('library-item')).toHaveCount(48);

  const transitionDuration = await page.getByTestId('library-item').first().evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).transitionDuration) || 0,
  );
  expect(transitionDuration).toBeLessThanOrEqual(0.001);
});
