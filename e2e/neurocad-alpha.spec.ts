import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const NEUROCAD_URL = process.env.NEUROCAD_BASE_URL || 'http://127.0.0.1:8000/web/';
const evidenceDir = 'test-results/neurocad-alpha';

function captureRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
  });
  return errors;
}

async function expectRenderedViewport(page: Page) {
  const viewport = page.locator('#viewport');
  await expect(viewport).toBeVisible();
  await expect(page.locator('#viewer-fallback')).toBeHidden();
  await expect.poll(async () => viewport.evaluate((canvas: HTMLCanvasElement) => ({
    width: canvas.width,
    height: canvas.height,
  }))).toMatchObject({ width: expect.any(Number), height: expect.any(Number) });
  const dimensions = await viewport.evaluate((canvas: HTMLCanvasElement) => ({ width: canvas.width, height: canvas.height }));
  expect(dimensions.width).toBeGreaterThan(200);
  expect(dimensions.height).toBeGreaterThan(150);
}

async function screenshot(page: Page, name: string) {
  mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({ path: `${evidenceDir}/${name}`, fullPage: true });
}

test.describe('NeuroCAD Alpha 0.1 flagship browser certification', () => {
  test('jet-engine workflow renders, edits, selects, validates, exports and reloads', async ({ page }) => {
    const runtimeErrors = captureRuntimeErrors(page);
    await page.goto(NEUROCAD_URL, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /Language.*Engineering Geometry/ })).toBeVisible();
    await expect(page.locator('#validation-chip')).toHaveText('VALIDATION PASS');
    await expect(page.locator('#object-count')).not.toHaveText('0 components');
    await expectRenderedViewport(page);
    await screenshot(page, '01-home.png');

    await page.getByRole('button', { name: /Jet Engine Concept/i }).click();
    await expect(page.locator('#validation-chip')).toHaveText('VALIDATION PASS');
    await expect(page.locator('#cadspec')).toContainText('jet_engine_concept');
    await expect(page.locator('#assembly-tree .tree-row')).toHaveCount(await page.locator('#assembly-tree .tree-row').count());
    expect(await page.locator('#assembly-tree .tree-row').count()).toBeGreaterThan(5);
    await screenshot(page, '02-jet-generated.png');

    await page.locator('#toggle-casing').click();
    await expect(page.locator('#toggle-casing')).toHaveText('Show casing');
    await expect(page.locator('#validation-chip')).toHaveText('VALIDATION PASS');
    await screenshot(page, '03-casing-hidden.png');

    await page.locator('#toggle-exploded').click();
    await expect(page.locator('#toggle-exploded')).toHaveText('Assembled');
    await expect(page.locator('#validation-chip')).toHaveText('VALIDATION PASS');
    await screenshot(page, '04-exploded.png');

    await page.getByRole('tab', { name: 'Parameters' }).click();
    const compressorStages = page.locator('input[name="compressorStages"]');
    await expect(compressorStages).toHaveValue('6');
    await compressorStages.fill('9');
    await page.getByRole('button', { name: 'Update model' }).click();
    await expect(page.locator('#validation-chip')).toHaveText('VALIDATION PASS');
    await expect(page.locator('#cadspec')).toContainText('"compressorStages": 9');
    await screenshot(page, '05-nine-stages.png');

    await page.getByRole('tab', { name: 'Assembly' }).click();
    const firstObjectButton = page.locator('#assembly-tree .tree-row[data-object-id] button').first();
    await expect(firstObjectButton).toBeVisible();
    const selectedName = (await firstObjectButton.textContent())?.trim();
    expect(selectedName).toBeTruthy();
    await firstObjectButton.click();
    await expect(page.locator('#selection-label')).toHaveText(selectedName!);

    await expect(page.locator('#cadspec')).not.toContainText('NaN');
    await expect(page.locator('#cadspec')).not.toContainText('Infinity');
    await screenshot(page, '06-cadspec.png');

    const jsonDownloadPromise = page.waitForEvent('download');
    await page.locator('#export-json').click();
    const jsonDownload = await jsonDownloadPromise;
    expect(jsonDownload.suggestedFilename()).toBe('neurocad-model.json');

    const scadDownloadPromise = page.waitForEvent('download');
    await page.locator('#export-scad').click();
    const scadDownload = await scadDownloadPromise;
    expect(scadDownload.suggestedFilename()).toBe('neurocad-model.scad');

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('#validation-chip')).toHaveText('VALIDATION PASS');
    await expect(page.locator('#cadspec')).toContainText('jet_engine_concept');
    await expectRenderedViewport(page);

    expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([]);
  });

  test('viewport responds to orbit, zoom and pan interactions', async ({ page }) => {
    const runtimeErrors = captureRuntimeErrors(page);
    await page.goto(NEUROCAD_URL, { waitUntil: 'networkidle' });
    await expect(page.locator('#validation-chip')).toHaveText('VALIDATION PASS');
    await expectRenderedViewport(page);

    const canvas = page.locator('#viewport');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    const beforeOrbit = await canvas.screenshot();
    await page.mouse.move(centerX, centerY);
    await page.mouse.down({ button: 'left' });
    await page.mouse.move(centerX + 100, centerY + 45, { steps: 8 });
    await page.mouse.up({ button: 'left' });
    await page.waitForTimeout(350);
    const afterOrbit = await canvas.screenshot();
    expect(Buffer.compare(beforeOrbit, afterOrbit)).not.toBe(0);

    const beforeZoom = afterOrbit;
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -650);
    await page.waitForTimeout(350);
    const afterZoom = await canvas.screenshot();
    expect(Buffer.compare(beforeZoom, afterZoom)).not.toBe(0);

    const beforePan = afterZoom;
    await page.mouse.move(centerX, centerY);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(centerX + 75, centerY - 30, { steps: 8 });
    await page.mouse.up({ button: 'right' });
    await page.waitForTimeout(350);
    const afterPan = await canvas.screenshot();
    expect(Buffer.compare(beforePan, afterPan)).not.toBe(0);

    expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([]);
  });

  test('invalid conceptual parameters fail closed without destroying the last valid model', async ({ page }) => {
    const runtimeErrors = captureRuntimeErrors(page);
    await page.goto(NEUROCAD_URL, { waitUntil: 'networkidle' });
    await expect(page.locator('#validation-chip')).toHaveText('VALIDATION PASS');
    const validDocument = await page.locator('#cadspec').textContent();

    await page.getByRole('tab', { name: 'Parameters' }).click();
    await page.locator('input[name="shaftDiameterMm"]').fill('600');
    await page.getByRole('button', { name: 'Update model' }).click();
    await expect(page.locator('#validation-chip')).toHaveText(/FAILED CLOSED|VALIDATION FAIL/);
    await expect(page.locator('#error')).not.toBeEmpty();
    expect(await page.locator('#cadspec').textContent()).toBe(validDocument);

    await page.locator('input[name="shaftDiameterMm"]').fill('45');
    await page.locator('input[name="compressorStages"]').fill('500');
    await page.getByRole('button', { name: 'Update model' }).click();
    await expect(page.locator('#validation-chip')).toHaveText(/FAILED CLOSED|VALIDATION FAIL/);
    expect(await page.locator('#cadspec').textContent()).toBe(validDocument);

    expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([]);
  });
});
