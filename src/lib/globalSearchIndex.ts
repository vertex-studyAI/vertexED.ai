import { MYP5_SUBJECTS, topicSlug } from '../content/myp5.ts';

export type GlobalSearchEntry = {
  title: string;
  description: string;
  to: string;
  area: 'Page' | 'Study tool' | 'Course' | 'Subject' | 'Topic' | 'Guide';
  keywords?: string;
  account?: boolean;
};

const pages: GlobalSearchEntry[] = [
  { title: 'Home', description: 'The VertexED revision loop and interactive examples.', to: '/', area: 'Page', keywords: 'landing start' },
  { title: 'Features', description: 'See the connected planning, practice and review tools.', to: '/features', area: 'Page' },
  { title: 'Courses', description: 'Browse study tools by curriculum and exam board.', to: '/curricula', area: 'Course', keywords: 'curriculum programme board' },
  { title: 'MYP 5', description: 'Explore MYP 5 subjects, topics and eAssessment practice.', to: '/myp', area: 'Course', keywords: 'IB middle years programme' },
  { title: 'MYP eAssessment', description: 'Practise MYP on-screen assessment question types.', to: '/myp/eassessment', area: 'Course', keywords: 'exam assessment' },
  { title: 'Study guides', description: 'Open subject guides and source-bound study pages.', to: '/study-guides', area: 'Guide', keywords: 'revision learning pages' },
  { title: 'Resources', description: 'Read practical guides for study methods and VertexED tools.', to: '/resources', area: 'Guide', keywords: 'articles help' },
  { title: 'About VertexED', description: 'Read the product purpose, principles and boundaries.', to: '/about', area: 'Page' },
  { title: 'Privacy', description: 'See how VertexED handles account and study data.', to: '/privacy', area: 'Page' },
  { title: 'Terms', description: 'Read the terms for using VertexED.', to: '/terms', area: 'Page' },
];

const tools: GlobalSearchEntry[] = [
  { title: 'Dashboard', description: 'Return to your revision overview and next actions.', to: '/main', area: 'Study tool', keywords: 'home progress account', account: true },
  { title: 'Exam prep', description: 'Choose subjects, deadlines and focused exam missions.', to: '/exam-prep', area: 'Study tool', keywords: 'revision assessment', account: true },
  { title: 'Study planner', description: 'Build editable revision blocks around your week.', to: '/planner', area: 'Study tool', keywords: 'calendar schedule plan', account: true },
  { title: 'Study Zone', description: 'Run focused revision sessions with a timer and tools.', to: '/study-zone', area: 'Study tool', keywords: 'focus pomodoro timer', account: true },
  { title: 'Paper Maker', description: 'Create original topic-focused practice papers.', to: '/paper-maker', area: 'Study tool', keywords: 'questions mock exam practice', account: true },
  { title: 'Answer Reviewer', description: 'Inspect an answer and get suggested feedback for a retry.', to: '/answer-reviewer', area: 'Study tool', keywords: 'mark feedback grade response', account: true },
  { title: 'AI Notes and Quiz', description: 'Turn your notes into flashcards and retrieval questions.', to: '/notetaker', area: 'Study tool', keywords: 'flashcards upload quiz notes', account: true },
  { title: 'AI tutor', description: 'Ask Apex to explain a concept or work through a method.', to: '/chatbot', area: 'Study tool', keywords: 'chat ask explain agent', account: true },
  { title: 'Study notebook', description: 'Keep source-bound notes and research together.', to: '/study-notebook', area: 'Study tool', keywords: 'research sources world model', account: true },
  { title: 'Resource library', description: 'Open your saved study resources.', to: '/resource-library', area: 'Study tool', keywords: 'documents files saved', account: true },
  { title: 'Account settings', description: 'Change appearance, accessibility and companion settings.', to: '/user-settings', area: 'Study tool', keywords: 'theme apex mascot preferences profile', account: true },
];

const curricula = [
  ['ib-myp', 'IB MYP'], ['ib-dp', 'IB Diploma'], ['igcse', 'IGCSE'], ['gcse', 'GCSE'],
  ['a-level', 'A levels'], ['ap', 'Advanced Placement'], ['cbse', 'CBSE'], ['icse', 'ICSE'],
] as const;

const courseEntries: GlobalSearchEntry[] = curricula.map(([slug, name]) => ({
  title: `${name} study tools`,
  description: `Open the ${name} revision workflow and curriculum-specific tools.`,
  to: `/curricula/${slug}/study-planner`,
  area: 'Course',
  keywords: `${name} curriculum programme exam board`,
}));

const subjectEntries: GlobalSearchEntry[] = MYP5_SUBJECTS.flatMap((subject) => [
  {
    title: subject.name,
    description: subject.summary,
    to: `/myp/subjects/${subject.slug}`,
    area: 'Subject' as const,
    keywords: `MYP ${subject.group} ${subject.skills.join(' ')}`,
  },
  ...subject.topics.map((topic) => ({
    title: topic,
    description: `${subject.name}: open the explanation, practice and mastery check.`,
    to: `/myp/subjects/${subject.slug}/${topicSlug(topic)}`,
    area: 'Topic' as const,
    keywords: `MYP ${subject.name} ${subject.group}`,
  })),
]);

