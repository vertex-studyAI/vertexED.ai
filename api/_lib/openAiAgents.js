import { ProviderTimeoutError, fetchWithTimeout } from './fetchWithTimeout.js';

const MAX_PROJECT_AGENTS = 500;
const MAX_PROJECT_AGENT_PAGES = 20;
const MAX_PROJECT_AGENT_TOTAL_TIMEOUT_MS = 30_000;
const AGENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function publicAgent(agent) {
  const tools = Array.isArray(agent?.tools)
    ? Array.from(
        new Set(
          agent.tools
            .map((tool) => String(tool?.type || '').trim())
            .filter(Boolean),
        ),
      )
    : [];

  return {
    id: String(agent?.id || ''),
    name: typeof agent?.name === 'string' && agent.name.trim() ? agent.name.trim() : 'Unnamed agent',
    model: typeof agent?.model === 'string' ? agent.model.trim() : '',
    toolTypes: tools,
    updatedAt: Number.isFinite(agent?.updated_at) ? agent.updated_at : null,
  };
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
  now = Date.now,
}) {
  if (!config?.baseUrl || !config?.apiKey) {
    throw new Error('Invalid OpenAI project configuration');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) {
    throw new Error('Invalid OpenAI project request timeout');
  }
  if (!Number.isInteger(totalTimeoutMs) || totalTimeoutMs < 1) {
    throw new Error('Invalid OpenAI project total timeout');
  }
  if (!Number.isInteger(maxAgents) || maxAgents < 1 || maxAgents > MAX_PROJECT_AGENTS) {
    throw new Error('Invalid OpenAI project agent limit');
  }
  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new Error('Invalid OpenAI project pagination limit');
  }
  if (typeof now !== 'function') {
    throw new Error('Invalid OpenAI project clock');
  }

  const startedAt = now();
  const agents = [];
  let after = '';
  let pagesFetched = 0;

  while (agents.length < maxAgents && pagesFetched < maxPages) {
    const elapsedMs = Math.max(0, now() - startedAt);
    const remainingMs = totalTimeoutMs - elapsedMs;
    if (remainingMs <= 0) {
      throw new ProviderTimeoutError(totalTimeoutMs);
    }

    pagesFetched += 1;
    const url = new URL(`${config.baseUrl}/agents`);
    url.searchParams.set('limit', String(Math.min(100, maxAgents - agents.length)));
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
    const raw = await response.text();
    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const error = new Error('OpenAI project agents could not be listed');
      error.status = response.status;
      throw error;
    }

    const rawPage = Array.isArray(payload?.data) ? payload.data : [];
    const page = rawPage.filter((agent) => isOpenAiAgentId(agent?.id)).map(publicAgent);
    agents.push(...page);

    const lastId = typeof payload?.last_id === 'string' ? payload.last_id : '';
    if (!payload?.has_more || !lastId || lastId === after || rawPage.length === 0) break;
    after = lastId;
  }

  return agents.slice(0, maxAgents);
}
