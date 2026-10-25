import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCurriculumScope } from './report-curriculum-scope.mjs';
import { readLearningLibrary, readSubjectExpansion } from './generate-learning-library.mjs';
import { contentHash } from './content-publication.mjs';
import { courseOptionDefaults } from '../src/content/course-option-defaults.mjs';
import { subjectUnitTargets, subjectUnitSources, routesForTarget } from '../src/content/subject-units/coverage.mjs';
import { subjectUnits } from '../src/content/subject-units/index.mjs';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'docs/evidence/subject-pathways-20261021.json');
const readJSON = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const count = (items, key) => items.reduce((sum, item) => sum + (item[key]?.length ?? 0), 0);

// Planning defaults, not confirmation of a learner's entry, tier, options or texts.
// Directory inspection establishes identities only, never a complete topic map.
export const priorityPlanningCodes = {
  GCSE: { Mathematics: '8300', Physics: '8463', Chemistry: '8462', Biology: '8461',
    'English Language': '8700', 'English Literature': '8702', History: '8145', Geography: '8035', 'Computer Science': '8525', Business: '8132' },
  IGCSE: { Mathematics: '0580', Physics: '0625', Chemistry: '0620', Biology: '0610', English: '0500',
    History: '0470', Geography: '0460', 'Business Studies': '0264', 'Computer Science': '0478', Economics: '0455' },
  A_LEVELS: { Mathematics: '7357', 'Further Mathematics': '7367', Physics: '7408', Chemistry: '7405', Biology: '7402',
    Economics: '7136', History: '7042', 'English Literature': '7712', Business: '7132', 'Computer Science': '7517' },
};

function planningTarget(programme, subject) {
  const code = priorityPlanningCodes[programme]?.[subject];
  if (!code) return null;
  const cambridge = programme === 'IGCSE';
  const target = { board: cambridge ? 'Cambridge International' : 'AQA', qualificationCode: code, targetExamYear: 2027,
    status: 'planning-default-not-confirmed-learner-entry', checkedOn: '2026-10-21',
    evidenceScope: 'qualification identity from official directory; full specification not reviewed',
    source: cambridge ? 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-upper-secondary/cambridge-igcse/subjects/' : 'https://www.aqa.org.uk/qualifications',
    syllabusWindow: null, transitionNote: null,
    unresolved: ['confirm actual board and entry code', 'check full specification and amendments for the exam series', 'select tier, options, assessment components and prescribed material where applicable'],
  };
  if (programme === 'IGCSE' && subject === 'Business Studies') Object.assign(target, {
    transitionNote: 'Use Business 0264 for the 2027 planning target, not outgoing Business Studies 0450. The existing product subject label is retained for identity continuity.',
    source: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-business-0264/',
    evidenceScope: 'official qualification page identifies first assessment in March 2027; full syllabus not reviewed',
  });
  if (programme === 'A_LEVELS' && subject === 'Business') Object.assign(target, {
    transitionNote: '7132 is the 2027 exam-cohort target. New 7138 starts assessment in 2028 and must not silently replace it.',
    source: 'https://www.aqa.org.uk/subjects/business/a-level/business-7138',
    evidenceScope: 'official transition page gives first assessment in 2028 and last 7132 exams in 2027; full syllabus not reviewed',
  });
  if (programme === 'IGCSE' && subject === 'Computer Science') Object.assign(target, {
    syllabusWindow: '2026–2028',
    transitionNote: 'Keep paper-based 0478 and the 2026–2028 syllabus window. Do not import 2029–2031 Python-only or new digital 0265 changes into this target.',
    source: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-computer-science-0478/',
    evidenceScope: 'official page lists the syllabus windows and later changes; the full 2026–2028 PDF has not been reviewed',
  });
  if (programme === 'IGCSE' && subject === 'English') target.unresolved.unshift('0500 First Language English is a candidate only; confirm first- or second-language route');
  const selected = courseOptionDefaults.find(item => item.programme === programme && item.subject === subject);
  if (selected) {
    target.authoringOptions = selected;
    target.evidenceScope = 'selected route constraints and initial topic teaching inspected; remaining topic and assessment coverage is outstanding';
    target.unresolved = ['match a learner’s actual entry before recommending an exam route', 'author and review the complete selected topic and assessment map', 'obtain centre approval for individual non-exam assessment questions where required'];
  }
  if (programme === 'GCSE' || programme === 'IGCSE') target.tierPolicy = 'Cover both tiers where the specification is tiered, with explicit labels. Do not invent tiers for untiered subjects.';
  const authored = subjectUnitTargets.find(item => item.programme === programme && item.subject === subject);
  if (authored) target.authoredTopicUnits = { ...authored, source: subjectUnitSources[authored.sourceId],
    routes: routesForTarget(authored, subjectUnits), report: 'docs/evidence/subject-unit-coverage-20261022.json' };
  return target;
}

