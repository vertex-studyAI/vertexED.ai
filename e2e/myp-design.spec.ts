import { expect, test } from '@playwright/test';

const topics = ["Design cycle", "Criterion A", "Criterion B", "Criterion C", "Criterion D", "Problem identification", "Research", "Specifications", "Ideation", "Prototyping", "Testing", "Evaluation", "Iteration", "Product documentation"];
const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

test('all 14 Design routes expose complete practice and working source references', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/myp/subjects/design');
  for (const topic of topics) {
    await page.getByRole('complementary', { name: 'Design topics' }).getByRole('link', { name: new RegExp(topic + '$') }).click();
    await expect(page).toHaveURL(new RegExp('/design/' + slug(topic) + '$'));
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
  await expect(page.getByRole('link', { name: 'Writing user stories and acceptance criteria', exact: true })).toHaveAttribute('href', 'https://www.gov.uk/service-manual/agile-delivery/writing-user-stories');
  expect(errors).toEqual([]);
});

test('Design prerequisites work with keyboard and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/design/criterion-d');
  const link = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link', { name: 'Testing', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/design\/testing$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Testing', exact: true })).toBeVisible();
});

test('Design examples fit desktop tablet and mobile', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/myp/subjects/design/criterion-d');
    await page.locator('.myp-key-ideas').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/design-explanation-${width}.png`, animations: 'disabled' });
    await page.locator('.myp-worked').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/design-worked-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true })).toHaveAttribute('data-docked', 'true');
  }
});

test('all 14 Design examples and 42 solutions fit mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const topic of topics) {
    await page.goto('/myp/subjects/design/' + slug(topic));
    await page.locator('.myp-worked').screenshot({ path: `test-results/design-mobile-${slug(topic)}-worked.png`, animations: 'disabled' });
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Compare with a model response' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
      expect(await page.locator('.myp-solution').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.myp-solution').screenshot({ path: `test-results/design-mobile-${slug(topic)}-q${index + 1}.png`, animations: 'disabled' });
    }
  }
});



test('Design draft scope failed tests and saved answers stay explicit', async ({ page }) => {
  await page.goto('/myp/subjects/design/testing');
  await expect(page.locator('.myp-note').filter({ hasText: 'not official rubric descriptors' })).toBeVisible();
  const answer = page.getByLabel('Your answer', { exact: true });
  await answer.fill('Three qualify. Preserve the assisted attempt as a failed condition.');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await page.reload();
  await expect(answer).toHaveValue('Three qualify. Preserve the assisted attempt as a failed condition.');
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(1).click();
  await page.getByRole('button', { name: 'Compare with a model response' }).click();
  await expect(page.locator('.myp-solution')).toContainText('three of five');
  await expect(page.locator('.myp-solution')).toContainText('hint is not independent');
  await page.goto('/myp/subjects/design/product-documentation');
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(2).click();
  await page.getByRole('button', { name: 'Compare with a model response' }).click();
  await expect(page.locator('.myp-solution')).toContainText('unsupported for v2');
});

test('review corrections render as standalone Spanish tasks and sourced science maths economics', async ({ page }) => {
  for (const [slug, index, fragment] of [
    ['writing-structures', 1, 'mañana using ñ'],
    ['exam-strategies', 1, 'including the day, time and one reason'],
    ['speaking-interaction', 0, 'beginning Sí'],
    ['future-and-conditional', 2, 'simple future tense for leer'],
  ] as const) {
    await page.goto('/myp/subjects/spanish/' + slug);
    await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
    await expect(page.getByText(fragment, { exact: false }).first()).toBeVisible();
  }
  await page.goto('/myp/subjects/spanish/present-tense');
  await expect(page.getByText(/-o, -es, -e, -emos, -éis, -en/)).toBeVisible();
  await page.goto('/myp/subjects/biology/cells');
  await expect(page.locator('.myp-worked')).toContainText('30000 micrometres ÷ 15 micrometres = 2000×');
  await expect(page.locator('.myp-worked')).toContainText('magnification alone does not identify');
  await page.goto('/myp/subjects/mathematics/functions');
  await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(2).click();
  await expect(page.getByText(/A taxi cost in currency units/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
  await expect(page.locator('.myp-solution')).toContainText('currency units per kilometre');
  await page.goto('/myp/subjects/economics/scarcity');
  await expect(page.getByRole('link', { name: 'Choice and budget constraints', exact: true })).toBeVisible();
  await page.goto('/myp/subjects/economics/market-failure');
  await expect(page.getByRole('link', { name: 'The economics of pollution and externalities', exact: true })).toHaveAttribute('href', /12-1-the-economics-of-pollution$/);
});

test('reviewed teaching examples fit narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [route, selector, name] of [
    ['spanish/present-tense', 'p:has-text("For regular verbs")', 'spanish-present'],
    ['biology/cells', '.myp-worked', 'biology-magnification'],
  ]) {
    await page.goto('/myp/subjects/' + route);
    await page.locator(selector).screenshot({ path: `test-results/design-review-${name}-390-fragment.png`, animations: 'disabled', style: 'header { visibility: hidden !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator(selector).evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  }
});
