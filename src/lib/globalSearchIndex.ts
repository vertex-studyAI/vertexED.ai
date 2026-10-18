import { AP_COURSES } from '../content/apCatalogue.ts';
import { MYP5_SUBJECTS, topicSlug } from '../content/myp5.ts';
import { MYP5_CONTENT_CATALOGUE, MYP5_CONTENT_TOTALS } from '../content/myp5Catalogue.ts';
import { CURRICULA, FEATURES } from '../content/curriculumDirectory.ts';
import { ARCHIVE_COLLECTIONS, LIBRARY_TOOLS, RESOURCE_ARTICLES } from '../content/resourceLibrary.ts';
import { BOARD_CONFIGS } from './curriculum.ts';

export type GlobalSearchEntry = {
  title: string;
  description: string;
  to: string;
  area: 'Page' | 'Study tool' | 'Course' | 'Subject' | 'Topic' | 'Guide' | 'Command' | 'Saved work';
  keywords?: string;
  account?: boolean;
};

const pages: GlobalSearchEntry[] = [
  { title: 'Home', description: 'The VertexED revision loop and interactive examples.', to: '/', area: 'Page', keywords: 'landing start' },
  { title: 'Features', description: 'See the connected planning, practice and review tools.', to: '/features', area: 'Page' },
  { title: 'Courses', description: 'Browse study tools by curriculum and exam board.', to: '/curricula', area: 'Course', keywords: 'curriculum programme board' },
  { title: 'MYP 5', description: MYP5_CONTENT_TOTALS.lessons ? 'Explore available MYP 5 subjects, topics and practice.' : 'Browse the MYP subject directory. Lessons and practice are awaiting subject review.', to: '/myp', area: 'Course', keywords: 'IB middle years programme' },
  { title: 'MYP eAssessment', description: MYP5_CONTENT_TOTALS.questions ? 'Practise available MYP on-screen assessment question types.' : 'View the assessment overview. Practice questions are awaiting subject review.', to: '/myp/eassessment', area: 'Course', keywords: 'exam assessment' },
  { title: 'Study guides', description: 'Open subject guides and source-bound study pages.', to: '/study-guides', area: 'Guide', keywords: 'revision learning pages' },
  { title: 'Learning library', description: 'Search course directories, available materials, curriculum desks, guides, tools and archives.', to: '/resources', area: 'Guide', keywords: 'resources articles help index content' },
  { title: 'About VertexED', description: 'Read the product purpose, principles and boundaries.', to: '/about', area: 'Page' },
  { title: 'Project webpages', description: 'Search founder-linked product, organisation and BU1LD project pages.', to: '/projects', area: 'Page', keywords: 'portfolio research directory founder' },
  { title: 'Privacy', description: 'See how VertexED handles account and study data.', to: '/privacy', area: 'Page' },
  { title: 'Terms', description: 'Read the terms for using VertexED.', to: '/terms', area: 'Page' },
];

const tools: GlobalSearchEntry[] = [
  { title: 'Dashboard', description: 'Return to your revision overview and next actions.', to: '/main', area: 'Study tool', keywords: 'home progress account', account: true },
  { title: 'Resource library', description: 'Open independent board and topic study guides.', to: '/resource-library', area: 'Study tool', keywords: 'board guides', account: true },
  { title: 'Account settings', description: 'Change appearance, accessibility and companion settings.', to: '/user-settings', area: 'Study tool', keywords: 'theme apex mascot preferences profile', account: true },
  ...LIBRARY_TOOLS.map((tool) => ({
    title: tool.title,
    description: tool.blurb,
    to: tool.to,
    area: 'Study tool' as const,
    keywords: tool.keywords,
    account: tool.account,
  })),
];

const courseEntries: GlobalSearchEntry[] = Object.entries(CURRICULA).flatMap(([curriculumSlug, board]) => {
  const config = BOARD_CONFIGS[board];
  return Object.entries(FEATURES).map(([featureSlug, feature]) => ({
    title: `${config.shortLabel} ${feature.name}`,
    description: feature.focus,
    to: `/curricula/${curriculumSlug}/${featureSlug}`,
    area: 'Course' as const,
    keywords: `${config.label} ${feature.searchName} curriculum programme exam board`,
  }));
});

const subjectEntries: GlobalSearchEntry[] = MYP5_SUBJECTS.flatMap((subject) => {
  const available = MYP5_CONTENT_CATALOGUE.some((entry) => entry.slug === subject.slug && entry.lessonCount > 0);
  return [
  {
    title: subject.name,
    description: available ? subject.summary : `${subject.name} directory. Lessons and practice are awaiting subject review.`,
    to: `/myp/subjects/${subject.slug}`,
    area: 'Subject' as const,
    keywords: `MYP ${subject.group} ${subject.skills.join(' ')} ${subject.topics.join(' ')}`,
  },
  ...(available ? subject.topics : []).map((topic) => ({
    title: topic,
    description: `${subject.name}: open the explanation, practice and mastery check.`,
    to: `/myp/subjects/${subject.slug}/${topicSlug(topic)}`,
    area: 'Topic' as const,
    keywords: `MYP ${subject.name} ${subject.group}`,
  })),
  ];
});

