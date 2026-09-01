import { test, expect } from '@playwright/test';

const apiBase = process.env.PLAYWRIGHT_API_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

test.describe('public launch journey', () => {
  test('homepage, login, and signup render meaningful content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText(/VertexED/i);
    await expect(page.getByRole('link', { name: /join|waitlist|start/i }).first()).toBeVisible();

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Log in', exact: true })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /join the waitlist/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: /join waitlist/i })).toBeVisible();
  });

  test('team invite flow verifies email before password creation without revealing the server secret', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('button', { name: /have an invite code/i }).click();

    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Invite code')).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /email secure invite/i })).toBeVisible();
  });

  test('admin page does not expose protected content to logged-out visitors', async ({ page }) => {
    await page.goto('/admin/waitlist');
    await expect(page).toHaveURL(/\/login|\/admin\/waitlist/);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/approve all|service role key|invite token/i);
  });

  for (const path of ['/', '/signup', '/login']) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expectNoHorizontalOverflow(page);
    });
  }

  test('keyboard navigation exposes a visible focus target', async ({ page }) => {
    await page.goto('/signup');
    await page.keyboard.press('Tab');
    await expect.poll(async () => page.evaluate(() => document.activeElement?.tagName || '')).not.toBe('BODY');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('unknown client route renders a recoverable page', async ({ page }) => {
    await page.goto('/this-route-should-not-exist');
    await expect(page.locator('body')).toContainText(/not found|home|VertexED/i);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('production API contract', () => {
  test('health endpoint responds with API marker', async ({ request }) => {
    const res = await request.get(`${apiBase}/api/health`);
    expect(res.status()).toBe(200);
    expect(res.headers()['x-vertex-api']).toBe('1');
    const body = await res.json();
    expect(body).toMatchObject({ ok: true });
  });

  test('unknown API route returns 404', async ({ request }) => {
    const res = await request.get(`${apiBase}/api/definitely-not-a-route`);
    expect(res.status()).toBe(404);
  });

  test('protected APIs reject logged-out requests', async ({ request }) => {
    const protectedRequests = [
      { path: '/api/ask', method: 'POST' as const },
      { path: '/api/user-content', method: 'GET' as const },
      { path: '/api/admin-status', method: 'GET' as const },
    ];

    for (const endpoint of protectedRequests) {
      const res = endpoint.method === 'GET'
        ? await request.get(`${apiBase}${endpoint.path}`)
        : await request.post(`${apiBase}${endpoint.path}`, { data: {} });
      expect(res.status(), endpoint.path).toBe(401);
    }
  });

  test('untrusted cross-origin API requests are rejected', async ({ request }) => {
    const res = await request.get(`${apiBase}/api/health`, {
      headers: { Origin: 'https://evil.example' },
    });
    expect(res.status()).toBe(403);
  });

  test('waitlist validation rejects malformed email without creating data', async ({ request }) => {
    const res = await request.post(`${apiBase}/api/waitlist`, {
      data: { email: 'not-an-email' },
    });
    expect(res.status()).toBe(400);
  });
});
