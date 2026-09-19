import { authFetch } from '@/lib/apiAuth';
import { normalizeAgentNetwork } from '@/lib/agentNetworkContract.mjs';

export type BuiltInAgent = {
  id: string;
  name: string;
  capability: string;
};

export type AccountAgent = {
  id: string;
  name: string;
  model: string;
  toolTypes: string[];
  updatedAt: number | null;
};

export type AgentNetwork = {
  builtIn: BuiltInAgent[];
  account: {
    status: 'connected' | 'not-configured' | 'unavailable';
    projectRouting: 'explicit-project' | 'key-default' | 'unknown';
    agents: AccountAgent[];
  };
};

export class AgentNetworkRequestError extends Error {
  readonly status: number;
  readonly retryAfterSec: number | null;

  constructor(message: string, status: number, retryAfterSec: number | null = null) {
    super(message);
    this.name = 'AgentNetworkRequestError';
    this.status = status;
    this.retryAfterSec = retryAfterSec;
  }
}

function readRetryAfterSec(response: Response, payload: unknown): number | null {
  const header = response.headers.get('retry-after');
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  }
  if (payload && typeof payload === 'object' && 'retryAfter' in payload) {
    const value = Number((payload as { retryAfter?: unknown }).retryAfter);
    if (Number.isFinite(value) && value >= 0) return Math.ceil(value);
  }
  return null;
}

export async function fetchAgentNetwork(signal?: AbortSignal): Promise<AgentNetwork> {
  const response = await authFetch('/api/agents', { method: 'GET', signal });
  const payload = await response.json().catch(() => null);
  const network = normalizeAgentNetwork(payload) as AgentNetwork | null;

  if (response.status === 429) {
    const retryAfterSec = readRetryAfterSec(response, payload);
    const message = retryAfterSec != null
      ? `Rate limit exceeded. Try again in ${retryAfterSec}s.`
      : 'Rate limit exceeded. Try again shortly.';
    throw new AgentNetworkRequestError(message, 429, retryAfterSec);
  }

  if (response.status === 401) {
    throw new AgentNetworkRequestError('Sign in to view the agent network directory.', 401);
  }

  if (!response.ok || !network) {
    throw new AgentNetworkRequestError('The agent directory is temporarily unavailable.', response.status || 0);
  }

  return network;
}
