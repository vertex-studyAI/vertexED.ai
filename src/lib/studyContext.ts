import { getLearnerProfile, buildLearnerContextForAi } from '@/lib/learnerProfile';

export type StudyPageContext = {
  page: string;
  label: string;
  hint: string;
  learnerSummary?: string;
};

const ROUTE_CONTEXT: Record<string, StudyPageContext> = {
  '/learning-hub': {
    page: 'learning-hub',
    label: 'Learning Hub',
    hint: 'Guide the student through their connected learning path and subject tracks.',
  },
  '/main': {
    page: 'dashboard',
    label: 'Dashboard',
    hint: 'Help the student pick their next best study action for tonight.',
  },
  '/notetaker': {
    page: 'ai-notes',
    label: 'AI Notes & Flashcards',
    hint: 'Discuss note structure, flashcard ideas, or quiz prep from their notes.',
  },
  '/study-zone': {
    page: 'study-zone',
    label: 'Study Zone',
    hint: 'Support focused sessions — timers, habits, quick notes, graphing.',
  },
  '/chatbot': {
    page: 'chatbot',
    label: 'Apex',
    hint: 'Deliberate step-by-step on concepts; ask clarifying questions before giving full solutions.',
  },
  '/planner': {
    page: 'planner',
    label: 'Study Planner',
    hint: 'Help schedule tasks, balance subjects, and plan revision blocks.',
  },
  '/answer-reviewer': {
    page: 'answer-reviewer',
    label: 'Answer Reviewer',
    hint: 'Discuss rubric feedback, how to improve answers, and exam technique.',
  },
  '/paper-maker': {
    page: 'paper-maker',
    label: 'Paper Maker',
    hint: 'Help with mock exam strategy, topic selection, and question approach.',
  },
  '/archives': {
    page: 'archives',
    label: 'Archives',
    hint: 'Guide toward curated resources and exemplar-style answers.',
  },
  '/study-tools': {
    page: 'study-tools',
    label: 'Study Tools Hub',
    hint: 'Help with formulas, study techniques, and tool selection.',
  },
  '/study-notebook': {
    page: 'study-notebook',
    label: 'Study Notebook',
    hint: 'Answer questions grounded in the student\'s uploaded sources. Cite sources by title. If not in sources, say so.',
  },
};

export function getStudyContext(
  pathname: string,
  user?: { user_metadata?: Record<string, unknown> | null } | null,
): StudyPageContext {
  const base = pathname.split('?')[0];
  const profile = getLearnerProfile(user ?? null);
  const learnerSummary = buildLearnerContextForAi(profile);

  const baseCtx = ROUTE_CONTEXT[base];
  if (baseCtx) {
    return {
      ...baseCtx,
      hint: `${baseCtx.hint} Learner profile: ${learnerSummary}`,
      learnerSummary,
    };
  }

  if (base.startsWith('/resources')) {
    return {
      page: 'resources',
      label: 'Resources',
      hint: `Explain study techniques and how VertexED tools apply. Learner profile: ${learnerSummary}`,
      learnerSummary,
    };
  }
  if (base.startsWith('/archives')) {
    return { ...ROUTE_CONTEXT['/archives'], learnerSummary, hint: `${ROUTE_CONTEXT['/archives'].hint} Learner profile: ${learnerSummary}` };
  }

  return {
    page: 'vertexed',
    label: 'VertexED',
    hint: `General academic support for exam students. Learner profile: ${learnerSummary}`,
    learnerSummary,
  };
}
