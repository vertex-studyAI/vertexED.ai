import { expect, test } from '@playwright/test';

const topics = ['Cells', 'Genetics', 'Evolution', 'Ecology', 'Human physiology', 'Homeostasis', 'Reproduction', 'Biotechnology', 'Ecosystems', 'Human impact', 'Experimental design', 'Scientific evaluation'];
const slug = (title: string) => title.toLowerCase().replaceAll(' ', '-');

test('all 12 biology lessons have working navigation, hints and complete practice', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/myp/subjects/biology');
  for (const topic of topics) {
    await page.getByRole('complementary', { name: 'Biology topics' }).getByRole('link', { name: new RegExp(topic + '$') }).click();
    await expect(page).toHaveURL(new RegExp('/biology/' + slug(topic) + '$'));
    await expect(page.getByRole('heading', { level: 1, name: topic, exact: true })).toBeVisible();
    await expect(page.getByText('This topic has a structured outline, not a finished lesson yet.')).toHaveCount(0);
    const questions = page.getByRole('group', { name: 'Choose practice question' }).getByRole('button');
    const questionCount = topic === 'Cells' ? 6 : 5;
    await expect(questions).toHaveCount(questionCount);
    for (let index = 0; index < questionCount; index++) {
      await questions.nth(index).click();
      await page.getByRole('button', { name: 'Show hints' }).click();
      await expect(page.locator('.myp-hint-panel li').first()).toBeVisible();
      await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test('biology prerequisite navigation crosses subjects using the keyboard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/biology/ecology');
  const link = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link', { name: 'Statistics', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/mathematics\/statistics$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Statistics', exact: true })).toBeVisible();
});

test('biology explanation and worked calculations fit required viewports', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/myp/subjects/biology/ecosystems');
    await page.locator('.myp-key-ideas').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/biology-explanation-${width}.png`, animations: 'disabled' });
    await page.locator('.myp-worked').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/biology-worked-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true })).toHaveAttribute('data-docked', 'true');
  }
});

test('all biology worked examples and 37 solutions fit mobile screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const topic of topics) {
    await page.goto('/myp/subjects/biology/' + slug(topic));
    await page.locator('.myp-worked').screenshot({ path: `test-results/biology-mobile-${slug(topic)}-worked.png`, animations: 'disabled' });
    const questions = page.getByRole('group', { name: 'Choose practice question' }).getByRole('button');
    const questionCount = topic === 'Cells' ? 6 : 5;
    await expect(questions).toHaveCount(questionCount);
    for (let index = 0; index < questionCount; index++) {
      await questions.nth(index).click();
      await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
      expect(await page.locator('.myp-solution').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.myp-solution').screenshot({ path: `test-results/biology-mobile-${slug(topic)}-q${index + 1}.png`, animations: 'disabled' });
    }
  }
});
