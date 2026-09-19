import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { useAuth } from '@/contexts/AuthContext';
import { searchVertex } from '@/lib/globalSearchIndex';

export default function GlobalStudySearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const results = useMemo(
    () => searchVertex(query, { includeAccount: isAuthenticated }),
    [query, isAuthenticated],
  );
  const listId = 'vertex-global-search-results';

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [location.pathname]);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const focusShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing = target?.matches('input, textarea, select, [contenteditable="true"]');
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || isEditing) return;
      event.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', focusShortcut);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', focusShortcut);
    };
  }, []);

  useEffect(() => setActiveIndex(0), [query]);

  const goToResult = (index: number) => {
    const result = results[index];
    if (!result) return;
    setOpen(false);
    navigate(result.to);
  };

  return (
    <div className="vertex-search-row">
      <span className="vertex-search-index" aria-hidden="true">01 / FIND</span>
      <div className="vertex-global-search" ref={rootRef}>
        <Search aria-hidden="true" />
        <label className="sr-only" htmlFor="vertex-global-search">Search VertexED</label>
        <input
          ref={inputRef}
          id="vertex-global-search"
          type="search"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && query.trim().length > 0}
          aria-activedescendant={open && results[activeIndex] ? `vertex-search-result-${activeIndex}` : undefined}
          placeholder="Search subjects, topics and tools"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setOpen(false);
              inputRef.current?.blur();
            } else if (event.key === 'ArrowDown' && results.length) {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) => (index + 1) % results.length);
            } else if (event.key === 'ArrowUp' && results.length) {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) => (index - 1 + results.length) % results.length);
            } else if (event.key === 'Enter' && open && results.length) {
              event.preventDefault();
              goToResult(activeIndex);
            }
          }}
        />
        {query && (
          <button type="button" className="vertex-search-clear" aria-label="Clear search" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
            <X aria-hidden="true" />
          </button>
        )}
        <kbd aria-label="Press slash to search">/</kbd>

        {open && query.trim() && (
          <div className="vertex-search-popover">
            {results.length ? (
              <div id={listId} role="listbox" aria-label="VertexED search results">
                {results.map((result, index) => (
                  <button
                    id={`vertex-search-result-${index}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    type="button"
                    key={`${result.to}-${result.title}`}
                    onPointerMove={() => setActiveIndex(index)}
                    onClick={() => goToResult(index)}
                  >
                    <span className="vertex-search-result-area">{result.area}{result.account ? ' / ACCOUNT' : ''}</span>
                    <strong>{result.title}</strong>
                    <small>{result.description}</small>
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : (
              <p role="status">No subject, topic, tool or guide matches “{query.trim()}”.</p>
            )}
          </div>
        )}
      </div>
      <span className="vertex-search-hint">Press / anywhere</span>
    </div>
  );
}
