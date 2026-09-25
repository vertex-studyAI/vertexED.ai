import { expect, test, type Page } from '@playwright/test';
const learnerId = 'f40db66b-1b55-4ab8-88d0-14a9ba476c16';
const artifactId = '25734997-775e-473f-b415-897751b08497';

async function installAccountHarness(page: Page, empty = false) {
  const user = { id: learnerId, aud: 'authenticated', role: 'authenticated', email: 'learner@example.test', app_metadata: { provider: 'email' }, user_metadata: { username: 'searchlearner', board: 'IB_MYP', grade: 10, subjects: ['Physics'] }, created_at: '2026-09-21T00:00:00Z', identities: [] };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: learnerId, exp: 2103836400, role: 'authenticated' })}.test-only`;
  const artifact = { id: artifactId, kind: 'note', title: 'Mechanics revision source', payload: { notes: 'Momentum is mass multiplied by velocity. Impulse is the change in momentum.' }, created_at: '2026-09-21T00:00:00Z', updated_at: '2026-09-21T00:00:00Z' };
  const state = { holdReads: null as Promise<void> | null, planner: null as Record<string, unknown> | null, reviewItem: null as Record<string, unknown> | null, fail: false, delay: 0, savedReads: 0, notebook: null as Record<string, unknown> | null, quizSources: [] as Array<{ id: string; excerpt: string }>, review: null as Record<string, unknown> | null, reviewRequest: null as Record<string, unknown> | null, learnerWrites: [] as Array<Record<string, unknown>> };
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, async route => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = {};
    if (path === '/auth/v1/token') body = { access_token: token, token_type: 'bearer', expires_in: 315360000, refresh_token: 'test-refresh', user };
    else if (path === '/auth/v1/user') body = user;
    else if (path === '/rest/v1/profiles') body = { id: learnerId, email: user.email, board: 'IB_MYP', grade: 10, subjects: ['Physics'] };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let body: unknown = {};
    let status = 200;
    if (url.pathname === '/api/waitlist-status') body = { status: 'approved' };
    else if (url.pathname === '/api/admin-status') body = { isAdmin: false };
    else if (url.pathname === '/api/learner-state') {
      if (route.request().method() === 'POST') {
        const items = route.request().postDataJSON().items as Array<Record<string, unknown>>;
        state.learnerWrites.push(...items);
        body = { contractVersion: 'vertexed.learner-state.v1', results: items.map(item => ({ stateType: item.stateType, stateKey: item.stateKey, requestedRevision: item.clientRevision, currentRevision: item.clientRevision, applied: true, serverUpdatedAt: new Date().toISOString() })) };
      } else body = { contractVersion: 'vertexed.learner-state.v1', items: [] };
    }
    else if (url.pathname === '/api/user-content') {
      state.savedReads++;
      expect(route.request().headers().authorization).toBe(`Bearer ${token}`);
      if (route.request().method() === 'GET' && state.holdReads) await state.holdReads;
      if (state.delay) await new Promise(resolve => setTimeout(resolve, state.delay));
      status = state.fail ? 503 : 200;
      const requested = url.searchParams.get('id');
      if (route.request().method() === 'POST' && !state.fail) {
        const write = route.request().postDataJSON();
        if (write.kind === 'notebook') {
          state.notebook = { id: '707d3f91-00e7-4fba-bd1e-24de546233d8', kind: 'notebook', title: 'Study Notebook', payload: write.payload, updated_at: new Date().toISOString() };
          body = { item: state.notebook };
        } else if (write.kind === 'planner') {
          state.planner = { ...artifact, id: 'be70a8b1-c055-4129-9653-ea50a783dbe9', kind: 'planner', payload: write.payload, updated_at: new Date().toISOString() };
          body = { item: state.planner };
        } else if (write.kind === 'review') {
          state.review = write.payload;
          state.reviewItem = { ...artifact, kind: 'review', payload: write.payload, updated_at: new Date().toISOString() };
          body = { item: state.reviewItem };
        } else body = { item: artifact };
      } else body = state.fail ? { error: 'Test database unavailable' } : { items: url.searchParams.get('kind') === 'planner' ? state.planner ? [state.planner] : [] : url.searchParams.get('kind') === 'review' ? state.reviewItem ? [state.reviewItem] : [] : url.searchParams.get('kind') === 'notebook' ? state.notebook ? [state.notebook] : [] : requested && requested !== artifactId ? [] : state.reviewItem ? [state.reviewItem] : empty ? [] : [artifact], nextOffset: null };
    } else if (url.pathname === '/api/review') {
      state.reviewRequest = route.request().postDataJSON();
      body = { contractVersion: 'vertexed.answer-review.v2', degraded: false, safe_text: 'Explain how momentum differs from velocity.', review: {
        auditId: 'notebook-practice-review', score: 0, maxScore: 1, scoreStatus: 'EVIDENCE_LINKED', confidence: 0.7,
        humanReviewRequired: true, measurementEligible: false, evidenceState: 'MODEL_EVIDENCE_LINKED',
        escalationReason: 'Check this feedback with your teacher before confirming a mark.',
        feedback: 'Relate impulse to the change in momentum.', includes: 'An attempted explanation.',
        criteria: [{ id: 'impulse', label: 'Impulse and momentum', score: 0, maxScore: 1, feedback: 'Check the distinction between velocity and momentum.', evidence: [], evidenceVerified: true }], errors: [],
      } };
    } else if (url.pathname === '/api/notebook') {
      state.quizSources = route.request().postDataJSON().sources;
      body = { mode: 'quiz', title: 'Mechanics retrieval', content: 'Source-based quiz', generatedAt: new Date().toISOString(), quiz: [
        { id: 'q1', type: 'mcq', question: 'What does impulse measure?', options: ['Change in momentum', 'Velocity'], answer: 'Change in momentum', explanation: 'Impulse equals the change in momentum.', marks: 1, sourceIds: state.quizSources.map(source => source.id) },
        { id: 'q1', type: 'short', question: 'How do you calculate momentum?', options: [], answer: 'Mass times velocity', explanation: 'Multiply mass by velocity.', marks: 1, sourceIds: state.quizSources.map(source => source.id) },
      ] };
    }
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill('learner@example.test');
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
  return state;
}

for (const width of [1440, 1024, 390]) {
  test(`diagnostic, mistake, knowledge, Today and refresh at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await installAccountHarness(page, true);
    await expect(page.getByRole('heading', { name: 'The next useful step' })).toBeVisible();
    await page.goto('/learn?subject=Physics&question=physics-forces-01');
    await page.getByRole('button', { name: 'Start practice', exact: true }).click();
    await page.getByLabel('Your answer', { exact: true }).fill('-1234');
    await page.getByLabel('Confidence before feedback').selectOption('5');
    await page.reload();
    await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('-1234');
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Review this attempt' })).toBeVisible();
    await page.getByText('Save or update this mistake', { exact: true }).click();
    await page.getByLabel('Why I got it wrong').fill('I forgot to account for net force.');
    await page.getByLabel('Corrected reasoning').fill('Find the resultant force and divide by mass.');
    await page.getByRole('button', { name: 'Save mistake', exact: true }).click();
    await page.getByRole('button', { name: 'Finish session', exact: true }).click();
    await page.getByRole('button', { name: 'Knowledge', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Concepts and prerequisites' })).toBeVisible();
    await expect(page.getByText('1 attempts;', { exact: false }).first()).toBeVisible();
    for (const theme of ['light','dark']) {
      await page.evaluate(t => { document.documentElement.classList.remove('light','dark'); document.documentElement.classList.add(t); }, theme);
      await page.screenshot({ path: info.outputPath(`knowledge-${width}-${theme}.png`), fullPage: true });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.getByRole('button', { name: 'Mistakes', exact: true }).click();
    await expect(page.getByText('I forgot to account for net force.')).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Progress', exact: true }).click();
    await expect(page.getByRole('cell', { name: 'Incorrect', exact: true })).toHaveCount(1);
    await page.goto('/main');
    await expect(page.getByText(/recent correct without a hint/).first()).toBeVisible();
    await page.getByLabel('Time available today').selectOption('10');
    await page.screenshot({ path: info.outputPath(`today-${width}.png`), fullPage: true });
    await page.keyboard.press('Control+k');
    const input = page.getByRole('combobox', { name: 'Search VertexED' });
    await input.fill('Newton second law');
    await expect(page.getByRole('listbox', { name: 'VertexED search results' }).getByRole('option').first()).toContainText(/Newton second law/i);
    await input.press('Enter');
    await expect(page).toHaveURL(/\/learn\?concept=/);
    expect(errors).toEqual([]);
  });
}

