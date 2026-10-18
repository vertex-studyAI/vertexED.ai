export type StudyLoopStage = {
  id: 'plan' | 'focus' | 'practise' | 'review' | 'remember';
  label: string;
  heading: string;
  summary: string;
  question: string;
  href: string;
};

export const STUDY_LOOP_STAGES: StudyLoopStage[] = [
  {
    id: 'plan',
    label: 'Plan',
    heading: 'Choose a small, observable target.',
    summary: 'Start from the course, deadline and time you actually have. Define what you will produce: an attempted question, a short explanation or a checked set of notes.',
    question: 'What will exist at the end of this study block?',
    href: '/planner',
  },
  {
    id: 'focus',
    label: 'Focus',
    heading: 'Protect the attempt from avoidable noise.',
    summary: 'Use one source, one task and a realistic time boundary. Hints can wait until you have written enough working to reveal where the difficulty begins.',
    question: 'What can I try before I open another explanation?',
    href: '/study-zone',
  },
  {
    id: 'practise',
    label: 'Practise',
    heading: 'Retrieve and apply, not only reread.',
    summary: 'Rebuild the idea from memory, answer an original question and show each step. Vary the context so familiarity with one example is not mistaken for flexible understanding.',
    question: 'Can I use the idea when the surface details change?',
    href: '/learn',
  },
  {
    id: 'review',
    label: 'Review',
    heading: 'Name the first meaningful gap.',
    summary: 'Compare the attempt with an accepted source. Separate a knowledge gap from a command-term, calculation, evidence or communication error before choosing the next task.',
    question: 'Where did my reasoning first stop being supported?',
    href: '/answer-reviewer',
  },
  {
    id: 'remember',
    label: 'Remember',
    heading: 'Return after some forgetting has happened.',
    summary: 'Schedule a short retry, then test the same idea in a new form. Keep the original attempt and the later one together so progress remains inspectable rather than assumed.',
    question: 'What should I be able to reconstruct next time?',
    href: '/saved-work',
  },
];

export const LEARNING_DESIGN_COMMITMENTS = [
  {
    title: 'The learner makes the attempt',
    copy: 'VertexED can organise a task, reveal a hint and suggest a follow-up. It should not erase the learner’s working or replace the moment of retrieval.',
  },
  {
    title: 'Feedback points to evidence',
    copy: 'Useful feedback identifies the line, decision or missing relationship that needs attention. Broad praise and unexplained scores are not enough to guide revision.',
  },
  {
    title: 'AI output stays provisional',
    copy: 'Generated explanations, questions and feedback need checking against accepted course material. An AI response is a study aid, not an official mark or source.',
  },
  {
    title: 'The revision trace stays visible',
    copy: 'Attempts, sources, feedback and retries belong in one readable sequence. Learners should be able to tell what was saved, what changed and what still needs verification.',
  },
] as const;

export const LIBRARY_STUDY_MOVES = [
  {
    label: 'Orient',
    title: 'Locate the course and concept.',
    copy: 'Use the directory to narrow the field. Check the programme, subject, topic and review status before treating a page as study material.',
  },
  {
    label: 'Retrieve',
    title: 'Write what you know first.',
    copy: 'Turn the heading into a question. Sketch the method, definition or argument from memory before reading the explanation in full.',
  },
  {
    label: 'Practise',
    title: 'Produce a new response.',
    copy: 'Use an original prompt, show your reasoning and record uncertainty. A complete attempt gives the review stage something specific to inspect.',
  },
  {
    label: 'Verify',
    title: 'Check the source and schedule a return.',
    copy: 'Compare the response with accepted course material, correct the first unsupported step and create a smaller retry for a later session.',
  },
] as const;

export function studyStageForPath(pathname: string): StudyLoopStage['id'] {
  if (/planner|calendar|coursework|onboarding/.test(pathname)) return 'plan';
  if (/study-zone|notetaker|chatbot/.test(pathname)) return 'focus';
  if (/answer-reviewer|mistake|saved-work/.test(pathname)) return 'review';
  if (/resources|study-guides|archives/.test(pathname)) return 'remember';
  return 'practise';
}
