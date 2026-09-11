import { dueCards, mergeReviewCards, repairCardIds, type SrCard } from "@/lib/spacedRepetition";
import {
  parseStoredArray,
  resolveLocalStorage,
  safeStorageGet,
  safeStorageSet,
} from "@/lib/browserStorage.mjs";
import { userContentStorageKeys } from "@/lib/userContentStorageScope.mjs";

function deckKey() {
  return userContentStorageKeys().srDeck;
}

export function loadSrDeck(): SrCard[] {
  if (typeof window === "undefined") return [];
  const storage = resolveLocalStorage(window);
  const cards = parseStoredArray(safeStorageGet(storage, deckKey())) as SrCard[];
  const repaired = repairCardIds(cards);
  if (JSON.stringify(cards) !== JSON.stringify(repaired)) saveSrDeck(repaired);
  return repaired;
}

export function saveSrDeck(cards: SrCard[]) {
  if (typeof window === "undefined") return;
  const storage = resolveLocalStorage(window);
  if (!safeStorageSet(storage, deckKey(), JSON.stringify(cards))) return;
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
