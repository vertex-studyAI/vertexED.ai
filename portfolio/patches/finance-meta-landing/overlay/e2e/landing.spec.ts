import { expect, test } from '@playwright/test';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test('primary landing journey exposes every FinanceMeta pathway', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(/work that matters/i);
  await expect(page.locator('main')).toBeVisible();

  for (const pathway of ['Learn', 'Research', 'Build', 'Publish', 'Compete', 'Contribute', 'Lead']) {
    await expect(page.getByRole('heading', { name: pathway, exact: true })).toBeVisible();
  }

  const contact = page.getByRole('link', { name: /join the network/i });
  await expect(contact).toBeVisible();
  await expect(contact).toHaveAttribute('href', /^mailto:financeforalledu@gmail\.com/);
  await expectNoHorizontalOverflow(page);
});

test('theme choice persists after reload', async ({ page }) => {
  await page.goto('/');

  const themeToggle = page.getByRole('button', { name: /switch to/i });
  await expect(themeToggle).toBeVisible();

  const before = await page.locator('html').getAttribute('data-theme');
  await themeToggle.click();
  await expect.poll(() => page.locator('html').getAttribute('data-theme')).not.toBe(before);
  const selected = await page.locator('html').getAttribute('data-theme');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', selected!);
});

test('keyboard navigation reaches a visible interactive control', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName || '')).not.toBe('BODY');
  await expect(page.locator(':focus')).toBeVisible();
});
