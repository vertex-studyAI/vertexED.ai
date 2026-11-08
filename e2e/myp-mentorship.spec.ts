import { expect, test, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';

const studentForm = 'https://forms.gle/JbkVEATVf3f3X4yF9';
const mentorForm = 'https://forms.gle/gisd6w65hb6L7keu9';

for (const width of [1440, 1024, 390]) {
  test(`MYP mentoring is public, readable and keyboard usable at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/myp/mentorship');
    await expect(page.getByRole('heading', { name: 'Free MYP mentoring.', exact: true })).toBeVisible();
    await expect(page).toHaveTitle('Free MYP mentoring | VertexED');

    const student = page.getByRole('link', { name: /^Request free mentoring/ });
    const mentor = page.getByRole('link', { name: /^Volunteer as a mentor/ });
    await expect(student).toHaveAttribute('href', studentForm);
    await expect(mentor).toHaveAttribute('href', mentorForm);
    for (const link of [student, mentor]) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    await student.focus();
    await page.keyboard.press('Tab');
    await expect(mentor).toBeFocused();

    const question = page.locator('summary', { hasText: 'What happens after I apply?' });
    await question.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Applying does not book a session.', { exact: false })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(question.locator('..')).not.toHaveAttribute('open', '');

    // An application is not permission for an unsupervised private session.
    await expect(page.getByText(/Applying does not arrange a session or authorize private contact/)).toBeVisible();
    const safety = page.locator('summary', { hasText: 'How are students kept safe?' });
    await safety.click();
    await expect(page.getByText(/Before any session starts, the team needs an agreed safeguarding and consent process/)).toBeVisible();

    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await page.evaluate(() => window.scrollTo(0, 0));
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      await page.screenshot({ path: info.outputPath(`mentorship-${width}-${theme}.png`), fullPage: true, animations: 'disabled' });
    }

    const menuButton = page.getByRole('button', { name: 'Open navigation menu', exact: true });
    const mobile = await menuButton.isVisible();
    if (mobile) await menuButton.click();
    const navigation = page.getByRole('navigation', { name: mobile ? 'Mobile navigation' : 'Main navigation', exact: true });
    await expect(navigation.getByRole('link', { name: 'MYP mentoring', exact: true })).toHaveAttribute('aria-current', 'page');
    if (mobile) await page.keyboard.press('Escape');
  });
}

test('student and mentor actions open their distinct supplied forms', async ({ page, context }) => {
  const destinations: string[] = [];
  await context.route('https://forms.gle/**', async route => {
    destinations.push(route.request().url());
    await route.fulfill({ contentType: 'text/html', body: '<h1>Application destination fixture</h1>' });
  });
  await page.goto('/myp/mentorship');
  for (const [name, url] of [[/^Request free mentoring/, studentForm], [/^Volunteer as a mentor/, mentorForm]] as const) {
    const popupPromise = context.waitForEvent('page');
    await page.getByRole('link', { name }).click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(url);
    await expect(popup.getByRole('heading')).toHaveText('Application destination fixture');
    await popup.close();
  }
  expect(destinations).toEqual([studentForm, mentorForm]);
});

test('MYP mentoring is reachable from the hub and public search', async ({ page }) => {
  await page.goto('/myp');
  await page.getByRole('link', { name: 'Free MYP mentoring', exact: true }).click();
  await expect(page).toHaveURL(/\/myp\/mentorship$/);
  await expect(page.getByRole('heading', { name: 'Free MYP mentoring.', exact: true })).toBeVisible();
  await page.goto('/features');
  await page.getByRole('combobox', { name: 'Search VertexED' }).fill('mentoring');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/myp\/mentorship$/);
  await expect(page.getByRole('heading', { name: 'Free MYP mentoring.', exact: true })).toBeVisible();
});

async function signInWithUnavailableCloud(page: Page) {
  const user = {
    id: 'f40db66b-1b55-4ab8-88d0-14a9ba476c16', aud: 'authenticated', role: 'authenticated',
    email: 'learner@example.test', email_confirmed_at: '2026-10-16T00:00:00Z',
    app_metadata: { provider: 'email' },
    user_metadata: { board: 'IB_DP', grade: 12, subjects: ['Physics'], username: 'testlearner' },
    created_at: '2026-10-16T00:00:00Z', identities: [],
  };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, exp: 2103836400, role: 'authenticated' })}.test-only`;
  // Keep every external auth request and API probe inside local fixtures.
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, async route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/auth/v1/token' ? { access_token: token, token_type: 'bearer', expires_in: 315360000, refresh_token: 'test-refresh', user }
      : path === '/auth/v1/user' ? user
      : path === '/rest/v1/profiles' ? { id: user.id, email: user.email, board: 'IB_DP', grade: 12, subjects: ['Physics'] } : {};
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/api/waitlist-status' ? { status: 'approved', access: true }
      : path === '/api/admin-status' ? { isAdmin: false }
      : path === '/api/learner-state' ? { contractVersion: 'vertexed.learner-state.v1', items: [] }
      : path === '/api/user-content' ? { error: 'Test cloud unavailable' } : {};
    await route.fulfill({ status: path === '/api/user-content' ? 503 : 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'MYP mentoring', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Free MYP mentoring.', exact: true })).toBeVisible();
}

test('signed-in learners can read and dismiss the cloud-sync notice', async ({ page }) => {
  await signInWithUnavailableCloud(page);
  const notice = page.getByRole('status').filter({ hasText: 'Working in device-save mode' });
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('Test cloud unavailable');
  await notice.getByRole('button', { name: 'Dismiss sync notice', exact: true }).click();
  await expect(notice).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Free MYP mentoring.', exact: true })).toBeVisible();
});

test('a failed cloud-notice download leaves the active page usable', async ({ page }) => {
  await page.route('**/assets/CloudSaveBanner-*.js', route => route.abort());
  await signInWithUnavailableCloud(page);
  await expect(page.getByRole('status').filter({ hasText: 'Cloud sync status is unavailable.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'This page could not open', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^Request free mentoring/ })).toHaveAttribute('href', studentForm);
  const question = page.locator('summary', { hasText: 'Is the mentoring free?' });
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Yes. This is a volunteer programme.', { exact: false })).toBeVisible();
});


test('feedback loads after sign-in and keeps its keyboard return path', async ({ page }) => {
  const feedbackDownloads: string[] = [];
  page.on('request', request => {
    if (/\/assets\/FeedbackLauncher-[^/]+\.js$/.test(new URL(request.url()).pathname)) {
      feedbackDownloads.push(request.url());
    }
  });
  await page.goto('/myp/mentorship');
  await expect(page.getByRole('heading', { name: 'Free MYP mentoring.', exact: true })).toBeVisible();
  expect(feedbackDownloads).toHaveLength(0);

  await signInWithUnavailableCloud(page);
  const launcher = page.getByRole('button', { name: 'Give VertexED feedback', exact: true });
  await expect(launcher).toBeVisible();
  expect(feedbackDownloads.length).toBeGreaterThan(0);
  await launcher.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Help improve VertexED', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Your feedback')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(launcher).toBeFocused();
});

test('a failed feedback download preserves the active mentoring page', async ({ page }) => {
  await page.route('**/assets/FeedbackLauncher-*.js', route => route.abort());
  await signInWithUnavailableCloud(page);
  await expect(page.getByRole('status').filter({ hasText: 'The feedback form is temporarily unavailable.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Free MYP mentoring.', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /^Request free mentoring/ })).toHaveAttribute('href', studentForm);
  await expect(page.getByRole('heading', { name: 'This page could not open', exact: true })).toHaveCount(0);
});
