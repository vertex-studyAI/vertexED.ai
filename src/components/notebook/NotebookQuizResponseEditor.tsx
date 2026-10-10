import { useState } from 'react';
import type { NotebookQuizResponse } from '@/lib/notebook';

type Props = {
  questionIndex: number;
  outputId: string;
  response?: NotebookQuizResponse;
  onSave: (patch: Pick<NotebookQuizResponse, 'answer' | 'confidence'>) => void;
  onSaveState: (failed: boolean) => void;
};

/** Keep unsaved text visible when browser storage fails; never claim it is saved. */
export default function NotebookQuizResponseEditor({ questionIndex, outputId, response, onSave, onSaveState }: Props) {
  const [answer, setAnswer] = useState(response?.answer ?? '');
  const [confidence, setConfidence] = useState(response?.confidence);
  const [error, setError] = useState<string | null>(null);
  const answerId = `quiz-response-${outputId}-${questionIndex}`;
  const statusId = `${answerId}-status`;

  const save = (nextAnswer: string, nextConfidence: NotebookQuizResponse['confidence']) => {
    try {
      onSave({ answer: nextAnswer, confidence: nextConfidence });
      setError(null);
      onSaveState(false);
    } catch {
      setError('Your latest changes could not be saved. Keep this page open, copy your answer, or retry saving.');
      onSaveState(true);
    }
  };

  return (
    <div className="space-y-3 my-4">
      <label htmlFor={answerId} className="block text-sm font-medium">Your answer to question {questionIndex + 1}</label>
      <textarea
        id={answerId}
        className="form-textarea w-full min-h-28 text-base sm:text-sm"
        value={answer}
        readOnly={Boolean(response?.revealedAt)}
        maxLength={12000}
        aria-describedby={statusId}
        onChange={event => { setAnswer(event.target.value); save(event.target.value, confidence); }}
        placeholder="Write your reasoning, or the option you chose."
      />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor={`${answerId}-confidence`}>Confidence for question {questionIndex + 1}</label>
        <select
          id={`${answerId}-confidence`}
          className="form-control-select min-h-11 text-base sm:text-sm"
          value={confidence ?? ''}
          disabled={Boolean(response?.revealedAt)}
          onChange={event => {
            const next = event.target.value ? Number(event.target.value) as NotebookQuizResponse['confidence'] : undefined;
            setConfidence(next);
            save(answer, next);
          }}
        >
          <option value="">Optional</option>
          {[20, 40, 60, 80, 100].map(value => <option key={value} value={value}>{value}%</option>)}
        </select>
      </div>
      <p id={statusId} role="status" className={`text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
        {error ?? (response?.revealedAt ? 'Original response kept. The answer has been revealed.' : response ? 'Answer saved on this device. Cloud status appears above.' : 'Answers save as you type.')}
      </p>
      {error && <button type="button" className="btn-glass text-xs min-h-11" onClick={() => save(answer, confidence)}>Retry saving answer</button>}
    </div>
  );
}
