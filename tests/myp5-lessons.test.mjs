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
const { MYP5_MATHEMATICS_COMPLETION } = await importTypeScriptModule('src/content/myp5MathematicsCompletion.ts');
const { MYP5_PHYSICS_COMPLETION } = await importTypeScriptModule('src/content/myp5PhysicsCompletion.ts');
const { MYP5_CHEMISTRY_COMPLETION } = await importTypeScriptModule('src/content/myp5ChemistryCompletion.ts');
const { MYP5_BIOLOGY_COMPLETION } = await importTypeScriptModule('src/content/myp5BiologyCompletion.ts');
const { MYP5_INTEGRATED_SCIENCES_COMPLETION } = await importTypeScriptModule('src/content/myp5IntegratedSciencesCompletion.ts');
const { MYP5_ENGLISH_COMPLETION } = await importTypeScriptModule('src/content/myp5EnglishCompletion.ts');
const { MYP5_HISTORY_COMPLETION } = await importTypeScriptModule('src/content/myp5HistoryCompletion.ts');
const { MYP5_ECONOMICS_COMPLETION } = await importTypeScriptModule('src/content/myp5EconomicsCompletion.ts');
const { MYP5_GEOGRAPHY_COMPLETION } = await importTypeScriptModule('src/content/myp5GeographyCompletion.ts');
const { MYP5_INTEGRATED_HUMANITIES_COMPLETION } = await importTypeScriptModule('src/content/myp5IntegratedHumanitiesCompletion.ts');
const { MYP5_SPANISH_COMPLETION } = await importTypeScriptModule('src/content/myp5SpanishCompletion.ts');
const { MYP5_PHE_COMPLETION } = await importTypeScriptModule('src/content/myp5PheCompletion.ts');
const { MYP5_PERSONAL_PROJECT_COMPLETION } = await importTypeScriptModule('src/content/myp5PersonalProjectCompletion.ts');
const { MYP5_ARTS_COMPLETION } = await importTypeScriptModule('src/content/myp5ArtsCompletion.ts');
const { MYP5_DESIGN_COMPLETION } = await importTypeScriptModule('src/content/myp5DesignCompletion.ts');
const lessonSource = fs.readFileSync('src/content/myp5Lessons.ts', 'utf8')
  .replace("import { MYP5_LESSON_EXPANSION } from './myp5LessonExpansion';", '')
  .replace("import { MYP5_MATHEMATICS_COMPLETION } from './myp5MathematicsCompletion';", '')
  .replace("import { MYP5_PHYSICS_COMPLETION } from './myp5PhysicsCompletion';", '')
  .replace("import { MYP5_CHEMISTRY_COMPLETION } from './myp5ChemistryCompletion';", '')
  .replace("import { MYP5_BIOLOGY_COMPLETION } from './myp5BiologyCompletion';", '')
  .replace("import { MYP5_INTEGRATED_SCIENCES_COMPLETION } from './myp5IntegratedSciencesCompletion';", '')
  .replace("import { MYP5_ENGLISH_COMPLETION } from './myp5EnglishCompletion';", '')
  .replace("import { MYP5_HISTORY_COMPLETION } from './myp5HistoryCompletion';", '')
  .replace("import { MYP5_SPANISH_COMPLETION } from './myp5SpanishCompletion';", '')
  .replace("import { MYP5_PHE_COMPLETION } from './myp5PheCompletion';", '')
  .replace("import { MYP5_PERSONAL_PROJECT_COMPLETION } from './myp5PersonalProjectCompletion';", '')
  .replace("import { MYP5_ARTS_COMPLETION } from './myp5ArtsCompletion';", '')
  .replace("import { MYP5_DESIGN_COMPLETION } from './myp5DesignCompletion';", '')
  .replace("import { MYP5_INTEGRATED_HUMANITIES_COMPLETION } from './myp5IntegratedHumanitiesCompletion';", '')
  .replace("import { MYP5_GEOGRAPHY_COMPLETION } from './myp5GeographyCompletion';", '')
  .replace("import { MYP5_ECONOMICS_COMPLETION } from './myp5EconomicsCompletion';", '');
const lessonOutput = ts.transpileModule(lessonSource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const lessonModule = await import(`data:text/javascript;base64,${Buffer.from(`const MYP5_PHE_COMPLETION = ${JSON.stringify(MYP5_PHE_COMPLETION)}; const MYP5_PERSONAL_PROJECT_COMPLETION = ${JSON.stringify(MYP5_PERSONAL_PROJECT_COMPLETION)}; const MYP5_ARTS_COMPLETION = ${JSON.stringify(MYP5_ARTS_COMPLETION)}; const MYP5_DESIGN_COMPLETION = ${JSON.stringify(MYP5_DESIGN_COMPLETION)}; const MYP5_SPANISH_COMPLETION = ${JSON.stringify(MYP5_SPANISH_COMPLETION)}; const MYP5_INTEGRATED_HUMANITIES_COMPLETION = ${JSON.stringify(MYP5_INTEGRATED_HUMANITIES_COMPLETION)}; const MYP5_GEOGRAPHY_COMPLETION = ${JSON.stringify(MYP5_GEOGRAPHY_COMPLETION)}; const MYP5_ECONOMICS_COMPLETION = ${JSON.stringify(MYP5_ECONOMICS_COMPLETION)}; const MYP5_HISTORY_COMPLETION = ${JSON.stringify(MYP5_HISTORY_COMPLETION)}; const MYP5_ENGLISH_COMPLETION = ${JSON.stringify(MYP5_ENGLISH_COMPLETION)}; const MYP5_INTEGRATED_SCIENCES_COMPLETION = ${JSON.stringify(MYP5_INTEGRATED_SCIENCES_COMPLETION)}; const MYP5_BIOLOGY_COMPLETION = ${JSON.stringify(MYP5_BIOLOGY_COMPLETION)}; const MYP5_CHEMISTRY_COMPLETION = ${JSON.stringify(MYP5_CHEMISTRY_COMPLETION)}; const MYP5_PHYSICS_COMPLETION = ${JSON.stringify(MYP5_PHYSICS_COMPLETION)}; const MYP5_LESSON_EXPANSION = ${JSON.stringify(MYP5_LESSON_EXPANSION)}; const MYP5_MATHEMATICS_COMPLETION = ${JSON.stringify(MYP5_MATHEMATICS_COMPLETION)};\n${lessonOutput}`).toString('base64')}`);
const { MYP5_LESSONS, MYP_CONTENT_SOURCES } = lessonModule;

test('every MYP subject has a detailed original module', () => {
  const coveredSubjects = new Set(MYP5_LESSONS.map((lesson) => lesson.subjectSlug));
  assert.deepEqual(
    MYP5_SUBJECTS.filter((subject) => !coveredSubjects.has(subject.slug)).map((subject) => subject.slug),
    [],
  );
  assert.equal(MYP5_LESSONS.length, 205);
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
  assert.equal(questions.length, 616);
  assert.deepEqual(questions.filter((question) => question.successCriteria.length < 2).map((question) => question.id), []);
  for (const lesson of MYP5_LESSONS) {
    const subject = MYP5_SUBJECTS.find((entry) => entry.slug === lesson.subjectSlug);
    assert.ok(subject, lesson.subjectSlug);
    assert.ok(subject.topics.includes(lesson.topic), `${lesson.id} must use a mapped topic`);
    assert.equal(lesson.contentStatus, 'original-editorial-draft');
    assert.equal(lesson.curriculumVersion, 'vertexed-myp5-2026.1');
    assert.ok(lesson.practice.length >= 3);
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


test('all 15 established mathematics topics have substantive lessons and resolvable prerequisites', () => {
  const mathematics = MYP5_SUBJECTS.find((entry) => entry.slug === 'mathematics');
  const lessons = MYP5_LESSONS.filter((entry) => entry.subjectSlug === mathematics.slug);
  assert.equal(lessons.length, mathematics.topics.length);
  assert.deepEqual(new Set(lessons.map((entry) => entry.topic)), new Set(mathematics.topics));
  const keys = MYP5_LESSONS.map((entry) => `${entry.subjectSlug}:${entry.topic}`);
  assert.equal(new Set(keys).size, keys.length, 'duplicate subject/topic would silently overwrite navigation');
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    assert.equal(new Set(entry.prerequisiteIds).size, entry.prerequisiteIds.length);
    assert.equal(lessonModule.findMypLesson(entry.subjectSlug, entry.topic), entry);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) {
      assert.equal(dependency.subjectSlug, mathematics.slug);
      assert.notEqual(dependency.id, entry.id);
    }
  }
  for (const entry of MYP5_MATHEMATICS_COMPLETION) {
    assert.ok(entry.explanation.length >= 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.equal(new Set(entry.practice.map((item) => item.prompt)).size, 3);
    assert.ok(entry.practice.some((item) => item.difficulty === 'Foundation'));
  }
});

test('prerequisite graph is acyclic and unknown references fail explicitly', () => {
  const completed = new Set();
  const visiting = new Set();
  function visit(entry) {
    assert.ok(!visiting.has(entry.id), `prerequisite cycle at ${entry.id}`);
    if (completed.has(entry.id)) return;
    visiting.add(entry.id);
    for (const prerequisite of lessonModule.prerequisitesForLesson(entry)) visit(prerequisite);
    visiting.delete(entry.id);
    completed.add(entry.id);
  }
  MYP5_LESSONS.forEach(visit);
  assert.throws(() => lessonModule.prerequisitesForLesson({ prerequisiteIds: ['missing'] }), /Unknown prerequisite/);
});


test('reviewed mathematics wording preserves assumptions and distinguishes task checks', () => {
  const coordinate = lessonModule.findMypLesson('mathematics', 'Coordinate geometry');
  assert.match(coordinate.method.join(' '), /perpendicular bisector.*midpoint.*equal endpoint distances/);
  assert.match(coordinate.explanation.join(' '), /Two distinct non-vertical lines with equal gradients are parallel/);
  const communication = lessonModule.findMypLesson('mathematics', 'Mathematical communication');
  assert.match(communication.workedExample.prompt, /150 m.*12 s/);
  const page = fs.readFileSync('src/pages/MYPSubject.tsx', 'utf8');
  assert.doesNotMatch(page, /Attempt unfamiliar transfer/);
  assert.match(page, /Repetition alone does not show transfer/);
});


test('all 16 established physics topics have complete lessons and resolvable prerequisites', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'physics');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === subject.slug);
  assert.equal(lessons.length, 16);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    assert.equal(lessonModule.findMypLesson('physics', entry.topic), entry);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.notEqual(dependency.id, entry.id);
  }
  for (const entry of MYP5_PHYSICS_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.equal(new Set(entry.practice.map(item => item.prompt)).size, 3);
  }
});

