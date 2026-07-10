export type LandingProblem = {
  stat: string;
  title: string;
  text: string;
};

export type LandingFeature = {
  title: string;
  desc: string;
  side: string;
};

export type FloatingInsight = {
  label: string;
  headline: string;
  body: string;
};

/** Flip cards — tap to reveal the full problem */
export const LANDING_PROBLEMS: LandingProblem[] = [
  {
    stat: "65%",
    title: "Too many tabs, not enough progress",
    text: "Most students juggle planners, PDFs, Quizlet, YouTube, and a chatbot — and still can't tell if tonight moved them closer to exam-ready.",
  },
  {
    stat: "70%",
    title: "Notes that never become memory",
    text: "Highlighting feels productive until the notebook closes. Exams test recall under pressure, not recognition on a page you read twice.",
  },
  {
    stat: "80%",
    title: "Practice on the wrong shape",
    text: "Generic quizzes rarely mirror command words, mark schemes, or timing. You train on easy questions — then the hall feels unfamiliar.",
  },
  {
    stat: "68%",
    title: "Anxiety without a plan",
    text: "Stress spikes when the syllabus is vague and the week has no structure. Motivation isn't the issue — not knowing what to do next is.",
  },
  {
    stat: "55%",
    title: "Gaps where boards need depth",
    text: "IB MYP and smaller programmes often lack quality past papers, exemplars, and revision paths. You're left stitching resources yourself.",
  },
  {
    stat: "75%",
    title: "Tools that answer, not teach",
    text: "AI that writes the essay for you is a shortcut you'll regret. What helps is feedback on your reasoning — marks and understanding together.",
  },
];

/** Edmo-style scroll stack — each card surfaces a real learning tension */
export const FLOATING_INSIGHTS: FloatingInsight[] = [
  {
    label: "The bloat problem",
    headline: "EdTech grew features, not outcomes",
    body: "Most platforms optimise for time-on-app, not marks earned or concepts retained. VertexED is built around one loop: plan, focus, practise, review, remember.",
  },
  {
    label: "Marks + meaning",
    headline: "You need both to perform",
    body: "Cramming gets a point on a test; understanding gets you through the next unit. We bias tools toward rubric feedback, deliberate practice, and spaced retrieval.",
  },
  {
    label: "Exam season reality",
    headline: "Structure beats willpower",
    body: "When mocks stack up and sleep drops, you don't need another motivational quote — you need a week that fits sport, school, and 25-minute blocks that compound.",
  },
  {
    label: "What we built for",
    headline: "One desk, not twelve tabs",
    body: "Planner, Study Zone, Paper Maker, Answer Reviewer, notes, and Apex — connected so feedback from Thursday's mock shapes Friday's flashcards.",
  },
];

export const LANDING_FEATURES: LandingFeature[] = [
  {
    title: "Study Zone",
    desc: "Timers, logs, calculator, habits — one room for the sessions that actually stick.",
    side: "Stop leaving the desk every time you need a graph, a break timer, or a note on what felt shaky.",
  },
  {
    title: "Apex",
    desc: "An AI layer that stress-tests your reasoning before you commit pen to paper.",
    side: "Not answers on demand — explanations, follow-ups, and pushback when your argument skips a step.",
  },
  {
    title: "Study Planner",
    desc: "Block time around real deadlines, not fantasy six-hour sessions.",
    side: "See the week: mocks, essays, retrieval blocks — sized so you can still have a life outside school.",
  },
  {
    title: "Answer Reviewer",
    desc: "Feedback that names marks earned and marks lost — command terms, examples, structure.",
    side: "Photograph handwritten work. Get rubric-shaped notes you can act on before the next attempt.",
  },
  {
    title: "Paper Maker",
    desc: "Mocks aligned to syllabus patterns — IB, IGCSE, CBSE, AP, A Level, and more.",
    side: "Train pace and technique on papers that respect how your board actually asks questions.",
  },
  {
    title: "Notes · Flashcards · Quiz",
    desc: "Turn lectures into retrieval — cards on a schedule, not the night before.",
    side: "If it doesn't become practice, it doesn't count. Same notes feed quizzes and spaced repetition.",
  },
];
