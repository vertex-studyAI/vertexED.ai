import {
  BookOpen,
  Bot,
  Calendar,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Library,
  Timer,
  Target,
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
  "exam-prep": Target,
  apex: Bot,
  planner: Calendar,
  "paper-maker": FileText,
  "answer-reviewer": ClipboardCheck,
  notes: BookOpen,
} as const;

export const STUDY_LOOP = [
  {
    step: "Plan",
    desc: "Block time around real deadlines and the hours available in your week.",
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
    desc: "AI-generated mocks with visible marks, timing, and review handoff.",
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
    desc: "Flashcards return on a review schedule you control.",
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
    note: "Select an IB DP subject and grade to give Paper Maker and Answer Reviewer useful context. Check generated questions and criteria against the current subject guide.",
  },
  {
    board: "IGCSE",
    note: "Use timed generated sets to practise pacing, then compare coverage and phrasing with current official past papers.",
  },
  {
    board: "AP",
    note: "Request free-response practice and review written reasoning. Treat the generated rubric as a draft until you compare it with College Board material.",
  },
  {
    board: "A Level",
    note: "Generate longer written or multi-step practice by subject, and use Apex to question your reasoning before another attempt.",
  },
  {
    board: "CBSE / ICSE",
    note: "Generate practice by grade and subject. Verify chapter coverage, mark allocation, and required method with current school and board material.",
  },
  {
    board: "IB MYP",
    note: "Use MYP subject context for independent practice and keep project deadlines visible in the Planner. Teacher-provided criteria remain the source of truth.",
  },
] as const;

export const REVISION_WEEK = [
  {
    day: "Monday",
    title: "Map the week",
    text: "Open the planner. Drop in the mock on Thursday, the essay draft due Friday, and two lighter evenings for sport. Assign chemistry retrieval to Tuesday and Thursday - 25 minutes each, not a heroic four-hour block.",
  },
  {
    day: "Tuesday",
    title: "Retrieval block",
    text: "Study Zone timer: 25 minutes on organic mechanisms. Log the session. If a step in electrophilic addition is unclear, note it and create three flashcards from your source material.",
  },
  {
    day: "Wednesday",
    title: "Deliberate with Apex",
    text: "Essay introduction feels vague. Ask Apex to stress-test your thesis against the question stem. Rewrite one paragraph. No new content - just sharper argument.",
  },
  {
    day: "Thursday",
    title: "Mock under time",
    text: "Paper Maker: half-paper on your weakest unit. 45 minutes, phone away. Photograph written answers. Send to Answer Reviewer before dinner.",
  },
  {
    day: "Friday",
    title: "Close the loop",
    text: "Read the reviewer feedback and verify any score with a teacher or official mark scheme. Add two short retry slots to the planner and rate the flashcards you review so the deck can schedule their next appearance.",
  },
] as const;

export const SCATTERED_VS_VERTEX = [
  {
    scattered: "Calendar in one app, PDFs in Drive, quizzes in a generic site, chatbot in another tab",
    vertex: "Planner → Study Zone → Paper Maker → Reviewer → flashcards without leaving the ecosystem",
  },
  {
    scattered: "“You got 7/10” with no rubric detail",
    vertex: "Answer Reviewer links feedback to quoted evidence and labels a score provisional until you verify it",
  },
  {
    scattered: "Notes that never become practice",
    vertex: "Same notes become cards, quizzes, and spaced repetition in one flow",
  },
  {
    scattered: "AI that answers the question and ends the thinking",
    vertex: "Apex explains steps and invites follow-up - you still do the work",
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
    a: "No. The planner, timers, generated practice, evidence-linked reviewer, flashcard scheduling, exam-prep page, and archives are separate study workflows. Apex is the conversational layer.",
  },
  {
    q: "Will the papers match my exact board?",
    a: "No. Generated papers use the board, grade, subject, topics, and marks you select, but they are independent practice. Check current official materials and your teacher's guidance for exact coverage and format.",
  },
  {
    q: "Do I have to use every tool?",
    a: "No. Many students live in Study Zone + Paper Maker + Reviewer during exam season. Others lean on notes and flashcards year-round. The loop is there when you want the full cycle.",
  },
  {
    q: "Is using AI cheating?",
    a: "Using AI to skip thinking is a bad trade. Using it to check reasoning, structure an essay, or understand a step you almost had - that's closer to a tutor. We bias the product toward the second.",
  },
  {
    q: "What about handwritten work?",
    a: "Answer Reviewer accepts photos of written responses. Math notation in typed feedback still renders properly.",
  },
  {
    q: "Can parents or teachers see my work?",
    a: "Your account is yours. We don't sell student data. Sharing is opt-in - export or show a session when you choose to.",
  },
  {
    q: "How is this different from Anki or Notion?",
    a: "Anki specializes in cards and Notion in flexible pages. VertexED connects planning, timed practice, answer feedback, and spaced review around exam preparation.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes for reading, planning, and shorter sessions. Long mocks and photo uploads work best on a laptop or tablet - same as most serious revision.",
  },
] as const;

