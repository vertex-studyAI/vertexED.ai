import {
  BookOpen,
  Bot,
  Calendar,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Library,
  Timer,
  Wrench,
  type LucideIcon,
} from "lucide-react";

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
  whenToUse: string[];
  notFor: string;
  connectsTo: { id: string; label: string }[];
  href?: string;
  icon: LucideIcon;
  boards?: string[];
};

export type EcosystemExtra = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  href: string;
  icon: LucideIcon;
};

export const FEATURE_ICONS = {
  "study-zone": Timer,
  apex: Bot,
  planner: Calendar,
  "paper-maker": FileText,
  "answer-reviewer": ClipboardCheck,
  notes: BookOpen,
} as const;

export const STUDY_LOOP = [
  {
    step: "Plan",
    desc: "Block time around real deadlines — not fantasy 6-hour sessions.",
    tool: "Study Planner",
    href: "/planner",
  },
  {
    step: "Focus",
    desc: "One workspace for timers, tools, and honest session logs.",
    tool: "Study Zone",
    href: "/study-zone",
  },
  {
    step: "Practise",
    desc: "Mocks with command words and mark schemes you recognise.",
    tool: "Paper Maker",
    href: "/paper-maker",
  },
  {
    step: "Review",
    desc: "Feedback that names marks earned and marks lost.",
    tool: "Answer Reviewer",
    href: "/answer-reviewer",
  },
  {
    step: "Remember",
    desc: "Flashcards on a schedule — not the night before.",
    tool: "Notes & Quiz",
    href: "/notetaker",
  },
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

export const BOARD_SPOTLIGHTS = [
  {
    board: "IBDP",
    note: "Extended responses, TOK angles, and sciences with show-your-working expectations — Paper Maker and Reviewer respect command terms like evaluate and justify.",
  },
  {
    board: "IGCSE",
    note: "Mixed papers with structured short answers; timed mocks help you learn pace before the hall feels rushed.",
  },
  {
    board: "AP",
    note: "FRQ-style practice and rubric feedback on free-response structure — not just whether the final number matches.",
  },
  {
    board: "A Level",
    note: "Longer written arguments and multi-step maths; Apex helps you test logic before you commit pen to paper.",
  },
  {
    board: "CBSE / ICSE",
    note: "Structured short answers and numericals with step marks — Reviewer highlights where working earns credit vs where you jumped too fast.",
  },
  {
    board: "IB MYP",
    note: "Criteria-based tasks and interdisciplinary projects; Planner helps you stage work across subjects without everything landing the same week.",
  },
] as const;

export const REVISION_WEEK = [
  {
    day: "Monday",
    title: "Map the week",
    text: "Open the planner. Drop in the mock on Thursday, the essay draft due Friday, and two lighter evenings for sport. Assign chemistry retrieval to Tuesday and Thursday — 25 minutes each, not a heroic four-hour block.",
  },
  {
    day: "Tuesday",
    title: "Retrieval block",
    text: "Study Zone timer: 25 minutes on organic mechanisms. Log the session. Missed a step on electrophilic addition — note it. Generate three flashcards from your notes before bed.",
  },
  {
    day: "Wednesday",
    title: "Deliberate with Apex",
    text: "Essay introduction feels vague. Ask Apex to stress-test your thesis against the question stem. Rewrite one paragraph. No new content — just sharper argument.",
  },
  {
    day: "Thursday",
    title: "Mock under time",
    text: "Paper Maker: half-paper on your weakest unit. 45 minutes, phone away. Photograph written answers. Send to Answer Reviewer before dinner.",
  },
  {
    day: "Friday",
    title: "Close the loop",
    text: "Read reviewer feedback. Planner gets two short slots next week on the gaps it named. Flashcard deck schedules six due cards for Sunday. You know what Monday starts with.",
  },
] as const;

export const SCATTERED_VS_VERTEX = [
  {
    scattered: "Calendar in one app, PDFs in Drive, quizzes in a generic site, chatbot in another tab",
    vertex: "Planner → Study Zone → Paper Maker → Reviewer → flashcards without leaving the ecosystem",
  },
  {
    scattered: "“You got 7/10” with no rubric detail",
    vertex: "Answer Reviewer names the missing link, command term, or example",
  },
  {
    scattered: "Notes that never become practice",
    vertex: "Same notes become cards, quizzes, and spaced repetition in one flow",
  },
  {
    scattered: "AI that answers the question and ends the thinking",
    vertex: "Apex explains steps and invites follow-up — you still do the work",
  },
  {
    scattered: "Revision plan lives in your head until panic sets in",
    vertex: "Planner surfaces what's due, what's overdue, and what fits in a 25-minute slot",
  },
  {
    scattered: "Past papers scattered across folders with no feedback loop",
    vertex: "Paper Maker generates fresh mocks; Reviewer closes the loop on what you missed",
  },
] as const;

export const FEATURE_FAQ = [
  {
    q: "Is this just ChatGPT with a calendar?",
    a: "No. The planner, timers, mock papers, rubric reviewer, flashcard scheduling, and archives are purpose-built study tools. Apex is one layer — it explains and deliberates; it doesn't replace the rest of the workflow.",
  },
  {
    q: "Will the papers match my exact board?",
    a: "We approximate syllabus patterns and mark-scheme language for IB, IGCSE, CBSE, AP, A Level, and others. VertexED is not affiliated with exam boards — use mocks to build technique, then verify with your teacher's past papers.",
  },
  {
    q: "Do I have to use every tool?",
    a: "No. Many students live in Study Zone + Paper Maker + Reviewer during exam season. Others lean on notes and flashcards year-round. The loop is there when you want the full cycle.",
  },
  {
    q: "Is using AI cheating?",
    a: "Using AI to skip thinking is a bad trade. Using it to check reasoning, structure an essay, or understand a step you almost had — that's closer to a tutor. We bias the product toward the second.",
  },
  {
    q: "What about handwritten work?",
    a: "Answer Reviewer accepts photos of written responses. Math notation in typed feedback still renders properly.",
  },
  {
    q: "Can parents or teachers see my work?",
    a: "Your account is yours. We don't sell student data. Sharing is opt-in — export or show a session when you choose to.",
  },
  {
    q: "How is this different from Anki or Notion?",
    a: "Anki is brilliant at cards; Notion is brilliant at pages. VertexED connects planning, timed practice, rubric feedback, and spaced repetition in one loop built for exam-shaped work — not general productivity.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes for reading, planning, and shorter sessions. Long mocks and photo uploads work best on a laptop or tablet — same as most serious revision.",
  },
] as const;

export const PLATFORM_FEATURES: Feature[] = [
  {
    id: "study-zone",
    title: "Study Zone",
    tagline: "One room for deep work",
    icon: Timer,
    lead: "Two hours before bed. One tab open. Timer running, calculator nearby, session logged — no hunting through bookmarks.",
    body: "Study Zone is where long sessions actually happen. Timers with sensible breaks, a graphing calculator when you need to check a shape, habit tracking for the routines that stick, and an activity log that records what you worked on — not just how long you sat there.",
    detail: "We built this because every productivity stack we tried meant leaving the desk to find another tool. Study Zone keeps friction low so attention stays on the material.",
    scenario: "Sunday afternoon: 90-minute chemistry block. Start the timer, log the topic, use the calculator for a quick enthalpy check, note what still felt shaky in the activity log. Next session, you know exactly where to pick up.",
    outcomes: [
      "Fewer context switches mid-session",
      "An honest record of what you actually covered",
      "Tools surfaced when you need them, hidden when you don't",
    ],
    bullets: [
      "Focus timers with break prompts tuned for sustained work",
      "Activity log tied to subjects and session notes",
      "Graphing calculator and math helpers without leaving the page",
      "Habit tracker and short meditation breaks for long revision days",
      "Widgets you can arrange for how you actually study",
    ],
    whenToUse: [
      "Long revision blocks when tab-hopping kills momentum",
      "Checking a graph or calculation without opening another app",
      "Logging what you covered so Wednesday doesn't start from zero",
    ],
    notFor: "Replacing your textbook — it's the bench you work on, not the syllabus itself.",
    connectsTo: [
      { id: "planner", label: "Sessions planned in the calendar" },
      { id: "notes", label: "Quick captures feed into notes" },
      { id: "apex", label: "Apex available in-context" },
    ],
    href: "/study-zone",
  },
  {
    id: "apex",
    title: "Apex",
    tagline: "Explain, don't just answer",
    icon: Bot,
    lead: "You don't need another wall of text. You need someone to walk through why the step works — and what would break if you skipped it.",
    body: "Apex is an academic companion, not an answer machine. It explains in plain language first, then builds depth when you ask. It can challenge a weak line of reasoning, suggest how an examiner might phrase the question, and stay patient when you're stuck on step two of a proof.",
    detail: "It knows your board context where it matters — command words, mark scheme language, the difference between describe and evaluate — without turning every reply into an essay.",
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
      "Floats across tools — context follows the page you're on",
      "Study Assistant panel on dashboard routes",
    ],
    whenToUse: [
      "You're stuck on step two of a derivation, not step ten",
      "Testing an essay argument before you hand it in",
      "Clarifying a mark-scheme phrase you don't fully understand",
    ],
    notFor: "Generating full assignments to submit unchanged — that's a shortcut you'll regret.",
    connectsTo: [
      { id: "answer-reviewer", label: "Discuss reviewer feedback" },
      { id: "paper-maker", label: "Unpack mock questions" },
      { id: "notes", label: "Turn confusion into flashcards" },
    ],
    href: "/chatbot",
    boards: ["IBDP", "IGCSE", "AP", "A Level"],
  },
  {
    id: "planner",
    title: "Study Planner",
    tagline: "A week you can actually run",
    icon: Calendar,
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
      "Calendar view with session types, not generic study",
      "Balances weak topics with upcoming deadlines",
      "Editable when mocks move or priorities change",
      "Connects to Study Zone and Paper Maker sessions",
      "AI-assisted scheduling suggestions you can accept or edit",
    ],
    whenToUse: [
      "Exam season when everything competes for the same two weeks",
      "Sunday planning for a realistic week ahead",
      "After a mock — slot retries for weak topics",
    ],
    notFor: "Micromanaging every minute of your day — it's structure, not surveillance.",
    connectsTo: [
      { id: "study-zone", label: "Planned blocks → focus sessions" },
      { id: "paper-maker", label: "Mock slots on the calendar" },
      { id: "notes", label: "Flashcard reviews scheduled" },
    ],
    href: "/planner",
  },
  {
    id: "paper-maker",
    title: "Paper Maker",
    tagline: "Practice that feels like the hall",
    icon: FileText,
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
      "One-click handoff to Answer Reviewer",
      "Exam handoff populates review with paper questions",
      "Boards: IB MYP, IBDP, IGCSE, ICSE, CBSE, AP, A Level",
    ],
    whenToUse: [
      "Two weeks before a mock when you need timed pressure",
      "Drilling one weak topic until the method is automatic",
      "Building stamina for long papers",
    ],
    notFor: "Predicting exact exam questions — it trains technique and coverage, not clairvoyance.",
    connectsTo: [
      { id: "answer-reviewer", label: "Submit responses for rubric feedback" },
      { id: "planner", label: "Schedule the next mock attempt" },
      { id: "apex", label: "Debrief questions you missed" },
    ],
    href: "/paper-maker",
    boards: ["IB MYP", "IBDP", "IGCSE", "ICSE", "CBSE", "AP", "A Level"],
  },
  {
    id: "answer-reviewer",
    title: "Answer Reviewer",
    tagline: "Marks earned, marks lost",
    icon: ClipboardCheck,
    lead: "You wrote three pages. You still don't know if it's worth six marks or two. That's the gap we wanted to close.",
    body: "Submit a response — typed or photographed — and get feedback aligned to how examiners think: where marks were gained, where they were lost, and what to change in the next draft. Math notation renders properly; ∫ and dy/dx look like math, not broken symbols.",
    detail: "The reviewer is deliberately strict. Good effort doesn't help you improve. Naming the missing definition, the weak linkage, or the step you skipped does.",
    scenario: "A 6-mark biology extended response. The reviewer flags that you described the process but didn't link it to the question's command term, suggests one concrete example to add, and points you to a similar prompt to retry tomorrow.",
    outcomes: [
      "Answers that read like top-band responses over time",
      "Clear next steps instead of vague encouragement",
      "Technique improvements you can apply across subjects",
    ],
    bullets: [
      "Rubric-style breakdowns with specific gaps named",
      "Works with generated papers or class pastes",
      "Image upload for handwritten work",
      "KaTeX rendering for maths and science notation",
      "Curriculum selector aligns feedback to your board",
    ],
    whenToUse: [
      "After a mock when you need to know what cost marks",
      "Before submitting coursework drafts",
      "When you're practising extended responses",
    ],
    notFor: "A score without explanation — if feedback isn't actionable, we failed.",
    connectsTo: [
      { id: "paper-maker", label: "Review mock paper answers" },
      { id: "apex", label: "Ask how to fix a weak paragraph" },
      { id: "planner", label: "Book retry slots for weak areas" },
    ],
    href: "/answer-reviewer",
    boards: ["IBDP", "IGCSE", "AP", "A Level", "CBSE"],
  },
  {
    id: "notes",
    title: "Notes · Flashcards · Quiz",
    tagline: "Capture once, recall many times",
    icon: BookOpen,
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
      "Spaced repetition with due-card counts on dashboard",
      "Voice recording and transcription for lectures",
    ],
    whenToUse: [
      "After a dense unit when re-reading won't cut it",
      "Commute-friendly flashcard reviews",
      "Weekly quiz to honest-check what stuck",
    ],
    notFor: "Storing PDFs you never open again — if it doesn't become retrieval, it doesn't count.",
    connectsTo: [
      { id: "planner", label: "Due cards appear in your week" },
      { id: "study-zone", label: "Run reviews in a focus session" },
      { id: "paper-maker", label: "Quiz weak topics with mocks" },
    ],
    href: "/notetaker",
  },
];

