import { useState } from 'react';
import { EXAM_DRILLS } from '@/content/examPractice';
import { getMeasuredEntries } from '@/lib/weaknessTracker';
import { diagnoseExamEvidence } from '@/lib/examDiagnosis.mjs';
import { practiceSubjectMatches } from '@/lib/examPracticeSubject.mjs';

export default function ExamPracticeLab({ subject, board }: { subject: string; board: string }) {
  const [programme, setProgramme] = useState('IB MYP');
  const [selected, setSelected] = useState('');
  const drills = EXAM_DRILLS.filter(item => item.programme === programme);
  const selectedDrill = drills.find(item => item.id === selected);
  const subjectDrill = drills.find(item => practiceSubjectMatches(subject, item.subject));
  const drill = selectedDrill || subjectDrill || null;
  const evidence = diagnoseExamEvidence(getMeasuredEntries(), subject, board);
  return <section id="exam-practice-lab" className="exam-prep-panel scroll-mt-24" aria-labelledby="practice-lab-title">
    <p className="exam-prep-kicker">Focused practice</p>
    <h2 id="practice-lab-title">Fix a step. Test the transfer.</h2>
    <p className="exam-prep-supporting-copy">Original editorial practice, with MYP sciences at the centre. These short checks are not official criteria scores, past papers or a complete syllabus.</p>
    <div className="grid gap-4 sm:grid-cols-2 my-5">
      <div><label htmlFor="exam-practice-programme" className="text-sm font-medium">Programme</label><select id="exam-practice-programme" className="block w-full rounded-lg border border-border bg-background p-3 mt-2" value={programme} onChange={event => { setProgramme(event.target.value); setSelected(''); }}><option>IB MYP</option><option>IB DP</option><option>AP</option></select></div>
      <div><label htmlFor="exam-practice-target" className="text-sm font-medium">Target</label><select id="exam-practice-target" className="block w-full rounded-lg border border-border bg-background p-3 mt-2" value={drill?.id ?? ''} onChange={event => setSelected(event.target.value)}>{!drill && <option value="">Choose a practice target</option>}{drills.map(item => <option key={item.id} value={item.id}>{item.subject}: {item.focus}</option>)}</select></div>
    </div>
    {drill ? <PracticeAttempt key={drill.id} drill={drill} /> : <div className="rounded-xl border border-border bg-muted/30 p-5" role="status"><strong>No subject-matched drill is available yet.</strong><p className="text-sm text-muted-foreground mt-2">The current {programme} editorial pack does not contain a {subject} drill. Choose a different target above if you intentionally want cross-subject practice; VertexED will not silently substitute another subject.</p></div>}
    <div className="mt-6 border-t border-border pt-5">
      <h3 className="font-semibold">What your recorded work suggests</h3>
      <p className="text-sm text-muted-foreground mt-2">{subject} · {board.replace(/_/g, ' ')}. Records from other programmes, or without a programme, are excluded.</p>
      {evidence.length ? <ul className="mt-3 space-y-3">{evidence.slice(0, 3).map(item => <li key={item.topic}><strong>{item.topic}: {item.percent}% of recorded marks</strong><p className="text-sm text-muted-foreground">{item.attempts} attempts. {item.next}</p></li>)}</ul> : <p className="text-sm text-muted-foreground mt-2">No verified marks in {subject} yet. Complete an answer review and confirm the mark source before using it to guide revision.</p>}
      <p className="text-sm text-muted-foreground mt-4">A practice percentage is not a predicted grade. Topic coverage, assessment conditions and current grade boundaries are not established here. No next-paper prediction is made without a documented paper dataset.</p>
    </div>
  </section>;
}

function PracticeAttempt({ drill }: { drill: typeof EXAM_DRILLS[number] }) {
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  return <article className="rounded-xl border border-border bg-background p-5">
    <p className="text-xs uppercase tracking-wider text-primary">{drill.topic} · About {drill.minutes} minutes</p>
    <h3 className="font-semibold text-lg mt-2">{drill.focus}</h3>
    <p className="my-4 leading-relaxed">{drill.prompt}</p>
    <label className="block text-sm font-medium" htmlFor="exam-drill-answer">Your explanation</label>
    <textarea id="exam-drill-answer" className="w-full min-h-32 rounded-lg border border-border bg-background p-3 mt-2" value={answer} maxLength={6000} onChange={event => setAnswer(event.target.value)} placeholder="Show the reasoning, not just the result." />
    <p className="text-xs text-muted-foreground mt-1">Scratch work stays in this view only. Changing the target clears it. Nothing here is sent to AI or counted as verified marks.</p>
    <button type="button" className="mt-4 rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium" aria-expanded={revealed} onClick={() => setRevealed(!revealed)}>{revealed ? 'Hide worked reasoning' : 'Compare with worked reasoning'}</button>
    {revealed && <div className="mt-5 border-l-2 border-primary pl-4"><p className="leading-relaxed">{drill.solution}</p><h4 className="font-medium mt-4">Check your explanation</h4><ul className="list-disc pl-5 text-sm space-y-2 mt-2">{drill.checks.map(check => <li key={check}>{check}</li>)}</ul><p className="mt-4"><strong>Transfer question: </strong>{drill.transfer}</p><a className="inline-block text-sm text-primary underline mt-3" href={drill.source} target="_blank" rel="noreferrer">Check the reference</a></div>}
  </article>;
}
