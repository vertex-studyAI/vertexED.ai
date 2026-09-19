import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { fetchChatbotAnswer } from '@/lib/chatbotApi';
import { cubicLesson, learningPanelPrompt, parseLearningPanels } from '@/lib/learningPanels.mjs';
import LearningPanels, { type LearningWorkspace } from './LearningPanels';

export default function ApexCommandBar() {
  const { user } = useAuth();
  return <AccountCommands key={user?.id ?? 'guest'} />;
}
function AccountCommands() {
  const { user, loginWithGoogle } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [level, setLevel] = useState('Build the foundations');
  const [workspace, setWorkspace] = useState<LearningWorkspace | null>(null);
  const [sample, setSample] = useState(false);
  const [status, setStatus] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [busy, setBusy] = useState(false);
  const [google, setGoogle] = useState(false);
  const [target, setTarget] = useState<{ to: string; label: string } | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const submit = async () => {
    if (!prompt.trim() || busy) return;
    setStatus(''); setCanRetry(false); setGoogle(false); setTarget(null);
    if (/\b(google|log\s?in|sign\s?in)\b/i.test(prompt)) {
      setGoogle(!user); setStatus(user ? 'You are already signed in. Submit your study request separately.' : 'Continue with Google below. After sign-in, reopen Apex to prepare your notes. No study action has run yet.'); return;
    }
    const routes = [{ match: /\b(open|go to|show)\b.*\b(notes|notebook)\b/i, to: '/study-notebook', label: 'Open notebook' }, { match: /\b(open|go to|show)\b.*\b(planner|plan)\b/i, to: '/planner', label: 'Open planner' }, { match: /\b(open|go to|show)\b.*\b(desmos|graph|focus)\b/i, to: '/study-zone', label: 'Open Study Zone' }];
    const route = routes.find(item => item.match.test(prompt));
    if (route) { setTarget(route); setStatus('Ready to open the selected tool. No saved work will be changed.'); return; }
    if (!user) { setStatus('Sign in to generate personalised cards. You can explore the sample lesson below without an account.'); setGoogle(true); return; }
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setBusy(true);
    try {
      const result = await fetchChatbotAnswer({ question: learningPanelPrompt(prompt.trim(), level), signal: controller.signal });
      if (controller.signal.aborted) return;
      const parsed = parseLearningPanels(result.answer);
      if (!parsed) throw new Error('The response could not be organised into study cards. Your prompt is preserved. Try again or use the full tutor.');
      setWorkspace(parsed); setSample(false);
    } catch (error) {
      if (!controller.signal.aborted) {
        setStatus(error instanceof Error ? error.message : 'Could not prepare your cards. Try again.');
        setCanRetry(true);
      }
    }
    finally { if (!controller.signal.aborted) setBusy(false); }
  };
  return <div className="apex-command">
    <form onSubmit={event => { event.preventDefault(); void submit(); }}>
      <label htmlFor="apex-command-input">What are we working on?</label>
      <textarea id="apex-command-input" rows={2} maxLength={2000} value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Teach me cubic factorisation with examples and practice cards" />
      <div className="apex-command-actions"><label>Learning depth<select value={level} onChange={event => setLevel(event.target.value)}><option>Build the foundations</option><option>Practise exam technique</option><option>Explore a harder application</option></select></label><button type="submit" className="btn-solid" disabled={busy || !prompt.trim()}>{busy ? 'Preparing…' : 'Ask Apex'}</button></div>
    </form>
    {busy && <button type="button" className="underline text-sm" onClick={() => { request.current?.abort(); setBusy(false); setStatus('Stopped. Your prompt is still here.'); }}>Stop generation</button>}
    <p className="apex-command-scope">Prepare learning cards or open your notebook, planner and graphing tools. Account changes always need your confirmation.</p>
    <button type="button" className="apex-sample-button" disabled={busy} onClick={() => { setWorkspace(cubicLesson); setSample(true); }}>Try the cubic factorisation sample ↗</button>
    {status && <p role="status" className="apex-command-status">{status}</p>}
    {canRetry && !busy && <button type="button" className="btn-glass" onClick={() => void submit()}>Retry this request</button>}
    {google && <button type="button" className="btn-glass" disabled={busy} onClick={async () => { setBusy(true); try { await loginWithGoogle(); } catch (error) { setStatus(error instanceof Error ? error.message : 'Google sign-in could not start.'); } finally { setBusy(false); } }}>Continue with Google</button>}
    {target && <Link className="btn-glass" to={target.to}>{target.label} ↗</Link>}
    {workspace && <LearningPanels key={JSON.stringify(workspace)} workspace={workspace} example={sample} />}
  </div>;
}
