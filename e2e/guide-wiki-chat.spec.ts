import { createHash } from 'node:crypto';
import { expect, test, type Locator, type Page } from '@playwright/test';

const learnerId = '82cce668-f379-4e39-b37e-3956b8282db0';
const guidePath = '/study-guides/myp/physics/overview.md';
const contextPath = guidePath.replace(/\.md$/, '');
const historyKey = `vertex_apex:${learnerId}:history-v1`;
const answer = 'Synthetic guide answer: use the stated model and identify its assumptions.';
const markdown = '# Synthetic physics overview\n\nThis is a synthetic browser-test guide, not approved course content.\n\n## A model and its assumptions\n\nState the model, identify an assumption, and explain its limit.\n';

type Conversation = {
  id: string;
  kind: string;
  title: string;
  payload: { version: number; threads: Array<{ id: string; messages: Array<{ role: string; text: string }> }> };
  updated_at: string;
};
type TutorRequest = { question: string; context: { page: string; guidePath?: string } };

declare global {
  interface Window { __guideTutorScrolls: string[] }
}

async function harness(page: Page, options: { reducedMotion?: boolean; globalWasOpen?: boolean } = {}) {
  const state = {
    conversation: undefined as Conversation | undefined,
    requests: [] as TutorRequest[],
    historyWrites: 0,
    rejectHistoryWrites: false,
    holdAnswer: false,
    releaseAnswer: () => {},
    pageErrors: [] as string[],
  };
  page.on('pageerror', error => state.pageErrors.push(error.message));
  const user = {
    id: learnerId, aud: 'authenticated', role: 'authenticated', email: 'guide-fixture@example.test',
    email_confirmed_at: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { username: 'guidefixture', board: 'IB_MYP', grade: 10, subjects: ['Physics'] },
  };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: learnerId, exp: 2103836400, role: 'authenticated' })}.fixture-signature`;

  await page.addInitScript(({ reducedMotion, globalWasOpen }) => {
    if (!localStorage.getItem('vertex_a11y_settings')) {
      localStorage.setItem('vertex_a11y_settings', JSON.stringify({ reducedMotion, studyCompanion: true, theme: 'light' }));
    }
    if (globalWasOpen) localStorage.setItem('vertex_global_chat_open', '1');
    window.__guideTutorScrolls = [];
    const nativeScrollTo = Element.prototype.scrollTo;
    Element.prototype.scrollTo = function (...args: [options?: ScrollToOptions] | [number, number]) {
      if (this.classList.contains('study-guides-tutor-body')) {
        window.__guideTutorScrolls.push(typeof args[0] === 'object' ? args[0].behavior ?? 'auto' : 'auto');
      }
      return Reflect.apply(nativeScrollTo, this, args);
    };
  }, { reducedMotion: options.reducedMotion ?? false, globalWasOpen: options.globalWasOpen ?? false });

  // Route every request: local app assets may load; external services cannot.
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname.endsWith('.supabase.co')) {
      if (url.pathname === '/auth/v1/token') return route.fulfill({ json: { access_token: token, refresh_token: 'fixture-refresh', expires_in: 86400, token_type: 'bearer', user } });
      if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user });
      if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204, body: '' });
      if (url.pathname === '/rest/v1/profiles') return route.fulfill({ json: { ...user, full_name: 'Guide fixture' } });
      return route.fulfill({ status: 400, json: { error: 'Unexpected synthetic auth request' } });
    }
    if (url.origin !== 'http://127.0.0.1:14217') return route.abort('blockedbyclient');
    if (url.pathname.startsWith('/_vercel/')) return route.fulfill({ contentType: 'application/javascript', body: '' });
    if (url.pathname === '/study-guides/myp/manifest.json') return route.fulfill({ json: {
      programme: 'MYP', subjects: [{ name: 'Physics', slug: 'physics', pages: [
        { title: 'Overview', path: guidePath, group: 'getting-started', relativePath: 'overview.md' },
      ] }],
    } });
    if (url.pathname === '/study-guides/myp/provenance-ledger.json') return route.fulfill({ json: {
      evidenceBoundary: 'Synthetic browser fixture only. No repository content is approved by this test.',
      entries: [{
        path: guidePath, editorialStatus: 'approved', publicationStatus: 'published',
        source: 'Synthetic browser fixture', factualReviewer: 'Synthetic test reviewer', reviewedAt: '2020-01-01T00:00:00Z',
        license: 'CC0', permittedUse: 'Synthetic testing only', riskFlags: [],
        contentVersion: 'fixture-1', answerVersion: 'fixture-1', contentHash: `sha256:${createHash('sha256').update(markdown).digest('hex')}`,
      }],
    } });
    if (url.pathname === guidePath) return route.fulfill({ contentType: 'text/markdown', body: markdown });
    if (!url.pathname.startsWith('/api/')) return route.continue();
    if (url.pathname === '/api/waitlist-status') return route.fulfill({ json: { status: 'approved', access: true } });
    if (url.pathname === '/api/admin-status') return route.fulfill({ json: { isAdmin: false } });
    if (url.pathname === '/api/learner-state') return route.fulfill({ json: { contractVersion: 'vertexed.learner-state.v1', items: [] } });
    if (url.pathname === '/api/user-content') {
      expect(request.headers().authorization).toBe(`Bearer ${token}`);
      if (request.method() === 'POST') {
        const write = request.postDataJSON();
        expect(write.kind).toBe('conversation');
        state.historyWrites++;
        if (state.rejectHistoryWrites || write.expectedUpdatedAt !== (state.conversation?.updated_at ?? null)) {
          return route.fulfill({ status: 409, json: { error: 'Synthetic account revision conflict' } });
        }
        state.conversation = {
          id: 'a5da5455-3c4c-42ee-a9d2-6cb9b897d376', kind: 'conversation', title: 'AI tutor conversations',
          payload: write.payload, updated_at: new Date(Date.now() + state.historyWrites * 1000).toISOString(),
        };
        return route.fulfill({ json: { item: state.conversation } });
      }
      const kind = url.searchParams.get('kind');
      return route.fulfill({ json: { items: state.conversation && (!kind || kind === 'conversation') ? [state.conversation] : [], nextOffset: null } });
    }
    if (url.pathname === '/api/study-guide-chat') {
      expect(request.headers().authorization).toBe(`Bearer ${token}`);
      state.requests.push(request.postDataJSON());
      if (state.holdAnswer) await new Promise<void>(resolve => { state.releaseAnswer = resolve; });
      return route.fulfill({ json: {
        answer, citations: [{ id: 'fixture-source' }],
        sources: [{ id: 'fixture-source', title: 'Synthetic physics overview', path: contextPath, excerpt: 'State the model, identify an assumption, and explain its limit.' }],
      } });
    }
    return route.fulfill({ json: { ok: true, items: [], nextOffset: null } });
  });
  return state;
}

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill('guide-fixture@example.test');
  await page.getByLabel('Password', { exact: true }).fill('fixture-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
}

function tutor(page: Page) { return page.getByRole('complementary', { name: 'Study guide tutor', exact: true }); }

async function openGuide(page: Page, path = '/study-guides/myp/physics') {
  // The real server correctly holds all imported guide URLs while the approval
  // register is empty. Enter the SPA at its public root; only the synthetic
  // manifest, provenance and Markdown responses are replaced by this fixture.
  await page.goto('/study-guides');
  await expect(page.getByRole('heading', { name: 'Synthetic physics overview', exact: true })).toBeVisible();
  if (path === contextPath) {
    await page.getByRole('region', { name: 'MYP subjects', exact: true }).getByRole('button', { name: /Physics/ }).click();
  } else if (path !== '/study-guides') {
    // Subject hubs have no navigation control: exercise their router state
    // without asking the real content-publication middleware for held files.
    await page.evaluate(nextPath => {
      history.replaceState(history.state, '', nextPath);
      dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
    }, path);
  }
  await expect(page).toHaveURL(`http://127.0.0.1:14217${path}`);
  await expect(tutor(page)).toHaveCount(1);
  await expect(tutor(page).getByRole('textbox', { name: 'Message the AI tutor' })).toBeEditable();
  await expect(tutor(page).getByText('Conversation history saved to your account.', { exact: true })).toBeVisible();
}