test('physics numerical answer keys retain checked signs, units and assumptions', () => {
  const answers = new Map(MYP5_PHYSICS_COMPLETION.flatMap(lesson => lesson.practice).map(q => [q.id, q.solution.join(' ')]));
  const checks = [
    ['phy-energy-1', `${0.5 * 3 * 4 ** 2} J`], ['phy-energy-2', `${600 / 800 * 100}%`],
    ['phy-energy-3', Math.sqrt(2 * 8 / 0.5).toFixed(2) + ' m/s'],
    ['phy-thermal-1', `${2 * 500 * 8} J`], ['phy-thermal-2', (0.2 * 334000).toLocaleString('en-US') + ' J'],
    ['phy-atomic-1', `Neutrons = 18 - 8 = ${18 - 8}`], ['phy-atomic-3', `${12 / Math.log2(960 / 120)} hours`],
    ['phy-data-1', `${((4.1 + 4.3 + 4.2) / 3).toFixed(1)} cm`],
    ['phy-uncertainty-2', `${0.2 / 40 * 100}%`],
    ['phy-graph-1', `${(17 - 5) / (6 - 2)} m/s`], ['phy-graph-2', `${0.5 * 4 * 8} m`],
    ['phy-graph-3', `${Math.abs(2 * 3) + Math.abs(-3 * 2)} m`],
  ];
  for (const [id, expected] of checks) assert.ok(answers.get(id).includes(expected), `${id}: ${expected}`);
  assert.match(lessonModule.findMypLesson('physics', 'Energy').workedExample.prompt, /neglect friction and wheel rotation/);
  assert.match(lessonModule.findMypLesson('physics', 'Uncertainty').explanation.join(' '), /not a guarantee/);
  assert.match(lessonModule.findMypLesson('physics', 'Data analysis').workedExample.conclusion, /do not generally commute/);
});


test('all 13 established chemistry topics have substantive original lessons and valid prerequisites', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'chemistry');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === subject.slug);
  assert.equal(lessons.length, 13);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    assert.equal(lessonModule.findMypLesson('chemistry', entry.topic), entry);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.notEqual(dependency.id, entry.id);
  }
  for (const entry of MYP5_CHEMISTRY_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.equal(new Set(entry.practice.map(item => item.prompt)).size, 3);
  }
});

test('chemistry answer keys preserve checked ratios, signs, units and limited inferences', () => {
  const answers = new Map(MYP5_CHEMISTRY_COMPLETION.flatMap(lesson => lesson.practice).map(q => [q.id, q.solution.join(' ')]));
  const checks = [
    ['chem-stoich-1', (9 / 18).toFixed(2) + ' mol'], ['chem-stoich-3', `${4 / 5 * 100}%`],
    ['chem-acid-1', `${10 ** (6 - 4)} times`], ['chem-acid-3', (0.03 - 0.02).toFixed(2) + ' mol'],
    ['chem-energy-2', `${-50 * 4 * (26 - 20)} J`], ['chem-energy-3', `${900 - 1100} kJ`],
    ['chem-rate-1', (45 / 15).toFixed(1) + ' cm³/s'], ['chem-organic-1', `${2 * 5 + 2}`],
    ['chem-environment-1', `${8 / 2} mg/L`], ['chem-data-2', `${(5.5 / 5 * 100).toFixed(0)}%`],
  ];
  for (const [id, expected] of checks) assert.ok(answers.get(id).includes(expected), `${id}: ${expected}`);
  assert.match(answers.get('chem-stoich-2'), /Oxygen limits.*2 mol water/);
  assert.match(answers.get('chem-reaction-1'), /2H₂ \+ O₂ → 2H₂O/);
  assert.match(answers.get('chem-organic-3'), /cyclopropane/);
  assert.match(answers.get('chem-equilibrium-3'), /does not change the final equilibrium fraction/);
  assert.match(answers.get('chem-experiment-3'), /confounds stirring and temperature/);
});


test('all 12 established biology topics have original lessons and resolvable prerequisites', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'biology');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === subject.slug);
  assert.equal(lessons.length, 12);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    assert.equal(lessonModule.findMypLesson('biology', entry.topic), entry);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.notEqual(dependency.id, entry.id);
  }
  for (const entry of MYP5_BIOLOGY_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.equal(new Set(entry.practice.map(item => item.prompt)).size, 3);
  }
});

