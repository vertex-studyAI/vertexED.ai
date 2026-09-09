import { expect, test, type Page } from '@playwright/test';

// Synthetic SDK/network fixtures only. Never paste real OAuth URLs into tests.
const id = 'b65672a0-b461-48ce-a6a4-1214c3f2eb7b';
const user = { id, aud: 'authenticated', role: 'authenticated', email: 'auth-return@example.test',
  email_confirmed_at: '2026-09-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z',
  app_metadata: { provider: 'google', providers: ['google'] },
  user_metadata: { username: 'callbackfixture', board: 'IB_MYP', grade: 10, subjects: ['Biology'] },
};
function token() {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })}.fixture-signature`;
}
function fragment(type = '') {
  return `#${new URLSearchParams({ access_token: token(), refresh_token: 'fixture-refresh', expires_in: '3600', token_type: 'bearer', ...(type ? { type } : {}) })}`;
}
async function harness(page: Page, rejectToken = false) {
  await page.route('https://vertexed-e2e.supabase.co/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/auth/v1/user') return route.fulfill({ status: rejectToken ? 401 : 200, json: rejectToken ? { code: 'bad_jwt', message: 'fixture rejected' } : user });
    if (path === '/rest/v1/profiles') return route.fulfill({ json: { ...user, full_name: 'Test learner' } });
    return route.fulfill({ status: 400, json: { message: 'Unexpected fixture request' } });
  });
  await page.route('**/api/**', route => route.fulfill({ json: { ok: true, status: 'approved', items: [] } }));
  await page.route('**/_vercel/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
}

test('Apex opens the existing tutor without duplicate launchers and restores focus', async ({ page }) => {
  await harness(page);
  await page.goto(`/${fragment()}`);
  await expect(page).toHaveURL(/\/main$/);
  const launcher = page.getByRole('button', { name: 'Open Apex study shortcuts' });
  await expect(launcher).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open AI tutor', exact: true })).toHaveCount(0);
  await launcher.click();
  await page.getByRole('button', { name: 'Ask the AI tutor', exact: true }).click();
  const tutor = page.getByRole('dialog', { name: 'AI tutor', exact: true });
  await expect(tutor).toBeVisible();
  await expect(tutor).toBeFocused();
  await expect(launcher).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(tutor).toHaveCount(0);
  await expect(launcher).toBeFocused();
  await launcher.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hide Apex', exact: true }).click();
  const fallback = page.getByRole('button', { name: 'Open AI tutor', exact: true });
  await expect(fallback).toBeVisible();
  await fallback.click();
  await expect(tutor).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(fallback).toBeFocused();
});

