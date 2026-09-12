import ChatMarkdown from '@/components/chat/ChatMarkdown';
import type { ApexChatMessage } from '@/hooks/useApexChat';
import { APEX_TAGLINE } from '@/content/apex';
import type { StudyPageContext } from '@/lib/studyContext';
import AiFeedbackControls from '@/components/AiFeedbackControls';
import { BookOpenCheck } from 'lucide-react';

type Props = {
  messages: ApexChatMessage[];
  loading: boolean;
  streamingMessageId?: string | null;
  context: StudyPageContext;
  compact?: boolean;
};

export default function ApexMessageList({
  messages,
  loading,
  streamingMessageId = null,
  context,
  compact = false,
}: Props) {
  return (
    <div className={`apex-chat-messages ${compact ? 'apex-chat-messages-compact' : ''}`} aria-live="polite">
      {messages.length === 0 && !loading && (
        <div className="apex-chat-empty">
          <p className="text-sm font-semibold text-foreground">AI tutor</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[16rem] mx-auto leading-relaxed">
            {APEX_TAGLINE}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-3">
            Context: <span className="text-foreground/90">{context.label}</span>
          </p>
        </div>
      )}

      {messages.map((msg) => {
        const isStreamingAssistant =
          msg.role === 'assistant' && loading && msg.id === streamingMessageId;

        return (
          <div
            key={msg.id}
            className={`apex-bubble ${msg.role === 'user' ? 'apex-bubble-user' : 'apex-bubble-assistant'}`}
          >
            <p className="apex-bubble-label">{msg.role === 'user' ? 'You' : 'AI tutor'}</p>
            {msg.role === 'assistant' ? (
              isStreamingAssistant ? (
                <p className="text-sm text-foreground/95 whitespace-pre-wrap">{msg.text || '…'}</p>
              ) : (
                <ChatMarkdown className="text-sm">{msg.text || '…'}</ChatMarkdown>
              )
            ) : (
              <p className="text-sm text-foreground/95 whitespace-pre-wrap">{msg.text}</p>
            )}
            {msg.role === 'assistant' && !isStreamingAssistant && msg.sources && msg.sources.length > 0 && (
              <details className="mt-3 border-t border-border/50 pt-2 text-xs">
                <summary className="flex cursor-pointer items-center gap-2 font-semibold text-foreground">
                  <BookOpenCheck className="h-4 w-4" aria-hidden />
                  Evidence used ({msg.sources.length})
                </summary>
                <ul className="mt-2 space-y-2">
                  {msg.sources.map((source) => (
                    <li key={source.id} className="border-l-2 border-primary/30 pl-3">
                      <strong className="block text-foreground">{source.title}</strong>
                      {source.excerpt && <span className="mt-1 block text-muted-foreground">{source.excerpt}</span>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {msg.role === 'assistant' && !isStreamingAssistant && msg.text && !compact && (
              <div className="mt-3 border-t border-border/50 pt-2">
                <AiFeedbackControls capability="chatbot" />
              </div>
            )}
          </div>
        );
      })}

      {loading && !streamingMessageId && (
        <div className="apex-typing" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
}
