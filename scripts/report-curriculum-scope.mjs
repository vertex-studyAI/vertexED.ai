import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { boardSubjects } from './generate-content-coverage.mjs';
import { readLearningLibrary, learningLessonSource } from './generate-learning-library.mjs';
import { buildSyllabusCrosswalk } from './report-syllabus-crosswalk.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'docs/evidence/curriculum-scope-20261019.json');
// A reuse candidate is explicitly not a verified curriculum mapping.
const aliases = {
  Mathematics: ['Mathematics', 'Math Standard', 'Math AA', 'Math AI', 'Further Mathematics', 'Calculus AB', 'Calculus BC', 'Precalculus', 'Statistics'],
  Physics: ['Physics', 'Physics 1: Algebra-Based', 'Physics 2: Algebra-Based', 'Physics C: Mechanics', 'Physics C: Electricity and Magnetism'],
  Chemistry: ['Chemistry'], Biology: ['Biology'],
  English: ['English', 'English Language', 'English Literature', 'IB English Literature', 'Language and Literature', 'English Language and Composition', 'English Literature and Composition', 'Reading and Writing'],
  'Computer Science': ['Computer Science', 'Computer Applications', 'Computer Science A', 'Computer Science Principles'],
  Economics: ['Economics', 'Microeconomics', 'Macroeconomics'],
  Business: ['Business', 'Business Studies', 'Business Management'], Accountancy: ['Accountancy'],
  History: ['History', 'European History', 'United States History', 'World History: Modern', 'Social Science'],
  Geography: ['Geography', 'Human Geography', 'Social Science'],
  Spanish: ['Spanish', 'Language B - Spanish', 'Language AB Initio - Spanish', 'Spanish Language and Culture', 'Spanish Literature and Culture'],
  French: ['French', 'Language B - French', 'French Language and Culture'], Hindi: ['Hindi', 'Language B - Hindi'],
  German: ['German', 'Language B - German', 'German Language and Culture'],
  Psychology: ['Psychology'], 'Environmental Science': ['Environmental Science'],
  Design: ['Design'], Sciences: ['Sciences'],
  'Further Mathematics': ['Further Mathematics'],
  TOK: ['TOK'], 'Extended Essay': ['Extended Essay'], 'Academic Writing': ['Academic Writing'],
};
const satDirectory = {
  source: 'https://satsuite.collegeboard.org/practice/content-domains', inspected: '2026-10-19',
  evidence: 'Official domain directory only; not a complete skill or item-specification mapping.',
  subjects: {
    Mathematics: ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'],
    'Reading and Writing': ['Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions'],
  },
};
// A bounded starter selection. Universities have no single universal course denominator.
const universityStarterSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'History', 'Academic Writing'];

export async function buildCurriculumScope() {
  const courses = await Promise.all((await readdir(resolve(root, 'src/content/ap'))).filter(name => name.endsWith('.json')).sort()
    .map(async name => JSON.parse(await readFile(resolve(root, 'src/content/ap', name), 'utf8'))));
  const configs = await boardSubjects(courses);
  const lessons = await readLearningLibrary();
  const crosswalk = await buildSyllabusCrosswalk(lessons);
  const subjectsByProgramme = Object.fromEntries(Object.entries(configs).map(([id, config]) => [id, [...config.subjects]]));
  // A requested core subject omitted by onboarding remains visible as an explicit gap.
  if (!subjectsByProgramme.IB_DP.includes('Computer Science')) subjectsByProgramme.IB_DP.push('Computer Science');
  subjectsByProgramme.SAT = Object.keys(satDirectory.subjects);
  subjectsByProgramme.UNIVERSITY = universityStarterSubjects;
  const coursesInScope = Object.entries(subjectsByProgramme).flatMap(([programme, subjects]) => subjects.map(subject => {
    const families = Object.entries(aliases).filter(([, names]) => names.includes(subject)).map(([family]) => family);
    const candidates = lessons.filter(lesson => families.includes(lesson.subject));
    return {
      programme, subject, scopeOrigin: programme === 'SAT' ? 'official-domain-directory' : programme === 'UNIVERSITY' ? 'bounded-starter-selection' : 'existing-product-subject-directory',
      specification: null, syllabusVersion: null, gradeOrLevel: null, requiredTopicCount: null,
      verifiedTopicCount: 0, verifiedCoveragePercent: null, complete: false,
      sourceCheckedPartialMappings: crosswalk.mappings.filter(mapping => mapping.programme === programme && (
        mapping.subject === subject ||
        (programme === 'IB_DP' && ((subject === 'Math AA' && mapping.sourceId === 'ib-dp-aa-2021-sequences') ||
          (subject === 'Math AI' && mapping.sourceId === 'ib-dp-ai-2021-sequences'))) ||
        (programme === 'IB_MYP' && subject === 'Math Standard' && mapping.sourceId === 'ib-myp-mathematics-20261019'))),
      declaredDomains: programme === 'SAT' ? satDirectory.subjects[subject] : [],
      reuseCandidates: candidates.map(lesson => ({ lessonId: lesson.id, unit: lesson.unit, topic: lesson.topic,
        sourceFile: learningLessonSource(lesson), status: 'unreviewed-foundation-not-course-coverage',
        alignment: 'candidate-only', prerequisiteOnlyForAdvancedCourses: true })),
      missing: ['authoritative-specification-and-year', 'level-and-assessment-components', 'complete-unit-topic-subtopic-map',
        'topic-specific-resources', 'independent-subject-and-answer-review', 'publication-approval'],
    };
  }));
  return { schemaVersion: 1, snapshotDate: '2026-10-19',
    boundary: 'This enumerates current product subjects plus SAT and a bounded university starter selection. It is not a worldwide list of every curriculum, board, subject or topic. Foundation reuse candidates are not credited as course coverage. Unknown denominators stay null.',
    summary: { programmes: Object.keys(subjectsByProgramme).length, subjectEntries: coursesInScope.length,
      entriesWithFoundationCandidates: coursesInScope.filter(course => course.reuseCandidates.length).length,
      entriesWithoutFoundationCandidates: coursesInScope.filter(course => !course.reuseCandidates.length).length,
      completedCourses: 0, verifiedCourseMaps: 0,
      partialSourceMappingLinks: crosswalk.summary.mappingLinks, partialSourcePoints: crosswalk.summary.distinctSourcePoints },
    partialSyllabusCrosswalk: { report: 'docs/evidence/syllabus-crosswalk-20261019.json', ...crosswalk.summary },
    sourceChecks: [satDirectory, { source: 'https://ibo.org/programmes/diploma-programme/curriculum/', inspected: '2026-10-19',
      evidence: 'Official directory includes subjects beyond the product selection; subject availability is not a verified versioned topic map.' }],
    globalGaps: ['Other subjects in official programme directories beyond the current product selection', 'Board-specific GCSE, IGCSE and A-Level specifications and assessment years',
      'School-selected MYP units and language pathways', 'AP course-specific skill matrices and assessment components',
      'CBSE and ICSE class-specific syllabi', 'University institution, course code and learning-outcome selection', 'All full-course independent reviews'],
    courses: coursesInScope,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await buildCurriculumScope();
  const body = `${JSON.stringify(report, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    if (await readFile(output, 'utf8') !== body) throw new Error('Curriculum scope report is stale.');
  } else await writeFile(output, body);
  console.log(JSON.stringify(report.summary));
}
