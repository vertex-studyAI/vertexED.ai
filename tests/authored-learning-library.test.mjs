import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, mkdtemp, mkdir, writeFile, cp, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { learningLessonSchema, renderLearningLesson } from '../contracts/learningLibrary.js';
import { readLearningLibrary, generateLearningLibrary } from '../scripts/generate-learning-library.mjs';
import { approvedStaticPaths, contentHash, enforcePublishedContent, publicationResponse } from '../scripts/content-publication.mjs';
import { verifyPublishedContent } from '../scripts/verify-published-content.mjs';
import { buildCurriculumScope } from '../scripts/report-curriculum-scope.mjs';
import { boardSubjects } from '../scripts/generate-content-coverage.mjs';
import { buildEcosystemReport } from '../scripts/report-content-ecosystem.mjs';
import { readSyllabusSources } from '../scripts/syllabus-sources.mjs';

const lessons = await readLearningLibrary();
const syllabusSources = await readSyllabusSources();
const find = id => structuredClone(lessons.find(lesson => lesson.id === id));

test('forty-two held review drafts retain authored material and provide a 25-prompt retrieval floor', () => {
  assert.equal(lessons.length, 42);
  assert.equal(new Set(lessons.map(lesson => lesson.subject)).size, 19);
  assert.equal(lessons.reduce((sum, lesson) => sum + lesson.flashcards.length, 0), 428);
  assert.equal(lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0), 1052);
  const latestIds = new Set(['atomic-models', 'mass-conservation', 'respiration-metabolism', 'probability-trees', 'searching-algorithms', 'words-in-context']);
  const multimediaIds = new Set(['arithmetic-sequences', 'geometric-sequences', 'scientific-investigation', 'design-evaluation']);
  for (const lesson of lessons) {
    assert.equal(learningLessonSchema.safeParse(lesson).success, true, lesson.id);
    assert.equal(lesson.editorialStatus, 'unreviewed');
    assert.equal(lesson.origin, 'original-authorship-review-pending');
    const expanded = Boolean(lesson.syllabusMappings?.length);
    const multimedia = multimediaIds.has(lesson.id);
    const latest = latestIds.has(lesson.id) || multimedia;
    assert.equal(lesson.revision, '2026-10-21.2');
    assert.equal(lesson.notes.length, expanded ? 7 : 5);
    assert.equal(lesson.workedExamples.length, latest ? 6 : expanded ? 5 : 4);
    assert.equal(lesson.flashcards.length, latest ? 14 : expanded ? 12 : 8);
    const authoredQuestions = lesson.questions.filter(question => !question.id.startsWith('retrieval-'));
    const authoredCount = lesson.id === 'derivative-definition' ? 27 : latest ? 12 : expanded ? 10 : 7;
    assert.equal(authoredQuestions.length, authoredCount, `${lesson.id} retains its authored question set`);
    assert.equal(lesson.questions.length, Math.max(25, authoredCount), `${lesson.id} meets the retrieval floor`);
    if (latest) assert.ok(lesson.notes.flatMap(section => section.paragraphs).join(' ').split(/\s+/).length >= 900);
    if (expanded) assert.ok(lesson.notes.flatMap(section => section.paragraphs).join(' ').split(/\s+/).length >= 700);
    assert.ok(lesson.notes.flatMap(section => section.paragraphs).join(' ').split(/\s+/).length >= 220);
    for (const question of lesson.questions) assert.equal(question.marks, question.markingPoints.length);
  }
});

