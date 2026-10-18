import { AP_COURSES } from '@/content/apCatalogue';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Archive, ArrowRight, BookOpen, GraduationCap, Library, Search, Wrench } from 'lucide-react';
import SEO from '@/components/SEO';
import PageSection from '@/components/PageSection';
import { MYP5_SUBJECTS, topicSlug } from '@/content/myp5';
import { MYP5_CONTENT_TOTALS, MYP5_SUBJECT_TOTALS } from '@/content/myp5ContentClient';
import { CURRICULA, FEATURES } from '@/content/curriculumDirectory';
import { ARCHIVE_COLLECTIONS, ARCHIVE_DIRECTORY, LIBRARY_TOOLS, RESOURCE_ARTICLES, RESOURCE_ARTICLE_DIRECTORY } from '@/content/resourceLibrary';
import { BOARD_CONFIGS } from '@/lib/curriculum';
import { FORMULA_REFERENCE, FORMULA_SUBJECTS } from '@/content/formulaReference';
import { searchResources } from '@/lib/resourceSearch';
import { useSearchParamDraft } from '@/hooks/useSearchParamDraft';
import { LIBRARY_STUDY_MOVES } from '@/content/learningFoundations';
import '@/styles/learning-library.css';

type LibraryCategory = 'ap' | 'myp' | 'curricula' | 'guides' | 'tools' | 'archives';

type LibraryEntry = {
  to: string;
  title: string;
  description: string;
  category: LibraryCategory;
  meta: string;
  keywords: string;
};

const CATEGORY_DETAILS: Array<{
  id: LibraryCategory;
  label: string;
  description: string;
  icon: typeof BookOpen;
}> = [
  { id: 'myp', label: 'MYP 5', description: 'Subject directory', icon: BookOpen },
  { id: 'curricula', label: 'Curriculum desks', description: 'Board-shaped workflows', icon: GraduationCap },
  { id: 'ap', label: 'AP courses', description: 'Course references', icon: BookOpen },
  { id: 'guides', label: 'Editorial guides', description: 'Methods and subject help', icon: Library },
  { id: 'tools', label: 'Study tools', description: 'Practice and planning', icon: Wrench },
  { id: 'archives', label: 'Archives', description: 'Legacy starter collections', icon: Archive },
];

const MYP_ENTRIES: LibraryEntry[] = MYP5_SUBJECTS.map((subject) => {
  const totals = MYP5_SUBJECT_TOTALS[subject.slug];
  return {
    to: `/myp/subjects/${subject.slug}`,
    title: subject.name,
    description: subject.summary,
    category: 'myp',
    meta: totals.lessons ? `${totals.lessons} modules · ${totals.questions} questions` : 'Awaiting subject review',
    keywords: `${subject.group} ${subject.skills.join(' ')} ${subject.topics.join(' ')}`,
  };
});

const MYP_TOPIC_ENTRIES: LibraryEntry[] = MYP5_SUBJECTS.filter((subject) => MYP5_SUBJECT_TOTALS[subject.slug]?.lessons > 0).flatMap((subject) =>
  subject.topics.map((topic) => ({
    to: `/myp/subjects/${subject.slug}/${topicSlug(topic)}`,
    title: topic,
    description: `${subject.name}: explanation, worked reasoning, original practice and retrieval.`,
    category: 'myp' as const,
    meta: `${subject.name} · Original module`,
    keywords: `${subject.group} ${subject.skills.join(' ')}`,
  })),
);

const CURRICULUM_ENTRIES: LibraryEntry[] = Object.entries(CURRICULA).flatMap(([curriculumSlug, board]) => {
  const config = BOARD_CONFIGS[board];
  return Object.entries(FEATURES).map(([featureSlug, feature]) => ({
    to: `/curricula/${curriculumSlug}/${featureSlug}`,
    title: `${config.shortLabel} ${feature.name}`,
    description: feature.focus,
    category: 'curricula' as const,
    meta: config.label,
    keywords: `${feature.searchName} ${config.subjects.join(' ')} ${config.commandTerms.join(' ')}`,
  }));
});

const GUIDE_ENTRIES: LibraryEntry[] = RESOURCE_ARTICLES.map((article) => ({
  to: article.to,
  title: article.title,
  description: article.blurb,
  category: 'guides',
  meta: article.category === 'wellness' ? 'Wellbeing and integrity' : `Guide · ${article.category}`,
  keywords: article.keywords,
}));

