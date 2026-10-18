export type ResourceCategory = 'tools' | 'methods' | 'subjects' | 'wellness';

export type ResourceArticle = {
  to: string;
  title: string;
  blurb: string;
  category: ResourceCategory;
  keywords: string;
};

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  { to: '/resources/best-ai-study-tools-2025', title: 'Choosing AI study tools', blurb: 'Evaluate a study stack by the work it supports: planning, retrieval, practice, feedback and another attempt.', category: 'tools', keywords: 'AI tools exam preparation revision stack' },
  { to: '/resources/automated-note-taking-guide', title: 'Automated note taking: capture, then learn', blurb: 'Turn lectures and PDFs into summaries you review, correct and convert into retrieval practice.', category: 'tools', keywords: 'notes lecture PDF summary flashcards' },
  { to: '/resources/how-to-use-ai-for-studying', title: 'How to use AI for studying', blurb: 'Use a plan, learn, retrieve, practise and review loop without outsourcing answers you cannot reproduce.', category: 'tools', keywords: 'AI integrity revision workflow' },
  { to: '/resources/ai-chatbot-tutor', title: 'Using Apex for study help', blurb: 'Ask for a question, explanation or critique while keeping the attempt and reasoning yours.', category: 'tools', keywords: 'chat tutor explanation Socratic' },
  { to: '/resources/ai-study-planner', title: 'AI study planner and calendar', blurb: 'Build study blocks around school, commitments, rest and the topics that need another attempt.', category: 'tools', keywords: 'schedule calendar plan revision' },
  { to: '/resources/ib-igcse-paper-maker', title: 'IB and IGCSE Paper Maker', blurb: 'Create original practice with a chosen curriculum, subject, topic, question count and mark total.', category: 'tools', keywords: 'mock paper questions IB IGCSE' },
  { to: '/resources/notes-to-flashcards', title: 'From notes to flashcards and quizzes', blurb: 'Move from a source to concise notes, cards and short quizzes built for retrieval.', category: 'tools', keywords: 'notes flashcards quiz recall' },
  { to: '/resources/ai-answer-reviewer', title: 'AI Answer Reviewer', blurb: 'Use provisional feedback to inspect structure, evidence, method and command-term alignment.', category: 'tools', keywords: 'answer feedback review marks rubric' },
  { to: '/resources/active-recall-spaced-repetition', title: 'Active recall and spaced repetition', blurb: 'Use testing and spaced return instead of relying on recognition from re-reading.', category: 'methods', keywords: 'memory retrieval spacing revision' },
  { to: '/resources/exam-strategy-time-management', title: 'Exam strategy and time management', blurb: 'Read the task, allocate by marks and preserve time to check evidence, working and units.', category: 'methods', keywords: 'exam timing command terms' },
  { to: '/resources/how-to-cram-effectively', title: 'When the exam is tomorrow', blurb: 'Choose high-value topics, timed questions and a stopping point when revision time is short.', category: 'methods', keywords: 'cram tomorrow urgent revision sleep' },
  { to: '/resources/how-to-memorize-anything-fast', title: 'Memory techniques for revision', blurb: 'Compare memory palaces, retrieval and spaced practice for different kinds of material.', category: 'methods', keywords: 'memorise memory palace recall' },
  { to: '/resources/best-ai-prompts-for-students', title: 'AI prompts for revision', blurb: 'Prompt for critique, working and another question instead of a finished submission.', category: 'methods', keywords: 'prompt AI critique reasoning' },
  { to: '/resources/ib-math-aa-ai-guide', title: 'IB Mathematics revision guide', blurb: 'Practise calculus, statistics, proof and visible working with appropriate command terms.', category: 'subjects', keywords: 'IB Math AA AI calculus statistics' },
  { to: '/resources/ib-myp-humanities-guide', title: 'IB MYP Humanities answer studio', blurb: 'Develop inquiry questions, evaluate sources and plan History or Geography responses.', category: 'subjects', keywords: 'MYP History Geography OPVL humanities' },
  { to: '/resources/igcse-science-revision', title: 'IGCSE Sciences revision', blurb: 'Review Biology, Chemistry, Physics, practical methods and structured answers.', category: 'subjects', keywords: 'IGCSE science biology chemistry physics' },
  { to: '/resources/essay-writing-with-ai', title: 'Essay writing with AI', blurb: 'Develop a thesis, evidence and conclusion while retaining your own reasoning and voice.', category: 'subjects', keywords: 'essay history English psychology thesis' },
  { to: '/resources/alevel-ap-exam-prep', title: 'A Level and AP exam preparation', blurb: 'Compare question types, extended responses and the evidence expected by your own course.', category: 'subjects', keywords: 'A Level AP FRQ essay' },
  { to: '/resources/subject-guides-common-mistakes', title: 'Common exam mistakes', blurb: 'Inspect recurring gaps in mathematics working, science units and humanities analysis.', category: 'subjects', keywords: 'errors mistakes working units analysis' },
  { to: '/resources/ib-tok-guide-ai', title: 'Using AI for IB TOK', blurb: 'Develop knowledge questions and counterclaims while keeping the argument yours.', category: 'subjects', keywords: 'IB TOK theory knowledge exhibition essay' },
  { to: '/resources/is-using-ai-cheating', title: 'Is using AI cheating?', blurb: 'Use school policy, disclosure and your ability to defend the work as practical boundaries.', category: 'wellness', keywords: 'ethics integrity cheating policy' },
  { to: '/resources/academic-burnout-guide', title: 'Academic burnout: signs and recovery', blurb: 'Recognise depletion, choose a smaller study plan and know when to stop for the night.', category: 'wellness', keywords: 'wellbeing stress sleep burnout' },
  { to: '/resources/college-essays-with-ai', title: 'College essays with AI', blurb: 'Use AI to organise questions and structure while keeping the experience and language yours.', category: 'wellness', keywords: 'admissions Common App writing integrity' },
];

