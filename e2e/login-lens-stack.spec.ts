import { expect, test } from '@playwright/test';

test('preview access endpoint rejects anonymous requests as JSON', async ({ request }) => {
  const response = await request.get('/api/waitlist-status');
  expect(response.status()).toBe(401);
  expect(response.headers()['content-type']).toContain('application/json');
});

test('existing short passwords reach authentication, not signup validation', async ({ page }) => {
  let attempted = false;
  await page.route(/^https:\/\/[^/]+\.supabase\.co\/auth\/v1\/token/, async route => {
    attempted = true;
    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }) });
  });
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill('login-fixture@example.com');
  await page.getByLabel('Password', { exact: true }).fill('sixsix');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect.poll(() => attempted).toBe(true);
  await expect(page.getByRole('alert')).toContainText('Invalid login credentials');
});

for (const width of [1440, 1024, 390]) {
  test(`lens practice, keyboard controls and reduced motion at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Show the whole curve' })).toHaveAttribute('aria-pressed', 'true');
    const slider = page.getByRole('slider', { name: 'Explore from start to finish' });
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveValue('166');
    await page.getByLabel('Choose a part of the curve').selectOption('end');
    await page.getByRole('button', { name: 'Check reasoning' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Look again' })).toBeVisible();
    await page.getByLabel('Choose a part of the curve').selectOption('start');
    await page.getByRole('button', { name: 'Check reasoning' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Yes.' })).toBeVisible();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => { document.documentElement.classList.remove('dark', 'light'); document.documentElement.classList.add(value); }, theme);
      await page.locator('.vh-concept-lens').screenshot({ path: info.outputPath(`lens-${width}-${theme}.png`) });
    }
    await page.locator('.vh-stack').scrollIntoViewIfNeeded();
    const board = page.locator('.vh-stack-board');
    const before = await board.innerHTML();
    await page.waitForTimeout(900);
    expect(await board.innerHTML()).toBe(before);
    await page.getByRole('button', { name: 'Take over' }).click();
    await page.locator('.vh-stack-game').focus();
    await page.keyboard.press('Space');
    expect(await board.locator('[data-piece]').count()).toBeGreaterThan(4);
    await page.locator('.vh-stack').screenshot({ path: info.outputPath(`stack-${width}.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('automatic blocks animate only while visible and can be paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const board = page.locator('.vh-stack-board');
  const initial = await board.innerHTML();
  await page.waitForTimeout(700);
  expect(await board.innerHTML()).toBe(initial);
  await page.locator('.vh-stack').scrollIntoViewIfNeeded();
  await expect.poll(() => board.innerHTML()).not.toBe(initial);
  await page.getByRole('button', { name: 'Pause blocks' }).click();
  const paused = await board.innerHTML();
  await page.waitForTimeout(700);
  expect(await board.innerHTML()).toBe(paused);
});
