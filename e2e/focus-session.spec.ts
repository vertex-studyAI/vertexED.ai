import { expect, test, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';
import { assertCalculatorKeyContrast, assertFocusActionHitTargets, assertFocusFooterHitTargets, assertFocusInitialHitTargets } from './focus-visual-checks';

const accountA = '53f1dfde-ec1a-4dbb-9d68-7c0c08250b19';
const accountB = '0bbc4c5a-01c3-4fc3-bcf8-fe5ebff64c8b';
const focusKey = (id = accountA) => `vertex_content:${id}:focus_session`;
const epoch = Date.parse('2026-10-16T10:00:00Z');
const plannerTask = { id: 'focus-task', 'task name': 'Circuit retrieval', date: '10/16/2026', 'start time': '04:00 PM', 'task duration': 30, completed: false };

async function harness(page: Page) {
  let account = accountA;
  const learner = () => ({ id: account, aud: 'authenticated', role: 'authenticated', email: `${account}@example.test`,
    email_confirmed_at: '2026-09-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { username: 'focusfixture', board: 'IB_MYP', grade: 10, subjects: ['Physics'] } });
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/auth/v1/token') {
      account = route.request().postDataJSON().email === 'second@example.test' ? accountB : accountA;
      const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: account, exp: Math.floor(Date.now() / 1000) + 86400, role: 'authenticated' })}.fixture-signature`;
      return route.fulfill({ json: { access_token: token, refresh_token: 'fixture-refresh', expires_in: 86400, token_type: 'bearer', user: learner() } });
    }
    if (path === '/auth/v1/user') return route.fulfill({ json: learner() });
    if (path === '/auth/v1/logout') return route.fulfill({ status: 204, body: '' });
    if (path === '/rest/v1/profiles') return route.fulfill({ json: { ...learner(), full_name: 'Focus learner' } });
    return route.fulfill({ status: 400, json: { message: 'Unexpected fixture request' } });
  });
  await page.route('**/api/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/user-content' && url.searchParams.get('kind') === 'planner') {
      return route.fulfill({ json: { items: [{ id: 'f74fb228-907a-4bef-bce5-f9ea52dcd00b', kind: 'planner', payload: { tasks: [plannerTask], mode: 'Day' }, updated_at: new Date(epoch).toISOString() }], nextOffset: null } });
    }
    return route.fulfill({ json: { ok: true, status: 'approved', access: true, items: [], nextOffset: null, isAdmin: false } });
  });
  await page.route('**/_vercel/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await signIn(page);
}

async function signIn(page: Page, email = 'first@example.test') {
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('fixture-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
  await page.goto('/study-zone?focus=timer');
  await expect(page.getByRole('region', { name: 'Focus session controls', exact: true })).toBeVisible();
}

for (const width of [1440, 1024, 390]) {
  test(`focus task, pause, refresh, notes and completion work at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.setFixedTime(epoch);
    await harness(page);
    const focus = page.getByRole('region', { name: 'Focus session controls', exact: true });
    await focus.getByLabel('Planner task (optional)', { exact: false }).selectOption('focus-task');
    await expect(focus.getByLabel('Task for this block', { exact: true })).toHaveValue('Circuit retrieval');
    await focus.getByRole('textbox', { name: 'Session notes', exact: true }).fill('Retry conventional current without notes.');
    await focus.getByRole('button', { name: 'Start', exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.clock.setFixedTime(epoch + 35_000);
    await expect(focus.getByRole('timer')).toHaveText('00:29:25');
    await focus.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.clock.setFixedTime(epoch + 90_000);
    await expect(focus.getByRole('timer')).toHaveText('00:29:25');
    await page.reload();
    await expect(focus.getByRole('timer')).toHaveText('00:29:25');
    await expect(focus.getByRole('textbox', { name: 'Session notes', exact: true })).toHaveValue('Retry conventional current without notes.');
    await page.evaluate(({ id, at }) => localStorage.setItem(`vertex_content:${id}:quick_notes`, JSON.stringify([
      { id: 'circuit-note', title: 'Circuit summary', content: '<p>Conventional current direction.</p>', updatedAt: at },
      { id: 'energy-note', title: 'Energy summary', content: '<p>Energy transfers between stores.</p>', updatedAt: at },
    ])), { id: accountA, at: new Date(epoch).toISOString() });
    // The focus query scrolls to its tool after mount. Use the normal route for
    // stable full-page captures while retaining the same persisted session.
    await page.goto('/study-zone');
    await expect(focus.getByRole('timer')).toHaveText('00:29:25');
    const selectedNote = page.getByRole('button', { name: /^Circuit summary/ });
    const otherNote = page.getByRole('button', { name: /^Energy summary/ });
    const noteCard = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Quick Notes', exact: true }) });
    await expect(noteCard).toHaveCount(1);
    await selectedNote.click();
    await expect(page.getByPlaceholder('Exam prep outline', { exact: true })).toHaveValue('Circuit summary');
    await expect(selectedNote).toHaveAttribute('data-active', 'true');
    await expect(otherNote).toHaveAttribute('data-active', 'false');
    await expect(focus.getByRole('button', { name: 'Timer', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(focus.getByRole('button', { name: 'Stopwatch', exact: true })).toHaveAttribute('aria-pressed', 'false');
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await expect.poll(() => focus.getByRole('group', { name: 'Timer mode', exact: true }).getByRole('button').evaluateAll(buttons => {
        const selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true');
        const unselected = buttons.filter(button => button.getAttribute('aria-pressed') === 'false');
        return !!selected && unselected.length === 2 && unselected.every(button => getComputedStyle(button).backgroundColor !== getComputedStyle(selected).backgroundColor);
      })).toBe(true);
      await expect.poll(async () => {
        const colours = await Promise.all([selectedNote, otherNote].map(note => note.evaluate(button => getComputedStyle(button).backgroundColor)));
        return colours[0] !== colours[1];
      }).toBe(true);
      await expect.poll(() => noteCard.evaluate(card => {
        const bounds = card.getBoundingClientRect();
        const style = getComputedStyle(card);
        const left = bounds.left + parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth);
        const right = bounds.right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth);
        return Array.from(card.querySelectorAll('button, input, [contenteditable="true"]')).filter(control => {
          const rect = control.getBoundingClientRect();
          return rect.left < left - 1 || rect.right > right + 1;
        }).map(control => control.getAttribute('aria-label') || control.getAttribute('placeholder') || control.textContent?.trim().slice(0, 40) || control.tagName);
      }), 'Quick Notes controls stay inside the card padding').toEqual([]);
      await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await assertFocusInitialHitTargets(page);
      await page.screenshot({ path: info.outputPath(`focus-viewport-${width}-${theme}.png`), animations: 'disabled' });
      await page.screenshot({ path: info.outputPath(`focus-${width}-${theme}.png`), fullPage: true, animations: 'disabled' });
      await assertFocusActionHitTargets(focus);
      const calculator = page.locator('section.glass-panel').filter({ has: page.locator('.zone-keypad') });
      await expect(calculator).toHaveCount(1);
      const contrast = await assertCalculatorKeyContrast(calculator, theme);
      await info.attach(`calculator-contrast-${width}-${theme}`, { body: JSON.stringify(contrast), contentType: 'application/json' });
      await calculator.screenshot({ path: info.outputPath(`calculator-${width}-${theme}.png`), animations: 'disabled' });
      await assertFocusFooterHitTargets(page);
      await page.screenshot({ path: info.outputPath(`focus-footer-${width}-${theme}.png`), animations: 'disabled' });
    }
    await focus.getByRole('button', { name: 'Resume', exact: true }).click();
    await page.clock.setFixedTime(epoch + 100_000);
    await focus.getByRole('button', { name: 'Finish block', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Focus completion summary' })).toContainText('00:00:45');
    await page.reload();
    await expect(page.getByRole('region', { name: 'Focus completion summary' })).toContainText('Retry conventional current');
    const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), focusKey());
    expect(stored.history).toHaveLength(1);
    expect(stored.history[0].taskId).toBe('focus-task');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    const tasks = await page.evaluate(id => JSON.parse(localStorage.getItem(`vertex_planner:${id}:tasks`)!), accountA);
    expect(tasks[0].completed).toBe(false);
  });
}

