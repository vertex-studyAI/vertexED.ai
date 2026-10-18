import { authFetch } from '@/lib/apiAuth';
import { resolveSameOriginApiPath } from '@/lib/sameOriginApi.mjs';
import type { StudyPageContext } from '@/lib/studyContext';
import type { GroundedSourcePayload } from '@/lib/notebook';

export type ChatbotMode = 'quick' | 'tutor' | 'deep';

export interface ChatbotMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatbotSource {
  id: string;
  title: string;
  excerpt?: string;
  path?: string;
}

export interface ChatbotRequest {
  question: string;
  history?: ChatbotMessage[];
  context?: StudyPageContext;
  sources?: GroundedSourcePayload[];
  mode?: ChatbotMode;
  learningMode?: string;
  signal?: AbortSignal;
}

interface ChatbotResponse {
	answer?: string;
	error?: string;
	citations?: ChatbotSource[];
	sources?: ChatbotSource[];
	[key: string]: unknown;
}

export class ChatbotApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "ChatbotApiError";
		this.status = status;
	}
}

const DEFAULT_ENDPOINT = "/api/ask";
const STUDY_GUIDE_ENDPOINT = "/api/study-guide-chat";

const buildEndpoints = (): string[] => {
	const configured = typeof import.meta !== "undefined" ? import.meta.env?.VITE_CHATBOT_API_URL : undefined;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
  const safeConfigured = resolveSameOriginApiPath(configured, DEFAULT_ENDPOINT, currentOrigin);
	return Array.from(new Set([DEFAULT_ENDPOINT, safeConfigured]));
};

const parseJsonSafe = async (response: Response): Promise<ChatbotResponse | null> => {
	const text = await response.text();
	if (!text.trim()) return null;
	try {
		return JSON.parse(text) as ChatbotResponse;
	} catch {
		return { error: `The chatbot service returned an invalid response (status ${response.status}).` };
	}
};

export const fetchChatbotAnswer = async (
  questionOrRequest: string | ChatbotRequest,
): Promise<ChatbotResponse> => {
  const request: ChatbotRequest =
    typeof questionOrRequest === "string"
      ? { question: questionOrRequest }
      : questionOrRequest;

  const isStudyGuideChat = request.context?.page === "study-guides";

  const payload = JSON.stringify({
    question: request.question,
    history: request.history?.slice(-10),
    context: request.context,
    sources: request.sources?.slice(0, 20),
    mode: request.mode,
    learningMode: request.learningMode,
  });

	const endpoints = isStudyGuideChat ? [STUDY_GUIDE_ENDPOINT] : buildEndpoints();
	const operationId = crypto.randomUUID();
	let lastError: unknown = null;

	for (const endpoint of endpoints) {
			const response = await authFetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json", "Idempotency-Key": operationId },
				body: payload,
        signal: request.signal,
			});

			const data = await parseJsonSafe(response);
			// Only a missing route is safe to try elsewhere automatically. A
			// timeout, quota response or malformed success may follow paid work.
			if (response.status === 404 || response.status === 405) {
				lastError = new ChatbotApiError('The chatbot route is unavailable.', response.status);
				continue;
			}
			if (!data) {
				throw new Error('The chatbot service returned an empty response.');
			}

			if (!response.ok) {
				const message =
					(typeof data.error === "string" && data.error.trim())
						? data.error
						: `Request failed with status ${response.status}`;
				throw new ChatbotApiError(message, response.status);
			}

			if (typeof data.error === "string" && data.error.trim()) {
				throw new ChatbotApiError(data.error, response.status);
			}

			return data;
	}

	throw lastError ?? new Error("Unable to reach chatbot API");
};
