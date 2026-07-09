import test from "node:test";
import assert from "node:assert/strict";
import { dueCards, rateCard, cardsFromFlashcards } from "../src/lib/spacedRepetition.ts";

test("cardsFromFlashcards creates review-ready deck", () => {
  const deck = cardsFromFlashcards([{ front: "A", back: "1" }], "test");
  assert.equal(deck.length, 1);
  assert.equal(deck[0].front, "A");
  assert.equal(deck[0].repetitions, 0);
});

test("dueCards includes cards with past nextReview", () => {
  const past = new Date(Date.now() - 1000).toISOString();
  const deck = [{ id: "1", front: "Q", back: "A", ease: 2.5, interval: 1, repetitions: 1, nextReview: past }];
  assert.equal(dueCards(deck).length, 1);
});

test("rateCard again resets repetitions", () => {
  const card = {
    id: "1",
    front: "Q",
    back: "A",
    ease: 2.5,
    interval: 3,
    repetitions: 2,
    nextReview: new Date().toISOString(),
  };
  const rated = rateCard(card, "again");
  assert.equal(rated.repetitions, 0);
  assert.equal(rated.interval, 0);
});
