import { expect, test } from '@playwright/test';

const topics = ["Inquiry questions", "Source analysis", "Spatial patterns", "Economic choice", "Global systems", "Sustainability", "Perspectives", "Extended response"];
const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

test('all 8 Integrated Humanities routes expose complete practice and working source references', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/myp/subjects/integrated-humanities');
  for (const topic of topics) {
    await page.getByRole('complementary', { name: 'Integrated Humanities topics' }).getByRole('link', { name: new RegExp(topic + '$') }).click();
    await expect(page).toHaveURL(new RegExp('/integrated-humanities/' + slug(topic) + '$'));
    await expect(page.getByRole('heading', { level: 1, name: topic, exact: true })).toBeVisible();
    await expect(page.getByText('This topic has a structured outline, not a finished lesson yet.')).toHaveCount(0);
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

test('Integrated Humanities prerequisites work with keyboard and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/integrated-humanities/extended-response');
  const link = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link', { name: 'Perspectives', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/integrated-humanities\/perspectives$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Perspectives', exact: true })).toBeVisible();
});

test('Integrated Humanities examples fit desktop tablet and mobile', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/myp/subjects/integrated-humanities/extended-response');
    await page.locator('.myp-key-ideas').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/integrated-humanities-explanation-${width}.png`, animations: 'disabled' });
    await page.locator('.myp-worked').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/integrated-humanities-worked-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true })).toHaveAttribute('data-docked', 'true');
  }
});

test('all 8 Integrated Humanities examples and 24 solutions fit mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const topic of topics) {
    await page.goto('/myp/subjects/integrated-humanities/' + slug(topic));
    await page.locator('.myp-worked').screenshot({ path: `test-results/integrated-humanities-mobile-${slug(topic)}-worked.png`, animations: 'disabled' });
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Compare with a model response' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
      expect(await page.locator('.myp-solution').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.myp-solution').screenshot({ path: `test-results/integrated-humanities-mobile-${slug(topic)}-q${index + 1}.png`, animations: 'disabled' });
    }
  }
});



test('Integrated Humanities drafts restore and fictional evidence limits appear', async ({ page }) => {
  await page.goto('/myp/subjects/integrated-humanities/perspectives');
  const answer = page.getByLabel('Your answer', { exact: true });
  await answer.fill('The speaker needs transport before the buses run because the shift starts early.');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await page.reload();
  await expect(answer).toHaveValue('The speaker needs transport before the buses run because the shift starts early.');
  await expect(page.getByText(/New Integrated Humanities cases use hypothetical data and fictional source statements/)).toBeVisible();
  await page.getByRole('button', { name: 'Compare with a model response' }).click();
  await expect(page.locator('.myp-solution')).toContainText('early work shift');
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(2).click();
  await page.getByRole('button', { name: 'Compare with a model response' }).click();
  await expect(page.locator('.myp-solution')).toContainText('not knowledge of a later closure');
  await page.goto('/myp/subjects/integrated-humanities/extended-response');
  await expect(page.locator('.myp-worked')).toContainText('not for both groups on average');
});
