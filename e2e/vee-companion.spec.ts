import { expect, test } from '@playwright/test';

test('Apex is readable in both themes and three viewports, with keyboard and reduced motion', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const launcher = page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true });
  await expect(launcher.locator('img')).toBeVisible();
  expect(await launcher.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(theme); }, theme);
      await page.screenshot({ path: `test-results/vee-landing-${theme}-${width}.png`, animations: 'disabled' });
      const bounds = await launcher.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
      expect(bounds!.y).toBeGreaterThan(650);
      await launcher.focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: 'Meet Apex.' });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Apex: hop' })).toBeDisabled();
      expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
      const close = dialog.getByRole('button', { name: 'Close Apex study shortcuts' });
      await expect(close).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(dialog.getByRole('button', { name: 'Hide Apex', exact: true })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      expect(await dialog.getByRole('link', { name: /Practise/ }).getAttribute('href')).toBe('/exam-prep');
      await page.screenshot({ path: `test-results/vee-sheet-${theme}-${width}.png`, animations: 'disabled' });
      const sheet = await dialog.boundingBox();
      expect(sheet!.x).toBeGreaterThanOrEqual(0);
      expect(sheet!.x + sheet!.width).toBeLessThanOrEqual(width);
      expect(sheet!.y).toBeGreaterThanOrEqual(0);
      await page.keyboard.press('Escape');
      await expect(launcher).toBeFocused();
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
      expect(await launcher.locator('img').evaluate(img => getComputedStyle(img).animationName)).toBe('none');
    }
  }
  await page.setViewportSize({ width: 390, height: 540 });
  await launcher.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hide Apex', exact: true }).click();
  await expect(launcher).toHaveCount(0);
  await expect(page.locator('#vee-visibility')).toBeFocused();
  await page.reload();
  await expect(launcher).toHaveCount(0);
  await page.getByRole('button', { name: 'Show Apex', exact: true }).click();
  await expect(launcher).toBeVisible();
  await page.reload();
  await expect(launcher).toBeVisible();
  await launcher.click();
  await page.getByRole('link', { name: 'Plan Make time for a topic.' }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(launcher).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Apex stays usable if artwork or preference storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Storage is blocked', 'SecurityError'); };
  });
  await page.route('**/companions/vee.png', route => route.abort());
  await page.goto('/');
  const launcher = page.getByRole('button', { name: 'Open Apex study shortcuts' });
  await expect(launcher).toBeVisible();
  await expect(launcher.locator('img')).toHaveCount(0);
  await launcher.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Hide Apex', exact: true }).click();
  await expect(launcher).toHaveCount(0);
  await page.getByRole('button', { name: 'Show Apex', exact: true }).click();
  await expect(launcher).toBeVisible();
});

test('Apex has one finite greeting and stays off in Simple Mode and authentication', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const launcher = page.getByRole('button', { name: 'Open Apex study shortcuts' });
  await launcher.hover();
  expect(await launcher.locator('img').evaluate(img => getComputedStyle(img).animationIterationCount)).toBe('1');
  expect(await launcher.locator('img').evaluate(img => getComputedStyle(img).animationName)).toBe('vee-greeting');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => launcher.locator('img').evaluate(img => getComputedStyle(img).animationName)).toBe('none');
  await page.evaluate(() => localStorage.setItem('vertex_a11y_settings', JSON.stringify({ simpleMode: true })));
  await page.reload();
  await expect(launcher).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Apex is off in Simple Mode' })).toBeDisabled();
  for (const path of ['/login', '/signup', '/auth/callback']) {
    await page.goto(path);
    await expect(launcher).toHaveCount(0);
  }
});

test('Apex hop, wiggle and spin play once, replay on demand and stop under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Apex study shortcuts' }).click();
  const dialog = page.getByRole('dialog', { name: 'Meet Apex.' });
  for (const name of ['hop', 'wiggle', 'spin', 'spin']) {
    const control = dialog.getByRole('button', { name: `Apex: ${name}`, exact: true });
    await control.focus();
    await page.keyboard.press('Enter');
    const sprite = dialog.locator('img');
    await expect(sprite).toHaveAttribute('data-reaction', name);
    const animation = await sprite.evaluate(img => {
      const animation = img.getAnimations()[0];
      const timing = animation?.effect?.getTiming();
      return { name: getComputedStyle(img).animationName, iterations: timing?.iterations, duration: timing?.duration };
    });
    expect(animation.name).toBe(`apex-${name}`);
    expect(animation.iterations).toBe(1);
    expect(animation.duration).toBeLessThanOrEqual(800);
    await sprite.evaluate(img => Promise.all(img.getAnimations().map(animation => animation.finished)));
    expect(await sprite.evaluate(img => getComputedStyle(img).transform)).toBe('none');
    await expect(control).toBeFocused();
  }
  await dialog.getByRole('button', { name: 'Apex: hop' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(dialog.getByRole('button', { name: 'Apex: hop' })).toBeDisabled();
  expect(await dialog.locator('img').evaluate(img => getComputedStyle(img).animationName)).toBe('none');
  await expect(dialog.getByText('Animations are off with reduced motion.')).toBeVisible();
  // Disabling motion must not eject keyboard focus or restart the last reaction later.
  await expect(dialog.getByRole('button', { name: 'Apex: hop' })).toBeFocused();
  await page.keyboard.press('Enter');
  expect(await dialog.locator('img').evaluate(img => getComputedStyle(img).animationName)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(dialog.getByRole('button', { name: 'Apex: hop' })).toBeEnabled();
  expect(await dialog.locator('img').evaluate(img => getComputedStyle(img).animationName)).toBe('none');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open Apex study shortcuts' })).toBeFocused();
});
