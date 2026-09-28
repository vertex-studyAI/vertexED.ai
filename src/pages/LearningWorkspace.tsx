import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import RichMarkdown from '@/components/RichMarkdown';
import { LEARNING_QUESTIONS, CONCEPT_GRAPH, CURRICULUM_CATALOG, PRACTICE_MODES, MISTAKE_CAUSES, buildKnowledgeModel, selectLearningQuestion } from '@/lib/learningModel.mjs';
import { answerLabel, classifyPracticeAnswer } from '@/lib/adaptivePractice.mjs';
import { readLearningState, saveLearningRecord, type PracticeAttempt, type PracticeMistake } from '@/lib/learningStore';
import { parsePracticeSession, advancePracticeSession, writePracticeSession } from '@/lib/practiceSession.mjs';
import { userContentStorageKeys, getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import { getPendingLearnerStateCount, initializeLearnerStateSync } from '@/lib/learnerStateSync';
import { fitPracticeQuestions, practiceHint, sessionEvidenceChanges } from '@/lib/learningJourney.mjs';
import { trackProductEvent } from '@/lib/productAnalytics.mjs';
import CorrectiveRetry from '@/components/learning/CorrectiveRetry';
const KnowledgeExplorer = lazy(() => import('@/components/learning/KnowledgeExplorer'));
const MistakeNotebook = lazy(() => import('@/components/learning/MistakeNotebook'));
const PracticeTutor = lazy(() => import('@/components/learning/PracticeTutor'));
import '@/styles/learning-workspace.css';

type Question = typeof LEARNING_QUESTIONS[number];
type Response = { answer: string; confidence: number | null; hinted: boolean; hintLevel?: number; seconds: number; flagged: boolean; submitted?: string };
type Session = { budgetMinutes?: number; id: string; ids: string[]; index: number; mode: string; startedAt: number; deadline: number | null; finished: boolean; responses: Record<string, Response>; subject: string; topic: string; concept: string; curriculum: string };
const modeNames: Record<string, string> = { diagnostic: 'Diagnostic', targeted: 'Targeted weakness', mixed: 'Mixed review', exam: 'Exam simulation', rapid: 'Rapid recall', prerequisites: 'Prerequisite repair', challenge: 'Challenge' };
const emptyResponse = (): Response => ({ answer: '', confidence: null, hinted: false, seconds: 0, flagged: false });
export default function LearningWorkspace() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  return <Workspace key={`${user?.id || 'signed-out'}:${params.toString()}`} />;
}
function Workspace() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const selectedConcept = CONCEPT_GRAPH.find(n => n.id === params.get('concept'));
  const selectedQuestion = LEARNING_QUESTIONS.find(q => q.id === params.get('question'));
  const invalidLink = Boolean((params.get('concept') && !selectedConcept) || (params.get('question') && !selectedQuestion)
    || (selectedConcept && selectedQuestion && !selectedQuestion.conceptIds.includes(selectedConcept.id)));
  const [subject, setSubject] = useState(selectedConcept?.subject || selectedQuestion?.subject || params.get('subject') || 'Mathematics');
  const [topic, setTopic] = useState('');
  const [concept, setConcept] = useState(selectedConcept?.id || '');
  const [curriculum, setCurriculum] = useState('');
  const [mode, setMode] = useState(PRACTICE_MODES.includes(params.get('mode') || '') ? params.get('mode')! : 'diagnostic');
  const [count, setCount] = useState(5);
  const [timeBudget, setTimeBudget] = useState(['5','10','15','30','60'].includes(params.get('minutes') || '') ? params.get('minutes')! : '');
  const [tutorOpen, setTutorOpen] = useState(false);
  const tutorOpener = useRef<HTMLButtonElement | null>(null);
  const [historyRange, setHistoryRange] = useState(30);
  const [tab, setTab] = useState(['practice', 'knowledge', 'mistakes', 'progress'].includes(params.get('tab') || '') ? params.get('tab')! : 'practice');
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [mistakes, setMistakes] = useState<PracticeMistake[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const sessionKey = userContentStorageKeys(user?.id || null).practiceSession;
  const savedSessionRaw = useRef<string | null>(null);
  const activeQuestionRef = useRef<HTMLHeadingElement>(null);
  const focusNewSession = useRef(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  const [cause, setCause] = useState('unclassified');
  const [reflection, setReflection] = useState('');
  const [correction, setCorrection] = useState('');
  const refresh = () => { const state = readLearningState(); setAttempts(state.attempts); setMistakes(state.mistakes); };
  useEffect(() => {
    try {
      refresh();
      savedSessionRaw.current = localStorage.getItem(sessionKey);
      setSession(parsePracticeSession(savedSessionRaw.current));
      setSessionSaved(true); setReady(true);
    } catch (e) { setError((e as Error).message); }
    const onChange = () => { try { refresh(); } catch (e) { setError((e as Error).message); } };
    window.addEventListener('vertexed:learner-state-changed', onChange);
    const onStorage = (event: StorageEvent) => {
      if ((event.key === sessionKey || event.key === null) && localStorage.getItem(sessionKey) !== savedSessionRaw.current) {
        setReady(false); setSessionSaved(false);
        setError('This practice session changed in another tab. Your work here is paused so it cannot overwrite that copy. Copy any unsaved answer before reloading.');
      }
      onChange();
    };
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('vertexed:learner-state-changed', onChange); window.removeEventListener('storage', onStorage); };
  }, [sessionKey]);
  const sessionId = session?.id;
  const sessionFinished = session?.finished;
  useEffect(() => {
    if (focusNewSession.current && activeQuestionRef.current) {
      activeQuestionRef.current.focus();
      focusNewSession.current = false;
    }
  }, [sessionId]);
  useEffect(() => {
    if (!ready || !sessionId || sessionFinished) return;
    const timer = window.setInterval(() => {
      setNow(Date.now());
      if (document.visibilityState === 'visible') setSession(s => {
        if (!s || s.finished) return s;
        const id = s.ids[s.index];
        const r = s.responses[id] || emptyResponse();
        if (r.submitted || (s.deadline && Date.now() >= s.deadline)) return s;
        return { ...s, responses: { ...s.responses, [id]: { ...r, seconds: Math.min(86400, r.seconds + 1) } } };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [ready, sessionId, sessionFinished]);
  useEffect(() => {
    if (!ready || !session) return;
    try {
      if (getUserContentStorageScope() !== user?.id) return;
      savedSessionRaw.current = writePracticeSession(localStorage, sessionKey, savedSessionRaw.current, session);
      setSessionSaved(true);
    } catch (e) {
      setSessionSaved(false); setReady(false);
      setError(e instanceof Error && e.message.includes('another tab') ? e.message : 'This session could not be saved on your device. Keep this page open and copy your answer before reloading.');
    }
  }, [session, ready, sessionKey, user?.id]);
  const model = useMemo(() => buildKnowledgeModel(attempts), [attempts]);
  const q = LEARNING_QUESTIONS.find(q => q.id === session?.ids[session.index]);
  const response = q && session ? session.responses[q.id] || emptyResponse() : emptyResponse();
  const result = q && response.submitted && (session?.mode !== 'exam' || session.finished) ? classifyPracticeAnswer(q, response.answer) : null;
  const expired = Boolean(session?.deadline && now >= session.deadline);
  const updateResponse = (patch: Partial<Response>) => setSession(s => !s || !q ? s : ({ ...s, responses: { ...s.responses, [q.id]: { ...(s.responses[q.id] || emptyResponse()), ...patch } } }));
  const start = (targetId = '', nextMode = mode) => {
    if (!ready || invalidLink || getUserContentStorageScope() !== user?.id) return;
    const target = LEARNING_QUESTIONS.find(q => q.id === targetId);
    if (target && timeBudget && target.estimatedSeconds + 60 > Number(timeBudget) * 60) {
      setNotice('This question needs about ' + Math.ceil((target.estimatedSeconds + 60) / 60) + ' minutes including feedback. Increase the time budget or choose by question count.');
      return;
    }
    const filters = target ? { subject: target.subject, topic: nextMode === 'targeted' ? target.topic : '', concept: '', curriculum: '' } : { subject, topic, concept, curriculum };
    const ids = fitPracticeQuestions({ minutes: timeBudget, count, select: (exclude: string[]) => selectLearningQuestion({ ...filters, attempts, mode: nextMode, exclude, targetId: exclude.length === 0 ? targetId : '' }) }) as string[];
    if (!ids.length) { setNotice('No original question matches this scope. Choose another scope or use your course materials in Study notebook.'); return; }
    focusNewSession.current = true;
    setSession({ ...(timeBudget ? { budgetMinutes: Number(timeBudget) } : {}), id: crypto.randomUUID(), ids, index: 0, mode: nextMode, startedAt: Date.now(), deadline: nextMode === 'exam' ? Date.now() + ids.reduce((sum, id) => sum + LEARNING_QUESTIONS.find(q => q.id === id)!.estimatedSeconds * 1000, 0) : null, responses: {}, finished: false, ...filters });
    trackProductEvent('Learning practice started', { mode: nextMode, count: ids.length, minutes: Number(timeBudget) || null });
    setTab('practice'); setNotice('Each submitted answer joins your practice history.'); setError('');
  };
  const submitOne = (question: Question, value: Response, current: Session) => {
    if (!value.answer.trim() || value.submitted) return value;
    const id = `attempt:${current.id}-${current.ids.indexOf(question.id)}`;
    saveLearningRecord('practice_attempt', { id, questionId: question.id, answer: value.answer, confidence: value.confidence, hinted: value.hinted, seconds: value.seconds, at: new Date().toISOString(), mode: current.mode });
    return { ...value, submitted: id };
  };
  const check = () => {
    if (!ready || !q || !session || getUserContentStorageScope() !== user?.id) return;
    try { updateResponse(submitOne(q, response, session)); refresh(); setNotice('Answer saved on this device. Account sync queued.'); }
    catch (e) { setError((e as Error).message); }
  };
  const finish = () => {
    if (!ready || !session || getUserContentStorageScope() !== user?.id) return;
    try {
      const responses = { ...session.responses };
      for (const id of session.ids) responses[id] = submitOne(LEARNING_QUESTIONS.find(q => q.id === id)!, responses[id] || emptyResponse(), session);
      trackProductEvent('Learning practice completed', { mode: session.mode, count: session.ids.length });
      setSession({ ...session, responses, finished: true }); refresh(); setNotice('Session finished. Results use one mark per original question, with no partial credit.');
    } catch (e) { setError((e as Error).message); }
  };
  const next = () => {
    if (!ready || !session || getUserContentStorageScope() !== user?.id) return;
    activeQuestionRef.current?.focus();
    setSession(advancePracticeSession(session, attempts)); setReflection(''); setCorrection(''); setCause('unclassified');
  };
  const saveMistake = () => {
    if (!ready || !q || getUserContentStorageScope() !== user?.id) return;
    try {
      const existing = mistakes.find(m => m.questionId === q.id);
      saveLearningRecord('practice_mistake', { id: existing?.id || `mistake:${crypto.randomUUID()}`, questionId: q.id, cause, reflection, correction, updatedAt: new Date().toISOString() });
      refresh(); setNotice('Mistake saved. Review timing follows later attempts on this question.');
    } catch (e) { setError((e as Error).message); }
  };
  const personalSubjects = Array.isArray(user?.user_metadata?.subjects) ? user.user_metadata.subjects : [];
  const subjects = [...new Set([...LEARNING_QUESTIONS.map(q => q.subject), ...personalSubjects])] as string[];
  const evidenceChanges = session?.finished ? sessionEvidenceChanges(session, attempts) : [];
  const historyAttempts = attempts.filter(a => !historyRange || Date.parse(a.at) >= Date.now() - historyRange * 86400000);
  const score = session?.ids.filter(id => session.responses[id]?.answer.trim() && classifyPracticeAnswer(LEARNING_QUESTIONS.find(q => q.id === id), session.responses[id].answer).correct).length || 0;
  return <div className={session && !session.finished ? "learning-workspace is-solving" : "learning-workspace"}>
    <Helmet><title>Learn and practise | VertexED</title><meta name="robots" content="noindex" /></Helmet>
    <header className="learning-heading"><div><p className="dashboard-kicker">Attempt → feedback → return</p><h1>Your learning record</h1><p>Original questions, visible evidence, and a next step you can explain.</p></div><Link to="/main">Back to Today</Link></header>
    <nav className="learning-tabs" aria-label="Learning views">{['practice', 'knowledge', 'mistakes', 'progress'].map(name => <button key={name} disabled={session?.mode === "exam" && !session.finished && name !== "practice"} aria-pressed={tab === name} onClick={() => setTab(name)}>{name === 'practice' ? 'Practise' : name[0].toUpperCase() + name.slice(1)}</button>)}</nav>
    {invalidLink && <p role="alert" className="learning-notice">This practice link refers to a question or concept that is no longer available or does not match. <Link to="/learn">Choose a new practice scope</Link>.</p>}
    {error && <p role="alert" className="learning-notice">{error} {!ready && <Link to="/user-settings">Account data and recovery</Link>}</p>}
    {!ready && session && <section className="learning-paper" aria-label="Paused practice recovery"><h2>Keep your answer before reloading</h2><p>The saved copy has not been replaced. Copy any answers you need from this tab, then reload to continue from the saved session.</p><label htmlFor="paused-practice-answers">Answers in this tab</label><textarea id="paused-practice-answers" readOnly value={session.ids.map((id, index) => `${index + 1}. ${session.responses[id]?.answer || '(No answer)'}`).join('\n')} /><button onClick={() => window.location.reload()}>Reload saved session</button></section>}
    {notice && <p role="status" className="learning-notice">{notice}</p>}
    <details className="learning-sync"><summary>Device storage and account sync</summary><p className="learning-meta">{getPendingLearnerStateCount() ? `${getPendingLearnerStateCount()} account updates pending. Device copies retained.` : 'Practice records are stored under your account on this device.'} <button onClick={() => void initializeLearnerStateSync().then(() => { refresh(); setNotice('Account sync checked. Pending items remain saved on this device.'); }).catch(() => setError('Account sync is unavailable. Device records are preserved.'))}>Retry account sync</button></p></details>
    {tab === 'practice' && <>
      <details className="learning-paper learning-setup" open={!session || session.finished}><summary>Practice setup</summary><h2 id="practice-setup">Choose your next attempt</h2>
        <div className="learning-fields">
          <label>Curriculum scope<select value={curriculum} onChange={e => setCurriculum(e.target.value)}><option value="">General original bank</option>{CURRICULUM_CATALOG.map(c => <option key={c.id} value={c.bankLabel}>{c.label}</option>)}</select></label>
          <label>Subject<select value={subject} onChange={e => { setSubject(e.target.value); setTopic(''); setConcept(''); }}>{subjects.map(s => <option key={s}>{s}</option>)}</select></label>
          <label>Unit / topic<select value={topic} onChange={e => { setTopic(e.target.value); setConcept(''); }}><option value="">All available topics</option>{(Array.from(new Set(LEARNING_QUESTIONS.filter(q => q.subject === subject).map(q => q.topic))) as string[]).map(t => <option key={t}>{t}</option>)}</select></label>
          <label>Concept<select value={concept} onChange={e => setConcept(e.target.value)}><option value="">All concepts in scope</option>{CONCEPT_GRAPH.filter(n => n.subject === subject && (!topic || n.topic === topic)).map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select></label>
          <label>Practice mode<select value={mode} onChange={e => setMode(e.target.value)}>{PRACTICE_MODES.map(m => <option key={m} value={m}>{modeNames[m]}</option>)}</select></label>
          <label>Time budget<select value={timeBudget} onChange={e => setTimeBudget(e.target.value)}><option value="">Choose by question count</option>{[5,10,15,30,60].map(n => <option key={n} value={n}>{n} minutes</option>)}</select></label>
          <label>Questions<select disabled={Boolean(timeBudget)} value={count} onChange={e => setCount(Number(e.target.value))}>{[3,5,10,20].map(n => <option key={n}>{n}</option>)}</select></label>
        </div><p>Limited original bank: {LEARNING_QUESTIONS.length} questions. This is not a complete syllabus, official paper or predicted grade. Fewer questions appear when your scope is narrow.</p>
        {timeBudget && <p>Up to {timeBudget} minutes of estimated work, including feedback. The bank may have fewer questions than this budget allows.</p>}
        {mode === 'exam' && <p className="learning-notice">Exam simulation: one mark per question, calculator optional, hints and tutor hidden, feedback after finishing. The timer uses the selected questions’ suggested durations. This is an original practice set, not an official paper.</p>}
        <button className="learning-primary" disabled={!ready || invalidLink || Boolean(session && !session.finished)} onClick={() => start(selectedQuestion && selectedQuestion.subject === subject && (!topic || selectedQuestion.topic === topic) && (!concept || selectedQuestion.conceptIds.includes(concept)) && (!curriculum || selectedQuestion.curriculum.includes(curriculum)) ? selectedQuestion.id : '')}>Start practice</button>
        {session && !session.finished && <p>Resume the saved session below or finish it before starting another.</p>}
      </details>
      {session && <section className="learning-paper learning-session" aria-labelledby="active-question">
        <div className="learning-session-context"><p className="dashboard-kicker">{session.subject} · {session.curriculum || 'Original question bank'}</p><p className="learning-meta">{sessionSaved ? 'Session saved on this device' : 'Session changes are not saved'} · {session.ids.filter(id => session.responses[id]?.submitted).length} / {session.ids.length} answers recorded</p></div>
        <fieldset disabled={!ready} className="learning-session-controls"><legend className="sr-only">Current practice session</legend>
        <div className="learning-heading"><h2 id="active-question" ref={activeQuestionRef} tabIndex={-1}>{session.finished ? 'Session review' : modeNames[session.mode]} · {session.index + 1} / {session.ids.length}</h2>
          {session.deadline && <p role="timer" aria-label="Exam time remaining">{Math.max(0, Math.ceil((session.deadline - now) / 60000))} min remaining</p>}</div>
        {session.finished && <p role="status">{score} / {session.ids.length} marks. Unanswered questions receive zero. Hints and repeats remain visible in your evidence.</p>}
        {session.finished && <details><summary>Skills after these attempts</summary><p>Changes below use this session’s original submitted answers and the evidence recorded before it began. Corrections stay separate in your history.</p><ul>{evidenceChanges.map(n => <li key={n.id}><strong>{n.label}</strong> · {n.previousStatus === n.status ? n.status + ' (unchanged)' : n.previousStatus + ' → ' + n.status}<p className="learning-meta">{n.explanation} {n.dueAt ? 'Review ' + new Date(n.dueAt).toLocaleDateString() + '.' : ''}</p></li>)}</ul>{!evidenceChanges.length && <p>No submitted answers to compare.</p>}</details>}
        {session.finished && <details><summary>Marks, timing and revision by topic</summary><div className="learning-table"><table><thead><tr><th>Topic</th><th>Marks</th><th>Time</th><th>Lost mark / next step</th></tr></thead><tbody>{session.ids.map(id => {
          const item = LEARNING_QUESTIONS.find(item => item.id === id)!;
          const saved = session.responses[id];
          const checked = saved?.answer.trim() ? classifyPracticeAnswer(item, saved.answer) : null;
          const reflection = mistakes.find(m => m.questionId === id);
          return <tr key={id}><td>{item.topic}</td><td>{checked?.correct ? 1 : 0} / 1</td><td>{saved?.seconds || 0}s</td><td>{checked?.correct ? 'Try a transfer question' : !checked ? 'Unanswered: revisit this topic' : reflection?.cause && reflection.cause !== 'unclassified' ? `${reflection.cause} (your reflection)` : checked.errorSubcategory?.replace(/_/g, ' ') || 'Cause not established'} <Link to={`/learn?concept=${encodeURIComponent(item.conceptIds[0])}`}>Revise</Link></td></tr>;
        })}</tbody></table></div></details>}

        {session.mode === 'exam' && !session.finished && !expired && session.deadline && session.deadline - now <= 60000 && <p role="status">One minute or less remains. Check flagged and unanswered questions.</p>}
        {expired && !session.finished && <p role="status">Time is up. Answers are locked; finish to see your review.</p>}
        <nav className="learning-tabs" aria-label="Question navigation">{session.ids.map((id, i) => <button key={id} aria-label={'Question ' + (i + 1) + (session.responses[id]?.flagged ? ', flagged' : '') + (session.responses[id]?.answer.trim() ? ', answered' : ', unanswered')} aria-current={session.index === i ? 'step' : undefined} disabled={session.mode !== 'exam' && !session.finished && i > session.index} onClick={() => { setSession({ ...session, index: i }); setReflection(''); setCorrection(''); setCause('unclassified'); }}>{i + 1}{session.responses[id]?.flagged ? ' ⚑' : ''}{session.responses[id]?.submitted ? ' ✓' : ''}</button>)}</nav>
        {q && <>
          <p className="learning-meta">{q.subject} · {q.topic} · {q.difficulty} · {q.marks} mark · Calculator {q.calculator} · {Math.ceil(q.estimatedSeconds / 60)} min suggested</p>
          <RichMarkdown>{q.prompt}</RichMarkdown>
          <fieldset disabled={Boolean(response.submitted) || session.finished || expired}><legend>Your attempt</legend>
            {q.type === 'multiple-choice' ? q.choices?.map((choice, i) => <label key={choice} className="learning-choice"><input type="radio" name={q.id} checked={response.answer === String(i)} onChange={() => updateResponse({ answer: String(i) })} /><RichMarkdown>{choice}</RichMarkdown></label>) : <label>Answer {q.units ? `(${q.units})` : ''}<input aria-label="Your answer" inputMode="decimal" value={response.answer} maxLength={200} onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing && response.answer.trim() && session.mode !== "exam") { e.preventDefault(); check(); } }} onChange={e => updateResponse({ answer: e.target.value })} /></label>}
            {(session.index % 3 === 0 || response.confidence !== null) && <label>Confidence before feedback<select value={response.confidence ?? ""} onChange={e => updateResponse({ confidence: e.target.value ? Number(e.target.value) : null })}><option value="">Skip (optional)</option>{['Guessing', 'Unsure', 'Somewhat sure', 'Sure', 'Very sure'].map((label, i) => <option key={label} value={i + 1}>{label}</option>)}</select></label>}
          </fieldset>
          <div className="learning-actions">
            <button aria-pressed={response.flagged} onClick={() => updateResponse({ flagged: !response.flagged })}>{response.flagged ? 'Unflag question' : 'Flag question'}</button>
            {session.mode !== 'exam' && !response.submitted && <button disabled={session.finished || (response.hintLevel || 0) >= 3} onClick={() => { const level = Math.min(3, (response.hintLevel || 0) + 1); updateResponse({ hinted: true, hintLevel: level }); trackProductEvent('Learning hint opened', { level }); }}>{!response.hintLevel ? 'Show a hint' : response.hintLevel === 1 ? 'Show the first step' : 'Show complete solution'}</button>}
            {session.mode !== 'exam' && !session.finished && <button ref={tutorOpener} onClick={() => { if (!response.submitted) updateResponse({ hinted: true }); setTutorOpen(true); }}>Ask Apex about this question</button>}
            {session.mode !== 'exam' && !response.submitted && <button className="learning-primary" disabled={!response.answer.trim() || session.finished} onClick={check}>Check answer</button>}
            {session.index < session.ids.length - 1 && <button disabled={session.mode !== 'exam' && !response.submitted && !session.finished} onClick={next}>Next question</button>}
            {!session.finished && <button onClick={finish}>Finish session</button>}
          </div>
          {response.hinted && session.mode !== 'exam' && <div className="learning-notice"><p>{response.hintLevel === 3 ? 'Worked solution' : 'Progressive help'} · Assisted attempt</p><RichMarkdown>{practiceHint(q, response.hintLevel || 1)}</RichMarkdown></div>}
          {result && <div className="learning-feedback"><h3>{result.correct ? 'Correct' : 'Review this attempt'}</h3><p>{result.evidence}</p><p>{result.nextStep}</p><p>{response.seconds} seconds of visible-page time · {response.confidence === null ? 'Confidence not recorded' : 'Confidence ' + response.confidence + '/5'} · {response.hinted ? 'Hint used' : 'No hint used'}</p>
            <details><summary>Worked reasoning and answer</summary><ol>{q.solution.map(step => <li key={step}><RichMarkdown>{step}</RichMarkdown></li>)}</ol><RichMarkdown>{`Answer: ${answerLabel(q)}`}</RichMarkdown></details>
            {!result.correct && <CorrectiveRetry key={response.submitted} question={q} onSaved={refresh} />}

            {!result.correct && <details><summary>Save or update this mistake</summary><label>Error cause (your reflection)<select value={cause} onChange={e => setCause(e.target.value)}>{MISTAKE_CAUSES.map(c => <option key={c}>{c}</option>)}</select></label><label>Why I got it wrong<textarea maxLength={2000} value={reflection} onChange={e => setReflection(e.target.value)} /></label><label>Corrected reasoning<textarea maxLength={2000} value={correction} onChange={e => setCorrection(e.target.value)} /></label><button onClick={saveMistake}>Save mistake</button></details>}
          </div>}
          {session.finished && <details><summary>Build a repair plan</summary><p>Start with the questions you missed. The next attempt adapts within that topic; later reviews follow your recorded attempts.</p><ul>{session.ids.filter(id => !session.responses[id]?.answer.trim() || !classifyPracticeAnswer(LEARNING_QUESTIONS.find(q => q.id === id), session.responses[id].answer).correct).map(id => { const missed = LEARNING_QUESTIONS.find(q => q.id === id)!; return <li key={id}><button onClick={() => start(id, 'targeted')}>Repair {missed.topic}</button> · {Math.ceil(missed.estimatedSeconds / 60) + 1} min or more, including feedback</li>; })}</ul><Link to="/planner">Protect time in your study plan</Link></details>}
          {session.finished && <div className="learning-actions"><button onClick={() => start('', session.mode)}>Start another session</button><button onClick={() => setTab('knowledge')}>See concept evidence</button><Link to="/main">See today's recommendations</Link></div>}
        </>}
        </fieldset>
      </section>}
    </>}
    {tab === 'knowledge' && <Suspense fallback={<p role="status">Loading concept evidence…</p>}><KnowledgeExplorer model={model} attempts={attempts} subject={subject} subjects={subjects} onSubject={setSubject} initialConcept={selectedConcept?.id} onPractice={n => { setSubject(n.subject); setConcept(n.id); setTopic(''); setTab('practice'); }} /></Suspense>}
    {tab === 'mistakes' && <Suspense fallback={<p role="status">Loading mistakes…</p>}><MistakeNotebook attempts={attempts} mistakes={mistakes} busy={!ready || Boolean(session && !session.finished)} onSaved={refresh} onRepair={id => { const origin = LEARNING_QUESTIONS.find(q => q.id === id)!; const transfer = LEARNING_QUESTIONS.find(q => q.id !== id && q.conceptIds.some(c => origin.conceptIds.includes(c))); start(transfer?.id || id, 'targeted'); }} /></Suspense>}
    {tutorOpen && q && session?.mode !== 'exam' && <Suspense fallback={<p role="status">Opening tutor…</p>}><PracticeTutor key={q.id} question={q} answer={response.answer} attempts={attempts} onClose={() => setTutorOpen(false)} openerRef={tutorOpener} /></Suspense>}
    {tab === 'progress' && <section className="learning-paper"><h2>What has changed</h2><label>Date range<select value={historyRange} onChange={e => setHistoryRange(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={0}>All recorded history</option></select></label>{!historyAttempts.length ? <p>No practice evidence yet. Complete a diagnostic to begin. Opening a lesson does not count as mastery.</p> : <><div className="learning-summary"><p><strong>{historyAttempts.length}</strong> submitted attempts</p><p><strong>{historyAttempts.filter(a => a.correct).length}</strong> correct answers</p><p><strong>{Math.round(historyAttempts.reduce((n, a) => n + a.seconds, 0) / 60)}</strong> active-page minutes</p><p><strong>{model.filter(n => n.status === 'unassessed').length}</strong> unassessed bank concepts</p></div><p>Accuracy includes repeated questions. Active-page time is not verified attention. No predicted grade or exam-readiness percentage is inferred.</p><div className="learning-table"><table><caption>Recent practice evidence</caption><thead><tr><th>When</th><th>Topic</th><th>Difficulty</th><th>Result</th><th>Confidence</th><th>Support</th></tr></thead><tbody>{[...historyAttempts].sort((a,b) => b.at.localeCompare(a.at)).slice(0, 30).map(a => { const question = LEARNING_QUESTIONS.find(q => q.id === a.questionId)!; return <tr key={a.id}><td>{new Date(a.at).toLocaleDateString()}</td><td>{question.topic}</td><td>{question.difficulty}</td><td>{a.correct ? 'Correct' : 'Incorrect'}</td><td>{a.confidence === null ? 'Not recorded' : `${a.confidence}/5`}</td><td>{a.hinted ? 'Hint used' : 'Unassisted'}</td></tr>; })}</tbody></table></div></>}</section>}
  </div>;
}
