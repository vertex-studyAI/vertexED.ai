import { expect, type Locator, type Page } from '@playwright/test';

export async function assertCenterHitTarget(control: Locator, description: string) {
  const hit = await control.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const target = document.elementFromPoint(x, y);
    return {
      rect: rect.toJSON(), point: { x, y },
      inViewport: x >= 0 && x < innerWidth && y >= 0 && y < innerHeight,
      reachable: target === element || Boolean(target && element.contains(target)),
      actualTarget: target?.outerHTML.slice(0, 500),
    };
  });
  expect(hit.inViewport, `${description} center must be inside the viewport: ${JSON.stringify(hit)}`).toBe(true);
  expect(hit.reachable, `${description} must receive its center pointer hit: ${JSON.stringify(hit)}`).toBe(true);
  return hit;
}

export async function assertFocusInitialHitTargets(page: Page) {
  const timer = page.locator('#study-zone-timer');
  await assertCenterHitTarget(timer.getByRole('button', { name: 'Move Timer Suite later', exact: true }), 'Timer reorder button');
  await assertCenterHitTarget(timer.locator('[title="Drag Timer Suite"]'), 'Timer drag handle');
}

export async function assertFocusActionHitTargets(focus: Locator) {
  // Inspect export without activating it or creating a download.
  for (const name of ['Export focus data', 'Resume', 'Finish block', 'Reset timer']) {
    const button = focus.getByRole('button', { name, exact: true });
    await expect(button).toBeEnabled();
    await button.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await assertCenterHitTarget(button, name);
  }
}

export async function assertCalculatorKeyContrast(calculator: Locator, theme: string) {
  const measurements = [];
  for (const name of ['Del', 'C', '=']) {
    const button = calculator.getByRole('button', { name, exact: true });
    await expect(button).toBeEnabled();
    await button.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await assertCenterHitTarget(button, `Calculator ${name}`);
    const contrast = await button.evaluate(element => {
      const rgba = (value: string) => {
        if (!/^rgba?\(/.test(value)) throw new Error(`Unsupported computed colour: ${value}`);
        const parts = value.match(/[\d.]+/g)!.map(Number);
        return [parts[0], parts[1], parts[2], parts[3] ?? 1];
      };
      const foreground = rgba(getComputedStyle(element).color);
      const background = [0, 0, 0];
      let opacity = 0;
      const surfaces: string[] = [];
      // Measure the actual tinted key over its opaque ancestor surface.
      // A different or unsupported surface fails rather than assuming a theme.
      for (let ancestor: Element | null = element; ancestor && opacity < 1; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (style.backgroundImage !== 'none' || Number(style.opacity) !== 1) {
          throw new Error(`Calculator ${element.textContent?.trim()} contrast needs a flat surface without group opacity: ${ancestor.tagName}.${ancestor.className} background=${style.backgroundImage} opacity=${style.opacity} accumulated=${opacity} surfaces=${surfaces.join(',')}`);
        }
        const colour = rgba(style.backgroundColor);
        const weight = (1 - opacity) * colour[3];
        for (let channel = 0; channel < 3; channel += 1) background[channel] += colour[channel] * weight;
        opacity += weight;
        if (weight > 0) surfaces.push(style.backgroundColor);
      }
      if (opacity !== 1) throw new Error('Calculator contrast has no opaque ancestor background.');
      const textColour = background.map((value, index) => foreground[index] * foreground[3] + value * (1 - foreground[3]));
      const luminance = (colour: number[]) => colour.map(value => {
        const normal = value / 255;
        return normal <= .04045 ? normal / 12.92 : ((normal + .055) / 1.055) ** 2.4;
      }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
      const textLuminance = luminance(textColour), backgroundLuminance = luminance(background);
      return { foreground, background, surfaces,
        fontSize: getComputedStyle(element).fontSize, fontWeight: getComputedStyle(element).fontWeight,
        ratio: (Math.max(textLuminance, backgroundLuminance) + .05) / (Math.min(textLuminance, backgroundLuminance) + .05) };
    });
    expect(contrast.ratio, `${theme} calculator ${name} contrast: ${JSON.stringify(contrast)}`).toBeGreaterThanOrEqual(4.5);
    measurements.push({ name, ...contrast });
  }
  return measurements;
}

export async function assertFocusFooterHitTargets(page: Page) {
  const feedback = page.getByRole('button', { name: 'Give VertexED feedback', exact: true });
  await feedback.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await assertCenterHitTarget(feedback, 'Feedback');
  const footerControls = page.locator('footer').locator('a, button');
  for (const control of await footerControls.all()) {
    if (await control.isDisabled()) continue;
    await control.scrollIntoViewIfNeeded();
    await assertCenterHitTarget(control, `Footer ${await control.textContent()}`);
  }
  await feedback.scrollIntoViewIfNeeded();
}
