import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`immersive landing remains readable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const headline = page.getByRole('heading', { name: 'You have read it. Now try it.' });
    await expect(headline).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Landing page sections' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Effects/ })).toHaveCount(0);
    await expect.poll(async () => {
      const box = await headline.boundingBox();
      return Boolean(box && box.x >= -1 && box.x + box.width <= viewport.width + 1);
    }).toBe(true);
    const boundedSelectors = ['.vertex-navigation', '.vertex-global-search', '.vh-hero-copy > p:not(.vh-kicker)', '.revision-hero-card'];
    for (const selector of boundedSelectors) {
      await expect.poll(async () => page.locator(selector).evaluate((element) => {
        const box = element.getBoundingClientRect();
        return box.left >= -1 && box.right <= innerWidth + 1;
      })).toBe(true);
    }
    if (viewport.width === 390) {
      await expect.poll(() => page.locator('#home-title span').evaluate((element) => getComputedStyle(element, '::after').display)).toBe('none');
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `test-results/landing-${viewport.width}.png`, animations: 'disabled' });
  });
}

test('global search finds real topics and supports keyboard navigation', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('combobox', { name: 'Search VertexED' });
  await search.fill('biology');
  await expect(page.getByRole('listbox', { name: 'VertexED search results' })).toBeVisible();
  await expect(page.getByRole('option', { name: /Subject Biology/ })).toBeVisible();
  await search.press('Enter');
  await expect(page).toHaveURL(/\/myp\/subjects\/biology$/);
  await expect(page.getByRole('heading', { name: 'Cells', exact: true })).toBeVisible();
  await expect(page.locator('.site-atmosphere')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Search VertexED' })).toBeVisible();
});

test('slash focuses global search and Escape closes results', async ({ page }) => {
  await page.goto('/about');
  await page.keyboard.press('/');
  const search = page.getByRole('combobox', { name: 'Search VertexED' });
  await expect(search).toBeFocused();
  await search.fill('planner');
  await expect(search).toHaveAttribute('aria-expanded', 'true');
  await search.press('Escape');
  await expect(search).toHaveAttribute('aria-expanded', 'false');
});

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
  const curriculum = page.getByRole('link', { name: 'Courses', exact: true });
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
  await expect.poll(() => page.locator('.vh-stack-board i').evaluateAll(cells => cells.map(cell => cell.className).join('|'))).not.toBe(before);
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
