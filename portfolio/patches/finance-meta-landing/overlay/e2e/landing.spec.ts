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

  await expect(page.locator('body')).toContainText(/FinanceMeta/i);
  await expect(page.locator('main')).toBeVisible();

  for (const pathway of ['Learn', 'Research', 'Build', 'Publish', 'Compete', 'Contribute', 'Lead']) {
    await expect(page.getByText(pathway, { exact: false }).first()).toBeVisible();
  }

  const contact = page.locator('a[href^="mailto:"]').first();
  await expect(contact).toBeVisible();
  await expect(contact).toHaveAttribute('href', /^mailto:.+@.+/);
  await expectNoHorizontalOverflow(page);
});

test('theme choice persists after reload', async ({ page }) => {
  await page.goto('/');

  const themeToggle = page.getByRole('button', { name: /theme|light|dark/i }).first();
  await expect(themeToggle).toBeVisible();

  const before = await page.evaluate(() => document.documentElement.className);
  await themeToggle.click();
  await expect.poll(() => page.evaluate(() => document.documentElement.className)).not.toBe(before);
  const selected = await page.evaluate(() => document.documentElement.className);

  await page.reload();
  await expect.poll(() => page.evaluate(() => document.documentElement.className)).toBe(selected);
});

test('keyboard navigation reaches a visible interactive control', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName || '')).not.toBe('BODY');
  await expect(page.locator(':focus')).toBeVisible();
});
