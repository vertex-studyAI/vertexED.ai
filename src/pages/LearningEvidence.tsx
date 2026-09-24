import { useState } from 'react';
import { Link } from 'react-router';
import PageSection from '@/components/PageSection';
import { useAuth } from '@/contexts/AuthContext';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

type Attempt = { recordedAt: string; confidence: string; complete: boolean; retryAt: string; steps: {status:string;category:string|null}[] };
function readAttempts(key: string | null): { attempts: Attempt[]; error: string } {
  try {
    const items: unknown = key ? JSON.parse(localStorage.getItem(key) ?? '[]') : [];
    if (!Array.isArray(items) || items.some(item => !item || typeof item.recordedAt !== 'string' || !Number.isFinite(Date.parse(item.recordedAt)) || typeof item.retryAt !== 'string' || !Number.isFinite(Date.parse(item.retryAt)) || typeof item.confidence !== 'string' || typeof item.complete !== 'boolean' || !Array.isArray(item.steps))) throw new Error('Invalid saved evidence');
    return { attempts: items, error: '' };
  } catch {
    return { attempts: [], error: 'Saved evidence could not be read. It has not been overwritten or removed. Export your account data before trying recovery.' };
  }
}
export default function LearningEvidence() {
  const { user } = useAuth();
  return <Evidence key={user?.id ?? 'signed-out'} accountId={user?.id} />;
}
function Evidence({ accountId }: { accountId?: string }) {
  const key = accountId ? userContentStorageKeys(accountId).workingTraceEvidence : null;
  const [initial] = useState(() => readAttempts(key));
  const [error, setError] = useState(initial.error);
  const [clearing, setClearing] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>(initial.attempts);
  if (initial.error) return <PageSection className="max-w-4xl"><h1 className="text-4xl font-semibold mb-6">Your learning evidence</h1><p role="alert">{initial.error}</p><Link className="inline-block mt-5 text-primary underline" to="/user-settings">Open account settings</Link></PageSection>;
  return <PageSection className="max-w-4xl"><h1 className="text-4xl font-semibold mb-4">Your learning evidence</h1><p className="text-base text-muted-foreground mb-8">Working Trace attempts saved on this device for your account. Confidence describes how you felt. A verified trace means the entered steps agree; it does not establish mastery or check the starting question.</p>
    {!attempts.length ? <p>No saved attempts yet. <Link className="text-primary underline" to="/working-trace">Check some working</Link>.</p> : <><div className="space-y-5">{attempts.slice().reverse().map((item,index) => <article key={`${item.recordedAt}-${index}`} className="rounded-xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">{new Date(item.recordedAt).toLocaleString()}</p><h2 className="text-xl font-semibold my-3">Algebra: preserving equivalence</h2><p>{item.complete ? 'All entered steps verified' : 'Contains a changed or unverified step'}</p><p className="mt-2">Self-reported confidence: {item.confidence}</p><p className="mt-2 text-muted-foreground">{item.complete ? 'Try a different equation to check transfer.' : 'Revisit balancing and distribution because this attempt contains a step that needs attention.'}</p><p className="text-sm mt-3">Suggested retry: {new Date(item.retryAt).toLocaleDateString()}</p><div className="flex flex-wrap gap-4 mt-4"><Link className="text-primary underline" to="/working-trace">Try again</Link><Link className="text-primary underline" to="/learn?topic=algebra">Open the micro-lesson</Link></div></article>)}</div><button type="button" className="mt-8 rounded-lg border border-border p-3" onClick={() => setClearing(true)}>Clear my Working Trace evidence</button>{clearing && <div className="mt-4 border border-border rounded-xl p-4"><p>This removes these attempts from this device. Other study data stays in place.</p><div className="flex gap-4 mt-4"><button type="button" onClick={() => { try { if(key) localStorage.removeItem(key); setAttempts([]); setClearing(false); } catch { setError('Device storage could not be updated.'); } }}>Confirm clear</button><button type="button" onClick={()=>setClearing(false)}>Keep attempts</button></div></div>}</>}{error && <p role="alert">{error}</p>}
  </PageSection>;
}
