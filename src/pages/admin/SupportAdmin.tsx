import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import PageSection from '@/components/PageSection';
import SEO from '@/components/SEO';
import { authFetch } from '@/lib/apiAuth';

type SupportCategory = 'all' | 'bug' | 'confusing' | 'idea' | 'praise' | 'other';
type SupportCase = { id: string; category: Exclude<SupportCategory, 'all'>; rating: number | null; feedback: string; pagePath: string; createdAt: string };
type SupportResponse = { cases: SupportCase[]; pagination: { page: number; pageSize: number; total: number; totalPages: number }; privacy: string; retention: string };
const categories: SupportCategory[] = ['all', 'bug', 'confusing', 'idea', 'praise', 'other'];

export default function SupportAdmin() {
  const [category, setCategory] = useState<SupportCategory>('all');
  const [requestId, setRequestId] = useState('');
  const [submittedRequestId, setSubmittedRequestId] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<SupportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const params = new URLSearchParams({ category, page: String(page), pageSize: '25' });
    if (submittedRequestId.trim()) params.set('requestId', submittedRequestId.trim());
    try {
      const response = await authFetch(`/api/admin-support?${params.toString()}`);
      const data = await response.json().catch(() => null);
      if (response.status === 403) throw new Error('You do not have admin access.');
      if (!response.ok || !data?.cases) throw new Error(data?.error || 'Could not load support cases.');
      setResult(data);
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : 'Could not load support cases.');
    } finally { setLoading(false); }
  }, [category, page, submittedRequestId]);

  useEffect(() => { void load(); }, [load]);

  const copyId = async (id: string) => {
    try { await navigator.clipboard.writeText(id); setCopied(id); } catch { setCopied(null); }
  };
  const submitLookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSubmittedRequestId(requestId);
  };

  return <><SEO title="Support cases | VertexED" description="Privacy-minimised product feedback for authorised administrators." robots="noindex, nofollow" /><PageSection className="max-w-6xl mx-auto space-y-6 px-4 py-10"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="dashboard-kicker">Administration</p><h1 className="mt-2 text-3xl font-semibold">Support cases</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Review submitted product feedback without opening learner work, profiles or private study history.</p></div><div className="flex flex-wrap gap-3"><Link to="/admin/analytics" className="neu-button px-4 py-2 text-sm">Analytics</Link><Link to="/main" className="neu-button px-4 py-2 text-sm">Back to Main</Link></div></header><section className="surface-tile space-y-4 p-4"><form className="flex flex-wrap items-end gap-3" onSubmit={submitLookup}><label className="text-sm">Request ID<input aria-label="Support request ID" value={requestId} onChange={(event) => setRequestId(event.target.value)} placeholder="Generated feedback request ID" className="mt-1 block min-h-11 w-full min-w-[16rem] rounded-lg border border-border bg-background/70 px-3 text-sm outline-none focus:border-primary" /></label><label className="text-sm">Category<select className="form-control-select mt-1 block min-h-11" value={category} onChange={(event) => { setCategory(event.target.value as SupportCategory); setPage(1); }}>{categories.map((value) => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}</select></label><button type="submit" className="neu-button min-h-11 px-4 text-sm" disabled={loading}>Search cases</button><button type="button" className="neu-button min-h-11 px-4 text-sm" onClick={() => { setRequestId(''); setSubmittedRequestId(''); setCategory('all'); setPage(1); }} disabled={loading}>Clear</button></form>{result && <><p className="text-sm text-muted-foreground">{result.privacy}</p><p className="text-xs text-amber-700 dark:text-amber-300">{result.retention}</p></>}</section>{error && <section className="surface-tile border-destructive/40 p-4 text-sm text-destructive" role="alert">{error}</section>}{loading ? <p role="status">Loading support cases…</p> : result && <section className="surface-tile overflow-x-auto p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg font-semibold">Submitted feedback</h2><p className="text-sm text-muted-foreground">{result.pagination.total} matching case{result.pagination.total === 1 ? '' : 's'}</p></div>{result.cases.length ? <div className="mt-4 space-y-3">{result.cases.map((item) => <article key={item.id} className="rounded-xl border border-border bg-background/45 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium capitalize">{item.category}{item.rating ? ` · ${item.rating}/5` : ''}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()} · {item.pagePath}</p></div><button type="button" className="min-h-11 rounded-lg border border-border px-3 text-xs hover:border-primary" onClick={() => void copyId(item.id)}>{copied === item.id ? 'Request ID copied' : 'Copy request ID'}</button></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{item.feedback}</p></article>)}</div> : <p className="mt-4 text-sm text-muted-foreground">No submitted feedback matches this search.</p>}<nav className="mt-5 flex items-center justify-between gap-3" aria-label="Support case pages"><button type="button" className="neu-button min-h-11 px-4 text-sm" disabled={result.pagination.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button><span className="text-sm text-muted-foreground">Page {result.pagination.page} of {result.pagination.totalPages}</span><button type="button" className="neu-button min-h-11 px-4 text-sm" disabled={result.pagination.page >= result.pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Next</button></nav></section>}</PageSection></>;
}
