import { expect, test, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';
const learnerId = 'f40db66b-1b55-4ab8-88d0-14a9ba476c16';

async function account(page: Page) {
  const user = { id: learnerId, aud: 'authenticated', role: 'authenticated', email: 'learner@example.test', app_metadata: { provider: 'email' }, user_metadata: { board: 'IB_DP', grade: 12, subjects: ['Physics'], username: 'courseworklearner' }, created_at: '2026-10-16T00:00:00Z', identities: [] };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: learnerId, exp: 2103836400, role: 'authenticated' })}.test-only`;
  const state = { planner: null as Record<string, any> | null, offline: false };
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, async route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/auth/v1/token' ? { access_token: token, token_type: 'bearer', expires_in: 315360000, refresh_token: 'test-refresh', user }
      : path === '/auth/v1/user' ? user : path === '/rest/v1/profiles' ? { id: learnerId, email: user.email, board: 'IB_DP', grade: 12, subjects: ['Physics'] } : {};
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url()); let body: unknown = {}; let status = 200;
    if (url.pathname === '/api/waitlist-status') body = { status: 'approved', access: true };
    else if (url.pathname === '/api/admin-status') body = { isAdmin: false };
    else if (url.pathname === '/api/learner-state') body = { contractVersion: 'vertexed.learner-state.v1', items: [] };
    else if (url.pathname === '/api/user-content') {
      if (state.offline) { status = 503; body = { error: 'Test cloud unavailable' }; }
      else if (route.request().method() === 'POST') {
        const write = route.request().postDataJSON();
        state.planner = { id: 'be70a8b1-c055-4129-9653-ea50a783dbe9', kind: 'planner', title: 'Study planner', payload: write.payload, updated_at: new Date().toISOString() };
        body = { item: state.planner };
      } else body = { items: url.searchParams.get('kind') === 'planner' && state.planner ? [state.planner] : [], nextOffset: null };
    }
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
  await page.goto('/planner');
  await expect(page.getByRole('button', { name: 'Add coursework', exact: true })).toBeVisible();
  return state;
}

for (const width of [1440, 1024, 390]) test(`coursework evidence, deadlines, recovery and keyboard at ${width}`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const state = await account(page);
  const add = page.getByRole('button', { name: 'Add coursework', exact: true });
  await add.focus(); await page.keyboard.press('Enter');
  let dialog = page.getByRole('dialog', { name: 'Add coursework', exact: true });
  await expect(dialog.getByLabel('Coursework title', { exact: true })).toBeFocused();
  await dialog.getByLabel('Coursework title', { exact: true }).fill('Cooling investigation');
  await dialog.getByLabel('Subject', { exact: true }).fill('Physics');
  await dialog.getByLabel('Course and level (optional)', { exact: true }).fill('IB DP Physics HL');
  await dialog.getByLabel('Final deadline', { exact: true }).fill('2028-11-20');
  await dialog.getByRole('button', { name: 'Save coursework', exact: true }).click();
  const project = page.getByRole('article', { name: 'Cooling investigation', exact: true });
  await project.getByRole('button', { name: 'Add milestone', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Milestone and revision', exact: true });
  await dialog.getByLabel('Milestone title', { exact: true }).fill('Check the sampling interval');
  await dialog.getByLabel('Milestone deadline', { exact: true }).fill('2028-11-10');
  await dialog.getByLabel('Evidence and source locations', { exact: true }).fill('Lab notebook, page 3: temperature readings.');
  await dialog.getByLabel('Add a revision note', { exact: true }).fill('Repeat the trial with a shorter interval.');
  await dialog.getByRole('combobox', { name: 'Status', exact: true }).selectOption('in-progress');
  await dialog.getByRole('button', { name: 'Save milestone', exact: true }).click();
  await expect.poll(() => state.planner?.payload?.coursework?.[0]?.milestones?.[0]?.revisions?.length).toBe(1);
  await page.reload();
  await expect(project.getByRole('heading', { name: 'Check the sampling interval', exact: true })).toBeVisible();
  await project.getByText('Evidence and source locations', { exact: true }).click();
  await expect(project.getByText('Lab notebook, page 3: temperature readings.', { exact: true })).toBeVisible();
  for (const theme of ['light', 'dark'] as const) {
    await selectTheme(page, theme);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    await page.screenshot({ path: info.outputPath(`coursework-${width}-${theme}.png`), fullPage: true, animations: 'disabled' });
  }
  await project.getByRole('button', { name: 'Update Check the sampling interval', exact: true }).click();
  await expect(page.getByLabel('Milestone title', { exact: true })).toBeFocused();
  await page.screenshot({ path: info.outputPath(`milestone-dialog-${width}.png`), animations: 'disabled' });
  await page.keyboard.press('Escape');
  await expect(project.getByRole('button', { name: 'Update Check the sampling interval', exact: true })).toBeFocused();
  await project.getByRole('button', { name: 'Schedule Check the sampling interval', exact: true }).click();
  const task = page.getByRole('dialog', { name: 'Add a study task' });
  await expect(task.getByLabel('Task name', { exact: true })).toHaveValue('Cooling investigation: Check the sampling interval');
  await task.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect.poll(() => state.planner?.payload?.tasks?.[0]?.dueDate).toBe('2028-11-10');
  await page.goto('/main');
  await expect(page.getByRole('region', { name: 'Coursework deadlines' })).toContainText('Cooling investigation: Check the sampling interval');
  await page.goto('/planner'); state.offline = true;
  await project.getByRole('button', { name: 'Update Check the sampling interval', exact: true }).click();
  await page.getByLabel('Add a revision note', { exact: true }).fill('Completed repeated readings while cloud sync was unavailable.');
  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('complete');
  await page.getByRole('button', { name: 'Save milestone', exact: true }).click();
  await page.reload();
  await expect(project).toContainText('1 of 1 milestones marked complete by you');
  await project.getByText('2 revision notes', { exact: true }).click();
  await expect(project).toContainText('Completed repeated readings while cloud sync was unavailable.');
  await project.getByRole('button', { name: 'Remove coursework', exact: true }).click();
  await project.getByRole('button', { name: 'Keep coursework', exact: true }).click();
  await expect(project).toBeVisible();
  await project.getByRole('button', { name: 'Edit coursework', exact: true }).click();
  const editProject = page.getByRole('dialog', { name: 'Edit coursework', exact: true });
  await editProject.getByRole('combobox', { name: 'Submission status', exact: true }).selectOption('submitted');
  await editProject.getByRole('button', { name: 'Save coursework', exact: true }).click();
  await page.goto('/main');
  await expect(page.getByRole('region', { name: 'Coursework deadlines' })).toHaveCount(0);
  await page.goto('/planner');
  await project.getByRole('button', { name: 'Remove milestone Check the sampling interval', exact: true }).click();
  await project.getByRole('button', { name: 'Keep milestone', exact: true }).click();
  await expect(project.getByRole('heading', { name: 'Check the sampling interval', exact: true })).toBeVisible();
  await project.getByRole('button', { name: 'Remove milestone Check the sampling interval', exact: true }).click();
  await project.getByRole('button', { name: 'Confirm milestone removal', exact: true }).click();
  await expect(project).toContainText('0 of 0 milestones marked complete by you');
  await expect(page.getByRole('button', { name: 'Export this plan', exact: true })).toBeVisible();
});
