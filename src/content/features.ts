export type Feature = {
  id: string;
  title: string;
  tagline: string;
  lead: string;
  body: string;
  detail: string;
  scenario: string;
  outcomes: string[];
  bullets: string[];
  href?: string;
};

export const STUDY_LOOP = [
  { step: "Plan", desc: "Block time around real deadlines — not fantasy 6-hour sessions." },
  { step: "Focus", desc: "Study Zone keeps timers, tools, and logs in one calm workspace." },
  { step: "Practise", desc: "Mocks shaped like your board, not random multiple choice." },
  { step: "Review", desc: "Rubric feedback that says what to fix, not \"good job\"." },
  { step: "Remember", desc: "Flashcards with spacing so material survives past the test week." },
] as const;

export const SUPPORTED_BOARDS = [
  "IB MYP",
  "IBDP",
  "IGCSE",
  "ICSE",
  "CBSE",
  "AP",
  "A Level",
] as const;

export const PLATFORM_FEATURES: Feature[] = [
  {
    id: "study-zone",
    title: "Study Zone",
    tagline: "One room for deep work",
    lead: "Two hours before bed. One tab open. Timer running, calculator nearby, session logged — no hunting through bookmarks.",
    body: "Study Zone is where long sessions actually happen. Timers with sensible breaks, a graphing calculator when you need to check a shape, habit tracking for the routines that stick, and an activity log that records what you worked on — not just how long you sat there.",
    detail: "We built this because every \"productivity stack\" we tried meant leaving the desk to find another tool. Study Zone keeps the friction low so attention stays on the material.",
    scenario: "Sunday afternoon: 90-minute chemistry block. Start the timer, log the topic, use the calculator for a quick enthalpy check, note what still felt shaky in the activity log. Next session, you know exactly where to pick up.",
    outcomes: [
      "Fewer context switches mid-session",
      "A honest record of what you actually covered",
      "Tools surfaced when you need them, hidden when you don't",
    ],
    bullets: [
      "Focus timers with break prompts tuned for sustained work",
      "Activity log tied to subjects and session notes",
      "Graphing calculator and math helpers without leaving the page",
      "Habit tracker and short meditation breaks for long revision days",
    ],
    href: "/study-zone",
  },
  {
    id: "apex",
    title: "Apex",
    tagline: "Explain, don't just answer",
    lead: "You don't need another wall of text. You need someone to walk through why the step works — and what would break if you skipped it.",
    body: "Apex is an academic companion, not a answer machine. It explains in plain language first, then builds depth when you ask. It can challenge a weak line of reasoning, suggest how an examiner might phrase the question, and stay patient when you're stuck on step two of a proof.",
    detail: "It knows your board context where it matters — command words, mark scheme language, the difference between \"describe\" and \"evaluate\" — without turning every reply into an essay.",
    scenario: "You're rewriting a history paragraph and the argument feels thin. Apex helps you test whether each sentence earns its place, suggests where evidence is missing, and pushes you to link back to the question stem — the kind of feedback you'd want before handing it in.",
    outcomes: [
      "Understanding that survives the next mock, not just tonight's homework",
      "Clearer essays and structured science responses",
      "A place to deliberate ideas before committing them to paper",
    ],
    bullets: [
      "Follow-up questions instead of one-shot dumps",
      "Board-aware terminology and rubric language",
      "Strong for humanities debate, science models, and math intuition",
      "Available across the app when you're on a tool page",
    ],
    href: "/chatbot",
  },
  {
    id: "planner",
    title: "Study Planner",
    tagline: "A week you can actually run",
    lead: "The problem isn't that students don't plan. It's that plans ignore real life — matches, labs, the mock that moved to Thursday.",
    body: "The planner asks what you're sitting, when, and what else competes for your time. It proposes blocks: short recall bursts, longer problem sets, mock slots before the real thing. You edit everything. When school shifts a deadline, the plan shifts with you.",
    detail: "Spacing and mixed practice are baked into how sessions are suggested — not because it sounds good in a blog post, but because cramming the night before is a strategy everyone regrets.",
    scenario: "Three subjects, two assessments in the same fortnight. The planner spreads chemistry retrieval across four evenings, leaves Friday lighter for an essay draft, and books a full mock paper for Saturday morning when you're freshest.",
    outcomes: [
      "Revision that fits around sport, clubs, and sleep",
      "Less guilt from unrealistic 8-hour blocks",
      "Visible progress through the week, not just a todo list",
    ],
    bullets: [
      "Calendar view with session types, not generic \"study\"",
      "Balances weak topics with upcoming deadlines",
      "Editable when mocks move or priorities change",
      "Connects to what you run in Study Zone and Paper Maker",
    ],
    href: "/planner",
  },
  {
    id: "paper-maker",
    title: "Paper Maker",
    tagline: "Practice that feels like the hall",
    lead: "Generic quizzes train the wrong muscle. You need command words, mark allocation, and timing — the shape of the paper you'll actually sit.",
    body: "Paper Maker generates mocks aligned to your syllabus: topic selection, difficulty, and phrasing that respects how your board writes questions. Run a full paper under timed conditions or drill one topic until the method is automatic.",
    detail: "VertexED is not affiliated with exam boards. We study past paper patterns and mark schemes to approximate the rigour you should expect — then you practise until the format feels familiar, not frightening.",
    scenario: "IGCSE physics paper next month. You generate a Paper 2-style set on electricity and magnetism, sit it in 75 minutes, then send your written responses to Answer Reviewer. Weak areas feed back into next week's planner blocks.",
    outcomes: [
      "Less surprise on exam day from unfamiliar wording",
      "Timed practice that builds pace, not just knowledge",
      "Papers saved in your work history for repeat attempts",
    ],
    bullets: [
      "Topic and difficulty controls per subject",
      "Mixed papers or focused drills on weak areas",
      "Handoff to Answer Reviewer in one click",
      "Boards: IB MYP, IBDP, IGCSE, ICSE, CBSE, AP, A Level",
    ],
    href: "/paper-maker",
  },
  {
    id: "answer-reviewer",
    title: "Answer Reviewer",
    tagline: "Marks earned, marks lost",
    lead: "You wrote three pages. You still don't know if it's worth six marks or two. That's the gap we wanted to close.",
    body: "Submit a response — typed or photographed — and get feedback aligned to how examiners think: where marks were gained, where they were lost, and what to change in the next draft. Math notation renders properly; ∫ and dy/dx look like math, not broken symbols.",
    detail: "The reviewer is deliberately strict. \"Good effort\" doesn't help you improve. Naming the missing definition, the weak linkage, or the step you skipped does.",
    scenario: "A 6-mark biology extended response. The reviewer flags that you described the process but didn't link it to the question's command term, suggests one concrete example to add, and points you to a similar prompt to retry tomorrow.",
    outcomes: [
      "Answers that read like top-band responses over time",
      "Clear next steps instead of vague encouragement",
      "Technique improvements you can apply across subjects",
    ],
    bullets: [
      "Rubric-style breakdowns with specific gaps named",
      "Works with papers you generated or pastes from class",
      "Image upload for handwritten work",
      "Math and science notation rendered with KaTeX",
    ],
    href: "/answer-reviewer",
  },
  {
    id: "notes",
    title: "Notes · Flashcards · Quiz",
    tagline: "Capture once, recall many times",
    lead: "Highlighting feels productive until you close the book. The work is turning notes into something your memory will actually retrieve under pressure.",
    body: "Record or paste notes, structure them quickly, and spin up flashcards and quizzes in the same flow. Spaced repetition schedules reviews so cards resurface when you're about to forget — not when you've already forgotten.",
    detail: "The loop is deliberate: exposure in class or from a text, condensation into cards, retrieval practice with honest feedback, then spacing so it sticks past the unit test.",
    scenario: "After a history unit, you paste key dates and arguments, generate ten flashcards, run a quiz, and mark what you missed. The deck schedules the weak cards for Wednesday; the planner already has a 20-minute slot for them.",
    outcomes: [
      "Notes that become practice, not archive",
      "Measurable retention instead of false confidence",
      "One workflow from lecture to exam-ready recall",
    ],
    bullets: [
      "Note capture with export to Word or PDF",
      "Flashcard generation from your own material",
      "Quiz mode with accuracy tracking over time",
      "Spaced repetition with due-card counts on the dashboard",
    ],
    href: "/notetaker",
  },
];

export const PROBLEM_INSIGHTS = [
  {
    stat: "65%",
    title: "Resources without structure",
    text: "Students drown in PDFs, playlists, and problem sets but rarely know if tonight moved them closer to exam-ready. The information exists — the path through it does not.",
  },
  {
    stat: "70%",
    title: "Notes that never become memory",
    text: "Highlighting feels productive until the notebook closes and nothing sticks. Passive re-reading trains recognition, not recall — and exams punish that gap every time.",
  },
  {
    stat: "80%",
    title: "Practice on the wrong shape",
    text: "Generic quizzes rarely mirror command words, mark schemes, or timing pressure. You train on the wrong question — then wonder why the hall feels unfamiliar.",
  },
];

export const MATH_DEMO_LINES = [
  "The area under f(x) from 0 to 2 is given by ∫_0^2 f(x) dx.",
  "For y = x^3, the derivative dy/dx = 3x^2.",
  "Quadratic roots: x = (-b ± √(b^2 - 4ac)) / 2a.",
];
