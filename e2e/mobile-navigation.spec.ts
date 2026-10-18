import { expect, test } from '@playwright/test';
import { selectTheme } from './theme-controls';

for (const width of [1440, 1024, 390]) {
  test(`public navigation remains usable with keyboard and reduced motion at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/features');
    const menuButton = page.getByRole('button', { name: /navigation menu/ });
    const mobile = width < 1000;
    if (mobile) {
      await menuButton.focus();
      await page.keyboard.press('Enter');
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    }
    const navigation = page.getByRole('navigation', { name: mobile ? 'Mobile navigation' : 'Main navigation', exact: true });
    await expect(navigation.getByRole('link', { name: 'Features', exact: true })).toHaveAttribute('aria-current', 'page');
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await page.screenshot({ path: info.outputPath(`navigation-${width}-${theme}.png`), animations: 'disabled' });
    }
    if (mobile) {
      const last = navigation.getByRole('link', { name: 'Join the private beta', exact: true });
      await last.focus();
      await page.keyboard.press('Tab');
      await expect(page.locator('.vertex-navigation > div:first-child > a')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await expect(menuButton).toBeFocused();
      await menuButton.click();
    }
    await navigation.getByRole('link', { name: 'Library', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/resources$/);
    await expect(page.locator('#main-content')).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  });
}

test('mobile navigation scrolls its last action into a short viewport', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 480 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/features');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  const navigation = page.getByRole('navigation', { name: 'Mobile navigation', exact: true });
  const join = navigation.getByRole('link', { name: 'Join the private beta', exact: true });
  await join.focus();
  await expect(join).toBeInViewport({ ratio: 1 });
  const bounds = await navigation.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(480);
  expect(await navigation.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await page.screenshot({ path: info.outputPath('mobile-menu-short-viewport.png'), animations: 'disabled' });
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('mobile navigation closes after logo and global-search route changes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/features');
  const menuButton = page.getByRole('button', { name: /navigation menu/ });
  await menuButton.click();
  await page.locator('.vertex-navigation > div:first-child > a').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await menuButton.click();
  await page.getByRole('combobox', { name: 'Search VertexED' }).fill('Learning library');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/resources$/);
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('protected study links preserve their complete destination through email login', async ({ page }) => {
  const id = '64263127-5185-4665-aa97-cf7287830ef8';
  const user = {
    id, aud: 'authenticated', role: 'authenticated', email: 'navigation@example.test',
    email_confirmed_at: '2026-09-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { username: 'navigationfixture', board: 'IB_MYP', grade: 10, subjects: ['Biology'] },
  };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const accessToken = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })}.fixture-signature`;
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/auth/v1/token') return route.fulfill({ json: { access_token: accessToken, refresh_token: 'fixture-refresh', expires_in: 3600, token_type: 'bearer', user } });
    if (path === '/auth/v1/user') return route.fulfill({ json: user });
    if (path === '/rest/v1/profiles') return route.fulfill({ json: { ...user, full_name: 'Navigation learner', curriculum: { board: 'IB_MYP', grade: 10, subjects: ['Biology'] } } });
    return route.fulfill({ status: 400, json: { message: 'Unexpected fixture request' } });
  });
  await page.route('**/api/**', route => route.fulfill({ json: { ok: true, status: 'approved', access: true, items: [], isAdmin: false } }));
  const destination = '/learn?tab=knowledge#courses';
  await page.goto(destination);
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => history.state?.usr?.from)).toBe(destination);
  await page.getByLabel('Email address', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('fixture-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/learn\\?tab=knowledge#courses$'));
});
