import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatbotApiError, fetchChatbotAnswer, type ChatbotMessage, type ChatbotSource } from '@/lib/chatbotApi';
import type { StudyPageContext } from '@/lib/studyContext';
import { animateTypewriter } from '@/lib/typewriter';
import { normalizeUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import {
  clearApexChatMessages,
  loadApexChatMessages,
  saveApexChatMessages,
} from '@/lib/apexChatStorage.mjs';

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
  return `vertex_apex:${account}:${encodeURIComponent(thread).slice(0, 120)}`;
}

function loadMessages(storageKey: string): ApexChatMessage[] {
  if (typeof window === 'undefined') return [];
  return loadApexChatMessages(window, storageKey) as ApexChatMessage[];
}

function saveMessages(storageKey: string, messages: ApexChatMessage[]) {
  if (typeof window === 'undefined') return;
  saveApexChatMessages(window, storageKey, messages);
}

type Options = {
  context: StudyPageContext;
  /** Optional sub-thread id (e.g. socratic-drill) within the same page. */
  threadKey?: string;
  sources?: import('@/lib/notebook').GroundedSourcePayload[];
  onSessionRecord?: () => void;
};

export function useApexChat({ context, threadKey, sources, onSessionRecord }: Options) {
  const { user, loading: authLoading } = useAuth();
  const accountScope = authLoading ? undefined : user?.id ?? null;
  const storageKey = apexChatStorageKey(context.page, threadKey, accountScope);
  const [messages, setMessages] = useState<ApexChatMessage[]>(() => loadMessages(storageKey));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const typingRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const requestAbortRef = useRef<AbortController | null>(null);
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  useEffect(() => {
    // Account or thread changes invalidate and abort in-flight output before loading the new scope.
    requestRef.current += 1;
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    if (typingRef.current !== null) {
      window.clearInterval(typingRef.current);
      typingRef.current = null;
    }
    setMessages(loadMessages(storageKey));
    setInput('');
    setLoading(false);
    setStreamingMessageId(null);
  }, [storageKey]);

  useEffect(() => {
    // Persist only after the message state itself changes. A storage-key-only
    // render still holds the prior scope's messages until the scope effect above
    // hydrates the new account/thread, so writing on that render could briefly
    // copy one account's history into another account's session key.
    saveMessages(storageKeyRef.current, messages);
  }, [messages]);

  useEffect(() => {
    return () => {
      requestAbortRef.current?.abort();
      requestAbortRef.current = null;
      if (typingRef.current !== null) window.clearInterval(typingRef.current);
    };
  }, []);

  const clearChat = useCallback(() => {
    requestRef.current += 1;
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    if (typingRef.current !== null) {
      window.clearInterval(typingRef.current);
      typingRef.current = null;
    }
    setMessages([]);
    setInput('');
    setLoading(false);
    setStreamingMessageId(null);
    if (typeof window !== 'undefined') {
      clearApexChatMessages(window, storageKey);
    }
  }, [storageKey]);

  const cancelMessage = useCallback(() => {
    requestRef.current += 1;
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    if (typingRef.current !== null) {
      window.clearInterval(typingRef.current);
      typingRef.current = null;
    }
    setLoading(false);
    setStreamingMessageId(null);
  }, []);

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const question = (textOverride ?? input).trim();
      if (!question || loading || authLoading) return false;

      const requestId = requestRef.current + 1;
      requestRef.current = requestId;
      const requestStorageKey = storageKey;
      requestAbortRef.current?.abort();
      const requestController = new AbortController();
      requestAbortRef.current = requestController;

      if (typingRef.current !== null) {
        window.clearInterval(typingRef.current);
        typingRef.current = null;
      }

      const userMsg: ApexChatMessage = { id: `${Date.now()}-u`, role: 'user', text: question };
      const botId = `${Date.now()}-a`;

      // `question` is sent separately by chatbotApi and appended server-side.
      // History must contain only completed prior turns or the newest prompt is
      // duplicated in the model context.
      const priorHistory: ChatbotMessage[] = messages.map(({ role, text }) => ({
        role,
        text,
      }));

      setMessages((prev) => [...prev, userMsg, { id: botId, role: 'assistant', text: '' }]);
      setInput('');
      setLoading(true);
      setStreamingMessageId(botId);
      onSessionRecord?.();

      try {
        const data = await fetchChatbotAnswer({
          question,
          history: priorHistory,
          context,
          sources,
          signal: requestController.signal,
        });
        if (requestRef.current !== requestId || storageKeyRef.current !== requestStorageKey) return false;
        const answer =
          typeof data?.answer === 'string' && data.answer.trim()
            ? data.answer.trim()
            : "Sorry - I couldn't generate a response.";
        const citationIds = new Set(
          Array.isArray(data.citations)
            ? data.citations.filter((citation) => citation && typeof citation.id === 'string').map((citation) => citation.id)
            : [],
        );
        const citedSources = Array.isArray(data.sources)
          ? data.sources.filter((source): source is ChatbotSource => (
            Boolean(source)
            && typeof source.id === 'string'
            && typeof source.title === 'string'
            && (citationIds.size === 0 || citationIds.has(source.id))
          ))
          : [];

        const firstChar = answer.slice(0, 1);
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, text: firstChar, sources: citedSources } : m)),
        );

        if (answer.length > 1) {
          await animateTypewriter(
            answer,
            (nextText) => {
              setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: nextText } : m)));
            },
            { intervalMs: 16, intervalRef: typingRef, startIndex: 1 },
          );
        }
        return true;
      } catch (err) {
        if (requestRef.current !== requestId || storageKeyRef.current !== requestStorageKey) return false;
        const status = err instanceof ChatbotApiError ? err.status : null;
        const message =
          status === 401
            ? 'Please log in again to use the AI tutor.'
            : status === 429
              ? 'You are sending messages too quickly. Wait a moment and try again.'
              : status === 503 && err instanceof Error
                ? err.message
              : status && status >= 500
                ? 'The AI service is temporarily unavailable. Try again shortly.'
                : err instanceof Error
                  ? err.message
                  : 'The AI service is temporarily unavailable. Try again shortly.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, text: message } : m,
          ),
        );
        return false;
      } finally {
        if (requestAbortRef.current === requestController) {
          requestAbortRef.current = null;
        }
        if (requestRef.current === requestId && storageKeyRef.current === requestStorageKey) {
          setLoading(false);
          setStreamingMessageId(null);
        }
      }
    },
    [authLoading, context, sources, input, loading, messages, onSessionRecord, storageKey],
  );

  return {
    messages,
    input,
    setInput,
    loading,
    streamingMessageId,
    sendMessage,
    cancelMessage,
    clearChat,
    context,
  };
}
