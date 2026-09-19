import { ProviderTimeoutError, fetchWithTimeout } from './fetchWithTimeout.js';

const MAX_PROJECT_AGENTS = 500;
const MAX_PROJECT_AGENT_PAGES = 20;
const MAX_PROJECT_AGENT_PAGE_SIZE = 100;
const MAX_PROJECT_AGENT_TOTAL_TIMEOUT_MS = 30_000;
const MAX_PROJECT_AGENT_RESPONSE_BYTES = 4 * 1024 * 1024;
const MAX_PROJECT_AGENT_CURSOR_LENGTH = 256;
const MAX_AGENT_NAME_LENGTH = 120;
const MAX_AGENT_MODEL_LENGTH = 120;
const MAX_AGENT_TOOL_TYPES = 32;
const MAX_AGENT_TOOL_TYPE_LENGTH = 64;
const AGENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/;

function boundedText(value, maximum, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const text = value.trim();
  return text ? text.slice(0, maximum) : fallback;
}

function publicAgent(agent) {
  const tools = Array.isArray(agent?.tools)
    ? Array.from(
        new Set(
          agent.tools
            .map((tool) => boundedText(tool?.type, MAX_AGENT_TOOL_TYPE_LENGTH))
            .filter(Boolean),
        ),
      ).slice(0, MAX_AGENT_TOOL_TYPES)
    : [];

  return {
    id: String(agent?.id || '').trim(),
    name: boundedText(agent?.name, MAX_AGENT_NAME_LENGTH, 'Unnamed agent'),
    model: boundedText(agent?.model, MAX_AGENT_MODEL_LENGTH),
    toolTypes: tools,
    updatedAt: Number.isInteger(agent?.updated_at) && agent.updated_at >= 0 ? agent.updated_at : null,
  };
}

function oversizedProviderResponse() {
  return new Error('OpenAI project agents returned an oversized response');
}

function declaredContentLength(response) {
  const value = response?.headers?.get?.('content-length');
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function cancelWithoutBlocking(cancel) {
  if (typeof cancel !== 'function') return;
  try {
    Promise.resolve(cancel()).catch(() => {});
  } catch {
    // Cancellation is best-effort cleanup; it must never replace the bounded
    // provider error or delay the request deadline.
  }
}

async function withBodyDeadline(task, timeoutMs, timeoutLabelMs, onTimeout) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      cancelWithoutBlocking(onTimeout);
      reject(new ProviderTimeoutError(timeoutLabelMs));
    }, timeoutMs);
  });
  try {
    return await Promise.race([task, timeout]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readBoundedProviderBody(response, timeoutMs, timeoutLabelMs) {
  const declaredBytes = declaredContentLength(response);
  if (declaredBytes !== null && declaredBytes > MAX_PROJECT_AGENT_RESPONSE_BYTES) {
    throw oversizedProviderResponse();
  }

  const reader = response?.body?.getReader?.();
  if (reader) {
    const decoder = new TextDecoder();
    let totalBytes = 0;
    let raw = '';
    const readStream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = value instanceof Uint8Array ? value : new Uint8Array(value ?? []);
        totalBytes += chunk.byteLength;
        if (totalBytes > MAX_PROJECT_AGENT_RESPONSE_BYTES) {
          cancelWithoutBlocking(() => reader.cancel?.());
          throw oversizedProviderResponse();
        }
        raw += decoder.decode(chunk, { stream: true });
      }
      raw += decoder.decode();
      return raw;
    };
    try {
      return await withBodyDeadline(readStream(), timeoutMs, timeoutLabelMs, () => reader.cancel?.());
    } finally {
      try {
        reader.releaseLock?.();
      } catch {
        // A timed-out custom stream may keep an internal read pending even after
        // best-effort cancel. Preserve the timeout as the authoritative error.
      }
    }
  }

  // Test doubles and older fetch implementations may expose text() without a
  // readable stream. Native fetch takes the streaming path above. Keep the
  // caller bounded in either case even when the fallback body source stalls.
  const raw = await withBodyDeadline(response.text(), timeoutMs, timeoutLabelMs);
  if (new TextEncoder().encode(raw).byteLength > MAX_PROJECT_AGENT_RESPONSE_BYTES) {
    throw oversizedProviderResponse();
  }
  return raw;
}

