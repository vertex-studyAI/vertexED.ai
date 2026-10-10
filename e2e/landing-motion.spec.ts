import { expect, test } from '@playwright/test';

for (const width of [1440, 1024, 390]) {
  test(`render and keyboard controls at ${width}, both themes`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Keep the idea. Change the attempt.' })).toBeVisible();
    await page.locator('.motion-hero').scrollIntoViewIfNeeded();
    await page.locator('.motion-hero summary').focus();
    await page.keyboard.press('Enter');
    await page.getByLabel('Visual treatment').selectOption('17');
    await page.getByLabel('Rotate the concept globe').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByLabel('Rotate the concept globe')).toHaveValue('26');
    await page.getByLabel('Visual treatment').selectOption('0');
    await page.locator('.motion-hero summary').click();
    const stages = page.getByRole('group', { name: 'Revision journey stages' });
    await stages.getByRole('button', { name: '02 Review' }).focus();
    await page.keyboard.press('Enter');
    await expect(stages.getByRole('button', { name: '02 Review' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Find the missing connection.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Reveal the connection' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Movement → water potential → membrane.')).toBeVisible();
    await expect(page.locator('.motion-journey-sticky')).toHaveCSS('position', 'static');
    await expect(page.getByRole('button', { name: 'Enable microphone' })).toBeDisabled();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(value); }, theme);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: info.outputPath(`home-${width}-${theme}.png`), fullPage: true });
      await page.locator('.motion-hero').screenshot({ path: info.outputPath(`hero-${width}-${theme}.png`) });
      await page.locator('.motion-journey').screenshot({ path: info.outputPath(`journey-${width}-${theme}.png`) });
      await page.locator('.motion-tools').screenshot({ path: info.outputPath(`tools-${width}-${theme}.png`) });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    }
    expect(errors).toEqual([]);
  });
}

test('all shader treatments render, settle, and remain still with motion off', async ({ page }, info) => {
  await page.goto('/');
  await page.locator('.motion-hero summary').click();
  const signatures = new Set<string>();
  for (let index = 0; index < 17; index++) {
    await page.getByLabel('Visual treatment').selectOption(String(index));
    await expect(page.locator('.motion-shader')).toHaveAttribute('data-fallback', 'false');
    await expect(page.locator('.motion-shader canvas')).toHaveAttribute('data-mode', String(index));
    signatures.add(await page.locator('.motion-shader canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()));
    if ([1, 4, 6, 12, 13, 16].includes(index)) await page.locator('.motion-hero-window').screenshot({ path: info.outputPath(`shader-${index}.png`) });
  }
  expect(signatures.size).toBe(17);
  await page.getByRole('button', { name: 'Motion on', exact: true }).click();
  const canvas = page.locator('.motion-shader canvas');
  const before = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await canvas.hover();
  await page.waitForTimeout(200);
  expect(await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).toBe(before);
  await page.getByRole('button', { name: 'Motion off', exact: true }).click();
  await page.getByRole('button', { name: 'Replay light movement' }).click();
  await expect(canvas).toHaveAttribute('data-animating', 'true');
  await expect(canvas).toHaveAttribute('data-animating', 'false', { timeout: 5000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.vertex-home')).toHaveAttribute('data-effects', 'off');
});

test('scroll drives the video and stages; manual selection stays in control', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('.motion-journey');
  await expect.poll(() => page.locator('.motion-journey-video').evaluate((video: HTMLVideoElement) => video.duration)).toBeGreaterThan(3);
  await section.evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + scrollY + element.clientHeight * .45));
  await expect.poll(() => page.locator('.motion-journey-video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(.3);
  const stages = page.getByRole('group', { name: 'Revision journey stages' });
  await stages.getByRole('button', { name: '01 Attempt' }).click();
  await page.mouse.wheel(0, 120);
  await expect(stages.getByRole('button', { name: '01 Attempt' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Follow scroll again' }).click();
  await expect(page.locator('.motion-journey-video')).toHaveJSProperty('paused', true);
});

test('microphone denial is recoverable and a late permission grant is released after cancellation', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as unknown as { micAttempts: number; stopped: boolean; resolveMic?: (stream: unknown) => void };
    state.micAttempts = 0; state.stopped = false;
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: () => {
      state.micAttempts++;
      if (state.micAttempts === 1) return Promise.reject(new DOMException('Denied', 'NotAllowedError'));
      return new Promise(resolve => { state.resolveMic = resolve; });
    } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enable microphone' }).click();
  await expect(page.getByText('Microphone could not start. Check browser permission, then try again.')).toBeVisible();
  await page.getByRole('button', { name: 'Enable microphone' }).click();
  await page.getByRole('button', { name: 'Cancel microphone request' }).click();
  await page.evaluate(() => {
    const state = window as unknown as { stopped: boolean; resolveMic: (stream: unknown) => void };
    state.resolveMic({ getTracks: () => [{ stop: () => { state.stopped = true; } }] });
  });
  await expect.poll(() => page.evaluate(() => (window as unknown as { stopped: boolean }).stopped)).toBe(true);
  await expect(page.locator('.motion-voice')).toHaveAttribute('data-listening', 'false');
});

test('WebGL failure retains content and controls', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === 'webgl') return null;
      return original.apply(this, [type, ...args]);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.motion-shader')).toHaveAttribute('data-fallback', 'true');
  await page.locator('.motion-hero summary').click();
  await page.getByLabel('Visual treatment').selectOption('19');
  await page.getByLabel('Turn the study sculpture').fill('35');
  await expect(page.getByLabel('Turn the study sculpture')).toHaveValue('35');
  await expect(page.getByRole('link', { name: 'Join the private beta' })).toBeVisible();
});
