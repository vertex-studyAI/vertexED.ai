import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import ChatMarkdown from '@/components/chat/ChatMarkdown';
import NotebookTtsPlayer from '@/components/notebook/NotebookTtsPlayer';
import type { NotebookOutput, NotebookOutputKind } from '@/lib/notebook';
import { NOTEBOOK_OUTPUT_META } from '@/lib/notebook';
import { mergeFlashcardsIntoDeck } from '@/lib/srDeck';
import { toast } from '@/hooks/use-toast';

type Props = {
  output: NotebookOutput;
  notebookTitle: string;
  onAskQuestion?: (q: string) => void;
};

type QuizDisclosureState = {
  outputId: string;
  revealed: Set<number>;
};

export default function NotebookOutputPanel({ output, notebookTitle, onAskQuestion }: Props) {
  const [quizDisclosure, setQuizDisclosure] = useState<QuizDisclosureState>(() => ({
    outputId: output.id,
    revealed: new Set(),
  }));
  const revealedQuiz = quizDisclosure.outputId === output.id ? quizDisclosure.revealed : new Set<number>();
  const generatedRegionLabel = `Generated ${outputKindLabel(output.kind)}`;

  const toggleQuiz = (index: number) => {
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

  if (output.kind === 'quiz' && output.quiz?.length) {
    return (
      <section className="space-y-4" aria-label={generatedRegionLabel}>
        {output.quiz.map((q, i) => {
          // Model-generated question ids are useful data, but they are not a safe
          // DOM identity boundary: duplicate ids would couple two disclosures and
          // whitespace/special characters can produce invalid aria relationships.
          // Use the rendered position within this output for local interaction and
          // bind the DOM ids to the internally-generated output identity instead.
          const show = revealedQuiz.has(i);
          const questionId = `notebook-quiz-${output.id}-question-${i}`;
          const answerId = `notebook-quiz-${output.id}-answer-${i}`;
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
              <button
                type="button"
                onClick={() => toggleQuiz(i)}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
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
                </div>
              )}
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
