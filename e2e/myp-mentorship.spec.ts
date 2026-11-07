import { expect, test } from '@playwright/test';
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