export const LIBRARY_TOOLS = [
  { to: '/learn', title: 'Practice workspace', blurb: 'Choose bounded original questions, record an attempt and review the evidence.', keywords: 'practice question learning attempt', account: true },
  { to: '/exam-prep', title: 'Exam Prep', blurb: 'Set an assessment, select a session and keep retries linked to reviewed work.', keywords: 'exam assessment mock', account: true },
  { to: '/planner', title: 'Study planner', blurb: 'Add manual study blocks or request an editable suggestion.', keywords: 'calendar schedule plan', account: true },
  { to: '/study-zone', title: 'Study Zone', blurb: 'Run a focus timer beside practical revision tools.', keywords: 'focus pomodoro timer', account: true },
  { to: '/paper-maker', title: 'Paper Maker', blurb: 'Create original topic-focused practice with explicit provenance.', keywords: 'mock questions paper', account: true },
  { to: '/answer-reviewer', title: 'Answer Reviewer', blurb: 'Receive provisional feedback, then confirm evidence before recording a result.', keywords: 'feedback review answer', account: true },
  { to: '/notetaker', title: 'AI Notes and Quiz', blurb: 'Turn your own source material into notes, cards and retrieval questions.', keywords: 'notes flashcards quiz', account: true },
  { to: '/chatbot', title: 'Apex tutor', blurb: 'Ask for an explanation, guiding question or critique of an attempt.', keywords: 'AI tutor chat explain', account: true },
  { to: '/study-notebook', title: 'Study Notebook', blurb: 'Keep source-bound notes and generated study outputs together.', keywords: 'notebook research sources', account: true },
  { to: '/saved-work', title: 'Saved work', blurb: 'Reopen account-owned notes, papers, plans and answer reviews.', keywords: 'saved documents history', account: true },
  { to: '/study-tools', title: 'Formula and methods desk', blurb: 'Choose study tools and browse available references. Materials awaiting subject review are labelled.', keywords: 'formula reference command terms maths physics chemistry biology economics practice', account: false },
];

export const ARCHIVE_COLLECTIONS = [
  { to: '/archives-lnl', title: 'English Language and Literature archive', blurb: 'Starter notes, analysis prompts and response examples.', keywords: 'English literature language archive' },
  { to: '/archives-history', title: 'History archive', blurb: 'Starter timelines, causal chains and source-analysis examples.', keywords: 'History source archive' },
  { to: '/archives-geography', title: 'Geography archive', blurb: 'Starter case-study structures, diagrams and geographic explanations.', keywords: 'Geography case study archive' },
];

// Metadata remains visible in directories while held articles and collections have no delivery links.
export const RESOURCE_ARTICLE_DIRECTORY: Array<{ title: string; available: boolean }> = RESOURCE_ARTICLES.map(({ title }) => ({ title, available: false }));
export const ARCHIVE_DIRECTORY: Array<{ title: string; available: boolean }> = ARCHIVE_COLLECTIONS.map(({ title }) => ({ title, available: false }));
