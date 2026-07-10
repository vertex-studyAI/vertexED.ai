import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, Minimize2, X } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { fetchChatbotAnswer, type ChatbotMessage } from "@/lib/chatbotApi";
import { getStudyContext } from "@/lib/studyContext";
import { animateTypewriter } from "@/lib/typewriter";
import { recordStudySession } from "@/lib/studyStats";
import { consumeChatHandoff } from "@/lib/userContent";

const ChatMarkdown = lazy(() => import("@/components/chat/ChatMarkdown"));

type PanelMessage = ChatbotMessage & { id: string };

const STORAGE_KEY = "vertex_global_chat_open";

export default function GlobalChatPanel() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const studyContext = getStudyContext(location.pathname, user);

  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const typingRef = useRef<number | null>(null);

  const protectedRoute =
    isAuthenticated &&
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
    const prefill = [
      handoff.feedback && `Here is feedback on my answer:\n${handoff.feedback.slice(0, 800)}`,
      handoff.question && `Question: ${handoff.question}`,
      "Help me understand how to improve my response step by step.",
    ]
      .filter(Boolean)
      .join("\n\n");
    setInput(prefill);
  }, [location.pathname]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (typingRef.current !== null) window.clearInterval(typingRef.current);
    };
  }, []);

  if (!protectedRoute) return null;

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;

    if (typingRef.current !== null) {
      window.clearInterval(typingRef.current);
      typingRef.current = null;
    }

    const userMsg: PanelMessage = { id: `${Date.now()}-u`, role: "user", text: question };
    const history: ChatbotMessage[] = [...messages, userMsg].map(({ role, text }) => ({ role, text }));
    const botId = `${Date.now()}-a`;

    setMessages((prev) => [...prev, userMsg, { id: botId, role: "assistant", text: "" }]);
    setInput("");
    setLoading(true);
    recordStudySession();

    try {
      const data = await fetchChatbotAnswer({ question, history, context: studyContext });
      const answer =
        typeof data?.answer === "string" && data.answer.trim()
          ? data.answer.trim()
          : "Sorry — I couldn't generate a response.";

      await animateTypewriter(
        answer,
        (nextText) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, text: nextText } : m)),
          );
        },
        { intervalMs: 16, intervalRef: typingRef },
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? { ...m, text: "The AI service is temporarily unavailable. Try again shortly." }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full border border-primary/30 bg-primary/90 px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary transition"
        aria-label="Open study assistant"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Study Assistant</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-[60] flex flex-col border border-white/15 bg-[hsl(216,18%,10%/0.95)] backdrop-blur-xl shadow-2xl transition-all ${
        minimized
          ? "bottom-6 right-6 w-72 h-14 rounded-2xl"
          : "bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-[min(520px,85vh)] sm:rounded-2xl"
      }`}
      role="dialog"
      aria-label="Study assistant chat"
      aria-modal="false"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">Study Assistant</p>
          {!minimized && (
            <p className="text-xs text-muted-foreground truncate">
              Context: {studyContext.label}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            onClick={() => setMinimized((m) => !m)}
            aria-label={minimized ? "Expand chat" : "Minimize chat"}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Ask about what you&apos;re working on — I know you&apos;re on{" "}
                <strong className="text-foreground">{studyContext.label}</strong>.
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "ml-auto bg-primary/20 border border-primary/25"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Suspense fallback={<span className="text-muted-foreground">…</span>}>
                    <ChatMarkdown>{msg.text || "…"}</ChatMarkdown>
                  </Suspense>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 pl-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce delay-300" />
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3 flex gap-2 shrink-0">
            <input
              className="neu-input-el flex-1 text-sm"
              placeholder="Discuss, deliberate, ask…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
            />
            <button
              type="button"
              className="neu-button px-4 py-2 text-sm font-semibold shrink-0"
              onClick={send}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