function validProviderCursor(value) {
  return typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_PROJECT_AGENT_CURSOR_LENGTH &&
    !CONTROL_CHARACTER_PATTERN.test(value);
}

export function isOpenAiAgentId(value) {
  return typeof value === 'string' && AGENT_ID_PATTERN.test(value.trim());
}

export async function listOpenAiProjectAgents({
  config,
  fetchImpl,
  timeoutMs = 15_000,
  totalTimeoutMs = MAX_PROJECT_AGENT_TOTAL_TIMEOUT_MS,
  maxAgents = MAX_PROJECT_AGENTS,
  maxPages = MAX_PROJECT_AGENT_PAGES,
  now = () => performance.now(),
}) {
  if (!config?.baseUrl || !config?.apiKey) {
    throw new Error('Invalid OpenAI project configuration');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) {
    throw new Error('Invalid OpenAI project request timeout');
  }
  if (!Number.isInteger(totalTimeoutMs) || totalTimeoutMs < 1 || totalTimeoutMs > MAX_PROJECT_AGENT_TOTAL_TIMEOUT_MS) {
    throw new Error('Invalid OpenAI project total timeout');
  }
  if (!Number.isInteger(maxAgents) || maxAgents < 1 || maxAgents > MAX_PROJECT_AGENTS) {
    throw new Error('Invalid OpenAI project agent limit');
  }
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > MAX_PROJECT_AGENT_PAGES) {
    throw new Error('Invalid OpenAI project pagination limit');
  }
  if (typeof now !== 'function') {
    throw new Error('Invalid OpenAI project clock');
  }

  const startedAt = now();
  const agents = [];
  const seenAgentIds = new Set();
  let after = '';
  let pagesFetched = 0;

  while (agents.length < maxAgents && pagesFetched < maxPages) {
    const elapsedMs = Math.max(0, now() - startedAt);
    const remainingMs = totalTimeoutMs - elapsedMs;
    if (remainingMs <= 0) {
      throw new ProviderTimeoutError(totalTimeoutMs);
    }

    pagesFetched += 1;
    const requestedLimit = Math.min(MAX_PROJECT_AGENT_PAGE_SIZE, maxAgents - agents.length);
    const url = new URL(`${config.baseUrl}/agents`);
    url.searchParams.set('limit', String(requestedLimit));
    url.searchParams.set('order', 'asc');
    if (after) url.searchParams.set('after', after);

    const requestTimeoutMs = Math.min(timeoutMs, remainingMs);
    const executeFetch = fetchImpl || ((requestUrl, options) => fetchWithTimeout(requestUrl, options, requestTimeoutMs));
    const response = await executeFetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = new Error('OpenAI project agents could not be listed');
      error.status = response.status;
      throw error;
    }

    const elapsedAfterHeadersMs = Math.max(0, now() - startedAt);
    const remainingBodyMs = totalTimeoutMs - elapsedAfterHeadersMs;
    if (remainingBodyMs <= 0) {
      cancelWithoutBlocking(() => response.body?.cancel?.());
      throw new ProviderTimeoutError(totalTimeoutMs);
    }

    const raw = await readBoundedProviderBody(response, remainingBodyMs, totalTimeoutMs);
    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !Array.isArray(payload.data)) {
      throw new Error('OpenAI project agents returned an invalid response');
    }

    const rawPage = payload.data;
    if (rawPage.length > requestedLimit) {
      throw new Error('OpenAI project agents returned an oversized page');
    }

    for (const rawAgent of rawPage) {
      if (!isOpenAiAgentId(rawAgent?.id)) continue;
      const agent = publicAgent(rawAgent);
      if (seenAgentIds.has(agent.id)) continue;
      seenAgentIds.add(agent.id);
      agents.push(agent);
      if (agents.length >= maxAgents) break;
    }

    if (!payload.has_more || rawPage.length === 0) break;
    const lastId = payload.last_id;
    if (!validProviderCursor(lastId)) {
      throw new Error('OpenAI project agents returned an invalid pagination cursor');
    }
    if (lastId === after) break;
    after = lastId;
  }

  return agents.slice(0, maxAgents);
}
