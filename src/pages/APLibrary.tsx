import { APP_ORIGIN } from '@/lib/appOrigin';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowRight, BookOpen } from 'lucide-react';
import SEO from '@/components/SEO';
import PageSection from '@/components/PageSection';
import { AP_COURSES, AP_TOTALS } from '@/content/apCatalogue';
import { searchApCourses } from '@/lib/apCourseSearch';
import { useSearchParamDraft } from '@/hooks/useSearchParamDraft';
import '@/styles/ap-library.css';

const categories = [...new Set(AP_COURSES.map((course) => course.category))];

export default function APLibrary() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useSearchParamDraft(params.get('q') ?? '');
  const group = categories.find((category) => category === params.get('group')) ?? '';
  const results = useMemo(() => searchApCourses(AP_COURSES, query)
    .filter((course) => !group || course.category === group), [group, query]);
  function update(name: string, value: string) {
    if (name === 'q') setQuery(value);
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(name, value); else next.delete(name);
      return next;
    }, { replace: true, preventScrollReset: true });
  }

  return <>
    <SEO title="AP course library | VertexED" description={AP_TOTALS.questions ? 'Browse available AP study modules and official course references.' : 'Browse AP course references. VertexED lessons and practice are awaiting subject review.'} canonical={`${APP_ORIGIN}/ap`} />
    <PageSection className="ap-library">
      <header className="ap-header">
        <p className="ap-kicker">AP revision library / 2026–27</p>
        <h1>Choose a course.<br /><em>Work through the reasoning.</em></h1>
        <p>{AP_TOTALS.questions ? 'Read a focused explanation, follow a worked example and attempt original questions before opening the review.' : 'Lessons and practice questions are awaiting subject review. Browse course references while review is in progress.'}</p>
        <dl className="ap-totals"><div><dt>Courses</dt><dd>{AP_TOTALS.courses}</dd></div><div><dt>Study modules</dt><dd>{AP_TOTALS.modules}</dd></div><div><dt>Practice prompts</dt><dd>{AP_TOTALS.questions}</dd></div></dl>
        <p className="ap-boundary">Independent VertexED material, not official AP questions or an endorsed course. Modules introduce selected skills within each unit; use your teacher’s course materials for full syllabus preparation.</p>
        <a href="https://apstudents.collegeboard.org/courses" target="_blank" rel="noreferrer">Check the official AP course catalogue ↗</a>
      </header>
      <section aria-labelledby="ap-courses-title" className="ap-browser">
        <h2 id="ap-courses-title">Find your AP course</h2>
        <div className="ap-filters">
          <label>Search courses and topics<input type="search" value={query} onChange={(event) => update('q', event.target.value)} placeholder="Try calculus, sources or Spanish" /></label>
          <label>Subject area<select value={group} onChange={(event) => update('group', event.target.value)}><option value="">All subject areas</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        </div>
        <p role="status">{results.length} {results.length === 1 ? 'course' : 'courses'}{query ? ` matching “${query}”` : ''}</p>
        <div className="ap-course-grid">{results.map((course) => <Link className="ap-course-card" key={course.slug} to={`/ap/${course.slug}`}>
          <p className="ap-kicker">{course.category}</p><h3>{course.title}</h3><p>{course.summary}</p>
          <p className="ap-course-meta">{course.questionCount ? `${course.modules.length} modules · ${course.questionCount} practice prompts` : 'Awaiting subject review'}</p>
          <strong>Open course <ArrowRight aria-hidden size={16} /></strong>
        </Link>)}</div>
        {results.length === 0 && <div className="ap-empty"><BookOpen aria-hidden /><h3>No course matches these filters.</h3><button type="button" onClick={() => { setQuery(''); setParams({}); }}>Clear filters</button></div>}
      </section>
      <aside className="ap-note"><h2>Different courses need different practice.</h2><p>Art portfolios, research and performance tasks use reflection and evidence checks. Written responses use self-review, not an automatic AP score. These text modules do not replace laboratory, listening, speaking, studio or teacher-supervised work.</p><Link to="/resources">Browse the full learning library</Link></aside>
    </PageSection>
  </>;
}
