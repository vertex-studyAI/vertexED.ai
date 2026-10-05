import { expect, test } from '@playwright/test';

for (const width of [1440, 1024, 390]) {
  test(`guided reasoning and masked study field remain usable at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');

    const section = page.locator('#guided-reasoning');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Do not skip to the answer. Build the reason.' })).toBeVisible();
    const firstTab = section.getByRole('tab', { name: /Vertical circle/ });
    await firstTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(section.getByRole('tab', { name: /Product and chain/ })).toHaveAttribute('aria-selected', 'true');
    await section.getByRole('button', { name: 'Open the reasoning cue' }).click();
    await expect(section.getByText(/Treat x, \(3x² \+ 1\)⁵ and e⁻ˣ as three factors/)).toBeVisible();
    await section.getByRole('button', { name: 'Next step' }).click();
    await expect(section.getByText('Step 2 / 4')).toBeVisible();
    await section.screenshot({ path: info.outputPath(`guided-${width}.png`) });

    const gallery = page.locator('#study-examples');
    await gallery.scrollIntoViewIfNeeded();
    await expect(gallery.locator('canvas')).toBeVisible();
    await page.waitForTimeout(900);
    await gallery.screenshot({ path: info.outputPath(`study-field-${width}.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(gallery.locator('canvas')).toBeVisible();
    const reducedMotionField = await gallery.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
    await page.waitForTimeout(250);
    expect(await gallery.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(reducedMotionField);
    await expect(gallery.getByRole('heading', { name: /Less passive reading\. More working it out\./ })).toBeVisible();
  });
}

test('concept lens modal has an opaque themed surface and restores focus', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open concept lens' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: /Notice the change/ });
  await expect(dialog).toBeVisible();
  const background = await dialog.evaluate(element => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  await expect(dialog.locator('.vh-lens-boundary')).toBeVisible();
  await dialog.screenshot({ path: info.outputPath('concept-lens-modal.png') });
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

for (const width of [1440, 1024, 390]) {
  test(`features, about and login remain readable at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/features');
    await expect(page.getByRole('heading', { level: 1, name: 'Find the right tool for the way you learn.' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.waitForTimeout(900);
    await page.screenshot({ path: info.outputPath(`features-${width}.png`) });

    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1, name: /Build the method/ })).toBeVisible();
    await expect(page.getByText(/biographical claims below have not been independently verified/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: info.outputPath(`about-${width}.png`) });

    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1, name: 'Pick up where you left off.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: info.outputPath(`login-${width}.png`) });
  });
}
