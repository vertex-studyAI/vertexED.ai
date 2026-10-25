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
  // Sample through the test runner: headless Linux WebKit can pause animation
  // frames even while DOM/style reads work. A frame callback must not block the
  // predicate indefinitely. Three consecutive samples still require stable computed styles.
  let settledSamples = 0;
  await expect.poll(async () => {
    const diagnostic = await page.evaluate(() => {
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
      const body = getComputedStyle(document.body);
      const root = getComputedStyle(document.documentElement);
      const rootBackground = root.backgroundColor;
      const rootIsOpaque = rootBackground !== 'transparent' &&
        !/^rgba\([^,]+,[^,]+,[^,]+,\s*0(?:\.0+)?\)$/.test(rootBackground);
      const diagnostic = body.color !== expectedColor || body.backgroundColor !== expectedBackground || !rootIsOpaque
        ? JSON.stringify({
          className: document.documentElement.className,
          bodyColor: body.color,
          expectedColor,
          bodyBackground: body.backgroundColor,
          expectedBackground,
          rootBackground,
        }) : '';
      sentinel.remove();
      return diagnostic;
    });
    settledSamples = diagnostic ? 0 : settledSamples + 1;
    return diagnostic || (settledSamples >= 3 ? 'settled' : `settling (${settledSamples}/3)`);
  }, { intervals: [50, 100, 250], message: 'Body text and html/body backgrounds have settled to the selected theme' }).toBe('settled');
}
