import { useState } from 'react';
import { Bot, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudyContext } from '@/lib/studyContext';
import { useApexChat } from '@/hooks/useApexChat';
import { recordStudySession } from '@/lib/studyStats';
import ApexMessageList from '@/components/chat/ApexMessageList';
import ApexChatInput from '@/components/chat/ApexChatInput';

const MAX_ROUNDS = 5;

export default function ApexSocraticDrill() {
  const { user } = useAuth();
  const context = getStudyContext('/chatbot', user);
  const [topic, setTopic] = useState('');
  const [active, setActive] = useState(false);
  const [round, setRound] = useState(0);

  const drillContext = {
    ...context,
    hint: `${context.hint} SOCRATIC DRILL MODE: Ask ONE probing question per turn. Never give the full answer. After the student responds, ask a follow-up that exposes gaps. Round ${round} of ${MAX_ROUNDS}.`,
  };

  const { messages, input, setInput, loading, streamingMessageId, sendMessage, clearChat } = useApexChat({
    context: drillContext,
    threadKey: 'socratic-drill',
    onSessionRecord: recordStudySession,
  });

  const userTurns = messages.filter((m) => m.role === 'user').length;

  const startDrill = async () => {
    const t = topic.trim();
    if (!t || loading) return;
    clearChat();
    setActive(true);
    setRound(1);
    await sendMessage(
      `[Socratic drill — round 1 of ${MAX_ROUNDS} on "${t}"] Ask me ONE question to test my understanding. Do not explain yet.`,
    );
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !active) return;

    const nextRound = Math.min(MAX_ROUNDS, userTurns + 1);
    setRound(nextRound);

    if (userTurns + 1 >= MAX_ROUNDS) {
      await sendMessage(
        `${text}\n\n[Final round] Briefly summarise my gaps and one concrete practice task for tonight.`,
      );
      setActive(false);
      return;
    }

    await sendMessage(
      `${text}\n\n[Round ${nextRound} of ${MAX_ROUNDS}] One follow-up question only — probe the weakest part of my reasoning.`,
    );
  };

  const reset = () => {
    clearChat();
    setActive(false);
    setRound(0);
    setTopic('');
  };

  return (
    <div className="apex-drill-panel neu-card p-5 md:p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="apex-avatar apex-avatar-sm">
          <Bot className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Socratic Drill</h2>
          <p className="text-sm text-muted-foreground">
            Apex asks — you think aloud. No answers until you&apos;ve tried. Five rounds, then a gap summary.
          </p>
        </div>
      </div>

      {!active && messages.length === 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            className="neu-input-el flex-1 text-sm"
            placeholder="Topic — e.g. electrophilic addition, essay thesis, Newton's laws…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void startDrill()}
          />
          <button type="button" className="btn-solid text-sm shrink-0" onClick={() => void startDrill()} disabled={!topic.trim()}>
            Start drill
          </button>
        </div>
      )}

      {active && (
        <div className="flex items-center justify-between gap-3 mb-3 text-xs">
          <span className="text-primary font-medium tabular-nums">
            Round {Math.min(round, MAX_ROUNDS)} / {MAX_ROUNDS}
          </span>
          <div className="flex gap-1 flex-1 max-w-[12rem]">
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full ${i < userTurns ? 'bg-primary' : 'bg-foreground/10'}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="apex-chat-surface min-h-[200px] max-h-[360px] overflow-y-auto mb-3">
        <ApexMessageList
          messages={messages}
          loading={loading}
          streamingMessageId={streamingMessageId}
          context={drillContext}
          compact
        />
      </div>

      {(active || messages.length > 0) && (
        <>
          <ApexChatInput
            value={input}
            onChange={setInput}
            onSend={() => void handleSend()}
            loading={loading}
            placeholder={active ? 'Your thinking…' : 'Start a new drill above'}
            compact
          />
          <button type="button" onClick={reset} className="mt-2 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <RotateCcw className="h-3 w-3" />
            Reset drill
          </button>
        </>
      )}
    </div>
  );
}
