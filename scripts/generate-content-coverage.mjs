import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { ADAPTIVE_QUESTION_BANK } from '../src/content/adaptiveQuestionBank.mjs';
import { COMPLEX_DEFINITIONS } from '../src/content/complexNumbersPractice.mjs';
import { hasExactContentApproval } from '../contracts/contentPublication.js';
import { buildProvenanceLedger } from './generate-study-guide-provenance.mjs';
import { contentHash, approvedStaticPaths, readPublicationApprovals } from './content-publication.mjs';
import { moduleContentPath } from './content-publication-modules.mjs';
import { ARCHIVE_FILE, readLegacyPublication } from './legacy-content-publication.mjs';
import { readLearningLibrary } from './generate-learning-library.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'docs/evidence/content-coverage-20261019.json');
const stable = (value) => contentHash(JSON.stringify(value));
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function loadTypeScript(relativePath) {
  const source = await readFile(resolve(root, relativePath), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

export async function boardSubjects(courses) {
  const source = await readFile(resolve(root, 'src/lib/curriculum.ts'), 'utf8');
  const parsed = ts.createSourceFile('curriculum.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const statement = parsed.statements.find((item) => ts.isVariableStatement(item)
    && item.declarationList.declarations.some((entry) => entry.name.getText(parsed) === 'BOARD_CONFIGS'));
  if (!statement) throw new Error('BOARD_CONFIGS cannot be inventoried.');
  const code = ts.transpileModule(`const AP_COURSES = ${JSON.stringify(courses)};\n${statement.getText(parsed)}`, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).BOARD_CONFIGS;
}

const base = (id, programme, subject, topic) => ({ id, programme, subject, unit: null, topic,
  syllabusVersion: null, level: null, courseVariant: null, examComponents: [], skills: [], prerequisites: [],
  contentTypes: [], difficulties: [], coverage: 'partial-authored', reviewStatus: 'unreviewed', publicationStatus: 'held',
  sources: [], rights: 'original-authorship-claimed-review-pending', sourceFile: null, deliveryRoute: null,
  contentVersion: null, answerVersion: null, validation: { structural: 'not-run', objectiveKeys: 'not-run', subjectReview: 'not-run' },
  gaps: ['independent-subject-review', 'rights-and-attribution-review', 'complete-syllabus-topic-and-component-mapping'],
});

export async function buildContentCoverage() {
  const approved = await approvedStaticPaths();
  const approvalEntries = new Map((await readPublicationApprovals()).map((entry) => [entry.path, entry]));
  const moduleApproved = (file, id, item) => hasExactContentApproval(approvalEntries.get(moduleContentPath(file, id)), stable(item));
  const rows = [];
  const mypLessons = [];
  const sharedLessons = await readLearningLibrary();
  for (const lesson of sharedLessons) {
    const asset = `/learning-library/${lesson.id}.json`;
    rows.push({ ...base(`learning-library:${lesson.id}`, 'SHARED_ORIGINAL', lesson.subject, lesson.topic),
      unit: lesson.unit, level: lesson.level, prerequisites: lesson.prerequisites, skills: lesson.objectives,
      contentTypes: ['notes', 'worked-example', 'misconception', 'flashcards', 'practice', 'revision-checklist',
        ...(lesson.diagrams?.length ? ['labelled-diagram'] : []), ...(lesson.teachingSequence ? ['guided-study'] : []), ...(lesson.revisionGuide ? ['revision-guide'] : [])],
      difficulties: [...new Set(lesson.questions.map(q => q.difficulty))],
      questionIds: lesson.questions.map(q => `${lesson.id}:${q.id}`), questionCount: lesson.questions.length,
      reviewCardCount: lesson.flashcards.length, markTotal: lesson.questions.reduce((sum, q) => sum + q.marks, 0),
      sourceFile: `src/content/learning-library/${lesson.id}.json`, deliveryAsset: asset,
      exportAsset: `/learning-library/${lesson.id}.md`, deliveryRoute: `/resources/foundations/${lesson.id}`, contentVersion: lesson.revision,
      contentHash: contentHash(`${JSON.stringify(lesson)}\n`),
      partialSyllabusMappings: lesson.syllabusMappings ?? [],
      answerVersion: stable(lesson.questions.map(q => ({ id: q.id, answer: q.answer, solution: q.solution, markingPoints: q.markingPoints, numericAnswer: q.numericAnswer }))),
      publicationStatus: approved.has(asset) ? 'published' : 'held',
      validation: { structural: 'tests/authored-learning-library.test.mjs', objectiveKeys: 'numeric answer fields checked by explicit independent calculations; prose keys require subject review', subjectReview: 'not-run' },
      gaps: ['independent-subject-review', 'rights-and-attribution-review', lesson.syllabusMappings?.length ? 'complete-board-level-syllabus-mapping' : 'specific-board-level-syllabus-mapping', 'cross-device-foundation-progress-sync'],
    });
  }
  const courses = [];
  const courseSummaries = [];
  for (const name of (await readdir(resolve(root, 'src/content/ap'))).filter((entry) => entry.endsWith('.json')).sort()) {
    const course = JSON.parse(await readFile(resolve(root, 'src/content/ap', name), 'utf8'));
    courses.push(course);
    const path = `/ap-content/${course.slug}.json`;
    for (const unit of course.modules) {
      const row = { ...base(`AP:${course.slug}:${unit.id}`, 'AP', course.title, unit.title),
        unit: unit.frameworkUnit, skills: [unit.focus, ...(unit.objectives ?? [])], prerequisites: unit.prerequisites ?? [],
        contentTypes: ['explanation', 'worked-example', 'misconception', 'practice', ...(unit.reviewCards?.length ? ['review-cards'] : []), ...(unit.studyPack ? ['notes', 'flashcards', 'labelled-diagram'] : [])],
        difficulties: [...new Set(unit.questions.map((question) => question.difficulty ?? 'unspecified'))],
        questionIds: unit.questions.map((question) => `${course.slug}:${unit.id}:${question.id}`), questionCount: unit.questions.length,
        reviewCardCount: (unit.reviewCards?.length ?? 0) + (unit.studyPack?.flashcards.length ?? 0),
        workedExampleCount: 1 + (unit.studyPack?.workedExamples.length ?? 0), diagramCount: unit.studyPack?.diagrams.length ?? 0, retryLinks: unit.questions.filter((q) => q.retryOf).map((q) => ({ id: q.id, retryOf: q.retryOf })),
        syllabusVersion: { declared: '2026-27', verifiedMapping: false, note: course.frameworkNote },
        examComponents: [{ declared: course.assessment, completeMapping: false }], sources: [course.officialUrl],
        sourceFile: `src/content/ap/${name}`, deliveryRoute: `/ap/${course.slug}`, deliveryAsset: path,
        contentVersion: stable(unit), answerVersion: stable(unit.questions.map((q) => ({ id: q.id, answer: q.answer, checkpoints: q.checkpoints, numericAnswer: q.numericAnswer }))),
        publicationStatus: approved.has(path) ? 'published' : 'held',
        validation: { structural: 'tests/ap-content.test.mjs', objectiveKeys: course.slug === 'calculus-ab' && unit.id === 'unit-1' ? 'tests/content-answer-validation.test.mjs (q3-q5 only)' : 'not-independently-validated', subjectReview: 'not-run' },
      };
      if (!unit.prerequisites?.length) row.gaps.push('explicit-prerequisites');
      if (!unit.reviewCards?.length && !unit.studyPack?.flashcards.length) row.gaps.push('review-cards');
      if (unit.questions.some((q) => !q.marks || !q.calculatorPolicy)) row.gaps.push('mark-values-and-calculator-policy');
      if (!unit.questions.some((q) => q.difficulty === 'transfer')) row.gaps.push('designated-distinct-transfer-question');
      rows.push(row);
    }
    courseSummaries.push({ programme: 'AP', subject: course.title, modules: course.modules.length,
      questions: course.modules.reduce((sum, unit) => sum + unit.questions.length, 0), approved: approved.has(path), coverage: 'partial-authored', route: `/ap/${course.slug}` });
  }
  const mypManifest = JSON.parse(await readFile(resolve(root, 'public/myp5-content/manifest.json'), 'utf8'));
  for (const subject of mypManifest.subjects) {
    const path = `/myp5-content/${subject.slug}.json`;
    const payload = JSON.parse(await readFile(resolve(root, 'public', path.slice(1)), 'utf8'));
    mypLessons.push(...payload.lessons);
    for (const lesson of payload.lessons) {
      rows.push({ ...base(`IB_MYP:${lesson.id}`, 'IB_MYP', subject.slug, lesson.topic),
        unit: lesson.id, level: 'MYP 5 (editorial selection)', syllabusVersion: { declared: lesson.curriculumVersion, verifiedMapping: false },
        skills: lesson.objectives, prerequisites: lesson.prerequisiteIds ?? [],
        contentTypes: ['explanation', 'worked-example', 'misconception', 'practice', 'review-checklist', ...(lesson.studyPack ? ['notes', 'flashcards', 'labelled-diagram'] : [])],
        reviewCardCount: lesson.studyPack?.flashcards.length ?? 0, workedExampleCount: 1 + (lesson.studyPack?.workedExamples.length ?? 0), diagramCount: lesson.studyPack?.diagrams.length ?? 0,
        difficulties: [...new Set(lesson.practice.map((q) => q.difficulty))],
        questionIds: lesson.practice.map((q) => q.id), questionCount: lesson.practice.length,
        markTotal: lesson.practice.reduce((sum, q) => sum + q.marks, 0),
        sources: payload.sources.filter((source) => lesson.sourceIds.includes(source.id)),
        sourceFile: `public${path} (generated from src/content/myp5* authoring files)`, deliveryAsset: path,
        deliveryRoute: `/myp/subjects/${subject.slug}`, contentVersion: stable(lesson),
        answerVersion: stable(lesson.practice.map((q) => ({ id: q.id, solution: q.solution, marks: q.marks, successCriteria: q.successCriteria }))),
        publicationStatus: approved.has(path) ? 'published' : 'held',
        validation: { structural: 'tests/myp5-lessons.test.mjs; tests/myp5-content-delivery.test.mjs', objectiveKeys: 'partial topic-specific tests; not all keys independently checked', subjectReview: 'not-run' },
        gaps: ['independent-subject-review', 'rights-and-attribution-review', 'complete-syllabus-topic-and-component-mapping', 'calculator-policy', 'distinct-retry-and-transfer-links'],
      });
    }
    courseSummaries.push({ programme: 'IB_MYP', subject: subject.slug, modules: subject.lessonCount,
      questions: subject.questionCount, approved: approved.has(path), coverage: 'partial-authored', route: `/myp/subjects/${subject.slug}` });
  }
  for (const question of ADAPTIVE_QUESTION_BANK) {
    rows.push({ ...base(`adaptive:${question.id}`, 'SHARED_ORIGINAL', question.subject, question.topic),
      declaredProgrammes: question.curriculum, skills: question.concepts, contentTypes: ['diagnostic-practice', 'answer-key', 'misconception'],
      difficulties: [question.difficulty], questionIds: [question.id], questionCount: 1,
      sourceFile: 'src/content/adaptiveQuestionBank.mjs', deliveryRoute: '/learn', deliveryAsset: moduleContentPath('src/content/adaptiveQuestionBank.mjs', question.id),
      publicationStatus: moduleApproved('src/content/adaptiveQuestionBank.mjs', question.id, question) ? 'published' : 'held',
      contentVersion: stable(question), answerVersion: stable(question.answer),
      validation: { structural: 'tests/adaptive-practice.test.mjs', objectiveKeys: question.type === 'numeric' ? 'tests/content-answer-validation.test.mjs' : 'not-independently-validated-in-this-pass', subjectReview: 'not-run' },
      gaps: ['independent-subject-review', 'specific-course-level-and-component-alignment', 'mark-values', 'calculator-policy', 'estimated-time', 'source-provenance'],
    });
  }
  rows.push({ ...base('complex-definitions', 'SHARED_ORIGINAL', 'Mathematics', 'Complex numbers'),
    skills: Object.keys(COMPLEX_DEFINITIONS), contentTypes: ['concept-definitions'], questionCount: 0,
    sourceFile: 'src/content/complexNumbersPractice.mjs', deliveryRoute: '/learn', deliveryAsset: moduleContentPath('src/content/complexNumbersPractice.mjs', 'complex-definitions'),
    contentVersion: stable(COMPLEX_DEFINITIONS), publicationStatus: moduleApproved('src/content/complexNumbersPractice.mjs', 'complex-definitions', COMPLEX_DEFINITIONS) ? 'published' : 'held',
  });
  const [{ FORMULA_REFERENCE }, { EXAM_DRILLS }, { BOARD_GUIDE_CATALOG }] = await Promise.all([
    loadTypeScript('src/content/formulaReference.ts'), loadTypeScript('src/content/examPractice.ts'), loadTypeScript('src/content/boardResourceCatalog.ts'),
  ]);
  for (const item of FORMULA_REFERENCE) rows.push({ ...base(`formula:${item.id}`, 'SHARED_ORIGINAL', item.subject, item.title),
    contentTypes: ['formula-reference', 'worked-example', 'practice'], questionCount: 1, sources: item.source ? [item.source] : [],
    sourceFile: 'src/content/formulaReference.ts', deliveryRoute: '/study-tools', deliveryAsset: moduleContentPath('src/content/formulaReference.ts', item.id), contentVersion: stable(item), answerVersion: stable(item.practice),
    publicationStatus: moduleApproved('src/content/formulaReference.ts', item.id, item) ? 'published' : 'held',
    validation: { structural: 'tests/formula-reference.test.mjs', objectiveKeys: 'tests/formula-reference.test.mjs (bounded checks)', subjectReview: 'not-run' },
  });
  for (const item of EXAM_DRILLS) rows.push({ ...base(`exam-drill:${item.id}`, item.programme.replaceAll(' ', '_'), item.subject, item.topic),
    contentTypes: ['exam-practice', 'marking-checklist', 'transfer-prompt'], difficulties: [item.difficulty], questionCount: 1,
    sources: [item.source], sourceFile: 'src/content/examPractice.ts', deliveryRoute: '/exam-prep', deliveryAsset: moduleContentPath('src/content/examPractice.ts', item.id),
    contentVersion: stable(item), answerVersion: stable({ solution: item.solution, checks: item.checks }),
    publicationStatus: moduleApproved('src/content/examPractice.ts', item.id, item) ? 'published' : 'held',
    validation: { structural: 'tests/exam-practice-content.test.mjs', objectiveKeys: 'not-independently-validated-in-this-pass', subjectReview: 'not-run' },
  });
  const guides = await buildProvenanceLedger();
  for (const guide of guides.entries) rows.push({ ...base(guide.contentId, 'IB_MYP', guide.curriculum.subject, guide.path),
    contentTypes: [guide.contentType], rights: guide.license, sourceFile: `public${guide.path}`, deliveryAsset: guide.path,
    deliveryRoute: guide.path.replace(/\.md$/, ''), contentVersion: guide.contentHash, answerVersion: null,
    reviewStatus: guide.editorialStatus, publicationStatus: approved.has(guide.path) ? 'published' : 'held', riskFlags: guide.riskFlags,
    validation: { structural: 'tests/content-provenance-ledger.test.mjs', objectiveKeys: 'not-run', subjectReview: 'not-run' },
    gaps: ['source-provenance', 'rights-and-attribution-review', 'independent-subject-review', 'specific-syllabus-version', ...(guide.riskFlags.length ? ['resolve-risk-flags'] : [])],
  });
  const configs = await boardSubjects(courses);
  const mandatoryGaps = [];
  for (const programme of ['IB_DP', 'GCSE', 'IGCSE']) {
    const subjects = new Set(configs[programme].subjects);
    if (programme === 'IB_DP') subjects.add('Computer Science'); // Explicit CUR-03 scope even though onboarding omits it.
    for (const subject of subjects) mandatoryGaps.push({ id: `${programme}:${slug(subject)}`, programme, subject,
      status: 'OPEN', syllabusVersion: null, examBoardSpecification: null,
      levelsRequired: programme === 'IB_DP' ? ['HL', 'SL (course applicability to verify)'] : programme === 'IGCSE' ? ['Core', 'Extended (specification applicability to verify)'] : ['Foundation', 'Higher (specification applicability to verify)'],
      coverage: 'no-complete-versioned-reviewed-course-map',
      preparedDrills: EXAM_DRILLS.filter((item) => item.programme.replaceAll(' ', '_') === programme &&
        (item.subject === subject || (item.subject === 'Mathematics' && subject.startsWith('Math ')))).map((item) => item.id),
      generatedGuideTopics: (BOARD_GUIDE_CATALOG[programme] ?? []).filter((item) => item.subject === subject).map((item) => item.id),
      note: 'Generic questions, formula references, AI prompt topics and a board label do not establish complete course or exam-component coverage.',
    });
  }
  // MYP onboarding offers languages that the 17-subject detailed catalogue does not cover.
  for (const subject of ['French', 'Hindi']) mandatoryGaps.push({ id: `IB_MYP:${slug(subject)}`, programme: 'IB_MYP', subject,
    status: 'OPEN', coverage: 'no-detailed-lesson-library', source: 'src/lib/curriculum.ts BOARD_CONFIGS.IB_MYP.subjects' });
  const legacy = await readLegacyPublication();
  const legacyRow = (item, id, topic) => ({ ...base(id, 'LEGACY_EDITORIAL', 'Cross-curriculum (alignment unverified)', topic),
    contentTypes: [item.kind], rights: 'unknown-review-required', sourceFile: item.file, deliveryRoute: item.route,
    deliveryAsset: item.path, contentVersion: item.hash, answerVersion: null, publicationStatus: item.approved ? 'published' : 'held',
    approvalUnit: item.replacement ? 'exact-source-function' : item.name ? 'exact-json-initializer' : 'exact-entire-source-module-including-imports',
    validation: { structural: 'tests/legacy-publication.test.mjs', objectiveKeys: 'not-independently-validated', subjectReview: 'not-run' },
    gaps: ['source-provenance', 'independent-subject-review', 'rights-and-attribution-review', 'syllabus-and-assessment-claim-review'],
  });
  for (const item of legacy.modules.filter((entry) => entry.file !== ARCHIVE_FILE)) rows.push(legacyRow(item, `legacy-module:${item.file}`, item.title));
  const archive = legacy.modules.find((entry) => entry.file === ARCHIVE_FILE);
  let archiveSampleCount = 0;
  for (const [subject, tabs] of Object.entries(legacy.archiveSamples)) for (const [tab, samples] of Object.entries(tabs)) {
    samples.forEach((sample, index) => { archiveSampleCount += 1; rows.push({ ...legacyRow(archive, `archive:${subject}:${tab}:${index + 1}`, sample.title),
      subject, unit: tab, itemHash: stable(sample), note: 'All archive samples share one exact source-module review unit; this inventory row is not a separate approval.' }); });
  }
  for (const item of legacy.sections) rows.push({ ...legacyRow(item, `teaching-section:${item.file}:${item.name}`, item.name),
    authoredEntries: typeof item.value === 'string' ? 1 : Array.isArray(item.value) ? item.value.length : Object.values(item.value).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : 1), 0) });
  const resourceCounts = (units) => ({
    studyPacks: units.filter(unit => unit.studyPack).length,
    additionalNoteWords: units.reduce((sum, unit) => sum + (unit.studyPack?.notes.flatMap(note => note.paragraphs).join(' ').split(/\s+/).length ?? 0), 0),
    workedExamples: units.reduce((sum, unit) => sum + 1 + (unit.studyPack?.workedExamples.length ?? 0), 0),
    flashcards: units.reduce((sum, unit) => sum + (unit.reviewCards?.length ?? 0) + (unit.studyPack?.flashcards.length ?? 0), 0),
    diagrams: units.reduce((sum, unit) => sum + (unit.studyPack?.diagrams.length ?? 0), 0),
  });
  return { schemaVersion: 1, generatedBy: 'scripts/generate-content-coverage.mjs', snapshotDate: '2026-10-19',
    evidenceBoundary: 'Authored inventory and partial machine validation, not approval or full syllabus coverage. Null values remain unknown. Review records are never inferred from tests or source claims.',
    gates: ['CUR-01', 'CUR-02', 'CUR-03', 'CUR-04', 'CUR-05', 'CUR-06', 'CUR-07', 'CUR-08', 'PUB-02'],
    implementationProvenance: { relatedOpenPullRequest: 'https://github.com/vertex-studyAI/vertexED.ai/pull/1069', inspected: '2026-10-16',
      relationship: 'Adapts the held-guide build-pruning principle to the current combined working tree. Extends AP/MYP static payloads, metadata, local preview, offline ordering, exact hash/version binding and revocable tutor retrieval. No branch revival, merge or remote mutation.' },
    unresolvedDeliveryPaths: [],
    deliverySurfaceInventory: { scope: 'Bounded source and import audit of known static teaching bodies; not a claim that every future teaching path is approved or exhaustively discovered.',
      staticTeachingBoundaries: [...legacy.modules, ...legacy.sections].map(({ file, path, kind, approved }) => ({ file, approvalPath: path, kind, status: approved ? 'published' : 'held', validation: 'module-transform-tests; final-build-verifier-required' })),
      retainedProductHelp: ['Navigation and tool descriptions', 'Form labels, upload rules and user-authored assessment settings', 'Revision Stack game and control instructions', 'Home learning-stage descriptions and reflective prompts without answers', 'Curriculum/subject directory names and declared topic metadata'],
      distinctRuntimeBoundaries: ['AI-generated responses require source/provenance and AI policy checks; static approval is not inferred.', 'User-owned notes and saved work retain their own permissions and history; this publication transform does not delete them.'],
    },
    adaptiveHistoryBoundary: { status: 'implemented-awaiting-final-build-verification', catalogue: 'ADAPTIVE_QUESTION_METADATA retains stable descriptive IDs without prompts, keys or solutions.', assessment: 'Only an exact approved contentRevision contributes assessment evidence. Legacy and held raw records remain preserved and unverified.', activeQuestions: ADAPTIVE_QUESTION_BANK.filter((q) => moduleApproved('src/content/adaptiveQuestionBank.mjs', q.id, q)).length },
    summary: { ap: { courses: courses.length, modules: courses.reduce((n, c) => n + c.modules.length, 0), questions: courses.reduce((n, c) => n + c.modules.reduce((s, u) => s + u.questions.length, 0), 0), ...resourceCounts(courses.flatMap(course => course.modules)) },
      myp: { subjects: mypManifest.subjects.length, lessons: mypManifest.lessonCount, questions: mypManifest.questionCount, ...resourceCounts(mypLessons) },
      sharedLearningLibrary: { lessons: sharedLessons.length, subjects: new Set(sharedLessons.map(lesson => lesson.subject)).size,
        noteWords: sharedLessons.reduce((sum, lesson) => sum + lesson.notes.flatMap(section => section.paragraphs).join(' ').split(/\s+/).length, 0),
        workedExamples: sharedLessons.reduce((sum, lesson) => sum + lesson.workedExamples.length, 0),
        questions: sharedLessons.reduce((sum, lesson) => sum + lesson.questions.length, 0),
        flashcards: sharedLessons.reduce((sum, lesson) => sum + lesson.flashcards.length, 0),
        diagrams: sharedLessons.reduce((sum, lesson) => sum + (lesson.diagrams?.length ?? 0), 0),
        teachingSequences: sharedLessons.filter(lesson => lesson.teachingSequence).length,
        revisionGuides: sharedLessons.filter(lesson => lesson.revisionGuide).length,
        approvedLessons: sharedLessons.filter(lesson => approved.has(`/learning-library/${lesson.id}.json`)).length },
      guides: guides.summary, adaptiveQuestions: ADAPTIVE_QUESTION_BANK.length, formulaReferences: FORMULA_REFERENCE.length,
      examDrills: EXAM_DRILLS.length, complexDefinitions: Object.keys(COMPLEX_DEFINITIONS).length, approvedStaticAssets: approved.size, mandatoryCourseGaps: mandatoryGaps.length,
      legacyEditorialArticles: 23, archiveSamples: archiveSampleCount, additionalTeachingModules: legacy.modules.length - 24, teachingSections: legacy.sections.length,
      approvedLegacyUnits: [...legacy.modules, ...legacy.sections].filter((item) => item.approved).length,
      claim: 'All mandatory curriculum gates remain OPEN.' },
    sourceVerification: [
      { url: 'https://apstudents.collegeboard.org/courses/ap-calculus-ab', inspected: '2026-10-16', result: 'official-eight-unit-overview-accessed', limitation: 'Unit 1 focused revision pack only; not comprehensive CED mapping or subject approval.' },
      { url: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-upper-secondary/cambridge-igcse/curriculum/', inspected: '2026-10-16', result: 'official-subject-directory-accessed', limitation: 'Individual course specifications and assessment years remain unresolved.' },
      { url: 'https://www.ibo.org/programmes/middle-years-programme/curriculum/', inspected: '2026-10-16', result: 'fetch-blocked-403' },
      { url: 'https://www.ibo.org/programmes/diploma-programme/curriculum/mathematics/', inspected: '2026-10-16', result: 'fetch-blocked-403' },
    ],
    optionalScope: { A_LEVELS: 'Optional under master checklist; no removal or completion decision inferred here.', CBSE: 'Offered by onboarding but not substituted for required curriculum scope.', ICSE: 'Offered by onboarding but not substituted for required curriculum scope.' },
    reviewPacket: { approvalRegister: 'contracts/content-publication-approvals.json', process: [
      'Use row IDs, source files and content hashes to review the exact prepared material.',
      'Confirm the specific course, level, specification year, exam component and rights; fill missing metadata.',
      'Independently solve keys, check rubrics, marks, calculator rules, alternatives, units, renderability and prerequisites.',
      'Record reviewer identity, review date, source, rights permission, contentVersion and answerVersion with exact asset contentHash.',
      'Only an authorised editorial decision sets approved/published in the register. Rebuild and rerun delivery tests after review.',
    ], template: { path: null, contentHash: null, contentVersion: null, answerVersion: null, editorialStatus: 'unreviewed', publicationStatus: 'held-from-index', factualReviewer: null, reviewedAt: null, reviewDueAt: null, source: null, license: 'unknown', permittedUse: 'not-yet-determined' } },
    courseSummaries, mandatoryGaps, rows,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await buildContentCoverage();
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    if (await readFile(output, 'utf8') !== serialized) throw new Error('Content coverage matrix is stale.');
  } else await writeFile(output, serialized);
  console.log(JSON.stringify(report.summary));
}
