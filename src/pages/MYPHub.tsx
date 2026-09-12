import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import SEO from '@/components/SEO';
import { MYP5_SUBJECTS, MYP_GROUPS } from '@/content/myp5';
import { MYP5_LESSONS } from '@/content/myp5Lessons';
import '@/styles/myp5.css';

export default function MYPHub() {
  const [group, setGroup] = useState('All groups');
  const [query, setQuery] = useState('');
  const subjects = useMemo(() => MYP5_SUBJECTS.filter((subject) => {
    const inGroup = group === 'All groups' || subject.group === group;
    const match = `${subject.name} ${subject.group} ${subject.topics.join(' ')}`.toLowerCase().includes(query.toLowerCase());
    return inGroup && match;
  }), [group, query]);

  return <>
    <SEO title="IB MYP 5 learning hub | VertexED" description="Explore structured MYP 5 topics, practice, revision and criterion-linked study guidance across every major subject group." canonical="https://www.vertexed.app/myp" />
    <div className="myp-page">
      <header className="myp-masthead">
        <p className="myp-kicker">VertexED curriculum / IB MYP Year 5</p>
        <h1>Every subject.<br /><em>A stronger place to start.</em></h1>
        <p>Explore {MYP5_LESSONS.length} detailed learning modules and the wider course outline. Each module moves from explanation to original practice, worked solution and mastery check, and should be checked against your school’s current course plan.</p>
        <div className="myp-actions"><Link to="/myp/eassessment">Open eAssessment hub <ArrowRight aria-hidden /></Link><Link to="/signup">Start learning</Link></div>
      </header>
      <section className="myp-directory" aria-labelledby="myp-subjects-title">
        <div className="myp-directory-head"><div><p className="myp-kicker">Subject directory</p><h2 id="myp-subjects-title">Find your next concept.</h2></div><label className="myp-search"><Search aria-hidden /><span className="sr-only">Search subjects and topics</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subjects or topics" /></label></div>
        <div className="myp-filter" role="group" aria-label="Filter by subject group">
          {['All groups', ...MYP_GROUPS].map((entry) => <button type="button" key={entry} aria-pressed={group === entry} onClick={() => setGroup(entry)}>{entry}</button>)}
        </div>
        <div className="myp-subject-grid">
          {subjects.map((subject, index) => {
            const detailedCount = MYP5_LESSONS.filter((lesson) => lesson.subjectSlug === subject.slug).length;
            return <Link to={`/myp/subjects/${subject.slug}`} className="myp-subject-card" style={{ '--subject': subject.accent } as React.CSSProperties} key={subject.slug}>
            <div className="myp-subject-top"><span>{String(index + 1).padStart(2, '0')}</span><BookOpen aria-hidden /></div>
            <p>{subject.group}</p><h3>{subject.name}</h3><p>{subject.summary}</p>
            <div className="myp-card-meta"><span>{detailedCount} detailed {detailedCount === 1 ? 'module' : 'modules'}</span><span>{subject.topics.length} topic outlines</span></div>
            <span className="myp-open">Explore subject <ArrowRight aria-hidden /></span>
          </Link>})}
        </div>
        {subjects.length === 0 && <p className="myp-empty">No subject or topic matches that search.</p>}
      </section>
    </div>
  </>;
}
