import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`immersive landing remains readable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'You have read it. Now try it.' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Landing page sections' })).toBeVisible();
    const motionNote = page.getByText('Motion follows your device settings');
    if (viewport.width > 780) await expect(motionNote).toBeVisible();
    else await expect(motionNote).toBeHidden();
    await expect(page.getByRole('button', { name: /Effects/ })).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('learning stages use complete keyboard tab behaviour', async ({ page }) => {
  await page.goto('/#learning');
  const learn = page.getByRole('tab', { name: /Learn/ });
  await learn.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Practise/ })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Make the first attempt.' })).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: /Master/ })).toBeFocused();
});

test('the section island follows the visible chapter without moving focus', async ({ page }) => {
  await page.goto('/');
  const curriculum = page.getByRole('link', { name: 'Curriculum', exact: true });
  await page.locator('#curriculum').scrollIntoViewIfNeeded();
  await expect(curriculum).toHaveAttribute('aria-current', 'location');
  await expect(curriculum).not.toBeFocused();
});

test('Revision Stack supports pointer and keyboard controls', async ({ page }) => {
  await page.goto('/');
  const game = page.getByLabel(/Revision Stack game/);
  await game.scrollIntoViewIfNeeded();
  const before = await page.locator('.vh-stack-board i').evaluateAll(cells => cells.map(cell => cell.className).join('|'));
  await game.focus();
  await page.keyboard.press('ArrowDown');
  const after = await page.locator('.vh-stack-board i').evaluateAll(cells => cells.map(cell => cell.className).join('|'));
  expect(after).not.toBe(before);
  await page.getByRole('button', { name: 'Rotate' }).click();
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByText('0', { exact: true })).toBeVisible();
});

test('reduced motion removes automatic marquee and depth movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByText(/Automatic movement is paused/)).toBeVisible();
  await expect.poll(() => page.locator('.vh-marquee > div').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  await expect.poll(() => page.locator('.revision-hero-answer').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
});
