import { expect, test } from '@playwright/test';

for (const width of [360, 390, 430, 768, 1024, 1280, 1440]) {
  test(`workbook landing and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /You’ve read it\.\s*Now try it\./ })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Example study session' })).toBeVisible();
    await page.getByRole('tab', { name: '02 Review' }).click();
    await expect(page.getByRole('heading', { name: 'Name the gradient and the membrane.' })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: '03 Retry' })).toBeFocused();
    await expect(page.getByRole('heading', { name: 'Try a related question without notes.' })).toBeVisible();
    await page.getByRole('tab', { name: '01 Attempt' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    if (width < 1280) {
      const menu = page.getByRole('button', { name: 'Open navigation menu' });
      await menu.click();
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeFocused();
    }
    await page.screenshot({ path: `test-results/workbook-${width}.png`, fullPage: true });
    if ([390, 1024, 1440].includes(width)) await page.screenshot({ path: `test-results/identity-${width}.png` });
    await page.goto('/features');
    await expect(page.getByRole('heading', { name: 'Find the right tool for the task.' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  });
}

test('revision trace supports dark mode, reduced motion and enlarged text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  });
  await page.getByRole('tab', { name: '02 Review' }).click();
  await expect(page.locator('.revision-trace').getByRole('tabpanel')).toBeVisible();
  expect(await page.locator('.trace-panel[data-state="active"]').evaluate((element) => parseFloat(getComputedStyle(element).animationDuration))).toBeLessThan(.01);
  await page.screenshot({ path: 'test-results/identity-dark.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
});
