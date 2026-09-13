import { expect, test } from '@playwright/test';

for (const width of [1440, 1024, 390]) {
  test(`navigation, discoverable lens and expandable study cards at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(value); }, theme);
      await page.screenshot({ path: info.outputPath(`opening-${width}-${theme}.png`) });
    }
    const mainNav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
    if (width < 1000) {
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
      await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Try the lens' }).click();
    } else await mainNav.getByRole('link', { name: 'Try the lens' }).click();
    await expect(page).toHaveURL(/#concept-lens$/);
    await expect(page.getByRole('button', { name: 'Show the whole curve' })).toBeInViewport();
    await page.locator('.study-gallery-card').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Find the missing factor.' })).toBeVisible();
    await dialog.getByLabel('Your reasoning').fill('Group the terms, then factor x² − 1.');
    await dialog.getByText('Give me a hint', { exact: true }).click();
    await dialog.getByRole('button', { name: 'Compare with the explanation' }).click();
    await expect(dialog.getByText('Use it somewhere new')).toBeVisible();
    await expect(dialog.getByLabel('Your reasoning')).toHaveValue('Group the terms, then factor x² − 1.');
    await page.screenshot({ path: info.outputPath(`example-${width}.png`) });
    await page.keyboard.press('Escape');
    await expect(page.locator('.study-gallery-card').first()).toBeFocused();
    await page.locator('.study-gallery-card').nth(1).click();
    await expect(page.getByLabel('Your reasoning')).toHaveValue('');
    await page.keyboard.press('Escape');
    if (width < 1000) {
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('study field and image trail are bounded and decorative', async ({ page }) => {
  await page.goto('/#study-examples');
  const header = page.locator('.study-gallery>header');
  await header.scrollIntoViewIfNeeded();
  const box = await header.boundingBox();
  await page.mouse.move(box!.x + 50, box!.y + 70);
  await page.mouse.move(box!.x + 180, box!.y + 120, { steps: 8 });
  await expect.poll(() => page.locator('.study-gallery-trail img').count()).toBeGreaterThan(0);
  expect(await page.locator('.study-gallery-trail img').count()).toBeLessThanOrEqual(4);
  await expect(page.locator('.study-field')).toHaveCSS('pointer-events', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.study-gallery-trail img')).toHaveCount(0);
  await expect(page.locator('.study-field')).toBeHidden();
});
