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

export function getDueFlashcardCount(): number {
  return dueCards(loadSrDeck()).length;
}