const TOOL_ENTRIES: LibraryEntry[] = LIBRARY_TOOLS.map((tool) => ({
  to: tool.to,
  title: tool.title,
  description: tool.blurb,
  category: 'tools',
  meta: tool.account ? 'Account workspace' : 'Public reference',
  keywords: tool.keywords,
}));

const ARCHIVE_ENTRIES: LibraryEntry[] = ARCHIVE_COLLECTIONS.map((archive) => ({
  to: archive.to,
  title: archive.title,
  description: archive.blurb,
  category: 'archives',
  meta: 'Legacy starter collection',
  keywords: archive.keywords,
}));

const AP_ENTRIES: LibraryEntry[] = AP_COURSES.map((course) => ({
  to: `/ap/${course.slug}`, title: course.title, description: course.summary, category: 'ap', meta: course.modules.length ? `${course.modules.length} modules · ${course.questionCount} prompts` : 'Awaiting subject review', keywords: course.category,
}));
const AP_TOPIC_ENTRIES: LibraryEntry[] = AP_COURSES.flatMap((course) => course.modules.map((unit) => ({
  to: `/ap/${course.slug}/${unit.id}`, title: `${course.title}: ${unit.title}`, description: unit.focus, category: 'ap' as const, meta: `${course.title} · ${unit.frameworkUnit}`, keywords: course.category,
})));

const LIBRARY_ENTRIES = [
  ...AP_ENTRIES,
  ...MYP_ENTRIES,
  ...CURRICULUM_ENTRIES,
  ...GUIDE_ENTRIES,
  ...TOOL_ENTRIES,
  ...ARCHIVE_ENTRIES,
];

const FORMULA_ENTRIES: LibraryEntry[] = FORMULA_REFERENCE.map((entry) => ({
  to: `/study-tools?formula=${entry.id}`,
  title: entry.title,
  description: entry.description,
  category: 'tools',
  meta: `${FORMULA_SUBJECTS.find(({ id }) => id === entry.subject)?.label} · Worked reference and practice`,
  keywords: `${entry.keywords} ${entry.conditions}`,
}));

const CATEGORY_COUNTS: Record<LibraryCategory, number> = {
  ap: AP_ENTRIES.length,
  myp: MYP_ENTRIES.length,
  curricula: CURRICULUM_ENTRIES.length,
  guides: GUIDE_ENTRIES.length,
  tools: TOOL_ENTRIES.length,
  archives: ARCHIVE_ENTRIES.length,
};

