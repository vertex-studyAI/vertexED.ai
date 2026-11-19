import { expect, test } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import type { ApCourse } from '../src/content/apTypes';
import type { MypSubjectContent } from '../src/content/myp5ContentClient';
import { topicSlug } from '../src/content/myp5';
import { selectTheme } from './theme-controls';

const courses: ApCourse[] = readdirSync('public/ap-content').filter(name => name.endsWith('.json')).map(name => JSON.parse(readFileSync(`public/ap-content/${name}`, 'utf8')));
const subjects: MypSubjectContent[] = readdirSync('public/myp5-content').filter(name => name.endsWith('.json') && name !== 'manifest.json').map(name => JSON.parse(readFileSync(`public/myp5-content/${name}`, 'utf8')));

for (const course of courses) test(`AP resources: ${course.title}`, async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`/ap/${course.slug}/${course.modules[0].id}`, { waitUntil: 'domcontentloaded' });
  for (const unit of course.modules) {
    await page.getByLabel('Study module', { exact: true }).selectOption(unit.id);
    await expect(page.getByRole('heading', { name: unit.title, exact: true })).toBeVisible();
    const resources = page.getByRole('region', { name: 'Notes, examples, diagrams and flashcards' });
    await expect(resources.getByRole('heading', { name: 'Study notes', exact: true })).toBeVisible();
    await expect(resources.locator('.study-resource-example')).toHaveCount(unit.studyPack!.workedExamples.length);
    await expect(resources.getByRole('figure')).toHaveCount(unit.studyPack!.diagrams.length);
    await expect(resources.locator('.study-resource-cards article')).toHaveCount(unit.studyPack!.flashcards.length + (unit.reviewCards?.length ?? 0));
    await expect(page.locator('.ap-question')).toHaveCount(unit.questions.length);
    const card = resources.locator('.study-resource-cards button').first();
    await card.focus(); await page.keyboard.press('Enter');
    await expect(card).toHaveAttribute('aria-expanded', 'true');
    const added = page.locator('.ap-question').last();
    await added.getByText('Review reasoning and checkpoints', { exact: true }).click();
    await expect(added).toContainText(unit.questions.at(-1)!.answer);
  }
  expect(errors).toEqual([]);
});

for (const subject of subjects) test(`MYP resources: ${subject.subjectSlug}`, async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`/myp/subjects/${subject.subjectSlug}/${topicSlug(subject.lessons[0].topic)}`, { waitUntil: 'domcontentloaded' });
  for (const lesson of subject.lessons) {
    await page.locator('.myp-topic-rail').getByRole('link', { name: new RegExp(`${lesson.topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).click();
    await expect(page.getByRole('heading', { level: 1, name: lesson.topic, exact: true })).toBeVisible();
    const resources = page.getByRole('region', { name: 'Notes, examples, diagrams and flashcards' });
    await expect(resources.locator('.study-resource-cards article')).toHaveCount(4);
    await expect(resources.getByRole('figure')).toHaveCount(1);
    await expect(resources.getByRole('region', { name: 'Study notes', exact: true }).getByRole('heading', { name: lesson.studyPack!.notes[0].title, exact: true })).toBeVisible();
    const choices = page.getByRole('group', { name: 'Choose practice question' }).getByRole('button');
    await expect(choices).toHaveCount(lesson.practice.length);
    for (const index of [lesson.practice.length - 2, lesson.practice.length - 1]) {
      await choices.nth(index).click();
      await expect(page.locator('.myp-active-question h3')).toHaveText(lesson.practice[index].prompt);
      await page.getByRole('button', { name: /Compare with (a model response|the worked solution)/ }).click();
      await expect(page.locator('.myp-solution')).toContainText(lesson.practice[index].solution[0]);
    }
  }
  expect(errors).toEqual([]);
});

test('responsive resource diagrams, keyboard cards and reduced motion', async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const samples = [
    { id: 'ap-calculus', route: `/ap/calculus-ab/${courses.find(course => course.slug === 'calculus-ab')!.modules[0].id}` },
    { id: 'ap-japanese', route: `/ap/japanese-language-and-culture/${courses.find(course => course.slug === 'japanese-language-and-culture')!.modules[0].id}` },
    { id: 'myp-design', route: '/myp/subjects/design/specifications' },
  ];
  for (const sample of samples) {
    await page.goto(sample.route, { waitUntil: 'domcontentloaded' });
    const resources = page.getByRole('region', { name: 'Notes, examples, diagrams and flashcards' });
    const figure = resources.getByRole('figure').first();
    await expect(figure).toBeVisible();
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 1400 });
      for (const theme of ['light', 'dark'] as const) {
        await selectTheme(page, theme);
        const banner = await page.getByRole('banner').boundingBox();
        await figure.evaluate((element, offset) => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - offset, behavior: 'instant' }), (banner?.height ?? 140) + 24);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
        await figure.screenshot({ path: info.outputPath(`${sample.id}-${width}-${theme}.png`), animations: 'disabled' });
        await resources.locator('.study-resource-cards article').first().screenshot({ path: info.outputPath(`${sample.id}-card-${width}-${theme}.png`), animations: 'disabled' });
      }
      await page.setViewportSize({ width, height: 900 });
      const button = resources.locator('.study-resource-cards button').first();
      await button.focus(); await page.keyboard.press('Enter');
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Space');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  }
});

test('new MYP question drafts remain distinct across lessons', async ({ page }) => {
  await page.goto('/myp/subjects/design/specifications');
  const lastQuestion = () => page.getByRole('group', { name: 'Choose practice question' }).getByRole('button').last();
  await lastQuestion().click();
  await page.getByLabel('Your answer', { exact: true }).fill('Four of five first-time users complete setup without hints.');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await page.goto('/myp/subjects/design/testing');
  await lastQuestion().click();
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('');
  await page.goto('/myp/subjects/design/specifications');
  await lastQuestion().click();
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('Four of five first-time users complete setup without hints.');
});
