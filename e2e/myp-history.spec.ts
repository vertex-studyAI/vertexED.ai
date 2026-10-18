import { expect, test } from '@playwright/test';

const topics = ['Source analysis', 'Origin, purpose, value and limitation', 'Causation', 'Consequence', 'Continuity', 'Change', 'Perspectives', 'Significance', 'Essay construction', 'Source-based questions'];
const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

test('all 10 History routes expose complete practice and working source references', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/myp/subjects/history');
  for (const topic of topics) {
    await page.getByRole('complementary', { name: 'History topics' }).getByRole('link', { name: new RegExp(topic + '$') }).click();
    await expect(page).toHaveURL(new RegExp('/history/' + slug(topic) + '$'));
    await expect(page.getByRole('heading', { level: 1, name: topic, exact: true })).toBeVisible();
    await expect(page.getByText('This topic has a structured outline, not a finished lesson yet.')).toHaveCount(0);
    await expect(page.getByText(/History exercises use illustrative teaching cases/)).toBeVisible();
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Show hints' }).click();
      await expect(page.locator('.myp-hint-panel li').first()).toBeVisible();
      await page.getByRole('button', { name: 'Compare with a model response' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
    }
  }
  await expect(page.getByRole('link', { name: 'Document Analysis', exact: true })).toHaveAttribute('href', 'https://www.archives.gov/education/lessons/worksheets');
  expect(errors).toEqual([]);
});

test('History prerequisites work with keyboard and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/history/change');
  const link = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link', { name: 'Continuity', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/history\/continuity$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Continuity', exact: true })).toBeVisible();
});

test('History examples fit desktop tablet and mobile', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/myp/subjects/history/perspectives');
    await page.locator('.myp-key-ideas').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/history-explanation-${width}.png`, animations: 'disabled' });
    await page.locator('.myp-worked').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/history-worked-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true })).toHaveAttribute('data-docked', 'true');
  }
});

test('all 10 History examples and 30 responses fit mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const topic of topics) {
    await page.goto('/myp/subjects/history/' + slug(topic));
    await page.locator('.myp-worked').screenshot({ path: `test-results/history-mobile-${slug(topic)}-worked.png`, animations: 'disabled' });
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Compare with a model response' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
      expect(await page.locator('.myp-solution').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.myp-solution').screenshot({ path: `test-results/history-mobile-${slug(topic)}-q${index + 1}.png`, animations: 'disabled' });
    }
  }
});

test('History drafts restore and final English review corrections appear in the UI', async ({ page }) => {
  await page.goto('/myp/subjects/history/source-based-questions');
  const answer = page.getByLabel('Your answer', { exact: true });
  await answer.fill('The petitioners identify a need for lighting after evening work; no accident is documented.');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await page.reload();
  await expect(answer).toHaveValue('The petitioners identify a need for lighting after evening work; no accident is documented.');
  await expect(page.getByText('Reattempt this question without the model response.', { exact: false })).toBeVisible();
  await page.goto('/myp/subjects/english-language-literature/imagery');
  await expect(page.getByText(/Identify one touch or temperature detail and one sound detail/)).toBeVisible();
  await expect(page.locator('.myp-worked')).toContainText('unrolling suggests the queue extending along it');
  await page.goto('/myp/subjects/english-language-literature/poetry');
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(2).click();
  await page.getByRole('button', { name: 'Compare with a model response' }).click();
  await expect(page.locator('.myp-solution')).toContainText('folding does not establish that the map is put away');
  await page.goto('/myp/subjects/english-language-literature/structure');
  await expect(page.locator('.myp-worked')).toContainText('why the key was not found sooner');
});