test('biology keys preserve checked sampling, chromosome and energy accounting', () => {
  const answers = new Map(MYP5_BIOLOGY_COMPLETION.flatMap(lesson => lesson.practice).map(q => [q.id, q.solution.join(' ')]));
  assert.match(answers.get('bio-ecology-2'), new RegExp(`${(3 + 5 + 4 + 4) / (4 * 0.5) * 20} plants`));
  assert.match(answers.get('bio-reproduction-1'), new RegExp(`${20 / 2} chromosomes`));
  assert.ok(answers.get('bio-ecosystem-2').includes(`${600 / 5000 * 100}%`));
  assert.match(answers.get('bio-design-3'), /not twenty independent treatment replicates/);
  assert.match(answers.get('bio-evolution-3'), /chance survival/);
  assert.match(answers.get('bio-evaluation-3'), /predefined margin and design/);
  assert.match(lessonModule.findMypLesson('biology', 'Ecosystems').workedExample.conclusion, /15%/);
});


test('all 8 integrated science topics connect complete original lessons and valid prerequisites', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'integrated-sciences');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === subject.slug);
  assert.equal(lessons.length, 8);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    assert.equal(lessonModule.findMypLesson(subject.slug, entry.topic), entry);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.notEqual(dependency.id, entry.id);
  }
  for (const entry of MYP5_INTEGRATED_SCIENCES_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.equal(new Set(entry.practice.map(item => item.prompt)).size, 3);
  }
});

test('integrated science keys preserve model accounting, conservative bounds and strict thresholds', () => {
  const answers = new Map(MYP5_INTEGRATED_SCIENCES_COMPLETION.flatMap(lesson => lesson.practice).map(q => [q.id, q.solution.join(' ')]));
  for (const [id, value] of [
    ['int-force-1', `${6 / 3} m/s²`], ['int-force-2', `${Math.sqrt(2 * 8 / 1)} m/s`],
    ['int-living-2', `${12 - 7} units/hour`], ['int-earth-2', `${80 + (11 - 14) * 5} units`],
    ['int-data-1', `${6 / 2} mg/L`], ['int-data-2', `${(17.9 - 12.1).toFixed(1)} cm`],
    ['int-data-2', `${(18.1 - 11.9).toFixed(1)} cm`], ['int-evaluate-2', `${60 / (4 - 1)} uses`],
  ]) assert.ok(answers.get(id).includes(value), `${id}: ${value}`);
  assert.match(answers.get('int-evaluate-2'), /first whole use is 21/);
  assert.match(lessonModule.findMypLesson('integrated-sciences', 'Forces and change').workedExample.steps.join(' '), new RegExp(Math.sqrt(2 * (4 / 2) * 3).toFixed(2)));
  assert.match(lessonModule.findMypLesson('integrated-sciences', 'Data and uncertainty').workedExample.conclusion, /6.0 ± 0.4°C/);
  assert.match(lessonModule.findMypLesson('integrated-sciences', 'Scientific evaluation').workedExample.steps.join(' '), /26 whole uses/);
});

test('independent science review terminology and teaching order are retained', () => {
  const physics = MYP5_PHYSICS_COMPLETION;
  const count = physics.flatMap(entry => entry.practice).find(q => q.id === 'phy-atomic-3');
  assert.match(count.prompt, /background-corrected detector count rate/);
  assert.match(count.solution.join(' '), /4 hours/);
  const light = lessonModule.findMypLesson('physics', 'Light').workedExample;
  assert.match(light.prompt, /included angle.*front side/);
  assert.match(light.conclusion, /130°.*propagation directions.*50°/);
  const physiology = lessonModule.findMypLesson('biology', 'Human physiology');
  assert.match(physiology.explanation.join(' '), /Dissolved oxygen determines blood oxygen partial pressure/);
  assert.match(physiology.workedExample.steps.join(' '), /lower oxygen partial pressure in arriving capillary blood/);
  const reproduction = lessonModule.findMypLesson('biology', 'Reproduction');
  assert.match(reproduction.explanation.join(' '), /chromosome assortment.*Crossing over.*non-sister chromatids/);
  assert.match(reproduction.practice[1].solution.join(' '), /assortment.*crossing over/);
  const page = fs.readFileSync('src/pages/MYPSubject.tsx', 'utf8');
  assert.match(page, /a revision checklist/);
  assert.doesNotMatch(page, /mastery checklist/);
  assert.match(fs.readFileSync('src/components/myp/MypPracticeWorkspace.tsx', 'utf8'), /Suggested practice marks:/);
});


test('All 26 mapped English topics have complete original lessons', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'english-language-literature');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === subject.slug);
  assert.equal(lessons.length, 26);
  assert.equal(subject.topics.length, 26);
  assert.equal(MYP5_ENGLISH_COMPLETION.length, 24);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.equal(dependency.subjectSlug, subject.slug);
  }
  for (const entry of MYP5_ENGLISH_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.equal(new Set(entry.practice.map(item => item.prompt)).size, 3);
  }
});

test('English model responses retain textual qualifications and correct illustrative timing', () => {
  const answers = new Map(MYP5_ENGLISH_COMPLETION.flatMap(lesson => lesson.practice).map(q => [q.id, q.solution.join(' ')]));
  assert.match(answers.get('eng-evidence-2'), /Only if the river stays low|only if the river stays low/);
  assert.match(answers.get('eng-evidence-3'), /selective change/);
  assert.match(answers.get('eng-annotation-3'), /father and death are not supplied/);
  assert.match(answers.get('eng-unseen-2'), /does not identify one motive conclusively/);
  assert.ok(answers.get('eng-timed-1').includes(`${30 - 5 - 4} minutes`));
  const timing = lessonModule.findMypLesson('english-language-literature', 'Timed writing');
  assert.match(timing.workedExample.steps.join(' '), /7 minutes.*28 drafting.*5 checking/);
  assert.equal(7 + 28 + 5, 40);
  assert.equal(9 + 26 + 5, 40);
  assert.doesNotMatch(lessonModule.findMypLesson('english-language-literature', 'Rhetorical devices').workedExample.steps.join(' '), /final shorter demand/);
  const workspace = fs.readFileSync('src/components/myp/MypPracticeWorkspace.tsx', 'utf8');
  assert.match(workspace, /Other interpretations can meet the criteria/);
  assert.match(workspace, /Compare with a model response/);
});


test('independent Integrated Sciences and English review corrections remain evidence-bound', () => {
  const forces = lessonModule.findMypLesson('integrated-sciences', 'Forces and change');
  assert.match(forces.practice[2].prompt, /straight line at constant speed/);
  assert.match(forces.practice[2].hints.join(' '), /Turning would change velocity/);
  assert.match(forces.workedExample.steps.join(' '), /constant acceleration.*u is initial velocity, v final velocity and s displacement/);
  const commentary = lessonModule.findMypLesson('english-language-literature', 'Commentary');
  assert.match(commentary.practice[1].solution.join(' '), /character’s missing recognition/);
  const paragraph = lessonModule.findMypLesson('english-language-literature', 'Paragraph structure');
  assert.match(paragraph.practice[2].solution.join(' '), /initial vocal steadiness/);
  assert.doesNotMatch(paragraph.practice[2].solution.join(' '), /public speech/);
});

test('English genre and language responses distinguish evidence from unsupported claims', () => {
  const answers = new Map(MYP5_ENGLISH_COMPLETION.flatMap(entry => entry.practice).map(q => [q.id, q.solution.join(' ')]));
  for (const [id, evidence] of [
    ['eng-persuasive-texts-3', /do not establish universal support/],
    ['eng-speeches-3', /No supplied delivery note/],
    ['eng-advertisements-2', /over £30/],
    ['eng-articles-3', /does not prove a deliberate attempt/],
    ['eng-visual-texts-3', /universal calming effect/],
    ['eng-poetry-3', /poet’s personal beliefs/],
    ['eng-prose-3', /none is established/],
    ['eng-drama-3', /without the relevant audience knowledge/],
    ['eng-comparative-analysis-3', /neither line proves/],
    ['eng-authorial-choices-3', /gender and personal dislike are not supplied/],
    ['eng-tone-3', /sincere praise as a possibility/],
    ['eng-structure-3', /Deliberate deception needs further evidence/],
    ['eng-diction-2', /original word/],
    ['eng-imagery-3', /does not establish collective happiness/],
    ['eng-symbolism-3', /tentative rather than a proven symbolic code/],
    ['eng-audience-purpose-context-3', /combines information and invitation/],
  ]) assert.match(answers.get(id), evidence, id);
});


