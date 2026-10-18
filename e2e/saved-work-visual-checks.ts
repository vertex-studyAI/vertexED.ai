import { expect, type Locator, type Page } from '@playwright/test';

/** Sample the edges as well as the centre: a floating sprite can hide a select arrow. */
async function hitSamples(target: Locator) {
  return target.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return [0.08, 0.5, 0.92].map(fraction => {
      const x = rect.left + rect.width * fraction;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);
      return {
        fraction, x, y,
        clear: x >= 0 && x < innerWidth && y >= 0 && y < innerHeight && !!hit && (hit === element || element.contains(hit)),
        target: hit ? `${hit.tagName.toLowerCase()}${hit.id ? `#${hit.id}` : ''}.${Array.from(hit.classList).join('.')}` : null,
      };
    });
  });
}

export async function inspectSavedWorkFilters(page: Page) {
  const samples = [];
  for (const name of ['Search saved work', 'Work type', 'Save location', 'Sort by']) {
    const target = page.getByLabel(name, { exact: true });
    samples.push({ name, samples: await hitSamples(target) });
  }
  const overlaps = await page.locator('.saved-work-page').evaluate(section => {
    const launchers = Array.from(document.querySelectorAll<HTMLElement>('.vee-launcher, .feedback-launcher')).filter(element => element.getClientRects().length);
    const targets = Array.from(section.querySelectorAll<HTMLElement>('input, select, [role="status"]'));
    return targets.flatMap(target => {
      const bounds = target.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= innerHeight) return [];
      return launchers.flatMap(launcher => {
        const overlay = launcher.getBoundingClientRect();
        const width = Math.min(bounds.right, overlay.right) - Math.max(bounds.left, overlay.left);
        const height = Math.min(bounds.bottom, overlay.bottom) - Math.max(bounds.top, overlay.top);
        return width > 0 && height > 0 ? [{ control: target.getAttribute('aria-label') || target.textContent?.trim(), launcher: launcher.id || launcher.className, width, height }] : [];
      });
    });
  });
  return { samples, overlaps };
}

export async function assertSavedWorkFooterHits(page: Page) {
  const footer = page.locator('footer');
  const controls = footer.locator('a[href], button:not([disabled])');
  const sampled = [];
  for (let index = 0; index < await controls.count(); index += 1) {
    const target = controls.nth(index);
    const label = await target.textContent();
    await target.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect.poll(async () => (await hitSamples(target)).every(point => point.clear), `Footer ${label} receives pointer input`).toBe(true);
    sampled.push({ label, samples: await hitSamples(target) });
  }
  const feedback = page.getByRole('button', { name: 'Give VertexED feedback', exact: true });
  await feedback.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect.poll(async () => (await hitSamples(feedback)).every(point => point.clear), 'Feedback receives pointer input').toBe(true);
  return sampled;
}
