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

/** Flip cards — tap to reveal the full problem (stat = ordinal, not a fabricated survey figure) */
export const LANDING_PROBLEMS: LandingProblem[] = [
  {
    stat: "01",
    title: "Too many tabs, not enough progress",
    text: "The planner lives in one app, past papers in a folder, flashcards in another, and YouTube for the topic you still don't get. By 11 p.m. you've been busy — but you can't point to what moved you closer to a full mark on Paper 2.",
  },
  {
    stat: "02",
    title: "Notes that never become memory",
    text: "Colour-coded highlights feel like progress until you close the notebook. Then the exam asks you to recall a mechanism, define a term, or structure an argument under time — and recognition on a page isn't the same as retrieval in the hall.",
  },
  {
    stat: "03",
    title: "Practice on the wrong shape",
    text: "Random online quizzes test facts in isolation. Your board asks you to evaluate, justify, or show working within a mark scheme and a time limit. You rehearse easy wins — then the command words and pacing on the real paper feel foreign.",
  },
  {
    stat: "04",
    title: "Anxiety without a plan",
    text: "The syllabus is a list of topics, not a sequence for your week. Sport, school, and sleep don't fit into a generic \"study more\" plan. Stress isn't laziness — it's not knowing whether tonight should be content, a mock, or flashcards.",
  },
  {
    stat: "05",
    title: "Gaps where boards need depth",
    text: "IB MYP, smaller national programmes, and niche subjects rarely get quality past papers, worked exemplars, or a clear revision path. You end up stitching PDFs, teacher notes, and forum threads into something that almost matches what you'll actually sit.",
  },
  {
    stat: "06",
    title: "Tools that answer, not teach",
    text: "Paste the essay prompt, get a finished paragraph — useful until you can't reproduce the reasoning in the exam. What actually helps is someone naming which marks you earned, which you lost, and what to try before you rewrite.",
  },
];

/** Edmo-style scroll stack — each card surfaces a real learning tension */
export const FLOATING_INSIGHTS: FloatingInsight[] = [
  {
    label: "Why we built this",
    headline: "More apps did not make revision simpler",
    body: "Every year there was another tool with smarter summaries or a prettier dashboard. Students still opened six tabs just to plan one week. VertexED brings planning, focused study, notes, retrieval, and—where reviewed content exists—verified practice into one workflow.",
  },
  {
    label: "Marks + meaning",
    headline: "Good grades and real understanding can go together",
    body: "You can memorise a mark-scheme phrase and still not understand the next unit. We use retrieval and clear formative feedback to help you explain the idea, while keeping unsupported grades visibly withheld.",
  },
  {
    label: "Exam season reality",
    headline: "A realistic week beats a heroic intention",
    body: "When mocks stack up and sleep drops, the calendar matters more than willpower. VertexED assumes you have school, sport, and a limited number of good hours. The planner and Study Zone are built for 25-minute blocks you can actually finish.",
  },
  {
    label: "What we built for",
    headline: "One desk instead of twelve tabs",
    body: "A focused practice attempt can reveal what to revisit. Flashcards support retrieval, and Apex can help unpack reasoning before you try again. Verified practice evidence is kept separate from formative AI feedback.",
  },
];

export const LANDING_FEATURES: LandingFeature[] = [
  {
    title: 'Study Planner',
    desc: 'Map the week around mocks, sport, and sleep — tasks sized to the hours you actually have.',
    side: 'See what fits before Sunday panic. Each task can link to the tool that runs it — mock, cards, or focus block.',
    loop: 'plan',
    href: '/planner',
    outcome: 'Closes the Plan step — a week you can execute',
  },
  {
    title: 'Study Zone',
    desc: 'Timers, habits, calculator, Desmos, session log, and Apex on one page.',
    side: 'Built for 25-minute blocks: start the timer, stay on one topic, log what you finished.',
    loop: 'focus',
    href: '/study-zone',
    outcome: 'Closes the Focus step — minutes that count toward the plan',
  },
  {
    title: 'Paper Maker',
    desc: 'Verified practice from reviewed, authorized content for the components that are listed as available.',
    side: 'Choose your curriculum selection, check availability, save answers, and receive a score only where deterministic scoring is supported.',
    loop: 'practise',
    href: '/paper-maker',
    outcome: 'Supports the Practise step — with content coverage and scoring boundaries shown clearly',
  },
  {
    title: 'Answer Reviewer',
    desc: 'Assistive feedback on structure, evidence, and command terms; it does not issue unsupported marks.',
    side: 'Paste typed work or upload a photo to identify revision ideas before the next attempt.',
    loop: 'review',
    href: '/answer-reviewer',
    outcome: 'Supports the Review step — clear formative guidance with an honest scoring boundary',
  },
  {
    title: 'Notes · Flashcards · Quiz',
    desc: 'Turn lectures and topics into retrieval — spaced cards and quizzes, not a highlight graveyard.',
    side: 'Same source feeds the deck on a schedule. If it does not become practice, it does not count.',
    loop: 'remember',
    href: '/notetaker',
    outcome: 'Closes the Remember step — memory on a clock',
  },
  {
    title: 'Apex',
    desc: 'Discussion-first AI that stress-tests reasoning before you commit pen to paper.',
    side: 'Socratic follow-ups, mock strategy, rubric sense — asks what you tried before suggesting the fix.',
    loop: 'review',
    href: '/chatbot',
    outcome: 'Available at every loop step when you are stuck or need exam technique',
  },
];