test('all 10 mapped History topics have lessons, original cases and complete source references', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'history');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === 'history');
  assert.equal(lessons.length, 10);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.equal(dependency.subjectSlug, 'history');
  }
  assert.equal(MYP5_HISTORY_COMPLETION.length, 8);
  for (const entry of MYP5_HISTORY_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.match(entry.workedExample.prompt, /^Fictional teaching/);
    for (const question of entry.practice) assert.match(question.prompt, /[Ff]ictional/);
    assert.ok(entry.sourceIds.every(id => /^(history-|archives-)/.test(id)));
  }
});

test('History model reasoning preserves evidence scope and avoids invented outcomes', () => {
  const answers = new Map(MYP5_HISTORY_COMPLETION.flatMap(entry => entry.practice).map(q => [q.id, q.solution.join(' ')]));
  for (const [id, pattern] of [
    ['hist-origin-purpose-value-limitation-3', /not three independent observations/],
    ['hist-consequence-3', /No evidence links the hall/],
    ['hist-continuity-3', /do not establish every intervening rent/],
    ['hist-change-2', /low participation does not erase the eligibility change/],
    ['hist-perspectives-3', /does not establish that those people could predict it/],
    ['hist-significance-3', /later commemorative decision/],
    ['hist-essay-construction-3', /does not establish that jobs were created/],
    ['hist-source-based-questions-3', /does not by itself prove other clubs were barred/],
  ]) assert.match(answers.get(id), pattern, id);
});

test('final independent English review removes unsupported context and aligns sensory criteria', () => {
  const imagery = lessonModule.findMypLesson('english-language-literature', 'Imagery');
  assert.match(imagery.practice[0].prompt, /one touch or temperature detail and one sound detail/);
  assert.match(imagery.workedExample.steps.join(' '), /unrolling suggests the queue extending along it/);
  assert.doesNotMatch(imagery.workedExample.steps.join(' '), /small waiting area/);
  assert.match(lessonModule.findMypLesson('english-language-literature', 'Poetry').practice[2].solution.join(' '), /folding does not establish/);
  assert.match(lessonModule.findMypLesson('english-language-literature', 'Structure').workedExample.conclusion, /why the key was not found sooner/);
});


test('all 13 mapped Economics topics have original lessons and resolvable prerequisites', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'economics');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === 'economics');
  assert.equal(lessons.length, 13);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.equal(dependency.subjectSlug, 'economics');
  }
  assert.equal(MYP5_ECONOMICS_COMPLETION.length, 11);
  for (const entry of MYP5_ECONOMICS_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.match(entry.workedExample.prompt, /^Hypothetical/);
    for (const question of entry.practice) assert.match(question.prompt, /[Hh]ypothetical/);
  }
});

test('Economics numerical responses preserve independently calculated ratios bases and units', () => {
  const answers = new Map(MYP5_ECONOMICS_COMPLETION.flatMap(entry => entry.practice).map(q => [q.id, q.solution.join(' ')]));
  const checks = [
    ['econ-opportunity-cost-1', `${8 / 2} pens per notebook`],
    ['econ-opportunity-cost-2', '1/3 kit per additional sign'],
    ['econ-supply-1', `${3 * 7 - 6} items per week`],
    ['econ-demand-1', `${60 - 4 * 8} items per week`],
    ['econ-demand-2', `P = ${(100 - 20) / (10 + 10)} credits`],
    ['econ-demand-2', `${100 - 10 * 4} items per day`],
    ['econ-elasticity-1', (((90 - 110) / ((90 + 110) / 2)) / ((12 - 10) / ((12 + 10) / 2))).toFixed(1)],
    ['econ-elasticity-2', `${5 * 100} credits`], ['econ-elasticity-2', `${6 * 80} credits`],
    ['econ-elasticity-2', `${(500 - 480) / 500 * 100}% decrease`],
    ['econ-government-intervention-1', `${90 - 65} units per week`],
    ['econ-labour-1', `${40 / (760 + 40) * 100}%`],
    ['econ-labour-2', (104 / 108 * 100).toFixed(2)],
    ['econ-labour-2', (104 / 108 * 100 - 100).toFixed(2) + '%'],
    ['econ-development-1', (150000000 / 50000).toLocaleString('en-US') + ' constant-price credits'],
    ['econ-development-2', `${(4 + 4 + 4 + 28) / 4} credits`],
    ['econ-trade-1', `${18 / 6} bags per stool`],
    ['econ-trade-2', `${20 / 10} meals`], ['econ-trade-2', `${10 / 20} box`],
    ['econ-macroeconomic-foundations-1', `${(130 - 125) / 125 * 100}%`],
    ['econ-macroeconomic-foundations-2', `${(210 - 200) / 200 * 100}%`],
    ['econ-data-response-1', `${50 - 40} percentage points`],
    ['econ-data-response-1', `${(50 - 40) / 40 * 100}%`],
    ['econ-data-response-2', `${121 * 100 / 110} million base-year-price credits`],
    ['econ-data-response-2', `${(110 - 100) / 100 * 100}%`],
  ];
  for (const [id, expected] of checks) assert.ok(answers.get(id).includes(expected), `${id}: ${expected}`);
  assert.equal((6 - 4) / (16 - 10), 1 / 3);
  assert.match(answers.get('econ-government-intervention-2'), /non-binding/);
  assert.match(answers.get('econ-trade-3'), /above 0.5 and below 1 cup per cloth/);
  assert.match(answers.get('econ-elasticity-3'), /need not lie on one unchanged demand curve/);
  assert.match(answers.get('econ-development-3'), /every component or every resident/);
});

test('Economics examples retain checked calculations and explicit assumptions', () => {
  const example = topic => lessonModule.findMypLesson('economics', topic).workedExample;
  for (const [topic, expected] of [
    ['Opportunity cost', `${6 / 2} leaflets`], ['Supply', `${4 * 5 - 8} items per week`],
    ['Supply', `${4 * 6 - 8} items per week`], ['Demand', `P = ${(80 - 10) / 10} credits`],
    ['Demand', `${80 - 5 * 7} items per week`], ['Elasticity', `${4 * 60} credits`],
    ['Government intervention', `${(100 - 10 * 3) - (20 + 10 * 3)} units per day`],
    ['Labour', `${100 / (900 + 100) * 100}%`],
    ['Development', (240000000 / 60000).toLocaleString('en-US') + ' constant-price credits'],
    ['Trade', `${6 / 12} cup`], ['Trade', `${8 / 8} cup`],
    ['Macroeconomic foundations', `${330 * 100 / 110} million base-year-price credits`],
    ['Data response', `${6 - 8} percentage points`], ['Data response', `${(6 - 8) / 8 * 100}%`],
  ]) assert.ok(example(topic).steps.join(' ').includes(expected), `${topic}: ${expected}`);
  assert.match(example('Trade').conclusion, /divisible goods and no trade costs/);
  assert.match(example('Elasticity').conclusion, /does not establish a profit change/);
  assert.match(example('Supply').prompt, /valid for P from 2 to 8/);
});

