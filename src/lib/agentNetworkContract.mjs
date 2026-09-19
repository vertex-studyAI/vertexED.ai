const ACCOUNT_STATUSES = new Set(['connected', 'not-configured', 'unavailable']);
const PROJECT_ROUTING = new Set(['explicit-project', 'key-default', 'unknown']);
const MAX_BUILT_IN_AGENTS = 32;
const MAX_ACCOUNT_AGENTS = 500;
const AGENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function cleanText(value, maximum) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text && text.length <= maximum ? text : null;
}

function normalizeBuiltIn(value) {
  if (!Array.isArray(value) || value.length > MAX_BUILT_IN_AGENTS) return null;
  const seen = new Set();
  const agents = [];
  for (const item of value) {
    const id = cleanText(item?.id, 64);
    const name = cleanText(item?.name, 120);
    const capability = cleanText(item?.capability, 64);
    if (!id || !AGENT_ID_PATTERN.test(id) || !name || !capability || seen.has(id)) return null;
    seen.add(id);
    agents.push({ id, name, capability });
  }
  return agents;
}

function normalizeAccountAgents(value) {
  if (!Array.isArray(value) || value.length > MAX_ACCOUNT_AGENTS) return null;
  const seen = new Set();
  const agents = [];
  for (const item of value) {
    const id = cleanText(item?.id, 64);
    const name = cleanText(item?.name, 120);
    const model = cleanText(item?.model, 120) ?? '';
    if (!id || !AGENT_ID_PATTERN.test(id) || !name || seen.has(id) || !Array.isArray(item?.toolTypes)) return null;
    const toolTypes = Array.from(new Set(item.toolTypes.map((tool) => cleanText(tool, 64)).filter(Boolean))).slice(0, 32);
    const updatedAt = item?.updatedAt === null || item?.updatedAt === undefined
      ? null
      : Number.isInteger(item.updatedAt) && item.updatedAt >= 0
        ? item.updatedAt
        : null;
    seen.add(id);
    agents.push({ id, name, model, toolTypes, updatedAt });
  }
  return agents;
}

export function normalizeAgentNetwork(value) {
  const builtIn = normalizeBuiltIn(value?.builtIn);
  const status = value?.account?.status;
  const projectRouting = value?.account?.projectRouting;
  const agents = normalizeAccountAgents(value?.account?.agents);
  if (!builtIn || !ACCOUNT_STATUSES.has(status) || !PROJECT_ROUTING.has(projectRouting) || !agents) return null;
  if (status !== 'connected' && agents.length) return null;
  return { builtIn, account: { status, projectRouting, agents } };
}
