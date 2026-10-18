import { expect, test, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';
import { assertSavedWorkFooterHits, inspectSavedWorkFilters } from './saved-work-visual-checks';

async function installSearchAccount(page: Page) {
  const userId = 'd7a31117-bbc3-4d33-b456-778e81f20c25';
  const time = '2026-09-21T00:00:00Z';
  const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'search@example.test', app_metadata: { provider: 'email' }, user_metadata: { username: 'searchlearner', board: 'IB_MYP', grade: 10, subjects: ['Physics'] }, created_at: time, identities: [] };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, exp: 2103836400, role: 'authenticated' })}.test-only`;
  const source = { id: 'source&1', type: 'file', title: 'Worksheet Δp', content: `${'Earlier passage. '.repeat(2000)}ZETA_SOURCE_149 <script>window.unsafeSource=true</script>`, wordCount: 4003, enabled: true, createdAt: time };
  const notebook = { id: 'notebook/2', title: 'Mechanics notebook', subject: 'Physics', sources: [source], outputs: [], suggestedQuestions: [], createdAt: time, updatedAt: time };
  const state = { notebook: { id: 'e20a5217-96a5-4ba1-a5c3-51aa6623995f', kind: 'notebook', title: 'Study Notebooks', payload: { notebooks: [{ ...notebook, id: 'first-notebook', title: 'Other notebook', sources: [] }, notebook] }, created_at: time, updated_at: time } };
  const conversation = { id: '915b7ad1-464e-43b5-95da-13968a5d5655', kind: 'conversation', title: 'AI tutor conversations', payload: { version: 1, threads: [{ id: 'search-thread', messages: [{ id: 'search-message', role: 'user', text: 'Conversation-only tracer OMEGA_HISTORY_149' }] }] }, created_at: time, updated_at: time };
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, async route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/auth/v1/token' ? { access_token: token, token_type: 'bearer', expires_in: 315360000, refresh_token: 'test-refresh', user }
      : path === '/auth/v1/user' ? user : path === '/rest/v1/profiles' ? { id: userId, email: user.email, board: 'IB_MYP', grade: 10, subjects: ['Physics'] } : {};
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let body: unknown = {};
    if (url.pathname === '/api/waitlist-status') body = { status: 'approved', access: true };
    else if (url.pathname === '/api/admin-status') body = { isAdmin: false };
    else if (url.pathname === '/api/learner-state') body = { contractVersion: 'vertexed.learner-state.v1', items: [] };
    else if (url.pathname === '/api/user-content') {
      if (route.request().method() === 'POST') {
        const write = route.request().postDataJSON();
        if (write.kind === 'notebook') state.notebook = { ...state.notebook, payload: write.payload, updated_at: new Date().toISOString() };
        body = { item: write.kind === 'notebook' ? state.notebook : conversation };
      } else {
        const kind = url.searchParams.get('kind');
        body = { items: kind === 'notebook' ? [state.notebook] : kind === 'conversation' ? [conversation] : kind ? [] : [state.notebook, conversation], nextOffset: null };
      }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
  return { state, notebook, source };
}

for (const width of [1440, 1024, 390]) test(`private material search opens the exact source at ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { state, notebook, source } = await installSearchAccount(page);
  await page.goto('/saved-work');
  const search = page.getByRole('searchbox', { name: 'Search saved work', exact: true });
  await search.fill('ZETA_SOURCE_149');
  await expect(page.getByText('1 of 2 loaded items shown.', { exact: true })).toBeVisible();
  await search.fill('OMEGA_HISTORY_149');
  await page.getByLabel('Work type', { exact: true }).selectOption('conversation');
  await expect(page.getByText('AI tutor conversations', { exact: true })).toBeVisible();
  for (const theme of ['light', 'dark'] as const) {
    await selectTheme(page, theme);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath(`saved-search-${width}-${theme}.png`), animations: 'disabled' });
    const clearance = await inspectSavedWorkFilters(page);
    await info.attach(`saved-filter-hits-${width}-${theme}`, { body: JSON.stringify(clearance), contentType: 'application/json' });
    expect.soft(clearance.samples.flatMap(control => control.samples.filter(point => !point.clear).map(point => ({ control: control.name, ...point }))), 'Every filter edge and centre receives pointer input').toEqual([]);
    expect.soft(clearance.overlaps, 'Optional launchers do not cover filters or the loaded count').toEqual([]);
    if (width === 390) {
      await page.getByText('AI tutor conversations', { exact: true }).evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.screenshot({ path: info.outputPath(`saved-search-results-${width}-${theme}.png`), animations: 'disabled' });
    }
    const footerHits = await assertSavedWorkFooterHits(page);
    await info.attach(`saved-footer-hits-${width}-${theme}`, { body: JSON.stringify(footerHits), contentType: 'application/json' });
    await page.screenshot({ path: info.outputPath(`saved-search-footer-${width}-${theme}.png`), animations: 'disabled' });
  }
  await selectTheme(page, 'light');
  const globalSearch = page.getByRole('combobox', { name: 'Search VertexED', exact: true });
  await globalSearch.fill('ZETA_SOURCE_149');
  await expect(page.getByRole('option').filter({ hasText: source.title })).toHaveCount(1);
  await globalSearch.press('Enter');
  const dialog = page.getByRole('dialog', { name: source.title, exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('pre')).toContainText('ZETA_SOURCE_149');
  expect(await page.evaluate(() => 'unsafeSource' in window)).toBe(false);
  expect(new URL(page.url()).searchParams.get('notebook')).toBe(notebook.id);
  expect(new URL(page.url()).searchParams.get('source')).toBe(source.id);
  await page.screenshot({ path: info.outputPath(`source-search-${width}-light.png`), animations: 'disabled' });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: `Preview ${source.title}`, exact: true })).toBeFocused();
  await selectTheme(page, 'dark');
  await page.getByRole('button', { name: `Preview ${source.title}`, exact: true }).click();
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: info.outputPath(`source-search-${width}-dark.png`), animations: 'disabled' });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: `Preview ${source.title}`, exact: true })).toBeFocused();
  await page.getByRole('button', { name: `Remove ${source.title}`, exact: true }).click();
  await expect.poll(() => state.notebook.payload.notebooks.find(entry => entry.id === notebook.id)?.sources.length).toBe(0);
  await page.reload();
  await expect(page.getByText('The linked source is no longer in this notebook. Your other sources are unchanged.', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
