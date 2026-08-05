import { expect, test } from '@playwright/test';

test.describe('local keyboard accessibility', () => {
  test('skip link moves focus to the main landmark', async ({ page }) => {
    await page.goto('/features');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('closed mobile navigation is inert and Escape restores the trigger', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1024) >= 768, 'Mobile navigation is rendered below 768px.');

    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Open navigation menu' });
    const navigation = page.getByRole('navigation', { name: 'Mobile navigation', includeHidden: true });
    const firstLink = navigation.getByRole('link').first();

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation.locator('xpath=..')).toHaveAttribute('aria-hidden', 'true');

    const closedMenuAcceptedFocus = await firstLink.evaluate((element) => {
      (element as HTMLElement).focus();
      return document.activeElement === element;
    });
    expect(closedMenuAcceptedFocus).toBe(false);

    await trigger.click();
    await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true');
    await expect(navigation.locator('xpath=..')).toHaveAttribute('aria-hidden', 'false');

    await firstLink.focus();
    await expect(firstLink).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused();
    await expect(navigation.locator('xpath=..')).toHaveAttribute('aria-hidden', 'true');
  });

  test('AI tutor dialog receives focus, closes on Escape, and restores its opener', async ({ page }) => {
    await page.goto('/study-guides');

    const opener = page.getByRole('button', { name: 'Open study guide AI tutor' });
    await expect(opener).toBeVisible();
    await opener.click();

    const dialog = page.getByRole('dialog', { name: 'AI tutor' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open study guide AI tutor' })).toBeFocused();
  });
});
