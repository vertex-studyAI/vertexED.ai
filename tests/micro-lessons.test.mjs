import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/content/microLessons.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { MICRO_LESSONS, MICRO_LESSON_REGISTRY } = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);

test('every original lesson has working, feedback, transfer and provenance', () => {
  assert.equal(MICRO_LESSONS.length, 9);
  assert.equal(new Set(MICRO_LESSONS.map(x => x.id)).size, 9);
  for (const lesson of MICRO_LESSONS) {
    assert.ok(lesson.worked.length >= 3);
    assert.ok(lesson.answer >= 0 && lesson.answer < lesson.options.length);
    for (const key of ['objective','explanation','misconception','feedback','transfer','source','sourceTitle']) assert.ok(lesson[key]?.length > 10, `${lesson.id}: ${key}`);
    assert.equal(new URL(lesson.source).protocol, 'https:');
  }
});
test('all draft lessons remain unapproved with explicit unresolved syllabus mapping', () => {
  for (const item of MICRO_LESSON_REGISTRY) {
    assert.equal(item.publicApproved, false);
    assert.equal(item.reviewStatus, 'draft');
    assert.equal(item.reviewer, null);
    assert.equal(item.syllabusObjectiveId, null);
  }
  const page = readFileSync(new URL('../src/pages/Learn.tsx', import.meta.url), 'utf8');
  assert.match(page, /if \(!import\.meta\.env\.DEV\)/);
  assert.match(page, /noindex, follow/);
  const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  assert.doesNotMatch(sitemap, /\/learn(?:\?|<)/);
});
