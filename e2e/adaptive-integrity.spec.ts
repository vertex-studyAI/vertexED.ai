import { expect, test, type Page, type Route } from '@playwright/test';

const learnerId = '9f24b57b-a410-48d5-9f92-6715b7507c20';
const learnerEmail = 'integrity-learner@example.test';
const weaknessStorageKey = `vertex_content:${learnerId}:weakness_heatmap`;

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

function token() {
  const encode = (value: Record<string, unknown>) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    sub: learnerId,
    email: learnerEmail,
    role: 'authenticated',
    aud: 'authenticated',
    exp: 2_103_836_400,
  })}.test`;
}

function learner() {
  const now = new Date().toISOString();
  return {
    id: learnerId,
    aud: 'authenticated',
    role: 'authenticated',
    email: learnerEmail,
    email_confirmed_at: now,
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { username: 'integritylearner', board: 'IB_MYP', grade: 10, subjects: ['Biology'] },
    identities: [],
    created_at: now,
    updated_at: now,
    is_anonymous: false,
  };
}

async function installHarness(page: Page) {
  const user = learner();
  await page.route('https://vertexed-e2e.supabase.co/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === '/auth/v1/token') {
      return json(route, {
        access_token: token(),
        token_type: 'bearer',
        expires_in: 315_360_000,
        expires_at: 2_103_836_400,
        refresh_token: 'test-refresh',
        user,
      });
    }
    if (url.pathname === '/auth/v1/user') return json(route, user);
    if (url.pathname === '/rest/v1/profiles') {
      return json(route, {
        id: learnerId,
        email: learnerEmail,
        board: 'IB_MYP',
        grade: 10,
        subjects: ['Biology'],
        exam_date: null,
        created_at: user.created_at,
        updated_at: user.updated_at,
      });
    }
    return json(route, {});
  });
  await page.route('**/api/**', (route) => json(route, { ok: true, items: [] }));
  await page.route('**/api/waitlist-status', (route) => json(route, { status: 'approved' }));
  await page.route('**/api/paper-generator', (route) => json(route, {
    success: true,
    generation: {
      contractVersion: 'vertexed.learning-artifact.v1',
      capability: 'paper',
      mode: 'provider',
      sourceDigest: 'b'.repeat(64),
      degraded: false,
    },
    paper: {
      title: 'Integrity Mock',
      metadata: { totalMarks: 10, subject: 'Biology', board: 'IB_MYP', grade: 10 },
      sections: [{
        id: 'section-a',
        title: 'Section A',
        questions: [
          { id: 'q1', question: 'Explain one role of chlorophyll.', marks: 5 },
          { id: 'q2', question: 'State one factor that can limit photosynthesis.', marks: 5 },
        ],
      }],
      rubricNotes: ['Review answers against the current syllabus before assigning marks.'],
    },
  }));
}

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(learnerEmail);
  await page.locator('input[type="password"]').fill(['test', 'only'].join('-'));
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
}

function measuredWeakness(topic: string) {
  return {
    topic,
    subject: 'Mathematics',
    board: 'IB_MYP',
    score: 4,
    maxScore: 10,
    source: 'quiz',
    evidence: 'measured-v2',
    verification: {
      method: 'validated-answer-key',
      confirmedAt: '2026-09-08T00:00:00.000Z',
      reference: 'VX-206 deterministic test fixture',
    },
    recordedAt: '2026-09-08T00:00:00.000Z',
  };
}

test('adaptive note URL state requires matching measured weakness', async ({ page }) => {
  await installHarness(page);
  await login(page);
  await page.evaluate(({ key, entry }) => localStorage.setItem(key, JSON.stringify([entry])), {
    key: weaknessStorageKey,
    entry: measuredWeakness('Quadratic factorisation'),
  });

  await page.goto('/notetaker?adaptive=1&subject=Mathematics&topic=Quadratic%20factorisation');
  await expect(page.getByLabel('Topic or source material')).toHaveValue('Quadratic factorisation');
  await expect(page.getByText(/Based on your verified quiz results/)).toBeVisible();

  await page.goto('/notetaker?adaptive=1&subject=Mathematics&topic=Fabricated%20mastery');
  await expect(page.getByLabel('Topic or source material')).toHaveValue('');
  await expect(page.getByText(/Based on your verified quiz results/)).toHaveCount(0);
});

test('timed mock completion does not manufacture mastery data', async ({ page }) => {
  await installHarness(page);
  await login(page);
  await page.evaluate(({ key, entry }) => localStorage.setItem(key, JSON.stringify([entry])), {
    key: weaknessStorageKey,
    entry: measuredWeakness('Cell structure'),
  });
  const before = await page.evaluate((key) => localStorage.getItem(key), weaknessStorageKey);

  await page.goto('/paper-maker');
  await expect(page.getByRole('heading', { name: 'Paper Configuration' })).toBeVisible();
  await expect(page.getByLabel('Grade')).toHaveValue('10');
  await expect(page.getByLabel('Subject')).toHaveValue('Biology');
  await page.getByLabel('Topics').fill('photosynthesis');
  await page.getByRole('button', { name: 'Generate practice paper' }).click();
  await expect(page.getByText('Integrity Mock', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Take timed exam/i }).click();
  await page.getByLabel('Answer for question 1').fill('Chlorophyll absorbs light energy.');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByLabel('Answer for question 2').fill('Light intensity can be limiting.');
  await page.getByRole('button', { name: 'Submit exam', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Exam complete' })).toBeVisible();
  await expect(page.getByText(/No score has been estimated/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Review submitted answers/ })).toBeVisible();
  const after = await page.evaluate((key) => localStorage.getItem(key), weaknessStorageKey);
  expect(after).toBe(before);
});
