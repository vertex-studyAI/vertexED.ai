import { test, expect } from '@playwright/test';

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
});

test('health endpoint responds', async ({ request }) => {
  const base = process.env.PLAYWRIGHT_API_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
  const res = await request.get(`${base}/api/health`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.ok).toBe(true);
});
