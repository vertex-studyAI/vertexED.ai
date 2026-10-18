type SearchableResource = { title: string; description: string; keywords: string; meta?: string };

export function normaliseResourceQuery(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/** Match every word across fields; rank direct title matches ahead of incidental keywords. */
export function searchResources<T extends SearchableResource>(entries: readonly T[], query: string): T[] {
  const normalised = normaliseResourceQuery(query);
  const words = [...new Set(normalised.split(' ').filter(Boolean))];
  if (!words.length) return [...entries];
  return entries.map((entry, position) => {
    const title = normaliseResourceQuery(entry.title);
    const body = normaliseResourceQuery(`${entry.description} ${entry.keywords} ${entry.meta ?? ''}`);
    if (!words.every((word) => title.includes(word) || body.includes(word))) return null;
    const score = (title === normalised ? 100 : title.includes(normalised) ? 30 : 0)
      + words.reduce((sum, word) => sum + (title.includes(word) ? 5 : 1), 0);
    return { entry, position, score };
  }).filter((match): match is { entry: T; position: number; score: number } => match !== null)
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .map(({ entry }) => entry);
}