async function reachable(control: Locator) {
  // A fixed navigation header can cover an element that is technically inside
  // the viewport. Center it using native scrolling before checking reachability.
  await control.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  await expect.poll(() => control.evaluate(element => {
    const box = element.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return hit === element || element.contains(hit);
  }), { message: 'Control remains reachable after native scrolling, including above mobile navigation' }).toBe(true);
}

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900, path: '/study-guides/myp/physics' },
  { name: 'tablet', width: 1024, height: 900, path: '/study-guides' },
  { name: 'mobile', width: 390, height: 844, path: '/study-guides/myp/physics' },
  { name: 'short-desktop', width: 1440, height: 480, path: contextPath },
]) test.describe(viewport.name, () => {
  test.use({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.name === 'mobile', hasTouch: viewport.name === 'mobile', reducedMotion: 'reduce' });
  test('guide context, keyboard collapse and account history remain usable', async ({ page }, info) => {
    const state = await harness(page);
    await login(page);
    await openGuide(page, viewport.path);
    // Full document navigation can cancel unrelated account bootstrap requests
    // in WebKit. Check runtime errors during the settled tutor interaction.
    state.pageErrors.length = 0;
    const panel = tutor(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width + 1);
    await expect(page.locator('.apex-panel, .apex-fab')).toHaveCount(0);
    await expect(panel.locator('.study-guides-tutor-intro p')).toHaveCSS('font-size', '16px');
    const collapse = panel.getByRole('button', { name: 'Collapse tutor', exact: true });
    await reachable(collapse);
    const toggleSize = await collapse.boundingBox();
    expect(toggleSize?.width).toBeGreaterThanOrEqual(44);
    expect(toggleSize?.height).toBeGreaterThanOrEqual(44);
    await collapse.focus();
    await page.keyboard.press('Enter');
    const expand = panel.getByRole('button', { name: 'Expand tutor', exact: true });
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    await expect(panel.getByRole('textbox', { name: 'Message the AI tutor' })).toHaveCount(0);
    await expect(expand).toBeFocused();
    await page.keyboard.press('Space');
    await expect(collapse).toHaveAttribute('aria-expanded', 'true');
    const input = panel.getByRole('textbox', { name: 'Message the AI tutor' });
    await reachable(input);
    await input.fill('Summarise the key points on this page');
    await page.keyboard.press('Enter');
    await expect(panel.getByText(answer, { exact: true })).toBeVisible();
    expect(state.requests).toHaveLength(1);
    expect(state.requests[0].context).toMatchObject({ page: 'study-guides', guidePath: contextPath });
    await expect.poll(() => state.conversation?.payload.threads.find(thread => thread.id === 'myp-wiki')?.messages.length).toBe(2);
    await expect(panel.getByText('Conversation history saved to your account.', { exact: true })).toBeVisible();
    await panel.getByText('Evidence used (1)', { exact: true }).click();
    await expect(panel.getByText('Synthetic physics overview', { exact: true })).toBeVisible();
    await reachable(panel.getByRole('button', { name: 'Export conversations', exact: true }));
    await reachable(panel.getByRole('button', { name: 'Send', exact: true }));
    await reachable(collapse);
    await page.screenshot({ path: info.outputPath(`guide-tutor-${viewport.width}x${viewport.height}.png`), animations: 'disabled' });
    expect(state.pageErrors).toEqual([]);
    // Delete only the fixture's device cache: reloading must restore the account copy.
    await page.evaluate(key => localStorage.removeItem(key), historyKey);
    await openGuide(page, viewport.path);
    await expect(tutor(page).getByText(answer, { exact: true })).toBeVisible();
  });
});

