import { expect, test } from '@playwright/test';

const groups = [{ slug: 'physical-health-education', name: 'Physical & Health Education', topics: ['Fitness', 'Training principles', 'Physiology', 'Movement', 'Nutrition', 'Wellbeing', 'Strategy', 'Performance analysis', 'Training plans', 'Reflection'], focus: 'performance-analysis', prerequisite: 'Physiology' }];
const slug = (title: string) => title.toLowerCase().replaceAll(' ', '-');
for (const group of groups) {
  test(`${group.name}: all ten lessons and 30 model responses work`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/myp/subjects/${group.slug}`);
    for (const topic of group.topics) {
      await page.getByRole('complementary', { name: `${group.name} topics` }).getByRole('link', { name: new RegExp(topic + '$') }).click();
      await expect(page).toHaveURL(new RegExp(`/${group.slug}/${slug(topic)}$`));
      await expect(page.getByRole('heading', { level: 1, name: topic, exact: true })).toBeVisible();
      await expect(page.getByText('This topic has a structured outline, not a finished lesson yet.')).toHaveCount(0);
      await expect(page.locator('.myp-note').filter({ hasText: 'not personal medical, nutrition or exercise advice' })).toBeVisible();
      const buttons = page.getByRole('group', { name: 'Choose practice question' }).getByRole('button');
      await expect(buttons).toHaveCount(5);
      for (let i = 0; i < 3; i++) {
        await buttons.nth(i).click();
        await page.getByRole('button', { name: 'Show hints' }).click();
        await expect(page.locator('.myp-hint-panel li').first()).toBeVisible();
        await page.getByRole('button', { name: 'Compare with a model response' }).click();
        await expect(page.locator('.myp-solution li').first()).toBeVisible();
      }
    }
    expect(errors).toEqual([]);
  });

  test(`${group.name}: examples fit three viewports`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`/myp/subjects/${group.slug}/${group.focus}`);
      await page.locator('.myp-key-ideas').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `test-results/phe-${group.slug}-${width}.png`, animations: 'disabled' });
      await page.locator('.myp-worked').screenshot({ path: `test-results/phe-${group.slug}-worked-${width}.png`, animations: 'disabled', style: 'header { visibility: hidden !important; }' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('.myp-worked').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
  });

  test(`${group.name}: all examples and responses fit mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const topic of group.topics) {
      await page.goto(`/myp/subjects/${group.slug}/${slug(topic)}`);
      await page.locator('.myp-worked').screenshot({ path: `test-results/phe-${group.slug}-${slug(topic)}-worked.png`, animations: 'disabled', style: 'header { visibility: hidden !important; }' });
      expect(await page.locator('.myp-worked').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      for (let i = 0; i < 3; i++) {
        await page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').nth(i).click();
        await page.getByRole('button', { name: 'Compare with a model response' }).click();
        await expect(page.locator('.myp-solution li').first()).toBeVisible();
        expect(await page.locator('.myp-solution').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.locator('.myp-solution').screenshot({ path: `test-results/phe-${group.slug}-${slug(topic)}-q${i + 1}.png`, animations: 'disabled', style: 'header { visibility: hidden !important; }' });
      }
    }
  });

  test(`${group.name}: keyboard prerequisites and saved answers work`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/myp/subjects/${group.slug}/${slug(group.prerequisite)}`);
    const link = page.getByRole('navigation', { name: 'Suggested prerequisites' }).getByRole('link').first();
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: group.topics[0], exact: true })).toBeVisible();
    const answer = page.getByLabel('Your answer', { exact: true });
    await answer.fill('This is my written interpretation; it is not a practical performance result.');
    await page.getByRole('button', { name: 'Save draft' }).click();
    await page.reload();
    await expect(answer).toHaveValue('This is my written interpretation; it is not a practical performance result.');
  });
}
