import { fetchWithTimeout } from './fetchWithTimeout.js';
import { createHash } from 'node:crypto';

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
export const DEFAULT_OPENAI_PRIMARY_MODEL = 'gpt-5.6-terra';
export const DEFAULT_OPENAI_FALLBACK_MODEL = 'gpt-5.6-luna';

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

export function resolveOpenAiConfig(env = process.env) {
  return {
    name: 'openai',
    apiKey: requireValue(
      env.OPENAI_API_KEY || env.ChatbotKey || env.CHATBOT_KEY,
      'OpenAI API key env var (OPENAI_API_KEY or ChatbotKey)',
    ),
    baseUrl: normalizeBaseUrl(env.OPENAI_API_BASE, DEFAULT_OPENAI_BASE_URL),
    primaryModel: (env.CHATBOT_MODEL || DEFAULT_OPENAI_PRIMARY_MODEL).trim(),
    fallbackModel: (env.CHATBOT_FALLBACK_MODEL || DEFAULT_OPENAI_FALLBACK_MODEL).trim(),
    projectId: typeof env.OPENAI_PROJECT_ID === 'string' ? env.OPENAI_PROJECT_ID.trim() : '',
    organizationId: typeof env.OPENAI_ORGANIZATION_ID === 'string' ? env.OPENAI_ORGANIZATION_ID.trim() : '',
  };
}

export function resolveChatProvider(env = process.env) {
  const provider = (env.CHATBOT_PROVIDER || 'openai').trim().toLowerCase();

  if (provider === 'openai') return resolveOpenAiConfig(env);

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

  if (Array.isArray(data?.output)) {
    const responseText = data.output
      .flatMap((item) => Array.isArray(item?.content) ? item.content : [])
      .map((item) => typeof item?.text === 'string' ? item.text : typeof item?.refusal === 'string' ? item.refusal : '')
      .filter(Boolean)
      .join('\n')
      .trim();
    if (responseText) return responseText;
  }

  return null;
}

export function createSafetyIdentifier(userId) {
  if (typeof userId !== 'string' || !userId.trim()) return undefined;
  return createHash('sha256').update(`vertexed:${userId.trim()}`).digest('hex');
}

function responseInputFromMessages(messages) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const instructions = safeMessages
    .filter((message) => message?.role === 'system' || message?.role === 'developer')
    .map((message) => String(message?.content || '').trim())
    .filter(Boolean)
    .join('\n\n');
  const input = safeMessages
    .filter((message) => message?.role !== 'system' && message?.role !== 'developer')
    .map((message) => ({
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      content: Array.isArray(message?.content)
        ? message.content.map((part) => {
            if (part?.type === 'image_url') {
              const imageUrl = typeof part.image_url === 'string' ? part.image_url : part.image_url?.url;
              return { type: 'input_image', image_url: imageUrl };
            }
            return {
              type: message?.role === 'assistant' ? 'output_text' : 'input_text',
              text: String(part?.text || ''),
            };
          }).filter((part) => part.image_url || part.text)
        : String(message?.content || ''),
    }));
  return { instructions, input };
}

export function createOpenAiHeaders(config, { json = true } = {}) {
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${config.apiKey}`,
    ...(config.projectId ? { 'OpenAI-Project': config.projectId } : {}),
    ...(config.organizationId ? { 'OpenAI-Organization': config.organizationId } : {}),
  };
}

export async function callChatProvider({
  config,
  model,
  messages,
  temperature = 0.4,
  maxTokens = 1200,
  safetyIdentifier,
  jsonSchema,
  schemaName = 'vertexed_response',
  capability = 'chatbot',
  fetchImpl,
  timeoutMs = 30_000,
}) {
  if (!config?.baseUrl || !config?.apiKey || !config?.name) {
    throw new Error('Invalid chat provider configuration');
  }

  const isOpenAi = config.name === 'openai';
  const responseInput = isOpenAi ? responseInputFromMessages(messages) : null;
  const payload = isOpenAi
    ? {
        model,
        input: responseInput.input,
        ...(responseInput.instructions ? { instructions: responseInput.instructions } : {}),
        max_output_tokens: maxTokens,
        store: false,
        ...(safetyIdentifier ? { safety_identifier: safetyIdentifier } : {}),
        metadata: { product: 'vertexed', capability: String(capability).slice(0, 64) },
        ...(jsonSchema ? {
          text: {
            format: {
              type: 'json_schema',
              name: schemaName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64),
              strict: true,
              schema: jsonSchema,
            },
          },
        } : {}),
      }
    : { model, messages, temperature, max_tokens: maxTokens };

  const executeFetch = fetchImpl || ((url, options) => fetchWithTimeout(url, options, timeoutMs));
  const response = await executeFetch(`${config.baseUrl}/${isOpenAi ? 'responses' : 'chat/completions'}`, {
    method: 'POST',
    headers: isOpenAi ? createOpenAiHeaders(config) : {
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
