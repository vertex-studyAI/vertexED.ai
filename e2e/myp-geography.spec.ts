import { expect, test } from '@playwright/test';

const topics = ["Population", "Migration", "Development", "Urbanisation", "Resources", "Sustainability", "Climate", "Natural hazards", "Globalisation", "Data response"];
const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

test('all 10 Geography routes expose complete practice and working source references', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/myp/subjects/geography');
  for (const topic of topics) {
    await page.getByRole('complementary', { name: 'Geography topics' }).getByRole('link', { name: new RegExp(topic + '$') }).click();
    await expect(page).toHaveURL(new RegExp('/geography/' + slug(topic) + '$'));
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
  await expect(page.getByRole('link', { name: 'Map symbols and scale: OnDemand Topo guide', exact: true })).toHaveAttribute('href', 'https://www.usgs.gov/ngp-standards-and-specifications/75-minute-ondemand-topo-cartographic-specifications-map-symbol');
  expect(errors).toEqual([]);
});

test('Geography prerequisites work with keyboard and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/geography/urbanisation');
  const link = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link', { name: 'Migration', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/geography\/migration$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Migration', exact: true })).toBeVisible();
});

test('Geography examples fit desktop tablet and mobile', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/myp/subjects/geography/urbanisation');
    await page.locator('.myp-key-ideas').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/geography-explanation-${width}.png`, animations: 'disabled' });
    await page.locator('.myp-worked').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/geography-worked-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true })).toHaveAttribute('data-docked', 'true');
  }
});

test('all 10 Geography examples and 30 solutions fit mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const topic of topics) {
    await page.goto('/myp/subjects/geography/' + slug(topic));
    await page.locator('.myp-worked').screenshot({ path: `test-results/geography-mobile-${slug(topic)}-worked.png`, animations: 'disabled' });
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
      expect(await page.locator('.myp-solution').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.myp-solution').screenshot({ path: `test-results/geography-mobile-${slug(topic)}-q${index + 1}.png`, animations: 'disabled' });
    }
  }
});



test('Geography drafts restore and risk limits remain visible', async ({ page }) => {
  await page.goto('/myp/subjects/geography/data-response');
  const answer = page.getByLabel('Your answer', { exact: true });
  await answer.fill('3 cm at 1:50,000 represents 1.5 km.');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await page.reload();
  await expect(answer).toHaveValue('3 cm at 1:50,000 represents 1.5 km.');
  await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
  await expect(page.locator('.myp-solution')).toContainText('1.5 km');
  await page.goto('/myp/subjects/geography/natural-hazards');
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(1).click();
  await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
  await expect(page.locator('.myp-solution')).toContainText('does not prescribe evenly spaced events');
});


test('Geography review corrections preserve country boundaries and monthly scope', async ({ page }) => {
  await page.goto('/myp/subjects/geography/globalisation');
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(1).click();
  await expect(page.getByText(/Places A, B and C are in different countries/)).toBeVisible();
  await page.goto('/myp/subjects/geography/resources');
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(1).click();
  await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
  await expect(page.locator('.myp-solution')).toContainText('15 tonnes at each month-end');
  await expect(page.locator('.myp-solution')).toContainText('do not establish its path within a month');
});
