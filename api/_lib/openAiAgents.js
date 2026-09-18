import { fetchWithTimeout } from './fetchWithTimeout.js';

const MAX_PROJECT_AGENTS = 500;
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
  maxAgents = MAX_PROJECT_AGENTS,
}) {
  if (!config?.baseUrl || !config?.apiKey) {
    throw new Error('Invalid OpenAI project configuration');
  }

  const executeFetch = fetchImpl || ((url, options) => fetchWithTimeout(url, options, timeoutMs));
  const agents = [];
  let after = '';

  while (agents.length < maxAgents) {
    const url = new URL(`${config.baseUrl}/agents`);
    url.searchParams.set('limit', String(Math.min(100, maxAgents - agents.length)));
    url.searchParams.set('order', 'asc');
    if (after) url.searchParams.set('after', after);

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

    const page = Array.isArray(payload?.data)
      ? payload.data.filter((agent) => isOpenAiAgentId(agent?.id)).map(publicAgent)
      : [];
    agents.push(...page);

    const lastId = typeof payload?.last_id === 'string' ? payload.last_id : '';
    if (!payload?.has_more || !lastId || lastId === after || page.length === 0) break;
    after = lastId;
  }

  return agents.slice(0, maxAgents);
}
