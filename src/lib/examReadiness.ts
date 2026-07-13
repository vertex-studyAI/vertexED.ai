import type { LearnerProfile } from '@/lib/learnerProfile';

export type ReadinessBand = 'warming' | 'building' | 'exam-ready' | 'unknown';

export type ExamReadiness = {
  score: number | null;
  band: ReadinessBand;
  label: string;
  hasData: boolean;
  factors: { name: string; score: number; max: number; detail: string }[];
};

function bandForScore(score: number): ReadinessBand {
  if (score >= 72) return 'exam-ready';
  if (score >= 42) return 'building';
  return 'warming';
}

function bandLabel(band: ReadinessBand): string {
  switch (band) {
    case 'exam-ready':
      return 'Closing gaps — keep the loop spinning';
    case 'building':
      return 'Momentum building — one loop step today helps';
    case 'warming':
      return 'Early week — pick one step and start';
    default:
      return 'Complete a session to see a score';
  }
}

export function computeExamReadiness(profile: LearnerProfile): ExamReadiness {
  void profile;
  const score = null;
  const band: ReadinessBand = 'unknown';
  const factors = [
    {
      name: 'Verified scoring',
      score: 0,
      max: 1,
      detail: 'Readiness stays withheld until verified assessment evidence exists.',
    },
  ];

  return {
    score,
    band,
    hasData: false,
    label: bandLabel(band),
    factors,
  };
}
