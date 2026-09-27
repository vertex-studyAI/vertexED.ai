import { selectTheme } from './theme-controls';
import { expect, test, type Page } from '@playwright/test';

// Local browser fixtures only. These do not certify live account access or cloud sync.
async function signIn(page: Page, id = 'f40db66b-1b55-4ab8-88d0-14a9ba476c16') {
  const user = { id, aud: 'authenticated', role: 'authenticated', email: 'learner@example.test', app_metadata: { provider: 'email' }, user_metadata: { username: 'alexlearner', full_name: 'Alex', board: 'IB_MYP', grade: 10, subjects: ['Physics'] }, created_at: '2026-09-21T00:00:00Z', identities: [] };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: 2103836400, role: 'authenticated' })}.test-only`;
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, async route => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = {};
    if (path === '/auth/v1/token') body = { access_token: token, token_type: 'bearer', expires_in: 315360000, refresh_token: 'test-refresh', user };
    else if (path === '/auth/v1/user') body = user;
    else if (path === '/rest/v1/profiles') body = { id, email: user.email, board: 'IB_MYP', grade: 10, subjects: ['Physics'] };
    await route.fulfill({ json: body });
  });
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = {};
    if (path === '/api/waitlist-status') body = { status: 'approved' };
    if (path === '/api/admin-status') body = { isAdmin: false };
    if (path === '/api/user-content') body = { items: [], nextOffset: null };
    if (path === '/api/learner-state') body = { contractVersion: 'vertexed.learner-state.v1', items: [], results: [] };
    await route.fulfill({ json: body });
  });
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
  await expect(page.getByRole('heading', { name: 'Your study desk' })).toBeVisible();
}

for (const width of [1440, 1024, 390]) {
  test(`study desk search, pins, keyboard and themes at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await signIn(page);
    const toolbox = page.getByRole('region', { name: 'A place for every next step.' });
    await expect(toolbox.locator('article')).toHaveCount(11);
    await page.getByLabel('Time available today').selectOption('10');
    await expect(page.locator('.desk-budget-summary')).toContainText('suggested');
    const stage = toolbox.getByRole('button', { name: 'Review', exact: true });
    await stage.focus(); await page.keyboard.press('Enter');
    await expect(stage).toHaveAttribute('aria-pressed', 'true');
    await expect(stage).toBeFocused();
    await expect(toolbox.locator('article')).toHaveCount(2);
    const input = page.getByRole('searchbox', { name: 'Find a study tool' });
    await input.fill('mistake');
    await expect(toolbox.locator('article')).toHaveCount(1);
    const pin = toolbox.getByRole('button', { name: 'Pin Mistake notebook', exact: true });
    await pin.focus(); await page.keyboard.press('Space');
    await expect(toolbox.getByRole('button', { name: 'Unpin Mistake notebook', exact: true })).toBeFocused();
    await expect(page.getByRole('navigation', { name: 'Pinned study tools' })).toContainText('Mistake notebook');
    await page.reload();
    await expect(page.getByLabel('Time available today')).toHaveValue('10');
    await expect(page.getByRole('navigation', { name: 'Pinned study tools' })).toContainText('Mistake notebook');
    await toolbox.getByRole('button', { name: 'Pinned only', exact: true }).click();
    await expect(toolbox.locator('article')).toHaveCount(1);
    await input.fill('no-such-tool');
    await expect(toolbox.getByText('No tools match these filters.')).toBeVisible();
    await toolbox.getByRole('button', { name: 'Show all tools' }).click();
    await expect(toolbox.locator('article')).toHaveCount(11);
    for (const theme of ['light', 'dark']) {
      await selectTheme(page, theme as 'light' | 'dark');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: info.outputPath(`desk-${width}-${theme}.png`), fullPage: true });
      await page.screenshot({ path: info.outputPath(`desk-top-${width}-${theme}.png`) });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    }
    await expect(toolbox.locator('article').first()).toHaveCSS('transition-duration', '0s');
    await page.getByRole('navigation', { name: 'Pinned study tools' }).getByRole('link', { name: 'Mistake notebook' }).click();
    await expect(page).toHaveURL(/\/learn\?tab=mistakes$/);
    await expect(page.getByRole('heading', { name: /mistake/i }).first()).toBeVisible();
    await page.goto('/main');
    await toolbox.getByRole('button', { name: 'Pinned only', exact: true }).click();
    const unpin = toolbox.getByRole('button', { name: 'Unpin Mistake notebook', exact: true });
    await unpin.focus(); await page.keyboard.press('Enter');
    await expect(toolbox.getByRole('button', { name: 'Pinned only', exact: true })).toBeFocused();
    await expect(toolbox.getByText('Keep your favourite tools close.')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('pin storage failure stays usable and does not claim a save', async ({ page }) => {
  await signIn(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('vertexed:tool-pins:')) throw new DOMException('Quota exceeded', 'QuotaExceededError');
      original.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Pin Adaptive practice', exact: true }).click();
  await expect(page.getByText('Your shortcuts changed for this visit, but could not be saved on this device.', { exact: false })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Pinned study tools' })).toContainText('Adaptive practice');
  await page.reload();
  await expect(page.getByRole('navigation', { name: 'Pinned study tools' })).toHaveCount(0);
});

test('another account does not inherit pinned shortcuts', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vertexed:tool-pins:another-account', JSON.stringify(['practice'])));
  await signIn(page);
  await expect(page.getByRole('navigation', { name: 'Pinned study tools' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Pin Mistake notebook', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('vertexed:tool-pins:another-account'))).toBe('["practice"]');
});
