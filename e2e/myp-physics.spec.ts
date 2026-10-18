import { expect, test } from '@playwright/test';

const topics = ['Motion', 'Forces', 'Energy', 'Work and power', 'Momentum', 'Waves', 'Light', 'Sound', 'Electricity', 'Magnetism', 'Thermal physics', 'Atomic and nuclear concepts', 'Experimental design', 'Data analysis', 'Uncertainty', 'Graph interpretation'];
const slug = (title: string) => title.toLowerCase().replaceAll(' ', '-');

test('all 16 physics lessons have working navigation, hints and complete practice', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/myp/subjects/physics');
  for (const topic of topics) {
    await page.getByRole('complementary', { name: 'Physics topics' }).getByRole('link', { name: new RegExp(topic + '$') }).click();
    await expect(page).toHaveURL(new RegExp('/physics/' + slug(topic) + '$'));
    await expect(page.getByRole('heading', { level: 1, name: topic, exact: true })).toBeVisible();
    await expect(page.getByText('This topic has a structured outline, not a finished lesson yet.')).toHaveCount(0);
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Show hints' }).click();
      await expect(page.locator('.myp-hint-panel li').first()).toBeVisible();
      await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test('physics prerequisite navigation crosses subjects using the keyboard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/physics/uncertainty');
  const link = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link', { name: 'Number', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/mathematics\/number$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Number', exact: true })).toBeVisible();
});

test('physics explanation and worked calculations fit required viewports', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/myp/subjects/physics/momentum');
    await page.locator('.myp-key-ideas').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/physics-explanation-${width}.png`, animations: 'disabled' });
    await page.locator('.myp-worked').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/physics-worked-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true })).toHaveAttribute('data-docked', 'true');
  }
});

test('all physics worked examples and 48 solutions fit mobile screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const topic of topics) {
    await page.goto('/myp/subjects/physics/' + slug(topic));
    await page.locator('.myp-worked').screenshot({ path: `test-results/physics-mobile-${slug(topic)}-worked.png`, animations: 'disabled' });
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
      expect(await page.locator('.myp-solution').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.myp-solution').screenshot({ path: `test-results/physics-mobile-${slug(topic)}-q${index + 1}.png`, animations: 'disabled' });
    }
  }
});
