import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Bot, Minimize2, Trash2, X } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { getStudyContext } from "@/lib/studyContext";
import { recordStudySession } from "@/lib/studyStats";
import { consumeChatHandoff } from "@/lib/userContent";
import { useApexChat } from "@/hooks/useApexChat";
import { formatHandoffPrefill } from "@/content/apex";
import ApexPromptChips from "@/components/chat/ApexPromptChips";
import ApexChatInput from "@/components/chat/ApexChatInput";

const STORAGE_KEY = "vertex_global_chat_open";
const ApexMessageList = lazy(() => import("@/components/chat/ApexMessageList"));

export default function GlobalChatPanel() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const studyContext = getStudyContext(location.pathname, user);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const focusPanelOnOpenRef = useRef(false);

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

  const isStudyGuideRoute = location.pathname.startsWith("/study-guides");
  const visibleRoute =
    location.pathname !== "/chatbot" &&
    !["/login", "/signup", "/auth/callback", "/onboarding", "/", "/home", "/about", "/features"].includes(
      location.pathname,
    ) &&
    !location.pathname.startsWith("/resources");
  const canShowChat = visibleRoute && (isAuthenticated || isStudyGuideRoute);

  const openChat = () => {
    focusPanelOnOpenRef.current = true;
    setMinimized(false);
    setOpen(true);
  };

  const closeChat = () => {
    setOpen(false);
    setMinimized(false);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  };

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
  }, [open]);

  useEffect(() => {
    if (!open || !focusPanelOnOpenRef.current) return;
    focusPanelOnOpenRef.current = false;
    panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeChat();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    const handoff = consumeChatHandoff();
    if (!handoff) return;
    focusPanelOnOpenRef.current = true;
    setOpen(true);
    setMinimized(false);
    setInput(formatHandoffPrefill(handoff));
  }, [location.pathname, setInput]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (!canShowChat) return null;

  const send = () => void sendMessage();

  if (!open) {
    return (
      <button
        ref={openerRef}
        type="button"
        onClick={openChat}
        className={`apex-fab ${isStudyGuideRoute ? "apex-fab-round" : ""}`}
        aria-label={isStudyGuideRoute ? "Open study guide AI tutor" : "Open AI tutor"}
      >
        <Bot className="h-5 w-5" />
        {!isStudyGuideRoute && <span className="hidden sm:inline">AI tutor</span>}
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`apex-panel ${minimized ? "apex-panel-minimized" : ""}`}
      role="dialog"
      aria-label="AI tutor"
      aria-modal="false"
      tabIndex={-1}
    >
      <div className="apex-panel-header">
        <div className="flex items-center gap-2 min-w-0">
          <span className="apex-avatar apex-avatar-sm">
            <Bot className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">AI tutor</p>
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
            onClick={closeChat}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {isAuthenticated ? (
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
                <Suspense fallback={<p className="text-sm text-muted-foreground">Opening tutor…</p>}>
                  <ApexMessageList
                    messages={messages}
                    loading={loading}
                    streamingMessageId={streamingMessageId}
                    context={studyContext}
                    compact
                  />
                </Suspense>
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
          ) : (
            <div className="apex-panel-body apex-study-guide-chat-gate">
              <span className="apex-avatar">
                <Bot className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-foreground">Ask the study-guide tutor</p>
                <p className="mt-1 text-sm text-muted-foreground">Sign in to ask questions across the MYP guides.</p>
              </div>
              <Link className="apex-study-guide-chat-signin" to="/login" state={{ from: location.pathname }}>
                Sign in to chat
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
