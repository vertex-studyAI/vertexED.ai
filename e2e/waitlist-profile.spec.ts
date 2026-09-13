import { expect, test } from '@playwright/test';

for (const width of [1440, 1024, 390]) {
  test(`profile form and lens at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: 'Join the waitlist' })).toBeVisible();
    await expect(page.getByLabel('Country', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Curriculum', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Age', { exact: true })).toHaveAttribute('min', '13');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `/tmp/vertexed-profile-${width}.png`, fullPage: true });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.screenshot({ path: `/tmp/vertexed-profile-dark-${width}.png`, fullPage: true });
    await page.goto('/');
    const lens = page.getByRole('button', { name: 'Show the whole curve' });
    await lens.focus();
    await expect(page.getByRole('button', { name: 'Show the whole curve' })).toHaveAttribute('aria-pressed', 'true');
    await page.locator('.vh-concept-lens').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/tmp/vertexed-lens-${width}.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Show the whole curve' }).click();
    await expect(page.getByRole('button', { name: 'Inspect the slope' })).toHaveAttribute('aria-pressed', 'false');
  });
}

test('waitlist sends explicit profile and consent without making an auth account', async ({ page }) => {
  let payload: Record<string, unknown> | undefined;
  await page.route('**/api/waitlist', async route => {
    payload = route.request().postDataJSON();
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ message: 'Saved' }) });
  });
  await page.goto('/signup');
  await page.getByLabel('Email address').fill('beta@example.test');
  await page.getByLabel('Country', { exact: true }).fill('India');
  await page.getByLabel('Curriculum', { exact: true }).selectOption('IB MYP');
  await page.getByLabel('Grade or year').fill('MYP 5');
  await page.getByLabel('Age', { exact: true }).fill('15');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Join waitlist', exact: true }).click();
  await expect(page.getByText("You're on the list")).toBeVisible();
  expect(payload?.profile).toEqual({ school: '', country: 'India', curriculum: 'IB MYP', curriculumOther: '', grade: 'MYP 5', age: 15, consent: true });
});
