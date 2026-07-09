export type SrCard = {
  id: string;
  front: string;
  back: string;
  ease: number;
  interval: number;
  repetitions: number;
  nextReview: string;
};

export type SrRating = "again" | "hard" | "good" | "easy";

const DAY_MS = 24 * 60 * 60 * 1000;

export function cardsFromFlashcards(
  flashcards: { front: string; back: string }[],
  deckId: string,
): SrCard[] {
  const now = new Date().toISOString();
  return flashcards.map((card, i) => ({
    id: `${deckId}-${i}`,
    front: card.front,
    back: card.back,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: now,
  }));
}

export function dueCards(cards: SrCard[]): SrCard[] {
  const now = Date.now();
  return cards.filter((c) => new Date(c.nextReview).getTime() <= now);
}

export function rateCard(card: SrCard, rating: SrRating): SrCard {
  const now = Date.now();
  let { ease, interval, repetitions } = card;

  if (rating === "again") {
    repetitions = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    return {
      ...card,
      ease,
      interval,
      repetitions,
      nextReview: new Date(now + 10 * 60 * 1000).toISOString(),
    };
  }

  repetitions += 1;
  if (rating === "hard") ease = Math.max(1.3, ease - 0.15);
  if (rating === "easy") ease += 0.15;

  if (repetitions === 1) interval = 1;
  else if (repetitions === 2) interval = 3;
  else interval = Math.round(interval * ease);

  if (rating === "hard") interval = Math.max(1, Math.round(interval * 0.8));
  if (rating === "easy") interval = Math.round(interval * 1.3);

  return {
    ...card,
    ease,
    interval,
    repetitions,
    nextReview: new Date(now + interval * DAY_MS).toISOString(),
  };
}
