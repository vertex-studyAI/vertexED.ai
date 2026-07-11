import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function NotebookOutputPanel({ output, notebookTitle, onAskQuestion }: Props) {
  const [revealedQuiz, setRevealedQuiz] = useState<Set<string>>(new Set());

  const toggleQuiz = (id: string) => {
    setRevealedQuiz((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
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
      <div className="space-y-4">
        {output.quiz.map((q, i) => {
          const show = revealedQuiz.has(q.id);
          return (
            <div key={q.id} className="notebook-quiz-card rounded-xl border border-border/60 p-4">
              <p className="text-xs text-primary font-medium mb-1">
                Question {i + 1} · {q.marks} mark{q.marks === 1 ? '' : 's'}
              </p>
              <p className="text-sm font-medium text-foreground mb-2">{q.question}</p>
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
                onClick={() => toggleQuiz(q.id)}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                {show ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {show ? 'Hide answer' : 'Reveal answer'}
              </button>
              {show && (
                <div className="mt-3 pt-3 border-t border-border/50 text-sm">
                  <p>
                    <span className="font-medium text-emerald-500">Answer:</span> {q.answer}
                  </p>
                  {q.explanation && (
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{q.explanation}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (output.kind === 'suggested-questions' && output.suggestedQuestions?.length) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground mb-3">Tap a question to ask Apex with your sources attached.</p>
        {output.suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAskQuestion?.(q)}
            className="notebook-suggest-q w-full text-left text-sm px-4 py-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition"
          >
            {q}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isAudio && <NotebookTtsPlayer script={output.content} />}
      {output.kind === 'flashcards' && output.flashcards && output.flashcards.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={pushFlashcards} className="btn-solid text-xs inline-flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Add {output.flashcards.length} to SR deck
          </button>
          <Link to="/notetaker?mode=study" className="btn-glass text-xs inline-flex items-center gap-1.5">
            Review now →
          </Link>
        </div>
      )}
      <ChatMarkdown className="notebook-output">{output.content}</ChatMarkdown>
    </div>
  );
}

export function outputKindLabel(kind: NotebookOutputKind): string {
  return NOTEBOOK_OUTPUT_META[kind]?.label ?? kind;
}
