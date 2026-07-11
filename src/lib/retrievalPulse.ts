import { computeExamReadiness } from '@/lib/examReadiness';
import { getLoopWeekStatus, LOOP_STEPS, type LoopStep } from '@/lib/studyLoopTracker';
import { getWeaknessHeatmap } from '@/lib/weaknessTracker';
import { getDueFlashcardCount } from '@/lib/srDeck';
import { getTodayPlannerTasks } from '@/lib/studyEcosystem';
import { daysUntilExam } from '@/lib/curriculum';
import type { LearnerProfile } from '@/lib/learnerProfile';
import type { AdaptiveRecommendation } from '@/lib/adaptiveLearning';

export type PulseSignal = {
  label: string;
  value: string;
  urgency: 'low' | 'medium' | 'high';
};

export type RetrievalPulse = {
  readiness: ReturnType<typeof computeExamReadiness>;
  headline: string;
  narrative: string;
  nextAction: { label: string; href: string; reason: string };
  loopGap: LoopStep | null;
  signals: PulseSignal[];
  apexPrompt: string;
};

function nextMissingLoopStep(): LoopStep | null {
  const { missing } = getLoopWeekStatus();
  return missing[0] ?? null;
}

export function buildRetrievalPulse(
  profile: LearnerProfile,
  adaptiveRecs: AdaptiveRecommendation[] = [],
): RetrievalPulse {
  const readiness = computeExamReadiness(profile);
  const loop = getLoopWeekStatus();
  const dueCards = getDueFlashcardCount();
  const tasks = getTodayPlannerTasks();
  const weak = getWeaknessHeatmap(1)[0];
  const examDays = daysUntilExam(profile.curriculum.examDate ?? null);
  const loopGap = nextMissingLoopStep();

  const signals: PulseSignal[] = [];

  if (dueCards > 0) {
    signals.push({
      label: 'Spaced retrieval',
      value: `${dueCards} card${dueCards === 1 ? '' : 's'} due`,
      urgency: dueCards >= 12 ? 'high' : 'medium',
    });
  }

  if (weak && weak.avgPercent < 65) {
    signals.push({
      label: 'Weak topic',
      value: `${weak.topic} (${Math.round(weak.avgPercent)}%)`,
      urgency: weak.avgPercent < 45 ? 'high' : 'medium',
    });
  }

  if (tasks.length > 0) {
    signals.push({
      label: 'Planner',
      value: `${tasks.length} task${tasks.length === 1 ? '' : 's'} today`,
      urgency: 'low',
    });
  }

  if (examDays != null && examDays <= 21) {
    signals.push({
      label: 'Exam countdown',
      value: examDays === 0 ? 'Today' : `${examDays} day${examDays === 1 ? '' : 's'}`,
      urgency: examDays <= 7 ? 'high' : 'medium',
    });
  }

  signals.push({
    label: 'Study loop',
    value: `${loop.completed.length}/5 this week`,
    urgency: loop.completed.length < 2 ? 'medium' : 'low',
  });

  let nextAction = { label: 'Open Study Zone', href: '/study-zone', reason: 'Start with a focused 25-minute block on one topic.' };
  let headline = 'Your retrieval pulse';
  let narrative = 'One honest session today — timed practice or due cards — beats a long plan you never run.';
  let apexPrompt = 'I have 25 minutes tonight. What should I do first for the best return on marks?';

  const topRec = adaptiveRecs[0];
  if (topRec?.priority === 'urgent' || topRec?.priority === 'high') {
    nextAction = { label: topRec.title, href: topRec.to, reason: topRec.description };
    apexPrompt = `Help me with: ${topRec.title}. ${topRec.description}`;
  } else if (dueCards >= 8) {
    nextAction = { label: 'Review flashcards', href: '/notetaker', reason: `${dueCards} cards are due — retrieval before new content.` };
    headline = 'Memory is calling';
    narrative = 'Due cards mean material you almost knew is about to fade. A short review now compounds.';
    apexPrompt = `I have ${dueCards} flashcards due. Help me prioritise which topics to hit first in 20 minutes.`;
  } else if (weak && weak.avgPercent < 55) {
    nextAction = {
      label: `Drill ${weak.topic}`,
      href: `/paper-maker?subject=${encodeURIComponent(weak.subject)}`,
      reason: `Recent scores on ${weak.topic} are below passing shape.`,
    };
    headline = 'Gap spotted';
    narrative = `${weak.topic} keeps showing up weak. A targeted mock beats re-reading the chapter.`;
    apexPrompt = `My weakest topic is ${weak.topic} in ${weak.subject}. Ask me one Socratic question to test if I actually understand it.`;
  } else if (loopGap) {
    const step = LOOP_STEPS.find((s) => s.id === loopGap)!;
    nextAction = {
      label: step.label,
      href: step.href,
      reason: `You haven't ${step.verb.toLowerCase()} yet this week — the loop only works closed.`,
    };
    headline = 'Close the loop';
    narrative = `This week's loop is ${loop.completionPercent}% complete. The missing piece: ${step.label.toLowerCase()}.`;
    apexPrompt = `I haven't done the "${step.label}" step in my revision loop this week. What should a realistic ${step.label.toLowerCase()} session look like tonight?`;
  } else if (examDays != null && examDays <= 14) {
    nextAction = { label: 'Mock under time', href: '/paper-maker', reason: 'Exam fortnight — pace and rubric shape matter now.' };
    headline = 'Exam fortnight';
    narrative = `${examDays} days left. Prioritise timed practice and rubric feedback over new content.`;
    apexPrompt = `My exam is in ${examDays} days. Help me plan today and tomorrow for maximum marks without burning out.`;
  } else if (readiness.score >= 72) {
    headline = 'Strong rhythm';
    narrative = 'Loop, streak, and retrieval are in decent shape. Push depth on your weakest topic or run a Socratic drill with Apex.';
    apexPrompt = 'Quiz me Socratic-style on my weakest topic — one question at a time, no answers until I try.';
  }

  return {
    readiness,
    headline,
    narrative,
    nextAction,
    loopGap,
    signals,
    apexPrompt,
  };
}
