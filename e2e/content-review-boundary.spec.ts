import { expect, test, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';

const account = '53f1dfde-ec1a-4dbb-9d68-7c0c08250b19';

async function syntheticSignIn(page: Page) {
  const learner = { id: account, aud: 'authenticated', role: 'authenticated', email: 'content-review@example.test',
    email_confirmed_at: '2026-09-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { username: 'contentfixture', board: 'IB_MYP', grade: 10, subjects: ['Physics'] } };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/auth/v1/token') {
      const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: account, exp: Math.floor(Date.now() / 1000) + 86400, role: 'authenticated' })}.fixture-signature`;
      return route.fulfill({ json: { access_token: token, refresh_token: 'fixture-refresh', expires_in: 86400, token_type: 'bearer', user: learner } });
    }
    if (path === '/auth/v1/user') return route.fulfill({ json: learner });
    if (path === '/auth/v1/logout') return route.fulfill({ status: 204, body: '' });
    if (path === '/rest/v1/profiles') return route.fulfill({ json: { ...learner, full_name: 'Content review learner' } });
    return route.fulfill({ status: 400, json: { message: 'Unexpected fixture request' } });
  });
  await page.route('**/api/**', route => route.fulfill({ json: { ok: true, access: true, status: 'approved', items: [], nextOffset: null, isAdmin: false } }));
  await page.route('**/_vercel/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill('content-review@example.test');
  await page.getByLabel('Password', { exact: true }).fill('fixture-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/main$/);
}

for (const width of [1440, 1024, 390]) {
  test(`held legacy teaching routes and landing examples at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const routes = [
      { path: '/resources?category=guides', name: 'held-article-directory', text: 'Materials awaiting subject review' },
      { path: '/resources/ib-myp-humanities-guide', name: 'held-interactive-article', text: 'Awaiting subject review' },
      { path: '/archives-lnl', name: 'held-archive-route', text: 'Awaiting subject review' },
      { path: '/archives', name: 'held-archive-directory', text: 'Awaiting subject review. This collection is not available yet.' },
    ];
    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByText(route.text, { exact: true }).first()).toBeVisible();
      await expect(page.getByText('What makes a strong literary analysis?', { exact: true })).toHaveCount(0);
      await expect(page.locator('a[data-testid="library-item"][href^="/resources/"]')).toHaveCount(0);
      for (const theme of ['light', 'dark'] as const) {
        await selectTheme(page, theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
        await page.screenshot({ path: info.outputPath(`${route.name}-${width}-${theme}.png`), fullPage: true, animations: 'disabled' });
      }
    }
    await page.goto('/study-tools');
    await expect(page.getByText('Study methods are awaiting subject review.', { exact: true })).toBeVisible();
    await expect(page.getByText('The exam checklist is awaiting subject review.', { exact: true })).toBeVisible();
    await expect(page.getByText('Command term definitions are awaiting subject review.', { exact: false })).toBeVisible();
    await page.goto('/');
    await expect(page.locator('.study-gallery-card')).toHaveCount(0);
    await expect(page.locator('#study-examples')).toContainText('Awaiting subject review');
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      await page.locator('#study-examples').scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      await page.screenshot({ path: info.outputPath(`held-landing-examples-${width}-${theme}.png`), animations: 'disabled' });
    }
    const opener = page.getByRole('button', { name: 'Open concept lens', exact: true });
    await opener.click();
    await expect(page.getByRole('dialog', { name: 'Concept Lens' })).toContainText('Awaiting subject review');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
  });

  test(`held MYP search and lesson routes explain availability at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/resources?q=forces');
    const physics = page.locator('[data-testid="library-item"][href="/myp/subjects/physics"]');
    await expect(physics).toContainText('Awaiting subject review');
    await expect(page.locator('[data-testid="library-item"][href^="/myp/subjects/physics/"]')).toHaveCount(0);
    await expect(page.getByText('Use the 205 original MYP modules above for current subject learning.')).toHaveCount(0);
    const search = page.getByRole('combobox', { name: 'Search VertexED' });
    await search.fill('forces');
    await expect(page.getByRole('listbox')).toContainText('awaiting subject review');
    await page.keyboard.press('Escape');
    const routes = [
      { path: '/resources?q=forces', name: 'held-library', text: 'Awaiting subject review' },
      { path: '/myp/subjects/physics', name: 'held-myp-topic', text: 'This topic is awaiting subject review.' },
      { path: '/myp/eassessment', name: 'held-myp-assessment', text: 'Questions are awaiting subject review.' },
    ];
    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByText(route.text, { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Check your connection and try again.', { exact: false })).toHaveCount(0);
      if (route.name !== 'held-library') await expect(page.getByRole('button', { name: 'Try again', exact: true })).toHaveCount(0);
      for (const theme of ['light', 'dark'] as const) {
        await selectTheme(page, theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
        await page.screenshot({ path: info.outputPath(`${route.name}-${width}-${theme}.png`), fullPage: true, animations: 'disabled' });
      }
    }
  });

  test(`held course content is explicit and usable at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const destinations = [
      { path: '/ap/calculus-ab', name: 'ap-course', text: 'Study material is awaiting subject review' },
      { path: '/myp', name: 'myp-directory', text: 'Detailed lessons and practice questions are awaiting subject review.' },
      { path: '/study-tools?formula=ohm', name: 'formula-reference', text: 'Formula references are awaiting subject review' },
    ];
    for (const destination of destinations) {
      await page.goto(destination.path);
      await expect(page.getByText(destination.text, { exact: destination.name !== 'myp-directory' })).toBeVisible();
      for (const theme of ['light', 'dark'] as const) {
        await selectTheme(page, theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
        await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
        await page.screenshot({ path: info.outputPath(`${destination.name}-${width}-${theme}.png`), fullPage: true, animations: 'disabled' });
      }
      if (destination.name === 'ap-course') {
        const back = page.getByRole('link', { name: 'Return to the AP course directory', exact: true });
        await back.focus();
        await expect(back).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/\/ap$/);
        await expect(page.getByText('Lessons and practice questions are awaiting subject review.', { exact: false })).toBeVisible();
      }
      if (destination.name === 'myp-directory') {
        const search = page.getByLabel('Search subjects and topics');
        await search.focus();
        await page.keyboard.type('Physics');
        await expect(search).toHaveValue('Physics');
      }
    }
    for (const url of ['/ap-content/calculus-ab.json', '/myp5-content/physics.json']) {
      const response = await page.request.get(url);
      expect(response.status()).toBe(403);
      expect(await response.json()).toMatchObject({ code: 'CONTENT_REVIEW_REQUIRED' });
    }
    expect(errors).toEqual([]);
  });

  test(`held exam content preserves saved answers at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await syntheticSignIn(page);
    const savedKey = `vertex_content:${account}:exam_baseline:Physics`;
    const saved = { version: 1, subject: 'Physics', programme: 'IB_MYP', drillIds: ['held-original-drill'], responses: { 'held-original-drill': { answer: 'Preserve my original working.', attemptState: 'attempted', selfCheck: null, revealed: false } }, completedAt: null };
    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: savedKey, value: saved });
    await page.goto('/exam-prep');
    const practice = page.locator('#exam-practice-lab');
    await expect(practice).toContainText('Practice questions are awaiting subject review.');
    await page.getByLabel('Session choice').selectOption('diagnostic');
    const baseline = page.locator('#exam-baseline');
    await expect(baseline).toContainText('Baseline questions are awaiting subject review');
    for (const theme of ['light', 'dark'] as const) {
      await selectTheme(page, theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      await baseline.screenshot({ path: info.outputPath(`baseline-review-${width}-${theme}.png`), animations: 'disabled' });
      await practice.screenshot({ path: info.outputPath(`exam-review-${width}-${theme}.png`), animations: 'disabled' });
    }
    const action = baseline.getByRole('link', { name: 'Open focused practice' });
    await action.focus();
    await expect(action).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#exam-practice-lab$/);
    await page.reload();
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), savedKey)).toEqual(saved);
    expect(errors).toEqual([]);
  });
}
