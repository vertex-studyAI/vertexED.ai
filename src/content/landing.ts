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
    headline: "Features multiplied; revision didn't get easier",
    body: "Every year brought another app — smarter summaries, flashier dashboards — but students still opened six tabs to plan one week. VertexED is organised around a single loop: plan the week, run a focus block, practise under time, review against rubrics, retrieve on schedule.",
  },
  {
    label: "Marks + meaning",
    headline: "Scoring well and knowing the material aren't opposites",
    body: "You can memorise a mark-scheme phrase and still not understand the unit that follows. We weight tools toward rubric feedback, timed mocks, and spaced retrieval so the grade reflects something you can explain — not just repeat.",
  },
  {
    label: "Exam season reality",
    headline: "A realistic week beats a heroic intention",
    body: "When mocks stack and sleep drops, willpower isn't the bottleneck — the calendar is. VertexED assumes you have school, sport, and a finite number of good hours. The planner and Study Zone are built for 25-minute blocks that actually happen.",
  },
  {
    label: "What we built for",
    headline: "One desk instead of twelve tabs",
    body: "Thursday's mock surfaces a weak topic in Answer Reviewer; Friday's flashcards target it; Apex explains the gap before you rewrite. Planner, Study Zone, Paper Maker, Reviewer, notes, and Apex share context — not just a logo in the header.",
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
    desc: 'Board-shaped mocks with mark schemes — IB, IGCSE, CBSE, AP, A Level, and more.',
    side: 'Choose topics, total marks, and question count; sit under time in mock mode; send answers to Reviewer.',
    loop: 'practise',
    href: '/paper-maker',
    outcome: 'Closes the Practise step — pace and command words under time',
  },
  {
    title: 'Answer Reviewer',
    desc: 'Rubric feedback that names marks earned and marks lost — structure, evidence, command terms.',
    side: 'Paste typed work or upload a photo. Know what to fix before the next attempt, not after results day.',
    loop: 'review',
    href: '/answer-reviewer',
    outcome: 'Closes the Review step — actionable gaps, not "good effort"',
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
