import { dueCards, mergeReviewCards, repairCardIds, type SrCard } from "@/lib/spacedRepetition";
import { userContentStorageKeys } from "@/lib/userContentStorageScope.mjs";

function deckKey() {
  return userContentStorageKeys().srDeck;
}

export function loadSrDeck(): SrCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(deckKey());
    const cards = raw ? JSON.parse(raw) as SrCard[] : [];
    const repaired = repairCardIds(cards);
    if (JSON.stringify(cards) !== JSON.stringify(repaired)) saveSrDeck(repaired);
    return repaired;
  } catch {
    return [];
  }
}

export function saveSrDeck(cards: SrCard[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(deckKey(), JSON.stringify(cards));
  window.dispatchEvent(new CustomEvent('vertexed:storage-changed', { detail: deckKey() }));
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
  const merged = mergeReviewCards(existing, flashcards, deckPrefix);
  saveSrDeck(merged);
  return merged.length - existing.length;
}
