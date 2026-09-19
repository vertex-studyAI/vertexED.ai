import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeAgentNetwork } from '../src/lib/agentNetworkContract.mjs';

const authenticatedCatalog = {
  builtIn: [
    { id: 'apexTutor', name: 'Apex Tutor', capability: 'chatbot' },
    { id: 'plannerCoach', name: 'Planner Coach', capability: 'planner' },
    { id: 'notesArchitect', name: 'Notes Architect', capability: 'notes' },
    { id: 'quizBuilder', name: 'Quiz Builder', capability: 'quiz' },
    { id: 'answerReviewer', name: 'Answer Reviewer', capability: 'grading' },
    { id: 'paperDesigner', name: 'Paper Designer', capability: 'paper-generator' },
    { id: 'notebookResearcher', name: 'Notebook Researcher', capability: 'notebook' },
    { id: 'guideTutor', name: 'Study Guide Tutor', capability: 'study-guide-chat' },
  ],
  account: {
    status: 'connected',
    projectRouting: 'key-default',
    agents: [{ id: 'acct-1', name: 'Custom Tutor', model: 'gpt-test', toolTypes: ['file_search', 'file_search'], updatedAt: 1 }],
  },
};

test('authenticated agents catalog normalizes built-in roles and account agents without private fields', () => {
  const network = normalizeAgentNetwork({
    ...authenticatedCatalog,
    builtIn: authenticatedCatalog.builtIn.map((agent) => ({ ...agent, instructions: 'private' })),
    account: {
      ...authenticatedCatalog.account,
      agents: authenticatedCatalog.account.agents.map((agent) => ({
        ...agent,
        instructions: 'private',
        metadata: { secret: 'value' },
      })),
    },
  });

  assert.ok(network);
  assert.ok(network.builtIn.length >= 8);
  for (const agent of network.builtIn) {
    assert.equal('instructions' in agent, false);
    assert.equal('system' in agent, false);
    assert.equal('prompt' in agent, false);
  }
  assert.equal(network.account.status, 'connected');
  assert.equal(network.account.agents[0]?.id, 'acct-1');
  assert.equal(network.account.agents[0]?.name, 'Custom Tutor');
  assert.deepEqual(network.account.agents[0]?.toolTypes, ['file_search']);
  assert.equal('instructions' in network.account.agents[0], false);
  assert.equal('metadata' in network.account.agents[0], false);
});
