import { useEffect, useState } from 'react';
import { Bot, BrainCircuit, Cloud, RefreshCw, ShieldCheck } from 'lucide-react';
import { fetchAgentNetwork, type AgentNetwork } from '@/lib/agentNetworkApi';
import { agentNetworkError } from '@/lib/agentNetworkError.mjs';
import '@/styles/vee.css';

const CAPABILITY_LABELS: Record<string, string> = {
  chatbot: 'Discussion-first tutoring',
  planner: 'Study planning',
  notes: 'Notes architecture',
  quiz: 'Quiz generation',
  grading: 'Formative answer review',
  'paper-generator': 'Original practice papers',
  notebook: 'Source-bound notebook research',
  'study-guide-chat': 'Study guide tutoring',
  'board-resource': 'Board resource drafting',
  transcription: 'Learning transcription',
};

export default function AgentNetworkPanel() {
  const [network, setNetwork] = useState<AgentNetwork | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setNetwork(null);
    setError('');
    void fetchAgentNetwork(controller.signal)
      .then((result) => setNetwork(result))
      .catch((reason) => {
        if (controller.signal.aborted) return;
        setError(agentNetworkError(reason));
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="agent-network" aria-live="polite" aria-busy={!network && !error}>
      <section className="agent-network-intro">
        <div className="agent-network-icon"><BrainCircuit aria-hidden="true" /></div>
        <div>
          <p className="agent-network-kicker">VertexED agent network</p>
          <h2>One study flow, specialised roles.</h2>
          <p>Apex routes work to bounded study roles. Account agents are read from the server-side OpenAI project and never expose the project key in your browser.</p>
        </div>
      </section>

      {!network && !error && <p className="agent-network-status" role="status">Checking the linked project…</p>}
      {error && <div className="agent-network-status" role="alert">
        <p>{error} The built-in study roles remain available through their tools.</p>
        <button
          type="button"
          className="neu-button mt-3 inline-flex min-h-11 items-center gap-2 px-4 py-2"
          onClick={() => setAttempt((value) => value + 1)}
          aria-label="Retry loading the agent network directory"
        >
          <RefreshCw aria-hidden="true" /> Try again
        </button>
      </div>}

      {network && (
        <>
          <section aria-labelledby="built-in-agents-title">
            <div className="agent-network-heading">
              <div>
                <p className="agent-network-kicker">Active in VertexED</p>
                <h3 id="built-in-agents-title">Built-in study roles</h3>
              </div>
              <span><ShieldCheck aria-hidden="true" /> {network.builtIn.length} bounded roles</span>
            </div>
            <div className="agent-network-grid">
              {network.builtIn.map((agent) => (
                <article key={agent.id}>
                  <Bot aria-hidden="true" />
                  <div>
                    <h4>{agent.name}</h4>
                    <p>{CAPABILITY_LABELS[agent.capability] || agent.capability}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="account-agents-title">
            <div className="agent-network-heading">
              <div>
                <p className="agent-network-kicker">Linked OpenAI project</p>
                <h3 id="account-agents-title">Reusable account agents</h3>
              </div>
              <span><Cloud aria-hidden="true" /> {network.account.agents.length} found</span>
            </div>
            {network.account.status !== 'connected' ? (
              <p className="agent-network-status">Account sync is {network.account.status === 'not-configured' ? 'waiting for a server API key' : 'temporarily unavailable'}.</p>
            ) : network.account.agents.length === 0 ? (
              <p className="agent-network-status">No reusable agents exist in the linked project yet. VertexED’s built-in roles above continue to power the current AI tools.</p>
            ) : (
              <div className="agent-network-grid account">
                {network.account.agents.map((agent) => (
                  <article key={agent.id}>
                    <Cloud aria-hidden="true" />
                    <div>
                      <h4>{agent.name}</h4>
                      <p>{agent.model || 'Project model'}{agent.toolTypes.length ? ` · ${agent.toolTypes.join(', ')}` : ''}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
