export type StudyPageContext = {
  page: string;
  label: string;
  hint: string;
};

const ROUTE_CONTEXT: Record<string, StudyPageContext> = {
  "/main": {
    page: "dashboard",
    label: "Dashboard",
    hint: "Help the student pick a study tool or plan their session.",
  },
  "/notetaker": {
    page: "ai-notes",
    label: "AI Notes & Flashcards",
    hint: "Discuss note structure, flashcard ideas, or quiz prep from their notes.",
  },
  "/study-zone": {
    page: "study-zone",
    label: "Study Zone",
    hint: "Support focused sessions — timers, habits, quick notes, graphing.",
  },
  "/chatbot": {
    page: "chatbot",
    label: "AI Chatbot",
    hint: "Deliberate step-by-step on concepts; ask clarifying questions.",
  },
  "/planner": {
    page: "planner",
    label: "Study Planner",
    hint: "Help schedule tasks, balance subjects, and plan revision blocks.",
  },
  "/answer-reviewer": {
    page: "answer-reviewer",
    label: "Answer Reviewer",
    hint: "Discuss rubric feedback, how to improve answers, and exam technique.",
  },
  "/paper-maker": {
    page: "paper-maker",
    label: "Paper Maker",
    hint: "Help with mock exam strategy, topic selection, and question approach.",
  },
  "/archives": {
    page: "archives",
    label: "Archives",
    hint: "Guide toward curated resources and exemplar-style answers.",
  },
  "/study-tools": {
    page: "study-tools",
    label: "Study Tools Hub",
    hint: "Help with formulas, study techniques, and tool selection.",
  },
};

export function getStudyContext(pathname: string): StudyPageContext {
  const base = pathname.split("?")[0];
  if (ROUTE_CONTEXT[base]) return ROUTE_CONTEXT[base];

  if (base.startsWith("/resources")) {
    return {
      page: "resources",
      label: "Resources",
      hint: "Explain study techniques and how VertexED tools apply.",
    };
  }
  if (base.startsWith("/archives")) {
    return ROUTE_CONTEXT["/archives"];
  }

  return {
    page: "vertexed",
    label: "VertexED",
    hint: "General academic support for IB, IGCSE, CBSE, AP, and A Level students.",
  };
}
