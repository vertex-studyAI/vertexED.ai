import { expect, test } from '@playwright/test';

for (const width of [1440, 1024, 390]) {
  test(`formula desk renders and checks an answer at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/study-tools?formula=ohm');
    const desk = page.getByRole('region', { name: 'Know when. Know why. Then try.' });
    await expect(desk.getByRole('heading', { name: 'Ohm’s law', exact: true })).toBeVisible();
    await expect(page.getByLabel('Subject', { exact: true })).toHaveValue('physics');
    await expect(desk.getByRole('navigation', { name: 'Choose a formula' }).getByRole('button')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ fullPage: true, path: `test-results/formula-reference-${width}.png`, animations: 'disabled' });
    await page.getByRole('tab', { name: 'Try a question' }).click();
    const answer = page.getByLabel('Your answer (A)', { exact: true });
    await answer.fill('1/0');
    await page.getByRole('button', { name: 'Check answer' }).click();
    await expect(answer).toHaveAttribute('aria-invalid', 'true');
    await answer.fill('2');
    await page.getByRole('button', { name: 'Check answer' }).click();
    await expect(page.getByText('That value does not match yet.', { exact: false })).toBeVisible();
    await page.getByLabel('Your working (optional)').fill('I = V/R = 6/12');
    await answer.fill('1/2');
    await page.getByRole('button', { name: 'Check answer' }).click();
    await expect(page.getByText('That numerical value matches.', { exact: true })).toBeVisible();
    await page.getByText('Worked solution', { exact: true }).click();
    await expect(page.getByText('The current is 0.5 A.', { exact: true })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ fullPage: true, path: `test-results/formula-practice-${width}.png`, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

test('drafts stay with their question and match feedback clears after editing', async ({ page }) => {
  await page.goto('/study-tools?formula=ohm');
  await page.getByRole('tab', { name: 'Try a question' }).click();
  await page.getByLabel('Your working (optional)').fill('My ohm working');
  await page.getByLabel('Your answer (A)', { exact: true }).fill('.5');
  await page.getByRole('button', { name: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Next reference', exact: true }).click();
  await expect(page.getByLabel('Your answer (W)', { exact: true })).toHaveValue('');
  await page.getByLabel('Your working (optional)').fill('My power working');
  await page.getByRole('button', { name: 'Previous reference', exact: true }).click();
  await expect(page.getByLabel('Your working (optional)')).toHaveValue('My ohm working');
  await expect(page.getByLabel('Your answer (A)', { exact: true })).toHaveValue('.5');
  await expect(page.getByText('That numerical value matches.', { exact: true })).toBeVisible();
  await page.getByLabel('Your answer (A)', { exact: true }).fill('.4');
  await expect(page.getByText('That numerical value matches.', { exact: true })).toHaveCount(0);
  await page.reload();
  await page.getByRole('tab', { name: 'Try a question' }).click();
  await expect(page.getByLabel('Your answer (A)', { exact: true })).toHaveValue('');
});

test('deep links, multiword search, empty results and browser history work', async ({ page }) => {
  await page.goto('/study-tools?formula=real-growth');
  await expect(page.getByLabel('Subject', { exact: true })).toHaveValue('economics');
  await expect(page.getByRole('heading', { name: 'Real GDP growth', exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search all subjects' }).fill('wave frequency');
  await expect(page.getByRole('heading', { name: 'Wave speed', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('searchbox', { name: 'Search all subjects' })).toHaveValue('wave frequency');
  await page.getByRole('searchbox', { name: 'Search all subjects' }).fill('unfindable123');
  await expect(page.getByRole('heading', { name: 'No reference matches that search.' })).toBeVisible();
  await page.getByRole('button', { name: 'Show this subject' }).click();
  await expect(page.getByRole('heading', { name: 'Real GDP growth', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next reference', exact: true }).click();
  await expect(page).toHaveURL(/formula=real-gdp/);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Real GDP growth', exact: true })).toBeVisible();
});

test('keyboard tabs, native controls, dark mode and reduced motion remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/study-tools?formula=water-potential');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const reference = page.getByRole('tab', { name: 'Read the reference' });
  await reference.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Try a question' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Try a question' })).toHaveAttribute('aria-selected', 'true');
  const answer = page.getByLabel('Your answer (MPa)', { exact: true });
  await answer.fill('−0.5');
  await answer.press('Enter');
  await expect(page.getByText('That numerical value matches.', { exact: true })).toBeVisible();
  const hint = page.getByText('Show a hint', { exact: true });
  await hint.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Add the two signed values.', { exact: true })).toBeVisible();
  const desk = page.locator('.formula-desk');
  expect(await desk.locator('button').first().evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
  await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ fullPage: true, path: 'test-results/formula-dark-reduced-390.png', animations: 'disabled' });
});

test('library search restores its URL and opens the exact formula', async ({ page }) => {
  await page.goto('/resources?q=real%20GDP%20growth');
  const result = page.getByTestId('library-item').filter({ has: page.getByRole('heading', { name: 'Real GDP growth', exact: true }) });
  await expect(result).toBeVisible();
  await page.reload();
  await expect(page.getByRole('searchbox', { name: 'Search the learning library' })).toHaveValue('real GDP growth');
  await result.click();
  await expect(page.getByRole('heading', { name: 'Real GDP growth', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('searchbox', { name: 'Search the learning library' })).toHaveValue('real GDP growth');
  await page.getByRole('button', { name: /Study tools/ }).click();
  await expect(page.getByTestId('library-item')).toHaveCount(11);
  await page.reload();
  await expect(page.getByRole('button', { name: /Study tools/ })).toHaveAttribute('aria-pressed', 'true');
});

test('typing URL-backed searches keeps keyboard focus and practice CTA moves it to the tab', async ({ page }) => {
  await page.goto('/resources');
  const search = page.getByRole('searchbox', { name: 'Search the learning library' });
  await search.focus();
  await search.pressSequentially('real GDP growth', { delay: 40 });
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('real GDP growth');
  await page.getByTestId('library-item').filter({ has: page.getByRole('heading', { name: 'Real GDP growth', exact: true }) }).click();
  await expect(page.locator('#main-content')).toBeFocused();
  const formulaSearch = page.getByRole('searchbox', { name: 'Search all subjects' });
  await formulaSearch.focus();
  await formulaSearch.pressSequentially('wave frequency', { delay: 40 });
  await expect(formulaSearch).toBeFocused();
  await expect(formulaSearch).toHaveValue('wave frequency');
  await page.getByRole('button', { name: 'Try it without the worked example' }).click();
  await expect(page.getByRole('tab', { name: 'Try a question' })).toBeFocused();
});
