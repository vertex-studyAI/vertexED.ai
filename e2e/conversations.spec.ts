import { expect, test, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';

const learner = 'f40db66b-1b55-4ab8-88d0-14a9ba476c16';
type Cloud = Map<string, Record<string, unknown>>;
async function login(page: Page, cloud: Cloud, id = learner) {
  let revision = 0;
  const user = { id, aud: 'authenticated', role: 'authenticated', email: `${id}@example.test`, app_metadata: { provider: 'email' }, user_metadata: { username: 'learner', board: 'IB_MYP', grade: 10, subjects: ['Physics'] }, created_at: '2026-09-21T00:00:00Z', identities: [] };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: 2103836400, role: 'authenticated' })}.test-only`;
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, async route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/auth/v1/token' ? { access_token: token, token_type: 'bearer', expires_in: 315360000, refresh_token: 'test-refresh', user } : path === '/auth/v1/user' ? user : path === '/rest/v1/profiles' ? { id, email: user.email, board: 'IB_MYP', grade: 10, subjects: ['Physics'] } : {};
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let body: unknown = {}; let status = 200;
    if (url.pathname === '/api/waitlist-status') body = { status: 'approved' };
    else if (url.pathname === '/api/admin-status') body = { isAdmin: false };
    else if (url.pathname === '/api/learner-state') body = { contractVersion: 'vertexed.learner-state.v1', items: [] };
    else if (url.pathname === '/api/user-content') {
      expect(route.request().headers().authorization).toBe(`Bearer ${token}`);
      if (route.request().method() === 'POST') {
        const write = route.request().postDataJSON();
        const existing = cloud.get(id);
        if (write.expectedUpdatedAt !== (existing?.updated_at ?? null)) { status = 409; body = { error: 'Conflict' }; }
        else {
          const item = { id: 'ee38e832-e67d-4537-93a5-efda63c08dcb', kind: 'conversation', title: 'AI tutor conversations', payload: write.payload, updated_at: new Date(Math.max(Date.now() + ++revision, Date.parse(String(existing?.updated_at ?? 0)) + 1 || 0)).toISOString() };
          cloud.set(id, item); body = { item };
        }
      } else body = { items: cloud.has(id) && (!url.searchParams.get('kind') || url.searchParams.get('kind') === 'conversation') ? [cloud.get(id)] : [], nextOffset: null };
    } else if (url.pathname === '/api/ask') body = { answer: 'Diffusion moves particles down a concentration gradient.', citations: [{ id: 's1' }], sources: [{ id: 's1', title: 'Learner biology notes', excerpt: 'Particles move from higher to lower concentration.' }] };
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
  await page.goto('/chatbot');
  await expect(page.getByText('Conversation history saved to your account.', { exact: true }).first()).toBeVisible();
}
async function ask(page: Page, text = 'Explain diffusion') {
  await page.getByRole('textbox', { name: 'Message the AI tutor' }).fill(text);
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByText('Diffusion moves particles down a concentration gradient.', { exact: true })).toBeVisible();
  await expect(page.getByText('Conversation history saved to your account.', { exact: true }).first()).toBeVisible();
}

test('conversations save, resume on another device, retain sources, export and clear', async ({ page, browser }, testInfo) => {
  const cloud: Cloud = new Map(); await login(page, cloud); await ask(page);
  const secondContext = await browser.newContext({ baseURL: 'http://127.0.0.1:14189' });
  const second = await secondContext.newPage(); await login(second, cloud);
  await expect(second.getByText('Explain diffusion', { exact: true })).toBeVisible();
  await second.getByText('Evidence used (1)', { exact: true }).click();
  await expect(second.getByText('Learner biology notes', { exact: true })).toBeVisible();
  const download = second.waitForEvent('download'); await second.getByRole('button', { name: 'Export conversations' }).click();
  await (await download).saveAs(testInfo.outputPath('conversation-export.json'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByText(/^Conversation history \(\d+\)$/).click();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await expect(page.getByRole('button', { name: 'New conversation' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath(`tutor-${theme}-${width}.png`), fullPage: true, animations: 'disabled' });
    }
  }
  await page.getByRole('button', { name: 'New conversation' }).focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/thread=conversation-/);
  await expect(page.locator('.apex-bubble-user').getByText('Explain diffusion', { exact: true })).toHaveCount(0);
  await page.getByLabel('Conversation', { exact: true }).selectOption('apex-main');
  await page.getByRole('button', { name: 'Clear thread', exact: true }).click();
  await expect(page.locator('.apex-bubble-user').getByText('Explain diffusion', { exact: true })).toHaveCount(0);
  await expect.poll(() => (cloud.get(learner)?.payload as { threads: unknown[] }).threads.length).toBe(0);
  await second.reload(); await expect(second.locator('.apex-bubble-user').getByText('Explain diffusion', { exact: true })).toHaveCount(0);
  await secondContext.close();
});

test('a second account has no access to the first account conversation', async ({ page, browser }) => {
  const cloud: Cloud = new Map(); await login(page, cloud); await ask(page, 'Private learner question');
  const other = await browser.newContext({ baseURL: 'http://127.0.0.1:14189' }); const second = await other.newPage();
  await login(second, cloud, '6ea4cabc-1cd2-478f-9d41-59b131329e4e');
  await expect(second.getByText('Private learner question')).toHaveCount(0);
  await expect(second.getByRole('button', { name: 'Clear thread' })).toHaveCount(0); await other.close();
});

test('stale device edits show a recoverable conflict and cannot overwrite newer history', async ({ page, browser }) => {
  const cloud: Cloud = new Map(); await login(page, cloud);
  const other = await browser.newContext({ baseURL: 'http://127.0.0.1:14189' }); const second = await other.newPage(); await login(second, cloud);
  await ask(page, 'Newer device question');
  // Avoid a focus refresh: this device remains on the revision it originally read.
  await second.getByRole('textbox', { name: 'Message the AI tutor' }).fill('Stale device question');
  await second.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(second.getByText(/Conversation history changed elsewhere/)).toBeVisible();
  await expect(second.getByRole('textbox', { name: 'Message the AI tutor' })).toBeDisabled();
  expect(JSON.stringify(cloud.get(learner))).not.toContain('Stale device question');
  await second.getByRole('button', { name: 'Reload account copy' }).click();
  await expect(second.getByText('Newer device question', { exact: true })).toBeVisible();
  await expect(second.getByRole('textbox', { name: 'Message the AI tutor' })).toBeEnabled(); await other.close();
});

test('Unicode conversation links retain history when citation metadata is malformed', async ({ page }) => {
  const cloud: Cloud = new Map();
  await login(page, cloud);
  const thread = `a${'é'.repeat(50)}`;
  await page.goto(`/chatbot?thread=${encodeURIComponent(thread)}`);
  await page.route('**/api/ask', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'Diffusion moves particles down a concentration gradient.', citations: 'invalid metadata', sources: null }) }));
  await ask(page);
  expect(JSON.stringify(cloud.get(learner))).toContain(thread);
  // Assert the delivered answer and saved identity. WebKit may emit a cancelled
  // old-document fetch error during navigation; that is not a URI/citation failure.
  await expect(page.getByRole('heading', { name: 'AI Tutor', exact: true })).toBeVisible();
});