const guides: GlobalSearchEntry[] = [
  ['Choosing AI study tools', 'Compare study tools by the work they support.', '/resources/best-ai-study-tools-2025', 'AI tools'],
  ['Automated note taking', 'Capture material, then turn it into active recall.', '/resources/automated-note-taking-guide', 'notes lecture'],
  ['How to use AI for studying', 'Use AI for planning, retrieval, mocks and review.', '/resources/how-to-use-ai-for-studying', 'AI integrity'],
  ['Using Apex for study help', 'Ask for explanations without outsourcing the attempt.', '/resources/ai-chatbot-tutor', 'chat tutor'],
  ['AI study planner and calendar', 'Plan revision around school, sport and sleep.', '/resources/ai-study-planner', 'schedule calendar'],
  ['Paper Maker guide', 'Build and sit topic-focused practice papers.', '/resources/ib-igcse-paper-maker', 'mock questions'],
  ['Notes to flashcards and quizzes', 'Turn source material into retrieval practice.', '/resources/notes-to-flashcards', 'recall'],
  ['AI Answer Reviewer guide', 'Use suggested feedback to improve another attempt.', '/resources/ai-answer-reviewer', 'mark feedback'],
  ['Active recall and spaced repetition', 'Use testing and intervals for revision.', '/resources/active-recall-spaced-repetition', 'memory method'],
  ['Exam strategy and time management', 'Allocate time by marks and command terms.', '/resources/exam-strategy-time-management', 'exam timing'],
  ['How to cram effectively', 'Choose a bounded plan when an exam is close.', '/resources/how-to-cram-effectively', 'tomorrow exam'],
  ['Memory techniques for revision', 'Compare memory palaces with spaced repetition.', '/resources/how-to-memorize-anything-fast', 'memorise remember'],
  ['AI prompts for revision', 'Prompt for critique and reasoning, not copied answers.', '/resources/best-ai-prompts-for-students', 'prompt'],
  ['IB Mathematics revision guide', 'Practise calculus, statistics and proof methods.', '/resources/ib-math-aa-ai-guide', 'IB Math AA AI'],
  ['IB MYP Humanities answer studio', 'Work with research questions, sources and OPVL.', '/resources/ib-myp-humanities-guide', 'History Geography'],
  ['IGCSE Sciences revision', 'Review Biology, Chemistry, Physics and practical work.', '/resources/igcse-science-revision', 'science'],
  ['Essay writing with AI', 'Develop a thesis, evidence and conclusion without losing your voice.', '/resources/essay-writing-with-ai', 'History English Psychology'],
  ['A level and AP exam prep', 'Compare qualification demands and question types.', '/resources/alevel-ap-exam-prep', 'course'],
  ['Common exam mistakes', 'Inspect recurring gaps in working, units and analysis.', '/resources/subject-guides-common-mistakes', 'errors'],
  ['Using AI for IB TOK', 'Develop knowledge questions while keeping the argument yours.', '/resources/ib-tok-guide-ai', 'theory knowledge'],
  ['Is using AI cheating?', 'Check integrity boundaries and school policy.', '/resources/is-using-ai-cheating', 'ethics integrity'],
  ['Academic burnout', 'Recognise depletion and choose a smaller study plan.', '/resources/academic-burnout-guide', 'wellbeing sleep'],
  ['College essays with AI', 'Use AI for research and structure while keeping the story yours.', '/resources/college-essays-with-ai', 'admissions writing'],
].map(([title, description, to, keywords]) => ({ title, description, to, keywords, area: 'Guide' as const }));

export const GLOBAL_SEARCH_INDEX: GlobalSearchEntry[] = [...pages, ...tools, ...courseEntries, ...subjectEntries, ...guides];

const normalise = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export type SearchVertexOptions = {
  limit?: number;
  /** When false, account-scoped study tools are omitted (signed-out search). Default true. */
  includeAccount?: boolean;
};

export function searchVertex(query: string, options: number | SearchVertexOptions = 8) {
  const limit = typeof options === 'number' ? options : (options.limit ?? 8);
  const includeAccount = typeof options === 'number' ? true : options.includeAccount !== false;
  const phrase = normalise(query);
  if (!phrase) return [];
  const tokens = phrase.split(' ');

  return GLOBAL_SEARCH_INDEX.map((entry, order) => {
    if (!includeAccount && entry.account) return null;
    const title = normalise(entry.title);
    const haystack = normalise(`${entry.title} ${entry.description} ${entry.keywords ?? ''} ${entry.area}`);
    if (!tokens.every((token) => haystack.includes(token))) return null;
    let score = 0;
    if (title === phrase) score += 120;
    if (title.startsWith(phrase)) score += 70;
    if (title.includes(phrase)) score += 45;
    score += tokens.reduce((total, token) => total + (title.includes(token) ? 12 : 3), 0);
    return { entry, score, order };
  }).filter((result): result is { entry: GlobalSearchEntry; score: number; order: number } => Boolean(result))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, Math.max(1, limit))
    .map(({ entry }) => entry);
}
