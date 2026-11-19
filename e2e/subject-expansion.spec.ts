import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('public/learning-library/manifest.json', 'utf8'));
const additions = manifest.entries.filter((item: { id: string }) => item.id.startsWith('subject-'));

for (const batch of [{ start: 0, end: 9 }, { start: 9, end: 17 }]) {
  test(`new subject modules ${batch.start + 1}–${batch.end} support all authored study modes`, async ({ page }, info) => {
    test.setTimeout(180000);
    expect(additions).toHaveLength(17);
    const entries = additions.slice(batch.start, batch.end);
    // Isolated browser fixtures only. The public approval register remains unchanged.
    await page.route('**/learning-library/*.json', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path === '/learning-library/manifest.json') return route.fulfill({ json: { ...manifest, entries } });
      if (entries.some((item: { json: string }) => item.json === path)) return route.fulfill({ contentType: 'application/json', body: await readFile(`public${path}`, 'utf8') });
      return route.continue();
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const entry of entries) {
      const lesson = JSON.parse(await readFile(`public${entry.json}`, 'utf8'));
      await page.goto(`/resources/foundations/${entry.id}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(lesson.topic);
      for (const note of lesson.notes) await expect(page.getByRole('heading', { name: note.heading, exact: true })).toBeVisible();
      await expect(page.getByRole('figure', { name: lesson.diagrams[0].title })).toBeVisible();
      await page.getByRole('tab', { name: 'Notes', exact: true }).focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('tab', { name: 'Guided study', exact: true })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('heading', { name: `3. ${lesson.teachingSequence[2].title}`, exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Practise question 4', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Question 4', exact: true })).toBeFocused();
      await page.getByLabel('Your answer to question 4', { exact: true }).fill(lesson.questions[3].answer);
      await page.getByRole('button', { name: 'Check question 4', exact: true }).click();
      const question = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Question 4', exact: true }) });
      await expect(question.getByRole('status')).toHaveText('Self-review required. Compare your reasoning with the solution and marking points.');
      await question.getByText('Solution and marking points', { exact: true }).click();
      await expect(question.locator('details').getByText(lesson.questions[3].answer, { exact: true })).toBeVisible();
      await page.getByRole('tab', { name: 'Flashcards', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Reveal answer', exact: true })).toHaveCount(5);
      await page.getByRole('button', { name: 'Reveal answer', exact: true }).first().click();
      await expect(page.getByText(lesson.flashcards[0].back, { exact: true })).toBeVisible();
      await page.getByRole('tab', { name: 'Revise', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Revision guide', exact: true })).toBeVisible();
      if (lesson.revisionGuide.formulas.length) await expect(page.getByRole('heading', { name: 'Formula sheet and conditions', exact: true })).toBeVisible();
    }
    await page.goto(`/resources/foundations/${entries[0].id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(entries[0].topic);
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(async () => {
        await document.fonts.ready;
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.screenshot({ path: info.outputPath(`subject-${width}.png`), animations: 'disabled' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      await page.getByRole('tab', { name: 'Revise', exact: true }).click();
      const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Revision guide', exact: true }) }).last();
      await expect(section).toBeVisible();
      // Capture the complete guide below sticky navigation, not a loading frame
      // or a cropped heading. Normal 900px viewports remain exercised above.
      const height = Math.ceil((await section.boundingBox())!.height) + 300;
      await page.setViewportSize({ width, height });
      await expect.poll(async () => {
        const banner = (await page.getByRole('banner').boundingBox())!;
        await section.evaluate((element, offset) => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - offset, behavior: 'instant' }), banner.height + 24);
        const box = (await section.boundingBox())!;
        const chrome = (await page.getByRole('banner').boundingBox())!;
        return box.y - chrome.y - chrome.height;
      }).toBeGreaterThanOrEqual(0);
      const bounds = (await section.boundingBox())!;
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(height);
      await section.screenshot({ path: info.outputPath(`subject-revision-${width}.png`), animations: 'disabled' });
      await page.getByRole('tab', { name: 'Notes', exact: true }).click();
    }
  });
}

test('new subject assets remain held outside isolated reviewer fixtures', async ({ page }) => {
  for (const entry of additions) {
    expect((await page.request.get(entry.json)).status()).toBe(403);
    expect((await page.request.get(entry.markdown)).status()).toBe(403);
  }
  await page.goto('/resources/foundations/subject-knowledge-claims');
  await expect(page.getByRole('alert')).toContainText('awaiting review');
});
