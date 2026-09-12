import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

async function importTypeScriptModule(path) {
  const source = fs.readFileSync(path, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
}

const { MYP5_SUBJECTS } = await importTypeScriptModule('src/content/myp5.ts');
const expansionSource = fs.readFileSync('src/content/myp5LessonExpansion.ts', 'utf8')
  .replace("import type { MypLesson, MypPracticeQuestion } from './myp5Lessons';", '')
  .replaceAll('MypPracticeQuestion', 'any')
  .replaceAll('MypLesson', 'any');
const expansionOutput = ts.transpileModule(expansionSource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { MYP5_LESSON_EXPANSION } = await import(`data:text/javascript;base64,${Buffer.from(expansionOutput).toString('base64')}`);
const lessonSource = fs.readFileSync('src/content/myp5Lessons.ts', 'utf8')
  .replace("import { MYP5_LESSON_EXPANSION } from './myp5LessonExpansion';", '');
const lessonOutput = ts.transpileModule(lessonSource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const lessonModule = await import(`data:text/javascript;base64,${Buffer.from(`const MYP5_LESSON_EXPANSION = ${JSON.stringify(MYP5_LESSON_EXPANSION)};\n${lessonOutput}`).toString('base64')}`);
const { MYP5_LESSONS, MYP_CONTENT_SOURCES } = lessonModule;

test('every MYP subject has a detailed original module', () => {
  const coveredSubjects = new Set(MYP5_LESSONS.map((lesson) => lesson.subjectSlug));
  assert.deepEqual(
    MYP5_SUBJECTS.filter((subject) => !coveredSubjects.has(subject.slug)).map((subject) => subject.slug),
    [],
  );
  assert.ok(MYP5_LESSONS.length >= 29);
});

test('MYP modules provide complete practice and traceable reference metadata', () => {
  const lessonIds = MYP5_LESSONS.map((lesson) => lesson.id);
  const questions = MYP5_LESSONS.flatMap((lesson) => lesson.practice);
  const questionIds = questions.map((question) => question.id);
  const sourceIds = new Set(MYP_CONTENT_SOURCES.map((source) => source.id));

  assert.equal(new Set(lessonIds).size, lessonIds.length);
  assert.equal(new Set(questionIds).size, questionIds.length);
  assert.equal(questions.length, MYP5_LESSONS.length * 3);
  for (const lesson of MYP5_LESSONS) {
    assert.equal(lesson.contentStatus, 'original-editorial-draft');
    assert.equal(lesson.curriculumVersion, 'vertexed-myp5-2026.1');
    assert.equal(lesson.practice.length, 3);
    assert.ok(lesson.sourceIds.length > 0);
    assert.ok(lesson.sourceIds.every((sourceId) => sourceIds.has(sourceId)));
  }
  for (const question of questions) {
    assert.ok(question.prompt.length >= 15);
    assert.ok(question.hints.length >= 1);
    assert.ok(question.solution.length >= 1);
    assert.ok(question.successCriteria.length >= 1);
  }
});
