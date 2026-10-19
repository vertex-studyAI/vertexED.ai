import { useEffect, useRef, useState } from 'react';
import { CURRICULUM_FIELDS, STUDY_CURRICULA, runNotebookStudySet, validCurriculumPath, type CurriculumPath } from '../../../contracts/notebookStudySet.js';
import { buildGroundingPayload, getNotebook, NOTEBOOK_OUTPUT_META, saveNotebookCurriculum, saveOutput, type NotebookOutputKind, type StudyNotebook } from '@/lib/notebook';
import { generateNotebookOutput } from '@/lib/notebookApi';
import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';

const labels: Record<keyof CurriculumPath, string> = {
  curriculum: 'Curriculum', board: 'Board or institution', syllabusVersion: 'Syllabus version or exam year',
  subject: 'Subject', unit: 'Unit (optional)', topic: 'Topic', subtopic: 'Subtopic (optional)',
};

export default function NotebookStudySet({ notebook, owner, disabled, refresh, onSelect, onBusy }: {
  notebook: StudyNotebook; owner: string; disabled: boolean; refresh: () => void;
  onSelect: (kind: NotebookOutputKind) => void; onBusy: (busy: boolean) => void;
}) {
  const [course, setCourse] = useState<CurriculumPath>(() => notebook.curriculum ?? {
    curriculum: 'IB_MYP', board: '', syllabusVersion: '', subject: notebook.subject, unit: '', topic: '', subtopic: '',
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const running = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; running.current = false; }; }, []);

  const saveCourse = () => {
    if (disabled || getUserContentStorageScope() !== owner) return;
    if (!validCurriculumPath(course)) { setError('Enter a board, syllabus version, subject and topic.'); return; }
    try { saveNotebookCurriculum(notebook.id, course); refresh(); setError(''); setMessage('Course details saved. Check them against your specification.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Course details could not be saved.'); }
  };

  const start = async () => {
    if (running.current || disabled) return;
    if (!validCurriculumPath(course)) { setError('Enter a board, syllabus version, subject and topic.'); return; }
    const sources = buildGroundingPayload(notebook);
    if (!sources.length) { setError('Add and select a source before creating a study set.'); return; }
    running.current = true;
    setBusy(true); onBusy(true); setError('');
    // Freeze the request. Changes to selected sources/course stop subsequent work.
    const signature = JSON.stringify({ sources, curriculum: course, title: notebook.title });
    const isCurrent = () => {
      if (!mounted.current || !running.current || getUserContentStorageScope() !== owner) return false;
      const current = getNotebook(notebook.id);
      return Boolean(current && JSON.stringify({ sources: buildGroundingPayload(current), curriculum: current.curriculum, title: current.title }) === signature);
    };
    try {
      saveNotebookCurriculum(notebook.id, course); refresh();
      const result = await runNotebookStudySet({
        request: { sources, curriculum: course, notebookTitle: notebook.title },
        isCurrent,
        findSaved: key => getNotebook(notebook.id)?.outputs.find(output => output.generation?.requestKey === key),
        generate: generateNotebookOutput,
        save: result => {
          const saved = saveOutput(notebook.id, { kind: result.mode, title: result.title, content: result.content,
            generatedAt: result.generatedAt, generation: result.generation, flashcards: result.flashcards, quiz: result.quiz,
            sourceIds: result.sources?.map(source => source.id) });
          if (!saved) throw new Error('The notebook is no longer available.');
          refresh();
        },
        onStep: (kind, status) => {
          if (!mounted.current) return;
          onSelect(kind);
          setMessage(`${NOTEBOOK_OUTPUT_META[kind].label}: ${status === 'reused' ? 'using the saved version' : status === 'saved' ? 'saved on this device' : 'generating'}.`);
        },
      });
      if (mounted.current) setMessage(result.status === 'complete'
        ? 'Study set ready. Open each resource below. Check the save status for account sync.'
        : 'Study set paused. Saved resources will be reused when you continue with the same sources and course.');
    } catch (cause) {
      if (mounted.current) { setMessage('Study set stopped. Completed resources are preserved.'); setError(cause instanceof Error ? cause.message : 'Generation failed. Try again when ready.'); }
    } finally {
      running.current = false;
      onBusy(false);
      if (mounted.current) setBusy(false);
    }
  };

  return <section className="border-b border-border p-4 space-y-3" aria-labelledby="study-set-title">
    <h2 id="study-set-title" className="text-lg font-semibold">Create a topic study set</h2>
    <p className="text-sm text-muted-foreground">Topic notes, flashcards, a practice quiz and a revision guide from your selected sources. Each new resource uses your AI allowance. Saved matching resources are reused.</p>
    <details>
      <summary className="cursor-pointer min-h-11 text-sm font-medium">Course and syllabus details</summary>
      <fieldset disabled={busy || disabled} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        <legend className="sr-only">Course context</legend>
        {CURRICULUM_FIELDS.map(field => <label key={field} className="text-sm space-y-1">
          <span>{labels[field]}</span>
          {field === 'curriculum' ? <select value={course.curriculum} onChange={event => setCourse({ ...course, curriculum: event.target.value })} className="form-control-select w-full min-h-11 text-base">
            {STUDY_CURRICULA.map(value => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
          </select> : <input value={course[field]} maxLength={160} onChange={event => setCourse({ ...course, [field]: event.target.value })} className="form-control-input w-full min-h-11 text-base" />}
        </label>)}
        <button type="button" onClick={saveCourse} className="btn-glass min-h-11 text-sm">Save course details</button>
      </fieldset>
    </details>
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={busy || disabled} onClick={() => void start()} className="btn-solid min-h-11 text-sm">Create or continue study set</button>
      {busy && <button type="button" className="btn-glass min-h-11 text-sm" onClick={() => { running.current = false; setMessage('Pausing. The current request may still use your AI allowance.'); }}>Pause study set</button>}
    </div>
    <p className="text-sm text-muted-foreground">Keep this page open during generation. Generated material and course alignment need checking against your sources.</p>
    <p role="status" className="text-sm">{message}</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}
