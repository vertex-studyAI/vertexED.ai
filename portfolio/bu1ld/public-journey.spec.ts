import { expect, test, type Page } from '@playwright/test';

const publicRoutes = [
  '/',
  '/signup',
  '/login',
  '/projects',
  '/programs-public',
  '/evidence',
  '/privacy',
  '/terms',
] as const;

async function expectHealthyDocument(page: Page) {
  await expect(page.locator('body')).not.toBeEmpty();
  await expect(page.locator('body')).not.toContainText(
    /internal server error|application error|runtime error|worker threw exception/i,
  );

  const state = await page.evaluate(() => ({
    readyState: document.readyState,
    bodyTextLength: document.body.innerText.trim().length,
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));

  expect(state.readyState).not.toBe('loading');
  expect(state.bodyTextLength).toBeGreaterThan(100);
  expect(state.documentWidth).toBeLessThanOrEqual(state.viewportWidth + 1);
}

async function visit(page: Page, path: string) {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `${path} should return a document response`).not.toBeNull();
  expect(response?.status(), `${path} should return HTTP 200`).toBe(200);
  await expectHealthyDocument(page);
  expect(pageErrors, `${path} should not raise uncaught browser errors`).toEqual([]);
}

test('visitor can understand the offer and reach the two primary public journeys', async ({ page }) => {
  await visit(page, '/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /Join active technical projects/i,
  );
  await expect(page.getByText(/independent research and builder institution/i)).toBeVisible();

  const projectCta = page.getByRole('link', { name: /Find a project/i });
  await expect(projectCta).toBeVisible();
  await projectCta.click();
  await expect(page).toHaveURL(/\/projects\/?$/);
  await expectHealthyDocument(page);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const evidenceCta = page.getByRole('link', { name: /Inspect public evidence/i });
  await expect(evidenceCta).toBeVisible();
  await evidenceCta.click();
  await expect(page).toHaveURL(/\/evidence\/?$/);
  await expectHealthyDocument(page);
});

test('public programme and authentication handoffs expose complete controls', async ({ page }) => {
  await visit(page, '/programs-public');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Paths into the institution/i);
  await expect(page.getByRole('link', { name: /Create account to apply/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /^Log in$/i }).first()).toBeVisible();

  await visit(page, '/signup');
  await expect(page.getByRole('heading', { name: /Become a member/i })).toBeVisible();
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: /Create account/i })).toBeVisible();

  await visit(page, '/login');
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: /Log in/i })).toBeVisible();
});

test('all canonical public routes hydrate without overflow or browser exceptions', async ({ page }) => {
  for (const path of publicRoutes) {
    await visit(page, path);
  }
});

test('keyboard users can skip directly to the landing content', async ({ page }) => {
  await visit(page, '/');
  await page.keyboard.press('Tab');

  const skipLink = page.getByRole('link', { name: /Skip to content/i });
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');
  await expect(page).toHaveURL(/#top$/);
});
