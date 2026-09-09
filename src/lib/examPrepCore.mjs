export const EXAM_PREP_PHASES = {
  setup: {
    label: 'Set your target',
    shortLabel: 'Setup',
    description: 'Add an exam date and subjects so the plan can use your actual timeline.',
  },
  foundation: {
    label: 'Build the base',
    shortLabel: 'Foundation',
    description: 'Cover the syllabus steadily and check understanding with short practice.',
  },
  build: {
    label: 'Turn knowledge into marks',
    shortLabel: 'Build',
    description: 'Mix topic repair with timed questions and mark-scheme review.',
  },
  simulate: {
    label: 'Practise under exam conditions',
    shortLabel: 'Simulation',
    description: 'Use timed papers, review every lost mark, and retest the gaps.',
  },
  taper: {
    label: 'Protect recall and energy',
    shortLabel: 'Final days',
    description: 'Use short retrieval, a small number of weak-topic checks, and enough rest.',
  },
  complete: {
    label: 'Close the loop',
    shortLabel: 'Review',
    description: 'Record what happened, keep useful feedback, and set the next exam date.',
  },
};

export function getExamPrepPhase(daysToExam) {
  if (daysToExam === null || !Number.isFinite(daysToExam)) return 'setup';
  if (daysToExam < 0) return 'complete';
  if (daysToExam <= 3) return 'taper';
  if (daysToExam <= 14) return 'simulate';
  if (daysToExam <= 42) return 'build';
  return 'foundation';
}

export function examDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function examSessionKey({ day, subject, minutes, mission }) {
  return JSON.stringify([day, subject, minutes, mission.kind, mission.title, mission.retryId ?? null]);
}

export function chooseExamMission({ pendingMock, dueRetry, weakestTopic, dueCards = 0, subject = '', mode = 'recommended' }) {
  if (mode === 'diagnostic') return { kind: 'diagnostic', title: `Try a short ${subject || 'subject'} baseline`, detail: 'Optional practice to identify topics to review. This is not a validated diagnostic assessment.' };
  if (mode === 'revision') return { kind: 'revision', title: `Revise ${subject || 'one topic'}`, detail: 'Recall a topic from memory, then check your explanation against your course notes.' };
  if (mode === 'practice') return { kind: 'practice', title: `Practise ${subject || 'one subject'}`, detail: 'Choose a topic and attempt an exam-style question. A diagnostic is not required.' };
  const matches = (item) => item && (!subject || item.subject?.trim().toLowerCase() === subject.trim().toLowerCase());
  if (!matches(pendingMock)) pendingMock = null;
  if (!matches(dueRetry)) dueRetry = null;
  if (!matches(weakestTopic)) weakestTopic = null;
  if (pendingMock?.status === 'awaiting_review') {
    return {
      kind: 'review-mock',
      title: `Review ${pendingMock.paperTitle || 'your completed paper'}`,
      detail: `${pendingMock.answered || 0} of ${pendingMock.total || 0} answers are ready for feedback.`,
    };
  }
  if (pendingMock?.status === 'in_progress') {
    return {
      kind: 'finish-mock',
      title: `Finish ${pendingMock.paperTitle || 'your timed paper'}`,
      detail: `${pendingMock.answered || 0} of ${pendingMock.total || 0} answers completed.`,
    };
  }
  if (dueRetry) {
    return {
      kind: 'retry',
      title: `Retest ${dueRetry.topic}`,
      detail: `This ${dueRetry.subject || subject || 'topic'} gap is due for another measured attempt.`,
      retryId: dueRetry.id,
    };
  }
  if (weakestTopic && Number.isFinite(weakestTopic.avgPercent) && weakestTopic.avgPercent < 70) {
    return {
      kind: 'weak-topic',
      title: `Work on ${weakestTopic.topic}`,
      detail: `Your recorded marks average ${Math.round(weakestTopic.avgPercent)}% here.`,
    };
  }
  if (dueCards > 0) {
    return {
      kind: 'flashcards',
      title: `Retrieve ${dueCards} due card${dueCards === 1 ? '' : 's'} across subjects`,
      detail: 'This is your mixed-subject flashcard queue, not a subject-specific recommendation.',
    };
  }
  return {
    kind: 'practice',
    title: `Practise ${subject || 'one subject'}`,
    detail: 'Choose a topic and attempt a question. You can select an optional baseline instead.',
  };
}

export function buildExamSession({ minutes = 25, phase = 'build', mission }) {
  const total = Math.min(120, Math.max(15, Math.round(Number(minutes) || 25)));
  const warmupMinutes = Math.max(3, Math.round(total * 0.2));
  const reviewMinutes = Math.max(4, Math.round(total * (phase === 'simulate' ? 0.25 : 0.2)));
  const practiceMinutes = total - warmupMinutes - reviewMinutes;
  const coreTitle = mission?.title || 'Complete one exam-style task';

  return [
    {
      id: 'retrieve',
      minutes: warmupMinutes,
      title: 'Retrieve before reviewing',
      detail: 'Write what you remember, including one formula, definition, or argument you expect to use.',
    },
    {
      id: 'practice',
      minutes: practiceMinutes,
      title: coreTitle,
      detail: 'Work without notes. Mark uncertainty as you go so review stays focused.',
    },
    {
      id: 'review',
      minutes: reviewMinutes,
      title: 'Mark, explain, and schedule the gap',
      detail: 'Check against trusted evidence, explain one lost mark, then choose what needs another attempt.',
    },
  ];
}

export function summarizePreparationEvidence({ profileReady, loopSteps = 0, measuredTopics = 0, reviewedWork = false }) {
  const checks = [
    { id: 'profile', label: 'Exam target set', complete: Boolean(profileReady) },
    { id: 'loop', label: 'Study loop active this week', complete: loopSteps > 0 },
    { id: 'measurements', label: 'Verified topic evidence recorded', complete: measuredTopics > 0 },
    { id: 'review', label: 'Paper or retry ready to review', complete: Boolean(reviewedWork) },
  ];
  return { complete: checks.filter((check) => check.complete).length, total: checks.length, checks };
}