test('every numeric answer field is checked against a separately expressed calculation', () => {
  // These calculations are explicit independent oracles, never derived from the stored answer.
  // They do not certify every prose explanation, MCQ key, worked example or syllabus claim.
  const oracles = {
    'accounting-equation:q1': 18000 - 6500,
    'accounting-equation:q4': 8000 + 1500 + 2200 - 700,
    'algorithms-and-invariants:q1': (2 + 3) * 2,
    'business-costs:q2': 900 / (20 - 14),
    'business-costs:q3': 180 * 8 - 1000,
    'cell-transport:q1': (3.6 - 4) / 4 * 100,
    'chemical-amounts:q1': 22 / 44,
    'chemical-amounts:q3': Math.min(2 / 1, 3 / 3) * 2,
    'data-representation:q1': parseInt('1101', 2),
    'data-representation:q3': 16 * 16 * 24 / 8,
    'demand-and-supply:q2': (90 - 10) / (1 + 3),
    'electric-circuits:q1': 0.5 * 40,
    'electric-circuits:q3': 1 / (1 / 4 + 1 / 12),
    'geographical-fieldwork:q2': [12, 16, 20, 24].reduce((a, b) => a + b, 0) / 4,
    'inheritance-probability:q2': ['AA', 'Aa', 'aA', 'aa'].filter(pair => pair[0] !== pair[1]).length / 4,
    'inheritance-probability:q3': (1 / 2) ** 2,
    'linear-equations:q1': (30 + 5) / 7,
    'linear-equations:q4': Math.floor((29 - 8) / 3),
    'motion-and-forces:q1': 12 / 4,
    'motion-and-forces:q3': 0.5 * 2 * 5 ** 2,
    'quadratic-models:q2': (7 + Math.sqrt(49 - 48)) / 2,
    'quadratic-models:q4': (24 / 4) ** 2,
    'ecosystem-energy:q2': 120 / 1600 * 100,
    'sampling-and-uncertainty:q2': 16 / Math.sqrt(64),
    'simultaneous-systems:q2': (22 + 2 * 4) / (3 + 2),
    'simultaneous-systems:q6': (104 - 20 * 4) / (7 - 4),
    'quadratic-structure:q2': 13 - (10 / 2) ** 2,
    'quadratic-structure:q4': (-6) ** 2 / 4,
    'exponential-change:q2': 640 / 2 ** (9 / 3),
    'exponential-change:q4': Math.sqrt(200 / 50),
    'exponential-change:q6': [0, 1, 2, 3, 4, 5].find(n => 5 * 3 ** n >= 400),
    'derivative-definition:q2': 2 * 2 * 4,
    'derivative-definition:q4': (11.4 - 10.2) / (5.2 - 4.8),
    'derivative-definition:q9': ((4**2+2*4)-(1**2+2*1))/(4-1),
    'derivative-definition:q16': (20-21.4)/(3.4-2.7),
    'derivative-definition:q22': 3.1**2-(9+6*0.1),
    'wave-superposition:q2': 0.75 / 0.005,
    'wave-superposition:q4': 2 * 96 / (2 * 1.2),
    'wave-superposition:q6': 360 * 0.20 / 0.80,
    'photosynthesis-limits:q2': 7.5 / 5,
    'photosynthesis-limits:q4': 100 * (10 / 30) ** 2,
    'atomic-models:q2': 34 - 16,
    'atomic-models:q4': (70 * 10 + 30 * 11) / 100,
    'atomic-models:q6': 20 - 2,
    'mass-conservation:q2': 24 + 2 * 16 + 2,
    'mass-conservation:q4': 3 * 16 / (40 + 12 + 3 * 16) * 100,
    'mass-conservation:q6': (4.18 - 4.10) / 2,
    'respiration-metabolism:q2': 42 / 105 * 60,
    'respiration-metabolism:q4': (1.20 - 0.30) / 0.30 * 100,
    'respiration-metabolism:q6': 0.40 * 5,
    'probability-trees:q2': 3 / 5 * 2 / 4,
    'probability-trees:q4': 3 / 5 * 2 / 4 + 2 / 5 * 3 / 4,
    'probability-trees:q6': 8 / 20,
    'searching-algorithms:q2': [7, 2, 9, 4, 12].indexOf(4) + 1,
    'searching-algorithms:q4': [10, 16, 13].length,
    'searching-algorithms:q6': Array.from({ length: 12 }).length,
    'arithmetic-sequences:q2': 13 - 2 * 24,
    'arithmetic-sequences:q3': 14 - 2 * ((38 - 14) / 6),
    'arithmetic-sequences:q4': Array.from({ length: 20 }, (_, i) => 3 + 5 * i).reduce((a, b) => a + b, 0),
    'arithmetic-sequences:q6': [4, 5, 6, 7, 8, 9].map(k => 3 * k + 1).reduce((a, b) => a + b, 0),
    'arithmetic-sequences:q10': Array.from({ length: 12 }, (_, i) => 16 + 2 * (i + 6)).reduce((a, b) => a + b, 0),
    'geometric-sequences:q2': Array.from({ length: 7 }).reduce(value => value * 2, 5),
    'geometric-sequences:q3': [4, 12, 36, 108, 324, 972].reduce((a, b) => a + b, 0),
    'geometric-sequences:q4': Array.from({ length: 4 }).reduce(value => value * 3 / 4, 320),
    'geometric-sequences:q6': [6, 12, 24, 48, 96].reduce((a, b) => a + b, 0),
    'geometric-sequences:q10': [6, -12, 24, -48, 96].reduce((a, b) => a + b, 0),
    'scientific-investigation:q2': [31, 34, 37].reduce((a, b) => a + b, 0) / 3,
    'scientific-investigation:q3': (Math.max(31, 34, 37) - Math.min(31, 34, 37)) / 2,
    'scientific-investigation:q9': (50 / 40 - 1) * 100,
    'design-evaluation:q3': 4 * 3 + 3 * 2,
    'design-evaluation:q6': 9 / 12 * 100,
  };
  const checked = [];
  for (const lesson of lessons) for (const question of lesson.questions) if (question.numericAnswer) {
    const id = `${lesson.id}:${question.id}`;
    assert.ok(Object.hasOwn(oracles, id), `Unverified numeric key: ${id}`);
    assert.ok(Math.abs(question.numericAnswer.value - oracles[id]) <= Math.max(question.numericAnswer.tolerance, 1e-12), id);
    checked.push(id);
  }
  assert.equal(checked.length, 71);
  assert.deepEqual(new Set(checked), new Set(Object.keys(oracles)));
});

