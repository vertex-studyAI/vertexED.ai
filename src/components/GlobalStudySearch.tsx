import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { type GlobalSearchEntry, GLOBAL_SEARCH_INDEX, STUDY_COMMANDS, searchVertex } from '@/lib/globalSearchIndex';
import { readSearchHistory, rememberSearch, searchHistoryKey } from '@/lib/searchHistory.mjs';
import { resolveLocalStorage, safeStorageRemove } from '@/lib/browserStorage.mjs';
import { savedWorkSearchEntries } from '@/lib/savedWorkSearch';
import { useStudyArtifactCollection } from '@/hooks/useStudyArtifactCollection';
import AnchoredOverlay from '@/components/AnchoredOverlay';

export default function GlobalStudySearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [history, setHistory] = useState<{ scope: string | null; queries: string[] }>({ scope: null, queries: [] });
  const [historyError, setHistoryError] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const scope = user?.id ?? null;
  const saved = useStudyArtifactCollection(open && isAuthenticated);
  const [personalIndex, setPersonalIndex] = useState<{ scope: string; entries: GlobalSearchEntry[] } | null>(null);
  useEffect(() => {
    let active = true;
    if (open && scope) void import('@/lib/learningSearch').then(({ learningSearchEntries }) => {
      if (active) setPersonalIndex({ scope, entries: learningSearchEntries(scope, localStorage, sessionStorage) });
    }).catch(() => { if (active) setPersonalIndex(null); });
    return () => { active = false; };
  }, [open, scope]);
  const entries = useMemo(() => [...savedWorkSearchEntries(saved.items), ...(personalIndex?.scope === scope ? personalIndex.entries : [])], [saved.items, personalIndex, scope]);
  const recent = history.scope === scope ? history.queries : [];
  const results = useMemo(() => query.trim()
    ? searchVertex(query, { includeAccount: isAuthenticated, entries, limit: 12 })
    : isAuthenticated ? [...entries.slice(0, 3), ...STUDY_COMMANDS] : GLOBAL_SEARCH_INDEX.filter(entry => !entry.account && ['Courses', 'MYP 5', 'Study guides', 'Features'].includes(entry.title)), [query, entries, isAuthenticated]);
  const options = query.trim() ? results.map(entry => ({ entry, query: '' })) : [
    ...recent.map(value => ({ entry: null, query: value })),
    ...results.map(entry => ({ entry, query: '' })),
  ];
  const listId = 'vertex-global-search-results';
  const selectedIndex = Math.min(activeIndex, Math.max(0, options.length - 1));

  useEffect(() => { setOpen(false); setQuery(''); }, [location.key, scope]);
  useEffect(() => {
    const refresh = () => setHistory({ scope, queries: readSearchHistory(resolveLocalStorage(window), scope) });
    refresh();
    setHistoryError('');
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [scope]);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node) && !overlayRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const focusShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
      const command = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.altKey;
      const slash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !editing;
      if ((!command && !slash) || event.isComposing || rootRef.current?.closest('[inert]') || target?.closest('[role="dialog"]')) return;
      event.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    };
    const closeOnFocus = (event: FocusEvent) => {
      if (!rootRef.current?.contains(event.target as Node) && !overlayRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', focusShortcut);
    document.addEventListener('focusin', closeOnFocus);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', focusShortcut);
      document.removeEventListener('focusin', closeOnFocus);
    };
  }, []);
  useEffect(() => setActiveIndex(0), [query]);
  useEffect(() => {
    if (!open) return;
    const option = document.getElementById(`vertex-search-result-${selectedIndex}`);
    const list = document.getElementById(listId);
    if (!option || !list) return;
    // Scroll only the list. scrollIntoView also scrolls the document in Firefox
    // while a newly portalled overlay is being measured.
    const top = option.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    const bottom = top + option.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }, [selectedIndex, open]);

  const select = (index: number) => {
    const option = options[index];
    if (!option) return;
    if (!option.entry) { setQuery(option.query); inputRef.current?.focus(); return; }
    if (query.trim()) {
      const result = rememberSearch(resolveLocalStorage(window), scope, query);
      setHistory({ scope, queries: result.history });
      setHistoryError(result.saved ? '' : 'Search history could not be saved on this device.');
    }
    setOpen(false);
    navigate(option.entry.to);
  };

  return <div className="vertex-search-row">
    <span className="vertex-search-index" aria-hidden="true">01 / FIND</span>
    <div className="vertex-global-search" ref={rootRef}>
      <Search aria-hidden="true" />
      <label className="sr-only" htmlFor="vertex-global-search">Search VertexED</label>
      <input ref={inputRef} id="vertex-global-search" type="search" role="combobox" autoComplete="off" maxLength={160}
        aria-autocomplete="list" aria-controls={open ? listId : undefined} aria-expanded={open}
        aria-keyshortcuts="/ Meta+k Control+k"
        aria-activedescendant={open && options[selectedIndex] ? `vertex-search-result-${selectedIndex}` : undefined}
        placeholder={isAuthenticated ? 'Search your work, subjects and tools' : 'Search subjects, topics and tools'}
        value={query} onFocus={() => setOpen(true)} onClick={() => setOpen(true)}
        onChange={event => { setQuery(event.target.value); setOpen(true); }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); }
          else if (['ArrowDown', 'ArrowUp'].includes(event.key) && options.length) {
            event.preventDefault(); setOpen(true);
            setActiveIndex(open ? (selectedIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length : 0);
          } else if (event.key === 'Enter' && open) { event.preventDefault(); select(selectedIndex); }
        }} />
      {query && <button type="button" className="vertex-search-clear" aria-label="Clear search" onClick={() => { setQuery(''); inputRef.current?.focus(); }}><X aria-hidden="true" /></button>}
      <kbd aria-hidden="true">/</kbd>
    </div>
    <span className="vertex-search-hint">/ or Ctrl/⌘ K</span>
    {open && <AnchoredOverlay anchorRef={rootRef} overlayRef={overlayRef} className="vertex-search-popover">
      <div className="vertex-search-meta"><span>{query.trim() ? 'Search results' : recent.length ? 'Recent searches and shortcuts' : 'Start here'}</span>
        {!!recent.length && <button type="button" onClick={() => {
          const removed = safeStorageRemove(resolveLocalStorage(window), searchHistoryKey(scope));
          if (removed) setHistory({ scope, queries: [] });
          setHistoryError(removed ? '' : 'Search history could not be cleared. Check browser storage access.');
        }}>Clear history</button>}
      </div>
      <div id={listId} role="listbox" aria-label="VertexED search results">
        {options.map((option, index) => <button id={`vertex-search-result-${index}`} role="option" aria-selected={selectedIndex === index}
          tabIndex={-1} type="button" key={option.entry ? `${option.entry.to}-${option.entry.title}` : `recent-${option.query}`}
          onPointerMove={() => setActiveIndex(index)} onMouseDown={event => event.preventDefault()} onClick={() => select(index)}>
          <span className="vertex-search-result-area">{option.entry?.area ?? 'Recent search'}</span>
          <strong>{option.entry?.title ?? option.query}</strong>
          {option.entry && <small>{option.entry.description}</small>}<ArrowUpRight aria-hidden="true" />
        </button>)}
      </div>
      {!options.length && <p role="status">No matches for “{query.trim()}”. Try a subject, topic or saved title.</p>}
      {saved.loading && <p role="status">Loading saved work. Subjects and tools are ready to search.</p>}
      {saved.error && <div className="vertex-search-message" role="status"><p>{saved.error}</p><button type="button" disabled={saved.loading} onClick={() => void saved.reload()}>Retry saved work</button></div>}
      {saved.nextOffset !== null && <div className="vertex-search-message"><span>Searching {saved.items.length} recent saves.</span><button type="button" disabled={saved.loading} onClick={() => void saved.loadMore()}>Search more saved work</button></div>}
      {historyError && <p role="status">{historyError}</p>}
      <p className="vertex-search-help">↑ ↓ to move · Enter to open · Esc to close. History stays on this device.</p>
    </AnchoredOverlay>}
  </div>;
}
