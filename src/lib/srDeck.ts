import { dueCards, type SrCard } from "@/lib/spacedRepetition";

const DECK_KEY = "vertex_sr_deck";

export function loadSrDeck(): SrCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DECK_KEY);
    return raw ? (JSON.parse(raw) as SrCard[]) : [];
  } catch {
    return [];
  }
}

export function saveSrDeck(cards: SrCard[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DECK_KEY, JSON.stringify(cards));
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

