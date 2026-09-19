import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, Check, FileText, Link2, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  EXAM_MATERIAL_KINDS,
  EXAM_UPLOAD_MAX_BYTES,
  summarizeConfirmedResults,
  validateExamMaterialLink,
  validateExamSetup,
  validateExamUpload,
} from '@/lib/examSetupCore.mjs';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

type Material = {
  id: string;
  kind: string;
  source: 'file' | 'link';
  name: string;
  size?: number;
  extension?: string;
  url?: string;
  addedAt: string;
  ownershipConfirmed: true;
};

type Result = {
  id: string;
  subject: string;
  assessmentType: string;
  paper: string;
  score: number;
  maxScore: number;
  durationMinutes?: number;
  questionType?: string;
  topic?: string;
  commandTerm?: string;
  confidence?: string;
  confirmationSource: 'learner' | 'teacher';
  humanConfirmed: true;
  recordedAt: string;
};

type ExamSetup = {
  assessmentType: string;
  programme: string;
  courseLevel: string;
  grade: string;
  subject: string;
  paper: string;
  date: string;
  durationMinutes: number;
  totalMarks: number;
  calculatorRule: string;
  allowedMaterials: string;
  topics: string;
  criteria: string;
  commandTerms: string;
  eAssessment: boolean;
  officialFormat: string;
  readingSource: string;
  materials: Material[];
  results: Result[];
  savedAt?: string;
};

type SetupState = { setups: Record<string, ExamSetup> };

function defaultSetup(subject: string, programme: string, grade: string): ExamSetup {
  return {
    assessmentType: '', programme, courseLevel: '', grade, subject, paper: '', date: '',
    durationMinutes: 60, totalMarks: 50, calculatorRule: 'Confirm with your teacher or official assessment guidance.',
    allowedMaterials: '', topics: '', criteria: '', commandTerms: '', eAssessment: false,
    officialFormat: '', readingSource: '', materials: [], results: [],
  };
}

