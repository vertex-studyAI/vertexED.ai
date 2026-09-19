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

const { MYP5_SUBJECTS, learningFrameFor } = await importTypeScriptModule('src/content/myp5.ts');
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
  assert.equal(MYP5_LESSONS.length, 36);
  for (const subject of MYP5_SUBJECTS) {
    assert.ok(MYP5_LESSONS.filter((lesson) => lesson.subjectSlug === subject.slug).length >= 2, subject.slug);
  }
});

test('MYP modules provide complete practice and traceable reference metadata', () => {
  const lessonIds = MYP5_LESSONS.map((lesson) => lesson.id);
  const questions = MYP5_LESSONS.flatMap((lesson) => lesson.practice);
  const questionIds = questions.map((question) => question.id);
  const sourceIds = new Set(MYP_CONTENT_SOURCES.map((source) => source.id));

  assert.equal(new Set(lessonIds).size, lessonIds.length);
  assert.equal(new Set(questionIds).size, questionIds.length);
  assert.equal(questions.length, 108);
  assert.deepEqual(questions.filter((question) => question.successCriteria.length < 2).map((question) => question.id), []);
  for (const lesson of MYP5_LESSONS) {
    const subject = MYP5_SUBJECTS.find((entry) => entry.slug === lesson.subjectSlug);
    assert.ok(subject, lesson.subjectSlug);
    assert.ok(subject.topics.includes(lesson.topic), `${lesson.id} must use a mapped topic`);
    assert.equal(lesson.contentStatus, 'original-editorial-draft');
    assert.equal(lesson.curriculumVersion, 'vertexed-myp5-2026.1');
    assert.equal(lesson.practice.length, 3);
    assert.ok(lesson.summary.length >= 50);
    assert.ok(lesson.objectives.length >= 3);
    assert.ok(lesson.keyIdeas.length >= 3);
    assert.ok(lesson.definitions.length >= 3);
    assert.ok(lesson.method.length >= 4);
    assert.ok(lesson.workedExample.steps.length >= 3);
    assert.ok(lesson.misconceptions.length >= 2);
    assert.ok(lesson.checklist.length >= 4);
    assert.ok(lesson.sourceIds.length > 0);
    assert.ok(lesson.sourceIds.every((sourceId) => sourceIds.has(sourceId)));
    assert.doesNotMatch(JSON.stringify(lesson), /\b(?:placeholder|tbd|todo)\b|—/i);
  }
  for (const question of questions) {
    assert.ok(question.prompt.length >= 15);
    assert.ok(question.hints.length >= 1);
    assert.ok(question.solution.length >= 1);
    assert.ok(Number.isInteger(question.marks) && question.marks > 0 && question.marks <= 12);
  }
  for (const source of MYP_CONTENT_SOURCES) {
    assert.match(source.url, /^https:\/\//);
    assert.ok(source.title.length >= 5);
    assert.ok(source.publisher.length >= 3);
    assert.ok(source.note.length >= 30);
  }
});

test('every subject has a complete, explicit conceptual learning frame', () => {
  for (const subject of MYP5_SUBJECTS) {
    const frame = learningFrameFor(subject);
    assert.equal(frame.keyConcepts.length, 2);
    assert.equal(frame.atlFocus.length, 2);
    assert.ok(frame.globalContext.length >= 10);
    assert.match(frame.framingQuestion, /\?$/);
  }
});