for (const preference of [
  { name: 'saved application preference', saved: true, os: 'no-preference' as const },
  { name: 'operating-system preference', saved: false, os: 'reduce' as const },
]) test(`reduced motion respects ${preference.name}`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: preference.os });
  await harness(page, { reducedMotion: preference.saved });
  await login(page);
  await openGuide(page);
  await page.evaluate(() => { window.__guideTutorScrolls = []; });
  await tutor(page).getByRole('button', { name: 'Summarise the key points on this page', exact: true }).click();
  await expect(tutor(page).getByText(answer, { exact: true })).toBeVisible();
  const behavior = await page.evaluate(() => window.__guideTutorScrolls);
  expect(behavior.length).toBeGreaterThan(0);
  expect(behavior.every(value => value === 'auto' || value === 'instant')).toBe(true);
});

test('companion opens a visible tutor even when global chat was previously open', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await harness(page, { globalWasOpen: true });
  await login(page);
  await openGuide(page);
  await expect(page.locator('.apex-panel, .apex-fab')).toHaveCount(0);
  const companion = page.getByRole('button', { name: 'Open Apex study shortcuts', exact: true });
  await companion.click();
  const openTutor = page.getByRole('link', { name: 'Ask the AI tutor', exact: true });
  await expect(openTutor).toHaveAttribute('href', '/chatbot');
  await openTutor.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/chatbot$/);
  await expect(page.getByRole('textbox', { name: 'Message the AI tutor' })).toBeEditable();
});

test('guest sees the sign-in gate without a writable tutor or AI request', async ({ page }) => {
  const state = await harness(page);
  await page.goto('/study-guides');
  await expect(tutor(page).getByText('Sign in to ask questions about approved MYP guide pages.', { exact: true })).toBeVisible();
  await expect(tutor(page).getByRole('textbox')).toHaveCount(0);
  await expect(tutor(page).getByRole('button', { name: 'Send', exact: true })).toHaveCount(0);
  expect(state.requests).toHaveLength(0);
  await tutor(page).getByRole('link', { name: 'Sign in to chat', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('short desktop keeps conflict recovery and unsaved reply reachable', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 480 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const state = await harness(page);
  await login(page);
  await openGuide(page);
  state.rejectHistoryWrites = true;
  state.holdAnswer = true;
  const panel = tutor(page);
  await expect(panel).toHaveCSS('position', 'static');
  await expect(panel).toHaveCSS('max-height', 'none');
  await expect(panel).toHaveCSS('overflow-y', 'auto');
  await panel.getByRole('textbox', { name: 'Message the AI tutor' }).fill('Keep my unsaved reply available');
  await panel.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(panel.getByText(/Conversation history changed elsewhere/)).toBeVisible();
  await expect.poll(() => state.requests.length).toBe(1);
  state.releaseAnswer();
  const recovery = panel.getByRole('textbox', { name: 'Unsaved tutor reply', exact: true });
  await expect(recovery).toHaveValue(answer);
  await reachable(recovery);
  await reachable(panel.getByRole('button', { name: 'Export conversations', exact: true }));
  await reachable(panel.getByRole('button', { name: 'Reload account copy', exact: true }));
  await page.screenshot({ path: info.outputPath('guide-tutor-conflict-1440x480.png'), animations: 'disabled' });
  await expect(panel.getByRole('textbox', { name: 'Message the AI tutor' })).toBeDisabled();
});
