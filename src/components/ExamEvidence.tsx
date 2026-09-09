import { Link } from 'react-router';
import { getMeasuredEntries } from '@/lib/weaknessTracker';
import { getRetryHistory, retryTargetRoute } from '@/lib/retryQueue';
import { retryIdForWeakness } from '@/lib/retryQueueCore.mjs';

export default function ExamEvidence({ subject }: { subject: string }) {
  const entries = getMeasuredEntries().filter((entry) => entry.subject === subject);
  const topics = [...new Set(entries.map((entry) => entry.topic))].sort();
  const retries = getRetryHistory();
  return (
    <section className="exam-prep-panel" aria-labelledby="topic-evidence-title">
      <p className="exam-prep-kicker">Your recorded attempts</p>
      <h2 id="topic-evidence-title">Topic evidence and mistakes</h2>
      <p className="exam-prep-supporting-copy">{topics.length} topics with recorded marks in {subject}. This is not syllabus coverage: topics without evidence remain unknown.</p>
      {topics.length === 0 ? <p className="mt-4 text-sm">No confirmed marks yet. <Link className="text-primary underline" to="/answer-reviewer">Review an answer</Link> and record the mark and its source.</p> : (
        <div className="mt-4 divide-y divide-border">
          {topics.map((topic) => {
            const attempts = entries.filter((entry) => entry.topic === topic).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
            const retry = retries.find((item) => item.id === retryIdForWeakness({ topic, subject }));
            return <details key={topic} className="py-4">
              <summary className="cursor-pointer text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{topic} <span className="text-sm text-muted-foreground">({attempts.length} recorded attempts)</span></summary>
              <p className="mt-2 text-sm text-muted-foreground">Marks and verification methods below are saved records. They are not independently certified by VertexED.</p>
              <ol className="mt-3 space-y-4">
                {attempts.map((entry) => <li key={entry.id} className="border-l-2 border-primary pl-4 text-sm break-words">
                  <p className="font-medium">{entry.score}/{entry.maxScore} marks · {entry.source} · {new Date(entry.recordedAt).toLocaleDateString()}</p>
                  <p>Recorded verification: {entry.verification.method.replace(/-/g, ' ')}</p>
                  <p>{entry.verification.reference ? `Reference: ${entry.verification.reference}` : 'No reference text saved.'}</p>
                  <p className="text-muted-foreground">{entry.attemptId ? `Attempt: ${entry.attemptId}` : 'Original answer link was not saved for this record.'}</p>
                </li>)}
              </ol>
              {retry ? <div className="mt-4 text-sm">
                <p>Topic retry: {retry.status}. Due {new Date(retry.dueAt).toLocaleDateString()}.</p>
                <p className="text-muted-foreground">This is the existing topic retry, not a new queue or a claimed link to one particular answer.</p>
                <Link className="text-primary underline" to={retryTargetRoute(retry)}>Open {topic} retry</Link>
              </div> : <p className="mt-4 text-sm text-muted-foreground">No saved retry for this topic.</p>}
            </details>;
          })}
        </div>
      )}
    </section>
  );
}
