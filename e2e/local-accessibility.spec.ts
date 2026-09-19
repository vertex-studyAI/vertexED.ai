import { expect, test, type Page } from '@playwright/test';

const launchViewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

const visualEvidenceWidths = new Set([390, 1024, 1440]);

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

  test('client-side route changes move focus to the new main landmark', async ({ page }) => {
    await page.goto('/');
    if ((page.viewportSize()?.width ?? 1440) >= 1280) {
      await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Features' }).click();
    } else {
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
      await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Features' }).click();
    }
    await expect(page).toHaveURL(/\/features$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect(page.getByRole('heading', { name: 'Find the right tool for the way you learn.' })).toBeVisible();
  });

  test('closed mobile navigation is inert and Escape restores the trigger', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1440) >= 1280, 'Collapsed navigation is rendered below 1280px.');

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

  test('landing stage tabs move focus and update their panel', async ({ page }) => {
    await page.goto('/');
    const firstStage = page.getByRole('tab', { name: /Learn/ });
    await firstStage.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /Practise/ })).toBeFocused();
    await expect(page.getByRole('heading', { name: 'Make the first attempt.' })).toBeVisible();
  });

  test('Concept Lens traps focus, hides the background, closes on Escape, and returns focus', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Open concept lens' }).first();
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Notice the change. Explain the why.' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close concept lens' })).toBeFocused();
    await expect(page.locator('#root')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#root')).toHaveJSProperty('inert', true);

    await page.keyboard.press('Tab');
    await expect(dialog.locator(':focus')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('#root')).not.toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#root')).toHaveJSProperty('inert', false);
  });

  test('reduced motion removes landing animation and keeps horizontal alternatives usable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.vertex-home')).toBeVisible();

    const motion = await page.evaluate(() => ({
      rootAnimations: (document.querySelector('.vertex-home') as HTMLElement)
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === 'running').length,
      marqueeOverflow: getComputedStyle(document.querySelector('.vh-marquee') as HTMLElement).overflowX,
      stackTransform: getComputedStyle(document.querySelector('.vh-stack-game') as HTMLElement).transform,
    }));
    expect(motion.rootAnimations).toBe(0);
    expect(motion.marqueeOverflow).toBe('auto');
    expect(motion.stackTransform).toBe('none');
  });

  test('mobile mastery content stays inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const dimensions = await page.locator('.vh-mastery-copy').evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, viewport: window.innerWidth };
    });
    expect(dimensions.left).toBeGreaterThanOrEqual(0);
    expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport + 1);
  });

  for (const viewport of launchViewports) {
    test(`public auth surfaces keep visible keyboard focus and fit at ${viewport.width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);

      for (const path of ['/', '/login', '/signup']) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        await expectNoHorizontalOverflow(page);

        if (path === '/' && visualEvidenceWidths.has(viewport.width)) {
          await expect(page.locator('.landing-hero')).toBeVisible();
          await expect(page.locator('.vh-learning')).toBeVisible();
          await expect(page.locator('.vh-subjects')).toBeVisible();
          await page.screenshot({
            path: testInfo.outputPath(`landing-${viewport.width}x${viewport.height}.png`),
            fullPage: true,
            animations: 'disabled',
          });
        }

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