test('the authored MCQ bank does not reveal every key through answer position', () => {
  const positions = [0, 0, 0, 0];
  for (const lesson of lessons) for (const question of lesson.questions) if (question.type === 'mcq') {
    positions[question.options.indexOf(question.answer)] += 1;
  }
  assert.deepEqual(positions, [13, 13, 13, 13]);
});

test('schema rejects answer-key, mark, duplicate, brevity and unsupported-field defects', () => {
  for (const change of [
    lesson => { lesson.questions.find(q => q.type === 'mcq').answer = 'A fabricated absent option'; },
    lesson => { const q = lesson.questions.find(q => q.type === 'mcq'); q.options[1] = ` ${q.options[0]} `; },
    lesson => { lesson.questions[0].marks += 1; },
    lesson => { lesson.questions[1].prompt = ` ${lesson.questions[0].prompt.toUpperCase()} `; },
    lesson => { lesson.flashcards[1].front = lesson.flashcards[0].front; },
    lesson => { lesson.flashcards[1].id = lesson.flashcards[0].id; },
    lesson => { lesson.notes = lesson.notes.map(section => ({ ...section, paragraphs: ['Too short.'] })); },
    lesson => { lesson.editorialStatus = 'approved'; },
    lesson => { lesson.citation = 'Invented source'; },
  ]) {
    const lesson = find('inheritance-probability');
    change(lesson);
    assert.equal(learningLessonSchema.safeParse(lesson).success, false);
  }
  assert.equal(learningLessonSchema.safeParse(find('inheritance-probability')).success, true, 'Aa, AA and aa are meaningfully different options');
});

test('generated JSON, reviewer Markdown and exact hashes are reproducible', async () => {
  const manifest = await generateLearningLibrary({ check: true });
  for (const entry of manifest.entries) {
    const lesson = find(entry.id);
    const json = await readFile(`public${entry.json}`, 'utf8');
    const markdown = await readFile(`public${entry.markdown}`, 'utf8');
    assert.deepEqual(JSON.parse(json), lesson);
    assert.equal(contentHash(json), entry.contentHash);
    assert.equal(contentHash(markdown), entry.markdownHash);
    assert.equal(markdown, renderLearningLesson(lesson, syllabusSources));
    assert.match(markdown, /Review draft — not independently approved/);
    assert.match(markdown, /not official exam marks/);
    for (const question of lesson.questions) {
      assert.ok(markdown.includes(question.prompt));
      assert.ok(markdown.includes(question.answer));
      for (const point of question.markingPoints) assert.ok(markdown.includes(point));
    }
  }
});

test('unapproved library assets and manifest entries are held in preview', async () => {
  assert.deepEqual([...await approvedStaticPaths()], []);
  for (const lesson of lessons) for (const extension of ['json', 'md']) {
    assert.equal((await publicationResponse(`/learning-library/${lesson.id}.${extension}?download=1`)).status, 403);
  }
  assert.deepEqual((await publicationResponse('/learning-library/manifest.json')).body.entries, []);
  assert.equal((await publicationResponse('/%6cearning-library/linear-equations.json')).status, 403);
});

