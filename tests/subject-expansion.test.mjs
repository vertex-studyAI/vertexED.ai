import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { learningLessonSchema } from '../contracts/learningLibrary.js';
import { readLearningLibrary, readSubjectExpansion } from '../scripts/generate-learning-library.mjs';
import { buildSubjectPathways } from '../scripts/report-subject-pathways.mjs';
import { contentHash, publicationResponse } from '../scripts/content-publication.mjs';

const additions = await readSubjectExpansion();
const find = suffix => additions.find(lesson => lesson.id === `subject-${suffix}`);
const answer = (suffix, id) => find(suffix).questions.find(question => question.id === id).answer;
const rounded = n => Number(n.toFixed(10));

test('17 original additions supply usable study modes, coherent references and distinct practice', async () => {
  assert.equal(additions.length, 17);
  const all = await readLearningLibrary();
  assert.equal(all.length, 91);
  assert.equal(new Set(all.map(lesson => lesson.subject)).size, 23);
  const prompts = [];
  for (const lesson of additions) {
    assert.equal(learningLessonSchema.safeParse(lesson).success, true, lesson.id);
    assert.equal(lesson.revision, '2026-10-21.4');
    assert.equal(lesson.editorialStatus, 'unreviewed');
    assert.equal(lesson.syllabusMappings, undefined);
    assert.ok(lesson.notes.flatMap(note => note.paragraphs).join(' ').split(/\s+/).length >= 250);
    assert.equal(lesson.workedExamples.length, 2);
    assert.equal(lesson.flashcards.length, 5);
    assert.equal(lesson.questions.length, 4);
    assert.equal(lesson.diagrams.length, 1);
    assert.equal(lesson.teachingSequence.length, 3);
    assert.deepEqual(new Set(lesson.teachingSequence.flatMap(stage => stage.questionIds)), new Set(lesson.questions.map(question => question.id)));
    assert.deepEqual(new Set(lesson.revisionGuide.practiceQuestionIds), new Set(lesson.questions.map(question => question.id)));
    for (const question of lesson.questions) {
      assert.equal(question.type, 'extended');
      assert.equal(question.numericAnswer, undefined, 'new work requires reasoning self-review, not automatic full marks');
      assert.equal(question.marks, question.markingPoints.length);
      assert.ok(question.solution.length >= 2);
      assert.ok(!lesson.flashcards.some(card => card.front === question.prompt));
      prompts.push(question.prompt);
    }
    for (const formula of lesson.revisionGuide.formulas) assert.ok(formula.conditions.length > 20);
  }
  assert.equal(prompts.length, 68);
  assert.equal(new Set(prompts).size, 68);
  assert.deepEqual(find('academic-synthesis').teachingSequence[0].questionIds, ['synthesis']);
  assert.deepEqual(find('ratio-proportion').teachingSequence[1].questionIds, ['inverse']);
  assert.match(find('ratio-proportion').teachingSequence[1].guidance, /rate multiplied by time/);
  assert.deepEqual(find('matrices').teachingSequence[2].questionIds, ['inverse', 'singular']);
  assert.match(find('integration').revisionGuide.formulas[0].conditions, /n≠−1/);
});

