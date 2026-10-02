import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatbotApiError, fetchChatbotAnswer, type ChatbotMessage, type ChatbotMode, type ChatbotSource } from '@/lib/chatbotApi';
import type { StudyPageContext } from '@/lib/studyContext';
import { getConversationStore, type ConversationState } from '@/lib/conversations';
import { normalizeUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import { apexChatError } from '@/lib/apexChatError.mjs';

export type ApexChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: ChatbotSource[];
};

const MAIN_THREAD_KEY = 'apex-main';

export function apexChatStorageKey(
  page: string,
  threadKey?: string,
  accountScope?: string | null,
) {
  const account = normalizeUserContentStorageScope(accountScope);
  let thread: string;
  if (threadKey?.trim()) {
    thread = threadKey.trim();
  } else if (page === 'chatbot' || page === 'dashboard' || page === 'vertexed') {
    // Share one conversation between GlobalChatPanel and /chatbot for this account.
    thread = MAIN_THREAD_KEY;
  } else {
    thread = page || 'global';
  }
  return `vertex_apex:${account}:${encodeURIComponent(thread.slice(0, 120))}`;
}

type Options = {
  context: StudyPageContext;
  /** Optional sub-thread id (e.g. socratic-drill) within the same page. */
  threadKey?: string;
  sources?: import('@/lib/notebook').GroundedSourcePayload[];
  /** Semantic model role. Provider/model selection stays server-side. */
  mode?: ChatbotMode;
  learningMode?: string;
  onSessionRecord?: () => void;
};

export function useApexChat({ context, threadKey, sources, mode, learningMode, onSessionRecord }: Options) {
  const { user, loading: authLoading } = useAuth();
  const accountScope = authLoading ? undefined : user?.id ?? null;
  const storageKey = apexChatStorageKey(context.page, threadKey, accountScope);
  const thread = decodeURIComponent(storageKey.slice(storageKey.lastIndexOf(':') + 1));
  const store = getConversationStore(accountScope);
  const persistence = useSyncExternalStore<ConversationState>(store.subscribe, store.getSnapshot, store.getSnapshot);
  const messages = (persistence.snapshot.threads.find(item => item.id === thread)?.messages ?? []) as ApexChatMessage[];
  const [draft, setDraft] = useState({ key: storageKey, text: '' });
  const input = draft.key === storageKey ? draft.text : '';
  const setInput = useCallback((text: string) => setDraft({ key: storageKey, text }), [storageKey]);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const loading = pendingKey === storageKey;
  const [recovery, setRecovery] = useState({ key: storageKey, text: '' });
  const recoveryText = recovery.key === storageKey ? recovery.text : '';
  const requestRef = useRef(0);
  const requestAbortRef = useRef<AbortController | null>(null);
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  useEffect(() => {
    requestRef.current += 1;
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    setPendingKey(null);
    void store.load();
    const refresh = () => { void store.load(); };
    const changed = () => store.invalidate();
    window.addEventListener('online', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', changed);
    return () => {
      requestRef.current += 1;
      requestAbortRef.current?.abort();
      requestAbortRef.current = null;
      window.removeEventListener('online', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', changed);
    };
  }, [store, storageKey]);

  const clearChat = useCallback(() => {
    requestRef.current += 1;
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    setPendingKey(null);
    if (!store.updateThread(thread, [])) return false;
    setInput('');
    void store.sync();
    return true;
  }, [store, thread, setInput]);

  const cancelMessage = useCallback(() => {
    requestRef.current += 1;
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    setPendingKey(null);
  }, []);

  const sendMessage = useCallback(async (textOverride?: string) => {
    const question = (textOverride ?? input).trim();
    if (!question || requestAbortRef.current || authLoading || !store.getSnapshot().ready || store.getSnapshot().readOnly) return false;
    const requestId = ++requestRef.current;
    const requestStorageKey = storageKey;
    const requestController = new AbortController();
    requestAbortRef.current = requestController;
    const currentMessages = (store.getSnapshot().snapshot.threads.find(item => item.id === thread)?.messages ?? []) as ApexChatMessage[];
    const priorHistory: ChatbotMessage[] = currentMessages.map(({ role, text }) => ({ role, text }));
    const userMsg: ApexChatMessage = { id: crypto.randomUUID(), role: 'user', text: question };
    if (!store.updateThread(thread, [...currentMessages, userMsg])) {
      requestAbortRef.current = null;
      return false;
    }
    setInput('');
    setPendingKey(storageKey);
    void store.sync();
    onSessionRecord?.();
    try {
      const data = await fetchChatbotAnswer({ question, history: priorHistory, context, sources, mode, learningMode, signal: requestController.signal });
      if (requestRef.current !== requestId || storageKeyRef.current !== requestStorageKey) return false;
      const answer = typeof data?.answer === 'string' && data.answer.trim() ? data.answer.trim() : "Sorry - I couldn't generate a response.";
      const citationIds = new Set((Array.isArray(data.citations) ? data.citations : []).filter(Boolean).map(citation => citation.id));
      const citedSources = (Array.isArray(data.sources) ? data.sources : []).filter(source => source && typeof source.id === 'string' && typeof source.title === 'string' && (!citationIds.size || citationIds.has(source.id)));
      const latest = (store.getSnapshot().snapshot.threads.find(item => item.id === thread)?.messages ?? []) as ApexChatMessage[];
      // A cleared/replaced conversation must not be resurrected by late output.
      if (!latest.some(message => message.id === userMsg.id) || !store.updateThread(thread, [...latest, { id: crypto.randomUUID(), role: 'assistant', text: answer, sources: citedSources }])) {
        setRecovery({ key: storageKey, text: answer });
        return false;
      }
      await store.sync();
      return true;
    } catch (err) {
      if (requestRef.current !== requestId || storageKeyRef.current !== requestStorageKey) return false;
      const status = err instanceof ChatbotApiError ? err.status : null;
      const message = apexChatError(err, status);
      setRecovery({ key: storageKey, text: message });
      return false;
    } finally {
      if (requestAbortRef.current === requestController) requestAbortRef.current = null;
      if (requestRef.current === requestId && storageKeyRef.current === requestStorageKey) setPendingKey(null);
    }
  }, [authLoading, context, sources, mode, learningMode, input, onSessionRecord, storageKey, store, thread, setInput]);

  return { messages, input, setInput, loading, streamingMessageId: null, sendMessage, cancelMessage, clearChat, context,
    persistence, store, recoveryText, historyDisabled: !persistence.ready || persistence.readOnly };
}
