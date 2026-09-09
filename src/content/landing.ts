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
    text: "A quick quiz can check facts. A full paper also tests command words, structure, working, and pacing. Practice needs both formats.",
  },
  {
    stat: "04",
    title: "A syllabus is not a study plan.",
    text: "Knowing the syllabus still leaves a practical question: what can you finish tonight? A useful plan has to fit around school, sport, sleep, deadlines, weak topics, and limited time.",
  },
  {
    stat: "05",
    title: "Good resources are scattered everywhere.",
    text: "Students often have enough material and still lack a workflow. The missing piece is continuity: the weak topic from a mock should become tomorrow's task, the next practice set, and the next retrieval session.",
  },
  {
    stat: "06",
    title: "AI can finish the task without teaching it.",
    text: "A polished answer can hide weak understanding. VertexED keeps the student attempt at the centre and uses feedback to identify what to try next.",
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
    body: "Students have classes, activities, deadlines, and limited energy. The planner and Study Zone work best when blocks are short enough to finish and easy to adjust when the week changes.",
  },
  {
    label: "The goal",
    headline: "Know the next move without opening twelve tabs",
    body: "Planner sets the task. Study Zone runs the session. Paper Maker creates practice. Answer Reviewer finds the gaps. Notes, flashcards, quizzes, and Apex support the next attempt.",
  },
];

export const LANDING_FEATURES: LandingFeature[] = [
  {
    title: 'Exam Prep',
    desc: 'Choose a subject and a 25-, 45-, or 75-minute revision session.',
    side: 'Choose a subject and the time available. Your session can include unfinished mocks, scheduled retries, recorded weak topics and due flashcards. It does not predict an exam grade.',
    loop: 'plan',
    href: '/exam-prep',
    outcome: 'Prepare: choose a revision session',
  },
  {
    title: 'Study Planner',
    desc: 'Turn exams and deadlines into a week with specific, editable study blocks.',
    side: 'Add exams and deadlines, set your available hours, then edit the study blocks. Open a scheduled task in the relevant study tool.',
    loop: 'plan',
    href: '/planner',
    outcome: 'Plan: schedule your next study block',
  },
  {
    title: 'Study Zone',
    desc: 'Study with a timer, calculator, graphing tools, and session notes.',
    side: 'Set a focus timer and keep a calculator, graph and session notes beside your work. Pause when you need to and return to the same task.',
    loop: 'focus',
    href: '/study-zone',
    outcome: 'Focus: start a timed session',
  },
  {
    title: 'Paper Maker',
    desc: 'Generate exam-style practice around the topics and marks you need.',
    side: 'Choose topics, marks and question count. Generate an exam-style paper, attempt it under time, then review your answers. Generated questions are not official past papers.',
    loop: 'practise',
    href: '/paper-maker',
    outcome: 'Practise: attempt exam-style questions',
  },
  {
    title: 'Answer Reviewer',
    desc: 'Get suggested marks and feedback on a typed or uploaded answer.',
    side: 'Type an answer or upload your work. Read the suggested marks and criterion-level feedback, then check the explanation against your course materials before deciding what to practise.',
    loop: 'review',
    href: '/answer-reviewer',
    outcome: 'Review: check your answer',
  },
  {
    title: 'Notes · Flashcards · Quiz',
    desc: 'Create notes, flashcards, and practice quizzes from your material.',
    side: 'Use your study material to create notes, flashcards or a quiz. Check generated content before relying on it, then practise recalling the topic without looking at the notes.',
    loop: 'remember',
    href: '/notetaker',
    outcome: 'Remember: practise recalling a topic',
  },
  {
    title: 'Apex',
    desc: 'Ask for a topic explanation or help understanding a question.',
    side: 'Ask about a topic, an unfamiliar command term or a step in your reasoning. Apex can explain and ask follow-up questions. Check its answers before using them in your work.',
    loop: 'review',
    href: '/chatbot',
    outcome: 'Support: ask about a topic or question',
  },
];
