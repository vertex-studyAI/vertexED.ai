import StudyResourcePack from '@/components/StudyResourcePack';
import { APP_ORIGIN } from '@/lib/appOrigin';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import SEO from '@/components/SEO';
import PageSection from '@/components/PageSection';
import { AP_COURSES } from '@/content/apCatalogue';
import { loadApCourse } from '@/content/apContentClient';
import type { ApCourse } from '@/content/apTypes';
import '@/styles/ap-library.css';

export default function APCourse() {
  const { courseSlug = '', moduleSlug } = useParams();
  const navigate = useNavigate();
  const summary = AP_COURSES.find((course) => course.slug === courseSlug);
  const [loaded, setLoaded] = useState<ApCourse | null>(null);
  const [failure, setFailure] = useState('');
  const [retry, setRetry] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  useEffect(() => {
    let active = true;
    setFailure('');
    if (summary && summary.questionCount > 0) loadApCourse(summary.slug).then((course) => { if (active) setLoaded(course); })
      .catch((error: unknown) => { if (active) setFailure(error instanceof Error ? error.message : 'The course could not be loaded.'); });
    return () => { active = false; };
  }, [summary, retry]);
  const course = loaded?.slug === courseSlug ? loaded : null;
  const unit = course?.modules.find((entry) => entry.id === moduleSlug);
  const unitIndex = unit && course ? course.modules.indexOf(unit) : -1;

  function exportWorking() {
    if (!course) return;
    const parts = [course.title, 'VertexED original practice. Self-review only; no official marks.', ''];
    for (const item of course.modules) for (const question of item.questions) {
      const draft = drafts[`${course.slug}/${item.id}/${question.id}`];
      if (draft?.trim()) parts.push(`${item.frameworkUnit}: ${item.title}`, question.prompt, draft, '');
    }
    const url = URL.createObjectURL(new Blob([parts.join('\n\n')], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${course.slug}-working.txt`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (!summary) return <PageSection className="ap-library"><h1>AP course not found</h1><Link to="/ap">Choose an AP course</Link></PageSection>;
  if (summary.questionCount === 0) return <PageSection className="ap-library"><h1>{summary.title}</h1><h2>Study material is awaiting subject review</h2><p role="status">Lessons and practice for this course are not available yet. Use your teacher’s approved materials and the official course information for now.</p><p><a href={summary.officialUrl} target="_blank" rel="noreferrer">Official course information (opens in a new tab)</a></p><Link to="/ap">Return to the AP course directory</Link></PageSection>;
  if (moduleSlug && !summary.modules.some((entry) => entry.id === moduleSlug)) return <PageSection className="ap-library"><h1>Study module not found</h1><p>This link does not identify a module in {summary.title}.</p><Link to={`/ap/${summary.slug}`}>Return to the course outline</Link></PageSection>;

  return <>
    <SEO title={`${unit?.title ?? summary.title} | VertexED`} description={unit?.focus ?? summary.summary} canonical={`${APP_ORIGIN}/ap/${courseSlug}${moduleSlug ? `/${moduleSlug}` : ''}`} />
    <PageSection className="ap-library ap-study">
      <nav className="ap-breadcrumb" aria-label="AP breadcrumbs"><Link to="/ap">All AP courses</Link><span aria-hidden>/</span><Link to={`/ap/${courseSlug}`}>{summary.title}</Link></nav>
      <header className="ap-course-header"><p className="ap-kicker">{summary.category} / Independent practice</p><h1>{summary.title}</h1><p>{summary.summary}</p>
        <details className="ap-source-note"><summary>Course scope and official reference</summary><p>{summary.frameworkNote}</p><p>These original lessons cover selected skills within each unit. Use the official framework and your teacher’s materials for full course preparation. Practice responses support self-review and do not receive official marks.</p><a href={summary.officialUrl} target="_blank" rel="noreferrer">Official course information ↗</a></details>
      </header>
      {!moduleSlug && <section className="ap-outline" aria-labelledby="ap-outline-title"><h2 id="ap-outline-title">Choose a study module</h2><p>Each module connects an explanation to a worked example and your own attempt.</p><ol>{summary.modules.map((entry) => <li key={entry.id}><Link to={`/ap/${courseSlug}/${entry.id}`}><span>{entry.frameworkUnit}</span><strong>{entry.title}</strong><p>{entry.focus}</p></Link></li>)}</ol></section>}
      {failure && <div role="alert" className="ap-note"><p>{failure}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Try loading again</button></div>}
      {moduleSlug && !course && !failure && <p role="status">Loading the study module…</p>}
      {unit && course && <div className="ap-module" key={`${courseSlug}/${unit.id}`}>
        <label className="ap-module-select"><span id="ap-module-select-label">Study module</span><select aria-labelledby="ap-module-select-label" value={unit.id} onChange={(event) => navigate(`/ap/${courseSlug}/${event.target.value}`)}>{course.modules.map((entry) => <option key={entry.id} value={entry.id}>{entry.frameworkUnit}: {entry.title}</option>)}</select></label>
        <article className="ap-lesson" aria-labelledby="ap-unit-title">
          <p className="ap-kicker">{unit.frameworkUnit} / Read</p><h2 id="ap-unit-title">{unit.title}</h2><p className="ap-focus">{unit.focus}</p>
          {unit.explanation.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          <section className="ap-example"><h3>Follow the reasoning</h3><p>{unit.workedExample.prompt}</p><ol>{unit.workedExample.steps.map((step, index) => <li key={index}>{step}</li>)}</ol></section>
          <aside className="ap-misconception"><h3>A misconception to check</h3><p><strong>Claim to challenge:</strong> {unit.misconception.claim}</p><p>{unit.misconception.correction}</p></aside>
        </article>
        {unit.studyPack && <StudyResourcePack key={unit.id} pack={{ ...unit.studyPack, flashcards: [...(unit.reviewCards ?? []), ...unit.studyPack.flashcards] }} />}
        <section className="ap-practice" aria-labelledby="ap-practice-title"><p className="ap-kicker">Attempt / Review / Retry</p><h2 id="ap-practice-title">Now try it yourself.</h2><p>Your working stays here as you move between AP modules. It is temporary and clears on reload or when you leave this workspace. Download it before leaving. No account progress or AP marks are recorded.</p>
          {unit.questions.map((question, index) => {
            const key = `${courseSlug}/${unit.id}/${question.id}`;
            return <section className="ap-question" key={question.id} aria-labelledby={`question-${question.id}`}><h3 id={`question-${question.id}`}>Attempt {index + 1}</h3><p>{question.prompt}</p>
              <label htmlFor={`answer-${question.id}`}>Your working for attempt {index + 1}</label><textarea id={`answer-${question.id}`} rows={5} value={drafts[key] ?? ''} maxLength={12000} onChange={(event) => setDrafts((previous) => ({ ...previous, [key]: event.target.value }))} />
              <details><summary>Show a hint</summary><ol aria-label={`Hint steps for attempt ${index + 1}`}>{(question.hints ?? [question.hint]).map((hint, i) => <li key={i}>{hint}</li>)}</ol></details>
              <details><summary>Review reasoning and checkpoints</summary>{question.marks && question.difficulty && question.calculatorPolicy && <p><strong>Editorial practice guide:</strong> {question.marks} {question.marks === 1 ? 'mark' : 'marks'}; {question.difficulty}; calculator {question.calculatorPolicy === 'not-required' ? 'not required' : question.calculatorPolicy}.</p>}<p>{question.answer}</p><ul>{question.checkpoints.map((checkpoint, i) => <li key={i}>{checkpoint}</li>)}</ul><p>Compare the evidence and reasoning, then revise your response. These checkpoints are not an official scoring rubric.</p></details>
            </section>;
          })}
          <button type="button" className="ap-primary" onClick={exportWorking} disabled={!Object.entries(drafts).some(([key, value]) => key.startsWith(`${courseSlug}/`) && value.trim())}>Download course working</button>
        </section>
        <nav className="ap-next" aria-label="Study module navigation">{unitIndex > 0 ? <Link to={`/ap/${courseSlug}/${course.modules[unitIndex - 1].id}`}>← Previous module</Link> : <Link to={`/ap/${courseSlug}`}>Course outline</Link>}{unitIndex < course.modules.length - 1 ? <Link to={`/ap/${courseSlug}/${course.modules[unitIndex + 1].id}`}>Next module →</Link> : <Link to="/ap">Choose another course →</Link>}</nav>
      </div>}
    </PageSection>
  </>;
}