test('History final review preserves implementation authority and staffing evidence limits', () => {
  const change = lessonModule.findMypLesson('history', 'Change');
  assert.match(change.workedExample.prompt, /implements a change from paid to free/);
  assert.match(lessonModule.findMypLesson('history', 'Source-based questions').workedExample.conclusion, /free-of-charge access/);
  assert.match(lessonModule.findMypLesson('history', 'Continuity').practice[1].prompt, /from the head teacher to a committee/);
  assert.match(lessonModule.findMypLesson('history', 'Essay construction').practice[0].solution.join(' '), /does not establish whether staffing and timetabling/);
  assert.match(lessonModule.findMypLesson('english-language-literature', 'Poetry').practice[2].solution.join(' '), /without ruling out continued map use/);
});

test('all 10 mapped Geography topics have original lessons and resolvable prerequisites', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'geography');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === 'geography');
  assert.equal(lessons.length, 10);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.equal(dependency.subjectSlug, 'geography');
  }
  assert.equal(MYP5_GEOGRAPHY_COMPLETION.length, 8);
  for (const entry of MYP5_GEOGRAPHY_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.match(entry.workedExample.prompt, /^Hypothetical/);
    for (const question of entry.practice) assert.match(question.prompt, /[Hh]ypothetical/);
  }
});

test('Geography calculations preserve units denominators and independent arithmetic', () => {
  const answers = new Map(MYP5_GEOGRAPHY_COMPLETION.flatMap(entry => entry.practice).map(q => [q.id, q.solution.join(' ')]));
  const checks = [
    ['geog-migration-1', `${750 - 920} people`],
    ['geog-migration-2', (20000 + 300 - 220 + 500 - 380).toLocaleString('en-US') + ' people'],
    ['geog-migration-2', `${(300 - 220 + 500 - 380) / 20000 * 100}%`],
    ['geog-development-1', `${675 / 900 * 100}%`],
    ['geog-development-2', `${(1000 * 0.8 + 3000 * 0.4) / 4000 * 100}%`],
    ['geog-urbanisation-1', `${45000 / 150000 * 100}%`],
    ['geog-urbanisation-2', `${32000 / 80000 * 100}%`],
    ['geog-urbanisation-2', (40000 / 120000 * 100).toFixed(2) + '%'],
    ['geog-resources-1', (20000 + 3000 - 5000).toLocaleString('en-US') + ' m³'],
    ['geog-resources-2', `${120 + (10 - 25) * 4} tonnes`],
    ['geog-sustainability-1', `${0.4 * 250} kWh`],
    ['geog-sustainability-2', (5 * 1000).toLocaleString('en-US') + ' litres per month'],
    ['geog-sustainability-2', (4 * 1400).toLocaleString('en-US') + ' litres per month'],
    ['geog-sustainability-2', `${(4 * 1400 - 5 * 1000) / (5 * 1000) * 100}%`],
    ['geog-natural-hazards-1', `${45 / 300 * 100}%`],
    ['geog-globalisation-1', `${18 / (18 + 42) * 100}% by mass`],
    ['geog-data-response-1', `${3 * 50000 / 100000} km`],
    ['geog-data-response-2', `${80 / 2} m per km`],
    ['geog-data-response-2', `${80 / 2000 * 100}%`],
  ];
  for (const [id, expected] of checks) assert.ok(answers.get(id).includes(expected), `${id}: ${expected}`);
  const example = topic => lessonModule.findMypLesson('geography', topic).workedExample;
  for (const [topic, expected] of [
    ['Migration', (100000 + 1400 - 900 + 1200 - 800).toLocaleString('en-US') + ' people'],
    ['Development', `${4200 / 6000 * 100}%`],
    ['Urbanisation', (72000 / 220000 * 100).toFixed(2) + '%'],
    ['Urbanisation', (72000 / 220000 * 100 - 60000 / 200000 * 100).toFixed(2) + ' percentage points'],
    ['Urbanisation', `${(72000 - 60000) / 60000 * 100}%`],
    ['Resources', `${500 + (60 - 90) * 3} m³`],
    ['Sustainability', `${(1.5 - 2) / 2 * 100}%`],
    ['Sustainability', `${(1.5 * 160 - 2 * 100) / (2 * 100) * 100}%`],
    ['Natural hazards', `${120 / 400 * 100}%`],
    ['Globalisation', `${30 / 120 * 100}%`],
    ['Data response', `${4.8 * 25000 / 100000} km`],
  ]) assert.ok(example(topic).steps.join(' ').includes(expected), `${topic}: ${expected}`);
});

test('Geography preserves probability aggregation and causal limits', () => {
  const lesson = topic => lessonModule.findMypLesson('geography', topic);
  assert.match(lesson('Natural hazards').practice[1].solution.join(' '), /does not prescribe evenly spaced events/);
  assert.match(lesson('Development').workedExample.conclusion, /cannot be inferred/);
  assert.match(lesson('Urbanisation').practice[2].solution.join(' '), /without migration/);
  assert.match(lesson('Resources').practice[2].solution.join(' '), /dry season/);
  assert.match(lesson('Sustainability').workedExample.conclusion, /do not establish why/);
  assert.match(lesson('Data response').practice[2].solution.join(' '), /district averages, not individual behaviour/);
  assert.match(lesson('Globalisation').practice[2].solution.join(' '), /cannot be ranked from distance alone/);
  assert.ok(lesson('Data response').sourceIds.includes('geog-map-scales'));
});

test('all 8 mapped Integrated Humanities topics have original lessons and valid prerequisites', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'integrated-humanities');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === 'integrated-humanities');
  assert.equal(lessons.length, 8);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.equal(dependency.subjectSlug, 'integrated-humanities');
  }
  assert.equal(MYP5_INTEGRATED_HUMANITIES_COMPLETION.length, 6);
  for (const entry of MYP5_INTEGRATED_HUMANITIES_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.match(entry.workedExample.prompt, /^Hypothetical/);
    for (const question of entry.practice) assert.match(question.prompt, /[Hh]ypothetical/);
  }
});

test('Integrated Humanities calculations retain denominators weighting and strict thresholds', () => {
  const lesson = topic => lessonModule.findMypLesson('integrated-humanities', topic);
  const answers = new Map(MYP5_INTEGRATED_HUMANITIES_COMPLETION.flatMap(entry => entry.practice).map(q => [q.id, q.solution.join(' ')]));
  for (const [id, expected] of [
    ['ih-spatial-patterns-1', `${60 / 400 * 100}%`],
    ['ih-spatial-patterns-1', `${90 / 900 * 100}%`],
    ['ih-economic-choice-1', `${180 / 60} reading sessions per workshop`],
    ['ih-global-systems-1', `${150 / 25} days`],
    ['ih-sustainability-1', (500 * 3).toLocaleString('en-US') + ' litres'],
    ['ih-sustainability-1', (500 * 2).toLocaleString('en-US') + ' litres'],
    ['ih-sustainability-1', `${500 * (3 - 2)} litres`],
    ['ih-extended-response-2', `${(4 - 3) / 4 * 100}%`],
  ]) assert.ok(answers.get(id).includes(expected), `${id}: ${expected}`);
  for (const [topic, expected] of [
    ['Spatial patterns', `${200 / 1000 * 100}%`], ['Spatial patterns', `${300 / 3000 * 100}%`],
    ['Economic choice', `${1200 / 600} benches`], ['Economic choice', `${24000 / 600} benches`],
    ['Economic choice', `${24000 / 1200} noticeboards`], ['Global systems', `${240 / 30} days`],
    ['Extended response', `${(80 * 20 + 20 * 30) / 100} minutes`],
    ['Extended response', `${(80 * 15 + 20 * 35) / 100} minutes`],
  ]) assert.ok(lesson(topic).workedExample.steps.join(' ').includes(expected), `${topic}: ${expected}`);
  const water = lesson('Sustainability').workedExample;
  assert.equal(20 + 0.2 * 25, 25);
  assert.ok(20 + 0.2 * 26 < 26);
  assert.match(water.steps.join(' '), /25.2 litres/);
  assert.match(water.conclusion, /from 26 whole uses/);
  assert.match(water.prompt, /Ignore all other water use/);
});

