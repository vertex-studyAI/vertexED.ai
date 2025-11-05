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
	} else if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
		endpoints.push(FALLBACK_ENDPOINT);
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

export const fetchChatbotAnswer = async (question: string): Promise<ChatbotResponse> => {
	const payload = JSON.stringify({ question });
	const headers = { "Content-Type": "application/json" } as const;
	const endpoints = buildEndpoints();
	let lastError: unknown = null;

	for (const endpoint of endpoints) {
		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers,
				body: payload,
			});

			const data = await parseJsonSafe(response);
			if (!data) {
				lastError = new Error(`Empty response from ${endpoint}`);
				continue;
			}

			if (!response.ok && !data.error) {
				lastError = new Error(`Request failed with status ${response.status}`);
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
