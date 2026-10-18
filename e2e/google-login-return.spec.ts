import { expect, test, type Page } from '@playwright/test';

const id = '27395030-c3ea-457e-8fe9-740b73865296';
const user = {
  id, aud: 'authenticated', role: 'authenticated', email: 'google-return@example.test',
  email_confirmed_at: '2026-09-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z',
  invited_at: '2026-09-01T00:00:00Z',
  app_metadata: { provider: 'google', providers: ['google'] },
  user_metadata: { username: 'googlefixture', board: 'IB_MYP', grade: 10, subjects: ['Biology'] },
};
function fragment(type = '') {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const accessToken = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })}.fixture-signature`;
  return `#${new URLSearchParams({ access_token: accessToken, refresh_token: 'fixture-refresh', expires_in: '3600', token_type: 'bearer', ...(type ? { type } : {}) })}`;
}
async function harness(page: Page) {
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/auth/v1/authorize') {
      return route.fulfill({ status: 302, headers: { location: new URL(`/auth/callback${fragment()}`, page.url()).href }, body: '' });
    }
    if (path === '/auth/v1/user') return route.fulfill({ json: user });
    if (path === '/rest/v1/profiles') return route.fulfill({ json: { ...user, full_name: 'Google learner' } });
    return route.fulfill({ status: 400, json: { message: 'Unexpected fixture request' } });
  });
  await page.route('**/api/**', route => route.fulfill({ json: { ok: true, status: 'approved', access: true, items: [], isAdmin: false } }));
  await page.route('**/_vercel/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
}

test('Google sign-in returns to the requested study tab and consumes its temporary destination', async ({ page }) => {
  await harness(page);
  await page.goto('/learn?tab=knowledge#courses');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('button', { name: 'Sign in with Google', exact: true }).click();
  await expect(page).toHaveURL(/\/learn\?tab=knowledge#courses$/);
  expect(await page.evaluate(() => sessionStorage.getItem('vertex_google_login_return'))).toBeNull();
});

test('Google sign-in still opens when optional return-path storage is blocked', async ({ page }) => {
  await harness(page);
  await page.addInitScript(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === window.sessionStorage && key === 'vertex_google_login_return') {
        throw new DOMException('Fixture storage failure', 'QuotaExceededError');
      }
      return originalSetItem.call(this, key, value);
    };
  });
  await page.goto('/learn?tab=knowledge#courses');
  await expect(page).toHaveURL(/\/login$/);
  const authorization = page.waitForRequest(request => new URL(request.url()).pathname === '/auth/v1/authorize');
  await page.getByRole('button', { name: 'Sign in with Google', exact: true }).click();
  expect(new URL((await authorization).url()).searchParams.get('provider')).toBe('google');
  await expect(page).toHaveURL(/\/main$/);
  expect(await page.evaluate(() => sessionStorage.getItem('vertex_google_login_return'))).toBeNull();
});

for (const flow of ['link', 'recovery', 'invite'] as const) {
  test(`Google study continuation keeps ${flow} callback priority`, async ({ page }) => {
    await harness(page);
    await page.addInitScript(({ flow }) => {
      sessionStorage.setItem('vertex_google_login_return', JSON.stringify({ version: 1, path: '/learn?tab=mistakes', createdAt: Date.now() }));
      if (flow === 'link') sessionStorage.setItem('vertex_google_link_return', '/user-settings');
    }, { flow });
    const query = flow === 'link' ? '' : `?${flow}=1`;
    await page.goto(`/auth/callback${query}${fragment(flow === 'link' ? '' : flow)}`);
    if (flow === 'link') await expect(page).toHaveURL(/\/user-settings$/);
    else {
      await expect(page).toHaveURL(new RegExp(`/auth/callback\\?${flow}=1$`));
      await expect(page.getByRole('heading', { name: flow === 'recovery' ? 'Reset password' : 'Finish account setup', exact: true })).toBeVisible();
    }
    expect(await page.evaluate(() => sessionStorage.getItem('vertex_google_login_return'))).toBeNull();
  });
}

test('provider errors discard the pending study destination', async ({ page }) => {
  await harness(page);
  await page.addInitScript(() => sessionStorage.setItem('vertex_google_login_return', JSON.stringify({ version: 1, path: '/learn?tab=mistakes', createdAt: Date.now() })));
  await page.goto('/auth/callback?error=access_denied');
  await expect(page.getByRole('alert')).toContainText('Authentication could not be completed');
  expect(await page.evaluate(() => sessionStorage.getItem('vertex_google_login_return'))).toBeNull();
});
