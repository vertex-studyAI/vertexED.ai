import { expect, test, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';

for (const width of [1440, 1024, 390]) {
  test(`search works immediately, persists history and escapes clipping at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const input = page.getByRole('combobox', { name: 'Search VertexED' });
    const initialScroll = await page.evaluate(() => scrollY);
    await input.click();
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await input.fill('bioloyg');
    await expect(page.getByRole('listbox', { name: 'VertexED search results' }).getByRole('option').first()).toContainText(/biology/i);
    expect(Math.abs(await page.evaluate(() => scrollY) - initialScroll)).toBeLessThanOrEqual(2);
    if (width === 390) {
      expect(await page.locator('.vh-scroll-island').evaluate(element => getComputedStyle(element, '::before').display)).toBe('none');
      await expect(page.locator('.vh-scroll-island a').first()).toHaveCSS('min-height', '44px');
    }
    expect(await page.locator('.vertex-search-popover').evaluate(element => element.parentElement === document.body)).toBe(true);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(value); }, theme);
      await page.screenshot({ path: info.outputPath(`search-${width}-${theme}.png`) });
    }
    await input.fill('privacy');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/privacy$/);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(input).toBeVisible();
    await page.keyboard.press('Control+k');
    await expect(input).toBeFocused();
    await expect(page.getByRole('option', { name: /Recent search privacy/i })).toBeVisible();
    await page.getByRole('button', { name: 'Clear history' }).click();
    await expect(page.getByRole('option', { name: /Recent search/i })).toHaveCount(0);
    await input.focus();
    await input.press('Escape');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toBeFocused();
    await page.keyboard.press('Meta+k');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await input.press('Escape');
    await page.getByRole('heading', { level: 1 }).click();
    await page.keyboard.press('/');
    await expect(input).toBeFocused();
    await input.fill('zzzzunknownsubject');
    await expect(page.getByText(/No matches for/)).toBeVisible();
    await input.fill('study');
    for (let i = 0; i < 8; i++) await input.press('ArrowDown');
    const activeId = await input.getAttribute('aria-activedescendant');
    await expect(page.locator(`#${activeId}`)).toBeInViewport();
    expect(await page.locator('.site-shell').evaluate(element => ({ overflow: getComputedStyle(element).overflowX, scroll: element.scrollLeft }))).toEqual({ overflow: 'clip', scroll: 0 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  });
}

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

test('saved work search, refresh, restore and cloud failure recovery', async ({ page }, info) => {
  const state = await installAccountHarness(page);
  const input = page.getByRole('combobox', { name: 'Search VertexED' });
  await input.click();
  await input.fill('impulse');
  await page.getByRole('option', { name: /Mechanics revision source/ }).click();
  await expect(page).toHaveURL(new RegExp(`/saved-work\\?item=${artifactId}`));
  await page.reload();
  await expect(page.getByText('Mechanics revision source', { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('saved-work.png') });
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page).toHaveURL(/\/notetaker$/);
  await expect(page.getByRole('textbox', { name: 'Editable study notes' })).toHaveValue(/Momentum is mass/);
  await page.goto('/saved-work');
  await expect(page.getByText('Mechanics revision source', { exact: true })).toBeVisible();
  state.fail = true;
  await input.click();
  await input.fill('physics');
  await expect(page.getByText(/Cloud work could not be loaded/)).toBeVisible();
  await expect(page.getByRole('listbox', { name: 'VertexED search results' }).getByRole('option').first()).toBeVisible();
  state.fail = false;
  await page.getByRole('button', { name: 'Retry saved work' }).click();
  await input.fill('impulse');
  await expect(page.getByRole('option', { name: /Mechanics revision source/ })).toBeVisible();
});

test('notebook imports, persists practice, keeps previous attempts and opens contextual review', async ({ page }, info) => {
  test.setTimeout(120000);
  page.setDefaultTimeout(15000);
  const state = await installAccountHarness(page, true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('link', { name: 'Start with your notes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your first saved attempt' })).toBeVisible();
  const choose = page.getByLabel('Choose a source file');
  await expect(choose).toBeEnabled();
  const file = { name: 'Mechanics.txt', mimeType: 'text/plain', buffer: Buffer.from('Impulse equals the change in momentum. Momentum is mass times velocity.') };
  await choose.setInputFiles(file);
  const reviewSource = page.getByRole('region', { name: 'Review imported source' });
  await expect(reviewSource).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview Mechanics', exact: true })).toHaveCount(0);
  await page.getByLabel('Included source text', { exact: true }).fill(file.buffer.toString() + '\n# Momentum review');
  await expect(reviewSource.getByText('Detected Markdown headings', { exact: true })).toBeVisible();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await reviewSource.scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`text-review-${width}-${theme}.png`) });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    }
  }
  await page.getByRole('button', { name: 'Add reviewed source', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Preview Mechanics', exact: true })).toBeVisible();
  await choose.setInputFiles({ ...file, buffer: Buffer.from(file.buffer.toString() + '\n# Momentum review') });
  await expect(page.getByRole('region', { name: 'Review imported source' })).toBeVisible();
  await page.getByRole('button', { name: 'Add reviewed source', exact: true }).click();
  await expect(page.getByText(/No duplicate was added/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview Mechanics', exact: true })).toHaveCount(1);
  await choose.setInputFiles({ name: 'binary.txt', mimeType: 'text/plain', buffer: Buffer.from([0, 1, 2, 3]) });
  await expect(page.getByText(/looks like a binary file/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry import' })).toBeVisible();
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await page.getByRole('button', { name: 'Practice Quiz', exact: true }).click();
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await expect(page.getByText('What does impulse measure?', { exact: true })).toBeVisible();
  expect(state.quizSources[0].excerpt).toContain('Impulse equals');
  await expect.poll(() => JSON.stringify(state.notebook)).toContain('What does impulse measure?');
  const answer = page.getByRole('textbox', { name: 'Your answer to question 1', exact: true });
  const confidence = page.getByLabel('Confidence for question 1', { exact: true });
  await answer.fill('Velocity');
  await confidence.selectOption('80');
  expect(await confidence.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await expect(page.locator('header.vertex-navigation')).toHaveCSS('backdrop-filter', 'none');
  await expect.poll(() => JSON.stringify(state.notebook)).toContain('"answer":"Velocity"');
  await expect.poll(() => JSON.stringify(state.notebook)).toContain('"confidence":80');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Preview Mechanics', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await page.getByRole('button', { name: 'Practice Quiz', exact: true }).click();
  await expect(page.getByText('What does impulse measure?', { exact: true })).toBeVisible();
  await expect(answer).toHaveValue('Velocity');
  await expect(confidence).toHaveValue('80');
  // A failed device write must retain the draft, expose recovery and prevent an
  // answer reveal from pretending the response was safely persisted.
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.assign(window, { restoreNotebookStorage: () => { Storage.prototype.setItem = original; } });
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('vertex_notebooks:') && key.endsWith(':data')) throw new DOMException('Test quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await answer.fill('Change in velocity');
  await expect(answer).toHaveValue('Change in velocity');
  await expect(page.getByText(/Your latest changes could not be saved/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reveal answer', exact: true }).first()).toBeDisabled();
  await page.evaluate(() => (window as unknown as { restoreNotebookStorage: () => void }).restoreNotebookStorage());
  await page.getByRole('button', { name: 'Retry saving answer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reveal answer', exact: true }).first()).toBeEnabled();
  await page.getByRole('button', { name: 'Reveal answer', exact: true }).first().click();
  await expect(page.getByText('Impulse equals the change in momentum.', { exact: true })).toBeVisible();
  await expect(answer).toHaveAttribute('readonly', '');
  await expect(page.getByRole('textbox', { name: 'Your answer to question 2', exact: true })).toBeEditable();
  await page.getByLabel('Self-check for question 1', { exact: true }).selectOption('needs-review');
  await page.getByRole('button', { name: 'Source: Mechanics', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('Impulse equals the change in momentum.');
  await expect(page.getByRole('button', { name: 'Close preview for Mechanics', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Source: Mechanics', exact: true }).first()).toBeFocused();
  await expect.poll(() => JSON.stringify(state.notebook)).toContain('"reflection":"needs-review"');
  await page.screenshot({ path: info.outputPath('source-quiz-mobile.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
  await page.getByRole('button', { name: 'Regenerate', exact: true }).click();
  await expect(page.getByLabel('Saved quiz version')).toBeVisible();
  await expect(answer).toHaveValue('');
  const versions = page.getByLabel('Saved quiz version');
  const oldId = await versions.locator('option').nth(1).getAttribute('value');
  await versions.selectOption(oldId!);
  await expect(answer).toHaveValue('Change in velocity');
  await page.getByRole('button', { name: 'Reveal answer', exact: true }).first().click();
  await expect(page.getByLabel('Self-check for question 1', { exact: true })).toHaveValue('needs-review');
  await page.getByRole('button', { name: 'Review my working', exact: true }).click();
  await expect(page).toHaveURL(/\/answer-reviewer$/);
  await expect(page.getByLabel('Question', { exact: true })).toHaveValue(/What does impulse measure/);
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('Change in velocity');
  await expect(page.getByText(/Notebook response loaded with source context/)).toBeVisible();
  await expect(page.locator('textarea[name="additional"]')).toHaveValue(/Generated answer \(unverified\)/);
  await expect(page.locator('textarea[name="additional"]')).toHaveValue(/Learner confidence before revealing: 80%/);
  await page.getByLabel('Your answer', { exact: true }).fill('I confused velocity with momentum. My revised reasoning uses mass times velocity.');
  await page.reload();
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(/My revised reasoning uses mass times velocity/);
  await expect(page.getByLabel('Question', { exact: true })).toHaveValue(/What does impulse measure/);
  await expect(page.locator('textarea[name="additional"]')).toHaveValue(/Learner confidence before revealing: 80%/);
  await page.getByRole('button', { name: 'Review my answer', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Confirm before adding to mastery' })).toBeVisible();
  expect(state.reviewRequest?.context).toContain('Source excerpts');
  await expect.poll(() => state.review?.source).toMatchObject({ kind: 'notebook-quiz', questionIndex: '0' });
  expect(state.learnerWrites.filter(item => item.stateType === 'weakness')).toHaveLength(0);
  await page.getByLabel('Verification method').selectOption('teacher-confirmed');
  await page.getByRole('button', { name: 'Confirm mark for mastery', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Added to measured progress', exact: true })).toBeDisabled();
  await expect.poll(() => state.learnerWrites.some(item => item.stateType === 'weakness')).toBe(true);
  await expect.poll(() => state.learnerWrites.some(item => item.stateType === 'retry')).toBe(true);
  const measured = state.learnerWrites.find(item => item.stateType === 'weakness');
  expect(measured?.payload).toMatchObject({ source: 'quiz', evidence: 'measured-v2', verification: { method: 'teacher-confirmed' } });
  await page.getByRole('button', { name: 'Try this question again', exact: true }).click();
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Your answer', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Question', { exact: true })).toHaveValue(/What does impulse measure/);
  await page.getByText('Previous attempt and feedback', { exact: true }).click();
  await expect(page.getByRole('link', { name: 'Open saved original' })).toBeVisible();
  await page.getByLabel('Your answer', { exact: true }).fill('Impulse is the change in momentum, not velocity.');
  await page.getByRole('button', { name: 'Review my answer', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Schedule a retry', exact: true })).toBeVisible();
  const measuredCount = state.learnerWrites.filter(item => item.stateType === 'weakness').length;
  await page.getByRole('link', { name: 'Schedule a retry', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Add a study task' })).toBeVisible();
  await expect(page.getByLabel('Task name', { exact: true })).toHaveValue(/Retry: What does impulse measure/);
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect.poll(() => JSON.stringify(state.planner)).toContain('reviewArtifactId');
  expect(state.learnerWrites.filter(item => item.stateType === 'weakness')).toHaveLength(measuredCount);
  await page.screenshot({ path: info.outputPath('scheduled-retry-mobile.png') });
  await page.reload();
  await page.getByRole('region', { name: 'Planned retries' }).getByRole('button').click();
  await page.getByText('Original attempt and feedback', { exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Impulse is the change in momentum, not velocity.');
  await page.keyboard.press('Escape');
  const stored = await page.evaluate(() => Object.entries(localStorage).filter(([key]) => key.includes('planner')).map(([, value]) => value).join(''));
  expect(stored).toContain('reviewArtifactId');

});

test('late saved-work response does not reopen a closed palette or expose private results after logout', async ({ page }) => {
  const state = await installAccountHarness(page);
  let releaseRead!: () => void;
  state.holdReads = new Promise<void>(resolve => { releaseRead = resolve; });
  const input = page.getByRole('combobox', { name: 'Search VertexED' });
  await input.click();
  await input.fill('impulse');
  await expect(page.getByText(/Loading saved work/)).toBeVisible();
  await input.press('Escape');
  await page.getByRole('button', { name: /^Sign out$/i }).click();
  await expect(page).toHaveURL(/\/login$/);
  state.holdReads = null;
  releaseRead();
  await input.click();
  await input.fill('impulse');
  await expect(page.getByRole('option', { name: /Mechanics revision source/ })).toHaveCount(0);
});

for (const width of [1440, 1024, 390]) {
  test(`dashboard, saved filters and guided start at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await installAccountHarness(page);
    await expect(page.getByRole('link', { name: 'Continue your latest work', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View all saved work', exact: true })).toHaveCount(1);
    await page.screenshot({ path: info.outputPath(`dashboard-${width}.png`), fullPage: true });
    await page.getByRole('link', { name: 'View all saved work', exact: true }).click();
    await page.getByLabel('Search saved work', { exact: true }).fill('momentum');
    await expect(page.getByText('Mechanics revision source', { exact: true })).toBeVisible();
    await page.getByLabel('Work type', { exact: true }).selectOption('review');
    await expect(page.getByText('No loaded work matches these filters.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await page.getByLabel('Save location', { exact: true }).selectOption('device');
    await expect(page.getByText('No loaded work matches these filters.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await page.getByLabel('Sort by', { exact: true }).focus();
    // macOS WebKit uses Option+Tab to include buttons in native traversal.
    await page.keyboard.press(info.project.use.browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
    await expect(page.getByRole('button', { name: 'Open', exact: true })).toBeFocused();
    for (const theme of ['light', 'dark']) {
      const toggle = page.getByRole('button', { name: /^Theme:/ });
      const label = `Theme: ${theme === 'light' ? 'Light' : 'Dark'}. Click to switch.`;
      for (let attempt = 0; attempt < 3 && await toggle.getAttribute('aria-label') !== label; attempt++) await toggle.click();
      await expect(toggle).toHaveAttribute('aria-label', label);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: info.outputPath(`saved-filters-${width}-${theme}.png`), fullPage: true, animations: 'disabled' });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.goto('/study-notebook?start=1');
    await expect(page.getByRole('heading', { name: 'Your first saved attempt' })).toBeVisible();
    await page.getByRole('button', { name: 'Create notebook', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Practice Quiz', exact: true })).toBeVisible();
    await expect(page.locator('.notebook-sources')).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.notebook-studio')).toHaveCSS('opacity', '1');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: info.outputPath(`guided-start-${width}.png`), fullPage: true, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  });
}

test('landing defers optional game and lens, keeps keyboard access and fits each width', async ({ page }, info) => {
  const requested: string[] = [];
  page.on('request', request => requested.push(request.url()));
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.screenshot({ path: info.outputPath(`landing-${width}.png`) });
    await info.attach(`landing-metrics-${width}`, { body: JSON.stringify(await page.evaluate(() => ({ height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth, navigation: performance.getEntriesByType('navigation').map(entry => entry.toJSON()) }))), contentType: 'application/json' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  }
  expect(requested.some(url => /\/RevisionStack-[^/]+\.js/.test(url))).toBe(false);
  expect(requested.some(url => /\/ConceptLens-[^/]+\.js/.test(url))).toBe(false);
  await page.locator('.vh-optional-break > summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.vh-optional-break')).toHaveAttribute('open', '');
  await expect.poll(() => requested.some(url => /\/RevisionStack-[^/]+\.js/.test(url))).toBe(true);
  await page.getByRole('button', { name: 'Open concept lens', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open concept lens', exact: true })).toBeFocused();
});
