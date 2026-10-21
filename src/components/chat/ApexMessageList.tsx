import { Link } from 'react-router-dom';

import ChatMarkdown from '@/components/chat/ChatMarkdown';
import type { ApexChatMessage } from '@/hooks/useApexChat';
import { APEX_TAGLINE } from '@/content/apex';
import type { StudyPageContext } from '@/lib/studyContext';

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

            {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
              <div className="apex-sources">
                <p className="apex-sources-label">Sources</p>
                <ul>
                  {msg.sources.map((source) => {
                    const text = source.heading
                      ? `${source.label ?? 'Guide'} › ${source.heading}`
                      : source.label ?? source.path ?? 'Guide page';
                    return (
                      <li key={`${source.path ?? source.url}-${source.heading ?? ''}`}>
                        {source.url ? <Link to={source.url}>{text}</Link> : <span>{text}</span>}
                      </li>
                    );
                  })}
                </ul>
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
