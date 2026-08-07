import { dueCards, cardsFromFlashcards, type SrCard } from "@/lib/spacedRepetition";
import { userContentStorageKeys } from "@/lib/userContentStorageScope.mjs";

function deckKey() {
  return userContentStorageKeys().srDeck;
}

export function loadSrDeck(): SrCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(deckKey());
    return raw ? (JSON.parse(raw) as SrCard[]) : [];
  } catch {
    return [];
  }
}

export function saveSrDeck(cards: SrCard[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(deckKey(), JSON.stringify(cards));
}

export function getDueFlashcardCount(): number {
  return dueCards(loadSrDeck()).length;
}

/** Cram mode: due cards sorted by lowest ease (hardest first) */
export function getCramDueCards(limit = 20): SrCard[] {
  return dueCards(loadSrDeck())
    .sort((a, b) => a.ease - b.ease || a.repetitions - b.repetitions)
    .slice(0, limit);
}

export function getCramDueCount(): number {
  return getCramDueCards().length;
}

/** Merge notebook flashcards into the spaced-repetition deck */
export function mergeFlashcardsIntoDeck(
  flashcards: { front: string; back: string }[],
  deckPrefix: string,
): number {
  const existing = loadSrDeck();
  const incoming = cardsFromFlashcards(flashcards, deckPrefix);
  const seen = new Set(existing.map((c) => `${c.front}::${c.back}`));
  const toAdd = incoming.filter((c) => !seen.has(`${c.front}::${c.back}`));
  if (toAdd.length === 0) return 0;
  saveSrDeck([...toAdd, ...existing]);
  return toAdd.length;
}
