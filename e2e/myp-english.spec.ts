import { expect, test } from '@playwright/test';

const topics = ["Literary analysis", "Rhetorical devices", "Non-literary analysis", "Annotation", "Evidence selection", "Thesis construction", "Commentary", "Paragraph structure", "Timed writing", "Unseen analysis", "Persuasive texts", "Speeches", "Advertisements", "Articles", "Visual texts", "Poetry", "Prose", "Drama", "Comparative analysis", "Authorial choices", "Tone", "Structure", "Diction", "Imagery", "Symbolism", "Audience, purpose and context"];
const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

test('all 26 mapped English lessons have working navigation, hints and complete practice', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/myp/subjects/english-language-literature');
  for (const topic of topics) {
    await page.getByRole('complementary', { name: 'English Language & Literature topics' }).getByRole('link', { name: new RegExp(topic + '$') }).click();
    await expect(page).toHaveURL(new RegExp('/english-language-literature/' + slug(topic) + '$'));
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
  expect(errors).toEqual([]);
});

test('English prerequisite navigation works using the keyboard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/english-language-literature/evidence-selection');
  const link = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link', { name: 'Annotation', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/english-language-literature\/annotation$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Annotation', exact: true })).toBeVisible();
});

test('english-language-literature explanation and model examples fit required viewports', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/myp/subjects/english-language-literature/poetry');
    await page.locator('.myp-key-ideas').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/english-language-literature-explanation-${width}.png`, animations: 'disabled' });
    await page.locator('.myp-worked').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/english-language-literature-worked-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true })).toHaveAttribute('data-docked', 'true');
  }
});

for (const [batchIndex, batch] of [topics.slice(0, 13), topics.slice(13)].entries()) test(`English mobile examples and model responses batch ${batchIndex + 1}`,  async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const topic of batch) {
    await page.goto('/myp/subjects/english-language-literature/' + slug(topic));
    await page.locator('.myp-worked').screenshot({ path: `test-results/english-language-literature-mobile-${slug(topic)}-worked.png`, animations: 'disabled' });
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Compare with a model response' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
      expect(await page.locator('.myp-solution').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.myp-solution').screenshot({ path: `test-results/english-language-literature-mobile-${slug(topic)}-q${index + 1}.png`, animations: 'disabled' });
    }
  }
});


test('English model responses remain optional and completed Spanish lessons stay explicit', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/myp/subjects/english-language-literature/commentary');
  await expect(page.getByText('The model response is one supported reading. Other interpretations can meet the criteria when supported by precise textual evidence.')).toBeVisible();
  const answer = page.getByLabel('Your answer', { exact: true });
  await answer.fill('The stitching image suggests a deliberate connection between separate communities.');
  await answer.press('Tab');
  await expect(page.getByRole('button', { name: 'Save draft' })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.reload();
  await expect(answer).toHaveValue('The stitching image suggests a deliberate connection between separate communities.');
  await page.getByRole('button', { name: 'Compare with a model response' }).click();
  await expect(page.locator('.myp-solution')).toContainText('joining separate places');
  await page.locator('.myp-self-review').screenshot({ path: 'test-results/english-model-response-390.png', animations: 'disabled' });
  await page.goto('/myp/subjects/english-language-literature/poetry');
  await expect(page.getByText('Reattempt this question without the model response.', { exact: false })).toBeVisible();
  await page.goto('/myp/subjects/spanish/listening-strategies');
  await expect(page.getByRole('heading', { level: 1, name: 'Listening strategies', exact: true })).toBeVisible();
  await expect(page.getByText('This topic has a structured outline, not a finished lesson yet.')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Make an attempt.' })).toBeVisible();
});
