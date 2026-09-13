import { expect, test } from '@playwright/test';

for (const width of [1440, 1024, 390]) for (const theme of ['light', 'dark']) {
  test(`revision workspace ${width} ${theme}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(value => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(value); }, theme);
    const card = page.getByLabel('Example revision workspace');
    await expect(card).toHaveCount(1);
    await card.getByRole('button', { name: /Mathematics/ }).click();
    await card.getByRole('button', { name: 'Review', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(card).toContainText('Define x, state the currency');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await card.screenshot({ path: testInfo.outputPath(`card-${width}-${theme}.png`) });
    await page.screenshot({ path: testInfo.outputPath(`landing-${width}-${theme}.png`), fullPage: true });
    await page.goto('/features');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.screenshot({ path: testInfo.outputPath(`features-${width}-${theme}.png`) });
    expect(errors).toEqual([]);
  });
}

test('founder credits are equal and sample testimonials are explicit', async ({ page }) => {
  await page.goto('/about');
  for (const name of ['Ritayush', 'Ryan', 'Pratyush', 'Aadi']) await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.getByText('Co-founder', { exact: true })).toHaveCount(4);
  await page.goto('/');
  await expect(page.getByText(/These are not customer endorsements/)).toBeVisible();
});