export const PLATFORM_FEATURES: Feature[] = [
  {
    id: "exam-prep",
    title: "Exam Prep",
    tagline: "A useful session for the time left",
    icon: Target,
    lead: "Your exam date should change what you do today. Six weeks out and two days out are different jobs.",
    body: "Exam Prep reads the board, subjects, and exam date in your profile, then checks for unfinished mocks, scheduled retries, verified weak topics, and due flashcards. Pick a subject and a 25, 45, or 75-minute block to get a three-part session you can work through.",
    detail: "The evidence panel is intentionally modest. It shows which study signals exist; it does not claim to know your final grade or certify that you are ready.",
    scenario: "Twelve days before biology, a completed mock is still waiting for review. Exam Prep puts that review first, divides the session into retrieval, focused work, and marking, and keeps the checklist for the day on this device.",
    outcomes: [
      "A next task based on work already in VertexED",
      "Session lengths that fit the time you have",
      "A clear boundary between study activity and predicted performance",
    ],
    bullets: [
      "Preparation phases based on your saved exam date",
      "Subject-specific session builder",
      "Priority for unfinished mocks and due retries",
      "Visible counts for verified topics, retries, and flashcards",
      "Daily checklist stored to your account on the current device",
    ],
    whenToUse: [
      "At the start of a revision block when several tasks compete",
      "During the final six weeks before an exam",
      "After a mock when review is easier to postpone than new work",
    ],
    notFor: "Predicting a grade or replacing the current specification and your teacher's guidance.",
    connectsTo: [
      { id: "paper-maker", label: "Start or resume timed practice" },
      { id: "answer-reviewer", label: "Review a completed attempt" },
      { id: "notes", label: "Clear due retrieval cards" },
    ],
    href: "/exam-prep",
  },
  {
    id: "study-zone",
    title: "Study Zone",
    tagline: "One room for deep work",
    icon: Timer,
    lead: "Two hours before bed. One tab open. Timer running, calculator nearby, session logged - no hunting through bookmarks.",
    body: "Study Zone keeps the small tools used during a revision block on one page: timers, calculator, graphing, daily habits, quick notes, and a short activity log.",
    detail: "We built this because every productivity stack we tried meant leaving the desk to find another tool. Study Zone keeps friction low so attention stays on the material.",
    scenario: "Sunday afternoon: 90-minute chemistry block. Start the timer, log the topic, use the calculator for a quick enthalpy check, note what still felt shaky in the activity log. Next session, you know exactly where to pick up.",
    outcomes: [
      "Fewer context switches mid-session",
      "A short record of what you covered",
      "Tools surfaced when you need them, hidden when you don't",
    ],
    bullets: [
      "Focus timers with break prompts tuned for sustained work",
      "Activity log for short session reflections",
      "Graphing calculator and math helpers without leaving the page",
      "Habit tracker and short meditation breaks for long revision days",
      "Daily habits that reset for a fresh check-in each day",
    ],
    whenToUse: [
      "Long revision blocks when tab-hopping kills momentum",
      "Checking a graph or calculation without opening another app",
      "Logging what you covered so Wednesday doesn't start from zero",
    ],
    notFor: "Replacing your textbook - it's the bench you work on, not the syllabus itself.",
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
    lead: "Sometimes you need the next step explained clearly, with enough room to ask why it works.",
    body: "Apex can explain a concept, question an argument, or work through a problem with you. It receives the study context you have saved, but its answers can still be wrong and should be checked when accuracy matters.",
    detail: "Board, subject, goal, and response-style preferences can be included in the prompt context. That helps make replies relevant without turning the model into an examiner or an official source.",
    scenario: "You're rewriting a history paragraph and the argument feels thin. Apex helps you test whether each sentence earns its place, suggests where evidence is missing, and pushes you to link back to the question stem - the kind of feedback you'd want before handing it in.",
    outcomes: [
      "Explanations you can test in a follow-up question",
      "Clearer essays and structured science responses",
      "A place to deliberate ideas before committing them to paper",
    ],
    bullets: [
      "Follow-up questions instead of one-shot dumps",
      "Board-aware terminology and rubric language",
      "Strong for humanities debate, science models, and math intuition",
      "Floats across tools - context follows the page you're on",
      "Study Assistant panel on dashboard routes",
    ],
    whenToUse: [
      "You're stuck on step two of a derivation, not step ten",
      "Testing an essay argument before you hand it in",
      "Clarifying a mark-scheme phrase you don't fully understand",
    ],
    notFor: "Generating full assignments to submit unchanged - that's a shortcut you'll regret.",
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
    tagline: "An editable week",
    icon: Calendar,
    lead: "The problem isn't that students don't plan. It's that plans ignore real life - matches, labs, the mock that moved to Thursday.",
    body: "Add tasks and deadlines to a calendar, then request suggested study blocks when you want help getting started. Every suggested task remains editable, so you decide what fits and what moves.",
    detail: "The planner is a place to make revision concrete. It does not resolve timetable conflicts automatically or know how much energy you will have on a given evening.",
    scenario: "Three subjects and two assessments land in the same fortnight. You add the deadlines, accept the useful suggested blocks, shorten Friday's work, and reserve Saturday morning for a mock.",
    outcomes: [
      "Revision that fits around sport, clubs, and sleep",
      "Less guilt from unrealistic 8-hour blocks",
      "Visible progress across the week",
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
      "After a mock - slot retries for weak topics",
    ],
    notFor: "Micromanaging every minute of your day - it's structure, not surveillance.",
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
    lead: "Short quizzes test recall. Longer practice is useful for command words, mark allocation, working, and pacing.",
    body: "Paper Maker generates original practice from the board, subject, grade, topics, difficulty, and marks you select. Run the result in a timed mode, save an unfinished attempt, or send completed answers into review.",
    detail: "The papers are AI-generated and VertexED is not affiliated with any exam board. Treat them as extra practice, then use current official materials and teacher guidance to check coverage and format.",
    scenario: "IGCSE physics paper next month. You generate a Paper 2-style set on electricity and magnetism, sit it in 75 minutes, then send your written responses to Answer Reviewer. Weak areas feed back into next week's planner blocks.",
    outcomes: [
      "Less surprise on exam day from unfamiliar wording",
      "Timed practice for pacing as well as knowledge",
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
    notFor: "Predicting exact exam questions - it trains technique and coverage, not clairvoyance.",
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
    body: "Submit a typed or photographed response and receive criterion-by-criterion AI feedback. The reviewer quotes evidence from the answer when it assigns marks and clearly labels unsupported scoring as provisional.",
    detail: "Only a result you confirm against a teacher, official mark scheme, or validated answer key can feed the measured weak-topic and retry system. AI feedback alone does not become a mastery score.",
    scenario: "A 6-mark biology extended response. The reviewer flags that you described the process but didn't link it to the question's command term, suggests one concrete example to add, and points you to a similar prompt to retry tomorrow.",
    outcomes: [
      "Specific changes to test in the next attempt",
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
    notFor: "A score without explanation - if feedback isn't actionable, we failed.",
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
    lead: "Notes become more useful when they lead to a question you have to answer from memory.",
    body: "Record or paste notes, generate a structured draft, and create flashcards or a quiz in the same flow. In Study Mode, your card rating determines when each card is due again.",
    detail: "The loop is deliberate: exposure in class or from a text, condensation into cards, retrieval practice with honest feedback, then spacing so it sticks past the unit test.",
    scenario: "After a history unit, you paste key dates and arguments, generate ten flashcards, and rate each answer in Study Mode. Harder cards come back sooner, and the dashboard shows how many are due.",
    outcomes: [
      "Notes that become practice, not archive",
      "Measurable retention instead of false confidence",
      "One path from lecture to timed mock to rubric review",
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
    notFor: "Storing PDFs you never open again - if it doesn't become retrieval, it doesn't count.",
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
    id: "dashboard",
    title: "Study Dashboard",
    summary: "Your account home for the next task, saved work, and study signals.",
    detail: "The dashboard brings together due cards, scheduled retries, unfinished mocks, planner work, and links into each study tool.",
    href: "/main",
    icon: LayoutDashboard,
  },
  {
    id: "archives",
    title: "Archives",
    summary: "Curated exemplars in Language & Literature, History, and Geography.",
    detail: "Close readings, timelines, and practice prompts collected into a small subject reference library.",
    href: "/archives",
    icon: Library,
  },
  {
    id: "study-tools",
    title: "Study Tools Hub",
    summary: "Formula sheets, technique guides, and shortcuts into every tool.",
    detail: "Quick-reference maths, physics, chemistry, and biology - plus exam-day checklists when you need a fast lookup before a mock.",
    href: "/study-tools",
    icon: Wrench,
  },
  {
    id: "resources",
    title: "Resources",
    summary: "Long-form guides on active recall, cramming honestly, and using AI well.",
    detail: "Longer explanations of planning, review, retrieval, and responsible uses of AI while studying.",
    href: "/resources",
    icon: BookOpen,
  },
];

export const PROBLEM_INSIGHTS = [
  {
    stat: "01",
    title: "Resources without structure",
    text: "PDFs, playlists, and problem sets multiply every term. Without a sequence - read, mock, review, retrieve - students cannot tell if tonight moved them closer to a full mark on Paper 2.",
  },
  {
    stat: "02",
    title: "Notes that never become memory",
    text: "Highlighting feels productive until the notebook closes. Exams test recall under pressure; recognition on a page you read twice is a different skill.",
  },
  {
    stat: "03",
    title: "Practice on the wrong shape",
    text: "Generic quizzes rarely mirror command words, mark schemes, or timing. You train on easy wins - then the hall feels unfamiliar when the stem says evaluate or justify.",
  },
];

export const MATH_DEMO_LINES = [
  "The area under $f(x)$ from 0 to 2 is $\\int_0^2 f(x)\\,dx$.",
  "For $y = x^3$, the derivative is $\\frac{dy}{dx} = 3x^2$.",
  "Quadratic roots: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.",
  "Newton's second law is $F = ma$; kinetic energy is $E_k = \\frac{1}{2}mv^2$.",
];

export function getFeatureById(id: string): Feature | undefined {
  return PLATFORM_FEATURES.find((f) => f.id === id);
}
