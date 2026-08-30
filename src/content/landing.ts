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

/** Flip cards — stat is an ordinal, not a survey claim. */
export const LANDING_PROBLEMS: LandingProblem[] = [
  {
    stat: "01",
    title: "Busy all evening. Still no clear progress.",
    text: "Your planner is in one app, papers are in a folder, flashcards live somewhere else, and the explanation you need is buried in another tab. VertexED is built to turn that activity into one visible revision loop with a next step.",
  },
  {
    stat: "02",
    title: "Notes feel familiar. Exams demand recall.",
    text: "Reading and highlighting can make a topic feel known without making it retrievable. The useful question is whether you can explain it, apply it, or produce it under time. Notes should lead into retrieval, not end the session.",
  },
  {
    stat: "03",
    title: "Practice that does not look like the exam.",
    text: "A quick quiz can check facts, but real papers test command words, structure, working, pacing, and mark schemes. Practice should rehearse the shape of the task you will actually sit.",
  },
  {
    stat: "04",
    title: "A syllabus is not a study plan.",
    text: "Knowing what is on the course does not tell you what to do tonight. A useful plan has to fit around school, sport, sleep, deadlines, weak topics, and the time you genuinely have left.",
  },
  {
    stat: "05",
    title: "Good resources are scattered everywhere.",
    text: "Students often have enough material and still lack a workflow. The missing piece is continuity: the weak topic from a mock should become tomorrow's task, the next practice set, and the next retrieval session.",
  },
  {
    stat: "06",
    title: "AI can finish the task without teaching it.",
    text: "A polished answer is not useful if you cannot reproduce the reasoning yourself. VertexED is designed to show what earned marks, what lost them, and what to try next — so the student still does the thinking.",
  },
];

/** Floating story cards — product philosophy, not unsupported outcome claims. */
export const FLOATING_INSIGHTS: FloatingInsight[] = [
  {
    label: "The idea",
    headline: "A revision system, not a pile of tools",
    body: "Planning, focus, practice, feedback, and retrieval should feed one another. VertexED connects those steps so a study session starts with a reason and ends with a useful next action.",
  },
  {
    label: "The loop",
    headline: "Practice should change what you do next",
    body: "A mock is only valuable if the mistakes become decisions. Review the marks you lost, turn the gaps into targeted work, then come back to them through retrieval before the next paper.",
  },
  {
    label: "The reality",
    headline: "A realistic week beats a perfect timetable",
    body: "Students have classes, activities, deadlines, and limited energy. The planner and Study Zone are built around work you can actually finish, not an imaginary six-hour evening that collapses by Wednesday.",
  },
  {
    label: "The goal",
    headline: "Know the next move without opening twelve tabs",
    body: "Planner sets the task. Study Zone runs the session. Paper Maker creates practice. Answer Reviewer finds the gaps. Notes, flashcards, quizzes, and Apex help you close them. One loop, one place to continue from.",
  },
];

export const LANDING_FEATURES: LandingFeature[] = [
  {
    title: 'Study Planner',
    desc: 'Turn exams and deadlines into a week you can actually execute.',
    side: 'Build around the hours you really have, then send each task straight into the tool that helps you complete it.',
    loop: 'plan',
    href: '/planner',
    outcome: 'Plan — know what deserves your next study block',
  },
  {
    title: 'Study Zone',
    desc: 'Run focused sessions without rebuilding your setup every time.',
    side: 'Timers, session tools, calculator access, habits, and logs stay together so the plan becomes actual study time.',
    loop: 'focus',
    href: '/study-zone',
    outcome: 'Focus — turn scheduled time into completed work',
  },
  {
    title: 'Paper Maker',
    desc: 'Generate exam-style practice around the topics and marks you need.',
    side: 'Choose topics, marks, and question count, practise under time, then move the same attempt into review.',
    loop: 'practise',
    href: '/paper-maker',
    outcome: 'Practise — rehearse the format, pacing, and command words',
  },
  {
    title: 'Answer Reviewer',
    desc: 'See where marks were earned, where they were lost, and what to fix next.',
    side: 'Review typed work or an uploaded answer against rubric-style criteria, then turn the feedback into another attempt instead of a dead-end score.',
    loop: 'review',
    href: '/answer-reviewer',
    outcome: 'Review — convert mistakes into a specific next action',
  },
  {
    title: 'Notes · Flashcards · Quiz',
    desc: 'Turn source material into active retrieval instead of passive rereading.',
    side: 'Keep notes, cards, and quizzes connected so a topic can move from explanation to recall and back into practice.',
    loop: 'remember',
    href: '/notetaker',
    outcome: 'Remember — revisit weak material before it disappears',
  },
  {
    title: 'Apex',
    desc: 'Use AI to question, explain, and stress-test your reasoning — not replace it.',
    side: 'Ask for an explanation, test an argument, unpack a command term, or work through a gap before you try the question again.',
    loop: 'review',
    href: '/chatbot',
    outcome: 'Support — get unstuck without handing over the thinking',
  },
];
