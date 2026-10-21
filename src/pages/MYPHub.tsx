import { APP_ORIGIN } from '@/lib/appOrigin';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import SEO from '@/components/SEO';
import { MYP5_SUBJECTS, MYP_GROUPS } from '@/content/myp5';
import { MYP5_CONTENT_TOTALS, MYP5_SUBJECT_TOTALS } from '@/content/myp5ContentClient';
import '@/styles/myp5.css';

export default function MYPHub() {
  const [group, setGroup] = useState('All groups');
  const [query, setQuery] = useState('');
  const totalTopics = MYP5_SUBJECTS.reduce((total, subject) => total + subject.topics.length, 0);
  const subjects = useMemo(() => MYP5_SUBJECTS.filter((subject) => {
    const inGroup = group === 'All groups' || subject.group === group;
    const match = `${subject.name} ${subject.group} ${subject.topics.join(' ')}`.toLowerCase().includes(query.toLowerCase());
    return inGroup && match;
  }), [group, query]);

  return <>
    <SEO title="IB MYP 5 learning hub | VertexED" description="Explore structured MYP 5 topics, practice, revision and criterion-linked study guidance across every major subject group." canonical={`${APP_ORIGIN}/myp`} />
    <div className="myp-page">
      <header className="myp-masthead">
        <p className="myp-kicker">VertexED curriculum / IB MYP Year 5</p>
        <h1>Every subject.<br /><em>A stronger place to start.</em></h1>
        <p>{MYP5_CONTENT_TOTALS.lessons ? `Explore ${MYP5_CONTENT_TOTALS.lessons} available learning modules and the wider course outline. Check the selected topics against your school’s current course plan.` : 'Detailed lessons and practice questions are awaiting subject review. The subject directory shows the planned scope; use your school’s approved materials for current study.'}</p>
        <div className="myp-actions"><Link to="/myp/eassessment">Open eAssessment hub <ArrowRight aria-hidden /></Link><Link to="/resources">Browse learning library</Link><Link to="/signup">Start learning</Link></div>
      </header>
      <section className="myp-coverage" aria-labelledby="myp-coverage-title">
        <div><p className="myp-kicker">Current curriculum coverage</p><h2 id="myp-coverage-title">Depth is labelled, not implied.</h2><p>{MYP5_CONTENT_TOTALS.lessons ? 'Available modules contain original teaching, misconceptions, worked reasoning, practice tasks, success criteria and a retrieval sequence.' : 'No detailed modules or practice questions are available until subject review is complete.'} {MYP5_CONTENT_TOTALS.lessons === totalTopics ? "Every topic in this local map now has a detailed module." : "Other mapped topics remain clearly labelled outlines."}</p></div>
        <dl>
          <div><dt>Detailed modules</dt><dd>{MYP5_CONTENT_TOTALS.lessons}</dd></div>
          <div><dt>Original questions</dt><dd>{MYP5_CONTENT_TOTALS.questions}</dd></div>
          <div><dt>Mapped topics</dt><dd>{totalTopics}</dd></div>
        </dl>
        <p className="myp-coverage-boundary">VertexED is independent of the International Baccalaureate. The official MYP framework uses eight subject groups and school-designed course content. Check your school&apos;s current plan and <a href="https://ibo.org/programmes/middle-years-programme/curriculum/" target="_blank" rel="noreferrer">the IB curriculum overview</a> before treating a topic as required coverage.</p>
      </section>
      <section className="myp-directory" aria-labelledby="myp-subjects-title">
        <div className="myp-directory-head"><div><p className="myp-kicker">Subject directory</p><h2 id="myp-subjects-title">Find your next concept.</h2></div><label className="myp-search"><Search aria-hidden /><span className="sr-only">Search subjects and topics</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subjects or topics" /></label></div>
        <div className="myp-filter" role="group" aria-label="Filter by subject group">
          {['All groups', ...MYP_GROUPS].map((entry) => <button type="button" key={entry} aria-pressed={group === entry} onClick={() => setGroup(entry)}>{entry}</button>)}
        </div>
        <div className="myp-subject-grid">
          {subjects.map((subject, index) => {
            const subjectTotals = MYP5_SUBJECT_TOTALS[subject.slug] ?? { lessons: 0, questions: 0 };
            return <Link to={`/myp/subjects/${subject.slug}`} className="myp-subject-card" style={{ '--subject': subject.accent } as React.CSSProperties} key={subject.slug}>
            <div className="myp-subject-top"><span>{String(index + 1).padStart(2, '0')}</span><BookOpen aria-hidden /></div>
            <p>{subject.group}</p><h3>{subject.name}</h3><p>{subject.summary}</p>
            <div className="myp-card-meta"><span>{subjectTotals.lessons} of {subject.topics.length} topics have detailed modules</span><span>{subjectTotals.questions} original practice questions</span></div>
            <span className="myp-open">Explore subject <ArrowRight aria-hidden /></span>
          </Link>})}
        </div>
        {subjects.length === 0 && <p className="myp-empty">No subject or topic matches that search.</p>}
      </section>
    </div>
  </>;
}