export const ECOSYSTEM_EXTRAS: EcosystemExtra[] = [
  {
    id: "learning-hub",
    title: "Learning Hub",
    summary: "Your board-aware home for paths, goals, and what to do next.",
    detail: "Connects curriculum choice to daily suggestions — not a generic dashboard, but a view that knows you're on IBDP vs IGCSE and what week of term you're in.",
    href: "/learning-hub",
    icon: LayoutDashboard,
  },
  {
    id: "archives",
    title: "Archives",
    summary: "Curated exemplars in Language & Literature, History, and Geography.",
    detail: "Close readings, timelines, and practice prompts — the kind of material you actually revise from, not link dumps.",
    href: "/archives",
    icon: Library,
  },
  {
    id: "study-tools",
    title: "Study Tools Hub",
    summary: "Formula sheets, technique guides, and shortcuts into every tool.",
    detail: "Quick-reference maths, physics, chemistry, and biology — plus exam-day checklists when you need a fast lookup before a mock.",
    href: "/study-tools",
    icon: Wrench,
  },
  {
    id: "resources",
    title: "Resources",
    summary: "Long-form guides on active recall, cramming honestly, and using AI well.",
    detail: "Written for students who want depth, not listicles — how to plan, how to review, when AI helps and when it hurts.",
    href: "/resources",
    icon: BookOpen,
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
  "Newton's second law: F = ma, and kinetic energy E_k = 1/2 mv^2.",
];

export function getFeatureById(id: string): Feature | undefined {
  return PLATFORM_FEATURES.find((f) => f.id === id);
}