export default function ResourcesIndex() {
  const [params, setParams] = useSearchParams();
  const [query, setQueryDraft] = useSearchParamDraft(params.get('q') ?? '');
  const category = CATEGORY_DETAILS.find(({ id }) => id === params.get('category'))?.id ?? 'myp';
  const hasQuery = Boolean(query.trim());

  function setQuery(value: string) {
    setQueryDraft(value);
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set('q', value); else next.delete('q');
      return next;
    }, { replace: true, preventScrollReset: true });
  }

  function setCategory(value: LibraryCategory) {
    setQueryDraft('');
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete('q');
      next.set('category', value);
      return next;
    }, { preventScrollReset: true });
  }

  const filtered = useMemo(() => {
    if (query.trim()) {
      return searchResources([...LIBRARY_ENTRIES, ...MYP_TOPIC_ENTRIES, ...AP_TOPIC_ENTRIES, ...FORMULA_ENTRIES], query);
    }
    return LIBRARY_ENTRIES.filter((entry) => entry.category === category);
  }, [category, query]);

  const activeCategory = CATEGORY_DETAILS.find((entry) => entry.id === category) ?? CATEGORY_DETAILS[0];

  return (
    <>
      <SEO
        title="Learning library | VertexED"
        description="Browse MYP and AP course directories, available study materials, curriculum desks, editorial guides, study tools and legacy archives."
        canonical="https://www.vertexed.app/resources"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'VertexED learning library',
          url: 'https://www.vertexed.app/resources',
          description: 'Course directories, available learning material and study tools, with review holds labelled.',
        }}
      />

      <PageSection className="learning-library">
        <header className="library-hero">
          <div>
            <p className="library-kicker">VertexED learning library</p>
            <h1>Find your topic. Take the next step.</h1>
            <p className="library-intro">
              Browse MYP and AP course directories, available study materials, curriculum desks, editorial guides,
              practice tools and legacy archives. Lessons awaiting subject review are labelled and unavailable.
            </p>
            <div className="library-actions">
              <Link to="/myp">Open MYP 5 <ArrowRight aria-hidden /></Link>
              <Link to="/ap">Explore all AP courses</Link>
              <Link to="/curricula">Browse curricula</Link>
            </div>
          </div>
          <dl className="library-stats" aria-label="Library coverage">
            <div><dt>MYP modules</dt><dd>{MYP5_CONTENT_TOTALS.lessons}</dd></div>
            <div><dt>MYP questions</dt><dd>{MYP5_CONTENT_TOTALS.questions}</dd></div>
            <div><dt>Curriculum desks</dt><dd>{CURRICULUM_ENTRIES.length}</dd></div>
            <div><dt>Editorial guides</dt><dd>{RESOURCE_ARTICLES.length}</dd></div>
          </dl>
        </header>

        <section className="library-method" aria-labelledby="library-method-title">
          <header>
            <p className="library-kicker">Use the library deliberately</p>
            <h2 id="library-method-title">Turn a resource into an attempt, not another open tab.</h2>
            <p>Start with the course boundary, retrieve before reading, produce a response and verify it. The directory helps you find material; the study move determines what you do with it.</p>
          </header>
          <ol>
            {LIBRARY_STUDY_MOVES.map((item, index) => (
              <li key={item.label}>
                <span>{String(index + 1).padStart(2, '0')} / {item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="library-browser" aria-labelledby="library-browser-title">
          <div className="library-browser-head">
            <div>
              <p className="library-kicker">Browse and search</p>
              <h2 id="library-browser-title">Find the exact next step.</h2>
            </div>
            <label className="library-search">
              <Search aria-hidden />
              <span className="sr-only">Search the learning library</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search subjects, available topics and resources"
              />
            </label>
          </div>

          <div className="library-tabs" role="group" aria-label="Filter the learning library">
            {CATEGORY_DETAILS.map((entry) => {
              const Icon = entry.icon;
              return (
                <button
                  type="button"
                  key={entry.id}
                  aria-pressed={!hasQuery && category === entry.id}
                  onClick={() => setCategory(entry.id)}
                >
                  <Icon aria-hidden />
                  <span><strong>{entry.label}</strong><small>{CATEGORY_COUNTS[entry.id]} · {entry.description}</small></span>
                </button>
              );
            })}
          </div>

          <div className="library-results-head" aria-live="polite">
            <p>{filtered.length} {hasQuery ? `search ${filtered.length === 1 ? 'result' : 'results'} across all collections` : `${activeCategory.label.toLowerCase()} ${filtered.length === 1 ? 'entry' : 'entries'}`}</p>
            {query && <button type="button" onClick={() => setQuery('')}>Clear search</button>}
          </div>

          {!hasQuery && (category === 'guides' || category === 'archives') && <section className="mb-6 rounded-xl border border-border p-5" aria-label="Materials awaiting review">
            <h3 className="font-semibold">Materials awaiting subject review</h3>
            <p className="mt-2 text-sm text-muted-foreground">These titles remain in the directory for reference. Their teaching material is not available yet.</p>
            <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              {(category === 'guides' ? RESOURCE_ARTICLE_DIRECTORY : ARCHIVE_DIRECTORY).filter((entry) => !entry.available).map((entry) => <li key={entry.title}>{entry.title} · Awaiting review</li>)}
            </ul>
          </section>}

          <div className="library-grid">
            {filtered.map((entry) => (
              <Link className="library-card" data-testid="library-item" to={entry.to} key={`${entry.category}-${entry.to}`}>
                <p>{entry.meta}</p>
                <h3>{entry.title}</h3>
                <span>{entry.description}</span>
                <strong>Open resource <ArrowRight aria-hidden /></strong>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (hasQuery || !['guides', 'archives'].includes(category)) && (
            <div className="library-empty">
              <Search aria-hidden />
              <h3>No library result matches that search.</h3>
              <p>Try a subject, concept, exam board or tool name.</p>
            </div>
          )}
        </section>

        <aside className="library-boundary" aria-labelledby="library-boundary-title">
          <div><Library aria-hidden /><h2 id="library-boundary-title">Imported guide boundary</h2></div>
          <p>
            245 imported guide files remain held from the public index while source rights, factual review and
            publication approval are unresolved. They are not counted as finished learning content. MYP and AP
            lessons also require subject review before they become available. Use your teacher’s approved materials for current study.
          </p>
        </aside>
      </PageSection>
    </>
  );
}
