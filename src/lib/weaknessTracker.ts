export type WeaknessEntry = {
  topic: string;
  subject: string;
  board?: string;
  score: number;
  maxScore: number;
  source: 'review' | 'quiz' | 'mock';
  recordedAt: string;
};

export function recordWeakness(entry: Omit<WeaknessEntry, 'recordedAt'>) {
  void entry;
}

export type TopicHeat = {
  topic: string;
  subject: string;
  attempts: number;
  avgPercent: number;
  lastSeen: string;
};

export function getWeaknessHeatmap(limit = 12): TopicHeat[] {
  void limit;
  return [];
}

export function getWeakestTopics(count = 5): TopicHeat[] {
  void count;
  return [];
}