test('manual planner works without AI, preserves midnight, rejects clashes and stays readable', async ({ page }) => {
  await harness(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let aiRequests = 0;
  await page.route('**/api/planner', route => { aiRequests++; return route.fulfill({ status: 503, json: { error: 'AI is unavailable in this fixture. Use manual entry.' } }); });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`/${fragment()}`);
  await expect(page).toHaveURL(/\/main$/);
  await page.goto('/planner');
  const newTask = page.getByRole('button', { name: 'New Task', exact: true });
  await expect(newTask).toBeEnabled();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await newTask.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Task name', { exact: true })).toBeFocused();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(theme); }, theme);
      await page.screenshot({ path: `test-results/planner-manual-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
      const bounds = await dialog.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      for (const input of await dialog.locator('input').all()) {
        const field = await input.boundingBox();
        expect(field!.width).toBeGreaterThan(120);
        expect(field!.x + field!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width);
      }
      expect(await dialog.getByLabel('Date', { exact: true }).evaluate(input => getComputedStyle(input).colorScheme)).toBe(theme);
    }
    await page.keyboard.press('Escape');
    await expect(newTask).toBeFocused();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await newTask.click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Task name', { exact: true }).fill('Cell transport recall');
  await dialog.getByLabel('Start time', { exact: true }).fill('10:00');
  await dialog.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect.poll(() => page.evaluate(id => JSON.parse(localStorage.getItem(`vertex_planner:${id}:tasks`) || '[]').length, id)).toBe(1);
  await page.reload();
  const task = page.getByRole('button', { name: /^Edit Cell transport recall, starting/ });
  await expect(task).toBeVisible();
  await task.focus();
  await page.keyboard.press('Delete');
  await expect(task).toBeVisible();
  await page.keyboard.press('Enter');
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Start time', { exact: true }).fill('00:00');
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const heading = await dialog.getByRole('heading', { name: 'Edit task' }).boundingBox();
    const close = await dialog.getByRole('button', { name: 'Close edit task dialog' }).boundingBox();
    expect(close!.x).toBeGreaterThan(heading!.x + heading!.width);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(theme); }, theme);
      await page.screenshot({ path: `test-results/planner-edit-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => page.evaluate(id => JSON.parse(localStorage.getItem(`vertex_planner:${id}:tasks`) || '[]')[0]?.['start time'], id)).toBe('12:00 AM');
  await newTask.click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Task name', { exact: true }).fill('Conflicting revision');
  await dialog.getByLabel('Start time', { exact: true }).fill('00:30');
  await dialog.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('overlaps');
  expect(aiRequests).toBe(0);
  await dialog.getByRole('button', { name: 'AI suggestion', exact: true }).click();
  await dialog.getByRole('button', { name: 'Suggest and add' }).click();
  await expect(dialog.getByRole('alert')).toContainText('AI is unavailable');
  await dialog.getByRole('button', { name: 'Manual entry', exact: true }).click();
  await dialog.getByLabel('Start time', { exact: true }).fill('01:00');
  await dialog.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect.poll(() => page.evaluate(id => JSON.parse(localStorage.getItem(`vertex_planner:${id}:tasks`) || '[]').length, id)).toBe(2);
  const complete = page.getByRole('button', { name: 'Mark Conflicting revision complete' });
  await complete.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => page.evaluate(id => JSON.parse(localStorage.getItem(`vertex_planner:${id}:tasks`) || '[]').length, id)).toBe(1);
  expect(aiRequests).toBe(1);
  expect(errors).toEqual([]);
});

test('malformed saved records pause recovery instead of rendering broken study data', async ({ page }) => {
  await harness(page);
  await page.goto(`/${fragment()}`);
  await expect(page).toHaveURL(/\/main$/);
  await page.evaluate(id => {
    localStorage.setItem(`vertex_planner:${id}:tasks`, '[null]');
    localStorage.setItem(`vertex_notebooks:${id}:data`, '[null]');
    localStorage.setItem(`vertex_content:${id}:exam_prep_history`, '[null]');
  }, id);
  await page.goto('/planner');
  await expect(page.getByRole('button', { name: 'New Task' })).toBeDisabled();
  await expect(page.getByRole('alert')).toContainText('Original device data is preserved');
  await page.goto('/study-notebook');
  await expect(page.getByRole('button', { name: 'New notebook' })).toBeDisabled();
  await page.goto('/exam-prep');
  await expect(page.getByRole('alert').filter({ hasText: 'Session history could not be read' })).toBeVisible();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(theme); }, theme);
      await page.getByRole('alert').filter({ hasText: 'Session history could not be read' }).screenshot({ path: `test-results/exam-history-${theme}-${width}.png`, animations: 'disabled' });
    }
  }
  expect(await page.evaluate(id => localStorage.getItem(`vertex_content:${id}:exam_prep_history`), id)).toBe('[null]');
});

