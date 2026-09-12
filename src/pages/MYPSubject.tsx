import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Check, FlaskConical, Lightbulb, TriangleAlert } from 'lucide-react';
import SEO from '@/components/SEO';
import MypPracticeWorkspace from '@/components/myp/MypPracticeWorkspace';
import { findSubject, findTopic, topicSlug } from '@/content/myp5';
import { findMypLesson, sourcesForLesson } from '@/content/myp5Lessons';
import '@/styles/myp5.css';

const isScience = (group: string) => group === 'Sciences';

export default function MYPSubject() {
  const { subjectSlug, topicSlug: routeTopic } = useParams();
  const subject = findSubject(subjectSlug);
  if (!subject) {
    return <div className="myp-page"><div className="myp-not-found"><h1>Subject not found.</h1><Link to="/myp">Return to MYP 5</Link></div></div>;
  }

  const topic = findTopic(subject, routeTopic);
  const topicIndex = subject.topics.indexOf(topic);
  const nextTopic = subject.topics[(topicIndex + 1) % subject.topics.length];
  const detailedLesson = findMypLesson(subject.slug, topic);

  return (
    <>
      <SEO
        title={`${topic}: MYP 5 ${subject.name} | VertexED`}
        description={`Learn ${topic} with explanation, examples, original practice, criterion skills and a mastery checklist.`}
        canonical={`https://www.vertexed.app/myp/subjects/${subject.slug}/${topicSlug(topic)}`}
      />
      <div className="myp-page myp-subject-page" style={{ '--subject': subject.accent } as React.CSSProperties}>
        <header className="myp-subject-hero">
          <Link to="/myp" className="myp-back"><ArrowLeft aria-hidden /> MYP 5 subjects</Link>
          <p className="myp-kicker">{subject.group} / {subject.name}</p>
          <h1>{topic}</h1>
          <p>{detailedLesson?.summary ?? subject.summary}</p>
          <div className="myp-lesson-meta">
            <span>{detailedLesson ? 'Detailed editorial draft' : 'Study outline'}</span>
            <span>VertexED Original Practice</span>
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
            {detailedLesson ? (
              <>
                <section>
                  <p className="myp-kicker">01 / Understand</p>
                  <h2>Build the concept</h2>
                  <ul className="myp-objectives">
                    {detailedLesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}
                  </ul>
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

                <MypPracticeWorkspace
                  lesson={detailedLesson}
                  subjectName={subject.name}
                  sectionNumber={isScience(subject.group) ? 5 : 4}
                />

                <section>
                  <p className="myp-kicker">{isScience(subject.group) ? '06' : '05'} / Master</p>
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
                    {sourcesForLesson(detailedLesson).map((source) => (
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
