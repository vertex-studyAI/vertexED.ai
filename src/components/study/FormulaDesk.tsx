import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FORMULA_REFERENCE, FORMULA_SUBJECTS, type FormulaReference } from '@/content/formulaReference';
import { checkReferenceAnswer } from '@/lib/referencePractice';
import { searchResources } from '@/lib/resourceSearch';
import { useSearchParamDraft } from '@/hooks/useSearchParamDraft';
import '@/styles/formula-desk.css';

type Attempt = { answer: string; working: string; result?: ReturnType<typeof checkReferenceAnswer>; revealed?: boolean };
const EMPTY_ATTEMPT: Attempt = { answer: '', working: '' };

function WorkingSteps({ steps }: { steps: string[] }) {
  return <ol className="formula-steps">{steps.map((step, index) => <li key={index}>{step}</li>)}</ol>;
}

function PracticeQuestion({ entry, attempt, onChange }: {
  entry: FormulaReference; attempt: Attempt; onChange: (value: Attempt) => void;
}) {
  const { practice } = entry;
  return (
    <div className="formula-practice">
      <p className="formula-eyebrow">Original practice · numerical answer check</p>
      <h4>{practice.prompt}</h4>
      <p className="formula-note">Work it out before opening the hint. Your working stays in this page until you leave or reload.</p>
      <form onSubmit={(event) => {
        event.preventDefault();
        onChange({ ...attempt, result: checkReferenceAnswer(attempt.answer, practice.answer, practice.tolerance) });
      }}>
        <label htmlFor={`working-${entry.id}`}>Your working <span>(optional)</span></label>
        <textarea id={`working-${entry.id}`} value={attempt.working} rows={3} maxLength={5000}
          onChange={(event) => onChange({ ...attempt, working: event.target.value })} />
        <label htmlFor={`answer-${entry.id}`}>Your answer ({practice.unit})</label>
        <div className="formula-answer-row">
          <input id={`answer-${entry.id}`} type="text" autoComplete="off" maxLength={100}
            aria-describedby={`answer-help-${entry.id}`} aria-invalid={attempt.result === 'invalid' || undefined}
            value={attempt.answer} onChange={(event) => onChange({ ...attempt, answer: event.target.value, result: undefined })} />
          <button className="formula-primary" type="submit">Check answer</button>
        </div>
        <p id={`answer-help-${entry.id}`} className="formula-note">Enter a number, fraction or scientific notation (0.5, 1/2 or 5e-1). Use the unit above; omit unit symbols and commas.</p>
      </form>
      <div className="formula-feedback" role="status">
        {attempt.result === 'invalid' && <p>Enter a finite number or fraction with a non-zero denominator, without units.</p>}
        {attempt.result === 'retry' && <p>That value does not match yet. Check the units and substitution, or open the hint and try again.</p>}
        {attempt.result === 'correct' && <p><strong>That numerical value matches.</strong> Compare your reasoning with the worked solution. This check does not assess method or significant figures.</p>}
      </div>
      <details className="formula-disclosure"><summary>Show a hint</summary><p>{practice.hint}</p></details>
      <details className="formula-disclosure" open={Boolean(attempt.revealed)}
        onToggle={(event) => {
          const revealed = event.currentTarget.open;
          if (revealed !== Boolean(attempt.revealed)) onChange({ ...attempt, revealed });
        }}>
        <summary>Worked solution</summary><WorkingSteps steps={practice.solution} />
      </details>
      {attempt.revealed && <p className="formula-note">Solution opened. Try a fresh attempt later without the worked steps.</p>}
    </div>
  );
}

