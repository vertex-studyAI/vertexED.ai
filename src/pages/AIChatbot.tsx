import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bot, Trash2 } from "lucide-react";
import PageSection from "@/components/PageSection";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getStudyContext } from "@/lib/studyContext";
import { consumeChatHandoff } from "@/lib/userContent";
import { useApexChat } from "@/hooks/useApexChat";
import { APEX_TAGLINE, formatHandoffPrefill } from "@/content/apex";
import { recordStudySession } from "@/lib/studyStats";
import ApexMessageList from "@/components/chat/ApexMessageList";
import ApexPromptChips from "@/components/chat/ApexPromptChips";
import ApexChatInput from "@/components/chat/ApexChatInput";
import ApexSocraticDrill from "@/components/chat/ApexSocraticDrill";

export default function AIChatbot() {
  const { user } = useAuth();
  const studyContext = getStudyContext("/chatbot", user);
  const chatPanelRef = useRef<HTMLDivElement | null>(null);
  const handoffHandled = useRef(false);

  const { messages, input, setInput, loading, sendMessage, clearChat } = useApexChat({
    context: studyContext,
    onSessionRecord: recordStudySession,
  });

  useEffect(() => {
    chatPanelRef.current?.scrollTo({ top: chatPanelRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const prefill = sessionStorage.getItem("vertex_apex_prefill");
    if (prefill) {
      sessionStorage.removeItem("vertex_apex_prefill");
      setInput(prefill);
    }
  }, [setInput]);

  useEffect(() => {
    if (handoffHandled.current) return;
    const handoff = consumeChatHandoff();
    if (!handoff) return;
    handoffHandled.current = true;
    const text = formatHandoffPrefill(handoff);
    void sendMessage(text);
  }, [sendMessage]);

  const send = () => void sendMessage();

  return (
    <>
      <SEO title="Apex — AI Study Tutor | VertexED" description={APEX_TAGLINE} />

      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="neu-card p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="apex-avatar">
                <Bot className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Apex</h1>
                <p className="text-sm text-muted-foreground max-w-2xl mt-1">{APEX_TAGLINE}</p>
                <p className="text-xs text-primary/80 mt-2">
                  Discussion-first · step-by-step · board-aware when you mention yours
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button type="button" onClick={clearChat} className="btn-glass text-xs inline-flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Clear thread
              </button>
            )}
          </div>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="mb-6 w-full justify-start gap-2 rounded-xl border border-border/50 bg-foreground/[0.03] p-1 h-auto shadow-none">
              <TabsTrigger value="chat" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                Chat
              </TabsTrigger>
              <TabsTrigger value="how" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                How Apex works
              </TabsTrigger>
              <TabsTrigger value="drill" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                Socratic Drill
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-0">
              <div className="h-[min(68vh,640px)] flex flex-col gap-3">
                {messages.length === 0 && !loading && (
                  <ApexPromptChips context={studyContext} onSelect={(text) => void sendMessage(text)} disabled={loading} />
                )}

                <div ref={chatPanelRef} className="apex-chat-surface flex-1 overflow-y-auto">
                  <ApexMessageList messages={messages} loading={loading} context={studyContext} />
                </div>

                <ApexChatInput
                  value={input}
                  onChange={setInput}
                  onSend={send}
                  loading={loading}
                  placeholder="Ask Apex — concept, essay, mock strategy…"
                />
              </div>
            </TabsContent>

            <TabsContent value="how" className="mt-0">
              <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
                {[
                  {
                    title: "Deliberate, not instant",
                    body: "Apex asks what you've tried before handing you the answer. The goal is understanding that survives the exam hall.",
                  },
                  {
                    title: "Context-aware",
                    body: "On Paper Maker, Apex talks mocks. After a review, it helps you interpret rubric feedback. Mention your board for sharper answers.",
                  },
                  {
                    title: "Math & essays",
                    body: "Notation renders properly. Long responses won't get cut off mid-thought — take your time with follow-ups.",
                  },
                  {
                    title: "Socratic Drill",
                    body: "Five rounds of probing questions on one topic — no answers until you've tried. Ends with a gap summary and one practice task.",
                  },
                ].map((item) => (
                  <div key={item.title} className="glass-tile p-5">
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="drill" className="mt-0">
              <ApexSocraticDrill />
            </TabsContent>
          </Tabs>
        </div>
      </PageSection>
    </>
  );
}
