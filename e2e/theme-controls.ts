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
  // Compare the body with a DOM sentinel that uses the same tokens. Canvas pixel
  // reads and browser-computed colours pass through different colour-management
  // paths in WebKit, so comparing those representations produced false failures.
  // Returning diagnostics instead of a boolean keeps any real mismatch visible.
  await expect.poll(() => page.evaluate(async () => {
    const sentinel = document.createElement('span');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = [
      'position:fixed',
      'width:1px',
      'height:1px',
      'inset:auto auto 0 0',
      'pointer-events:none',
      'visibility:hidden',
      'color:hsl(var(--foreground))',
      'background-color:var(--page-bg-base)',
    ].join(';');
    document.body.append(sentinel);
    const expected = getComputedStyle(sentinel);
    const expectedColor = expected.color;
    const expectedBackground = expected.backgroundColor;
    let diagnostic = '';
    for (let frame = 0; frame < 3; frame += 1) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      const body = getComputedStyle(document.body);
      const root = getComputedStyle(document.documentElement);
      const rootBackground = root.backgroundColor;
      const rootIsOpaque = rootBackground !== 'transparent' &&
        !/^rgba\([^,]+,[^,]+,[^,]+,\s*0(?:\.0+)?\)$/.test(rootBackground);
      if (body.color !== expectedColor || body.backgroundColor !== expectedBackground || !rootIsOpaque) {
        diagnostic = JSON.stringify({
          frame,
          className: document.documentElement.className,
          bodyColor: body.color,
          expectedColor,
          bodyBackground: body.backgroundColor,
          expectedBackground,
          rootBackground,
        });
        break;
      }
    }
    sentinel.remove();
    return diagnostic || 'settled';
  }), { message: 'Body text and html/body backgrounds have settled to the selected theme' }).toBe('settled');
}
