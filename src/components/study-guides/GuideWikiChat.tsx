import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { ChevronDown, Sparkles } from "lucide-react";

import ApexChatInput from "@/components/chat/ApexChatInput";
import ConversationStatus from "@/components/chat/ConversationStatus";
import ApexMessageList from "@/components/chat/ApexMessageList";
import { useAuth } from "@/contexts/AuthContext";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";
import { useApexChat } from "@/hooks/useApexChat";
import { getStudyContext } from "@/lib/studyContext";
import { recordStudySession } from "@/lib/studyStats";

const COLLAPSED_KEY = "vertexed-guide-tutor-collapsed";

type Props = {
  /** Subject the reader is browsing, used for suggested questions. */
  subjectName?: string;
  /** Label of the open guide page, e.g. "M24" or "Command Terms". */
  pageLabel?: string;
  /** Actual selected page, including when the browser is on a subject hub. */
  guidePath?: string;
};

/** Question starters that read naturally against whatever page is open. */
function suggestions(subjectName?: string, pageLabel?: string) {
  const subject = subjectName ?? "this subject";
  const starters = [
    `Summarise the key points on this page`,
    `Which topics come up most often in ${subject}?`,
    `What do the command terms in ${subject} expect me to do?`,
  ];
  if (pageLabel && /^[MN]\d{2}$/.test(pageLabel)) {
    starters[0] = `What was tested in ${pageLabel}, and how were the marks split?`;
  }
  return starters;
}

export default function GuideWikiChat({ subjectName, pageLabel, guidePath }: Props) {
  const { isAuthenticated, user } = useAuth();
  const { settings } = useAppPreferences();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [collapsed, setCollapsed] = useState(() => (
    (() => { try { return typeof window !== "undefined" && window.localStorage.getItem(COLLAPSED_KEY) === "1"; } catch { return false; } })()
  ));

  // Hub routes can display a selected overview without changing the pathname.
  const studyContext = useMemo(
    () => ({ ...getStudyContext(location.pathname, user), ...(guidePath ? { guidePath: guidePath.replace(/\.md$/i, "") } : {}) }),
    [location.pathname, user, guidePath],
  );

  const { messages, input, setInput, loading, streamingMessageId, sendMessage, cancelMessage, clearChat, persistence, store, recoveryText, historyDisabled } =
    useApexChat({
      context: studyContext,
      threadKey: "myp-wiki",
      onSessionRecord: recordStudySession,
    });

  useEffect(() => {
    try { window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0"); } catch { /* Device preferences are optional. */ }
  }, [collapsed]);

  useEffect(() => {
    if (collapsed) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: settings.reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [messages, loading, collapsed, settings.reducedMotion]);

  const starters = suggestions(subjectName, pageLabel);

  return (
    <aside className={`study-guides-tutor ${collapsed ? "is-collapsed" : ""}`} aria-label="Study guide tutor">
      <div className="study-guides-tutor-header">
        <div className="min-w-0">
          <p className="study-guides-eyebrow"><Sparkles className="h-3.5 w-3.5" aria-hidden /> Ask the guides</p>
          <p className="study-guides-tutor-scope">
            {subjectName ? `Reading ${subjectName}` : "Reading the MYP wiki"}
            {pageLabel ? ` · ${pageLabel}` : ""}
          </p>
        </div>
        <div className="study-guides-tutor-actions">
          {!collapsed && messages.length > 0 && (
            <button type="button" onClick={clearChat} disabled={historyDisabled} className="study-guides-tutor-clear">Clear</button>
          )}
          <button
            type="button"
            className="study-guides-tutor-toggle"
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((current) => !current)}
          >
            <span className="sr-only">{collapsed ? "Expand tutor" : "Collapse tutor"}</span>
            <ChevronDown className={collapsed ? undefined : "is-open"} aria-hidden />
          </button>
        </div>
      </div>

      {!collapsed && (
        isAuthenticated ? (
          <>
            <div ref={scrollRef} className="study-guides-tutor-body">
              {messages.length === 0 && !loading ? (
                <div className="study-guides-tutor-intro">
                  <p>
                    Ask about the approved MYP guide collection. Answers include the sources used.
                    If a page has not completed editorial review, the tutor cannot use it.
                  </p>
                  <div className="study-guides-tutor-chips">
                    {starters.map((starter) => (
                      <button key={starter} type="button" onClick={() => void sendMessage(starter)} disabled={loading || historyDisabled}>
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // The shared list has its own empty state; the intro above
                // replaces it here, so only mount the list once there is a turn.
                <ApexMessageList
                  messages={messages}
                  loading={loading}
                  streamingMessageId={streamingMessageId}
                  context={studyContext}
                  compact
                />
              )}
            </div>

            <div className="study-guides-tutor-footer">
              <ConversationStatus store={store} persistence={persistence} recoveryText={recoveryText} />
              <ApexChatInput
                disabled={historyDisabled}
                value={input}
                onChange={setInput}
                onSend={() => void sendMessage()}
                onCancel={cancelMessage}
                loading={loading}
                compact
                placeholder="Ask about any guide page…"
              />
            </div>
          </>
        ) : (
          <div className="study-guides-tutor-gate">
            <p>Sign in to ask questions about approved MYP guide pages.</p>
            <Link to="/login" state={{ from: location.pathname }}>Sign in to chat</Link>
          </div>
        )
      )}
    </aside>
  );
}
