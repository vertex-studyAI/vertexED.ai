import type { StudyPageContext } from '@/lib/studyContext';

export const APEX_TAGLINE = 'Discussion-first study AI — asks what you have tried, then explains step by step before suggesting a fix.';

export type ApexPrompt = {
  label: string;
  text: string;
};

const DEFAULT_PROMPTS: ApexPrompt[] = [
  { label: 'Stuck on a concept', text: 'I keep re-reading this topic but it still feels fuzzy. Ask me what I know, then guide me.' },
  { label: 'Essay structure', text: 'Help me stress-test my essay thesis against the question — don\'t rewrite it for me.' },
  { label: 'Exam technique', text: 'What separates a 6/8 from an 8/8 on a long-response question in my board?' },
  { label: 'Revision plan', text: 'I have 45 minutes tonight. What should I do for maximum marks with one weak topic?' },
];

const CONTEXT_PROMPTS: Partial<Record<string, ApexPrompt[]>> = {
  dashboard: [
    { label: 'Where to start', text: 'Look at my week — what should I tackle first for the best return on time?' },
    { label: 'Focus block', text: 'Help me plan a 25-minute Study Zone session with a clear end goal.' },
    ...DEFAULT_PROMPTS.slice(0, 2),
  ],
  'answer-reviewer': [
    { label: 'Understand feedback', text: 'Walk me through what the reviewer meant — one missing mark at a time.' },
    { label: 'Retry strategy', text: 'How should I rewrite this paragraph to earn the analysis marks?' },
    { label: 'Command terms', text: 'Explain what "evaluate" requires that "describe" does not.' },
  ],
  'paper-maker': [
    { label: 'Mock strategy', text: 'How should I approach this mock under time — skim first or question by question?' },
    { label: 'Weak topic', text: 'I always lose marks on this unit. What should I practise in the next 30 minutes?' },
  ],
  'study-zone': [
    { label: 'Stay focused', text: 'I keep drifting in this session. Help me break the next 20 minutes into micro-goals.' },
    { label: 'Check working', text: 'I think I have the right method — ask me one question that would expose a gap.' },
  ],
  chatbot: DEFAULT_PROMPTS,
  planner: [
    { label: 'Realistic week', text: 'Help me fit revision around school and sport — no fantasy 4-hour blocks.' },
    { label: 'Priority order', text: 'I have three deadlines this week. How should I sequence the work?' },
  ],
};

export function getApexPrompts(context: StudyPageContext): ApexPrompt[] {
  return CONTEXT_PROMPTS[context.page] ?? DEFAULT_PROMPTS;
}

export function formatHandoffPrefill(handoff: Record<string, string>): string {
  return [
    handoff.feedback && `Here is feedback on my answer:\n${handoff.feedback.slice(0, 1200)}`,
    handoff.question && `Question: ${handoff.question}`,
    'Help me understand how to improve my response step by step — ask what I tried before giving the fix.',
  ]
    .filter(Boolean)
    .join('\n\n');
}
