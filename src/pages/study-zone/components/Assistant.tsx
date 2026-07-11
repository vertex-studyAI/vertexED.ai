import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getStudyContext } from "@/lib/studyContext";
import { useApexChat } from "@/hooks/useApexChat";
import { recordStudySession } from "@/lib/studyStats";
import ApexMessageList from "@/components/chat/ApexMessageList";
import ApexPromptChips from "@/components/chat/ApexPromptChips";
import ApexChatInput from "@/components/chat/ApexChatInput";

type Props = {
  onClose?: () => void;
};

export default function Assistant({ onClose }: Props) {
  const { user } = useAuth();
  const studyContext = getStudyContext("/study-zone", user);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { messages, input, setInput, loading, streamingMessageId, sendMessage } = useApexChat({
    context: studyContext,
    onSessionRecord: recordStudySession,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="apex-avatar">
            <Bot className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Apex</h2>
            <p className="text-xs text-muted-foreground">In-session Apex — ask what you tried first; use for stuck points mid-block.</p>
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="neu-button text-xs px-3 py-1.5">
            Close
          </button>
        )}
      </div>

      {messages.length === 0 && !loading && (
        <ApexPromptChips
          context={studyContext}
          onSelect={(text) => void sendMessage(text)}
          disabled={loading}
          compact
        />
      )}

      <div ref={scrollRef} className="apex-chat-surface flex-1 min-h-[280px] max-h-[360px] overflow-y-auto">
        <ApexMessageList
          messages={messages}
          loading={loading}
          streamingMessageId={streamingMessageId}
          context={studyContext}
          compact
        />
      </div>

      <ApexChatInput
        value={input}
        onChange={setInput}
        onSend={() => void sendMessage()}
        loading={loading}
        placeholder="Ask Apex mid-session…"
        compact
      />
    </div>
  );
}
