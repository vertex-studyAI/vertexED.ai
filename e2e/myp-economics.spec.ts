import { expect, test } from '@playwright/test';

const topics = ["Scarcity", "Opportunity cost", "Economic systems", "Supply", "Demand", "Elasticity", "Market failure", "Government intervention", "Labour", "Development", "Trade", "Macroeconomic foundations", "Data response"];
const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

test('all 13 Economics routes expose complete practice and working source references', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/myp/subjects/economics');
  for (const topic of topics) {
    await page.getByRole('complementary', { name: 'Economics topics' }).getByRole('link', { name: new RegExp(topic + '$') }).click();
    await expect(page).toHaveURL(new RegExp('/economics/' + slug(topic) + '$'));
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
  await expect(page.getByRole('link', { name: 'Adjusting nominal values to real values', exact: true })).toHaveAttribute('href', 'https://openstax.org/books/principles-economics-3e/pages/19-2-adjusting-nominal-values-to-real-values');
  expect(errors).toEqual([]);
});

test('Economics prerequisites work with keyboard and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/economics/elasticity');
  const link = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link', { name: 'Demand', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/economics\/demand$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Demand', exact: true })).toBeVisible();
});

test('Economics examples fit desktop tablet and mobile', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/myp/subjects/economics/elasticity');
    await page.locator('.myp-key-ideas').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/economics-explanation-${width}.png`, animations: 'disabled' });
    await page.locator('.myp-worked').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/economics-worked-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true })).toHaveAttribute('data-docked', 'true');
  }
});

test('all 13 Economics examples and 39 solutions fit mobile', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const topic of topics) {
    await page.goto('/myp/subjects/economics/' + slug(topic));
    await page.locator('.myp-worked').screenshot({ path: `test-results/economics-mobile-${slug(topic)}-worked.png`, animations: 'disabled' });
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
      expect(await page.locator('.myp-solution').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.myp-solution').screenshot({ path: `test-results/economics-mobile-${slug(topic)}-q${index + 1}.png`, animations: 'disabled' });
    }
  }
});



test('Economics drafts restore and History review corrections appear in the UI', async ({ page }) => {
  await page.goto('/myp/subjects/economics/data-response');
  const answer = page.getByLabel('Your answer', { exact: true });
  await answer.fill('The rate rises by 10 percentage points, which is 25% relative to the initial 40%.');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await page.reload();
  await expect(answer).toHaveValue('The rate rises by 10 percentage points, which is 25% relative to the initial 40%.');
  await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
  await expect(page.locator('.myp-solution')).toContainText('25%');
  await page.goto('/myp/subjects/history/change');
  await expect(page.locator('.myp-worked')).toContainText('implements a change from paid to free');
  await page.goto('/myp/subjects/history/source-based-questions');
  await expect(page.locator('.myp-worked')).toContainText('free-of-charge access');
  await page.goto('/myp/subjects/history/continuity');
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(1).click();
  await expect(page.getByText(/while transferring budget decisions from the head teacher to a committee/)).toBeVisible();
  await page.goto('/myp/subjects/history/essay-construction');
  await page.getByRole('button', { name: 'Compare with a model response' }).click();
  await expect(page.locator('.myp-solution')).toContainText('does not establish whether staffing and timetabling');
  await page.goto('/myp/subjects/english-language-literature/poetry');
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(2).click();
  await page.getByRole('button', { name: 'Compare with a model response' }).click();
  await expect(page.locator('.myp-solution')).toContainText('without ruling out continued map use');
});
