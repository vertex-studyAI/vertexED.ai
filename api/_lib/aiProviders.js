const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const DEFAULT_OPENAI_PRIMARY_MODEL = 'ft:gpt-4.1-mini-2025-04-14:verteded:apex-chatbot:CSgJ1mRt';
const DEFAULT_OPENAI_FALLBACK_MODEL = 'gpt-4o-mini';

function normalizeBaseUrl(value, fallback) {
  const raw = typeof value === 'string' && value.trim() ? value.trim() : fallback;
  return raw.replace(/\/+$/, '');
}

function requireValue(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing ${label}`);
  }
  return value.trim();
}

export function resolveChatProvider(env = process.env) {
  const provider = (env.CHATBOT_PROVIDER || 'openai').trim().toLowerCase();

  if (provider === 'openai') {
    return {
      name: 'openai',
      apiKey: requireValue(
        env.OPENAI_API_KEY || env.ChatbotKey || env.CHATBOT_KEY,
        'OpenAI API key env var (OPENAI_API_KEY or ChatbotKey)',
      ),
      baseUrl: normalizeBaseUrl(env.OPENAI_API_BASE, DEFAULT_OPENAI_BASE_URL),
      primaryModel: (env.CHATBOT_MODEL || DEFAULT_OPENAI_PRIMARY_MODEL).trim(),
      fallbackModel: (env.CHATBOT_FALLBACK_MODEL || DEFAULT_OPENAI_FALLBACK_MODEL).trim(),
    };
  }

  if (provider === 'nvidia') {
    return {
      name: 'nvidia',
      apiKey: requireValue(env.NVIDIA_API_KEY, 'NVIDIA_API_KEY'),
      baseUrl: normalizeBaseUrl(env.NVIDIA_API_BASE, DEFAULT_NVIDIA_BASE_URL),
      primaryModel: requireValue(env.NVIDIA_CHATBOT_MODEL, 'NVIDIA_CHATBOT_MODEL'),
      fallbackModel:
        typeof env.NVIDIA_CHATBOT_FALLBACK_MODEL === 'string'
          ? env.NVIDIA_CHATBOT_FALLBACK_MODEL.trim()
          : '',
    };
  }

  throw new Error(`Unsupported CHATBOT_PROVIDER: ${provider}`);
}

export function extractChatAnswer(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim()) return content.trim();

  const refusal = data?.choices?.[0]?.message?.refusal;
  if (typeof refusal === 'string' && refusal.trim()) return refusal.trim();

  const text = data?.choices?.[0]?.text;
  if (typeof text === 'string' && text.trim()) return text.trim();

  const outputText = data?.output_text;
  if (typeof outputText === 'string' && outputText.trim()) return outputText.trim();

  const responseText = data?.output?.[0]?.content?.[0]?.text;
  if (typeof responseText === 'string' && responseText.trim()) return responseText.trim();

  return null;
}

export async function callChatProvider({
  config,
  model,
  messages,
  temperature = 0.4,
  maxTokens = 1200,
  fetchImpl = fetch,
}) {
  if (!config?.baseUrl || !config?.apiKey || !config?.name) {
    throw new Error('Invalid chat provider configuration');
  }

  const payload = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  return {
    response,
    raw,
    model,
    provider: config.name,
  };
}
