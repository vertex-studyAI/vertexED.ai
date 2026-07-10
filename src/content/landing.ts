export type LandingProblem = {
  stat: string;
  title: string;
  text: string;
};

export type LandingFeature = {
  title: string;
  desc: string;
  side: string;
  loop: 'plan' | 'focus' | 'practise' | 'review' | 'remember';
  href: string;
  outcome: string;
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
    title: 'Study Planner',
    desc: 'Map the week around mocks, sport, and sleep — not fantasy six-hour blocks.',
    side: 'You see what fits before Sunday panic. Tasks link to the tools that actually run them.',
    loop: 'plan',
    href: '/planner',
    outcome: 'Closes the Plan step in your revision loop',
  },
  {
    title: 'Study Zone',
    desc: 'Timers, habits, calculator, logs — one desk for the session you said you would run.',
    side: 'Focus mode that does not nag you to open twelve other tabs mid-block.',
    loop: 'focus',
    href: '/study-zone',
    outcome: 'Closes the Focus step — minutes that count',
  },
  {
    title: 'Paper Maker',
    desc: 'Board-shaped mocks with mark schemes — IB, IGCSE, CBSE, AP, A Level, and more.',
    side: 'Train pace and command words on papers that respect how your board actually asks questions.',
    loop: 'practise',
    href: '/paper-maker',
    outcome: 'Closes the Practise step under exam conditions',
  },
  {
    title: 'Answer Reviewer',
    desc: 'Rubric feedback that names marks earned and marks lost — structure, examples, command terms.',
    side: 'Photograph handwritten work. Know what to fix before the next attempt, not after results day.',
    loop: 'review',
    href: '/answer-reviewer',
    outcome: 'Closes the Review step with actionable gaps',
  },
  {
    title: 'Notes · Flashcards · Quiz',
    desc: 'Turn lectures into retrieval — spaced cards and quizzes, not a highlight graveyard.',
    side: 'If it does not become practice, it does not count. Same notes feed the deck on a schedule.',
    loop: 'remember',
    href: '/notetaker',
    outcome: 'Closes the Remember step — memory on a clock',
  },
  {
    title: 'Apex',
    desc: 'Discussion-first AI that stress-tests reasoning before you commit pen to paper.',
    side: 'Socratic follow-ups, mock strategy, rubric sense — not a copy-paste machine.',
    loop: 'review',
    href: '/chatbot',
    outcome: 'Threads through every loop step when you are stuck',
  },
];
