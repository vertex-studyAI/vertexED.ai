import { expect, test, type Page } from '@playwright/test';

async function setTheme(page: Page, theme: 'light' | 'dark') {
  const label = `Theme: ${theme === 'dark' ? 'Dark' : 'Light'}. Click to switch.`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const control = page.getByRole('button', { name: /^Theme:/ });
    if (await control.getAttribute('aria-label') === label) break;
    await control.click();
  }
  await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
}

const guides = [
  ['ai-chatbot-tutor', 'Using Apex for study help'],
  ['ai-answer-reviewer', 'Using Answer Reviewer'],
  ['notes-to-flashcards', 'From notes to flashcards and quizzes'],
  ['ib-igcse-paper-maker', 'IB and IGCSE Paper Maker'],
  ['automated-note-taking-guide', 'Automated note taking: capture, then review'],
  ['best-ai-prompts-for-students', 'AI prompts that actually help with revision'],
  ['ai-study-planner', 'AI study planner and calendar'],
  ['ib-math-aa-ai-guide', 'IB Math AA and AI'],
];

for (const width of [1440, 1024, 390]) {
  test(`AI study guides are readable and keyboard navigable at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [slug, heading] of guides) {
      await page.goto(`/resources/${slug}`);
      await setTheme(page, 'light');
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
      await expect(page.locator('article')).toBeVisible();
      await expect(page.getByText(/^SUB/)).toHaveCount(0);
      const actions = page.locator('article .not-prose a');
      await expect(actions.first()).toBeVisible();
      await actions.first().focus();
      await expect(actions.first()).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(actions.nth(1)).toBeFocused();
      await expect(actions.nth(1)).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      await page.screenshot({ path: info.outputPath(`${slug}-${width}-actions.png`) });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: info.outputPath(`${slug}-${width}-light.png`), fullPage: true });
      await setTheme(page, 'dark');
      const colours = await page.locator('article h2').first().evaluate(element => {
        const heading = getComputedStyle(element).color;
        const paper = getComputedStyle(element.closest('article')!.parentElement!).backgroundColor;
        return { heading, paper };
      });
      const luminance = (value: string) => {
        const rgb = value.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(channel => {
          const fraction = channel / 255;
          return fraction <= 0.04045 ? fraction / 12.92 : ((fraction + 0.055) / 1.055) ** 2.4;
        });
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      };
      const levels = [luminance(colours.heading), luminance(colours.paper)].sort((a, b) => a - b);
      expect((levels[1] + 0.05) / (levels[0] + 0.05)).toBeGreaterThanOrEqual(4.5);
      await page.screenshot({ path: info.outputPath(`${slug}-${width}-dark.png`) });
    }
    expect(errors).toEqual([]);
  });
}

test('guide actions take learners to the implemented tool and preserve the sign-in return path', async ({ page }) => {
  await page.goto('/resources/ai-chatbot-tutor');
  const action = page.locator('article').getByRole('link', { name: 'Open Apex', exact: true });
  await action.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => history.state?.usr?.from)).toBe('/chatbot');
});
