import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageSection from '@/components/PageSection';
import SEO from '@/components/SEO';
import { authFetch } from '@/lib/apiAuth';

type WaitlistEntry = {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

type StatusFilter = 'all' | WaitlistEntry['status'];

export default function WaitlistAdmin() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const counts = {
    all: entries.length,
    pending: entries.filter((entry) => entry.status === 'pending').length,
    approved: entries.filter((entry) => entry.status === 'approved').length,
    rejected: entries.filter((entry) => entry.status === 'rejected').length,
  };
  const normalizedSearch = search.trim().toLowerCase();
  const visibleEntries = normalizedSearch
    ? entries.filter((entry) => entry.email.toLowerCase().includes(normalizedSearch))
    : entries;

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/waitlist-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          ...(filter === 'all' ? {} : { status: filter }),
        }),
      });

      const data = await response.json();

      if (response.status === 403) {
        setError('You do not have admin access. Set ADMIN_EMAILS on the server to include your login email.');
        setEntries([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load waitlist');
      }

      setEntries(data.entries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load waitlist');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const updateStatus = async (id: string, status: WaitlistEntry['status']) => {
    setUpdatingId(id);
    setError(null);

    try {
      const response = await authFetch('/api/waitlist-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update entry');
      }

      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, ...data.entry } : entry)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <SEO
        title="Waitlist Admin | VertexED"
        description="Manage VertexED waitlist signups."
        robots="noindex, nofollow"
      />
      <PageSection className="max-w-5xl mx-auto py-10 px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold brand-text-gradient">Waitlist Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Approve or reject signups from <code>/signup</code>.
            </p>
          </div>
          <Link to="/main" className="neu-button px-4 py-2 text-sm">
            ← Back to Main
          </Link>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="mt-1 text-xl font-semibold">{counts.all}</p>
          </div>
          <div className="rounded-xl border border-border bg-card/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending</p>
            <p className="mt-1 text-xl font-semibold text-amber-300">{counts.pending}</p>
          </div>
          <div className="rounded-xl border border-border bg-card/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Approved</p>
            <p className="mt-1 text-xl font-semibold text-emerald-300">{counts.approved}</p>
          </div>
          <div className="rounded-xl border border-border bg-card/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Rejected</p>
            <p className="mt-1 text-xl font-semibold text-rose-300">{counts.rejected}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                filter === value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
          <button
            type="button"
            onClick={loadEntries}
            className="px-3 py-1.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground"
          >
            Refresh
          </button>
        </div>

        <div className="mb-6">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by email…"
            className="w-full sm:w-[360px] rounded-lg border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading waitlist…</p>
        ) : visibleEntries.length === 0 ? (
          <p className="text-muted-foreground">No entries found for this filter.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card/60 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Signed up</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-border/60">
                    <td className="px-4 py-3 font-mono text-xs sm:text-sm">{entry.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          entry.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : entry.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {entry.status !== 'approved' && (
                          <button
                            type="button"
                            disabled={updatingId === entry.id}
                            onClick={() => updateStatus(entry.id, 'approved')}
                            className="px-2.5 py-1 rounded-md text-xs border border-green-500/40 text-green-300 hover:bg-green-500/10 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {entry.status !== 'rejected' && (
                          <button
                            type="button"
                            disabled={updatingId === entry.id}
                            onClick={() => updateStatus(entry.id, 'rejected')}
                            className="px-2.5 py-1 rounded-md text-xs border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                        {entry.status !== 'pending' && (
                          <button
                            type="button"
                            disabled={updatingId === entry.id}
                            onClick={() => updateStatus(entry.id, 'pending')}
                            className="px-2.5 py-1 rounded-md text-xs border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageSection>
    </>
  );
}
