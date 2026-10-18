import { expect, test } from '@playwright/test';
import { AP_COURSES } from '../src/content/apCatalogue';

for (const width of [1440, 1024, 390]) {
  test(`AP catalogue, practice and temporary working at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ap');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Choose a course');
    await expect(page.locator('.ap-course-card')).toHaveCount(42);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: `test-results/ap-catalogue-${width}-light.png`, fullPage: true });
    const search = page.getByRole('searchbox', { name: 'Search courses and topics' });
    await search.pressSequentially('Calculus AB', { delay: 20 });
    await expect(search).toBeFocused();
    await expect(page.locator('.ap-course-card')).toHaveCount(1);
    await page.reload();
    await expect(search).toHaveValue('Calculus AB');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: `test-results/ap-catalogue-filtered-${width}-light.png`, fullPage: true });
    await page.locator('.ap-course-card').click();
    await page.locator('.ap-outline a').first().click();
    await expect(page.getByRole('heading', { name: 'Now try it yourself.' })).toBeVisible();
    const answer = page.getByLabel('Your working for attempt 1', { exact: true });
    await answer.fill('My first attempt: use the limiting value, then check both sides.');
    const hint = page.getByText('Show a hint', { exact: true }).first();
    await hint.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.ap-question details').first()).toHaveAttribute('open', '');
    await page.getByText('Review reasoning and checkpoints', { exact: true }).first().click();
    await expect(page.locator('.ap-question').first().getByText(/not an official scoring rubric/)).toBeVisible();
    await page.getByRole('link', { name: 'Next module →' }).click();
    await expect(page.getByLabel('Your working for attempt 1', { exact: true })).toHaveValue('');
    await page.getByRole('link', { name: '← Previous module' }).click();
    await expect(answer).toHaveValue('My first attempt: use the limiting value, then check both sides.');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download course working' }).click();
    expect((await download).suggestedFilename()).toBe('calculus-ab-working.txt');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    // Anchor fixed navigation at the top of full-page evidence, not at the
    // last form control's scrolled viewport position.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/ap-lesson-${width}-light.png`, fullPage: true });
    const theme = page.getByRole('button', { name: /^Theme:/ }).first();
    for (let i = 0; i < 3 && !(await page.locator('html').getAttribute('class'))?.includes('dark'); i++) await theme.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.screenshot({ path: `test-results/ap-lesson-${width}-dark.png`, fullPage: true });
    await page.reload();
    await expect(answer).toHaveValue('');
  });
}

test('every current AP course has a working course and module route', async ({ page }) => {
  test.setTimeout(180_000);
  for (const course of AP_COURSES) {
    await page.goto(`/ap/${course.slug}/${course.modules[0].id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(course.title);
    await expect(page.getByRole('heading', { name: course.modules[0].title, exact: true })).toBeVisible();
    await expect(page.getByLabel('Your working for attempt 1', { exact: true })).toBeVisible();
  }
});

test('AP library filters, exact search and missing routes are honest', async ({ page }) => {
  await page.goto('/resources?category=ap');
  await expect(page.getByTestId('library-item')).toHaveCount(42);
  await page.getByRole('searchbox', { name: 'Search the learning library' }).fill('AP Cybersecurity');
  await expect(page.locator('a[href="/ap/cybersecurity"]')).toBeVisible();
  await page.goto('/ap?group=World%20languages&q=Spanish');
  await expect(page.locator('.ap-course-card')).toHaveCount(2);
  await page.getByRole('searchbox', { name: 'Search courses and topics' }).fill('zzzzmissing');
  await expect(page.getByRole('heading', { name: 'No course matches these filters.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.ap-course-card')).toHaveCount(42);
  await page.goto('/ap/calculus-ab/unknown-unit');
  await expect(page.getByRole('heading', { name: 'Study module not found' })).toBeVisible();
  await page.goto('/ap/nonexistent');
  await expect(page.getByRole('heading', { name: 'AP course not found' })).toBeVisible();
});

test('failed AP content load can retry without rendering another course', async ({ page }) => {
  let fail = true;
  await page.route('**/ap-content/calculus-ab.json', (route) => fail ? route.fulfill({ status: 503, body: '{}' }) : route.continue());
  const course = AP_COURSES.find((entry) => entry.slug === 'calculus-ab')!;
  await page.goto(`/ap/${course.slug}/${course.modules[0].id}`);
  await expect(page.getByRole('alert')).toContainText('could not be loaded');
  fail = false;
  await page.getByRole('button', { name: 'Try loading again' }).click();
  await expect(page.getByLabel('Your working for attempt 1', { exact: true })).toBeVisible();
});

test('installed AP content opens an unvisited course offline', async ({ page, context }) => {
  await page.goto('/ap');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  await context.setOffline(true);
  const course = AP_COURSES.find((entry) => entry.slug === 'biology')!;
  await page.goto(`/ap/${course.slug}/${course.modules[0].id}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(course.title);
  await page.getByLabel('Your working for attempt 1', { exact: true }).fill('An offline draft.');
  await page.getByText('Review reasoning and checkpoints', { exact: true }).first().click();
  await expect(page.locator('.ap-question').first().getByText(/not an official scoring rubric/)).toBeVisible();
  await context.setOffline(false);
});
