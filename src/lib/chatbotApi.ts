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
}

interface ChatbotResponse {
	answer?: string;
	error?: string;
	[key: string]: unknown;
}

const DEFAULT_ENDPOINT = "/api/ask";
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
	try {
		return await response.json();
	} catch (error) {
		console.warn("Failed to parse chatbot response JSON", error);
		return null;
	}
};

export const fetchChatbotAnswer = async (
  questionOrRequest: string | ChatbotRequest,
): Promise<ChatbotResponse> => {
  const request: ChatbotRequest =
    typeof questionOrRequest === "string"
      ? { question: questionOrRequest }
      : questionOrRequest;

  const payload = JSON.stringify({
    question: request.question,
    history: request.history?.slice(-10),
    context: request.context,
    sources: request.sources?.slice(0, 20),
  });

	const endpoints = buildEndpoints();
	let lastError: unknown = null;

	for (const endpoint of endpoints) {
		try {
			const response = await authFetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: payload,
			});

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
