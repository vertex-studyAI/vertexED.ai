import { getWeakestTopics } from '@/lib/weaknessTracker';
import { getCramDueCards } from '@/lib/srDeck';
import { BOARD_CONFIGS } from '@/lib/curriculum';
import type { ExamBoard } from '@/types/curriculum';

export type CramSessionItem = {
  type: 'flashcard' | 'weak-topic' | 'formula' | 'mock';
  title: string;
  description: string;
  to: string;
  minutes: number;
};

export function buildCramSession(
  board: ExamBoard | null,
  examDaysLeft: number | null,
): CramSessionItem[] {
  const items: CramSessionItem[] = [];
  const weak = getWeakestTopics(3);
  const cramCards = getCramDueCards(15);

  if (cramCards.length > 0) {
    items.push({
      type: 'flashcard',
      title: `${cramCards.length} high-yield flashcards`,
      description: 'Hardest due cards first — skip what you already know',
      to: '/notetaker?mode=study&cram=1',
      minutes: Math.min(cramCards.length * 2, 20),
    });
  }

  for (const w of weak) {
    items.push({
      type: 'weak-topic',
      title: w.topic.slice(0, 50),
      description: `${w.subject} — ${Math.round(w.avgPercent)}% mastery`,
      to: '/answer-reviewer',
      minutes: 15,
    });
  }

  if (board) {
    const label = BOARD_CONFIGS[board].label;
    items.push({
      type: 'formula',
      title: `${label} formula sheet`,
      description: 'Quick-reference before practice',
      to: '/study-tools',
      minutes: 10,
    });
  }

  items.push({
    type: 'mock',
    title: 'Mini timed mock',
    description: examDaysLeft !== null && examDaysLeft <= 3
      ? 'Full conditions — review immediately after'
      : '20-minute focused practice paper',
    to: '/paper-maker',
    minutes: examDaysLeft !== null && examDaysLeft <= 3 ? 60 : 20,
  });

  return items;
}

export function totalCramMinutes(items: CramSessionItem[]): number {
  return items.reduce((sum, i) => sum + i.minutes, 0);
}
