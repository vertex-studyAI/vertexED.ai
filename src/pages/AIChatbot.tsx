import ConversationStatus from '@/components/chat/ConversationStatus';
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Trash2 } from "lucide-react";
import PageSection from "@/components/PageSection";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getStudyContext } from "@/lib/studyContext";
import { consumeChatHandoff } from "@/lib/userContent";
import { consumeApexPrefill } from "@/lib/apexPrefillStorage.mjs";
import { useApexChat } from "@/hooks/useApexChat";
import type { ChatbotMode } from "@/lib/chatbotApi";
import { APEX_TAGLINE, formatHandoffPrefill } from "@/content/apex";
import { recordStudySession } from "@/lib/studyStats";
import ApexMessageList from "@/components/chat/ApexMessageList";
import ApexPromptChips from "@/components/chat/ApexPromptChips";
import ApexChatInput from "@/components/chat/ApexChatInput";
import ApexSocraticDrill from "@/components/chat/ApexSocraticDrill";
import ApexAvatar from "@/components/chat/ApexAvatar";
import AgentNetworkPanel from "@/components/chat/AgentNetworkPanel";

import { TUTOR_MODES } from '@/lib/tutorModes.mjs';

const APEX_MODES: Array<{ value: ChatbotMode; label: string; description: string }> = [
  { value: 'quick', label: 'Quick', description: 'Fast, concise help' },
  { value: 'tutor', label: 'Tutor', description: 'Step-by-step teaching' },
  { value: 'deep', label: 'Deep', description: 'Harder reasoning' },
];