test('numerical open-response keys match independently expressed calculations', () => {
  const exact = [
    ['ratio-proportion', 'direct', `k=${15 / 6} and y=${15 / 6 * 14}.`],
    ['ratio-proportion', 'inverse', `${12 * 5 / 8} minutes.`],
    ['ratio-proportion', 'area', `${8 * Math.sqrt(45 / 20)} cm.`],
    ['right-triangles', 'hypotenuse', `${rounded(7 / Math.sin(Math.PI / 6))} cm.`],
    ['right-triangles', 'angle', `${Math.atan(9 / 9) * 180 / Math.PI}°.`],
    ['right-triangles', 'bearing', `${(65 + 180) % 360}°.`],
    ['right-triangles', 'height', `${rounded(1.6 + 12 * Math.tan(Math.PI / 4))} m.`],
    ['integration', 'definite', `${3 ** 3 - 1 ** 3}.`],
    ['integration', 'initial', `${10 + 2 * 2 ** 2} L.`],
    ['thermal-energy', 'heating', `${(2 * 500 * 12).toLocaleString('en-US')} J.`],
    ['thermal-energy', 'latent', `${(0.2 * 300000).toLocaleString('en-US')} J.`],
    ['thermal-energy', 'power-time', `${18000 / 150} s.`],
    ['reaction-rates', 'interval', `${(48 - 12) / (25 - 5)} cm³/s.`],
    ['complexity', 'triangle', `${[1, 2, 3, 4, 5, 6].reduce((a, b) => a + b, 0)}.`],
    ['river-processes', 'discharge', `${rounded(5 * 1.2 * 0.8)} m³/s.`],
    ['market-failure', 'social-cost', `${12 + 5} per additional unit.`],
    ['business-cashflow', 'balance', `${250 + 780 - 910} units.`],
    ['business-cashflow', 'two-periods', `${120 + 500 - 760} units, indicating a projected financing shortfall.`],
    ['business-cashflow', 'working-capital', `${(4200 - 3100).toLocaleString('en-US')} units; it may include inventory and receivables as well as cash.`],
  ];
  for (const [suffix, id, expected] of exact) assert.equal(answer(suffix, id), expected, `${suffix}/${id}`);
  const elapsed = (12 * 60 + 50) - (9 * 60 + 20);
  assert.equal(answer('river-processes', 'lag'), `${Math.floor(elapsed / 60)} hours ${elapsed % 60} minutes.`);
  assert.equal(answer('natural-selection', 'frequency'), `${18 / 6}/${60 / 6} and ${18 / 60 * 100}%.`);
  const velocityPrimitive = t => t ** 2 / 2 - 2 * t;
  const displacement = velocityPrimitive(4) - velocityPrimitive(0);
  const distance = Math.abs(velocityPrimitive(2) - velocityPrimitive(0)) + Math.abs(velocityPrimitive(4) - velocityPrimitive(2));
  assert.equal(answer('integration', 'cancellation'), `Displacement ${displacement} m; distance ${distance} m.`);
  const apply = (matrix, vector) => matrix.map(row => row.reduce((sum, value, i) => sum + value * vector[i], 0));
  assert.equal(answer('matrices', 'product'), `The output is (${apply([[3, -1], [2, 0]], [2, 5]).join(',')}).`);
  const a = [[2, 0], [0, 1]], b = [[0, -1], [1, 0]], v = [1, 0];
  assert.equal(answer('matrices', 'order'), `ABv=(${apply(a, apply(b, v)).join(',')}), while BAv=(${apply(b, apply(a, v)).join(',')}).`);
  const determinant = 2 * 1 - 1 * 1;
  assert.equal(answer('matrices', 'inverse'), `det A=${determinant}; A⁻¹ has rows (${1 / determinant},${-1 / determinant}),(${-1 / determinant},${2 / determinant}).`);
  assert.equal(answer('matrices', 'singular'), `k=${2 * 3 / 6}.`);
});

test('selected worked examples and qualitative caveats preserve mathematical and evidence boundaries', () => {
  assert.equal(find('ratio-proportion').workedExamples[0].answer, `${18 / 2.4 * 3.2} units.`);
  assert.equal(find('ratio-proportion').workedExamples[1].answer, `${(64 * (5 / 2) ** 3).toLocaleString('en-US')} cm³.`);
  assert.equal(find('right-triangles').workedExamples[1].answer, `${Math.hypot(6, 8)} km.`);
  assert.equal(find('thermal-energy').workedExamples[0].answer, `${(0.5 * 800 * (35 - 20)).toLocaleString('en-US')} J.`);
  assert.equal(find('thermal-energy').workedExamples[1].answer, `${9000 / (200 * 60) * 100}%.`);
  assert.equal(find('river-processes').workedExamples[0].answer, `${4 * 0.75 * 2} m³/s.`);
  assert.equal(find('river-processes').workedExamples[1].answer, `${(17 * 60 + 30 - 13 * 60) / 60} hours.`);
  assert.match(answer('thermal-energy', 'loss-bias'), /overestimates/);
  assert.match(answer('reaction-rates', 'catalyst'), /enthalpy change remain unchanged/);
  assert.match(answer('knowledge-claims', 'method'), /finite checking alone does not prove/);
  assert.match(answer('academic-synthesis', 'scope'), /population, outcome and timescale/);
  assert.match(answer('research-design', 'mixed'), /All five/);
  assert.match(find('academic-synthesis').workedExamples[1].prompt, /programme was associated with improvement/);
});

