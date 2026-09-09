import { useState } from 'react';
import { AlertTriangle, ThumbsDown, ThumbsUp } from 'lucide-react';

import {
  reportAiFeedback,
  type AiFeedbackRating,
  type AiFeedbackReason,
} from '@/lib/monitoring';

type Props = {
  capability: string;
};

const REASONS: Array<{ value: AiFeedbackReason; label: string }> = [
  { value: 'incorrect', label: 'Incorrect' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'irrelevant', label: 'Not relevant' },
  { value: 'unsafe', label: 'Unsafe' },
  { value: 'other', label: 'Other issue' },
];

export default function AiFeedbackControls({ capability }: Props) {
  const [rating, setRating] = useState<AiFeedbackRating | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (next: AiFeedbackRating, reason: AiFeedbackReason = 'other') => {
    setRating(next);
    setSubmitting(true);
    setError(false);
    const accepted = await reportAiFeedback(capability, next, reason);
    setSubmitting(false);
    setSubmitted(accepted);
    setError(!accepted);
  };

  if (submitted) {
    return <p className="text-xs text-emerald-600 dark:text-emerald-400" role="status">Thanks - feedback recorded.</p>;
  }

  return (
    <div className="space-y-2" aria-label="Rate this AI result">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Was this useful?</span>
        <button type="button" disabled={submitting} className="neu-button inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs disabled:opacity-60" onClick={() => void submit('helpful')}>
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Helpful
        </button>
        <button type="button" className="neu-button inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs" onClick={() => setRating('not_helpful')} aria-expanded={rating === 'not_helpful'}>
          <ThumbsDown className="h-3.5 w-3.5" aria-hidden /> Not helpful
        </button>
      </div>
      {rating === 'not_helpful' && (
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> What went wrong? No answer text is sent.
          </p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((reason) => (
              <button key={reason.value} type="button" disabled={submitting} className="rounded-full border border-border/70 px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-60" onClick={() => void submit(reason.value === 'incorrect' ? 'incorrect' : 'not_helpful', reason.value)}>
                {reason.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-amber-700 dark:text-amber-300" role="alert">Feedback was not stored. Please try again.</p>}
    </div>
  );
}
