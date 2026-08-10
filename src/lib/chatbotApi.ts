import { authFetch } from '@/lib/apiAuth';
import type { StudyPageContext } from '@/lib/studyContext';
import type { GroundedSourcePayload } from '@/lib/notebook';

export interface ChatbotMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatbotRequest {
  question: string;
  history?: ChatbotMessage[];
  context?: StudyPageContext;
  sources?: GroundedSourcePayload[];
  signal?: AbortSignal;
}

interface ChatbotResponse {
	answer?: string;
	error?: string;
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
const FALLBACK_ENDPOINT = "https://www.vertexed.app/api/ask";

const buildEndpoints = (): string[] => {
	const endpoints = [DEFAULT_ENDPOINT];
	const configuredFallback = typeof import.meta !== "undefined" ? import.meta.env?.VITE_CHATBOT_API_URL : undefined;
	if (configuredFallback) {
		endpoints.push(configuredFallback);
	}
	return Array.from(new Set(endpoints.filter(Boolean)));
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
  });

	const endpoints = isStudyGuideChat ? [STUDY_GUIDE_ENDPOINT] : buildEndpoints();
	let lastError: unknown = null;

	for (const endpoint of endpoints) {
		try {
			const response = await authFetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: payload,
        signal: request.signal,
			});

			const data = await parseJsonSafe(response);
			if (!data) {
				lastError = new Error(`Empty response from ${endpoint}`);
				continue;
			}

			if (!response.ok) {
				const message =
					(typeof data.error === "string" && data.error.trim())
						? data.error
						: `Request failed with status ${response.status}`;
				lastError = new ChatbotApiError(message, response.status);
				continue;
			}

			if (typeof data.error === "string" && data.error.trim()) {
				lastError = new ChatbotApiError(data.error, response.status);
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
