import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

type Resource = { id: string; kind: string; sha256: string };
type Packet = { key: string; lesson: { title: string }; resources: Resource[]; preferredResourceId: string };
type Index = { digest: string; counts: { records: number; packets: number; teacherApproved: number; productionImported: number }; packets: Packet[] };
const localOrigin = 'http://127.0.0.1:14674';

async function isolate(page: Page) {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    return url.origin === localOrigin || url.protocol === 'blob:' || url.protocol === 'data:' ? route.continue() : route.abort();
  });
}
async function login(page: Page, email = 'reviewer@example.test') {
  await isolate(page);
  await page.goto('/login?next=%2Fadmin%2Fcurriculum-review');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('LocalAcceptanceOnly2026!');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
  await page.goto('/admin/curriculum-review');
}
async function api<T>(page: Page, path: string, format: 'json' | 'text' = 'json'): Promise<T> {
  return page.evaluate(async ({ requestPath, format }) => {
    const session = Object.keys(localStorage).filter((key) => key.startsWith('sb-')).map((key) => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } }).find((item) => item.access_token);
    const response = await fetch(requestPath, { headers: { Authorization: `Bearer ${session?.access_token}` } });
    if (!response.ok) throw new Error(`Review request failed: ${response.status}`);
    return format === 'text' ? response.text() : response.json();
  }, { requestPath: path, format });
}
function resourceUrl(packet: Packet, resource: Resource) {
  return `/api/curriculum-review?${new URLSearchParams({ action: 'resource', packet: packet.key, resource: resource.id })}`;
}
async function localSession(request: APIRequestContext, email: string) {
  const response = await request.post('/auth/v1/token?grant_type=password', { data: { email, password: 'LocalAcceptanceOnly2026!' } });
  expect(response.ok()).toBe(true);
  return { Authorization: `Bearer ${(await response.json()).access_token}` };
}

test('real review handler enforces authentication, admin roles, read-only methods and private caching', async ({ request }) => {
  const endpoint = '/api/curriculum-review?action=list';
  for (const [headers, expected] of [[{}, 401], [{ Authorization: 'Bearer invalid-local-token' }, 401], [await localSession(request, 'learner@example.test'), 403]] as const) {
    const response = await request.get(endpoint, { headers });
    expect(response.status()).toBe(expected);
    expect(response.headers()['cache-control']).toContain('private, no-store');
    expect(await response.text()).not.toContain('packets');
  }
  const headers = await localSession(request, 'reviewer@example.test');
  const response = await request.get(endpoint, { headers });
  expect(response.status()).toBe(200);
  expect(response.headers()['x-robots-tag']).toContain('noindex');
  const index = await response.json();
  expect(index.state).toBe('private-review-only');
  expect(index.counts.teacherApproved).toBe(0);
  expect(index.counts.productionImported).toBe(0);
  expect(index.counts.runtimeExportRecords).toBe(0);
  expect(Object.values(index.limits)).toEqual([false, false, false, false]);
  const packet = index.packets[0];
  const resource = packet.resources.find((item: Resource) => item.id === packet.preferredResourceId);
  const get = await request.get(resourceUrl(packet, resource), { headers });
  expect(get.status()).toBe(200);
  expect(createHash('sha256').update(await get.body()).digest('hex')).toBe(resource.sha256);
  const head = await request.head(resourceUrl(packet, resource), { headers });
  expect(head.status()).toBe(200);
  expect(head.headers()['x-content-sha256']).toBe(resource.sha256);
  expect((await head.body()).length).toBe(0);
  expect((await request.post(endpoint, { headers, data: { approve: true } })).status()).toBe(405);
  expect((await request.get('/api/curriculum-review?action=unknown', { headers })).status()).toBe(400);
  expect((await request.get('/api/curriculum-review?action=resource&packet=missing&resource=missing', { headers })).status()).toBe(404);
});

test('retained diagrams render through authenticated source requests', async ({ page }, testInfo) => {
  await login(page);
  await expect(page.getByRole('heading', { name: 'Curriculum source desk', exact: true })).toBeVisible();
  const index = await api<Index>(page, '/api/curriculum-review?action=list');
  const diagramResults: Array<Record<string, unknown>> = [];
  for (const packet of index.packets) {
    const preferred = packet.resources.find((item) => item.id === packet.preferredResourceId);
    if (preferred?.kind !== 'text') continue;
    const source = await api<string>(page, resourceUrl(packet, preferred), 'text');
    const expectedImages = [...source.matchAll(/!\[[^\]]*\]\([^)]+\)/g)].length;
    if (!expectedImages) continue;
    await page.getByRole('button', { name: packet.lesson.title, exact: false }).click();
    await expect(page.getByLabel('Retained source resource')).toHaveValue(preferred.id);
    const images = page.locator('article img');
    await expect(images).toHaveCount(expectedImages);
    for (let i = 0; i < expectedImages; i += 1) {
      const image = images.nth(i);
      await expect(image).toHaveJSProperty('complete', true);
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
      const src = await image.getAttribute('src');
      expect(src).toMatch(/^blob:/);
      const bytes = await image.evaluate(async (element: HTMLImageElement) => Array.from(new Uint8Array(await (await fetch(element.src)).arrayBuffer())));
      const digest = createHash('sha256').update(Buffer.from(bytes)).digest('hex');
      expect(packet.resources.some((item) => item.kind === 'image' && item.sha256 === digest)).toBe(true);
      diagramResults.push({ packet: packet.key, digest, rendered: true });
    }
  }
  expect(diagramResults.length).toBeGreaterThan(0);
  await testInfo.attach('retained-diagram-results', { body: JSON.stringify({ store: index.digest, diagrams: diagramResults }, null, 2), contentType: 'application/json' });
});

