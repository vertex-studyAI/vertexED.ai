import { expect, test } from '@playwright/test';
import { selectTheme } from './theme-controls';

for (const width of [1440, 1024, 390]) {
  test(`study tools hub puts tasks first and supports section shortcuts at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/study-tools');
    const tools = page.getByRole('region', { name: 'What’s your next task?' });
    await expect(tools.getByRole('link')).toHaveCount(6);
    await expect(tools.getByRole('link', { name: /Review an answer/ })).toHaveAttribute('href', '/answer-reviewer');
    expect(await tools.evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(await page.locator('#study-tools-formulas').evaluate(element => element.getBoundingClientRect().top));
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: info.outputPath(`study-tools-hub-${width}-${theme}.png`), animations: 'disabled' });
    }
    const shortcuts = page.getByRole('navigation', { name: 'Study tools sections' });
    await shortcuts.getByRole('link', { name: 'Formulas', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#study-tools-formulas')).toBeFocused();
    await expect(page).toHaveURL(/#study-tools-formulas$/);
    await expect(page.getByRole('heading', { name: 'Know when. Know why. Then try.' })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await shortcuts.getByRole('link', { name: 'Command terms', exact: true }).click();
    await expect(page.locator('#study-tools-terms')).toBeFocused();
    await expect(page.getByRole('heading', { name: 'Command terms glossary', exact: true })).toBeInViewport();
  });
}

test('study tools hub keeps practice drafts when moving between sections and opens formula deep links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/study-tools?formula=ohm');
  await expect(page.getByRole('heading', { name: 'Know when. Know why. Then try.' })).toBeInViewport();
  await page.getByRole('tab', { name: 'Try a question' }).click();
  await page.getByLabel('Your answer (A)', { exact: true }).fill('.5');
  await page.getByLabel('Your working (optional)').fill('Keep my working while browsing tools.');
  const shortcuts = page.getByRole('navigation', { name: 'Study tools sections' });
  await shortcuts.getByRole('link', { name: 'Choose a tool', exact: true }).click();
  await expect(page.locator('#study-tools-tools')).toBeFocused();
  await shortcuts.getByRole('link', { name: 'Formulas', exact: true }).click();
  await expect(page.getByLabel('Your answer (A)', { exact: true })).toHaveValue('.5');
  await expect(page.getByLabel('Your working (optional)')).toHaveValue('Keep my working while browsing tools.');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Know when. Know why. Then try.' })).toBeInViewport();
});
