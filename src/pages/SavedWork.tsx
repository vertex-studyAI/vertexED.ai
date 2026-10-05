import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router';
import PageSection from '@/components/PageSection';
import SavedWorkList from '@/components/SavedWorkList';
import { useStudyArtifactCollection } from '@/hooks/useStudyArtifactCollection';
import { useMemo, useState } from 'react';
import { filterSavedWork } from '@/lib/filterSavedWork.mjs';

export default function SavedWork() {
  const [params] = useSearchParams();
  const itemId = params.get('item') || undefined;
  const saved = useStudyArtifactCollection(true, itemId);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [location, setLocation] = useState('all');
  const [sort, setSort] = useState('recent');
  const filtered = useMemo(() => filterSavedWork(saved.items, { query, kind, location, sort }), [saved.items, query, kind, location, sort]);
  return <PageSection className="saved-work-page space-y-6">
    <Helmet><title>Saved work - VertexED</title><meta name="robots" content="noindex, nofollow" /></Helmet>
    <header>
      <p className="dashboard-kicker">Your study workspace</p>
      <h1 className="text-3xl font-semibold mt-2">Saved work</h1>
      <p className="mt-3 text-muted-foreground">Return to your notes, practice papers and feedback. Device saves remain labelled until cloud sync is confirmed.</p>
      <div className="flex flex-wrap gap-4 mt-4"><Link className="text-link" to="/main">Back to dashboard</Link>{itemId && <Link className="text-link" to="/saved-work">View all saved work</Link>}<Link className="text-link" to="/study-notebook">Open notebooks and sources</Link></div>
    </header>
    {saved.error && <div className="surface-tile p-4" role="status"><p>{saved.error}</p><button type="button" disabled={saved.loading} className="neu-button mt-3 px-4 py-2" onClick={() => void saved.reload()}>Retry loading</button></div>}
    {saved.loading && <p role="status">Loading saved work…</p>}
    {!itemId && <section aria-label="Find saved work" className="surface-tile p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label>Search saved work<input aria-label="Search saved work" className="w-full mt-2 min-h-11 rounded-lg border border-border bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title, subject or question" /></label>
      <label>Work type<select aria-label="Work type" className="form-control-select w-full mt-2 min-h-11" value={kind} onChange={event => setKind(event.target.value)}>{[['all', 'All types'], ['note', 'Notes'], ['paper', 'Papers'], ['review', 'Reviews'], ['notebook', 'Notebooks'], ['planner', 'Plans']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Save location<select aria-label="Save location" className="form-control-select w-full mt-2 min-h-11" value={location} onChange={event => setLocation(event.target.value)}><option value="all">All locations</option><option value="cloud">Saved to your account</option><option value="device">Saved on this device</option></select></label>
      <label>Sort by<select aria-label="Sort by" className="form-control-select w-full mt-2 min-h-11" value={sort} onChange={event => setSort(event.target.value)}><option value="recent">Recently updated</option><option value="title">Title</option></select></label>
    </section>}
    {!itemId && <p role="status" className="text-sm text-muted-foreground">{filtered.length} of {saved.items.length} loaded items shown.{saved.nextOffset !== null && ' More work is available. Load more to include it in these filters.'}</p>}
    {!!saved.items.length && <SavedWorkList items={itemId ? saved.items : filtered} onChanged={() => void saved.reload()} />}
    {!itemId && saved.items.length > 0 && !filtered.length && <div className="surface-tile p-4"><p>No loaded work matches these filters.</p><button type="button" className="btn-glass mt-3 min-h-11" onClick={() => { setQuery(''); setKind('all'); setLocation('all'); }}>Clear filters</button></div>}
    {!saved.loading && !saved.error && !saved.items.length && <div className="surface-tile p-6"><h2 className="text-xl font-semibold">{itemId ? 'This saved item is unavailable' : 'Your next attempt starts here'}</h2><p className="mt-2 text-muted-foreground">{itemId ? 'It may have been deleted or belong to a different account.' : 'Create notes or a practice paper, then return here to continue learning.'}</p><Link className="btn-solid inline-flex mt-4 px-4 py-2" to="/notetaker">Create study notes</Link></div>}
    {saved.nextOffset !== null && <button type="button" className="neu-button px-4 py-2" disabled={saved.loading} onClick={() => void saved.loadMore()}>Load more saved work</button>}
  </PageSection>;
}
