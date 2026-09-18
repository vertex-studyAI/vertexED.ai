import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeAgentNetwork } from '../src/lib/agentNetworkContract.mjs';

const valid = {
  builtIn: [{ id: 'apexTutor', name: 'Apex Tutor', capability: 'chatbot' }],
  account: {
    status: 'connected',
    projectRouting: 'explicit-project',
    agents: [{ id: 'agent_apex', name: 'Apex', model: 'gpt-test', toolTypes: ['function', 'function'], updatedAt: 123 }],
  },
};

test('agent network accepts bounded public metadata and removes duplicate tool labels', () => {
  assert.deepEqual(normalizeAgentNetwork(valid), {
    ...valid,
    account: {
      ...valid.account,
      agents: [{ ...valid.account.agents[0], toolTypes: ['function'] }],
    },
  });
});

test('agent network rejects malformed, duplicate and contradictory payloads', () => {
  assert.equal(normalizeAgentNetwork(null), null);
  assert.equal(normalizeAgentNetwork({ ...valid, builtIn: [{ ...valid.builtIn[0], id: '../private' }] }), null);
  assert.equal(normalizeAgentNetwork({ ...valid, builtIn: [...valid.builtIn, valid.builtIn[0]] }), null);
  assert.equal(normalizeAgentNetwork({ ...valid, account: { ...valid.account, status: 'unavailable' } }), null);
  assert.equal(normalizeAgentNetwork({ ...valid, account: { ...valid.account, agents: [{ ...valid.account.agents[0], toolTypes: 'function' }] } }), null);
});

test('agent network never retains server-only instructions or metadata', () => {
  const result = normalizeAgentNetwork({
    ...valid,
    builtIn: [{ ...valid.builtIn[0], instructions: 'private' }],
    account: { ...valid.account, agents: [{ ...valid.account.agents[0], instructions: 'private', metadata: { secret: 'value' } }] },
  });
  assert.equal('instructions' in result.builtIn[0], false);
  assert.equal('instructions' in result.account.agents[0], false);
  assert.equal('metadata' in result.account.agents[0], false);
});