const apEntries: GlobalSearchEntry[] = AP_COURSES.flatMap((course) => [
  { title: course.title, description: course.summary, to: `/ap/${course.slug}`, area: 'Course' as const, keywords: `AP Advanced Placement ${course.category}` },
  ...course.modules.map((unit) => ({ title: `${course.title}: ${unit.title}`, description: unit.focus, to: `/ap/${course.slug}/${unit.id}`, area: 'Topic' as const, keywords: `${course.title} ${course.category} ${unit.frameworkUnit}` })),
]);

const guides: GlobalSearchEntry[] = RESOURCE_ARTICLES.map((article) => ({
  title: article.title,
  description: article.blurb,
  to: article.to,
  keywords: article.keywords,
  area: 'Guide',
}));

const archives: GlobalSearchEntry[] = ARCHIVE_COLLECTIONS.map((archive) => ({
  title: archive.title,
  description: archive.blurb,
  to: archive.to,
  keywords: archive.keywords,
  area: 'Guide',
}));

export const STUDY_COMMANDS: GlobalSearchEntry[] = [
  { title: 'Open Today Plan', description: 'See due reviews and your next study actions.', to: '/main#today-plan', area: 'Command', keywords: 'today next review weaknesses', account: true },
  { title: 'Create a quiz', description: 'Open Notes and Quiz to practise from a topic or source.', to: '/notetaker', area: 'Command', keywords: 'questions recall practice', account: true },
  { title: 'Add study material', description: 'Add text, Markdown or a saved source to your notebook.', to: '/study-notebook', area: 'Command', keywords: 'import upload study pack notes', account: true },
  { title: 'Create a practice paper', description: 'Choose your topics, then create and sit a timed paper.', to: '/paper-maker', area: 'Command', keywords: 'start exam test', account: true },
  { title: 'Ask Apex', description: 'Work through a concept with the AI tutor.', to: '/chatbot', area: 'Command', keywords: 'percy help explain tutor', account: true },
  { title: 'Start a focus session', description: 'Open the study timer and your focus tools.', to: '/study-zone?focus=timer', area: 'Command', keywords: 'pomodoro concentrate', account: true },
];

export const GLOBAL_SEARCH_INDEX: GlobalSearchEntry[] = [...pages, ...tools, ...STUDY_COMMANDS, ...courseEntries, ...subjectEntries, ...apEntries, ...guides, ...archives];

const normalise = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// One edit (including a transposition) for words of 4+ characters. Short queries
// remain exact/prefix matches so typos do not swamp useful subject results.
function nearWord(a: string, b: string): boolean {
  if (a.length < 4 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  if (i === a.length) return b.length <= a.length + 1;
  if (a.length < b.length) return a.slice(i) === b.slice(i + 1);
  if (a.length > b.length) return a.slice(i + 1) === b.slice(i);
  return a.slice(i + 1) === b.slice(i + 1)
    || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
}

export type SearchVertexOptions = {
  limit?: number;
  /** When false, account-scoped study tools are omitted (signed-out search). Default true. */
  includeAccount?: boolean;
  entries?: GlobalSearchEntry[];
};

export function searchVertex(query: string, options: number | SearchVertexOptions = 8) {
  const limit = typeof options === 'number' ? options : (options.limit ?? 8);
  const includeAccount = typeof options === 'number' ? true : options.includeAccount !== false;
  const entries = typeof options === 'number' ? [] : options.entries ?? [];
  const phrase = normalise(query.slice(0, 160));
  if (!phrase) return [];
  const tokens = phrase.split(' ');

  return [...entries, ...GLOBAL_SEARCH_INDEX].map((entry, order) => {
    if (!includeAccount && entry.account) return null;
    const title = normalise(entry.title);
    const haystack = normalise(`${entry.title} ${entry.description} ${entry.keywords ?? ''} ${entry.area}`);
    const words = haystack.split(' ');
    let typos = 0;
    if (!tokens.every((token) => {
      if (haystack.includes(token)) return true;
      if (words.some((word) => nearWord(token, word))) { typos++; return true; }
      return false;
    })) return null;
    let score = 0;
    if (title === phrase) score += 120;
    if (title.startsWith(phrase)) score += 70;
    if (title.includes(phrase)) score += 45;
    score += tokens.reduce((total, token) => total + (title.includes(token) ? 12 : 3), 0);
    score -= typos * 10;
    return { entry, score, order };
  }).filter((result): result is { entry: GlobalSearchEntry; score: number; order: number } => Boolean(result))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, Math.max(1, limit))
    .map(({ entry }) => entry);
}
