import { expect, test } from '@playwright/test';

test('notebook concept maps retain source notes and survive a failed regeneration', async ({ page }, info) => {
  const id = 'b65672a0-b461-48ce-a6a4-1214c3f2eb88';
  const user = { id, aud: 'authenticated', role: 'authenticated', email: 'notebook@example.test',
    email_confirmed_at: '2026-09-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z',
    app_metadata: { provider: 'email' }, user_metadata: { username: 'notebookfixture', board: 'IB_MYP', grade: 10, subjects: ['Biology'] } };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })}.fixture-signature`;
  let failGeneration = false;
  let artifact: unknown = null;
  let sourceId = '';
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: path === '/auth/v1/user' ? user : { ...user, full_name: 'Test learner' } });
  });
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/user-content') {
      if (route.request().method() === 'POST') {
        const write = route.request().postDataJSON();
        artifact = { ...write, id: '707d3f91-00e7-4fba-bd1e-24de54623388', updated_at: new Date().toISOString() };
        return route.fulfill({ json: { item: artifact } });
      }
      return route.fulfill({ json: { items: artifact ? [artifact] : [], nextOffset: null } });
    }
    if (path === '/api/notebook') {
      if (failGeneration) return route.fulfill({ status: 502, json: { error: 'AI could not complete this study material. Your sources are unchanged.' } });
      const sources = route.request().postDataJSON().sources;
      sourceId = sources[0].id;
      return route.fulfill({ json: { mode: 'mind-map', title: 'Concept Map', generatedAt: new Date().toISOString(),
        content: `\`\`\`mermaid\nflowchart TD\nA["Cell"]\nB["Nucleus"]\nA -->|contains| B\n\`\`\`\n\nSource note: [Source: ${sourceId}]`,
        sources: [{ id: sourceId, title: 'Biology notes' }], citations: [{ id: sourceId, title: 'Biology notes' }],
      } });
    }
    return route.fulfill({ json: { ok: true, status: 'approved', access: true, items: [], isAdmin: false } });
  });
  await page.route('**/_vercel/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/#${new URLSearchParams({ access_token: token, refresh_token: 'fixture-refresh', expires_in: '3600', token_type: 'bearer' })}`);
  await expect(page).toHaveURL(/\/main$/);
  await page.goto('/study-notebook');
  await page.getByRole('button', { name: 'Create notebook', exact: true }).click();
  await page.getByLabel('Source title', { exact: true }).fill('Biology notes');
  await page.getByLabel('Source content', { exact: true }).fill('The cell in this example contains a nucleus.');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Concept Map', exact: true }).click();
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  const map = page.getByRole('region', { name: 'Generated Concept Map', exact: true });
  await expect(map.getByRole('img')).toBeVisible();
  await expect(map).toContainText('Cell → contains → Nucleus');
  await expect(map).toContainText('Source note:');
  const sourceLink = map.getByRole('button', { name: 'Source: Biology notes', exact: true });
  await sourceLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toContainText('The cell in this example contains a nucleus.');
  await page.keyboard.press('Escape');
  await expect(sourceLink).toBeFocused();
  await expect.poll(() => JSON.stringify(artifact)).toContain(sourceId);
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await map.scrollIntoViewIfNeeded();
    const diagram = map.getByRole('region', { name: 'Concept map diagram', exact: true });
    if (width === 390) {
      await diagram.focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => diagram.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
      await diagram.evaluate(element => { element.scrollLeft = 0; });
    }
    for (const theme of ['light', 'dark']) {
      const label = `Theme: ${theme === 'dark' ? 'Dark' : 'Light'}. Click to switch.`;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const control = page.getByRole('button', { name: /^Theme:/ });
        if (await control.getAttribute('aria-label') === label) break;
        await control.click();
      }
      await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible();
      await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
      const foreground = await diagram.getByRole('img').evaluate(element => getComputedStyle(element).color);
      await expect(map.locator('figcaption')).toHaveCSS('color', foreground);
      await page.screenshot({ path: info.outputPath(`concept-map-${width}-${theme}.png`), animations: 'disabled' });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  }
  failGeneration = true;
  const regenerate = page.getByRole('button', { name: 'Regenerate', exact: true });
  await regenerate.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Generation failed', { exact: true })).toBeVisible();
  await expect(map.getByRole('img')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview Biology notes', exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Concept Map', exact: true }).click();
  await expect(map.getByRole('img')).toBeVisible();
  await expect(map).toContainText('Source note:');
});