export async function buildSubjectPathways() {
  const scope = await buildCurriculumScope();
  const lessons = await readLearningLibrary();
  const additions = await readSubjectExpansion();
  const manifest = await readJSON('public/learning-library/manifest.json');
  const ap = await Promise.all((await readdir(resolve(root, 'src/content/ap'))).filter(file => file.endsWith('.json')).sort()
    .map(file => readJSON(`src/content/ap/${file}`)));
  const myp = await readJSON('public/myp5-content/manifest.json');
  const mypNames = { 'Math Standard': 'mathematics', 'Language and Literature': 'english-language-literature' };
  const courseResources = async (programme, subject, suppliedMypSlug) => {
    if (programme === 'AP') {
      const course = ap.find(item => item.title.replace(/^AP /, '') === subject);
      if (!course) throw new Error(`Missing AP course: ${subject}`);
      const sourceFile = `src/content/ap/${course.slug}.json`;
      return [{ kind: 'existing-course-draft', route: `/ap/${course.slug}`, sourceFile,
        sourceHash: contentHash(await readFile(resolve(root, sourceFile), 'utf8')),
        modules: course.modules.length, questions: count(course.modules, 'questions'), publication: 'held-pending-exact-hash-review' }];
    }
    if (programme === 'IB_MYP') {
      const slug = suppliedMypSlug ?? mypNames[subject] ?? subject.toLowerCase();
      const entry = myp.subjects.find(item => item.slug === slug);
      if (entry) return [{ kind: 'existing-subject-draft', route: `/myp/subjects/${slug}`, asset: `/myp5-content/${slug}.json`,
        contentHash: `sha256:${entry.contentSha256}`, lessons: entry.lessonCount, questions: entry.questionCount, publication: 'held-pending-exact-hash-review' }];
    }
    return [];
  };
  const entries = await Promise.all(scope.courses.map(async course => ({
    programme: course.programme, subject: course.subject, origin: course.scopeOrigin,
    planningTarget: planningTarget(course.programme, course.subject),
    courseResources: await courseResources(course.programme, course.subject),
    sharedStudyCandidates: course.reuseCandidates.map(candidate => {
      const lesson = lessons.find(item => item.id === candidate.lessonId);
      const entry = manifest.entries.find(item => item.id === candidate.lessonId);
      if (!lesson || !entry) throw new Error(`Missing candidate: ${candidate.lessonId}`);
      return { lessonId: lesson.id, topic: lesson.topic, level: lesson.level, prerequisites: lesson.prerequisites,
        route: `/resources/foundations/${lesson.id}`, asset: entry.json, contentHash: entry.contentHash,
        alignment: 'subject-family-candidate-only', advancedCourseUse: 'possible-prerequisite-not-full-level-coverage',
        publication: 'held-pending-exact-hash-review' };
    }),
    complete: false, verifiedCoveragePercent: null,
    missing: course.missing,
  })));
  const linkedMyp = new Set(entries.flatMap(entry => entry.courseResources.map(resource => resource.route)));
  for (const subject of myp.subjects) if (!linkedMyp.has(`/myp/subjects/${subject.slug}`)) {
    entries.push({ programme: 'IB_MYP', subject: subject.slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '),
      origin: 'existing-myp-subject-catalogue-beyond-onboarding', planningTarget: null,
      courseResources: await courseResources('IB_MYP', '', subject.slug), sharedStudyCandidates: [],
      complete: false, verifiedCoveragePercent: null,
      missing: ['school-selected-unit-and-assessment-map', 'independent-subject-and-answer-review', 'publication-approval'] });
  }
  const receipts = await Promise.all(additions.map(async lesson => {
    const sourceFile = `src/content/subject-expansion/${lesson.id}.json`;
    const source = await readFile(resolve(root, sourceFile), 'utf8');
    const entry = manifest.entries.find(item => item.id === lesson.id);
    const body = await readFile(resolve(root, `public${entry.json}`), 'utf8');
    if (body !== `${JSON.stringify(lesson)}\n` || contentHash(body) !== entry.contentHash) throw new Error(`Stale lesson: ${lesson.id}`);
    return { lessonId: lesson.id, subject: lesson.subject, sourceFile, sourceHash: contentHash(source), contentHash: entry.contentHash,
      notes: lesson.notes.length, noteWords: lesson.notes.flatMap(note => note.paragraphs).join(' ').split(/\s+/).length,
      questions: lesson.questions.length, workedExamples: lesson.workedExamples.length, flashcards: lesson.flashcards.length,
      diagrams: lesson.diagrams.length, editorialStatus: lesson.editorialStatus };
  }));
  const total = field => receipts.reduce((sum, receipt) => sum + receipt[field], 0);
  return { schemaVersion: 1, snapshotDate: '2026-10-21',
    boundary: 'Local reviewer index for all product scope entries and existing MYP catalogue subjects, not all subjects worldwide. Links are held drafts, not public availability or verified course coverage. Subject-family candidates need level and syllabus review. Planning defaults do not confirm a school entry.',
    summary: { programmes: new Set(entries.map(entry => entry.programme)).size, scopedSubjects: scope.courses.length,
      supplementalMypSubjects: entries.length - scope.courses.length, pathways: entries.length,
      pathwaysWithResources: entries.filter(entry => entry.courseResources.length || entry.sharedStudyCandidates.length).length,
      priorityPlanningTargets: entries.filter(entry => entry.planningTarget).length, completedCourses: 0,
      newLessons: receipts.length, addedNoteWords: total('noteWords'), addedQuestions: total('questions'),
      addedWorkedExamples: total('workedExamples'), addedFlashcards: total('flashcards'), addedDiagrams: total('diagrams'),
      totalSharedLessons: lessons.length, totalSharedQuestions: count(lessons, 'questions'), totalSharedCards: count(lessons, 'flashcards') },
    newLessonReceipts: receipts, pathways: entries,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await buildSubjectPathways();
  const body = `${JSON.stringify(report, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    if (await readFile(destination, 'utf8') !== body) throw new Error('Subject pathway register is stale.');
  } else await writeFile(destination, body);
  console.log(JSON.stringify(report.summary));
}
