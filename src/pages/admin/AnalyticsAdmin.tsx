import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import PageSection from '@/components/PageSection';
import SEO from '@/components/SEO';
import { authFetch } from '@/lib/apiAuth';

type Capability = { capability: string; events: number; providerRuns: number; providerSuccesses: number; feedback: number; negativeFeedback: number; incorrectFeedback: number; failedEvents: number };
type Analytics = { generatedAt: string; days: number; truncated: boolean; recordCount: number; metrics: { providerRuns: number; providerSuccesses: number; feedback: number; negativeFeedback: number; incorrectFeedback: number; failedEvents: number }; capabilities: Capability[]; privacy: string };

export default function AnalyticsAdmin() {
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await authFetch(`/api/admin-analytics?days=${days}`);
      const data = await response.json().catch(() => null);
      if (response.status === 403) throw new Error('You do not have admin access.');
      if (!response.ok || !data?.analytics) throw new Error(data?.error || 'Could not load aggregate analytics.');
      setAnalytics(data.analytics);
    } catch (cause) {
      setAnalytics(null);
      setError(cause instanceof Error ? cause.message : 'Could not load aggregate analytics.');
    } finally { setLoading(false); }
  }, [days]);
  useEffect(() => { void load(); }, [load]);
  const successRate = analytics?.metrics.providerRuns ? Math.round((analytics.metrics.providerSuccesses / analytics.metrics.providerRuns) * 100) : null;
  return <><SEO title="Platform analytics | VertexED" description="Privacy-minimised operational analytics for administrators." robots="noindex, nofollow" /><PageSection className="max-w-6xl mx-auto py-10 px-4 space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="dashboard-kicker">Administration</p><h1 className="mt-2 text-3xl font-semibold">Platform analytics</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">{analytics?.privacy || 'This view is designed to use aggregate operational telemetry only.'}</p></div><div className="flex flex-wrap gap-3"><Link to="/admin/support" className="neu-button px-4 py-2 text-sm">Support cases</Link><Link to="/admin/waitlist" className="neu-button px-4 py-2 text-sm">Waitlist</Link><Link to="/main" className="neu-button px-4 py-2 text-sm">Back to Main</Link></div></header><section className="surface-tile flex flex-wrap items-end gap-3 p-4" aria-label="Analytics date range"><label className="text-sm">Date range<select className="form-control-select ml-2 min-h-11" value={days} onChange={(event) => setDays(Number(event.target.value))}>{[7, 30, 90].map((value) => <option key={value} value={value}>Last {value} days</option>)}</select></label><button type="button" className="neu-button min-h-11 px-4 text-sm" onClick={() => void load()} disabled={loading}>Refresh</button>{analytics?.truncated && <p className="text-sm text-amber-700 dark:text-amber-300" role="status">Results are capped at 2,000 events. Narrow the date range for a complete view.</p>}</section>{error && <section className="surface-tile border-destructive/40 p-4 text-sm text-destructive" role="alert">{error}</section>}{loading && <p role="status">Loading aggregate analytics…</p>}{analytics && <><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Analytics summary"><Metric label="Provider runs" value={analytics.metrics.providerRuns} /><Metric label="Provider success" value={successRate === null ? 'No runs' : `${successRate}%`} /><Metric label="AI feedback" value={analytics.metrics.feedback} /><Metric label="Incorrect reports" value={analytics.metrics.incorrectFeedback} /></section><section className="surface-tile overflow-x-auto p-4"><h2 className="text-lg font-semibold">Capability signals</h2><p className="mt-1 text-sm text-muted-foreground">{analytics.recordCount} privacy-minimised telemetry events in the selected range. A failed outcome is operational telemetry, not a learner-performance measure.</p><table className="mt-4 min-w-full text-left text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="p-2">Capability</th><th className="p-2">Events</th><th className="p-2">Provider runs</th><th className="p-2">Failures</th><th className="p-2">Feedback</th><th className="p-2">Incorrect</th></tr></thead><tbody>{analytics.capabilities.length ? analytics.capabilities.map((row) => <tr key={row.capability} className="border-b border-border/60"><th scope="row" className="p-2 font-medium">{row.capability}</th><td className="p-2">{row.events}</td><td className="p-2">{row.providerRuns}</td><td className="p-2">{row.failedEvents}</td><td className="p-2">{row.feedback}</td><td className="p-2">{row.incorrectFeedback}</td></tr>) : <tr><td className="p-3 text-muted-foreground" colSpan={6}>No telemetry events were recorded in this range.</td></tr>}</tbody></table></section></>}</PageSection></>;
}

function Metric({ label, value }: { label: string; value: string | number }) { return <div className="surface-tile p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold text-primary">{value}</p></div>; }
