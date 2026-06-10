import { env } from "@/lib/env";

interface ChatbotResponse {
  answer?: string;
  error?: string;
  [key: string]: unknown;
}

const DEFAULT_ENDPOINT = "/api/ask";

function normalizeEndpoint(url: string | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  return trimmed ? trimmed : null;
}

const buildEndpoints = (): string[] => {
  const endpoints = [DEFAULT_ENDPOINT];
  const configured = normalizeEndpoint(env.chatbotApiUrl);
  if (configured) endpoints.push(configured);
  const originFallback = typeof window !== "undefined" ? `${window.location.origin}/api/ask` : null;
  if (originFallback) endpoints.push(originFallback);
  return Array.from(new Set(endpoints.filter(Boolean)));
};

const parseJsonSafe = async (response: Response): Promise<ChatbotResponse | null> => {
  try {
    return await response.json();
  } catch (error) {
    console.warn("Failed to parse chatbot response JSON", error);
    return null;
  }
};

export const fetchChatbotAnswer = async (question: string): Promise<ChatbotResponse> => {
  const trimmedQuestion = question.trim();
  if (!trimmedQuestion) {
    throw new Error("Question is required");
  }

  const payload = JSON.stringify({ question: trimmedQuestion });
  const headers = { "Content-Type": "application/json" } as const;
  const endpoints = buildEndpoints();
  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = globalThis.setTimeout(() => controller.abort(), 20000);
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: payload,
        signal: controller.signal,
      });
      globalThis.clearTimeout(timeout);

      const data = await parseJsonSafe(response);
      if (!data) {
        lastError = new Error(`Empty response from ${endpoint}`);
        continue;
      }

      if (!response.ok) {
        lastError = new Error(
          (typeof data.error === "string" && data.error.trim())
            ? data.error
            : `Request failed with status ${response.status}`,
        );
        continue;
      }

      if (typeof data.error === "string" && data.error.trim()) {
        lastError = new Error(data.error);
        continue;
      }

      return data;
    } catch (error) {
      lastError = error;
      console.warn(`Chatbot request to ${endpoint} failed`, error);
    }
  }

  throw lastError ?? new Error("Unable to reach chatbot API");
};
