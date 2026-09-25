import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import ChatMarkdown from '@/components/chat/ChatMarkdown';
import NotebookTtsPlayer from '@/components/notebook/NotebookTtsPlayer';
import ConceptMap from '@/components/notebook/ConceptMap';
import NotebookQuizResponseEditor from '@/components/notebook/NotebookQuizResponseEditor';
import type { NotebookOutput, NotebookOutputKind, NotebookQuizResponse, NotebookSource } from '@/lib/notebook';
import { NOTEBOOK_OUTPUT_META } from '@/lib/notebook';
import { mergeFlashcardsIntoDeck } from '@/lib/srDeck';
import { toast } from '@/hooks/use-toast';

type Props = {
  output: NotebookOutput;
  notebookTitle: string;
  onAskQuestion?: (q: string) => void;
  sources?: NotebookSource[];
  onPreviewSource?: (sourceId: string, opener: HTMLButtonElement) => void;
  onQuizResponseChange?: (index: number, patch: Partial<Pick<NotebookQuizResponse, 'answer' | 'confidence' | 'revealedAt' | 'reflection'>>) => void;
  onReviewResponse?: (index: number) => void;
};

type QuizDisclosureState = {
  outputId: string;
  revealed: Set<number>;
};

export default function NotebookOutputPanel({ output, notebookTitle, onAskQuestion, sources = [], onPreviewSource, onQuizResponseChange, onReviewResponse }: Props) {
  const [failedSaves, setFailedSaves] = useState<Set<number>>(new Set());
  const [quizDisclosure, setQuizDisclosure] = useState<QuizDisclosureState>(() => ({
    outputId: output.id,
    revealed: new Set(),
  }));
  const revealedQuiz = quizDisclosure.outputId === output.id ? quizDisclosure.revealed : new Set<number>();
  const generatedRegionLabel = `Generated ${outputKindLabel(output.kind)}`;

  const toggleQuiz = (index: number) => {
    if (!revealedQuiz.has(index) && onQuizResponseChange) {
      try { onQuizResponseChange(index, { revealedAt: new Date().toISOString() }); }
      catch {
        toast({ title: 'Answer could not be saved', description: 'Keep this page open and try again. Your original work is still visible.', variant: 'destructive' });
        return;
      }
    }
    setQuizDisclosure((prev) => {
      const next = prev.outputId === output.id ? new Set(prev.revealed) : new Set<number>();
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return { outputId: output.id, revealed: next };
    });
  };

  const pushFlashcards = () => {
    if (!output.flashcards?.length) return;
    const added = mergeFlashcardsIntoDeck(output.flashcards, `nb-${notebookTitle.slice(0, 20)}`);
    toast({
      title: added > 0 ? `${added} cards added to SR deck` : 'Cards already in deck',
      description: added > 0 ? 'Review them in AI Notes study mode.' : undefined,
    });
  };

  const isAudio =
    output.isAudioScript ||
    output.kind === 'audio-script' ||
    output.kind === 'audio-brief' ||
    output.kind === 'audio-critique' ||
    output.kind === 'audio-debate';

  if (output.kind === 'mind-map') return <ConceptMap source={output.content} />;

  if (output.kind === 'quiz' && output.quiz?.length) {
    return (
      <section className="space-y-4" aria-label={generatedRegionLabel}>
        {onQuizResponseChange && (
          <div className="border-b border-border pb-4 space-y-2">
            <p className="text-sm">Try each question before revealing the answer. Your responses stay connected to this notebook.</p>
            <p className="text-xs text-muted-foreground">AI answers may be wrong. Self-checks and confidence do not update measured mastery. Use Review my working to compare with a teacher or trusted mark scheme.</p>
            <p className="text-xs font-medium" role="status">{output.quizResponses?.filter(response => response.answer.trim()).length ?? 0} of {output.quiz.length} questions answered</p>
          </div>
        )}
        {output.quiz.map((q, i) => {
          // Model-generated question ids are useful data, but they are not a safe
          // DOM identity boundary: duplicate ids would couple two disclosures and
          // whitespace/special characters can produce invalid aria relationships.
          // Use the rendered position within this output for local interaction and
          // bind the DOM ids to the internally-generated output identity instead.
          const show = revealedQuiz.has(i);
          const questionId = `notebook-quiz-${output.id}-question-${i}`;
          const answerId = `notebook-quiz-${output.id}-answer-${i}`;
          const response = output.quizResponses?.find(item => item.questionIndex === i);
          const referencedSources = sources.filter(source => (q.sourceIds ?? output.sourceIds ?? []).includes(source.id));
          return (
            <article
              key={`${q.id}-${i}`}
              className="notebook-quiz-card rounded-xl border border-border/60 p-4"
              aria-labelledby={questionId}
            >
              <p className="text-xs text-primary font-medium mb-1">
                Question {i + 1} · {q.marks} mark{q.marks === 1 ? '' : 's'}
              </p>
              <p id={questionId} className="text-sm font-medium text-foreground mb-2">
                {q.question}
              </p>
              {q.type === 'mcq' && q.options.length > 0 && (
                <ul className="text-sm text-muted-foreground space-y-1 mb-3 ml-1">
                  {q.options.map((opt, j) => (
                    <li key={j}>
                      {String.fromCharCode(65 + j)}) {opt}
                    </li>
                  ))}
                </ul>
              )}
              {referencedSources.length > 0 && onPreviewSource && (
                <div className="flex flex-wrap gap-2 text-xs" aria-label={`Sources for question ${i + 1}`}>
                  {referencedSources.map(source => <button key={source.id} type="button" className="text-primary underline underline-offset-4 min-h-11 text-left" onClick={event => onPreviewSource(source.id, event.currentTarget)}>Source: {source.title}</button>)}
                </div>
              )}
              {onQuizResponseChange && (
                <NotebookQuizResponseEditor
                  key={`${output.id}-${i}`}
                  questionIndex={i}
                  outputId={output.id}
                  response={response}
                  onSave={patch => onQuizResponseChange(i, patch)}
                  onSaveState={failed => setFailedSaves(previous => { const next = new Set(previous); if (failed) next.add(i); else next.delete(i); return next; })}
                />
              )}
              <button
                type="button"
                onClick={() => toggleQuiz(i)}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 min-h-11 disabled:opacity-50"
                disabled={failedSaves.has(i)}
                aria-expanded={show}
                aria-controls={answerId}
              >
                {show ? (
                  <ChevronDown className="h-3 w-3" aria-hidden />
                ) : (
                  <ChevronRight className="h-3 w-3" aria-hidden />
                )}
                {show ? 'Hide answer' : 'Reveal answer'}
              </button>
              {show && (
                <div id={answerId} className="mt-3 pt-3 border-t border-border/50 text-sm">
                  <p>
                    <span className="font-medium text-emerald-500">Answer:</span> {q.answer}
                  </p>
                  {q.explanation && (
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{q.explanation}</p>
                  )}
                  {onQuizResponseChange && (
                    <div className="mt-4 text-sm">
                      <label htmlFor={`${answerId}-reflection`}>Self-check for question {i + 1}</label>
                      <select id={`${answerId}-reflection`} className="form-control-select w-full mt-2 min-h-11 text-base sm:text-sm" value={response?.reflection ?? ''} onChange={event => {
                        try { onQuizResponseChange(i, { reflection: event.target.value as NotebookQuizResponse['reflection'] || undefined }); }
                        catch { toast({ title: 'Self-check could not be saved', description: 'Your answer is still saved. Try again.', variant: 'destructive' }); }
                      }}>
                        <option value="">Choose after comparing</option>
                        <option value="understood">I can explain this</option>
                        <option value="unsure">I am still unsure</option>
                        <option value="needs-review">I need to review this</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
              {response?.answer.trim() && onReviewResponse && <button type="button" className="btn-glass min-h-11 text-xs ml-2" disabled={failedSaves.has(i)} onClick={() => onReviewResponse(i)}>Review my working</button>}
            </article>
          );
        })}
      </section>
    );
  }

  if (output.kind === 'suggested-questions' && output.suggestedQuestions?.length) {
    const canAskQuestion = typeof onAskQuestion === 'function';
    return (
      <section className="space-y-2" aria-label={generatedRegionLabel}>
        <p className="text-xs text-muted-foreground mb-3">
          {canAskQuestion
            ? 'Tap a question to ask Apex with your sources attached.'
            : 'Suggested questions generated from your sources.'}
        </p>
        {output.suggestedQuestions.map((q, i) => (
          <button
            key={`${q}-${i}`}
            type="button"
            onClick={() => onAskQuestion?.(q)}
            disabled={!canAskQuestion}
            className="notebook-suggest-q w-full text-left text-sm px-4 py-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border/50 disabled:hover:bg-transparent"
          >
            {q}
          </button>
        ))}
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label={generatedRegionLabel}>
      {isAudio && <NotebookTtsPlayer script={output.content} />}
      {output.kind === 'flashcards' && output.flashcards && output.flashcards.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={pushFlashcards} className="btn-solid text-xs inline-flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" aria-hidden />
            Add {output.flashcards.length} to SR deck
          </button>
          <Link to="/notetaker?mode=study" className="btn-glass text-xs inline-flex items-center gap-1.5">
            Review now →
          </Link>
        </div>
      )}
      <ChatMarkdown className="notebook-output">{output.content}</ChatMarkdown>
    </section>
  );
}

export function outputKindLabel(kind: NotebookOutputKind): string {
  return NOTEBOOK_OUTPUT_META[kind]?.label ?? kind;
}
