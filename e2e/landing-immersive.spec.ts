import { expect, test } from '@playwright/test';

for (const width of [1440, 1024, 390]) for (const theme of ['light', 'dark']) {
  test(`immersive landing ${width}px ${theme}`, async ({ page }) => {
    // Six large image captures need an I/O budget separate from action timeouts.
    test.setTimeout(90_000);
    const runtimeErrors: string[] = [];
    page.on('pageerror', error => runtimeErrors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await page.evaluate(theme => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(theme); }, theme);
    await expect(page.locator('#home-title')).toHaveText('You’ve read it.Now try it.');
    await page.getByRole('tab', { name: '02 Review' }).click();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: '03 Retry' })).toBeFocused();
    await expect(page.getByRole('heading', { name: 'Try a related question without notes.' })).toBeVisible();
    await page.getByRole('tab', { name: '01 Attempt' }).click();
    await expect(page.getByRole('heading', { name: 'Explain water uptake in a root hair cell.', exact: true })).toBeVisible();
    await expect(page.locator('.hero-grid, .invitation-grid')).toHaveCount(0);
    expect(await page.locator('.site-landing').evaluate(el => getComputedStyle(el).overflowX)).toBe('clip');
    expect(await page.locator('.site-landing').evaluate(el => el.scrollLeft)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `test-results/immersive-hero-${width}-${theme}.png`, animations: 'disabled' });
    await page.screenshot({ path: `test-results/immersive-${width}-${theme}.png`, fullPage: true, animations: 'disabled' });
    await page.locator('#exam-session').screenshot({ path: `test-results/extended-exam-${width}-${theme}.png`, animations: 'disabled' });
    expect(await page.locator('.site-landing').evaluate(el => el.getBoundingClientRect().left)).toBe(0);
    await page.locator('#study-tools').screenshot({ path: `test-results/inspira-gallery-${width}-${theme}.png`, animations: 'disabled' });
    await page.getByRole('button', { name: 'About Exam Prep', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('link', { name: 'Open Exam Prep' })).toHaveAttribute('href', '/exam-prep');
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: `test-results/inspira-modal-${width}-${theme}.png`, animations: 'disabled' });
    await page.keyboard.press('Escape');
    expect(runtimeErrors).toEqual([]);
  });
}

test('gallery, modal, comparison and session preview are keyboard usable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'About Exam Prep', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Exam Prep', exact: true })).toBeVisible();
  expect(await page.locator('#root').evaluate(el => el.inert)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'About Exam Prep', exact: true })).toBeFocused();
  expect(await page.locator('#root').evaluate(el => el.inert)).toBe(false);
  const gallery = page.getByRole('region', { name: 'Study tools' });
  await page.getByRole('button', { name: 'Next tools' }).click();
  await expect.poll(() => gallery.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
  const slider = page.getByRole('slider', { name: 'Reveal the revised answer' });
  await expect(page.locator('.compare-sheets')).toHaveAttribute('data-both', 'true');
  await page.getByRole('button', { name: 'Use slider', exact: true }).click();
  await slider.focus(); await page.keyboard.press('End');
  await expect(slider).toHaveValue('100');
  await page.getByRole('button', { name: 'Read both answers' }).click();
  await expect(slider).toHaveCount(0);
  await expect(page.locator('.compare-sheets')).toHaveAttribute('data-both', 'true');
  await page.getByRole('button', { name: /25\s*min/, exact: true }).click();
  await expect(page.locator('.session-blocks')).toContainText('15 min');
  await page.getByRole('button', { name: /75\s*min/, exact: true }).click();
  await expect(page.locator('.session-blocks')).toContainText('45 min');
});

test('starting-point guide preserves keyboard navigation and points to real tools', async ({ page }) => {
  await page.goto('/');
  const choices = page.getByRole('tablist', { name: 'Choose a starting point' });
  await choices.getByRole('tab', { name: /I have notes/ }).click();
  await expect(page.getByRole('link', { name: 'Work with my notes' })).toHaveAttribute('href', '/notetaker');
  await page.keyboard.press('ArrowRight');
  await expect(choices.getByRole('tab', { name: /I need practice/ })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Make a practice paper' })).toHaveAttribute('href', '/paper-maker');
  await page.keyboard.press('ArrowRight');
  await expect(choices.getByRole('tab', { name: /I have an answer/ })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Review my answer' })).toHaveAttribute('href', '/answer-reviewer');
  await page.keyboard.press('Home');
  await expect(choices.getByRole('tab', { name: /I have notes/ })).toBeFocused();
  await page.locator('.study-entry').screenshot({ path: 'test-results/extended-starting-point.png' });
});

test('landing questions expand with the keyboard and preserve factual limits', async ({ page }) => {
  await page.goto('/');
  const paperQuestion = page.locator('summary').filter({ hasText: 'Are generated papers official exam papers?' });
  await paperQuestion.focus(); await page.keyboard.press('Enter');
  await expect(page.getByText('No. Paper Maker creates exam-style practice, not official past papers.', { exact: false })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByText('No. Paper Maker creates exam-style practice, not official past papers.', { exact: false })).toBeHidden();
  await page.locator('summary').filter({ hasText: 'Can I try it without an account?' }).click();
  await expect(page.locator('.faq-answers').getByRole('link', { name: /Join the private beta/ })).toHaveAttribute('href', '/signup');
});

test('effects persist, reduced motion hides fluid and enlarged text stays within viewport', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Effects on', exact: true });
  await toggle.click();
  await page.reload();
  await expect(page.locator('.landing-v3')).toHaveAttribute('data-effects', 'off');
  await expect(page.locator('.landing-ink')).toBeHidden();
  await page.getByRole('button', { name: 'Effects off', exact: true }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.landing-ink')).toBeHidden();
  expect(await page.locator('.heading-line').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
  for (const selector of ['.entry-choices', '.entry-panel[data-state=active]', '.session-duration', '.faq-answers']) {
    const region = page.locator(selector);
    expect(await region.evaluate(el => el.scrollWidth <= el.clientWidth + 1), `${selector} fits enlarged text`).toBe(true);
  }
  expect(await page.locator('.tool-preview').evaluateAll(elements => elements.every(el => el.scrollWidth <= el.clientWidth + 1))).toBe(true);
  await page.getByRole('button', { name: 'About Exam Prep', exact: true }).click();
  const dialog = page.getByRole('dialog');
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await page.keyboard.press('Escape');
});

test('fluid paints on pointer movement and clears when effects are disabled', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.mouse.move(220, 240);
  await page.mouse.move(480, 420, { steps: 20 });
  const ink = page.locator('.landing-ink');
  const painted = () => ink.evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    return pixels.some((value, index) => index % 4 === 3 && value > 0);
  });
  await expect.poll(painted).toBe(true);
  await page.screenshot({ path: 'test-results/immersive-fluid.png' });
  await page.getByRole('button', { name: 'Effects on', exact: true }).click();
  await expect.poll(painted).toBe(false);
});

