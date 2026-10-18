import { expect, type Page } from '@playwright/test';

export async function selectTheme(page: Page, theme: 'light' | 'dark') {
  const label = theme === 'dark' ? 'Dark' : 'Light';
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await page.getByRole('button', { name: `Theme: ${label}. Click to switch.`, exact: true }).count()) break;
    await page.getByRole('button', { name: /^Theme: .*Click to switch\.$/ }).click();
  }
  await expect(page.getByRole('button', { name: `Theme: ${label}. Click to switch.`, exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
  // The heading can reach its new colour before inherited text and page paint.
  // Require the real body foreground and both opaque page backgrounds to reach
  // their declared theme tokens across successive frames before taking images.
  await expect.poll(() => page.evaluate(async () => {
    const root = getComputedStyle(document.documentElement);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    if (!context) return false;
    const token = (name: string, hslChannels = false) => {
      const value = root.getPropertyValue(name).trim();
      const paint = hslChannels ? `hsl(${value})` : value;
      if (!value || !CSS.supports('color', paint)) return [];
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = paint;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    };
    const foreground = token('--foreground', true);
    const background = token('--page-bg-base');
    const matches = (paint: string, expected: number[]) => {
      const actual = paint.match(/[\d.]+/g)?.map(Number) ?? [];
      return actual.length >= 3 && (actual[3] ?? 1) === 1 &&
        actual.slice(0, 3).every((channel, index) => Math.abs(channel - expected[index]) <= 1);
    };
    for (let frame = 0; frame < 3; frame += 1) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      if (!matches(getComputedStyle(document.body).color, foreground) ||
          !matches(getComputedStyle(document.body).backgroundColor, background) ||
          !matches(getComputedStyle(document.documentElement).backgroundColor, background)) return false;
    }
    return true;
  }), { message: 'Body text and html/body backgrounds have settled to the selected theme' }).toBe(true);
  // Wait for inherited text colour as well as the root class. Directly editing
  // the DOM class can capture a partially transitioned, inconsistent theme.
  const colour = expect.poll(() => page.locator('h1').first().evaluate(element => {
    const painted = getComputedStyle(element).color;
    // Some notebook headings use background-clip text and a transparent colour.
    const colour = painted === 'rgba(0, 0, 0, 0)' ? getComputedStyle(document.body).color : painted;
    const channels = colour.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
    return channels.reduce((sum, channel) => sum + channel, 0) / 3;
  }));
  if (theme === 'dark') await colour.toBeGreaterThan(180);
  else await colour.toBeLessThan(100);
}
