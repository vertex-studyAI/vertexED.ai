import { expect, test } from '@playwright/test';

for (const width of [360, 390, 430, 768, 1024, 1280, 1440]) {
  test(`workbook landing and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'A clearer path to your next exam.' })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Example study session' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    if (width < 1280) {
      const menu = page.getByRole('button', { name: 'Open navigation menu' });
      await menu.click();
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeFocused();
    }
    await page.screenshot({ path: `test-results/workbook-${width}.png`, fullPage: true });
    await page.goto('/features');
    await expect(page.getByRole('heading', { name: 'Find the right tool for the task.' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  });
}
