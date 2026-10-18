import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { selectTheme } from './theme-controls';

const id = '01a142ca-34d6-4a10-9c2f-2b89b678dbeb';
const key = (field: string) => `vertex_content:${id}:${field}`;
const manualTask = { id: 'manual-preserved', 'task name': 'Keep my manually planned study', date: '10/18/2026', 'start time': '05:00 PM', 'task duration': 45, 'end time': '05:45 PM', subject: 'Physics', source: 'manual' };

async function harness(page: Page, complete = false) {
  let metadata: Record<string, unknown> = { username: 'persistencefixture', ...(complete ? { board: 'IB_DP', grade: 11, subjects: ['Physics'] } : {}) };
  const state = { plannerUnavailable: false, plannerWrites: 0, metadataWrites: 0, profileWrites: 0, escapedExternalRequests: [] as string[] };
  const learnerState = new Map<string, Record<string, unknown>>();
  const learner = () => ({ id, aud: 'authenticated', role: 'authenticated', email: 'persistence@example.test', email_confirmed_at: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: metadata });
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: 2103836400, role: 'authenticated' })}.fixture-signature`;
  // Deny every unhandled external origin. No fixture may reach a real account,
  // provider, telemetry destination or public API.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (['127.0.0.1', 'localhost'].includes(url.hostname)) return route.continue();
    state.escapedExternalRequests.push(url.origin);
    return route.abort('blockedbyclient');
  });
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/auth/v1/token') return route.fulfill({ json: { access_token: token, refresh_token: 'fixture-refresh', expires_in: 86400, token_type: 'bearer', user: learner() } });
    if (path === '/auth/v1/user') {
      if (request.method() === 'PUT') { metadata = { ...metadata, ...request.postDataJSON().data }; state.metadataWrites++; }
      return route.fulfill({ json: learner() });
    }
    if (path === '/auth/v1/logout') return route.fulfill({ status: 204, body: '' });
    if (path === '/rest/v1/profiles') {
      if (['POST', 'PATCH'].includes(request.method())) { state.profileWrites++; return route.fulfill({ status: 201, json: null }); }
      return route.fulfill({ json: { id, email: learner().email, full_name: 'Persistence fixture', school_name: null, board: metadata.board ?? null, grade: metadata.grade ?? null, subjects: metadata.subjects ?? [] } });
    }
    return route.fulfill({ status: 400, json: { error: 'Unexpected fixture route' } });
  });
  await page.route('**/_vercel/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('https://va.vercel-scripts.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('**/api/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === '/api/waitlist-status') return route.fulfill({ json: { status: 'approved', access: true, applicationProfile: null } });
    if (url.pathname === '/api/learner-state') {
      if (request.method() === 'GET') return route.fulfill({ json: { items: [...learnerState.values()], nextCursor: null } });
      const results = (request.postDataJSON().items ?? []).map((item: Record<string, unknown>) => {
        learnerState.set(`${item.stateType}:${item.stateKey}`, item);
        return { stateType: item.stateType, stateKey: item.stateKey, requestedRevision: item.clientRevision, currentRevision: item.clientRevision, applied: true, serverUpdatedAt: new Date().toISOString() };
      });
      return route.fulfill({ json: { results } });
    }
    if (url.pathname === '/api/user-content' && request.method() === 'GET' && url.searchParams.get('kind') === 'planner') {
      if (state.plannerUnavailable) return route.fulfill({ status: 503, json: { error: 'Fixture planner unavailable' } });
      return route.fulfill({ json: { items: [{ id: 'fixture-planner', kind: 'planner', title: 'Study Planner', payload: { version: 2, tasks: [manualTask], coursework: [], mode: 'Week' }, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' }] } });
    }
    if (url.pathname === '/api/user-content' && request.method() === 'POST') state.plannerWrites++;
    return route.fulfill({ json: { ok: true, items: [], nextOffset: null, isAdmin: false } });
  });
  return state;
}

async function login(page: Page, complete = false) {
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill('persistence@example.test');
  await page.getByLabel('Password', { exact: true }).fill('fixture-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(complete ? /\/main$/ : /\/onboarding$/);
}

async function fillSetup(page: Page) {
  await page.getByLabel('Exam board', { exact: true }).selectOption('IB_DP');
  await page.getByLabel('Grade / year', { exact: true }).selectOption('11');
  await page.getByRole('button', { name: 'Physics', exact: true }).click();
  await page.getByLabel('School', { exact: false }).fill('Fixture school with a longer entered name');
  await page.getByLabel('Exam date (optional)', { exact: true }).fill('2027-05-12');
}

async function seedExam(page: Page, oneQuestion = false) {
  await page.evaluate(({ id, oneQuestion }) => {
    const questions = [{ id: 'q1', question: 'Explain why particles diffuse down a concentration gradient.', marks: 3 },
      ...(!oneQuestion ? [{ id: 'q2', question: 'Describe one limitation of this particle model and explain its effect on the prediction.', marks: 4 }] : [])];
    const now = new Date();
    localStorage.setItem(`vertex_content:${id}:mock_exam_draft`, JSON.stringify({
      paper: { title: 'Original diffusion practice', metadata: { totalMarks: 7, subject: 'Physics', board: 'IB DP', grade: 11 }, sections: [{ title: 'Section A', questions }], rubricNotes: ['Identify the gradient and explain the net movement.'] },
      paperTitle: 'Original diffusion practice', answers: {}, answered: 0, total: questions.length,
      currentIndex: 0, deadlineAt: new Date(now.getTime() + 1_800_000).toISOString(), board: 'IB_DP', subject: 'Physics', grade: 11,
      cramMode: false, status: 'in_progress', savedAt: now.toISOString(), updatedAt: now.toISOString(),
    }));
  }, { id, oneQuestion });
}

async function capture(page: Page, info: TestInfo, name: string, width: number) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  if (info.project.name === 'chromium') await page.screenshot({ path: info.outputPath(`${name}.png`), animations: 'disabled', fullPage: name.startsWith('onboarding') });
}

for (const width of [1440, 1024, 390]) test(`onboarding restore, planner preservation and durable exam review at ${width}`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const state = await harness(page);
  await login(page);
  await fillSetup(page);
  await page.getByRole('button', { name: 'Add exam date', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByLabel('Paper (optional)', { exact: true }).fill('Paper 1');
  await page.getByLabel('Exam date', { exact: true }).fill('2027-05-13');
  await page.reload();
  await expect(page.getByText('Restored your unfinished setup saved on this device.', { exact: false })).toBeVisible();
  await expect(page.getByLabel('Exam board', { exact: true })).toHaveValue('IB_DP');
  await expect(page.getByLabel('School', { exact: false })).toHaveValue('Fixture school with a longer entered name');
  await expect(page.getByLabel('Exam date', { exact: true })).toHaveValue('2027-05-13');
  for (const theme of ['light', 'dark'] as const) {
    await selectTheme(page, theme);
    await capture(page, info, `onboarding-${width}-${theme}`, width);
  }
  await page.getByRole('button', { name: 'Create my study plan', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/main$/);
  expect(state.plannerWrites).toBe(0);
  expect(state.metadataWrites).toBe(1);
  expect(await page.evaluate(key => localStorage.getItem(key), key('artifacts:onboarding_draft'))).toBeNull();

  for (const theme of ['light', 'dark'] as const) {
    await page.goto('/main');
    await selectTheme(page, theme);
    await seedExam(page);
    await page.goto('/paper-maker?resumeMock=1');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('textbox', { name: 'Answer for question 1', exact: true }).fill('Particles move down the concentration gradient. Individual particles move randomly, but the net movement follows the difference in concentration.');
    await dialog.getByRole('button', { name: 'Next', exact: true }).focus();
    await page.keyboard.press('Enter');
    await dialog.getByRole('textbox', { name: 'Answer for question 2', exact: true }).fill('The model ignores interactions between particles, so it may be less accurate at high concentrations.');
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    await capture(page, info, `exam-active-${width}-${theme}`, width);
    await dialog.getByRole('button', { name: 'Submit exam', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(dialog.getByText('Answers saved on this device.', { exact: false })).toBeVisible();
    await capture(page, info, `exam-submitted-${width}-${theme}`, width);
    const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key('mock_exam_draft'));
    expect(stored.status).toBe('awaiting_review');
    await page.evaluate(() => sessionStorage.clear());
    await page.goto('/answer-reviewer');
    await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(/concentration gradient/);
    await page.reload();
    await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(/concentration gradient/);
  }
  expect(state.escapedExternalRequests).toEqual([]);
});

test('onboarding cloud outage never overwrites a planner or completes account setup', async ({ page }) => {
  const state = await harness(page);
  await login(page);
  await fillSetup(page);
  state.plannerUnavailable = true;
  const profileWritesBefore = state.profileWrites;
  await page.getByRole('button', { name: 'Create my study plan', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not check your saved planner');
  await expect(page).toHaveURL(/\/onboarding$/);
  expect(state.plannerWrites).toBe(0);
  expect(state.metadataWrites).toBe(0);
  expect(state.profileWrites).toBe(profileWritesBefore);
  state.plannerUnavailable = false;
  await page.getByRole('button', { name: 'Create my study plan', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
  expect(state.plannerWrites).toBe(0);
});

test('restoring a mock preserves its configuration while subsequent edits invalidate the preview', async ({ page }) => {
  await harness(page, true);
  await login(page, true);
  await seedExam(page);
  await page.goto('/paper-maker?resumeMock=1');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Exit exam', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByLabel('Board', { exact: true })).toHaveValue('IB_DP');
  await expect(page.getByLabel('Grade', { exact: true })).toHaveValue('11');
  await expect(page.getByLabel('Subject', { exact: true })).toHaveValue('Physics');
  await expect(page.getByText('Original diffusion practice', { exact: true })).toBeVisible();
  await page.getByLabel('Topics', { exact: true }).fill('A changed topic');
  await expect(page.getByText('Your custom practice paper preview will appear here', { exact: true })).toBeVisible();
  await expect(page.getByText('Original diffusion practice', { exact: true })).toHaveCount(0);
});

test('blocked exam storage keeps the answer visible and Exit disabled by recovery until a save succeeds', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await harness(page, true);
  await login(page, true);
  await seedExam(page, true);
  await page.goto('/paper-maker?resumeMock=1');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    (window as unknown as { restoreFixtureStorage: () => void }).restoreFixtureStorage = () => { Storage.prototype.setItem = original; };
    Storage.prototype.setItem = function (key, value) {
      if (this === window.localStorage && /:mock_exam_(draft|answers)$/.test(key)) throw new DOMException('Fixture quota full', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  const answer = dialog.getByRole('textbox', { name: 'Answer for question 1', exact: true });
  await answer.fill('Keep these unsynced answers visible.');
  await expect(dialog.getByRole('alert')).toContainText('could not be saved on this device');
  await dialog.getByRole('button', { name: 'Exit exam', exact: true }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Submit exam', exact: true }).click();
  await expect(dialog.getByText('Your browser could not save the submitted exam on this device.', { exact: false })).toBeVisible();
  await expect(answer).toHaveValue('Keep these unsynced answers visible.');
  await capture(page, info, 'exam-blocked-storage-390', 390);
  await page.evaluate(() => (window as unknown as { restoreFixtureStorage: () => void }).restoreFixtureStorage());
  await answer.fill('Keep these recovered answers visible.');
  await dialog.getByRole('button', { name: 'Submit exam', exact: true }).click();
  await expect(dialog.getByText('Answers saved on this device.', { exact: false })).toBeVisible();
});
