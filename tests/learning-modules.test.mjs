import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { learningLessonSchema, renderLearningLesson } from '../contracts/learningLibrary.js';
import { readLearningLibrary } from '../scripts/generate-learning-library.mjs';
import { readSyllabusSources, syllabusSourcesSchema } from '../scripts/syllabus-sources.mjs';
import { buildCurriculumScope } from '../scripts/report-curriculum-scope.mjs';
import { verifyPublishedContent } from '../scripts/verify-published-content.mjs';

const lessons = (await readLearningLibrary()).filter(lesson => ['arithmetic-sequences', 'design-evaluation', 'geometric-sequences', 'scientific-investigation'].includes(lesson.id));
const sources = await readSyllabusSources();

test('four extended lessons have original modules, diagrams and complete local evidence references', () => {
  assert.deepEqual(lessons.map(lesson => lesson.id), ['arithmetic-sequences', 'design-evaluation', 'geometric-sequences', 'scientific-investigation']);
  for (const lesson of lessons) {
    assert.ok(lesson.notes.flatMap(note => note.paragraphs).join(' ').split(/\s+/).length >= 1000);
    assert.equal(lesson.diagrams.length, 2);
    assert.equal(lesson.teachingSequence.length, 5);
    assert.equal(lesson.workedExamples.length, 6);
    assert.equal(lesson.flashcards.length, 14);
    assert.equal(lesson.questions.length, 25);
    assert.deepEqual(new Set(lesson.teachingSequence.flatMap(step => step.questionIds)), new Set(lesson.questions.map(question => question.id)));
    assert.deepEqual(new Set(lesson.syllabusMappings.flatMap(mapping => mapping.questionIds)), new Set(lesson.questions.filter(question => !['application-check', 'error-analysis'].includes(question.id) && !question.id.startsWith('retrieval-')).map(question => question.id)));
    const markdown = renderLearningLesson(lesson, sources);
    for (const diagram of lesson.diagrams) {
      assert.ok(markdown.includes(diagram.description));
      for (const step of diagram.steps) assert.ok(markdown.includes(step.detail));
      for (const link of diagram.links) assert.ok(markdown.includes(link));
    }
    for (const step of lesson.teachingSequence) assert.ok(markdown.includes(step.guidance));
    assert.ok(markdown.includes(lesson.revisionGuide.summary));
    for (const formula of lesson.revisionGuide.formulas) assert.ok(markdown.includes(formula.conditions));
  }
});

test('module schema rejects dangling references, broken diagram relationships and executable fields', () => {
  for (const change of [
    lesson => { lesson.diagrams[0].links.pop(); },
    lesson => { lesson.diagrams.push(lesson.diagrams[0]); },
    lesson => { lesson.diagrams[0].steps[1].label = lesson.diagrams[0].steps[0].label; },
    lesson => { lesson.diagrams[0].html = '<script>alert(1)</script>'; },
    lesson => { lesson.diagrams[0].steps[0].url = 'javascript:alert(1)'; },
    lesson => { lesson.teachingSequence[0].noteHeadings = ['Missing section']; },
    lesson => { lesson.teachingSequence[0].workedExampleNumbers = [0]; },
    lesson => { lesson.teachingSequence[0].workedExampleNumbers = [lesson.workedExamples.length + 1]; },
    lesson => { lesson.teachingSequence[0].questionIds = ['missing']; },
    lesson => { lesson.teachingSequence[0].questionIds = ['q1', 'q1']; },
    lesson => { lesson.revisionGuide.practiceQuestionIds = ['q1', 'q1', 'q2']; },
    lesson => { lesson.revisionGuide.practiceQuestionIds = ['q1', 'q2', 'missing']; },
  ]) {
    const value = structuredClone(lessons[0]); change(value);
    assert.equal(learningLessonSchema.safeParse(value).success, false);
  }
});

test('sequence derivations agree with independent recurrence sums across boundary cases', () => {
  let checks = 0;
  for (const a of [-6, 0, 2, 5]) for (const d of [-3, 0, 0.5, 4]) for (let n = 1; n <= 20; n++) {
    let term = a, total = 0;
    for (let i = 1; i <= n; i++) { total += term; if (i < n) term += d; }
    assert.equal(term, a + (n - 1) * d);
    assert.equal(total, n * (a + term) / 2); checks++;
  }
  for (const a of [-6, 0, 2, 5]) for (const r of [-2, -1, 0, 0.5, 1, 2]) for (let n = 1; n <= 12; n++) {
    let term = a, total = 0;
    for (let i = 1; i <= n; i++) { total += term; if (i < n) term *= r; }
    // Mathematical equality treats +0 and -0 alike; Object.is-based strictEqual does not.
    // All chosen dyadic/integer cases are exact: no tolerance hides numerical discrepancies.
    assert.ok(term === (n === 1 ? a : a * r ** (n - 1)));
    assert.ok(total === (r === 1 ? n * a : a * (1 - r ** n) / (1 - r))); checks++;
  }
  assert.equal(checks, 608);
  for (const [a, r] of [[6, 2], [-6, -2]]) { assert.equal(a * r, 12); assert.equal(a * r ** 3, 48); }
});

test('IB framework links stay distinct from syllabus points, cohorts and course completion', async () => {
  const ib = sources.filter(source => source.programme.startsWith('IB_'));
  assert.equal(ib.length, 5);
  for (const source of ib.filter(source => source.programme === 'IB_MYP')) assert.equal(source.mappingKind, 'framework-skill');
  for (const source of ib.filter(source => source.programme === 'IB_DP')) {
    assert.equal(source.inspectionMode, 'official-indexed-excerpt');
    assert.equal(source.documentHash, undefined);
    assert.match(source.version, /First assessment 2021/);
    const invalid = structuredClone(source); invalid.documentHash = `sha256:${'0'.repeat(64)}`;
    assert.equal(syllabusSourcesSchema.safeParse({ schemaVersion: 1, sources: [invalid] }).success, false);
  }
  const scope = await buildCurriculumScope();
  for (const [subject, sourceId] of [['Math AA', 'ib-dp-aa-2021-sequences'], ['Math AI', 'ib-dp-ai-2021-sequences']]) {
    const course = scope.courses.find(course => course.programme === 'IB_DP' && course.subject === subject);
    assert.equal(course.sourceCheckedPartialMappings.length, 2);
    assert.ok(course.sourceCheckedPartialMappings.every(mapping => mapping.sourceId === sourceId));
    assert.equal(course.complete, false); assert.equal(course.requiredTopicCount, null);
  }
  assert.equal(scope.courses.find(course => course.programme === 'IB_MYP' && course.subject === 'Math Standard').sourceCheckedPartialMappings.length, 2);
});

test('publication verifier also catches held diagram, teaching and revision bodies in JavaScript', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'vertexed-module-leak-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const value of [lessons[0].diagrams[0].description, lessons[0].teachingSequence[0].guidance, lessons[0].revisionGuide.summary]) {
    await writeFile(join(directory, 'leak.js'), `window.fixture = ${JSON.stringify(value)};`);
    const report = await verifyPublishedContent(directory);
    assert.ok(report.violations.some(item => item.reason === 'held-learning-library-body'));
  }
});
