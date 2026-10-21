import { expect, test } from '@playwright/test';
import { selectTheme } from './theme-controls';

test('landing exposes nine real study destinations in both themes and all layouts', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/\blight\b/);
  const destinations = ['/resources', '/exam-prep', '/paper-maker', '/answer-reviewer', '/chatbot', '/planner', '/study-zone', '/study-notebook', '/notetaker'];
  await expect(page.locator('.vh-ai-list > a')).toHaveCount(9);
  for (const href of destinations) await expect(page.locator(`.vh-ai-list > a[href="${href}"]`)).toBeVisible();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await page.evaluate(() => scrollTo(0, 0));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: info.outputPath(`landing-${theme}-${width}.png`), animations: 'disabled' });
      await page.locator('#study-ai').screenshot({ path: info.outputPath(`modules-${theme}-${width}.png`), animations: 'disabled' });
    }
  }
  await page.locator('.vh-ai-list > a[href="/resources"]').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/resources$/);
});