test('exam defers feedback, persists flags, locks when timed out and records once', async ({ page }) => {
  await installAccountHarness(page, true);
  await page.goto('/learn?subject=Physics&question=physics-forces-01');
  await page.getByLabel('Practice mode').selectOption('exam');
  await page.getByRole('button', { name: 'Start practice', exact: true }).click();
  await page.getByLabel('Your answer', { exact: true }).fill('0');
  await page.getByRole('button', { name: 'Flag question', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Check answer', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Unflag question', exact: true })).toBeVisible();
  await page.evaluate(id => { const key = `vertex_content:${id}:practice_session`; const value=JSON.parse(localStorage.getItem(key)!); value.deadline=Date.now()-1000; localStorage.setItem(key,JSON.stringify(value)); }, learnerId);
  await page.reload();
  await expect(page.getByLabel('Your answer', { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Finish session', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review this attempt' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Progress', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Incorrect', exact: true })).toHaveCount(1);
});

test('corrupt practice is retained and cannot be replaced by starting a new session', async ({ page }) => {
  await installAccountHarness(page, true);
  await page.evaluate(id => localStorage.setItem(`vertex_content:${id}:practice_attempts`, '[{"broken":true}]'), learnerId);
  await page.goto('/learn');
  await expect(page.getByRole('alert').filter({ hasText: /preserved/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start practice', exact: true })).toBeDisabled();
  expect(await page.evaluate(id => localStorage.getItem(`vertex_content:${id}:practice_attempts`), learnerId)).toBe('[{"broken":true}]');
});

test('Apex learning mode reaches API and keyboard-controlled games preserve study tools', async ({ page }) => {
  await installAccountHarness(page, true);
  let tutorRequest: Record<string, unknown> | null = null;
  await page.route('**/api/ask', async route => { tutorRequest = route.request().postDataJSON(); await route.fulfill({ json: { answer: 'What forces act on the object?' } }); });
  await page.goto('/chatbot');
  await page.getByLabel('Learning mode', { exact: true }).selectOption('hint');
  await expect(page.getByLabel('Learning mode', { exact: true })).toHaveValue('hint');
  await page.getByRole('textbox', { name: 'Message the AI tutor' }).fill('Help with Newton second law');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect.poll(() => tutorRequest?.learningMode).toBe('hint');
  await page.goto('/study-zone');
  await page.getByText('Optional study break games', { exact: true }).click();
  await page.getByLabel('Game', { exact: true }).selectOption('0');
  const board = page.getByLabel('Number tiles. Use arrow keys to move.', { exact: true });
  await board.focus(); await board.press('ArrowLeft');
  await page.getByRole('button', { name: 'Pause game', exact: true }).click();
  await expect(board).toBeHidden();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  await expect(board).toBeVisible();
  await page.getByLabel('Game', { exact: true }).selectOption('1');
  await page.getByRole('button', { name: 'Card 1: hidden', exact: true }).click();
  await expect(page.getByRole('button', { name: /Card 1: [A-F]$/ })).toBeVisible();
  await page.getByLabel('Game', { exact: true }).selectOption('2');
  await page.getByRole('button', { name: 'Hide and try', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Optional study break' }).getByRole('button', { name: '1', exact: true })).toBeVisible();
  await page.getByLabel('Game', { exact: true }).selectOption('3');
  await page.getByRole('button', { name: 'Start reaction round', exact: true }).click();
  await page.getByRole('button', { name: 'Wait', exact: true }).click();
  await expect(page.getByText('Too early. Try again.')).toBeVisible();
  await page.getByLabel('Game', { exact: true }).selectOption('4');
  const stack = page.getByLabel('Revision Stack game. Use arrow keys to move, up arrow to rotate and Space to place a block.', { exact: true });
  await expect(stack).toBeVisible();
  expect(await page.locator('.study-break-games .vh-stack-board').evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(300);
  await stack.focus(); await stack.press('ArrowLeft');
  await page.getByRole('button', { name: 'Place block', exact: true }).click();
  await expect(page.locator('.study-break-games .vh-stack-board .is-filled').first()).toBeVisible();
});

for (const width of [1440, 1024, 390]) {
  test(`planner commitments, automatic rebalance and completion history at ${width}`, async ({ page }, info) => {
    await page.clock.setFixedTime('2026-09-21T03:30:00Z');
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const state = await installAccountHarness(page, true);
    await page.goto('/planner');
    await page.getByRole('button', { name: 'New Task', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Task name', { exact: true }).fill('Weekly physics class');
    await dialog.getByLabel('Date', { exact: true }).fill('2028-04-03');
    await dialog.getByLabel('Task type').selectOption('commitment');
    await dialog.getByLabel('Weekly occurrences').fill('4');
    await page.screenshot({ path: info.outputPath(`planner-form-${width}.png`), fullPage: true });
    await dialog.getByRole('button', { name: 'Add task', exact: true }).click();
    await expect(page.getByText('Added 4 weekly commitments.', { exact: false })).toBeVisible();
    await expect.poll(() => (state.planner?.payload as { tasks: unknown[] } | undefined)?.tasks.length).toBe(4);
    await page.getByRole('button', { name: 'New Task', exact: true }).click();
    await dialog.getByLabel('Task name', { exact: true }).fill('Flexible forces revision');
    await dialog.getByLabel('Date', { exact: true }).fill('2020-01-01');
    await dialog.getByLabel('Automatically reschedule if missed').check();
    await dialog.getByLabel('Study window starts').fill('17:00');
    await dialog.getByLabel('Study window ends').fill('20:00');
    await dialog.getByRole('button', { name: 'Add task', exact: true }).click();
    await expect.poll(() => (state.planner?.payload as { tasks: unknown[] } | undefined)?.tasks.length).toBe(5);
    await page.reload();
    await expect(page.getByText(/Moved 1 missed study task within/)).toBeVisible();
    await expect.poll(() => (state.planner?.payload as { tasks: Array<{ rescheduledFrom?: string }> } | undefined)?.tasks.find(task => task.rescheduledFrom)?.rescheduledFrom).toBe('01/01/2020 10:00 AM');
    const saved = (state.planner!.payload as { tasks: Array<{ id: string; date: string; 'start time': string; taskKind?: string }> }).tasks;
    expect(saved.filter(task => task.taskKind === 'commitment').map(task => task.date)).toEqual(['04/03/2028', '04/10/2028', '04/17/2028', '04/24/2028']);
    await page.getByRole('button', { name: 'Mark Flexible forces revision complete', exact: true }).click();
    await page.getByText('Recent completed tasks', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'Reopen Flexible forces revision' })).toBeVisible();
    await expect(page.getByText(/60 scheduled minutes marked complete/)).toBeVisible();
    await page.screenshot({ path: info.outputPath(`planner-completed-${width}.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.getByRole('button', { name: 'Reopen Flexible forces revision' }).click();
    await expect(page.getByRole('button', { name: 'Mark Flexible forces revision complete', exact: true })).toBeVisible();
  });
}
