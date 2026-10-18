import { expect, test } from '@playwright/test';

const topics = ["Identity and relationships", "Experiences", "Human ingenuity", "Social organisation", "Sharing the planet", "Present tense", "Past tenses", "Future and conditional", "Speaking interaction", "Reading comprehension", "Listening strategies", "Writing structures", "Connectors", "High-frequency verbs", "Idiomatic language", "Exam strategies"];
const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

test('all 16 Spanish routes expose complete practice and working source references', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/myp/subjects/spanish');
  for (const topic of topics) {
    await page.getByRole('complementary', { name: 'Spanish topics' }).getByRole('link', { name: new RegExp(topic + '$') }).click();
    await expect(page).toHaveURL(new RegExp('/spanish/' + slug(topic) + '$'));
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
  await expect(page.getByRole('link', { name: 'The CEFR levels', exact: true })).toHaveAttribute('href', 'https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions');
  expect(errors).toEqual([]);
});

test('Spanish prerequisites work with keyboard and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/spanish/future-and-conditional');
  const link = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link', { name: 'Present tense', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/spanish\/present-tense$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Present tense', exact: true })).toBeVisible();
});

test('Spanish examples fit desktop tablet and mobile', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/myp/subjects/spanish/future-and-conditional');
    await page.locator('.myp-key-ideas').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/spanish-explanation-${width}.png`, animations: 'disabled' });
    await page.locator('.myp-worked').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/spanish-worked-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true })).toHaveAttribute('data-docked', 'true');
  }
});

test('all 16 Spanish examples and 48 solutions fit mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const topic of topics) {
    await page.goto('/myp/subjects/spanish/' + slug(topic));
    await page.locator('.myp-worked').screenshot({ path: `test-results/spanish-mobile-${slug(topic)}-worked.png`, animations: 'disabled' });
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Compare with a model response' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
      expect(await page.locator('.myp-solution').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.myp-solution').screenshot({ path: `test-results/spanish-mobile-${slug(topic)}-q${index + 1}.png`, animations: 'disabled' });
    }
  }
});



test('Spanish accents drafts alternatives and listening boundaries remain visible', async ({ page }) => {
  await page.goto('/myp/subjects/spanish/future-and-conditional');
  await expect(page.getByText(/Editorial target: A2 to early B1/)).toBeVisible();
  const answer = page.getByLabel('Your answer', { exact: true });
  await answer.fill('Nosotros vamos a visitar el museo. ¿Podrías ayudarme mañana?');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await page.reload();
  await expect(answer).toHaveValue('Nosotros vamos a visitar el museo. ¿Podrías ayudarme mañana?');
  await expect(page.getByText(/Accept other accurate wording and regional variants/)).toBeVisible();
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(2).click();
  await page.getByRole('button', { name: 'Compare with a model response' }).click();
  await expect(page.locator('.myp-solution')).toContainText('Si tengo tiempo, leeré.');
  await expect(page.locator('.myp-solution')).toContainText('¿Podrías repetirlo?');
  await page.goto('/myp/subjects/spanish/listening-strategies');
  await expect(page.getByText(/not playable recordings/)).toBeVisible();
  await expect(page.getByText(/Transcript-based strategy exercise, not an audio test/)).toBeVisible();
  await page.goto('/myp/subjects/spanish/past-tenses');
  await expect(page.getByText(/Cuando éramos niños, cada verano/)).toBeVisible();
  await page.getByRole('button', { name: 'Compare with a model response' }).click();
  await expect(page.locator('.myp-solution')).toContainText('Visitábamos');
});
