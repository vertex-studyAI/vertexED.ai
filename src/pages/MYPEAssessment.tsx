import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, SlidersHorizontal } from 'lucide-react';
import SEO from '@/components/SEO';
import { MYP5_SUBJECTS, topicSlug } from '@/content/myp5';
import { MYP5_LESSONS } from '@/content/myp5Lessons';
import '@/styles/myp5.css';

const difficulties = ['All levels', 'Foundation', 'Standard', 'Advanced', 'Challenge'];
const subjectNames = new Map(MYP5_SUBJECTS.map((subject) => [subject.slug, subject.name]));
const questionBank = MYP5_LESSONS.flatMap((lesson) => lesson.practice.map((question) => ({
  ...question,
  lessonId: lesson.id,
  topic: lesson.topic,
  subjectSlug: lesson.subjectSlug,
  subject: subjectNames.get(lesson.subjectSlug) ?? lesson.subjectSlug,
})));

export default function MYPEAssessment() {
  const [difficulty, setDifficulty] = useState('All levels');
  const [subject, setSubject] = useState('All subjects');
  const subjects = ['All subjects', ...new Set(questionBank.map((question) => question.subject))];
  const questions = useMemo(() => questionBank.filter((question) => (
    (difficulty === 'All levels' || question.difficulty === difficulty)
    && (subject === 'All subjects' || question.subject === subject)
  )), [difficulty, subject]);

  return (
    <>
      <SEO
        title="MYP 5 eAssessment practice hub | VertexED"
        description="Original MYP 5 eAssessment-style practice with command terms, timing, data response, source analysis and review strategies."
        canonical="https://www.vertexed.app/myp/eassessment"
      />
      <div className="myp-page assessment-page">
        <header className="assessment-hero">
          <Link to="/myp" className="myp-back"><ArrowLeft aria-hidden /> MYP 5 hub</Link>
          <p className="myp-kicker">VertexED Original Practice</p>
          <h1>Read the task.<br /><em>Show the thinking.</em></h1>
          <p>Practise unfamiliar contexts, command terms and sustained reasoning. These independently written questions are not official, confidential or reproduced IB examination material.</p>
          <div className="myp-lesson-meta"><span>{questionBank.length} original questions</span><span>{MYP5_LESSONS.length} detailed modules</span><span>Solutions and success criteria</span></div>
        </header>

        <section className="assessment-technique" aria-labelledby="technique-title">
          <div><p className="myp-kicker">01 / Exam technique</p><h2 id="technique-title">A repeatable review process.</h2></div>
          <ol>
            {[
              ['Read', 'Mark the command term, context and number of marks.'],
              ['Plan', 'Choose the evidence, relationship or method before writing.'],
              ['Build', 'Make every step of the reasoning visible.'],
              ['Check', 'Return to the command term and test whether the conclusion answers it.'],
            ].map(([name, copy], index) => <li key={name}><span>0{index + 1}</span><h3>{name}</h3><p>{copy}</p></li>)}
          </ol>
        </section>

        <section className="assessment-guides">
          <p className="myp-kicker">02 / What to demonstrate</p>
          <div>
            {[
              ['Command terms', 'Translate the command term into an observable action before planning the answer.'],
              ['Timing', 'Use marks as a rough guide to depth and reserve time to check every part.'],
              ['Data response', 'Read title, axes, units and scale before describing or explaining a pattern.'],
              ['Source analysis', 'Connect origin and purpose to a specific value or limitation.'],
              ['Extended response', 'Build a line of argument from claims, evidence, reasoning and a direct conclusion.'],
              ['Calculation', 'Record the relationship and substitution before the final value and unit.'],
              ['Interdisciplinary thinking', 'Use more than one lens, then explain what their combination reveals.'],
              ['Final review', 'Check unsupported claims, skipped working, missing units and incomplete task parts.'],
            ].map(([title, copy]) => <div key={title}><h3>{title}</h3><p>{copy}</p></div>)}
          </div>
        </section>

        <section className="assessment-bank" aria-labelledby="question-bank-title">
          <div className="assessment-bank-head">
            <div><p className="myp-kicker">03 / Question bank</p><h2 id="question-bank-title">Choose the next attempt.</h2></div>
            <SlidersHorizontal aria-hidden />
          </div>
          <div className="assessment-filters">
            <label>Subject<select value={subject} onChange={(event) => setSubject(event.target.value)}>{subjects.map((entry) => <option key={entry}>{entry}</option>)}</select></label>
            <label>Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>{difficulties.map((entry) => <option key={entry}>{entry}</option>)}</select></label>
          </div>
          <p className="assessment-result-count" aria-live="polite">{questions.length} questions match these filters.</p>
          <div className="assessment-questions">
            {questions.map((question) => (
              <details className="assessment-question" key={question.id}>
                <summary>
                  <div>
                    <div className="assessment-q-meta"><span>{question.id}</span><i /><span>{question.subject}</span><i /><span>{question.topic}</span></div>
                    <h3>{question.command}: {question.prompt}</h3>
                  </div>
                  <span>{question.difficulty} · {question.marks} marks</span>
                </summary>
                <div className="assessment-solution">
                  <p><strong>Hints</strong></p>
                  <ol>{question.hints.map((hint) => <li key={hint}>{hint}</li>)}</ol>
                  <p><strong>Worked solution</strong></p>
                  <ol>{question.solution.map((step) => <li key={step}>{step}</li>)}</ol>
                  <p><strong>Success criteria</strong></p>
                  <ul>{question.successCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul>
                  <Link className="assessment-attempt-link" to={`/myp/subjects/${question.subjectSlug}/${topicSlug(question.topic)}`}>
                    Open the lesson and attempt it <ArrowRight aria-hidden />
                  </Link>
                </div>
              </details>
            ))}
          </div>
          {questions.length === 0 && <p className="myp-empty">No questions match both filters.</p>}
        </section>
      </div>
    </>
  );
}