for (const width of [1440, 1024, 390]) {
  test(`review desk supports keyboard selection, full sources and reduced motion at ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const live = new Set<string>();
      const create = URL.createObjectURL.bind(URL);
      const revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = (value) => { const url = create(value); live.add(url); return url; };
      URL.revokeObjectURL = (url) => { live.delete(url); revoke(url); };
      Object.defineProperty(window, '__curriculumReviewLiveBlobs', { get: () => [...live] });
    });
    await login(page);
    await expect(page.getByRole('heading', { name: 'Curriculum source desk', exact: true })).toBeVisible();
    const index = await api<Index>(page, '/api/curriculum-review?action=list');
    expect(index.counts.teacherApproved).toBe(0);
    expect(index.counts.productionImported).toBe(0);
    const rendered: Array<Record<string, unknown>> = [];
    for (const packet of index.packets) {
      const preferred = packet.resources.find((item) => item.id === packet.preferredResourceId)!;
      const button = page.getByRole('button', { name: packet.lesson.title, exact: false });
      await button.focus();
      await page.keyboard.press('Enter');
      await expect(button).toHaveAttribute('aria-current', 'page');
      await expect(page.getByLabel('Retained source resource')).toHaveValue(preferred.id);
      if (preferred.kind === 'text' || preferred.kind === 'structured-text') {
        await expect(page.locator('article')).toBeVisible();
        await expect.poll(async () => (await page.locator('article').innerText()).length).toBeGreaterThan(500);
      } else if (preferred.kind === 'pdf') {
        await expect(page.locator('iframe')).toHaveAttribute('src', /^blob:/);
        const signature = await page.locator('iframe').evaluate(async (frame: HTMLIFrameElement) => new TextDecoder().decode((await (await fetch(frame.src)).arrayBuffer()).slice(0, 5)));
        expect(signature).toBe('%PDF-');
      }
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      rendered.push({ packet: packet.key, source: preferred.id, kind: preferred.kind });
    }
    const diagramPacket = index.packets.find((packet) => packet.key === 'circular-energy') || index.packets.find((packet) => packet.resources.some((item) => item.kind === 'image'))!;
    await page.getByRole('button', { name: diagramPacket.lesson.title, exact: false }).click();
    const image = page.locator('article img').first();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
    await image.scrollIntoViewIfNeeded();
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download original diagram', exact: true }).click();
    const download = await downloadEvent;
    const diagramResource = diagramPacket.resources.find((item) => item.id === download.suggestedFilename());
    expect(diagramResource?.kind).toBe('image');
    expect(createHash('sha256').update(await readFile((await download.path())!)).digest('hex')).toBe(diagramResource?.sha256);
    await page.screenshot({ path: testInfo.outputPath(`review-diagram-${width}.png`) });
    await page.getByRole('heading', { name: 'Curriculum source desk', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`review-overview-${width}.png`) });
    await page.getByRole('link', { name: 'Back to Today', exact: true }).click();
    await expect(page).toHaveURL(/\/main$/);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __curriculumReviewLiveBlobs: string[] }).__curriculumReviewLiveBlobs.length)).toBe(0);
    await testInfo.attach('source-rendering-results', { body: JSON.stringify({ width, store: index.digest, packets: rendered, liveBlobsAfterLeaving: 0 }, null, 2), contentType: 'application/json' });
  });
}

test('non-admin and signed-out browsers cannot enter the private desk', async ({ page }) => {
  await isolate(page);
  await page.goto('/admin/curriculum-review');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Curriculum source desk', exact: true })).toHaveCount(0);
  await login(page, 'learner@example.test');
  await expect(page).toHaveURL(/\/main$/);
  await expect(page.getByRole('heading', { name: 'Curriculum source desk', exact: true })).toHaveCount(0);
});

test('a rejected diagram shows its error without an unverified fallback request', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('heading', { name: 'Curriculum source desk', exact: true })).toBeVisible();
  const index = await api<Index>(page, '/api/curriculum-review?action=list');
  const packet = index.packets.find((item) => item.key === 'circular-energy')!;
  const imageResource = packet.resources.find((item) => item.kind === 'image')!;
  const fallbackRequests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/admin/') && request.url().endsWith('.png')) fallbackRequests.push(request.url()); });
  await page.route(`**${resourceUrl(packet, imageResource)}`, (route) => route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'Fixture integrity rejection' }) }));
  await page.getByRole('button', { name: packet.lesson.title, exact: false }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Retained diagram could not be loaded.' })).toBeVisible();
  await expect(page.locator('article img')).toHaveCount(0);
  expect(fallbackRequests).toEqual([]);
});
