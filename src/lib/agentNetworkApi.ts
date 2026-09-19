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

export async function fetchAgentNetwork(signal?: AbortSignal): Promise<AgentNetwork> {
  const response = await authFetch('/api/agents', { method: 'GET', signal });
  const payload = await response.json().catch(() => null);
  const network = normalizeAgentNetwork(payload) as AgentNetwork | null;
  if (!response.ok || !network) throw new Error('The agent directory is temporarily unavailable.');
  return network;
}