test('Pomodoro restores after time away and starts a break only on request', async ({ page }) => {
  await page.clock.setFixedTime(epoch);
  await harness(page);
  const focus = page.getByRole('region', { name: 'Focus session controls', exact: true });
  await focus.getByRole('button', { name: 'Pomodoro', exact: true }).click();
  await focus.getByLabel('Minutes', { exact: true }).fill('0');
  await focus.getByLabel('Seconds', { exact: true }).fill('4');
  await focus.getByRole('button', { name: 'Start', exact: true }).click();
  await page.goto('/resources');
  await page.clock.setFixedTime(epoch + 3_600_000);
  await page.goto('/study-zone?focus=timer');
  await expect(focus.getByText('Focus block complete', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).history.length, focusKey())).toBe(1);
  await focus.getByRole('button', { name: 'Prepare break', exact: true }).click();
  await expect(focus.getByRole('button', { name: 'Start break', exact: true })).toBeVisible();
  await focus.getByRole('button', { name: 'Start break', exact: true }).click();
  await page.clock.setFixedTime(epoch + 7_200_000);
  await expect(focus.getByText('Break complete', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).history.length, focusKey())).toBe(1);
});

test('focus storage failures keep notes exportable and can retry safely', async ({ page }) => {
  await harness(page);
  await page.evaluate(key => {
    const host = window as typeof window & { focusWriteBlocked?: boolean };
    host.focusWriteBlocked = true;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key && host.focusWriteBlocked) throw new DOMException('Fixture failure', 'QuotaExceededError');
      return original.call(this, name, value);
    };
  }, focusKey());
  const focus = page.getByRole('region', { name: 'Focus session controls', exact: true });
  await focus.getByRole('textbox', { name: 'Session notes', exact: true }).fill('Keep this unsaved reasoning.');
  await expect(focus.getByRole('alert')).toContainText('only in this open page');
  await expect(focus.getByRole('textbox', { name: 'Session notes', exact: true })).toHaveValue('Keep this unsaved reasoning.');
  const download = page.waitForEvent('download');
  await focus.getByRole('button', { name: 'Export focus data', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('vertexed-focus-session.json');
  await page.evaluate(() => { (window as typeof window & { focusWriteBlocked?: boolean }).focusWriteBlocked = false; });
  await focus.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(focus.getByRole('alert')).toHaveCount(0);
  await page.reload();
  await expect(focus.getByRole('textbox', { name: 'Session notes', exact: true })).toHaveValue('Keep this unsaved reasoning.');
});

test('corrupt focus data is preserved and account switching does not expose prior notes', async ({ page }) => {
  await harness(page);
  const focus = page.getByRole('region', { name: 'Focus session controls', exact: true });
  await focus.getByRole('textbox', { name: 'Session notes', exact: true }).fill('Account A private focus notes.');
  await focus.getByRole('button', { name: 'Start', exact: true }).click();
  await signIn(page, 'second@example.test');
  await expect(focus.getByRole('textbox', { name: 'Session notes', exact: true })).toHaveValue('');
  await expect(focus.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).current.notes, focusKey())).toBe('Account A private focus notes.');
  await page.evaluate(key => localStorage.setItem(key, '{broken-focus'), focusKey(accountB));
  await page.reload();
  await expect(focus.getByRole('alert')).toContainText('Original device data is preserved');
  await expect(focus.getByRole('timer')).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), focusKey(accountB))).toBe('{broken-focus');
});