test('Integrated Humanities model responses preserve packet scope and avoid invented knowledge', () => {
  const lesson = topic => lessonModule.findMypLesson('integrated-humanities', topic);
  assert.match(lesson('Perspectives').workedExample.conclusion, /Neither speaker can be assumed to represent every/);
  assert.match(lesson('Perspectives').practice[2].solution.join(' '), /not knowledge of a later closure/);
  assert.match(lesson('Global systems').practice[1].solution.join(' '), /does not force an immediate stop/);
  assert.match(lesson('Extended response').workedExample.conclusion, /not for both groups on average/);
  assert.match(lesson('Extended response').workedExample.conclusion, /do not isolate/);
  assert.match(lesson('Extended response').practice[2].solution.join(' '), /may not be independent if/);
  assert.match(lesson('Sustainability').practice[1].solution.join(' '), /cannot afford the charge/);
});

test('all 16 mapped Spanish topics have complete original lessons and acyclic prerequisites', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'spanish');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === 'spanish');
  assert.equal(lessons.length, 16);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.equal(dependency.subjectSlug, 'spanish');
  }
  assert.equal(MYP5_SPANISH_COMPLETION.length, 14);
  assert.equal(lessons.flatMap(entry => entry.practice).length, 48);
  for (const entry of MYP5_SPANISH_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.equal(JSON.stringify(entry), JSON.stringify(entry).normalize('NFC'), entry.id);
    assert.doesNotMatch(JSON.stringify(entry), /�|Ã±|Ã¡|Â¿/);
  }
});

test('Spanish model forms preserve checked accents agreement tense and translation correspondence', () => {
  const answers = new Map(MYP5_SPANISH_COMPLETION.flatMap(entry => entry.practice).map(q => [q.id, q.solution.join(' ')]));
  const checked = [
    ['spa-present-tense-1', 'Tú comes en casa.', 'You eat at home.'],
    ['spa-present-tense-2', 'Mis amigas viven en una casa pequeña.', 'pequeña agrees with casa'],
    ['spa-high-frequency-verbs-1', 'Yo tengo quince años y voy a la escuela.', 'I am fifteen years old'],
    ['spa-high-frequency-verbs-2', 'Hay tres libros y me gustan los libros.', 'Hay tres libros y me gustan.'],
    ['spa-high-frequency-verbs-3', 'Puedo leer, pero quiero escribir.'],
    ['spa-experiences-1', 'Ayer visité un museo con mi hermana.'],
    ['spa-experiences-2', 'despite the cold, we played.'],
    ['spa-future-and-conditional-1', 'vamos a visitar'],
    ['spa-future-and-conditional-2', 'Tendré tiempo mañana.'],
    ['spa-future-and-conditional-3', 'Si tengo tiempo, leeré.', '¿Podrías repetirlo?'],
    ['spa-human-ingenuity-2', 'Esta herramienta es útil, pero es cara.'],
    ['spa-social-organisation-1', 'Hay dos escuelas en mi barrio.'],
    ['spa-social-organisation-2', 'al lado del parque'],
    ['spa-sharing-the-planet-2', 'Las botellas están vacías.'],
    ['spa-connectors-1', '¿Por qué estudias español?', 'Why do you study Spanish?'],
    ['spa-speaking-interaction-2', '¿Puede repetirlo, por favor?', '¿Podría repetirlo, por favor?'],
    ['spa-reading-comprehension-1', 'Tomorrow.', 'does not explain why'],
    ['spa-reading-comprehension-2', 'because it is raining', 'does not mean she dislikes the park'],
    ['spa-writing-structures-2', 'Hola, Ana: ¿Quieres venir mañana?'],
    ['spa-idiomatic-language-1', '¿Puedes ayudarme?'],
    ['spa-idiomatic-language-3', 'distracted or daydreaming', 'prices are very high'],
  ];
  for (const [id, ...expected] of checked) for (const phrase of expected) assert.ok(answers.get(id).includes(phrase), `${id}: ${phrase}`);
  const past = lessonModule.findMypLesson('spanish', 'Past tenses');
  assert.match(past.practice[0].prompt, /Cuando éramos niños/);
  assert.match(past.practice[0].solution.join(' '), /Visitábamos/);
  assert.match(past.workedExample.prompt, /studying in progress interrupted by a completed call/);
  const identity = lessonModule.findMypLesson('spanish', 'Identity and relationships');
  assert.match(identity.practice[1].solution.join(' '), /juntas/);
  assert.match(identity.practice[1].solution.join(' '), /two female participants/);
});

test('Spanish practice preserves alternatives scope and honest listening limitations', () => {
  const lesson = topic => lessonModule.findMypLesson('spanish', topic);
  assert.match(lesson('Listening strategies').explanation.join(' '), /not playable recordings/);
  assert.match(lesson('Listening strategies').practice[0].prompt, /not an audio test/);
  assert.match(lesson('Listening strategies').practice[0].solution.join(' '), /Thursday.*Tuesday/);
  assert.match(lesson('Listening strategies').workedExample.conclusion, /3:30/);
  assert.match(lesson('High-frequency verbs').explanation.join(' '), /permanent versus temporary is unreliable/);
  assert.match(lesson('Future and conditional').practice[2].solution.join(' '), /also|may replace/);
  assert.match(lesson('Idiomatic language').practice[1].solution.join(' '), /does not establish a medical condition/);
  assert.match(lesson('Exam strategies').explanation.join(' '), /not official exam requirements/);
  assert.equal(5 + 28 + 7, 40);
  assert.equal(4 + 21 + 5, 30);
  assert.match(lesson('Exam strategies').practice[2].solution.join(' '), /total 30 minutes/);
});


test('independent Geography review states international boundaries and month-end scope', () => {
  const globalisation = lessonModule.findMypLesson('geography', 'Globalisation');
  assert.match(globalisation.practice[1].prompt, /Places A, B and C are in different countries/);
  const resources = lessonModule.findMypLesson('geography', 'Resources');
  assert.match(resources.practice[1].solution.join(' '), /15 tonnes at each month-end/);
  assert.match(resources.practice[1].solution.join(' '), /do not establish its path within a month/);
  assert.doesNotMatch(resources.practice[1].solution.join(' '), /decreases throughout/);
});

test('all 14 mapped Design topics have complete original lessons and resolved prerequisites', () => {
  const subject = MYP5_SUBJECTS.find(entry => entry.slug === 'design');
  const lessons = MYP5_LESSONS.filter(entry => entry.subjectSlug === 'design');
  assert.equal(lessons.length, 14);
  assert.deepEqual(new Set(lessons.map(entry => entry.topic)), new Set(subject.topics));
  assert.equal(MYP5_DESIGN_COMPLETION.length, 12);
  assert.equal(lessons.flatMap(entry => entry.practice).length, 42);
  for (const entry of lessons) {
    assert.ok(Array.isArray(entry.prerequisiteIds), entry.id);
    for (const dependency of lessonModule.prerequisitesForLesson(entry)) assert.equal(dependency.subjectSlug, 'design');
  }
  for (const entry of MYP5_DESIGN_COMPLETION) {
    assert.equal(entry.explanation.length, 2);
    assert.ok(entry.explanation.join(' ').split(/\s+/).length >= 85, entry.id);
    assert.ok(entry.sourceIds.every(id => id.startsWith('design-')));
  }
});