export default function FormulaDesk() {
  const [params, setParams] = useSearchParams();
  const requested = FORMULA_REFERENCE.find((entry) => entry.id === params.get('formula'));
  const subject = FORMULA_SUBJECTS.some(({ id }) => id === params.get('subject'))
    ? params.get('subject')! : requested?.subject ?? 'math';
  const [query, setQueryDraft] = useSearchParamDraft(params.get('fq') ?? '');
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [mode, setMode] = useState('reference');
  const practiceTab = useRef<HTMLButtonElement>(null);
  const visible = useMemo(() => searchResources(
    FORMULA_REFERENCE.filter((entry) => query.trim() || entry.subject === subject), query,
  ), [query, subject]);
  const selected = visible.find((entry) => entry.id === requested?.id) ?? visible[0];
  const currentIndex = selected ? visible.indexOf(selected) : -1;
  const checkedCount = Object.values(attempts).filter((attempt) => attempt.result === 'correct').length;

  function updateParams(values: Record<string, string | null>, replace = false) {
    if ('fq' in values) setQueryDraft(values.fq ?? '');
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      for (const [key, value] of Object.entries(values)) {
        if (value) next.set(key, value); else next.delete(key);
      }
      return next;
    }, { replace, preventScrollReset: true });
  }

  if (FORMULA_REFERENCE.length === 0) return (
    <section className="formula-desk" aria-labelledby="formula-desk-title">
      <header className="formula-header"><div>
        <h2 id="formula-desk-title">Formula references are awaiting subject review</h2>
        <p role="status">These references and practice questions are not available yet. Use your teacher’s approved course materials while review is in progress.</p>
      </div><BookOpen aria-hidden="true" /></header>
    </section>
  );

  return (
    <section className="formula-desk" aria-labelledby="formula-desk-title">
      <header className="formula-header">
        <div><p className="formula-eyebrow">Reference → Attempt → Review</p>
          <h2 id="formula-desk-title">Know when. Know why. Then try.</h2>
          <p>{FORMULA_REFERENCE.length} references with assumptions, worked examples and original questions.</p>
        </div>
        <BookOpen aria-hidden="true" />
      </header>
      <div className="formula-filters">
        <div><label htmlFor="formula-subject">Subject</label>
          <select id="formula-subject" value={subject} onChange={(event) => updateParams({ subject: event.target.value, formula: null, fq: null })}>
            {FORMULA_SUBJECTS.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
          </select>
        </div>
        <label className="formula-search">Search all subjects
          <span><Search aria-hidden="true" /><input type="search" value={query} placeholder="Try energy, moles or real GDP"
            onChange={(event) => updateParams({ fq: event.target.value || null }, true)} /></span>
        </label>
      </div>
      <p className="formula-result-count" role="status">{visible.length} {query.trim() ? 'search results across all subjects' : 'references in this subject'}
        {query && <button type="button" onClick={() => updateParams({ fq: null })}>Clear search</button>}
      </p>
      {selected ? <div className="formula-layout">
        <nav className="formula-index" aria-label="Choose a formula">
          {visible.map((entry, index) => <button key={entry.id} type="button" aria-pressed={entry.id === selected.id}
            onClick={() => updateParams({ formula: entry.id, subject: entry.subject })}>
            <span>{String(index + 1).padStart(2, '0')}</span><strong>{entry.title}</strong>
          </button>)}
        </nav>
        <article className="formula-paper">
          <p className="formula-eyebrow">{FORMULA_SUBJECTS.find(({ id }) => id === selected.subject)?.label} · {currentIndex + 1} of {visible.length}</p>
          <h3 aria-live="polite">{selected.title}</h3>
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList aria-label="Reference or practice" className="formula-mode">
              <TabsTrigger value="reference">Read the reference</TabsTrigger>
              <TabsTrigger ref={practiceTab} value="practice">Try a question</TabsTrigger>
            </TabsList>
            <TabsContent value="reference" key={`reference-${selected.id}`}>
              <p className="formula-expression">{selected.expression}</p>
              <p>{selected.description}</p>
              <h4>When it applies</h4><p>{selected.conditions}</p>
              <h4>Worked example</h4><WorkingSteps steps={selected.example} />
              <aside className="formula-mistake"><h4>Watch for this</h4><p>{selected.mistake}</p></aside>
              {selected.source && <a className="formula-source" href={selected.source.url} target="_blank" rel="noreferrer">Further reading: {selected.source.label} (opens in a new tab)</a>}
              <button className="formula-primary" type="button" onClick={() => {
                setMode('practice');
                practiceTab.current?.focus();
              }}>Try it without the worked example <ArrowRight aria-hidden="true" /></button>
            </TabsContent>
            <TabsContent value="practice">
              <PracticeQuestion key={selected.id} entry={selected} attempt={attempts[selected.id] ?? EMPTY_ATTEMPT}
                onChange={(attempt) => setAttempts((previous) => ({ ...previous, [selected.id]: attempt }))} />
            </TabsContent>
          </Tabs>
          <div className="formula-navigation">
            <button type="button" disabled={currentIndex <= 0}
              onClick={() => updateParams({ formula: visible[currentIndex - 1].id, subject: visible[currentIndex - 1].subject })}>Previous reference</button>
            <button type="button" disabled={currentIndex >= visible.length - 1}
              onClick={() => updateParams({ formula: visible[currentIndex + 1].id, subject: visible[currentIndex + 1].subject })}>Next reference <ArrowRight aria-hidden="true" /></button>
          </div>
        </article>
      </div> : <div className="formula-empty"><h3>No reference matches that search.</h3><p>Try a quantity such as current, concentration or growth.</p><button type="button" onClick={() => updateParams({ fq: null })}>Show this subject</button></div>}
      <footer className="formula-footer">
        <p>{checkedCount} of {FORMULA_REFERENCE.length} numerical answers currently match in this visit. This includes answers checked after opening a solution.</p>
        <p>Temporary practice, not saved progress. These are general references, not an official formula sheet or exam questions. Check permitted notation and constants against your course.</p>
      </footer>
    </section>
  );
}