export default function AIChatbot() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedThread = searchParams.get('thread') || 'apex-main';
  const [historySearch, setHistorySearch] = useState({ scope: user?.id, text: '' });
  const historyQuery = historySearch.scope === user?.id ? historySearch.text : '';
  const studyContext = getStudyContext("/chatbot", user);
  const chatPanelRef = useRef<HTMLDivElement | null>(null);
  const handoffHandled = useRef(false);
  const [learningMode, setLearningMode] = useState('teach');
  const [mode, setMode] = useState<ChatbotMode>('tutor');

  const { messages, input, setInput, loading, streamingMessageId, sendMessage, cancelMessage, clearChat, persistence, store, recoveryText, historyDisabled } = useApexChat({
    context: studyContext,
    threadKey: selectedThread,
    mode,
    learningMode,
    onSessionRecord: recordStudySession,
  });

  useEffect(() => {
    chatPanelRef.current?.scrollTo({ top: chatPanelRef.current.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefill = consumeApexPrefill(window, user?.id ?? null);
    if (prefill) setInput(prefill);
  }, [setInput, user?.id]);

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
      <SEO title="AI Tutor | VertexED" description="Talk through concepts, practice questions, and feedback step by step." />

      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="neu-card p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <ApexAvatar className="shrink-0" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Tutor</h1>
                <p className="text-sm text-muted-foreground max-w-2xl mt-1">{APEX_TAGLINE}</p>
                <p className="text-xs text-primary/80 mt-2">
                  Discussion-first · step-by-step · board-aware when you mention yours
                </p>
                <label htmlFor="apex-learning-mode" className="mt-3 block text-sm font-medium">Learning mode</label>
                  <select id="apex-learning-mode" className="ml-2 rounded-lg border border-border bg-background p-2 text-base" value={learningMode} disabled={loading} onChange={event => setLearningMode(event.target.value)}>{TUTOR_MODES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
                <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="AI response mode">
                  {APEX_MODES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={mode === option.value}
                      disabled={loading}
                      title={option.description}
                      onClick={() => setMode(option.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60 ${
                        mode === option.value
                          ? 'border-primary/50 bg-primary/15 text-primary'
                          : 'border-border/60 bg-background/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  <span className="text-xs text-muted-foreground" aria-live="polite">
                    {APEX_MODES.find((option) => option.value === mode)?.description}
                  </span>
                </div>
              </div>
            </div>
            {messages.length > 0 && (
              <button type="button" onClick={clearChat} className="btn-glass text-xs inline-flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Clear thread
              </button>
            )}
          </div>

          <details className="mb-4 space-y-2">
            <summary className="cursor-pointer py-2 text-sm font-medium">Conversation history ({persistence.snapshot.threads.length})</summary>
            <label className="block text-sm" htmlFor="conversation-search">Search your conversations</label>
            <input id="conversation-search" className="w-full rounded border border-border bg-background p-2 text-base" type="search" maxLength={160} value={historyQuery} onChange={event => setHistorySearch({ scope: user?.id, text: event.target.value })} />
            <label className="block text-sm" htmlFor="conversation-select">Conversation</label>
            <select id="conversation-select" className="w-full rounded border border-border bg-background p-2" value={selectedThread} onChange={event => setSearchParams({ thread: event.target.value })}>
              <option value={selectedThread}>{selectedThread === 'apex-main' ? 'Main conversation' : persistence.snapshot.threads.find(item => item.id === selectedThread)?.messages.find(message => message.role === 'user')?.text.slice(0, 80) || 'New conversation'}</option>
              {persistence.snapshot.threads.filter(item => item.id !== selectedThread && item.messages.some(message => message.text.toLowerCase().includes(historyQuery.toLowerCase()))).map(item => <option key={item.id} value={item.id}>{item.messages.find(message => message.role === 'user')?.text.slice(0, 80) || item.id}</option>)}
            </select>
            <button type="button" className="btn-glass text-sm" disabled={historyDisabled || loading} onClick={() => setSearchParams({ thread: `conversation-${crypto.randomUUID()}` })}>New conversation</button>
            <p className="text-xs text-muted-foreground">Private account history, up to 24 conversations and 200 messages each within the storage limit. Export before clearing old work. AI replies are not verified answers.</p>
          </details>
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="mb-6 w-full flex-wrap justify-start gap-2 rounded-xl border border-border/50 bg-foreground/[0.03] p-1 h-auto shadow-none">
              <TabsTrigger value="chat" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                Chat
              </TabsTrigger>
              <TabsTrigger value="how" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                How the AI tutor works
              </TabsTrigger>
              <TabsTrigger value="drill" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                Socratic Drill
              </TabsTrigger>
              <TabsTrigger value="agents" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                Agent network
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-0">
              <ConversationStatus store={store} persistence={persistence} recoveryText={recoveryText} />
              <div className="h-[min(68vh,640px)] flex flex-col gap-3">
                {messages.length === 0 && !loading && (
                  <ApexPromptChips context={studyContext} onSelect={(text) => void sendMessage(text)} disabled={loading} />
                )}

                <div ref={chatPanelRef} className="apex-chat-surface flex-1 overflow-y-auto">
                  <ApexMessageList
                    messages={messages}
                    loading={loading}
                    streamingMessageId={streamingMessageId}
                    context={studyContext}
                  />
                </div>

                <ApexChatInput disabled={historyDisabled}
                  value={input}
                  onChange={setInput}
                  onSend={send}
                  onCancel={cancelMessage}
                  loading={loading}
                  placeholder="Ask about a concept, essay structure, or what to do in your next 25-minute block…"
                />
              </div>
            </TabsContent>

            <TabsContent value="how" className="mt-0">
              <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
                {[
                  {
                    title: "Deliberate, not instant",
                    body: "The AI tutor asks what you've tried before handing you the answer. The goal is understanding that survives the exam hall.",
                  },
                  {
                    title: "Context-aware",
                    body: "In practice papers, the AI tutor helps you unpack questions. After a review, it helps you interpret rubric feedback. Mention your board for sharper answers.",
                  },
                  {
                    title: "Math & essays",
                    body: "Notation renders properly. Long responses won't get cut off mid-thought - take your time with follow-ups.",
                  },
                  {
                    title: "Socratic Drill",
                    body: "Five rounds of probing questions on one topic - no answers until you've tried. Ends with a gap summary and one practice task.",
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
              <ApexSocraticDrill key={user?.id ?? 'signed-out'} />
            </TabsContent>

            <TabsContent value="agents" className="mt-0">
              <AgentNetworkPanel />
            </TabsContent>
          </Tabs>
        </div>
      </PageSection>
    </>
  );
}
