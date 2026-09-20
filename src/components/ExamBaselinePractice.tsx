import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EXAM_DRILLS } from '@/content/examPractice';
import {
  baselineNextAction,
  createBaselineAttempt,
  normalizeBaselineAttempt,
  parseBaselineTopics,
  selectBaselineDrills,
  summarizeBaselineAttempt,
} from '@/lib/examBaselineCore.mjs';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

type AttemptState = 'not-attempted' | 'attempted' | 'unsure' | 'skipped';
type SelfCheck = 'needs-review' | 'some-evidence' | 'demonstrated-here';
type BaselineResponse = {
  answer: string;
  attemptState: AttemptState;
  selfCheck: SelfCheck | null;
  revealed: boolean;
};
type BaselineAttempt = {
  version: 1;
  subject: string;
  programme: string;
  drillIds: string[];
  responses: Record<string, BaselineResponse>;
  completedAt: string | null;
};

function readSavedTopics(storageKey: string, subject: string) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return parseBaselineTopics(parsed?.setups?.[subject]?.topics ?? '');
  } catch {
    return [];
  }
}

function sameIds(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function selfCheckLabel(value: SelfCheck | null) {
  if (value === 'needs-review') return 'Needs review';
  if (value === 'some-evidence') return 'Some evidence';
  if (value === 'demonstrated-here') return 'Demonstrated here';
  return 'Not self-checked';
}

export default function ExamBaselinePractice({ subject, programme }: { subject: string; programme: string }) {
  const { user, loading } = useAuth();
  const scopedKeys = userContentStorageKeys(loading ? undefined : user?.id ?? null);
  const setupKey = scopedKeys.examPrepSetup;
  const baselineKey = `${scopedKeys.examBaseline}:${encodeURIComponent(subject)}`;
  const [setupRevision, setSetupRevision] = useState(0);

  useEffect(() => {
    const refresh = (event: Event) => {
      const changedKey = event instanceof StorageEvent ? event.key : (event as CustomEvent<string>).detail;
      if (!changedKey || changedKey === setupKey) setSetupRevision((value) => value + 1);
    };
    window.addEventListener('storage', refresh);
    window.addEventListener('vertexed:storage-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('vertexed:storage-changed', refresh);
    };
  }, [setupKey]);

  const topics = useMemo(() => readSavedTopics(setupKey, subject), [setupKey, setupRevision, subject]);
  const drills = useMemo(() => selectBaselineDrills({
    drills: EXAM_DRILLS,
    programme,
    subject,
    topics,
    limit: 3,
  }), [programme, subject, topics]);
  const selectedIds = useMemo(() => drills.map((drill) => drill.id), [drills]);
  const [rawAttempt, setRawAttempt] = useLocalStorage<BaselineAttempt | null>(baselineKey, null);

  const normalized = normalizeBaselineAttempt(rawAttempt, { subject, programme }) as BaselineAttempt | null;
  const attempt = normalized && sameIds(normalized.drillIds, selectedIds)
    ? normalized
    : createBaselineAttempt(selectedIds, { subject, programme }) as BaselineAttempt;

  const persist = (next: BaselineAttempt) => setRawAttempt(next);
  const updateResponse = (id: string, patch: Partial<BaselineResponse>) => {
    const current = attempt.responses[id];
    if (!current) return;
    const nextResponse = { ...current, ...patch };
    if (nextResponse.attemptState !== 'attempted') nextResponse.selfCheck = null;
    const responses = { ...attempt.responses, [id]: nextResponse };
    const complete = attempt.drillIds.every((drillId) => {
      const response = responses[drillId];
      return response?.attemptState !== 'not-attempted'
        && (response?.attemptState !== 'attempted' || Boolean(response.selfCheck));
    });
    persist({ ...attempt, responses, completedAt: complete ? new Date().toISOString() : null });
  };

  if (drills.length < 3) {
    return <section id="exam-baseline" className="exam-prep-panel scroll-mt-24" aria-labelledby="exam-baseline-title">
      <p className="exam-prep-kicker"><ShieldCheck className="h-4 w-4" aria-hidden /> Optional baseline practice</p>
      <h2 id="exam-baseline-title">A bounded baseline is not available for {subject} yet</h2>
      <p className="exam-prep-supporting-copy">VertexED will not substitute unrelated questions or silently send you to a generated paper. Use focused practice until at least three original editorial questions are available for this programme and subject.</p>
      <a className="exam-prep-action mt-4 inline-flex" href="#exam-practice-lab">Open focused practice <ArrowRight className="h-4 w-4" aria-hidden /></a>
    </section>;
  }

  const summary = summarizeBaselineAttempt(attempt);
  const nextAction = baselineNextAction(attempt);

  return <section id="exam-baseline" className="exam-prep-panel scroll-mt-24" aria-labelledby="exam-baseline-title">
    <div className="exam-prep-section-head">
      <div>
        <p className="exam-prep-kicker"><ShieldCheck className="h-4 w-4" aria-hidden /> Optional baseline practice</p>
        <h2 id="exam-baseline-title">Three original questions, then a bounded next step</h2>
      </div>
      <button type="button" className="exam-secondary-action" onClick={() => persist(createBaselineAttempt(selectedIds, { subject, programme }) as BaselineAttempt)}>
        <RotateCcw className="h-4 w-4" aria-hidden /> Restart baseline
      </button>
    </div>
    <p className="exam-prep-supporting-copy">This is editorial practice, not a validated diagnostic assessment, predicted grade, or mastery score. Your original response is retained separately from the worked reasoning. “Unsure” and “skipped” remain unknown evidence rather than being relabelled as weakness.</p>
    <p className="mt-2 text-sm text-muted-foreground">{programme} · {subject}{topics.length ? ` · setup topics considered: ${topics.join(', ')}` : ' · no saved setup topics used'}</p>

    <ol className="mt-6 space-y-5">
      {drills.map((drill, index) => {
        const response = attempt.responses[drill.id];
        return <li key={drill.id} className="rounded-xl border border-border bg-background p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Question {index + 1} of {drills.length} · {drill.topic}</span>
            <span>Original editorial practice · {drill.difficulty} · about {drill.minutes} min</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold">{drill.focus}</h3>
          <p className="mt-3 leading-relaxed">{drill.prompt}</p>

          <label className="mt-4 block text-sm font-medium" htmlFor={`baseline-answer-${drill.id}`}>Your original response</label>
          <textarea
            id={`baseline-answer-${drill.id}`}
            className="mt-2 min-h-28 w-full rounded-lg border border-border bg-background p-3"
            maxLength={6000}
            value={response.answer}
            onChange={(event) => updateResponse(drill.id, {
              answer: event.target.value,
              attemptState: response.attemptState === 'not-attempted' && event.target.value.trim() ? 'attempted' : response.attemptState,
            })}
            placeholder="Write the answer or reasoning you can produce before viewing the worked reasoning."
          />

          <fieldset className="mt-4">
            <legend className="text-sm font-medium">Attempt status</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {([
                ['attempted', 'Attempted'],
                ['unsure', 'Unsure / not enough evidence'],
                ['skipped', 'Skipped / not covered'],
              ] as const).map(([value, label]) => <label key={value} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <input type="radio" name={`baseline-state-${drill.id}`} checked={response.attemptState === value} onChange={() => updateResponse(drill.id, { attemptState: value })} />
                {label}
              </label>)}
            </div>
          </fieldset>

          <button type="button" className="mt-4 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground" aria-expanded={response.revealed} onClick={() => updateResponse(drill.id, { revealed: !response.revealed })}>
            {response.revealed ? 'Hide worked reasoning' : 'Compare with worked reasoning'}
          </button>

          {response.revealed && <div className="mt-4 border-l-2 border-primary pl-4">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Editorial worked reasoning · not AI-generated feedback</p>
            <p className="mt-2 leading-relaxed">{drill.solution}</p>
            <h4 className="mt-4 font-medium">Checks to compare against your own response</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{drill.checks.map((check) => <li key={check}>{check}</li>)}</ul>
            <p className="mt-4 text-sm"><strong>Transfer:</strong> {drill.transfer}</p>
            <a className="mt-3 inline-block text-sm text-primary underline" href={drill.source} target="_blank" rel="noreferrer">Reference used for this editorial item</a>

            {response.attemptState === 'attempted' && <fieldset className="mt-5">
              <legend className="text-sm font-medium">Evidence from this attempt</legend>
              <p className="mt-1 text-xs text-muted-foreground">Self-check only. This does not enter your human-confirmed assessment marks.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {([
                  ['needs-review', 'Needs review'],
                  ['some-evidence', 'Some evidence'],
                  ['demonstrated-here', 'Demonstrated here'],
                ] as const).map(([value, label]) => <label key={value} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <input type="radio" name={`baseline-check-${drill.id}`} checked={response.selfCheck === value} onChange={() => updateResponse(drill.id, { selfCheck: value })} />
                  {label}
                </label>)}
              </div>
            </fieldset>}
          </div>}

          <p className="mt-4 text-xs text-muted-foreground">Current item evidence: {response.attemptState === 'attempted' ? selfCheckLabel(response.selfCheck) : response.attemptState === 'unsure' ? 'Unknown / unsure' : response.attemptState === 'skipped' ? 'Unknown / skipped' : 'Not attempted'}</p>
        </li>;
      })}
    </ol>

    <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5" role="status" aria-live="polite">
      <p className="exam-prep-kicker">Bounded result</p>
      <h3 className="text-xl font-semibold">{summary.label}</h3>
      <p className="mt-2 text-sm">Attempted: {summary.attempted} · unsure: {summary.unsure} · skipped: {summary.skipped} · not attempted: {summary.notAttempted}</p>
      <p className="mt-2 text-sm text-muted-foreground">This summary is limited to these questions and your self-check. It is not a grade, mastery estimate, or diagnosis.</p>
      <p className="mt-4"><strong>Next action:</strong> {nextAction}</p>
      <a className="exam-prep-action mt-4 inline-flex" href="#exam-practice-lab">Open focused practice <ArrowRight className="h-4 w-4" aria-hidden /></a>
    </div>
  </section>;
}
