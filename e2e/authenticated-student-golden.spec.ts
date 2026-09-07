import { expect, test, type Page, type Route } from '@playwright/test';

const learnerEmail = 'learner@example.test';
const learnerPassword = 'VertexED2026!';
const learnerId = 'f40db66b-1b55-4ab8-88d0-14a9ba476c16';

type Artifact = {
  id: string;
  kind: string;
  title: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function accessToken() {
  const encode = (value: Record<string, unknown>) => Buffer
    .from(JSON.stringify(value))
    .toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    sub: learnerId,
    email: learnerEmail,
    role: 'authenticated',
    aud: 'authenticated',
    exp: 2_103_836_400,
  })}.vertexed-e2e-signature`;
}

function createLearner() {
  const now = new Date().toISOString();
  return {
    id: learnerId,
    aud: 'authenticated',
    role: 'authenticated',
    email: learnerEmail,
    email_confirmed_at: now,
    phone: '',
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { username: 'e2elearner' },
    identities: [],
    created_at: now,
    updated_at: now,
    is_anonymous: false,
  };
}

async function installExternalServiceHarness(page: Page) {
  let learner = createLearner();
  const artifacts: Artifact[] = [];
  const learnerState = new Map<string, Record<string, unknown>>();
  const observed = {
    inviteValidated: false,
    accountCreated: false,
    plannerSaved: false,
    notesSaved: false,
    reviewSaved: false,
    answerReviewRequested: false,
    answerReviewSaved: false,
    adaptiveNoteRequested: false,
    learnerStateSaved: false,
    authHeaders: 0,
  };

  await page.route('https://vertexed-e2e.supabase.co/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === '/auth/v1/token') {
      const token = accessToken();
      return json(route, {
        access_token: token,
        token_type: 'bearer',
        expires_in: 315_360_000,
        expires_at: 2_103_836_400,
        refresh_token: 'vertexed-e2e-refresh-token',
        user: learner,
      });
    }

    if (url.pathname === '/auth/v1/user') {
      if (request.method() === 'PUT') {
        const body = request.postDataJSON() as { data?: Record<string, unknown> };
        learner = {
          ...learner,
          user_metadata: { ...learner.user_metadata, ...(body.data ?? {}) },
          updated_at: new Date().toISOString(),
        };
      }
      return json(route, learner);
    }

    if (url.pathname === '/auth/v1/logout') {
      return route.fulfill({ status: 204, body: '' });
    }

    if (url.pathname === '/rest/v1/profiles') {
      if (request.method() === 'PATCH') return json(route, { id: learnerId });
      if (request.method() === 'POST') return json(route, null, 201);
      return json(route, {
        id: learnerId,
        email: learnerEmail,
        full_name: 'E2E Learner',
        avatar_url: null,
        board: learner.user_metadata.board ?? null,
        grade: learner.user_metadata.grade ?? null,
        subjects: learner.user_metadata.subjects ?? [],
        exam_date: learner.user_metadata.examDate ?? null,
        created_at: learner.created_at,
        updated_at: learner.updated_at,
      });
    }

    return json(route, { message: `Unhandled Supabase route: ${request.method()} ${url.pathname}` }, 501);
  });

  // Vercel injects these scripts on the deployed host; deterministic local
  // production preview supplies inert equivalents instead of reporting 404s.
  for (const path of ['speed-insights', 'insights']) {
    await page.route(`**/_vercel/${path}/script.js`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '',
    }));
  }

  // Keep background telemetry and optional API probes inside the deterministic
  // harness. Endpoint-specific routes registered below take precedence.
  await page.route('**/api/**', async (route) => {
    return json(route, { ok: true, items: [] });
  });

  await page.route('**/api/learner-state', async (route) => {
    const request = route.request();
    if (request.headers().authorization === `Bearer ${accessToken()}`) observed.authHeaders += 1;
    if (request.method() === 'GET') {
      return json(route, { contractVersion: 'vertexed.learner-state.v1', items: [...learnerState.values()] });
    }
    if (request.method() === 'POST') {
      const body = request.postDataJSON() as { items?: Array<Record<string, unknown>> };
      const items = Array.isArray(body.items) ? body.items : [];
      const results = items.map((item) => {
        const stateType = String(item.stateType);
        const stateKey = String(item.stateKey);
        const serverUpdatedAt = new Date().toISOString();
        learnerState.set(`${stateType}:${stateKey}`, { ...item, serverUpdatedAt });
        return {
          stateType,
          stateKey,
          requestedRevision: item.clientRevision,
          currentRevision: item.clientRevision,
          applied: true,
          serverUpdatedAt,
        };
      });
      const savedTypes = new Set([...learnerState.values()].map((item) => item.stateType));
      observed.learnerStateSaved ||= savedTypes.has('weakness') && savedTypes.has('retry');
      return json(route, { contractVersion: 'vertexed.learner-state.v1', results });
    }
    return json(route, { error: 'Unsupported learner-state operation' }, 405);
  });

  await page.route('**/api/waitlist-status', async (route) => {
    const authorized = route.request().headers().authorization === `Bearer ${accessToken()}`;
    return authorized
      ? json(route, { status: 'approved' })
      : json(route, { error: 'Authentication required' }, 401);
  });

  await page.route('**/api/signup-invite', async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    if (body.action === 'validateInvite') {
      observed.inviteValidated = body.waitlistInviteToken === 'vertexed-e2e-approved';
      return json(route, { email: learnerEmail, status: 'approved' });
    }
    observed.accountCreated = body.waitlistInviteToken === 'vertexed-e2e-approved'
      && body.email === undefined
      && body.username === 'e2elearner';
    return json(route, { requiresEmailVerification: false, userId: learnerId }, 201);
  });

  await page.route('**/api/user-content**', async (route) => {
    const request = route.request();
    if (request.headers().authorization === `Bearer ${accessToken()}`) {
      observed.authHeaders += 1;
    }

    if (request.method() === 'GET') {
      const url = new URL(request.url());
      const kind = url.searchParams.get('kind');
      const items = kind ? artifacts.filter((item) => item.kind === kind) : artifacts;
      return json(route, { items });
    }

    if (request.method() === 'POST') {
      const body = request.postDataJSON() as {
        kind: string;
        title?: string;
        payload?: Record<string, unknown>;
        replace?: boolean;
      };
      const now = new Date().toISOString();
      const existingIndex = body.replace
        ? artifacts.findIndex((item) => item.kind === body.kind)
        : -1;
      const item: Artifact = {
        id: existingIndex >= 0 ? artifacts[existingIndex].id : `artifact-${artifacts.length + 1}`,
        kind: body.kind,
        title: body.title || body.kind,
        payload: body.payload ?? {},
        created_at: existingIndex >= 0 ? artifacts[existingIndex].created_at : now,
        updated_at: now,
      };
      if (existingIndex >= 0) artifacts[existingIndex] = item;
      else artifacts.unshift(item);
      observed.plannerSaved ||= body.kind === 'planner';
      observed.notesSaved ||= body.kind === 'note' && body.title === 'IB Biology photosynthesis';
      observed.reviewSaved ||= body.kind === 'review' && body.title.includes('Quiz review');
      observed.answerReviewSaved ||= body.kind === 'review'
        && typeof body.payload?.structuredReview === 'object';
      return json(route, { ok: true, item, replayed: false }, 201);
    }

    return json(route, { error: 'Unsupported test operation' }, 405);
  });

  await page.route('**/api/note', async (route) => {
    const request = route.request();
    if (request.headers().authorization === `Bearer ${accessToken()}`) {
      observed.authHeaders += 1;
    }
    const body = request.postDataJSON() as { topic?: string };
    observed.adaptiveNoteRequested ||= body.topic?.includes(
      'IB_MYP_BIO_PHOTOSYNTHESIS_LIMITING_FACTORS',
    ) === true;
    return json(route, {
      result: [
        '# Photosynthesis',
        '',
        'Photosynthesis converts light energy into chemical energy in chloroplasts.',
        '',
        '## Limiting factors',
        '- Light intensity',
        '- Carbon dioxide concentration',
        '- Temperature',
      ].join('\n'),
      flashcards: [
        { front: 'Where does photosynthesis occur?', back: 'In chloroplasts.' },
        { front: 'Name one limiting factor.', back: 'Light intensity.' },
      ],
      provenance: { topic: 'IB Biology photosynthesis', board: 'IB_MYP', subjects: ['Biology'] },
      generation: {
        contractVersion: 'vertexed.learning-artifact.v1',
        capability: 'note',
        mode: 'provider',
        sourceDigest: 'a'.repeat(64),
        degraded: false,
      },
    });
  });

  await page.route('**/api/quiz', async (route) => {
    const request = route.request();
    if (request.headers().authorization === `Bearer ${accessToken()}`) {
      observed.authHeaders += 1;
    }
    const body = request.postDataJSON() as { action?: string };
    if (body.action === 'generate') {
      return json(route, {
        questions: [{
          id: 'photosynthesis-frq-1',
          type: 'frq',
          prompt: 'Explain how light intensity can limit the rate of photosynthesis.',
          expected: 'Increasing light intensity raises the rate until another factor becomes limiting.',
          maxScore: 4,
          objectiveIds: ['IB_MYP_BIO_PHOTOSYNTHESIS_LIMITING_FACTORS'],
          provenance: { source: 'generated-notes', evidenceBound: true },
        }],
      });
    }
    return json(route, {
      contractVersion: 'vertexed.grading.v2',
      grades: [{
        id: 'photosynthesis-frq-1',
        score: 2,
        maxScore: 4,
        feedback: 'You identified light as a factor; explain the plateau when another factor becomes limiting.',
        includes: 'A correct link between light and photosynthesis rate.',
        scoreStatus: 'EVIDENCE_LINKED',
        confidence: 0.96,
        humanReviewRequired: true,
        measurementEligible: false,
        evidenceState: 'MODEL_EVIDENCE_LINKED',
        escalationReason: 'AI feedback requires human confirmation before it can update mastery.',
        remediation: ['Practise interpreting a limiting-factor graph'],
      }],
      coverage: [{ objectiveId: 'IB_MYP_BIO_PHOTOSYNTHESIS_LIMITING_FACTORS', status: 'partial' }],
      degraded: false,
    });
  });

  await page.route('**/api/review', async (route) => {
    const request = route.request();
    if (request.headers().authorization === `Bearer ${accessToken()}`) {
      observed.authHeaders += 1;
    }
    const body = request.postDataJSON() as { question?: string; answer?: string; marks?: string };
    observed.answerReviewRequested = body.question === 'Explain why photosynthesis plateaus at high light intensity.'
      && body.answer === 'Carbon dioxide becomes limiting, so extra light cannot increase the rate.'
      && body.marks === '4';
    const quote = 'Carbon dioxide becomes limiting';
    return json(route, {
      contractVersion: 'vertexed.answer-review.v2',
      gradingContractVersion: 'vertexed.grading.v2',
      degraded: false,
      blocked: false,
      safe_text: 'Evidence-linked AI review: 4/4.',
      output: 'Evidence-linked AI review: 4/4.',
      review: {
        auditId: 'answer-review-audit-1',
        id: 'answer-review',
        score: 4,
        maxScore: 4,
        scoreStatus: 'EVIDENCE_LINKED',
        confidence: 0.94,
        humanReviewRequired: true,
        measurementEligible: false,
        evidenceState: 'MODEL_EVIDENCE_LINKED',
        escalationReason: 'AI feedback requires confirmation against a teacher decision or official mark scheme before it can update mastery.',
        feedback: 'The answer identifies another limiting factor and explains the plateau.',
        includes: 'Carbon dioxide as the limiting factor.',
        criteria: [{
          id: 'explanation',
          label: 'Scientific explanation',
          score: 4,
          maxScore: 4,
          feedback: 'The causal link is explicit.',
          evidence: [{ quote, start: 0, end: quote.length }],
          evidenceVerified: true,
        }],
        errors: [],
      },
      coverage: [],
    });
  });

  await page.route('**/api/paper-generator', async (route) => {
    const request = route.request();
    if (request.headers().authorization === `Bearer ${accessToken()}`) {
      observed.authHeaders += 1;
    }
    return json(route, {
      success: true,
      paper: {
        title: 'IB Biology limiting factors practice',
        metadata: {
          board: 'IB MYP',
          grade: 10,
          subject: 'Biology',
          format: 'Mixed Format',
          numQuestions: 1,
          totalMarks: 4,
          difficulty: 'Medium',
          criteriaMode: false,
        },
        sections: [{
          id: 'section-1',
          title: 'Photosynthesis',
          instructions: 'Answer using complete scientific reasoning.',
          questions: [{
            id: 'mock-1',
            question: 'Explain why photosynthesis reaches a plateau at high light intensity.',
            marks: 4,
            approxTime: '5 minutes',
            modelAnswerOutline: 'Another factor becomes limiting.',
          }],
        }],
        rubricNotes: ['Award credit only for identifying and explaining another limiting factor.'],
      },
      generation: {
        contractVersion: 'vertexed.learning-artifact.v1',
        capability: 'paper',
        mode: 'provider',
        sourceDigest: 'b'.repeat(64),
        degraded: false,
      },
    });
  });

  return { artifacts, learnerState, observed };
}

test('approved learner completes the golden study journey and resumes saved work', async ({ page }) => {
  const harness = await installExternalServiceHarness(page);
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(`console.error: ${message.text()}`);
  });

  await page.goto('/signup?invite=vertexed-e2e-approved');
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  await expect(page.getByText(learnerEmail)).toBeVisible();
  await page.getByLabel('Username').fill('e2elearner');
  await page.getByLabel('Password').fill(learnerPassword);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/connect-google$/);
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole('heading', { name: 'Build your first study plan' })).toBeVisible();

  await page.locator('#curriculum-board').selectOption('IB_MYP');
  await page.locator('#curriculum-grade').selectOption('10');
  await page.getByRole('button', { name: 'Biology', exact: true }).click();
  await page.getByRole('button', { name: 'Create my study plan' }).click();

  await expect(page).toHaveURL(/\/main$/);
  await expect(page.getByRole('heading', { name: 'Make this study session count.' })).toBeVisible();
  await page.locator('a[href="/notetaker"]').filter({ hasText: 'Make study material' }).click();
  await expect(page).toHaveURL(/\/notetaker$/);

  await page.getByPlaceholder(/IB Biology — photosynthesis/).fill('IB Biology photosynthesis');
  await page.getByRole('button', { name: 'Build notes' }).click();
  await expect(page.getByText('Photosynthesis converts light energy')).toBeVisible();
  await expect(page.getByText('Notes saved', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Create quiz from notes' }).click();
  await expect(page.getByText('Explain how light intensity can limit')).toBeVisible();
  await page.getByPlaceholder('Write your answer...').fill('More light makes photosynthesis faster.');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();

  await expect(page.getByText(/Practice score guidance:\s*2\/4/i)).toBeVisible();
  await expect(page.getByText(/Feedback: You identified light as a factor/)).toBeVisible();
  await expect(page.getByText(/Next practice: Practise interpreting a limiting-factor graph/)).toBeVisible();
  await expect.poll(() => harness.observed.reviewSaved).toBe(true);

  await page.getByRole('banner').getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
  await expect(page.getByRole('link', { name: /^Build adaptive notes:/ })).toHaveCount(0);
  await expect(page.getByText(/Confirm a review or complete a validated assessment/i)).toBeVisible();

  // A forged adaptive URL cannot manufacture a target without matching measured evidence.
  await page.goto('/notetaker?adaptive=1&subject=Biology&topic=FORGED_TOPIC');
  await expect(page.getByText('Based on your measured quiz results')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Build notes' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Email').fill(learnerEmail);
  await page.getByLabel('Password').fill(learnerPassword);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();

  await expect(page).toHaveURL(/\/notetaker$/);
  await page.getByRole('banner').getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
  await expect(page.getByRole('heading', { name: 'Pick up where you left off' })).toBeVisible();
  await expect(page.getByText('IB Biology photosynthesis', { exact: true })).toBeVisible();
  await expect(page.getByText('Quiz review — IB Biology photosynthesis', { exact: true })).toBeVisible();

  await page.goto('/answer-reviewer');
  await expect(page.getByRole('heading', { name: 'Answer Reviewer' })).toBeVisible();
  await page.getByLabel('Marks available').fill('4');
  await page.getByLabel('Question').fill('Explain why photosynthesis plateaus at high light intensity.');
  await page.getByLabel('Your answer').fill('Carbon dioxide becomes limiting, so extra light cannot increase the rate.');
  await page.getByLabel(/Mark scheme or context/).fill('Award for naming and explaining another limiting factor.');
  await page.getByRole('button', { name: 'Review my answer' }).click();
  await expect(page.getByText('Evidence-linked AI review', { exact: true })).toBeVisible();
  await expect(page.getByText('94% confidence')).toBeVisible();
  await expect(page.locator('blockquote').filter({ hasText: 'Carbon dioxide becomes limiting' })).toBeVisible();
  await page.getByLabel('Verification method').selectOption('official-mark-scheme');
  await page.getByRole('button', { name: 'Confirm mark for mastery' }).click();
  await expect(page.getByRole('button', { name: 'Added to measured progress' })).toBeDisabled();
  await expect.poll(() => harness.observed.answerReviewSaved).toBe(true);
  await expect.poll(() => harness.observed.learnerStateSaved).toBe(true);
  await expect.poll(() => page.evaluate(() => new Promise<number>((resolve) => {
    const open = indexedDB.open('vertexed-recovery-v1', 1);
    open.onupgradeneeded = () => {
      if (!open.result.objectStoreNames.contains('outbox')) open.result.createObjectStore('outbox', { keyPath: 'id' });
    };
    open.onerror = () => resolve(-1);
    open.onsuccess = () => {
      const database = open.result;
      const request = database.transaction('outbox', 'readonly').objectStore('outbox').getAll();
      request.onerror = () => { database.close(); resolve(-1); };
      request.onsuccess = () => {
        const pending = request.result.filter((record) => record.channel === 'learner-state').length;
        database.close();
        resolve(pending);
      };
    };
  }))).toBe(0);

  // Remove both device recovery layers. The dashboard must reconstruct the
  // measured weakness and retry from the server-side learner-state contract.
  await page.evaluate(async () => {
    for (const key of Object.keys(localStorage)) {
      if (/:weakness_heatmap$|:retry_queue$|:learner_state_outbox$/.test(key)) localStorage.removeItem(key);
    }
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('vertexed-recovery-v1');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('IndexedDB deletion was blocked'));
    });
  });

  await page.goto('/main');
  const retryCard = page.locator('article').filter({ hasText: 'Retry queue' });
  await expect(retryCard).toContainText('Scientific explanation');
  await expect(retryCard).toContainText('Biology · 100%');
  await expect(retryCard.getByRole('link', { name: 'Start retry' })).toHaveAttribute(
    'href',
    /\/answer-reviewer\?.*retry=retry%3Abiology%3Ascientific-explanation/,
  );

  await page.goto('/paper-maker');
  await expect(page.getByRole('heading', { name: 'Paper Configuration' })).toBeVisible();
  await expect(page.getByLabel('Board')).toHaveValue('IB_MYP');
  await expect(page.getByLabel('Grade')).toHaveValue('10');
  await expect(page.getByLabel('Subject')).toHaveValue('Biology');
  await page.getByLabel('Topics').fill('cell respiration, enzymes');
  await expect(page.getByLabel('Total marks')).toBeVisible();
  await expect(page.getByLabel('Number of questions')).toBeVisible();
  await expect(page.getByLabel('Question format')).toBeVisible();
  await expect(page.getByLabel('Difficulty')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Generate practice paper' })).toBeEnabled();
  await page.getByRole('button', { name: 'Generate practice paper' }).click();
  await expect(page.getByText('IB Biology limiting factors practice')).toBeVisible();
  await page.getByRole('button', { name: 'Take timed exam' }).click();
  await page.getByLabel('Answer for question 1').fill('Carbon dioxide becomes limiting.');
  await page.getByRole('button', { name: 'Submit exam' }).click();
  await expect(page.getByRole('heading', { name: 'Exam complete' })).toBeVisible();
  await expect(page.getByText(/No score has been estimated/)).toBeVisible();

  const measuredEntries = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) => candidate.endsWith(':weakness_heatmap'));
    return key ? JSON.parse(localStorage.getItem(key) || '[]') : [];
  });
  expect(measuredEntries).toHaveLength(1);
  expect(measuredEntries[0]).toMatchObject({
    source: 'review',
    score: 4,
    maxScore: 4,
    evidence: 'measured-v2',
    verification: { method: 'official-mark-scheme' },
  });

  expect(harness.observed).toMatchObject({
    inviteValidated: true,
    accountCreated: true,
    plannerSaved: true,
    notesSaved: true,
    reviewSaved: true,
    answerReviewRequested: true,
    answerReviewSaved: true,
    learnerStateSaved: true,
    adaptiveNoteRequested: false,
  });
  expect(harness.observed.authHeaders).toBeGreaterThanOrEqual(5);
  expect(harness.artifacts.map((item) => item.kind)).toEqual(
    expect.arrayContaining(['planner', 'note', 'review']),
  );
  expect(browserErrors).toEqual([]);
});
