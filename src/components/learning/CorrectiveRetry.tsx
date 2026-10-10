import { useState } from 'react';
import RichMarkdown from '@/components/RichMarkdown';
import { classifyPracticeAnswer } from '@/lib/adaptivePractice.mjs';
import { LEARNING_QUESTIONS } from '@/lib/learningModel.mjs';
import { saveLearningRecord } from '@/lib/learningStore';

export default function CorrectiveRetry({ question, onSaved }: { question: typeof LEARNING_QUESTIONS[number]; onSaved: () => void }) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<ReturnType<typeof classifyPracticeAnswer> | null>(null);
  const [error, setError] = useState('');
  return <details><summary>Try again with this feedback</summary><p>The original attempt stays in your history and session score. This correction is saved separately as assisted practice.</p>
    {question.type === 'multiple-choice' ? <fieldset><legend>Corrected answer</legend>{question.choices?.map((choice, i) => <label key={choice} className="learning-choice"><input type="radio" name={'retry-' + question.id} checked={answer === String(i)} onChange={() => { setAnswer(String(i)); setResult(null); }} /><RichMarkdown>{choice}</RichMarkdown></label>)}</fieldset> : <label>Corrected answer<input value={answer} maxLength={200} onChange={e => { setAnswer(e.target.value); setResult(null); }} /></label>}
    <button disabled={!answer.trim() || Boolean(result)} onClick={() => { try { const checked = classifyPracticeAnswer(question, answer); saveLearningRecord('practice_attempt', { id: 'attempt:' + crypto.randomUUID(), questionId: question.id, answer, confidence: null, hinted: true, seconds: 0, at: new Date().toISOString(), mode: 'targeted' }); setResult(checked); setError(''); onSaved(); } catch (e) { setError((e as Error).message); } }}>Check correction</button>
    {error && <p role="alert">{error}</p>}{result && <p role="status">{result.correct ? 'You corrected the answer with feedback. Return later without help to check retention.' : result.evidence + ' ' + result.nextStep}</p>}
  </details>;
}
