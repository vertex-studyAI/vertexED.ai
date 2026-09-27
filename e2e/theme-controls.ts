import { expect, type Page } from '@playwright/test';

export async function selectTheme(page: Page, theme: 'light' | 'dark') {
  const label = theme === 'dark' ? 'Dark' : 'Light';
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await page.getByRole('button', { name: `Theme: ${label}. Click to switch.`, exact: true }).count()) break;
    await page.getByRole('button', { name: /^Theme: .*Click to switch\.$/ }).click();
  }
  await expect(page.getByRole('button', { name: `Theme: ${label}. Click to switch.`, exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
  // Wait for inherited text colour as well as the root class. Directly editing
  // the DOM class can capture a partially transitioned, inconsistent theme.
  const colour = expect.poll(() => page.locator('h1').first().evaluate(element => {
    const channels = getComputedStyle(element).color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
    return channels.reduce((sum, channel) => sum + channel, 0) / 3;
  }));
  if (theme === 'dark') await colour.toBeGreaterThan(180);
  else await colour.toBeLessThan(100);
}
