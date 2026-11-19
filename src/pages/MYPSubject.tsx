import StudyResourcePack from '@/components/StudyResourcePack';
import { APP_ORIGIN } from '@/lib/appOrigin';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Check, FlaskConical, Lightbulb, TriangleAlert } from 'lucide-react';
import SEO from '@/components/SEO';
import MypPracticeWorkspace from '@/components/myp/MypPracticeWorkspace';
import { findSubject, findTopic, learningFrameFor, topicSlug } from '@/content/myp5';
import {
  findLoadedLesson,
  loadMypSubjectContent,
  MYP5_SUBJECT_TOTALS,
  prerequisitesForLoadedLesson,
  sourcesForLoadedLesson,
  type MypSubjectContent,
} from '@/content/myp5ContentClient';
import '@/styles/myp5.css';

const isScience = (group: string) => group === 'Sciences';

export default function MYPSubject() {
  const { subjectSlug, topicSlug: routeTopic } = useParams();
  const subject = findSubject(subjectSlug);
  const [content, setContent] = useState<MypSubjectContent | null>(null);
  const [contentError, setContentError] = useState('');
  const [requestVersion, setRequestVersion] = useState(0);
  const [reviewRequired, setReviewRequired] = useState(false);
  const heldByCatalogue = Boolean(subject && MYP5_SUBJECT_TOTALS[subject.slug]?.lessons === 0);
  const contentHeld = heldByCatalogue || reviewRequired;

  useEffect(() => {
    let cancelled = false;
    setContent(null);
    setContentError('');
    setReviewRequired(false);
    if (!subject || heldByCatalogue) return () => { cancelled = true; };
    loadMypSubjectContent(subject.slug).then((payload) => {
      if (!cancelled) setContent(payload);
    }).catch((error) => {
      if (cancelled) return;
      if (error?.code === 'CONTENT_REVIEW_REQUIRED') setReviewRequired(true);
      else setContentError('The lesson library could not be loaded. Check your connection and try again.');
    });
    return () => { cancelled = true; };
  }, [subject, heldByCatalogue, requestVersion]);

  if (!subject) {
    return <div className="myp-page"><div className="myp-not-found"><h1>Subject not found.</h1><Link to="/myp">Return to MYP 5</Link></div></div>;
  }

  const topic = findTopic(subject, routeTopic);
  const topicIndex = subject.topics.indexOf(topic);
  const nextTopic = subject.topics[(topicIndex + 1) % subject.topics.length];
  const detailedLesson = content ? findLoadedLesson(content, topic) : null;
  const contentLoading = !contentHeld && !content && !contentError;
  const learningFrame = learningFrameFor(subject);
  const practiceSection = isScience(subject.group) ? 5 : 4;

  return (
    <>
      <SEO
        title={`${topic}: MYP 5 ${subject.name} | VertexED`}
        description={contentHeld ? `${topic}: MYP ${subject.name} directory. Lessons and practice are awaiting subject review.` : `Learn ${topic} with explanation, examples, original practice, criterion skills and a revision checklist.`}
        canonical={`${APP_ORIGIN}/myp/subjects/${subject.slug}/${topicSlug(topic)}`}
      />
      <div className="myp-page myp-subject-page" style={{ '--subject': subject.accent } as React.CSSProperties}>
        <header className="myp-subject-hero">
          <Link to="/myp" className="myp-back"><ArrowLeft aria-hidden /> MYP 5 subjects</Link>
          <p className="myp-kicker">{subject.group} / {subject.name}</p>
          <h1>{topic}</h1>
          <p>{detailedLesson?.summary ?? subject.summary}</p>
          <div className="myp-lesson-meta">
            <span>{contentHeld ? 'Awaiting subject review' : contentLoading ? 'Loading editorial module' : contentError ? 'Lesson library unavailable' : detailedLesson ? 'Available learning module' : 'Study outline'}</span>
            <span>{contentHeld ? 'Subject directory' : 'VertexED Original Practice'}</span>
            <span>Not official IB guidance</span>
          </div>
        </header>

        <div className="myp-learning-layout">
          <aside className="myp-topic-rail" aria-label={`${subject.name} topics`}>
            <p>Topics</p>
            {subject.topics.map((entry, index) => (
              <Link
                aria-current={entry === topic ? 'page' : undefined}
                to={`/myp/subjects/${subject.slug}/${topicSlug(entry)}`}
                key={entry}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>{entry}
              </Link>
            ))}
          </aside>

          <article className="myp-lesson">
            {contentHeld ? (
              <section className="myp-outline-state" role="status">
                <p className="myp-kicker">Awaiting subject review</p>
                <h2>This topic is awaiting subject review.</h2>
                <p>Lessons and practice questions are not available yet. The topic list shows the planned scope. Use your teacher’s approved materials for current study.</p>
                <Link to="/myp">Return to the MYP subject directory</Link>
              </section>
            ) : contentLoading ? (
              <section className="myp-outline-state" role="status" aria-live="polite">
                <p className="myp-kicker">Loading lesson</p>
                <h2>Opening the {subject.name} library.</h2>
                <p>The module is delivered separately so the rest of VertexED remains fast.</p>
              </section>
            ) : contentError ? (
              <section className="myp-outline-state" role="alert">
                <p className="myp-kicker">Lesson library unavailable</p>
                <h2>This module did not load.</h2>
                <p>{contentError}</p>
                <button type="button" onClick={() => setRequestVersion((version) => version + 1)}>Try again</button>
              </section>
            ) : detailedLesson && content ? (
              <>
                <section className="myp-learning-frame">
                  <p className="myp-kicker">00 / Orient</p>
                  <h2>Place the idea.</h2>
                  <p className="myp-framing-question">{learningFrame.framingQuestion}</p>
                  <div className="myp-frame-grid">
                    <div><span>Key concepts</span><strong>{learningFrame.keyConcepts.join(' + ')}</strong></div>
                    <div><span>Suggested global context</span><strong>{learningFrame.globalContext}</strong></div>
                    <div><span>Approaches to learning</span><strong>{learningFrame.atlFocus.join(' + ')}</strong></div>
                  </div>
                  {detailedLesson.prerequisiteIds && (
                    <nav aria-label="Suggested prerequisites">
                      <h3>Before this topic</h3>
                      {detailedLesson.prerequisiteIds.length > 0 ? <ul>
                        {prerequisitesForLoadedLesson(content, detailedLesson).map((entry) => (
                          <li key={entry.id}><Link className="text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" to={`/myp/subjects/${entry.subjectSlug}/${topicSlug(entry.topic)}`}>{entry.topic}</Link></li>
                        ))}
                      </ul> : <p>Start here. No earlier VertexED module is required.</p>}
                      <p className="myp-note">These links suggest preparation; they do not record completion or assess your understanding.</p>
                    </nav>
                  )}
                  <p className="myp-note">This is a VertexED learning frame, not a replacement for your school&apos;s unit planner or current subject guide.</p>
                </section>
                <section>
                  <p className="myp-kicker">01 / Understand</p>
                  <h2>Build the concept</h2>
                  <ul className="myp-objectives">
                    {detailedLesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}
                  </ul>
                  {subject.slug === 'spanish' && <p className="myp-note">Level assumption: basic present-tense sentences and familiar vocabulary. Editorial target: A2 to early B1, with selected stretch patterns. This is not an official MYP phase mapping or CEFR certification; adapt tasks to your teacher’s guidance.</p>}
                  {detailedLesson.explanation?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <div className="myp-key-ideas">
                    {detailedLesson.keyIdeas.map((idea) => <p key={idea}>{idea}</p>)}
                  </div>
                  <div className="myp-definition-list">
                    {detailedLesson.definitions.map((definition) => (
                      <div className="myp-definition" key={definition.term}>
                        <Lightbulb aria-hidden />
                        <div><strong>{definition.term}</strong><p>{definition.meaning}</p></div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="myp-kicker">02 / Use a method</p>
                  <h2>Make the reasoning visible</h2>
                  <ol className="myp-method-list">{detailedLesson.method.map((step) => <li key={step}>{step}</li>)}</ol>
                  <div className="myp-worked">
                    <p><strong>Prompt</strong> {detailedLesson.workedExample.prompt}</p>
                    <ol>{detailedLesson.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                    <p><strong>Conclusion</strong> {detailedLesson.workedExample.conclusion}</p>
                  </div>
                </section>

                {isScience(subject.group) && (
                  <section>
                    <p className="myp-kicker">03 / Investigate</p>
                    <h2>Plan and evaluate evidence</h2>
                    <div className="myp-lab-grid">
                      <div><FlaskConical aria-hidden /><h3>Question</h3><p>Name the relationship and define what will be measured.</p></div>
                      <div><h3>Variables</h3><p>Change one independent variable and control plausible competing causes.</p></div>
                      <div><h3>Data</h3><p>Use an appropriate range, repeated trials, units and an analysis plan.</p></div>
                      <div><h3>Evaluation</h3><p>Separate random variation, systematic limitation and a specific improvement.</p></div>
                    </div>
                  </section>
                )}

                <section>
                  <p className="myp-kicker">{isScience(subject.group) ? '04' : '03'} / Correct</p>
                  <h2>Misconceptions to catch</h2>
                  <div className="myp-misconception-list">
                    {detailedLesson.misconceptions.map((item) => (
                      <div className="myp-warning" key={item.mistake}>
                        <TriangleAlert aria-hidden />
                        <div><strong>{item.mistake}</strong><p>{item.correction}</p></div>
                      </div>
                    ))}
                  </div>
                </section>

                {detailedLesson.studyPack && <StudyResourcePack key={`resources-${detailedLesson.id}`} pack={detailedLesson.studyPack} />}

                <MypPracticeWorkspace
                  key={detailedLesson.id}
                  lesson={detailedLesson}
                  subjectName={subject.name}
                  sectionNumber={practiceSection}
                />

                <section>
                  <p className="myp-kicker">{String(practiceSection + 1).padStart(2, '0')} / Transfer and return</p>
                  <h2>Make it survive the page.</h2>
                  <div className="myp-retrieval-sequence">
                    <div><span>Now</span><h3>Explain the relationship</h3><p>Close the notes and answer: {learningFrame.framingQuestion}</p></div>
                    <div><span>In two days</span><h3>Correct the tempting error</h3><p>Explain why this is wrong, then replace it with a better claim: {detailedLesson.misconceptions[0].mistake}</p></div>
                    <div><span>In one week</span><h3>Return to independent practice</h3><p>{detailedLesson.practice.at(-1)?.prompt}</p><p>Reattempt this question without {['english-language-literature', 'history', 'integrated-humanities', 'spanish', 'design', 'visual-arts', 'music', 'drama', 'personal-project', 'physical-health-education'].includes(subject.slug) ? 'the model response' : 'the worked solution'}. Repetition alone does not show transfer to a new problem.</p></div>
                  </div>
                  <p className="myp-note">These intervals are a revision prompt, not a measured prediction of memory or mastery.</p>
                </section>

                <section>
                  <p className="myp-kicker">{String(practiceSection + 2).padStart(2, '0')} / Check</p>
                  <h2>Revision checklist</h2>
                  <ul className="myp-checklist">
                    {detailedLesson.checklist.map((item) => <li key={item}><Check aria-hidden /> {item}</li>)}
                  </ul>
                </section>

                <section className="myp-source-note">
                  <p className="myp-kicker">Content provenance</p>
                  <h2>Sources used as references</h2>
                  <p>This is original VertexED editorial-draft content. References inform programme structure and concept checking; their text and protected assessment material are not reproduced.</p>
                  <ul>
                    {sourcesForLoadedLesson(content, detailedLesson).map((source) => (
                      <li key={source.id}>
                        <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                        <span>{source.publisher}. {source.note}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <section className="myp-outline-state">
                <p className="myp-kicker">Editorial status</p>
                <h2>This topic has a structured outline, not a finished lesson yet.</h2>
                <p>Use the subject rail to open a detailed module. This page will not invent definitions, solutions or assessment claims merely to fill the template.</p>
                <div className="myp-strategy-grid">
                  <div><h3>Start with the question</h3><p>Identify the command term, supplied evidence and the exact relationship you need to establish.</p></div>
                  <div><h3>Keep a revision trace</h3><p>Record the first attempt, the gap you found and the change you will test on the next attempt.</p></div>
                </div>
              </section>
            )}

            <Link className="myp-next" to={`/myp/subjects/${subject.slug}/${topicSlug(nextTopic)}`}>
              Next topic: {nextTopic} <ArrowRight aria-hidden />
            </Link>
          </article>
        </div>
      </div>
    </>
  );
}