test('Design evidence preserves mandatory gates assistance failures versions and claim limits', () => {
  const lesson = topic => lessonModule.findMypLesson('design', topic);
  const answers = new Map(MYP5_DESIGN_COMPLETION.flatMap(entry => entry.practice).map(q => [q.id, q.solution.join(' ')]));
  assert.equal(260 - 2 * 15, 230);
  assert.match(answers.get('des-specifications-2'), /230 mm.*4 mm/);
  assert.match(answers.get('des-specifications-3'), /mandatory cost ceiling/);
  assert.equal(3 * 4 + 2, 3 * 3 + 5);
  assert.match(answers.get('des-ideation-2'), /14.*14/);
  assert.match(answers.get('des-testing-2'), /three of five/i);
  assert.match(answers.get('des-testing-2'), /hint.*not independent/);
  assert.match(answers.get('des-evaluation-2'), /durability is untested/);
  assert.equal(190 - 180, 10);
  assert.match(answers.get('des-iteration-2'), /10 mm/);
  assert.equal(18 * 10, 180);
  assert.match(answers.get('des-product-documentation-1'), /180 mm/);
  assert.match(answers.get('des-product-documentation-3'), /v1.*v2/);
  assert.equal(6 + 9 + 15 + 5 + 10, 45);
  assert.match(answers.get('des-criterion-c-2'), /45 minutes/);
  assert.equal(40 - 25, 15);
  assert.match(answers.get('des-criterion-d-3'), /15 seconds/);
  assert.match(answers.get('des-criterion-d-3'), /Grades were not measured/);
  assert.match(lesson('Prototyping').practice[2].prompt, /predeclared target.*four of five/);
  assert.doesNotMatch(lesson('Design cycle').practice[2].solution.join(' '), /Revise the failing criteria/);
  for (const topic of ['Criterion A', 'Criterion B', 'Criterion C', 'Criterion D']) {
    assert.match(lesson(topic).explanation.join(' '), /editorial/i);
    assert.match(lesson(topic).explanation.join(' '), /official/i);
  }
});

test('Spanish review fixes teach assessed persons and keep standalone prompts precise', () => {
  const lesson = topic => lessonModule.findMypLesson('spanish', topic);
  const present = lesson('Present tense').explanation.join(' ');
  assert.match(present, /-o, -es, -e, -emos, -éis, -en/);
  assert.match(present, /tú comes.*mis amigas viven/);
  assert.match(present, /ustedes.*third-person plural/i);
  const spelling = lesson('Writing structures').practice[1].prompt;
  assert.match(spelling, /mañana using ñ/);
  assert.doesNotMatch(spelling, /missing accent/);
  assert.match(lesson('Exam strategies').practice[1].prompt, /including the day, time and one reason/);
  assert.doesNotMatch(lesson('Exam strategies').practice[1].prompt, /task above/);
  assert.match(lesson('Speaking interaction').practice[0].prompt, /beginning Sí/);
  assert.match(lesson('Future and conditional').practice[2].prompt, /simple future tense for leer/);
});

test('independent review adds consistent magnification currency units and economics concepts', () => {
  const cells = lessonModule.findMypLesson('biology', 'Cells');
  assert.equal(30000 / 15, 2000);
  assert.match(cells.workedExample.steps.join(' '), /30000 micrometres ÷ 15 micrometres = 2000×/);
  assert.match(cells.workedExample.conclusion, /magnification alone does not identify/);
  assert.match(cells.practice[2].solution.join(' '), /Dark regions alone do not prove chloroplast identity/);
  const taxi = MYP5_LESSONS.flatMap(entry => entry.practice).find(q => q.id === 'fun-3');
  assert.match(taxi.prompt, /cost in currency units/);
  assert.match(taxi.solution.join(' '), /currency units per kilometre/);
  assert.ok(lessonModule.findMypLesson('economics', 'Scarcity').sourceIds.includes('econ-choice'));
  assert.ok(lessonModule.findMypLesson('economics', 'Market failure').sourceIds.includes('econ-externalities'));
  assert.match(MYP_CONTENT_SOURCES.find(s => s.id === 'econ-externalities').url, /12-1-the-economics-of-pollution$/);
});


test('Design review distinguishes group means and specifies card visibility', () => {
  const d = topic => lessonModule.findMypLesson('design', topic);
  assert.match(d('Criterion D').practice[2].solution.join(' '), /mean finding time for these six pupils fell from 40 to 25 seconds/);
  assert.doesNotMatch(d('Criterion D').practice[2].solution.join(' '), /these six pupils found items faster/);
  assert.match(d('Criterion B').workedExample.prompt, /opaque closed front covering the card text/);
  assert.match(d('Criterion B').workedExample.steps.join(' '), /also fails the width limit/);
});

test('Biology has distinct independent magnification practice and 37 actual questions', () => {
  const cells = lessonModule.findMypLesson('biology', 'Cells');
  const q = cells.practice.find(q => q.id === 'cell-4');
  assert.ok(q);
  assert.match(q.prompt, /48 mm.*24 micrometres/);
  assert.equal(48 * 1000 / 24, 2000);
  assert.match(q.solution.join(' '), /48000 micrometres ÷ 24 micrometres = 2000×/);
  assert.match(q.solution.join(' '), /alone does not identify the cell type/);
  assert.match(cells.practice.find(q => q.id === 'cell-3').solution.join(' '), /Dark regions alone do not prove chloroplast identity/);
  assert.equal(MYP5_LESSONS.filter(l => l.subjectSlug === 'biology').flatMap(l => l.practice).length, 37);
});

test('all 24 mapped Arts topics have complete lessons and subject-local prerequisites', () => {
  assert.equal(MYP5_ARTS_COMPLETION.length, 18);
  for (const slug of ['visual-arts', 'music', 'drama']) {
    const subject = MYP5_SUBJECTS.find(s => s.slug === slug);
    const lessons = MYP5_LESSONS.filter(l => l.subjectSlug === slug);
    assert.equal(lessons.length, 8);
    assert.deepEqual(new Set(lessons.map(l => l.topic)), new Set(subject.topics));
    assert.equal(lessons.flatMap(l => l.practice).length, 24);
    for (const lesson of lessons) {
      assert.ok(Array.isArray(lesson.prerequisiteIds), lesson.id);
      for (const p of lessonModule.prerequisitesForLesson(lesson)) assert.equal(p.subjectSlug, slug);
      assert.ok(lesson.sourceIds.some(id => id.startsWith('arts-')), lesson.id);
    }
  }
  for (const lesson of MYP5_ARTS_COMPLETION) {
    assert.equal(lesson.explanation.length, 2);
    assert.ok(lesson.explanation.join(' ').split(/\s+/).length >= 85, lesson.id);
    assert.equal(new Set(lesson.practice.map(q => q.prompt)).size, 3);
    assert.match(lesson.explanation.join(' '), /text|written|workspace/i, lesson.id);
  }
});

test('Arts evidence preserves original-case scope and does not fabricate practical assessment', () => {
  const find = (subject, topic) => lessonModule.findMypLesson(subject, topic);
  assert.match(find('visual-arts', 'Contextual research').explanation.join(' '), /fictional teaching packets/);
  assert.match(find('visual-arts', 'Evaluation').workedExample.steps.join(' '), /other two responses/);
  assert.match(find('visual-arts', 'Process documentation').practice[2].solution.join(' '), /retrospective.*unavailable/);
  assert.match(find('music', 'Contextual research').practice[0].solution.join(' '), /Composition date is not established/);
  assert.match(find('music', 'Performance').practice[1].solution.join(' '), /does not establish the balance from every audience seat/);
  assert.match(find('drama', 'Experimentation').practice[2].solution.join(' '), /one read confidence/);
  assert.match(find('drama', 'Rehearsal documentation').practice[0].prompt, /Original hypothetical notes.*Two observers/);
  assert.notEqual(find('drama', 'Performance').id, find('drama', 'Performance analysis').id);
  assert.match(find('drama', 'Performance').explanation.join(' '), /cannot observe or assess a live performance/);
  const ui = fs.readFileSync('src/components/myp/MypPracticeWorkspace.tsx', 'utf8');
  assert.match(ui, /'visual-arts', 'music', 'drama'\]\.includes\(lesson.subjectSlug\)/);
  assert.match(ui, /do not supply images, audio or recordings/);
  assert.match(ui, /Other interpretations can meet the practice criteria/);
});

