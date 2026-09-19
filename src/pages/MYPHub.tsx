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
  const totalTopics = MYP5_SUBJECTS.reduce((total, subject) => total + subject.topics.length, 0);
  const originalQuestions = MYP5_LESSONS.reduce((total, lesson) => total + lesson.practice.length, 0);
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
        <p>Explore {MYP5_LESSONS.length} detailed learning modules and the wider course outline. Each module moves through orientation, explanation, worked reasoning, original practice, transfer and later retrieval, and should be checked against your school&apos;s current course plan.</p>
        <div className="myp-actions"><Link to="/myp/eassessment">Open eAssessment hub <ArrowRight aria-hidden /></Link><Link to="/signup">Start learning</Link></div>
      </header>
      <section className="myp-coverage" aria-labelledby="myp-coverage-title">
        <div><p className="myp-kicker">Current curriculum coverage</p><h2 id="myp-coverage-title">Depth is labelled, not implied.</h2><p>Detailed modules contain original teaching, misconceptions, worked reasoning, three practice levels, success criteria and a retrieval sequence. Other mapped topics remain clearly labelled outlines.</p></div>
        <dl>
          <div><dt>Detailed modules</dt><dd>{MYP5_LESSONS.length}</dd></div>
          <div><dt>Original questions</dt><dd>{originalQuestions}</dd></div>
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
            const detailedCount = MYP5_LESSONS.filter((lesson) => lesson.subjectSlug === subject.slug).length;
            return <Link to={`/myp/subjects/${subject.slug}`} className="myp-subject-card" style={{ '--subject': subject.accent } as React.CSSProperties} key={subject.slug}>
            <div className="myp-subject-top"><span>{String(index + 1).padStart(2, '0')}</span><BookOpen aria-hidden /></div>
            <p>{subject.group}</p><h3>{subject.name}</h3><p>{subject.summary}</p>
            <div className="myp-card-meta"><span>{detailedCount} of {subject.topics.length} topics have detailed modules</span><span>{detailedCount * 3} original practice questions</span></div>
            <span className="myp-open">Explore subject <ArrowRight aria-hidden /></span>
          </Link>})}
        </div>
        {subjects.length === 0 && <p className="myp-empty">No subject or topic matches that search.</p>}
      </section>
    </div>
  </>;
}