test('late AI week suggestions cannot overwrite a plan edited while the request was pending', async ({ page }) => {
  await harness(page);
  let release: () => void = () => {};
  const responseReady = new Promise<void>(resolve => { release = resolve; });
  let started = false;
  await page.route('**/api/planner', async route => {
    started = true;
    await responseReady;
    await route.fulfill({ json: { tasks: [{ 'task name': 'Stale suggestion', date: '09/10/2026', 'start time': '10:00 AM', 'task duration': 60 }] } });
  });
  await page.goto(`/${fragment()}`);
  await expect(page).toHaveURL(/\/main$/);
  await page.goto('/planner');
  await page.getByRole('button', { name: 'AI week plan' }).click();
  await expect.poll(() => started).toBe(true);
  await page.getByRole('button', { name: 'New Task', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Task name', { exact: true }).fill('My own plan');
  await dialog.getByRole('button', { name: 'Add task', exact: true }).click();
  release();
  await expect(page.getByRole('alert')).toContainText('Your plan changed');
  await expect(page.getByRole('button', { name: 'AI week plan' })).toBeEnabled();
  const tasks = await page.evaluate(id => JSON.parse(localStorage.getItem(`vertex_planner:${id}:tasks`) || '[]'), id);
  expect(tasks.map((task: Record<string, string>) => task['task name'])).toEqual(['My own plan']);
});

test('Site URL provider errors render a clean, accessible callback at each viewport', async ({ page }) => {
  await harness(page);
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?error=access_denied&error_description=private-fixture');
    await expect(page.getByRole('alert')).toContainText('Authentication could not be completed');
    await expect(page).toHaveURL(/\/auth\/callback$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.getByRole('button', { name: 'Back to login' }).focus();
    await expect(page.getByRole('button', { name: 'Back to login' })).toBeFocused();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(theme); }, theme);
      await page.screenshot({ path: `test-results/auth-error-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
    }
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/login$/);
  }
});

test('rejected implicit token reaches a clean error instead of falling back to the landing', async ({ page }) => {
  await harness(page, true);
  await page.goto(`/${fragment()}`);
  await expect(page.getByRole('alert')).toContainText('link could not be verified');
  await expect(page).toHaveURL(/\/auth\/callback$/);
});

test('valid implicit return at Site URL restores the learner session', async ({ page }) => {
  await harness(page);
  await page.goto(`/${fragment()}`);
  await expect(page).toHaveURL(/\/main$/);
  await expect(page.getByRole('heading', { name: 'Your study desk' })).toBeVisible();
});

test('recovery event survives delayed callback code loading', async ({ page }) => {
  await harness(page);
  await page.route('**/assets/AuthCallback-*.js', async route => {
    // Deliberately let SDK initialization emit PASSWORD_RECOVERY before the lazy route mounts.
    await new Promise(resolve => setTimeout(resolve, 700));
    await route.continue();
  });
  await page.goto(`/auth/callback?recovery=1${fragment('recovery')}`);
  await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/callback\?recovery=1$/);
});

test('corrupt notebook data shows recovery controls without erasing device bytes', async ({ page }) => {
  await harness(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(({ id }) => localStorage.setItem(`vertex_notebooks:${id}:data`, '{broken-fixture'), { id });
  await page.goto(`/${fragment()}`);
  await expect(page).toHaveURL(/\/main$/);
  await page.goto('/study-notebook');
  await expect(page.getByRole('alert')).toContainText('Original device data is preserved');
  await expect(page.getByRole('button', { name: 'New notebook' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeDisabled();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('link', { name: 'Open account data export' }).focus();
    await expect(page.getByRole('link', { name: 'Open account data export' })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(theme); }, theme);
      await page.screenshot({ path: `test-results/notebook-recovery-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
    }
  }
  expect(await page.evaluate(id => localStorage.getItem(`vertex_notebooks:${id}:data`), id)).toBe('{broken-fixture');
});

test('corrupt planner data pauses editing and exposes recovery instead of an endless loader', async ({ page }) => {
  await harness(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/${fragment()}`);
  await expect(page).toHaveURL(/\/main$/);
  await page.evaluate(id => localStorage.setItem(`vertex_planner:${id}:tasks`, '{broken-planner-fixture'), id);
  await page.goto('/planner');
  await expect(page.getByRole('alert')).toContainText('Planner recovery needs attention');
  await expect(page.getByRole('button', { name: 'New Task' })).toBeDisabled();
  await expect(page.getByText('Loading your saved planner…')).toHaveCount(0);
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: 'Reload cloud copy' }).focus();
    await expect(page.getByRole('button', { name: 'Reload cloud copy' })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    const recovery = await page.getByRole('alert').boundingBox();
    expect(recovery!.width).toBeGreaterThan(width < 500 ? width * 0.7 : 400);
    for (const control of await page.locator('.planner-header button').all()) {
      const bounds = await control.boundingBox();
      if (bounds) {
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
      }
    }
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.classList.remove('light', 'dark'); document.documentElement.classList.add(theme); }, theme);
      await page.screenshot({ path: `test-results/planner-recovery-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
    }
  }
  expect(await page.evaluate(id => localStorage.getItem(`vertex_planner:${id}:tasks`), id)).toBe('{broken-planner-fixture');
});
