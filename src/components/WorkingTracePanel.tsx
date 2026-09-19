import { useState } from 'react';
import { CheckCircle2, CircleHelp, RotateCcw, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';
import { checkWorkingTrace, checkDimensions } from '@/lib/workingTrace.mjs';
import { useAuth } from '@/contexts/AuthContext';
import { userContentStorageKeys, getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';

const EXAMPLES = [
  { name: 'Balance an equation', value: '2(x + 3) = 14\n2x + 3 = 14\n2x = 11\nx = 5.5' },
  { name: 'Expand brackets', value: '(x + 1)^2\nx^2 + 1' },
  { name: 'Check a correct method', value: '3x + 6 = 18\n3x = 12\nx = 4' },
];

export default function WorkingTracePanel() {
  const { user } = useAuth();
  return <TraceEditor key={user?.id ?? 'example'} accountId={user?.id} />;
}

function TraceEditor({ accountId }: { accountId?: string }) {
  const [working, setWorking] = useState(EXAMPLES[0].value);
  const [result, setResult] = useState<ReturnType<typeof checkWorkingTrace> | null>(null);
  const [unitLeft, setUnitLeft] = useState('N');
  const [unitRight, setUnitRight] = useState('kg*m/s^2');
  const [unitResult, setUnitResult] = useState<ReturnType<typeof checkDimensions> | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [confidence, setConfidence] = useState('unsure');
  const key = accountId ? userContentStorageKeys(accountId).workingTraceEvidence : null;
  const save = () => {
    if (!key || !result || getUserContentStorageScope() !== accountId) return;
    try {
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
      if (!Array.isArray(existing) || existing.some(item => !item || typeof item.recordedAt !== 'string' || !Number.isFinite(Date.parse(item.recordedAt)) || typeof item.retryAt !== 'string' || !Number.isFinite(Date.parse(item.retryAt)) || typeof item.confidence !== 'string' || typeof item.complete !== 'boolean' || !Array.isArray(item.steps))) throw new Error('invalid');
      const record = { version: result.version, curriculum: null, subject: 'Mathematics', hintUsage: 0, topic: 'Algebra', objective: 'Preserve equivalence between steps', source: 'deterministic-verifier', recordedAt: new Date().toISOString(), confidence, steps: result.steps, complete: result.complete, retryAt: new Date(Date.now() + 86400000).toISOString() };
      localStorage.setItem(key, JSON.stringify([...existing.slice(-49), record]));
      setSaveMessage('Saved on this device for your account. Retry this objective tomorrow.');
    } catch { setSaveMessage('Could not save. Existing device data has been preserved.'); }
  };
  return <div className="working-trace">
    <div className="trace-editor">
      <div className="trace-caption"><span>Working Trace / Algebra</span><span>Runs on your device</span></div>
      <label htmlFor="trace-example">Start with an example</label>
      <select id="trace-example" onChange={e => { setWorking(EXAMPLES[Number(e.target.value)].value); setResult(null); setSaveMessage(''); }} defaultValue="0">
        {EXAMPLES.map((example, i) => <option value={i} key={example.name}>{example.name}</option>)}
      </select>
      <label htmlFor="trace-working">Your working, one step per line</label>
      <textarea id="trace-working" value={working} maxLength={4800} rows={6} spellCheck={false} onChange={e => { setWorking(e.target.value); setResult(null); setSaveMessage(''); }} aria-describedby="trace-scope" />
      <p id="trace-scope" className="trace-note">Polynomial expressions and linear equations in one variable. Use ^ for powers and / for constant fractions. The starting line is yours to check against the question.</p>
      <button type="button" className="trace-action" onClick={() => { setResult(checkWorkingTrace(working)); setSaveMessage(''); }}>Check each step <ArrowRight size={18} aria-hidden /></button>
      <details className="trace-units"><summary>Check physics dimensions</summary>
        <p>Compare unit expressions. This checks dimensions, not numbers or conversions.</p>
        <div><label>First units<input value={unitLeft} onChange={e => { setUnitLeft(e.target.value); setUnitResult(null); }} maxLength={100} /></label><label>Second units<input value={unitRight} onChange={e => { setUnitRight(e.target.value); setUnitResult(null); }} maxLength={100} /></label></div>
        <button type="button" onClick={() => setUnitResult(checkDimensions(unitLeft, unitRight))}>Compare dimensions</button>
        {unitResult && <p role="status">{unitResult.status === 'verified' ? 'Dimensions agree. ' : unitResult.status === 'incorrect' ? 'Check your units. ' : 'Cannot verify. '}{unitResult.explanation}</p>}
      </details>
    </div>
    <div className="trace-review" aria-live="polite">
      <p className="trace-eyebrow">The next useful step</p>
      {!result ? <><h3>Find where the<br />reasoning changes.</h3><p>Edit the example or paste your own working. Each line is compared with the one before it using exact arithmetic.</p><ol className="trace-instructions"><li>Keep your original attempt.</li><li>Inspect the first changed step.</li><li>Repair it, then check again.</li></ol><p className="trace-note">No AI request, upload or account is needed. Nothing is saved until you choose to save.</p></> : <>
        <h3>{result.complete ? 'Every step agrees.' : result.firstIncorrect ? `Start with line ${result.firstIncorrect}.` : 'Some steps need a closer look.'}</h3>
        <p className="trace-note">{result.message}</p>
        <ol className="trace-results">{result.steps.map(step => <li key={step.line} data-status={step.status}>
          <div>{step.status === 'verified' ? <CheckCircle2 aria-hidden size={18} /> : step.status === 'incorrect' ? <AlertCircle aria-hidden size={18} /> : <CircleHelp aria-hidden size={18} />}<strong>Line {step.line}: {step.status === 'verified' ? 'verified' : step.status === 'incorrect' ? 'check this step' : 'cannot verify'}</strong></div>
          <code>{step.after}</code><p>{step.explanation}</p>
        </li>)}</ol>
        {!result.complete && <Link className="trace-lesson" to="/learn?topic=algebra">View the algebra lesson release <ArrowRight size={16} aria-hidden /></Link>}
        {key && result.steps.length > 0 && <div className="trace-save"><label htmlFor="trace-confidence">How confident did you feel?</label><select id="trace-confidence" value={confidence} onChange={e => setConfidence(e.target.value)}><option value="unsure">Unsure</option><option value="fairly-sure">Fairly sure</option><option value="confident">Confident</option></select><p className="trace-note">Your confidence is stored separately from the verified result. This device keeps your latest 50 attempts; saving another replaces the oldest.</p><button type="button" onClick={save}>Save this attempt and retry tomorrow</button><Link to="/learning-evidence">View or clear my device evidence</Link></div>}
        {saveMessage && <p role="status">{saveMessage}</p>}
        <button type="button" className="trace-reset" onClick={() => { setResult(null); setSaveMessage(''); document.getElementById('trace-working')?.focus(); }}><RotateCcw size={16} aria-hidden /> Return to your working</button>
      </>}
    </div>
  </div>;
}
