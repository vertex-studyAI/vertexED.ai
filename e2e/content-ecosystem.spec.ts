import { expect, test } from '@playwright/test';
import { notebookRequestKey, STUDY_SET_VERSION } from '../contracts/notebookStudySet.js';
import { selectTheme } from './theme-controls';

test('topic study sets resume, persist, retain edited versions and feed study mode', async ({ page }, info) => {
  const id = 'b65672a0-b461-48ce-a6a4-1214c3f2eb88';
  const user = { id, aud: 'authenticated', role: 'authenticated', email: 'study-set@example.test',
    email_confirmed_at: '2026-09-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z',
    app_metadata: { provider: 'email' }, user_metadata: { username: 'studyset', board: 'IB_MYP', grade: 10, subjects: ['Mathematics'] } };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })}.fixture-signature`;
  let failQuiz = true;
  let artifact: Record<string, unknown> | null = null;
  const calls: string[] = [];
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, route => route.fulfill({ json: user }));
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/user-content') {
      if (route.request().method() === 'POST') {
        artifact = { ...route.request().postDataJSON(), id: '707d3f91-00e7-4fba-bd1e-24de54623388', updated_at: new Date().toISOString() };
        return route.fulfill({ json: { item: artifact } });
      }
      return route.fulfill({ json: { items: artifact ? [artifact] : [], nextOffset: null } });
    }
    if (path === '/api/notebook') {
      const input = route.request().postDataJSON(); calls.push(input.mode);
      if (input.mode === 'quiz' && failQuiz) return route.fulfill({ status: 502, json: { error: 'Fixture provider unavailable. Completed resources are preserved.' } });
      const sourceIds = [input.sources[0].id];
      return route.fulfill({ json: { mode: input.mode, title: input.mode === 'lesson' ? 'Linear equations' : input.mode,
        content: `## Equality\nApply the same operation to both sides.\n\n## Worked example\nFor x + 2 = 5, subtract 2 from both sides to obtain x = 3. [Source: ${sourceIds[0]}]`,
        generatedAt: new Date().toISOString(), generation: { version: STUDY_SET_VERSION, requestKey: await notebookRequestKey(input), model: 'fixture', factualStatus: 'unreviewed', curriculum: input.curriculum },
        sources: input.sources,
        ...(input.mode === 'flashcards' ? { flashcards: [{ front: 'Solve x + 2 = 5.', back: 'x = 3', sourceIds }] } : {}),
        ...(input.mode === 'quiz' ? { quiz: [{ id: 'q1', question: 'Solve x + 2 = 5.', type: 'short', options: [], answer: 'x = 3', explanation: 'Subtract 2 from both sides.', marks: 1, sourceIds }] } : {}),
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
  await page.getByLabel('Source title', { exact: true }).fill('My equation notes');
  await page.getByLabel('Source content', { exact: true }).fill('To solve x + 2 = 5, subtract 2 from both sides. This gives x = 3.');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByText('Course and syllabus details', { exact: true }).click();
  await page.getByLabel('Curriculum', { exact: true }).selectOption('SAT');
  await page.getByLabel('Board or institution').fill('College Board');
  await page.getByLabel('Syllabus version or exam year').fill('2026');
  await page.getByLabel('Subject', { exact: true }).fill('Math');
  await page.getByLabel('Topic', { exact: true }).fill('Linear equations');
  const create = page.getByRole('button', { name: 'Create or continue study set', exact: true });
  await create.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toContainText('Fixture provider unavailable');
  expect(calls).toEqual(['lesson', 'flashcards', 'quiz']);
  await expect.poll(() => JSON.stringify(artifact)).toContain('notebook-study-set-v1');
  await page.reload();
  failQuiz = false;
  await create.click();
  await expect(page.getByText('Study set ready.', { exact: false })).toBeVisible();
  expect(calls).toEqual(['lesson', 'flashcards', 'quiz', 'quiz', 'study-guide']);
  await create.click();
  await expect(page.getByText('Study set ready.', { exact: false })).toBeVisible();
  expect(calls.length).toBe(5);
  await page.getByRole('button', { name: 'Topic notes', exact: true }).click();
  await page.getByText('Edit a copy of these notes', { exact: true }).click();
  await page.getByLabel('Resource text (Markdown)').fill('## My correction\nSubstitute x = 3 into the original equation to check both sides equal 5.');
  await page.getByRole('button', { name: 'Save edited copy' }).click();
  await expect(page.getByRole('region', { name: 'Generated Topic notes' })).toContainText('My correction');
  await expect(page.getByLabel('Saved resource version').locator('option')).toHaveCount(2);
  await expect.poll(() => JSON.stringify(artifact)).toContain('My correction');
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('heading', { name: 'Create a topic study set' }).scrollIntoViewIfNeeded();
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await page.screenshot({ path: info.outputPath(`study-set-${width}-${theme}.png`), animations: 'disabled' });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  }
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
  await page.getByRole('button', { name: 'Add 1 to SR deck', exact: true }).click();
  await expect(page.getByText('1 cards added to SR deck', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Practice Quiz', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Generated Practice Quiz' })).toContainText('Solve x + 2 = 5.');
  await page.reload();
  await page.getByRole('button', { name: 'Topic notes', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Generated Topic notes' })).toContainText('My correction');
});
