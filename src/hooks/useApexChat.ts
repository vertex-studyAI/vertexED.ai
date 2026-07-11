import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatbotApiError, fetchChatbotAnswer, type ChatbotMessage } from '@/lib/chatbotApi';
import type { StudyPageContext } from '@/lib/studyContext';
import { animateTypewriter } from '@/lib/typewriter';

export type ApexChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const LEGACY_STORAGE_KEY = 'vertex_apex_messages_v1';
const MAIN_THREAD_KEY = 'apex-main';
const MAX_STORED = 40;

export function apexChatStorageKey(page: string, threadKey?: string) {
  if (threadKey?.trim()) {
    return `vertex_apex_thread_${threadKey.trim()}`;
  }
  // Share one conversation between GlobalChatPanel and /chatbot
  if (page === 'chatbot' || page === 'dashboard' || page === 'vertexed') {
    return `vertex_apex_thread_${MAIN_THREAD_KEY}`;
  }
  const scope = page || 'global';
  return `vertex_apex_thread_${scope}`;
}

function loadMessages(storageKey: string): ApexChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    let raw = sessionStorage.getItem(storageKey);
    if (!raw && storageKey !== LEGACY_STORAGE_KEY) {
      raw = sessionStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        sessionStorage.setItem(storageKey, raw);
        sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ApexChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_STORED) : [];
  } catch {
    return [];
  }
}

function saveMessages(storageKey: string, messages: ApexChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_STORED)));
  } catch (err) {
    console.warn('Failed to persist Apex chat messages:', err);
  }
}

type Options = {
  context: StudyPageContext;
  /** Optional sub-thread id (e.g. socratic-drill) within the same page. */
  threadKey?: string;
  sources?: import('@/lib/notebook').GroundedSourcePayload[];
  onSessionRecord?: () => void;
};

export function useApexChat({ context, threadKey, sources, onSessionRecord }: Options) {
  const storageKey = apexChatStorageKey(context.page, threadKey);
  const [messages, setMessages] = useState<ApexChatMessage[]>(() => loadMessages(storageKey));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const typingRef = useRef<number | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    setMessages(loadMessages(storageKey));
    setInput('');
    setLoading(false);
    setStreamingMessageId(null);
  }, [storageKey]);

  useEffect(() => {
    saveMessages(storageKey, messages);
  }, [messages, storageKey]);

  useEffect(() => {
    return () => {
      if (typingRef.current !== null) window.clearInterval(typingRef.current);
    };
  }, []);

  const clearChat = useCallback(() => {
    requestRef.current += 1;
    if (typingRef.current !== null) {
      window.clearInterval(typingRef.current);
      typingRef.current = null;
    }
    setMessages([]);
    setInput('');
    setLoading(false);
    setStreamingMessageId(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const cancelMessage = useCallback(() => {
    requestRef.current += 1;
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
      if (!question || loading) return false;

      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      if (typingRef.current !== null) {
        window.clearInterval(typingRef.current);
        typingRef.current = null;
      }

      const userMsg: ApexChatMessage = { id: `${Date.now()}-u`, role: 'user', text: question };
      const botId = `${Date.now()}-a`;

      const priorHistory: ChatbotMessage[] = [...messages, userMsg].map(({ role, text }) => ({
        role,
        text,
      }));

      setMessages((prev) => [...prev, userMsg, { id: botId, role: 'assistant', text: '' }]);
      setInput('');
      setLoading(true);
      setStreamingMessageId(botId);
      onSessionRecord?.();

      try {
        const data = await fetchChatbotAnswer({ question, history: priorHistory, context, sources });
        if (requestRef.current !== requestId) return false;
        const answer =
          typeof data?.answer === 'string' && data.answer.trim()
            ? data.answer.trim()
            : "Sorry — I couldn't generate a response.";

        const firstChar = answer.slice(0, 1);
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, text: firstChar } : m)),
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
        if (requestRef.current !== requestId) return false;
        const status = err instanceof ChatbotApiError ? err.status : null;
        const message =
          status === 401
            ? 'Please log in again to use Apex.'
            : status === 429
              ? 'You are sending messages too quickly. Wait a moment and try again.'
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
        if (requestRef.current === requestId) {
          setLoading(false);
          setStreamingMessageId(null);
        }
      }
    },
    [context, sources, input, loading, messages, onSessionRecord],
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
