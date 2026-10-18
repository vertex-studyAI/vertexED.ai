import { expect, type Page } from '@playwright/test';

export async function selectTheme(page: Page, theme: 'light' | 'dark') {
  const label = theme === 'dark' ? 'Midnight' : 'Blue';
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await page.getByRole('button', { name: `Theme: ${label}. Click to switch.`, exact: true }).count()) break;
    const toggle = page.getByRole('button', { name: /^Theme: .*Click to switch\.$/ });
    await toggle.focus();
    await expect(toggle).toBeFocused();
    await toggle.press('Enter');
  }
  await expect(page.getByRole('button', { name: `Theme: ${label}. Click to switch.`, exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
  // The heading can reach its new colour before inherited text and page paint.
  // Require the real body foreground and both opaque page backgrounds to reach
  // their declared theme tokens across successive frames before taking images.
  await expect.poll(() => page.evaluate(async () => {
    const root = getComputedStyle(document.documentElement);
    const renderedColor = (paint: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d');
      if (!context) return [];
      context.fillStyle = paint;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    };
    const foreground = renderedColor(`hsl(${root.getPropertyValue('--foreground').trim()})`);
    const background = renderedColor(root.getPropertyValue('--page-bg-base').trim());
    const matches = (paint: string, expected: number[]) => {
      const actual = renderedColor(paint);
      return actual.length === expected.length && actual.every((channel, index) => Math.abs(channel - expected[index]) <= 1);
    };
    for (let frame = 0; frame < 3; frame += 1) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      if (!matches(getComputedStyle(document.body).color, foreground) ||
          !matches(getComputedStyle(document.body).backgroundColor, background) ||
          !matches(getComputedStyle(document.documentElement).backgroundColor, background)) return false;
    }
    return true;
  }), { message: 'Body text and html/body backgrounds have settled to the selected theme' }).toBe(true);
}