test('touch input keeps fluid off and navigation usable', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4175');
    await expect(page.locator('.landing-ink')).toBeHidden();
    await page.getByRole('button', { name: 'Open navigation menu' }).tap();
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
    await page.getByRole('button', { name: 'Close navigation menu' }).tap();
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).not.toBeVisible();
  } finally { await context.close(); }
});

test('glass dock follows the reading position without moving keyboard focus', async ({ page }) => {
  await page.goto('/');
  const dock = page.getByRole('navigation', { name: 'Explore this page' });
  const tools = dock.getByRole('link', { name: 'The tools', exact: true });
  await tools.focus();
  await page.locator('#study-tools').scrollIntoViewIfNeeded();
  await expect(tools).toHaveAttribute('aria-current', 'location');
  await expect(tools).toBeFocused();
  await page.locator('#exam-session').scrollIntoViewIfNeeded();
  await expect(dock.getByRole('link', { name: 'Exam prep', exact: true })).toHaveAttribute('aria-current', 'location');
  await expect(dock.locator('[aria-current]')).toHaveCount(1);
  await expect(tools).toBeFocused();
});

test('floating surfaces respond to the pointer, then reset for keyboard and motion preferences', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const card = page.locator('.tool-card').first();
  await card.scrollIntoViewIfNeeded();
  const bounds = (await card.boundingBox())!;
  await page.mouse.move(bounds.x + 30, bounds.y + 50);
  await expect(card).toHaveAttribute('data-lit', 'true');
  expect(await card.evaluate(el => el.style.getPropertyValue('--tilt-y'))).not.toBe('');
  await card.getByRole('link').focus();
  await expect(card).not.toHaveAttribute('data-lit');
  expect(await card.evaluate(el => el.style.getPropertyValue('--tilt-y'))).toBe('');
  await page.locator('.tool-gallery').focus();
  await page.mouse.move(bounds.x + 80, bounds.y + 80);
  await expect(card).toHaveAttribute('data-lit', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card).not.toHaveAttribute('data-lit');
  await expect(page.locator('.landing-ink')).toBeHidden();
});

test('tool detail browsing preserves its modal and gallery supports Home and End', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'About Exam Prep', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Previous tool detail' })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Next tool detail' }).click();
  await expect(dialog.getByRole('heading', { name: 'Study Planner', exact: true })).toBeVisible();
  await expect(dialog.locator('.tool-preview')).toContainText('Example study blocks');
  expect(await page.locator('#root').evaluate(el => el.inert)).toBe(true);
  await dialog.screenshot({ path: 'test-results/inspira-tool-detail.png', animations: 'disabled' });
  await dialog.getByRole('button', { name: 'Previous tool detail' }).click();
  await expect(dialog.getByRole('heading', { name: 'Exam Prep', exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Next tool detail' })).toBeFocused();
  for (let i = 0; i < 6; i++) await dialog.getByRole('button', { name: 'Next tool detail' }).click();
  await expect(dialog.getByRole('heading', { name: 'Apex', exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Next tool detail' })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Previous tool detail' })).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await dialog.locator('.tool-detail-layout').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'About Exam Prep', exact: true })).toBeFocused();
  const gallery = page.getByRole('region', { name: 'Study tools' });
  await gallery.focus(); await page.keyboard.press('End');
  await expect(page.getByRole('button', { name: 'Next tools', exact: true })).toBeDisabled();
  await page.keyboard.press('Home');
  await expect(page.getByRole('button', { name: 'Previous tools', exact: true })).toBeDisabled();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => gallery.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
});

test('fluid fades at rest and does not survive accessibility preference changes', async ({ page }) => {
  await page.goto('/');
  await page.mouse.move(220, 240); await page.mouse.move(480, 420, { steps: 20 });
  const painted = () => page.locator('.landing-ink').evaluate((canvas: HTMLCanvasElement) =>
    canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data.some((value, i) => i % 4 === 3 && value > 0));
  await expect.poll(painted).toBe(true);
  await expect.poll(painted, { timeout: 6000 }).toBe(false);
  await page.mouse.move(620, 420, { steps: 10 });
  await expect.poll(painted).toBe(true);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect.poll(painted).toBe(false);
  await expect(page.locator('.landing-ink')).toBeHidden();
});
