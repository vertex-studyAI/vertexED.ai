import { expect, test } from '@playwright/test';

const topics = [
  ['Number', 'number'], ['Algebra', 'algebra'], ['Functions', 'functions'],
  ['Coordinate geometry', 'coordinate-geometry'], ['Geometry', 'geometry'],
  ['Trigonometry', 'trigonometry'], ['Statistics', 'statistics'], ['Probability', 'probability'],
  ['Sequences', 'sequences'], ['Patterns', 'patterns'], ['Mathematical modelling', 'mathematical-modelling'],
  ['Financial mathematics', 'financial-mathematics'], ['Problem solving', 'problem-solving'],
  ['Mathematical communication', 'mathematical-communication'], ['Investigation strategies', 'investigation-strategies'],
];

test('every mapped mathematics topic opens a complete lesson and working practice', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/myp/subjects/mathematics');
  for (const [title, slug] of topics) {
    await page.getByRole('complementary', { name: 'Mathematics topics' }).getByRole('link', { name: new RegExp(title + '$') }).click();
    await expect(page).toHaveURL(new RegExp('/mathematics/' + slug + '$'));
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Build the concept', exact: true })).toBeAttached();
    await expect(page.getByRole('heading', { name: 'Make the reasoning visible', exact: true })).toBeAttached();
    await expect(page.getByRole('group', { name: 'Choose practice question' }).getByRole('button')).toHaveCount(3);
    await expect(page.getByText('This topic has a structured outline, not a finished lesson yet.')).toHaveCount(0);
    await expect(page.getByLabel('Question 1 of 3')).toBeVisible();
    await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
    await expect(page.locator('.myp-solution li').first()).toBeVisible();
    await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').last().click();
    await expect(page.getByLabel('Question 3 of 3')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('prerequisite navigation and mathematics practice work with keyboard and preserve drafts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/mathematics/probability');
  const prerequisite = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link', { name: 'Statistics' });
  await expect(prerequisite).toHaveCSS('text-decoration-line', 'underline');
  await prerequisite.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/mathematics\/statistics$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Statistics', exact: true })).toBeVisible();
  const answer = page.getByLabel('Your answer', { exact: true });
  await answer.fill('Mean 7 books, median 7 books, range 7 books.');
  await answer.press('Tab');
  await expect(page.getByRole('button', { name: 'Save draft' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Saved for this browser session/)).toBeVisible();
  await page.reload();
  await expect(answer).toHaveValue('Mean 7 books, median 7 books, range 7 books.');
  await page.getByRole('button', { name: 'Show hints' }).click();
  await expect(page.getByRole('heading', { name: 'Hints', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
  await expect(page.locator('.myp-solution')).toContainText('Mean = 35/5 = 7 books.');
});

test('new explanation and prerequisite surfaces fit all required viewports', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/myp/subjects/mathematics/coordinate-geometry');
    await expect(page.getByRole('navigation', { name: 'Suggested prerequisites' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/myp-math-${width}.png`, fullPage: false, animations: 'disabled' });
    await page.getByRole('navigation', { name: 'Suggested prerequisites' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/myp-math-content-${width}.png`, fullPage: false, animations: 'disabled' });
  }
});


test('lesson companion leaves mobile reading and answers unobstructed while shortcuts still work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/myp/subjects/mathematics/coordinate-geometry');
  const launcher = page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true });
  await expect(launcher).toHaveAttribute('data-docked', 'true');
  await expect(launcher).toHaveCSS('position', 'static');
  for (const [name, selector] of [
    ['objectives', '.myp-objectives'], ['explanation', '.myp-key-ideas'], ['worked-example', '.myp-worked'],
  ]) {
    const content = page.locator(selector);
    await content.scrollIntoViewIfNeeded();
    const contentBox = await content.boundingBox();
    const launcherBox = await launcher.boundingBox();
    expect(contentBox).not.toBeNull();
    expect(launcherBox).not.toBeNull();
    expect(launcherBox!.y).toBeGreaterThanOrEqual(contentBox!.y + contentBox!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/myp-math-review-${name}-390.png`, animations: 'disabled' });
  }
  const answer = page.getByLabel('Your answer', { exact: true });
  await answer.fill('The midpoint is (1, 3).');
  await page.getByRole('button', { name: 'Show hints' }).click();
  await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
  await page.locator('.myp-solution').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/myp-math-review-solution-390.png', animations: 'disabled' });
  await answer.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/myp-math-review-input-390.png', animations: 'disabled' });
  await page.locator('.myp-hint-panel').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/myp-math-review-hints-390.png', animations: 'disabled' });
  await launcher.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Plan Make time for a topic/ })).toHaveAttribute('href', '/planner');
  await page.getByRole('button', { name: 'Close Apex study shortcuts' }).click();
  await expect(launcher).toBeFocused();
  await page.goto('/myp');
  await expect(launcher).toHaveAttribute('data-docked', 'true');
  await expect(launcher).toHaveCSS('position', 'static');
  await launcher.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
});


test('all mathematics explanations and practice solutions remain readable at 390 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [, slug] of topics) {
    await page.goto('/myp/subjects/mathematics/' + slug);
    await page.locator('.myp-worked').scrollIntoViewIfNeeded();
    await page.locator('.myp-worked').screenshot({ path: `test-results/math-mobile-${slug}-worked.png`, animations: 'disabled' });
    for (let index = 0; index < 3; index++) {
      await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(index).click();
      await page.getByRole('button', { name: 'Show hints' }).click();
      await expect(page.locator('.myp-hint-panel li').first()).toBeVisible();
      await page.getByRole('button', { name: 'Compare with the worked solution' }).click();
      await expect(page.locator('.myp-solution li').first()).toBeVisible();
      for (const selector of ['.myp-hint-panel', '.myp-solution']) {
        expect(await page.locator(selector).evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.myp-solution').screenshot({ path: `test-results/math-mobile-${slug}-q${index + 1}.png`, animations: 'disabled' });
    }
  }
});
