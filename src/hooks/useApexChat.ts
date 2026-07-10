import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchChatbotAnswer, type ChatbotMessage } from '@/lib/chatbotApi';
import type { StudyPageContext } from '@/lib/studyContext';
import { animateTypewriter } from '@/lib/typewriter';

export type ApexChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const STORAGE_KEY = 'vertex_apex_messages_v1';
const MAX_STORED = 40;

function loadMessages(): ApexChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ApexChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_STORED) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: ApexChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
  } catch {}
}

type Options = {
  context: StudyPageContext;
  onSessionRecord?: () => void;
};

export function useApexChat({ context, onSessionRecord }: Options) {
  const [messages, setMessages] = useState<ApexChatMessage[]>(loadMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const typingRef = useRef<number | null>(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingRef.current !== null) window.clearInterval(typingRef.current);
    };
  }, []);

  const clearChat = useCallback(() => {
    if (typingRef.current !== null) {
      window.clearInterval(typingRef.current);
      typingRef.current = null;
    }
    setMessages([]);
    setInput('');
    setLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const question = (textOverride ?? input).trim();
      if (!question || loading) return false;

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
      onSessionRecord?.();

      try {
        const data = await fetchChatbotAnswer({ question, history: priorHistory, context });
        const answer =
          typeof data?.answer === 'string' && data.answer.trim()
            ? data.answer.trim()
            : "Sorry — I couldn't generate a response.";

        await animateTypewriter(
          answer,
          (nextText) => {
            setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: nextText } : m)));
          },
          { intervalMs: 16, intervalRef: typingRef },
        );
        return true;
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? { ...m, text: 'The AI service is temporarily unavailable. Try again shortly.' }
              : m,
          ),
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [context, input, loading, messages, onSessionRecord],
  );

  return {
    messages,
    input,
    setInput,
    loading,
    sendMessage,
    clearChat,
    context,
  };
}
