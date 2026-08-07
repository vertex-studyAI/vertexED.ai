import { expect, test, type Page } from '@playwright/test';

const launchViewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

async function tokenContrastRatio(page: Page, foregroundToken: string, backgroundToken: string) {
  return page.evaluate(
    ({ foregroundToken, backgroundToken }) => {
      const probe = document.createElement('span');
      probe.style.color = `hsl(var(--${foregroundToken}))`;
      probe.style.backgroundColor = `hsl(var(--${backgroundToken}))`;
      probe.textContent = 'contrast probe';
      document.body.appendChild(probe);
      const style = getComputedStyle(probe);
      const foreground = style.color;
      const background = style.backgroundColor;
      probe.remove();

      const rgb = (value: string) => {
        const match = value.match(/rgba?\((\d+(?:\.\d+)?)[, ]+(\d+(?:\.\d+)?)[, ]+(\d+(?:\.\d+)?)/);
        if (!match) throw new Error(`Unable to parse computed color: ${value}`);
        return [Number(match[1]), Number(match[2]), Number(match[3])];
      };
      const luminance = (channels: number[]) => {
        const linear = channels.map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
      };
      const first = luminance(rgb(foreground));
      const second = luminance(rgb(background));
      const lighter = Math.max(first, second);
      const darker = Math.min(first, second);
      return (lighter + 0.05) / (darker + 0.05);
    },
    { foregroundToken, backgroundToken },
  );
}

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
    const navigation = page.locator('#mobile-nav');
    const firstLink = navigation.locator('a').first();
    const navigationContainer = navigation.locator('xpath=..');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(navigationContainer).toHaveAttribute('aria-hidden', 'true');
    await expect(navigation).toHaveJSProperty('inert', true);

    const closedMenuAcceptedFocus = await firstLink.evaluate((element) => {
      (element as HTMLElement).focus();
      return document.activeElement === element;
    });
    expect(closedMenuAcceptedFocus).toBe(false);

    await trigger.click();
    await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true');
    await expect(navigationContainer).toHaveAttribute('aria-hidden', 'false');
    await expect(navigation).toHaveJSProperty('inert', false);

    await firstLink.focus();
    await expect(firstLink).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused();
    await expect(navigationContainer).toHaveAttribute('aria-hidden', 'true');
    await expect(navigation).toHaveJSProperty('inert', true);
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

  for (const viewport of launchViewports) {
    test(`public auth surfaces keep visible keyboard focus and fit at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const path of ['/', '/login', '/signup']) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        await expectNoHorizontalOverflow(page);

        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();
        await expect.poll(async () => page.evaluate(() => document.activeElement?.tagName || '')).not.toBe('BODY');
      }
    });
  }

  test('core design-system text pairs meet WCAG AA contrast in light and dark themes', async ({ page }) => {
    await page.goto('/login');

    for (const theme of ['dark', 'light']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(nextTheme);
      }, theme);

      const pairs = [
        ['foreground', 'background'],
        ['muted-foreground', 'background'],
        ['primary-foreground', 'primary'],
      ] as const;

      for (const [foreground, background] of pairs) {
        const ratio = await tokenContrastRatio(page, foreground, background);
        expect(
          ratio,
          `${theme} ${foreground}/${background} contrast ratio`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
