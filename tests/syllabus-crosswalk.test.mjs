import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { learningLessonSchema, renderLearningLesson } from '../contracts/learningLibrary.js';
import { readLearningLibrary } from '../scripts/generate-learning-library.mjs';
import { readSyllabusSources, syllabusSourcesSchema, validateLessonMappings } from '../scripts/syllabus-sources.mjs';
import { buildSyllabusCrosswalk } from '../scripts/report-syllabus-crosswalk.mjs';
import { contentHash } from '../scripts/content-publication.mjs';
import { loadFoundationLesson } from '../src/lib/foundationLibrary.mjs';

const lessons = await readLearningLibrary();
const sources = await readSyllabusSources();
const mapped = lessons.filter(lesson => lesson.syllabusMappings?.length);
const copy = () => structuredClone(mapped[0]);

test('official source register retains editions, snapshot limits and PDF identities', () => {
  assert.equal(sources.length, 16);
  assert.equal(syllabusSourcesSchema.safeParse({ schemaVersion: 1, sources }).success, true);
  assert.equal(sources.filter(source => source.documentHash).length, 2);
  for (const source of sources) {
    assert.equal(source.checkedOn, '2026-10-19');
    assert.ok(source.version.length > 20);
    assert.ok(source.locator.length > 10);
    assert.ok(source.limitations.length > 20);
  }
  for (const change of [
    source => { source.url = 'https://unverified.example/spec'; },
    source => { source.url = 'https://www.aqa.org.uk.evil.example/spec'; },
    source => { source.url = 'http://www.aqa.org.uk/spec'; },
    source => { source.url = 'https://user:password@www.aqa.org.uk/spec'; },
    source => { source.checkedOn = 'not-a-date'; },
    source => { source.documentHash = 'invented'; },
    source => { source.points.push(source.points[0]); },
  ]) {
    const mutated = structuredClone(sources); change(mutated[0]);
    assert.equal(syllabusSourcesSchema.safeParse({ schemaVersion: 1, sources: mutated }).success, false);
  }
  assert.equal(syllabusSourcesSchema.safeParse({ schemaVersion: 1, sources: [...sources, sources[0]] }).success, false);
});

test('crosswalk reports partial source-backed links without claiming independent review or full courses', async () => {
  const report = await buildSyllabusCrosswalk();
  assert.deepEqual(report, JSON.parse(await readFile('docs/evidence/syllabus-crosswalk-20261019.json', 'utf8')));
  assert.equal(report.summary.mappingLinks, 55);
  assert.equal(report.summary.distinctSourcePoints, 52);
  assert.equal(report.summary.mappedLessons, 18);
  assert.deepEqual(report.summary.programmesWithPartialMappings, ['AP', 'A_LEVELS', 'GCSE', 'IB_DP', 'IB_MYP', 'IGCSE', 'SAT']);
  assert.equal(report.summary.completedCourses, 0);
  assert.equal(report.summary.independentlyVerifiedMappings, 0);
  for (const mapping of report.mappings) {
    const lesson = lessons.find(lesson => lesson.id === mapping.lessonId);
    const source = sources.find(source => source.id === mapping.sourceId);
    assert.equal(mapping.contentHash, contentHash(`${JSON.stringify(lesson)}\n`));
    assert.equal(mapping.sourceRecordHash, contentHash(JSON.stringify(source)));
    assert.equal(mapping.coverageCredit, false);
    assert.equal(mapping.independentReview, 'pending');
    assert.ok(mapping.remaining.length);
    assert.ok(source.points.includes(mapping.point));
  }
});

test('mapping rejects missing evidence, invented points, subject mismatch and inflated status', () => {
  for (const change of [
    lesson => { lesson.syllabusMappings[0].noteHeadings = ['No such notes']; },
    lesson => { lesson.syllabusMappings[0].questionIds = ['missing-question']; },
    lesson => { lesson.syllabusMappings[0].remaining = []; },
    lesson => { lesson.syllabusMappings[0].status = 'complete'; },
    lesson => { lesson.syllabusMappings.push(lesson.syllabusMappings[0]); },
    lesson => { lesson.syllabusMappings[0].questionIds.push(lesson.syllabusMappings[0].questionIds[0]); },
  ]) {
    const lesson = copy(); change(lesson);
    assert.equal(learningLessonSchema.safeParse(lesson).success, false);
  }
  for (const change of [
    lesson => { lesson.syllabusMappings[0].sourceId = 'fabricated-source'; },
    lesson => { lesson.syllabusMappings[0].point = 'invented-objective'; },
    lesson => { lesson.subject = 'History'; },
  ]) {
    const lesson = copy(); change(lesson);
    assert.throws(() => validateLessonMappings([lesson], sources), /Unregistered|mismatch/);
  }
});

test('reviewer exports preserve official URLs, versions and missing coverage', () => {
  for (const lesson of mapped) {
    const text = renderLearningLesson(lesson, sources);
    for (const mapping of lesson.syllabusMappings) {
      const source = sources.find(source => source.id === mapping.sourceId);
      assert.ok(text.includes(source.url));
      assert.ok(text.includes(source.version));
      assert.ok(text.includes(mapping.point));
      for (const gap of mapping.remaining) assert.ok(text.includes(gap));
    }
    assert.match(text, /not independently approved/);
    assert.throws(() => renderLearningLesson(lesson, []), /Missing inspected source/);
  }
});

test('additional algebra and calculus examples satisfy independent reconstruction checks', () => {
  // These bounded checks do not assert semantic correctness of all prose answers.
  const roots = [-1, 4];
  for (const x of roots) assert.equal(x * x, 3 * x + 4);
  for (const x of [-2, 1.5]) assert.equal(2 * x * x + x - 6, 0);
  for (const x of [2 - Math.sqrt(5), 2 + Math.sqrt(5)]) assert.ok(Math.abs(x*x-4*x-1)<1e-12);
  for (let x = -10; x <= 10; x++) {
    assert.equal(2*x*x-12*x+7, 2*(x-3)**2-11);
    assert.equal(x*x+8*x+5, (x+4)**2-11);
    const h = 0.125;
    const f = value => 3*value**2-2*value+4;
    assert.equal((f(x+h)-f(x))/h, 6*x+3*h-2);
  }
  assert.equal(40-3*0.1, 39.7);
  assert.equal(15*2**1, 30); assert.equal(15*2**3, 120);
  assert.equal(6*2**4, 96); assert.equal(6*2**5, 192);
  const waveFrequency = Math.sqrt(64/0.004)/2;
  assert.ok(Math.abs(waveFrequency-63.25)<0.005);
});

test('all eighteen mapped lessons traverse the existing integrity-checked reader loader', async () => {
  const manifest = JSON.parse(await readFile('public/learning-library/manifest.json', 'utf8'));
  assert.equal(mapped.length, 18);
  for (const lesson of mapped) {
    const entry = manifest.entries.find(entry => entry.id === lesson.id);
    const body = await readFile(`public${entry.json}`, 'utf8');
    const loaded = await loadFoundationLesson(entry, undefined, async () => new Response(body));
    assert.deepEqual(loaded, lesson);
    assert.equal(loaded.questions.length, lesson.id === 'derivative-definition' ? 27 : lesson.workedExamples.length === 5 ? 10 : 12);
    assert.equal(loaded.flashcards.length, lesson.workedExamples.length === 5 ? 12 : 14);
    assert.equal(loaded.notes.length, 7);
  }
});
