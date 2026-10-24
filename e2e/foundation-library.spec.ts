import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { selectTheme } from './theme-controls';

const manifest = JSON.parse(await readFile('public/learning-library/manifest.json', 'utf8'));
const entry = manifest.entries.find((item: { id: string }) => item.id === 'linear-equations');
const lessonBody = await readFile(`public${entry.json}`, 'utf8');

for (const batch of [
  { start: 0, end: 14, screenshotLesson: 'atomic-models' },
  { start: 14, end: 28, screenshotLesson: 'hindi-sentence-structure' },
  { start: 28, end: 42, screenshotLesson: 'words-in-context' },
]) test(`shared lessons ${batch.start + 1} to ${batch.end} render notes, diagrams, guided study, recall and practice`, async ({ page }, info) => {
  test.setTimeout(180000);
  expect(manifest.entries).toHaveLength(90);
  const entries = manifest.entries.filter((item: { id: string }) => !/^(subject|syllabus|unit)-/.test(item.id)).slice(batch.start, batch.end);
  expect(entries).toHaveLength(14);
  await page.route('**/learning-library/*.json', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/learning-library/manifest.json') return route.fulfill({ json: { ...manifest, entries } });
    if (entries.some((entry: { json: string }) => entry.json === path)) return route.fulfill({ contentType: 'application/json', body: await readFile(`public${path}`, 'utf8') });
    return route.continue();
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const entry of entries) {
    const lesson = JSON.parse(await readFile(`public${entry.json}`, 'utf8'));
    await page.goto(`/resources/foundations/${entry.id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(lesson.topic);
    await expect(page.getByText(lesson.scope, { exact: true })).toBeVisible();
    for (const section of lesson.notes) await expect(page.getByRole('heading', { name: section.heading, exact: true })).toBeVisible();
    for (const diagram of lesson.diagrams) await expect(page.getByRole('figure', { name: diagram.title })).toBeVisible();
    await page.getByRole('tab', { name: 'Guided study', exact: true }).click();
    await expect(page.getByRole('heading', { name: `${lesson.teachingSequence.length}. ${lesson.teachingSequence.at(-1).title}`, exact: true })).toBeVisible();
    await page.getByRole('button', { name: `Practise question ${lesson.questions.length}`, exact: true }).click();
    await expect(page.getByRole('heading', { name: `Question ${lesson.questions.length}`, exact: true })).toBeFocused();
    for (const question of lesson.questions.slice(-3)) {
      expect(question.id).toMatch(/^depth-/);
      await expect(page.getByText(question.prompt, { exact: true })).toBeVisible();
    }
    await page.getByLabel(`Your answer to question ${lesson.questions.length}`, { exact: true }).fill(lesson.questions.at(-1).answer);
    await page.getByRole('button', { name: `Check question ${lesson.questions.length}`, exact: true }).click();
    const lastPractice = page.getByRole('article').filter({ has: page.getByRole('heading', { name: `Question ${lesson.questions.length}`, exact: true }) });
    await expect(lastPractice.getByRole('status')).toHaveText('Self-review required. Compare your reasoning with the solution and marking points.');
    await lastPractice.getByText('Solution and marking points', { exact: true }).click();
    await expect(lastPractice.locator('details').getByText(lesson.questions.at(-1).answer, { exact: true })).toBeVisible();
    await page.getByRole('tab', { name: 'Flashcards', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Reveal answer', exact: true })).toHaveCount(entry.flashcardCount);
    await page.getByRole('tab', { name: 'Practise', exact: true }).click();
    await expect(page.getByRole('button', { name: /^Check question \d+$/ })).toHaveCount(entry.questionCount);
    await page.getByRole('tab', { name: 'Revise', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Revision guide', exact: true })).toBeVisible();
  }
  await page.goto(`/resources/foundations/${batch.screenshotLesson}`);
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: info.outputPath(`mapped-${width}-${theme}.png`), animations: 'disabled' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      const applicationDiagram = page.getByRole('figure').last();
      await applicationDiagram.scrollIntoViewIfNeeded();
      await applicationDiagram.screenshot({ path: info.outputPath(`application-diagram-${width}-${theme}.png`), animations: 'disabled' });
    }
  }
  await page.getByRole('tab', { name: 'Practise', exact: true }).click();
  const finalQuestion = page.getByRole('article').last();
  await finalQuestion.getByText('Solution and marking points', { exact: true }).click();
  for (const width of [1440, 1024, 390]) {
    // Keep the entire expanded answer below the real sticky navigation. The
    // normal reader viewport remains separately exercised above at 900px high.
    await page.setViewportSize({ width, height: 1800 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
    await expect.poll(async () => {
      const banner = (await page.getByRole('banner').boundingBox())!;
      await finalQuestion.evaluate((element, offset) => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - offset, behavior: 'instant' }), banner.height + 24);
      const box = (await finalQuestion.boundingBox())!;
      const chrome = (await page.getByRole('banner').boundingBox())!;
      return box.y - (chrome.y + chrome.height);
    }).toBeGreaterThanOrEqual(0);
    const bounds = (await finalQuestion.boundingBox())!;
    const chrome = (await page.getByRole('banner').boundingBox())!;
    expect(bounds.y).toBeGreaterThanOrEqual(chrome.y + chrome.height);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(1800);
    await finalQuestion.screenshot({ path: info.outputPath(`depth-solution-${width}.png`), animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  }
});

test('labelled diagrams and guided modules support keyboard navigation, revision and answer export', async ({ page }, info) => {
  test.setTimeout(90000);
  const selected = manifest.entries.find((item: { id: string }) => item.id === 'arithmetic-sequences');
  const lesson = JSON.parse(await readFile(`public${selected.json}`, 'utf8'));
  await page.route('**/learning-library/manifest.json', route => route.fulfill({ json: { ...manifest, entries: [selected] } }));
  await page.route('**/learning-library/arithmetic-sequences.json', async route => route.fulfill({ contentType: 'application/json', body: await readFile(`public${selected.json}`, 'utf8') }));
  await page.route('**/learning-library/arithmetic-sequences.md', async route => route.fulfill({ contentType: 'text/markdown', body: await readFile(`public${selected.markdown}`, 'utf8') }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/resources/foundations/arithmetic-sequences');
  await expect(page.getByRole('heading', { name: 'Partial syllabus links' })).toBeVisible();
  await page.getByText('Mathematics: analysis and approaches: SL 1.2', { exact: true }).click();
  await expect(page.getByRole('link', { name: 'Official source: International Baccalaureate' })).toHaveAttribute('href', /ibo.org/);
  await expect(page.getByText(/Direct PDF retrieval returned 403/)).toBeVisible();
  const diagram = page.getByRole('figure', { name: lesson.diagrams[0].title });
  await expect(diagram.locator('li')).toHaveCount(4);
  for (const link of lesson.diagrams[0].links) await expect(diagram.getByText(link, { exact: true })).toBeVisible();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await diagram.scrollIntoViewIfNeeded();
      await diagram.screenshot({ path: info.outputPath(`diagram-${width}-${theme}.png`), animations: 'disabled' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    }
  }
  await page.getByRole('tab', { name: 'Notes', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Guided study', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Read: A sequence is an indexed rule', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A sequence is an indexed rule', exact: true })).toBeFocused();
  await page.getByRole('tab', { name: 'Guided study', exact: true }).click();
  await page.getByRole('button', { name: 'Worked example 3', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Example 3', exact: true })).toBeFocused();
  await page.getByRole('tab', { name: 'Guided study', exact: true }).click();
  await page.getByRole('button', { name: 'Practise question 2', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Question 2', exact: true })).toBeFocused();
  await page.getByLabel('Your answer to question 2', { exact: true }).fill('-35');
  await page.getByRole('button', { name: 'Check question 2', exact: true }).click();
  await expect(page.getByText('Numeric value matches.', { exact: false })).toBeVisible();
  await page.getByRole('tab', { name: 'Revise', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Formula sheet and conditions' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry question 2', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Question 2', exact: true })).toBeFocused();
  await expect(page.getByLabel('Your answer to question 2', { exact: true })).toHaveValue('-35');
  const exported = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my answers', exact: true }).click();
  expect(JSON.parse(await readFile((await (await exported).path())!, 'utf8')).answers.q2).toBe('-35');
  const markdown = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download lesson Markdown', exact: true }).click();
  expect(await readFile((await (await markdown).path())!, 'utf8')).toContain('Relationship to next step:');
  await page.getByRole('tab', { name: 'Revise', exact: true }).click();
  await page.getByRole('heading', { name: 'Revision guide', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('revision-390-dark.png'), animations: 'disabled' });
  await page.getByRole('tab', { name: 'Guided study', exact: true }).click();
  await page.getByRole('heading', { name: 'Guided teaching sequence', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('guided-390-dark.png'), animations: 'disabled' });
});

test('public library retains review holds and does not serve draft lessons', async ({ page }) => {
  await page.goto('/resources/foundations');
  await expect(page.getByRole('heading', { name: 'Lessons are awaiting subject review' })).toBeVisible();
  await page.goto('/resources/foundations/linear-equations');
  await expect(page.getByRole('alert')).toContainText('awaiting review');
  const response = await page.request.get('/learning-library/linear-equations.json');
  expect(response.status()).toBe(403);
});

test('isolated lesson fixture supports search, notes, recall, saved practice, exports and recovery', async ({ page }, info) => {
  test.setTimeout(90000);
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(30000);
  const id = '682c92a0-b461-48ce-a6a4-1214c3f2eb88';
  const user = { id, aud: 'authenticated', role: 'authenticated', email: 'library@example.test', email_confirmed_at: '2026-09-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z',
    app_metadata: { provider: 'email' }, user_metadata: { username: 'library', board: 'IB_MYP', grade: 10, subjects: ['Mathematics'] } };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })}.fixture-signature`;
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, route => route.fulfill({ json: user }));
  await page.route('**/api/**', route => route.fulfill({ json: { ok: true, status: 'approved', access: true, items: [], isAdmin: false } }));
  await page.route('**/_vercel/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  // Only this browser receives the draft as a test fixture. No approval register is changed.
  await page.route('**/learning-library/manifest.json', route => route.fulfill({ json: { ...manifest, entries: [entry] } }));
  let fail = true;
  let tamper = false;
  await page.route('**/learning-library/linear-equations.json', route => fail ? route.fulfill({ status: 503, body: 'Unavailable fixture' }) : route.fulfill({ contentType: 'application/json', body: tamper ? `${lessonBody} ` : lessonBody }));
  await page.route('**/learning-library/linear-equations.md', async route => route.fulfill({ contentType: 'text/markdown', body: await readFile(`public${entry.markdown}`, 'utf8') }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/#${new URLSearchParams({ access_token: token, refresh_token: 'fixture-refresh', expires_in: '3600', token_type: 'bearer' })}`);
  await expect(page).toHaveURL(/\/main$/);
  await page.goto('/resources');
  await page.getByRole('link', { name: 'Foundation lessons', exact: true }).click();
  await page.getByLabel('Search foundation lessons').fill('linear');
  await page.getByLabel('Subject', { exact: true }).selectOption('Mathematics');
  await expect(page.getByRole('status').filter({ hasText: '1 available lesson' })).toBeVisible();
  await page.getByRole('link', { name: /Open lesson/ }).click();
  await expect(page.getByRole('alert')).toContainText('could not be loaded');
  fail = false;
  await page.getByRole('button', { name: 'Try loading again' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Linear equations');
  await expect(page.getByRole('heading', { name: 'Worked examples', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Bookmark lesson', exact: true }).click();
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved on this device for this account' })).toBeVisible();
  const notes = page.getByRole('tab', { name: 'Notes', exact: true });
  await notes.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Guided study', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Flashcards', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Reveal answer', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Hide answer', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Add cards to review deck', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'new cards saved' })).toContainText(`${entry.flashcardCount} new cards`);
  await page.getByRole('button', { name: 'Add cards to review deck', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'new cards saved' })).toContainText('0 new cards');
  await page.getByRole('tab', { name: 'Practise', exact: true }).click();
  await page.getByLabel('Your answer to question 1', { exact: true }).fill('5');
  await page.getByRole('button', { name: 'Check question 1', exact: true }).click();
  await expect(page.getByText('Numeric value matches.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Bookmarked', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('tab', { name: 'Practise', exact: true }).click();
  await expect(page.getByLabel('Your answer to question 1', { exact: true })).toHaveValue('5');
  await page.evaluate(() => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) { if (key.startsWith('vertex_foundation:')) throw new DOMException('Full', 'QuotaExceededError'); return write.call(this, key, value); };
    Object.assign(window, { restoreFoundationStorage: () => { Storage.prototype.setItem = write; } });
  });
  await page.getByLabel('Your answer to question 1', { exact: true }).fill('4');
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('not saved');
  await page.evaluate(() => (window as unknown as { restoreFoundationStorage: () => void }).restoreFoundationStorage());
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  const answerDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my answers', exact: true }).click();
  const exportedAnswers = await answerDownload;
  expect(exportedAnswers.suggestedFilename()).toBe('linear-equations-my-work.json');
  const savedAnswers = JSON.parse(await readFile((await exportedAnswers.path())!, 'utf8'));
  expect(savedAnswers).toMatchObject({ lessonId: entry.id, revision: entry.revision, contentHash: entry.contentHash, bookmarked: true });
  expect(Object.values(savedAnswers.answers)).toContain('4');
  const mdDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download lesson Markdown', exact: true }).click();
  const exportedMarkdown = await mdDownload;
  expect(exportedMarkdown.suggestedFilename()).toBe('linear-equations.md');
  expect(await readFile((await exportedMarkdown.path())!, 'utf8')).toBe(await readFile(`public${entry.markdown}`, 'utf8'));
  await page.getByRole('tab', { name: 'Revise', exact: true }).click();
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.reload();
  await page.getByRole('tab', { name: 'Revise', exact: true }).click();
  await expect(page.getByRole('checkbox').first()).toBeChecked();
  await page.getByRole('tab', { name: 'Notes', exact: true }).click();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.locator('.feedback-launcher')).toHaveCSS('position', 'static');
      await expect(page.locator('.vee-launcher')).toHaveCSS('position', 'relative');
      await page.screenshot({ path: info.outputPath(`foundation-${width}-${theme}.png`), animations: 'disabled' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    }
  }
  await page.getByRole('tab', { name: 'Practise', exact: true }).click();
  await page.getByLabel('Your answer to question 1', { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('foundation-390-practice.png'), animations: 'disabled' });
  tamper = true;
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('changed or is incomplete');
  await expect(page.getByRole('tab', { name: 'Practise', exact: true })).toHaveCount(0);
});
