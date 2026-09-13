import { expect, test } from '@playwright/test';

for (const width of [1440, 1024, 390]) {
  test(`Apex learning workspace and navigation at ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open Apex study shortcuts' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('What are we working on?')).toBeVisible();
    await dialog.getByRole('button', { name: /Try the cubic/ }).click();
    await dialog.getByRole('button', { name: 'Next card' }).click();
    await expect(dialog.getByRole('heading', { name: 'Work through a complete example' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Next card' }).click();
    await dialog.getByLabel('Your working').fill('Group the terms');
    await dialog.getByText('Show hint', { exact: true }).click();
    await expect(dialog.getByText(/Look for the common factor/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Previous', exact: true }).click();
    await dialog.getByRole('button', { name: 'Next card' }).click();
    await expect(dialog.getByLabel('Your working')).toHaveValue('Group the terms');
    await expect(dialog.getByRole('button', { name: 'Close Apex study shortcuts' })).toBeInViewport();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(value); }, theme);
      await page.screenshot({ path: testInfo.outputPath(`apex-${width}-${theme}.png`) });
    }
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open Apex study shortcuts' })).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath(`navbar-${width}.png`) });
  });
}

test('Google request offers an explicit confirmation without starting OAuth', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Apex study shortcuts' }).click();
  await page.getByLabel('What are we working on?').fill('Log me in with Google and prepare my notes');
  await page.getByRole('button', { name: 'Ask Apex', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  await expect(page.getByText(/No study action has run yet/)).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test('Features exposes a working lesson and keeps the fluid layer non-interactive', async ({ page }) => {
  await page.goto('/features');
  await expect(page.getByRole('heading', { name: /for the way you learn/ })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Learning workspace' })).toBeVisible();
  await page.getByRole('button', { name: 'Next card' }).click();
  await expect(page.getByRole('heading', { name: 'Work through a complete example' })).toBeVisible();
  await expect.poll(() => page.locator('.landing-ink').evaluate(element => getComputedStyle(element).pointerEvents)).toBe('none');
});
