import { expect, test } from '@playwright/test';

for (const width of [1440, 1024, 390]) {
  test(`learning controls and held study content remain usable at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');

    const section = page.locator('#learning');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Six moves. One visible thread.' })).toBeVisible();
    const firstTab = section.getByRole('tab', { name: /Learn/ });
    await firstTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(section.getByRole('tab', { name: /Practise/ })).toHaveAttribute('aria-selected', 'true');
    await expect(section.getByRole('tab', { name: /Practise/ })).toBeFocused();
    await section.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`learning-${width}.png`) });

    const gallery = page.locator('#study-examples');
    await gallery.scrollIntoViewIfNeeded();
    await expect(gallery.getByRole('heading', { name: 'Study examples' })).toBeVisible();
    await expect(gallery.getByText('Awaiting subject review')).toBeVisible();
    await expect(page.locator('#guided-reasoning').getByRole('heading', { name: 'Guided reasoning' })).toBeVisible();
    await gallery.screenshot({ path: info.outputPath(`study-review-${width}.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.vertex-home')).toHaveAttribute('data-effects', 'off');
    await expect(gallery.getByRole('heading', { name: 'Study examples' })).toBeVisible();
  });
}

test('concept lens modal has an opaque themed surface and restores focus', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open concept lens', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Concept Lens' });
  await expect(dialog).toBeVisible();
  const background = await dialog.evaluate(element => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  await expect(dialog.getByText('Awaiting subject review')).toBeVisible();
  await dialog.screenshot({ path: info.outputPath('concept-lens-modal.png') });
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

for (const width of [1440, 1024, 390]) {
  test(`features, about and login remain readable at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/features');
    await expect(page.getByRole('heading', { level: 1, name: 'Find the right tool for the way you learn.' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.waitForTimeout(900);
    await page.screenshot({ path: info.outputPath(`features-${width}.png`) });

    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1, name: /Build the method/ })).toBeVisible();
    await expect(page.getByText(/biographical claims below have not been independently verified/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: info.outputPath(`about-${width}.png`) });

    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1, name: 'Pick up where you left off.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: info.outputPath(`login-${width}.png`) });
  });
}

test('shared glass surfaces retain the radius hierarchy and accessibility fallback', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');

  const navigation = page.locator('.vertex-navigation');
  const panel = page.locator('main .glass-panel');
  const login = page.getByRole('button', { name: 'Log in', exact: true });
  await expect(panel).toBeVisible();

  const material = await page.evaluate(() => {
    const read = (selector: string) => getComputedStyle(document.querySelector<HTMLElement>(selector)!);
    const nav = read('.vertex-navigation');
    const panelStyle = read('main .glass-panel');
    const button = getComputedStyle([...document.querySelectorAll('button')].find(node => node.textContent?.trim() === 'Log in')!);
    return {
      navRadius: nav.borderRadius,
      navBackdrop: nav.backdropFilter || nav.getPropertyValue('-webkit-backdrop-filter'),
      panelRadius: panelStyle.borderRadius,
      panelBackdrop: panelStyle.backdropFilter || panelStyle.getPropertyValue('-webkit-backdrop-filter'),
      panelBackground: panelStyle.backgroundImage,
      buttonRadius: button.borderRadius,
    };
  });

  expect(material.navRadius).toBe('24px');
  expect(material.panelRadius).toBe('24px');
  expect(material.buttonRadius).toBe('8px');
  expect(material.panelBackground).not.toBe('none');
  expect(material.navBackdrop).not.toBe('none');
  expect(material.panelBackdrop).not.toBe('none');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(navigation).toHaveCSS('backdrop-filter', 'none');
  await expect(panel).toHaveCSS('backdrop-filter', 'none');
});