test('Music transformations preserve duration arithmetic and distinguish crescendo from register', () => {
  const experimentation = lessonModule.findMypLesson('music', 'Experimentation');
  const doubled = [1, 1, 2].map(n => 2 * n);
  assert.equal(doubled.reduce((a, b) => a + b, 0), 8);
  assert.match(experimentation.workedExample.steps.join(' '), /2 \+ 2 \+ 4 = 8 beats/);
  assert.match(experimentation.workedExample.conclusion, /two bars at the same pulse/);
  assert.equal([2, 1, 1].map(n => n / 2).reduce((a, b) => a + b, 0), 2);
  assert.match(experimentation.practice[0].solution.join(' '), /1, 0.5 and 0.5 beats/);
  const analysis = lessonModule.findMypLesson('music', 'Musical analysis').workedExample;
  assert.match(analysis.prompt, /gradually becoming louder/);
  assert.match(analysis.steps.join(' '), /gradual increase in loudness is a crescendo/);
  assert.doesNotMatch(analysis.steps.join(' '), /Sequential rise/);
});

test('all ten Personal Project topics have substantive original lessons and local prerequisites', () => {
  const subject = MYP5_SUBJECTS.find(s => s.slug === 'personal-project');
  const lessons = MYP5_LESSONS.filter(l => l.subjectSlug === 'personal-project');
  assert.equal(lessons.length, 10);
  assert.equal(MYP5_PERSONAL_PROJECT_COMPLETION.length, 8);
  assert.equal(lessons.flatMap(l => l.practice).length, 30);
  assert.deepEqual(new Set(lessons.map(l => l.topic)), new Set(subject.topics));
  for (const lesson of lessons) {
    assert.ok(Array.isArray(lesson.prerequisiteIds), lesson.id);
    for (const p of lessonModule.prerequisitesForLesson(lesson)) assert.equal(p.subjectSlug, subject.slug);
    assert.ok(lesson.sourceIds.includes('project-ib-learning'));
  }
  for (const lesson of MYP5_PERSONAL_PROJECT_COMPLETION) {
    assert.equal(lesson.explanation.length, 2);
    assert.ok(lesson.explanation.join(' ').split(/\s+/).length >= 85, lesson.id);
    assert.equal(new Set(lesson.practice.map(q => q.prompt)).size, 3);
  }
});

test('Personal Project answers preserve assistance evidence gaps and mandatory conditions', () => {
  const l = topic => lessonModule.findMypLesson('personal-project', topic);
  assert.equal(7 / 10 * 100, 70);
  assert.match(l('Success criteria').practice[1].solution.join(' '), /7 \/ 10 × 100 = 70%/);
  assert.match(l('Success criteria').practice[1].solution.join(' '), /below 80%/);
  assert.match(l('Success criteria').workedExample.steps.join(' '), /three independent successes, not four/);
  assert.match(l('Evaluation').workedExample.steps.join(' '), /translation as untested, not passed/);
  assert.match(l('Learning goal').practice[2].solution.join(' '), /Credit the mentor/);
  assert.match(l('Process documentation').practice[2].solution.join(' '), /retrospective.*avoid quotation marks/);
  assert.match(l('Global context').explanation.join(' '), /does not prescribe a current official project reporting requirement/);
  const ui = fs.readFileSync('src/components/myp/MypPracticeWorkspace.tsx', 'utf8');
  assert.match(ui, /do not report your own project experience/);
  assert.match(ui, /retain unmet or untested criteria/);
});

test('all 205 local mapped topics resolve to exactly one detailed lesson', () => {
  const mapped = MYP5_SUBJECTS.flatMap(subject => subject.topics.map(topic => `${subject.slug}:${topic}`));
  const detailed = MYP5_LESSONS.map(lesson => `${lesson.subjectSlug}:${lesson.topic}`);
  assert.equal(mapped.length, 205);
  assert.equal(new Set(detailed).size, 205);
  assert.deepEqual(new Set(detailed), new Set(mapped));
  for (const subject of MYP5_SUBJECTS) for (const topic of subject.topics) {
    assert.ok(lessonModule.findMypLesson(subject.slug, topic));
  }
});

test('all ten PHE lessons have complete original content and subject-local prerequisites', () => {
  const lessons = MYP5_LESSONS.filter(l => l.subjectSlug === 'physical-health-education');
  assert.equal(lessons.length, 10);
  assert.equal(MYP5_PHE_COMPLETION.length, 8);
  assert.equal(lessons.flatMap(l => l.practice).length, 30);
  for (const lesson of lessons) {
    assert.equal(lesson.contentStatus, 'original-editorial-draft');
    assert.equal(lesson.explanation.length, 2);
    assert.ok(lesson.explanation.join(' ').split(/\s+/).length >= 85, lesson.id);
    assert.ok(Array.isArray(lesson.prerequisiteIds));
    for (const prerequisite of lessonModule.prerequisitesForLesson(lesson)) assert.equal(prerequisite.subjectSlug, lesson.subjectSlug);
    assert.ok(lesson.sourceIds.every(id => id.startsWith('phe-')));
    assert.equal(new Set(lesson.practice.map(q => q.prompt)).size, 3);
  }
});

test('PHE arithmetic preserves units denominators and percentage-point distinctions', () => {
  const l = topic => lessonModule.findMypLesson('physical-health-education', topic);
  assert.equal(18 * 60 / 15, 72);
  assert.equal(30 * 60 / 20, 90);
  assert.match(l('Physiology').workedExample.steps.join(' '), /72 beats per minute/);
  assert.match(l('Physiology').practice[1].solution.join(' '), /90 beats per minute/);
  assert.equal(6 * 50 / 100, 3);
  assert.equal(8 * 25 / 100, 2);
  assert.match(l('Nutrition').workedExample.steps.join(' '), /3 g protein in 50 g/);
  assert.match(l('Nutrition').practice[1].solution.join(' '), /2 g of fibre/);
  assert.equal(12 / 20 * 100, 60);
  assert.equal(15 / 30 * 100, 50);
  assert.match(l('Performance analysis').workedExample.conclusion, /60% and 50%/);
  assert.match(l('Performance analysis').practice[1].solution.join(' '), /80% compared with 60%/);
  assert.match(l('Reflection').practice[1].solution.join(' '), /10 percentage points/);
});

test('PHE responses distinguish observations from diagnoses and practical certification', () => {
  const l = topic => lessonModule.findMypLesson('physical-health-education', topic);
  assert.match(l('Physiology').practice[2].solution.join(' '), /does not establish general health/);
  assert.match(l('Nutrition').practice[2].solution.join(' '), /do not prescribe a replacement diet/);
  assert.match(l('Wellbeing').practice[2].solution.join(' '), /not a guaranteed solution/);
  assert.match(l('Training plans').practice[2].solution.join(' '), /stop the painful activity/);
  assert.match(l('Training principles').practice[2].solution.join(' '), /do not establish their cause/);
  assert.match(l('Fitness').practice[2].solution.join(' '), /does not establish safety or suitability/);
  assert.match(l('Reflection').practice[2].solution.join(' '), /not certified practical performance/);
  const ui = fs.readFileSync('src/components/myp/MypPracticeWorkspace.tsx', 'utf8');
  assert.match(ui, /not personal medical, nutrition or exercise advice/);
  assert.match(ui, /does not certify fitness or practical technique/);
});
