import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Sparkles } from "lucide-react";

import ApexChatInput from "@/components/chat/ApexChatInput";
import ApexMessageList from "@/components/chat/ApexMessageList";
import { useAuth } from "@/contexts/AuthContext";
import { useApexChat } from "@/hooks/useApexChat";
import { getStudyContext } from "@/lib/studyContext";
import { recordStudySession } from "@/lib/studyStats";

const COLLAPSED_KEY = "vertexed-guide-tutor-collapsed";

type Props = {
  /** Subject the reader is browsing, used for suggested questions. */
  subjectName?: string;
  /** Label of the open guide page, e.g. "M24" or "Command Terms". */
  pageLabel?: string;
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

export default function GuideWikiChat({ subjectName, pageLabel }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [collapsed, setCollapsed] = useState(() => (
    typeof window !== "undefined" && window.localStorage.getItem(COLLAPSED_KEY) === "1"
  ));

  // getStudyContext derives guidePath from the route, so the tutor always knows
  // which page the reader is on without threading it through props.
  const studyContext = useMemo(
    () => getStudyContext(location.pathname, user),
    [location.pathname, user],
  );

  const { messages, input, setInput, loading, streamingMessageId, sendMessage, cancelMessage, clearChat } =
    useApexChat({
      context: studyContext,
      threadKey: "myp-wiki",
      onSessionRecord: recordStudySession,
    });

  useEffect(() => {
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    if (collapsed) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, collapsed]);

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
            <button type="button" onClick={clearChat} className="study-guides-tutor-clear">Clear</button>
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
                    Ask anything about the MYP guides. The tutor searches every subject, session paper
                    and command-term page, then answers with links to what it read.
                  </p>
                  <div className="study-guides-tutor-chips">
                    {starters.map((starter) => (
                      <button key={starter} type="button" onClick={() => void sendMessage(starter)} disabled={loading}>
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
              <ApexChatInput
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
            <p>Sign in to ask questions across every MYP guide page.</p>
            <Link to="/login" state={{ from: location.pathname }}>Sign in to chat</Link>
          </div>
        )
      )}
    </aside>
  );
}
