import { savedWorkText } from './savedWorkText.mjs';

/** Filter only the loaded collection; the UI must disclose pagination. */
export function filterSavedWork(items, { query = '', kind = 'all', location = 'all', sort = 'recent' } = {}) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter(item => {
    if (kind !== 'all' && item.kind !== kind) return false;
    if (location === 'device' && !item.localOnly) return false;
    if (location === 'cloud' && item.localOnly) return false;
    const text = savedWorkText(item).toLocaleLowerCase();
    return terms.every(term => text.includes(term));
  }).sort((a, b) => sort === 'title'
    ? (a.title || a.kind).localeCompare(b.title || b.kind)
    : String(b.updated_at).localeCompare(String(a.updated_at)));
}