function splitList(value: string) {
  return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

function CountList({ values, empty }: { values: Record<string, number>; empty: string }) {
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
  return entries.length ? <ul className="exam-analytics-list">{entries.map(([label, count]) => <li key={label}><span>{label}</span><strong>{count}</strong></li>)}</ul> : <p className="exam-empty-copy">{empty}</p>;
}

export default function ExamAssessmentSetup({ subject, programme, grade }: { subject: string; programme: string; grade: string }) {
  const { user, loading } = useAuth();
  const storageKey = userContentStorageKeys(loading ? undefined : user?.id ?? null).examPrepSetup;
  const [state, setState] = useLocalStorage<SetupState>(storageKey, { setups: {} });
  const saved = state.setups?.[subject];
  const [draft, setDraft] = useState<ExamSetup>(() => saved ?? defaultSetup(subject, programme, grade));
  const [step, setStep] = useState<'edit' | 'review' | 'saved'>(saved ? 'saved' : 'edit');
  const [error, setError] = useState('');
  const [materialKind, setMaterialKind] = useState(EXAM_MATERIAL_KINDS[0]);
  const [linkValue, setLinkValue] = useState('');
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [resultDraft, setResultDraft] = useState({ score: '', maxScore: '', durationMinutes: '', questionType: '', topic: '', commandTerm: '', confidence: '', confirmationSource: 'learner' as 'learner' | 'teacher', humanConfirmed: false });

  useEffect(() => {
    const next = saved ?? defaultSetup(subject, programme, grade);
    setDraft(next);
    setStep(saved ? 'saved' : 'edit');
    setError('');
  }, [grade, programme, saved, storageKey, subject]);

  const update = <K extends keyof ExamSetup>(key: K, value: ExamSetup[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const analytics = useMemo(() => summarizeConfirmedResults(draft.results, draft), [draft]);

  const addFile = (file: File | undefined) => {
    setError('');
    if (!ownershipConfirmed) {
      setError('Confirm that you may use this material before adding it.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    const checked = validateExamUpload(file, draft.materials);
    if (!checked.ok || !file) {
      setError(checked.error);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    update('materials', [...draft.materials, {
      id: crypto.randomUUID(), kind: materialKind, source: 'file', name: file.name,
      size: file.size, extension: checked.extension, addedAt: new Date().toISOString(), ownershipConfirmed: true,
    }]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const addLink = () => {
    setError('');
    if (!ownershipConfirmed) return setError('Confirm that you may use this material before adding it.');
    const checked = validateExamMaterialLink(linkValue);
    if (!checked.ok) return setError(checked.error);
    if (draft.materials.some((item) => item.url === checked.url)) return setError('This link is already in the assessment setup.');
    update('materials', [...draft.materials, {
      id: crypto.randomUUID(), kind: materialKind, source: 'link', name: new URL(checked.url).hostname,
      url: checked.url, addedAt: new Date().toISOString(), ownershipConfirmed: true,
    }]);
    setLinkValue('');
  };

  const reviewSetup = () => {
    const validation = validateExamSetup(draft);
    if (!validation.ok) {
      setError(`Complete the required fields: ${validation.missing.join(', ')}.`);
      return;
    }
    setError('');
    setStep('review');
  };

  const saveSetup = () => {
    const finalDraft = { ...draft, savedAt: new Date().toISOString() };
    setState((current) => ({ setups: { ...(current?.setups ?? {}), [subject]: finalDraft } }));
    setDraft(finalDraft);
    setStep('saved');
  };

  const addResult = () => {
    setError('');
    const score = Number(resultDraft.score);
    const maxScore = Number(resultDraft.maxScore);
    if (!resultDraft.humanConfirmed) return setError('Confirm the score against your paper, teacher feedback, or another human record.');
    if (!Number.isFinite(score) || !Number.isFinite(maxScore) || score < 0 || maxScore <= 0 || score > maxScore) return setError('Enter a valid score and maximum mark.');
    const result: Result = {
      id: crypto.randomUUID(), subject, assessmentType: draft.assessmentType, paper: draft.paper,
      score, maxScore, durationMinutes: Number(resultDraft.durationMinutes) || undefined,
      questionType: resultDraft.questionType.trim() || undefined, topic: resultDraft.topic.trim() || undefined,
      commandTerm: resultDraft.commandTerm.trim() || undefined, confidence: resultDraft.confidence || undefined,
      confirmationSource: resultDraft.confirmationSource, humanConfirmed: true, recordedAt: new Date().toISOString(),
    };
    const next = { ...draft, results: [...draft.results, result] };
    setDraft(next);
    setState((current) => ({ setups: { ...(current?.setups ?? {}), [subject]: { ...next, savedAt: new Date().toISOString() } } }));
    setResultDraft({ score: '', maxScore: String(draft.totalMarks), durationMinutes: '', questionType: '', topic: '', commandTerm: '', confidence: '', confirmationSource: 'learner', humanConfirmed: false });
  };

  return <section className="exam-prep-panel exam-assessment-setup" aria-labelledby="assessment-setup-title">
    <div className="exam-prep-section-head">
      <div>
        <p className="exam-prep-kicker"><ShieldCheck className="h-4 w-4" aria-hidden /> Assessment setup</p>
        <h2 id="assessment-setup-title">Define what you are preparing for</h2>
      </div>
      {step === 'saved' && <button type="button" className="exam-secondary-action" onClick={() => setStep('edit')}><Pencil className="h-4 w-4" aria-hidden /> Edit setup</button>}
    </div>
    <p className="exam-prep-supporting-copy">Required fields shape the schedule. Optional detail improves practice relevance. Files remain on your device as validated metadata; VertexED does not claim access to licensed past papers.</p>
    {error && <p className="exam-form-error" role="alert">{error}</p>}

    {step === 'edit' && <>
      <div className="exam-form-grid">
        <label>Assessment type <span>Required</span><select value={draft.assessmentType} onChange={(event) => update('assessmentType', event.target.value)}><option value="">Choose one</option><option>Class test</option><option>Unit assessment</option><option>Mock exam</option><option>Final exam</option><option>Coursework</option><option>Essay</option><option>Oral assessment</option></select></label>
        <label>Board or programme <span>Required</span><input value={draft.programme} onChange={(event) => update('programme', event.target.value)} placeholder="IB MYP, IB DP, AP…" /></label>
        <label>Course level <span>Optional</span><input value={draft.courseLevel} onChange={(event) => update('courseLevel', event.target.value)} placeholder="Standard, Higher, Core…" /></label>
        <label>Grade or year <span>Optional</span><input value={draft.grade} onChange={(event) => update('grade', event.target.value)} /></label>
        <label>Subject <span>Required</span><input value={draft.subject} readOnly aria-readonly="true" /></label>
        <label>Paper or component <span>Optional</span><input value={draft.paper} onChange={(event) => update('paper', event.target.value)} placeholder="Paper 1, Criterion B…" /></label>
        <label>Date <span>Required</span><input type="date" value={draft.date} onChange={(event) => update('date', event.target.value)} /></label>
        <label>Duration in minutes <span>Required</span><input type="number" min="5" max="480" value={draft.durationMinutes} onChange={(event) => update('durationMinutes', Number(event.target.value))} /></label>
        <label>Total marks <span>Required</span><input type="number" min="1" max="1000" value={draft.totalMarks} onChange={(event) => update('totalMarks', Number(event.target.value))} /></label>
        <label>Calculator rules <span>Awaiting confirmation</span><input value={draft.calculatorRule} onChange={(event) => update('calculatorRule', event.target.value)} /></label>
        <label className="exam-form-wide">Allowed materials <span>Optional</span><input value={draft.allowedMaterials} onChange={(event) => update('allowedMaterials', event.target.value)} placeholder="Formula booklet, dictionary, none…" /></label>
        <label className="exam-form-wide">Topics or units <span>Optional, comma-separated</span><textarea value={draft.topics} onChange={(event) => update('topics', event.target.value)} /></label>
        <label>Criteria <span>Optional</span><input value={draft.criteria} onChange={(event) => update('criteria', event.target.value)} placeholder="A, B, C…" /></label>
        <label>Command terms <span>Optional</span><input value={draft.commandTerms} onChange={(event) => update('commandTerms', event.target.value)} placeholder="Explain, evaluate, compare…" /></label>
        <label className="exam-check-label exam-form-wide"><input type="checkbox" checked={draft.eAssessment} onChange={(event) => update('eAssessment', event.target.checked)} /> This is an eAssessment</label>
        {draft.eAssessment && <label className="exam-form-wide">Official format or platform detail <span>Required for this branch</span><textarea value={draft.officialFormat} onChange={(event) => update('officialFormat', event.target.value)} placeholder="Describe only confirmed official format, tools, sections, and metadata." /></label>}
        <label className="exam-form-wide">Reading source or unseen-passage notes <span>Optional</span><textarea value={draft.readingSource} onChange={(event) => update('readingSource', event.target.value)} placeholder="Paste your permitted source notes or the passage features you need to review." /></label>
      </div>

      <div className="exam-materials">
        <h3>Study materials</h3>
        <p>Supported: PDF, Word, text, Markdown, CSV, PNG, and JPEG up to {EXAM_UPLOAD_MAX_BYTES / 1024 / 1024} MB. Only metadata is saved here; treat every file as untrusted and scan it before opening.</p>
        <div className="exam-material-controls">
          <label>Material type<select value={materialKind} onChange={(event) => setMaterialKind(event.target.value)}>{EXAM_MATERIAL_KINDS.map((kind) => <option key={kind}>{kind}</option>)}</select></label>
          <label className="exam-check-label"><input type="checkbox" checked={ownershipConfirmed} onChange={(event) => setOwnershipConfirmed(event.target.checked)} /> I own this material or have permission to use it</label>
          <label className="exam-file-action"><FileText className="h-4 w-4" aria-hidden /> Add a local file<input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.md,.csv,.png,.jpg,.jpeg" onChange={(event) => addFile(event.target.files?.[0])} /></label>
          <div className="exam-link-row"><label htmlFor="exam-material-link">Material link</label><div><input id="exam-material-link" type="url" value={linkValue} onChange={(event) => setLinkValue(event.target.value)} placeholder="https://…" /><button type="button" onClick={addLink}><Link2 className="h-4 w-4" aria-hidden /> Add link</button></div></div>
        </div>
        {draft.materials.length ? <ul className="exam-material-list">{draft.materials.map((item) => <li key={item.id}><div><strong>{item.kind}: {item.name}</strong><span>{item.source === 'file' ? `${item.extension?.toUpperCase()} · ${Math.ceil((item.size ?? 0) / 1024)} KB · local metadata` : item.url}</span></div><button type="button" aria-label={`Remove ${item.name}`} onClick={() => update('materials', draft.materials.filter((candidate) => candidate.id !== item.id))}><Trash2 className="h-4 w-4" aria-hidden /></button></li>)}</ul> : <p className="exam-empty-copy">No materials added. This is optional.</p>}
      </div>
      <button type="button" className="exam-prep-action exam-review-button" onClick={reviewSetup}>Review setup <Check className="h-4 w-4" aria-hidden /></button>
    </>}

    {step === 'review' && <div className="exam-setup-review">
      <h3>Review before saving</h3>
      <dl>
        <div><dt>Assessment</dt><dd>{draft.assessmentType} · {draft.programme}{draft.courseLevel ? ` · ${draft.courseLevel}` : ''}</dd></div>
        <div><dt>Target</dt><dd>{draft.subject}{draft.paper ? ` · ${draft.paper}` : ''} · {draft.date}</dd></div>
        <div><dt>Conditions</dt><dd>{draft.durationMinutes} minutes · {draft.totalMarks} marks · {draft.calculatorRule}</dd></div>
        <div><dt>Topics</dt><dd>{splitList(draft.topics).join(', ') || 'Not provided'}</dd></div>
        <div><dt>Criteria and command terms</dt><dd>{[draft.criteria, draft.commandTerms].filter(Boolean).join(' · ') || 'Not provided'}</dd></div>
        <div><dt>Materials</dt><dd>{draft.materials.length ? `${draft.materials.length} permitted learner-supplied item(s)` : 'None added'}</dd></div>
        <div><dt>eAssessment</dt><dd>{draft.eAssessment ? (draft.officialFormat || 'Format still needs confirmation') : 'No'}</dd></div>
      </dl>
      <p className="exam-boundary-copy">VertexED has not verified the official format, marks, rules, rights, or syllabus. Check this summary against teacher or official programme guidance.</p>
      <div className="exam-review-actions"><button type="button" className="exam-secondary-action" onClick={() => setStep('edit')}><Pencil className="h-4 w-4" aria-hidden /> Keep editing</button><button type="button" className="exam-prep-action" onClick={saveSetup}><Check className="h-4 w-4" aria-hidden /> Save setup</button></div>
    </div>}

    {step === 'saved' && <div className="exam-saved-summary" role="status"><Check className="h-5 w-5" aria-hidden /><div><strong>{draft.assessmentType} setup saved for {subject}</strong><p>{draft.date} · {draft.durationMinutes} minutes · {draft.totalMarks} marks{draft.paper ? ` · ${draft.paper}` : ''}</p></div></div>}

    {step === 'saved' && <div className="exam-result-entry">
      <div className="exam-prep-section-head"><div><p className="exam-prep-kicker"><BarChart3 className="h-4 w-4" aria-hidden /> Past-paper analytics</p><h3>Human-confirmed results only</h3></div></div>
      <p>Enter results only after checking the score against the marked paper, teacher feedback, or another human record. Learner, reference, synthetic, and unavailable data remain separate.</p>
      <div className="exam-result-grid">
        <label>Score<input type="number" min="0" value={resultDraft.score} onChange={(event) => setResultDraft({ ...resultDraft, score: event.target.value })} /></label>
        <label>Maximum marks<input type="number" min="1" value={resultDraft.maxScore} onChange={(event) => setResultDraft({ ...resultDraft, maxScore: event.target.value })} /></label>
        <label>Time used, minutes<input type="number" min="1" value={resultDraft.durationMinutes} onChange={(event) => setResultDraft({ ...resultDraft, durationMinutes: event.target.value })} /></label>
        <label>Question type<input value={resultDraft.questionType} onChange={(event) => setResultDraft({ ...resultDraft, questionType: event.target.value })} placeholder="Short answer, essay…" /></label>
        <label>Topic<input value={resultDraft.topic} onChange={(event) => setResultDraft({ ...resultDraft, topic: event.target.value })} /></label>
        <label>Command term<input value={resultDraft.commandTerm} onChange={(event) => setResultDraft({ ...resultDraft, commandTerm: event.target.value })} /></label>
        <label>Confidence<select value={resultDraft.confidence} onChange={(event) => setResultDraft({ ...resultDraft, confidence: event.target.value })}><option value="">Not recorded</option><option>Low</option><option>Medium</option><option>High</option></select></label>
        <label>Confirmed against<select value={resultDraft.confirmationSource} onChange={(event) => setResultDraft({ ...resultDraft, confirmationSource: event.target.value as 'learner' | 'teacher' })}><option value="learner">Learner-checked paper</option><option value="teacher">Teacher-confirmed result</option></select></label>
        <label className="exam-check-label exam-form-wide"><input type="checkbox" checked={resultDraft.humanConfirmed} onChange={(event) => setResultDraft({ ...resultDraft, humanConfirmed: event.target.checked })} /> I checked these marks against a human-created record</label>
      </div>
      <button type="button" className="exam-secondary-action" onClick={addResult}><Plus className="h-4 w-4" aria-hidden /> Add confirmed result</button>

      <div className="exam-analytics-grid">
        <article><h4>Comparable average</h4>{analytics.averagePercent === null ? <p className="exam-empty-copy">At least two human-confirmed results with this assessment, paper, and maximum mark are required.</p> : <><strong className="exam-average">{analytics.averagePercent.toFixed(1)}%</strong><p>Across {analytics.confirmed.length} comparable learner results.</p></>}</article>
        <article><h4>Question types</h4><CountList values={analytics.questionTypes} empty="No comparable question-type records." /></article>
        <article><h4>Topic frequency</h4><CountList values={analytics.topics} empty="No comparable topic records." /></article>
        <article><h4>Command terms</h4><CountList values={analytics.commandTerms} empty="No comparable command-term records." /></article>
        <article><h4>Timing</h4><p>{analytics.averageMinutes === null ? 'No comparable timing records.' : `${analytics.averageMinutes.toFixed(0)} minutes average across timed confirmed results.`}</p></article>
        <article><h4>Cohort and reference data</h4><p>Unavailable. VertexED does not substitute synthetic examples or other learners&apos; results.</p></article>
      </div>
      <p className="exam-boundary-copy"><strong>No score prediction is shown.</strong> A validated method, a minimum evidence rule, relevant grade boundaries, uncertainty intervals, and external review do not yet exist. The average above describes recorded comparable attempts; it is not a predicted grade.</p>

      <div className="exam-technique-grid">
        <article><h4>Reading and review</h4><ul><li>Identify source, purpose, audience, and the evidence each claim uses.</li><li>Annotate command terms before answering.</li><li>Separate what the passage states from your inference.</li></ul>{draft.readingSource && <p><strong>Your source focus:</strong> {draft.readingSource}</p>}</article>
        <article><h4>Assessment technique</h4><ul><li>Budget roughly {(draft.durationMinutes / Math.max(1, draft.totalMarks)).toFixed(1)} minutes per mark, then reserve checking time.</li><li>Use the exact command term and make each paragraph earn a mark-scheme point.</li><li>Confirm calculator and material rules before exam day.</li></ul></article>
      </div>
    </div>}
  </section>;
}
