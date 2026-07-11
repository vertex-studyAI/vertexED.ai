import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bot, Minimize2, Trash2, X } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { getStudyContext } from "@/lib/studyContext";
import { recordStudySession } from "@/lib/studyStats";
import { consumeChatHandoff } from "@/lib/userContent";
import { useApexChat } from "@/hooks/useApexChat";
import { formatHandoffPrefill } from "@/content/apex";
import ApexMessageList from "@/components/chat/ApexMessageList";
import ApexPromptChips from "@/components/chat/ApexPromptChips";
import ApexChatInput from "@/components/chat/ApexChatInput";

const STORAGE_KEY = "vertex_global_chat_open";

export default function GlobalChatPanel() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const studyContext = getStudyContext(location.pathname, user);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [minimized, setMinimized] = useState(false);

  const { messages, input, setInput, loading, streamingMessageId, sendMessage, cancelMessage, clearChat } = useApexChat({
    context: studyContext,
    threadKey: 'apex-main',
    onSessionRecord: recordStudySession,
  });

  const protectedRoute =
    isAuthenticated &&
    location.pathname !== "/chatbot" &&
    !["/login", "/signup", "/auth/callback", "/onboarding", "/", "/home", "/about", "/features"].includes(
      location.pathname,
    ) &&
    !location.pathname.startsWith("/resources");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
  }, [open]);

  useEffect(() => {
    const handoff = consumeChatHandoff();
    if (!handoff) return;
    setOpen(true);
    setMinimized(false);
    setInput(formatHandoffPrefill(handoff));
  }, [location.pathname, setInput]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (!protectedRoute) return null;

  const send = () => void sendMessage();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="apex-fab"
        aria-label="Open Apex chat"
      >
        <Bot className="h-5 w-5" />
        <span className="hidden sm:inline">Apex</span>
      </button>
    );
  }

  return (
    <div
      className={`apex-panel ${minimized ? "apex-panel-minimized" : ""}`}
      role="dialog"
      aria-label="Apex chat"
      aria-modal="false"
    >
      <div className="apex-panel-header">
        <div className="flex items-center gap-2 min-w-0">
          <span className="apex-avatar apex-avatar-sm">
            <Bot className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Apex</p>
            {!minimized && (
              <p className="text-[11px] text-muted-foreground truncate">{studyContext.label}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {!minimized && messages.length > 0 && (
            <button
              type="button"
              className="apex-panel-icon-btn"
              onClick={clearChat}
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            className="apex-panel-icon-btn"
            onClick={() => setMinimized((m) => !m)}
            aria-label={minimized ? "Expand chat" : "Minimize chat"}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="apex-panel-icon-btn"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div ref={scrollRef} className="apex-panel-body">
            {messages.length === 0 && !loading && (
              <ApexPromptChips
                context={studyContext}
                onSelect={(text) => void sendMessage(text)}
                disabled={loading}
                compact
              />
            )}
            <ApexMessageList
              messages={messages}
              loading={loading}
              streamingMessageId={streamingMessageId}
              context={studyContext}
              compact
            />
          </div>

          <div className="apex-panel-footer">
            <ApexChatInput
              value={input}
              onChange={setInput}
              onSend={send}
              onCancel={cancelMessage}
              loading={loading}
              compact
            />
          </div>
        </>
      )}
    </div>
  );
}