test('manifest approval cannot grant approval to a lesson or its export', async t => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-library-approval-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'public/learning-library'), { recursive: true });
  const body = '{"draft":"not a real approval"}\n';
  const md = '# Draft\n';
  const manifest = JSON.stringify({ entries: [{ json: '/learning-library/one.json', markdown: '/learning-library/one.md' }] });
  await writeFile(join(root, 'public/learning-library/one.json'), body);
  await writeFile(join(root, 'public/learning-library/one.md'), md);
  await writeFile(join(root, 'public/learning-library/manifest.json'), manifest);
  const reviewed = (path, text) => ({ path, editorialStatus: 'approved', publicationStatus: 'published',
    source: 'https://example.edu/fixture-only', factualReviewer: 'Test fixture, not actual review',
    reviewedAt: '2026-01-01', license: 'original-authorised', permittedUse: 'public-study',
    contentVersion: 'fixture', answerVersion: 'fixture', contentHash: contentHash(text) });
  const approvals = [reviewed('/learning-library/manifest.json', manifest)];
  assert.deepEqual((await publicationResponse('/learning-library/manifest.json', { root, approvals })).body.entries, []);
  approvals.push(reviewed('/learning-library/one.json', body));
  const entry = (await publicationResponse('/learning-library/manifest.json', { root, approvals })).body.entries[0];
  assert.equal(entry.markdown, null, 'Markdown needs its own exact review hash');
  assert.equal(await publicationResponse('/learning-library/one.json', { root, approvals }), null);
  await writeFile(join(root, 'public/learning-library/one.json'), `${body} `);
  assert.equal((await publicationResponse('/learning-library/one.json', { root, approvals })).status, 403);
  await cp(join(root, 'public'), join(root, 'build'), { recursive: true });
  await enforcePublishedContent(join(root, 'build'), { root, approvals });
  assert.deepEqual(JSON.parse(await readFile(join(root, 'build/learning-library/manifest.json'), 'utf8')).entries, []);
});

test('build verifier detects leaked library files, manifests and bundled teaching strings', async t => {
  const output = await mkdtemp(join(tmpdir(), 'vertexed-library-build-'));
  t.after(() => rm(output, { recursive: true, force: true }));
  await cp('public/learning-library', join(output, 'learning-library'), { recursive: true });
  await writeFile(join(output, 'app.js'), 'window.testBuild = true;');
  const before = await verifyPublishedContent(output);
  assert.equal(before.status, 'FAIL');
  assert.ok(before.violations.some(item => item.reason === 'unfiltered-learning-library-manifest'));
  assert.equal(before.violations.filter(item => item.reason === 'held-static-asset').length, 84);
  const receipt = await enforcePublishedContent(output);
  assert.equal(receipt.heldAssetsRemoved, 84);
  assert.equal((await verifyPublishedContent(output)).status, 'PASS');
  await assert.rejects(access(join(output, 'learning-library/linear-equations.json')));
  assert.equal(JSON.parse(await readFile('public/learning-library/manifest.json', 'utf8')).entries.length, 42, 'source files are retained');
  await writeFile(join(output, 'app.js'), `window.leaked = ${JSON.stringify(lessons[0].notes[0].paragraphs[0])};`);
  assert.ok((await verifyPublishedContent(output)).violations.some(item => item.reason === 'held-learning-library-body'));
});

test('scope register inventories every product subject without converting foundation reuse into verified coverage', async () => {
  const scope = await buildCurriculumScope();
  const persisted = JSON.parse(await readFile('docs/evidence/curriculum-scope-20261019.json', 'utf8'));
  assert.deepEqual(scope, persisted);
  assert.equal(scope.summary.programmes, 10);
  assert.equal(scope.summary.subjectEntries, 129);
  assert.equal(scope.summary.completedCourses, 0);
  const configs = await boardSubjects([]);
  for (const [programme, config] of Object.entries(configs)) for (const subject of config.subjects) {
    assert.ok(scope.courses.some(course => course.programme === programme && course.subject === subject), `${programme}/${subject}`);
  }
  assert.equal(scope.courses.filter(course => course.programme === 'AP').length, 42);
  assert.ok(scope.courses.some(course => course.programme === 'IB_DP' && course.subject === 'Computer Science'));
  for (const course of scope.courses) {
    assert.equal(course.complete, false);
    assert.equal(course.requiredTopicCount, null);
    assert.equal(course.verifiedCoveragePercent, null);
    assert.equal(course.verifiedTopicCount, 0);
    for (const candidate of course.reuseCandidates) {
      assert.equal(candidate.alignment, 'candidate-only');
      assert.ok(lessons.some(lesson => lesson.id === candidate.lessonId));
    }
  }
  const ecosystem = await buildEcosystemReport();
  assert.deepEqual(ecosystem, JSON.parse(await readFile('docs/evidence/content-ecosystem-20261019.json', 'utf8')));
  assert.equal(ecosystem.authoredLearningLibrary.questions, 1052);
  assert.equal(ecosystem.authoredLearningLibrary.approvedLessons, 0);
  assert.equal(ecosystem.programmes.find(programme => programme.programme === 'SAT').authoredRecords, 0, 'generic foundations do not count as SAT-aligned records');
});