test('all 129 scoped entries plus nine MYP catalogue subjects have real held-resource links', async () => {
  const report = await buildSubjectPathways();
  assert.deepEqual(report, JSON.parse(await readFile('docs/evidence/subject-pathways-20261021.json', 'utf8')));
  assert.deepEqual(report.summary, { programmes: 10, scopedSubjects: 129, supplementalMypSubjects: 9, pathways: 138,
    pathwaysWithResources: 138, priorityPlanningTargets: 30, completedCourses: 0, newLessons: 17, addedNoteWords: 4449,
    addedQuestions: 68, addedWorkedExamples: 34, addedFlashcards: 85, addedDiagrams: 17,
    totalSharedLessons: 91, totalSharedQuestions: 803, totalSharedCards: 673 });
  assert.equal(new Set(report.pathways.map(item => `${item.programme}/${item.subject}`)).size, 138);
  for (const pathway of report.pathways) {
    assert.equal(pathway.complete, false);
    assert.equal(pathway.verifiedCoveragePercent, null);
    assert.ok(pathway.missing.length);
    assert.ok(pathway.courseResources.length || pathway.sharedStudyCandidates.length);
    for (const item of pathway.courseResources) {
      if (item.sourceFile) assert.equal(contentHash(await readFile(item.sourceFile, 'utf8')), item.sourceHash);
      if (item.asset) assert.equal(contentHash(await readFile(`public${item.asset}`, 'utf8')), item.contentHash);
    }
    for (const item of pathway.sharedStudyCandidates) {
      assert.equal(contentHash(await readFile(`public${item.asset}`, 'utf8')), item.contentHash);
      assert.equal(item.alignment, 'subject-family-candidate-only');
      assert.equal((await publicationResponse(item.asset)).status, 403);
    }
  }
  for (const receipt of report.newLessonReceipts) {
    assert.equal(contentHash(await readFile(receipt.sourceFile, 'utf8')), receipt.sourceHash);
    assert.equal(receipt.editorialStatus, 'unreviewed');
  }
  const ap = report.pathways.filter(item => item.programme === 'AP').flatMap(item => item.courseResources);
  assert.equal(ap.length, 42);
  assert.equal(ap.reduce((sum, item) => sum + item.questions, 0), 1115);
  const myp = report.pathways.filter(item => item.programme === 'IB_MYP').flatMap(item => item.courseResources);
  assert.equal(myp.length, 17);
  assert.equal(myp.reduce((sum, item) => sum + item.lessons, 0), 205);
});

test('2027 planning targets preserve syllabus transitions without awarding coverage', async () => {
  const { pathways } = await buildSubjectPathways();
  const target = (programme, subject) => pathways.find(item => item.programme === programme && item.subject === subject).planningTarget;
  assert.equal(target('IGCSE', 'Business Studies').qualificationCode, '0264');
  assert.equal(target('A_LEVELS', 'Business').qualificationCode, '7132');
  assert.match(target('A_LEVELS', 'Business').transitionNote, /2028/);
  assert.equal(target('IGCSE', 'Computer Science').syllabusWindow, '2026–2028');
  assert.match(target('IGCSE', 'Computer Science').transitionNote, /Do not import 2029/);
  assert.match(target('IGCSE', 'English').unresolved[0], /first- or second-language/);
  assert.equal(target('A_LEVELS', 'English Literature').authoringOptions.qualificationCode, '7712');
  assert.equal(target('A_LEVELS', 'English Literature').authoringOptions.status, 'selected-authoring-default-not-school-entry');
  for (const item of pathways.filter(item => item.planningTarget)) {
    assert.equal(item.planningTarget.targetExamYear, 2027);
    assert.equal(item.planningTarget.status, 'planning-default-not-confirmed-learner-entry');
    assert.equal(item.complete, false);
  }
});
