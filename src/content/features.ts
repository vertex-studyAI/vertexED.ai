type Feature = {
  id: string;
  title: string;
  tagline: string;
  body: string;
  detail: string;
  bullets: string[];
};

export const PLATFORM_FEATURES: Feature[] = [
  {
    id: 'study-zone',
    title: 'Study Zone',
    tagline: 'One room for deep work',
    body: 'Timers, calculators, habit logs, meditation breaks, and quick notes — arranged so you never leave flow state to hunt for a tool. Session analytics show what actually correlates with improvement, not just hours logged.',
    detail: 'Built for the long session: Sunday revision blocks, pre-mock warmups, and the 11pm problem set when everything else is quiet.',
    bullets: [
      'Focus timers with break prompts that respect cognitive load',
      'Activity log that ties sessions to subjects and outcomes',
      'Graphing and math helpers surfaced in context',
    ],
  },
  {
    id: 'apex',
    title: 'Apex',
    tagline: 'Explain, don\'t just answer',
    body: 'Apex is an academic companion that meets you where your understanding is. It walks through why a step works, challenges weak reasoning, and adapts explanations to your board — without dumping an essay when you asked for clarity.',
    detail: 'Use it to deliberate perspectives in humanities, sanity-check a proof, or unpack a mark-scheme criterion before you rewrite an answer.',
    bullets: [
      'Step-by-step reasoning with room for follow-up questions',
      'Board-aware terminology (IB, IGCSE, AP, A Level, and more)',
      'Discussion mode for essays, TOK angles, and science models',
    ],
  },
  {
    id: 'planner',
    title: 'Study Planner',
    tagline: 'A schedule you will actually follow',
    body: 'Tell VertexED your deadlines, subjects, and constraints. The planner proposes realistic blocks — recall bursts, problem sets, mock slots — and leaves you in control when life shifts.',
    detail: 'Distributed practice beats cramming. The calendar is designed around that evidence, not guilt.',
    bullets: [
      'Balances coursework, extracurriculars, and revision',
      'Session types mapped to what you need next, not generic "study"',
      'Editable plans when mocks move or priorities change',
    ],
  },
  {
    id: 'paper-maker',
    title: 'Paper Maker',
    tagline: 'Practice that feels like the real paper',
    body: 'Generate mocks aligned to your syllabus: command words, mark allocation, and difficulty curves that mirror what you will see on exam day. No generic trivia — papers shaped like the boards you sit.',
    detail: 'Supported orientations include IB MYP, IBDP, IGCSE, ICSE, CBSE, AP, and A Level (unaffiliated with exam boards).',
    bullets: [
      'Topic and difficulty controls per subject',
      'Mixed papers or focused drills on weak areas',
      'Export and revisit sets inside your saved work',
    ],
  },
  {
    id: 'answer-reviewer',
    title: 'Answer Reviewer',
    tagline: 'Feedback that names what to fix',
    body: 'Submit written responses and get rubric-aware critique: where marks were earned, where they were lost, and what to change in the next attempt. Math renders properly — integrals and derivatives look like math, not plain text.',
    detail: 'The goal is exam technique plus understanding — structure, precision, and the ideas examiners reward.',
    bullets: [
      'Mark-scheme style breakdowns, not vague praise',
      'Actionable next steps tied to topics and question types',
      'Handoff from generated papers straight into review',
    ],
  },
  {
    id: 'notes',
    title: 'Notes · Flashcards · Quiz',
    tagline: 'From capture to retrieval in one loop',
    body: 'Record or paste notes, auto-structure them, and spin up flashcards and quizzes without switching apps. Spaced repetition is built in because remembering is the point — not collecting highlights.',
    detail: 'Close the loop: exposure → condensation → deliberate recall → measurable retention.',
    bullets: [
      'Lecture capture with timestamped snapshots',
      'One-click flashcard and quiz generation',
      'Spaced repetition deck with due-card tracking',
    ],
  },
];

export const PROBLEM_INSIGHTS = [
  {
    stat: '65%',
    title: 'Resources without structure',
    text: 'Students drown in PDFs, playlists, and problem sets but rarely know if tonight moved them closer to exam-ready. The information exists — the path through it does not.',
  },
  {
    stat: '70%',
    title: 'Notes that never become memory',
    text: 'Highlighting feels productive until the notebook closes and nothing sticks. Passive re-reading trains recognition, not recall — and exams punish that gap every time.',
  },
  {
    stat: '80%',
    title: 'Practice on the wrong shape',
    text: 'Generic quizzes rarely mirror command words, mark schemes, or timing pressure. You train on the wrong question — then wonder why the hall feels unfamiliar.',
  },
];

export const MATH_DEMO_LINES = [
  'The area under f(x) from 0 to 2 is given by ∫_0^2 f(x) dx.',
  'For y = x^3, the derivative dy/dx = 3x^2.',
  'Quadratic roots: x = (-b ± √(b^2 - 4ac)) / 2a.',
];
