import React from "react";
import { useLocation } from "react-router-dom";

type SemanticHeadingsProps = {
  title: string;
  h2?: string[];
  h3?: string[];
};

/**
 * Renders semantic headings hidden from visual layout but available to crawlers and screen readers.
 * Uses Tailwind's sr-only utility to avoid any UI shifts.
 */
export function SemanticHeadings({ title, h2 = [], h3 = [] }: SemanticHeadingsProps) {
  return (
    <div className="sr-only">
      {/* Use an ARIA-level 1 heading to avoid a duplicate real <h1> */}
      <div role="heading" aria-level={1}>{title}</div>
      {h2.slice(0, 2).map((txt, i) => (
        <h2 key={`h2-${i}`}>{txt}</h2>
      ))}
      {h3.slice(0, 2).map((txt, i) => (
        <h3 key={`h3-${i}`}>{txt}</h3>
      ))}
    </div>
  );
}

function toTitleCase(slug: string) {
  return slug
    .replace(/^\/+|\/+$/g, "")
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function deriveTitleFromPath(pathname: string) {
  if (!pathname || pathname === "/") return "Home";
  const parts = pathname.split("/").filter(Boolean);
  // Prefer last segment for title
  const last = parts[parts.length - 1] ?? "page";
  return toTitleCase(last);
}

/**
 * Route-aware wrapper that injects default headings per route.
 */
export function RouteSemanticHeadings() {
  const { pathname } = useLocation();

  const entry = getHeadingsForPath(pathname);

  return <SemanticHeadings title={entry.title} h2={entry.h2} h3={entry.h3} />;
}

export type HeadingEntry = { title: string; h2: string[]; h3: string[] };

export const routeHeadingsMap: Record<string, HeadingEntry> = {
  "/": {
    title: "VertexED — study tools for exam preparation",
    h2: ["The problems students actually face", "Six tools, one revision loop"],
    h3: ["How we think about learning", "Built by students, used by students"],
  },
  "/home": {
    title: "VertexED — study tools for exam preparation",
    h2: ["The problems students actually face", "Six tools, one revision loop"],
    h3: ["How we think about learning", "Built by students, used by students"],
  },
  "/features": {
    title: "How VertexED works — full feature walkthrough",
    h2: ["The revision loop", "Platform tools and ecosystem"],
    h3: ["Board support", "Revision week workflow"],
  },
  "/about": {
    title: "About VertexED",
    h2: ["Our story", "Founding team"],
    h3: ["Mission", "Contact"],
  },
  "/login": {
    title: "Log in to VertexED",
    h2: ["Access your workspace", "Account security"],
    h3: ["Google sign-in", "Email and password"],
  },
  "/signup": {
    title: "Join VertexED",
    h2: ["Waitlist", "Invite signup"],
    h3: ["Private beta", "Create account"],
  },
  "/main": {
    title: "Dashboard",
    h2: ["Today's plan", "Study tools"],
    h3: ["Quick actions", "Recent saved work"],
  },
  "/learning-hub": {
    title: "Learning Hub",
    h2: ["Your learning path", "Subject tracks"],
    h3: ["Daily progress", "Command terms"],
  },
  "/notetaker": {
    title: "Notes, flashcards, and quizzes",
    h2: ["Generate notes", "Active recall"],
    h3: ["Spaced repetition", "Quiz formats"],
  },
  "/study-zone": {
    title: "Study Zone",
    h2: ["Focus session", "Built-in study tools"],
    h3: ["Timer", "Session notes"],
  },
  "/chatbot": {
    title: "Apex — discussion-first study AI",
    h2: ["Socratic help", "Exam technique"],
    h3: ["Board-aware answers", "Socratic drill"],
  },
  "/planner": {
    title: "Study Planner",
    h2: ["Weekly schedule", "Calendar"],
    h3: ["Tasks", "Exam deadlines"],
  },
  "/answer-reviewer": {
    title: "Answer Reviewer",
    h2: ["Rubric feedback", "Mark scheme alignment"],
    h3: ["Handwritten work", "Improvement steps"],
  },
  "/paper-maker": {
    title: "Paper Maker",
    h2: ["Board-aligned mocks", "Mark schemes"],
    h3: ["Topics and timing", "Export"],
  },
  "/vertex-ed": {
    title: "VertexED brand",
    h2: ["Product name", "Search terms"],
    h3: ["Homepage", "Features"],
  },
  "/study-tools": {
    title: "Study Tools Hub",
    h2: ["Formula reference", "Study techniques"],
    h3: ["Exam checklist", "Tool shortcuts"],
  },
  "/user-settings": {
    title: "Account Settings",
    h2: ["Profile", "Learning preferences"],
    h3: ["Curriculum", "Saved work"],
  },
  "/archives": {
    title: "Archives",
    h2: ["Subject notes", "Exemplars"],
    h3: ["Language and Literature", "History and Geography"],
  },
  "/resources": {
    title: "Resources and guides",
    h2: ["Tool walkthroughs", "Study methods"],
    h3: ["Subject guides", "Wellness and ethics"],
  },
  "/resources/ai-study-planner": {
    title: "AI Study Planner guide",
    h2: ["Scheduling", "Spaced retrieval"],
    h3: ["Time-boxing", "Weekly planning"],
  },
  "/resources/ib-igcse-paper-maker": {
    title: "Paper Maker guide",
    h2: ["Syllabus alignment", "Timed practice"],
    h3: ["Mark schemes", "Export to PDF"],
  },
  "/resources/notes-to-flashcards": {
    title: "Notes to flashcards guide",
    h2: ["Summarise", "Generate cards"],
    h3: ["Quizzes", "Spaced repetition"],
  },
  "/resources/ai-answer-reviewer": {
    title: "Answer Reviewer guide",
    h2: ["Rubric feedback", "Command terms"],
    h3: ["Retry strategy", "Marks earned and lost"],
  },
};

export function getHeadingsForPath(pathname: string): HeadingEntry {
  const mapped = routeHeadingsMap[pathname];
  if (mapped) return mapped;
  return {
    title: deriveTitleFromPath(pathname),
    h2: [`${deriveTitleFromPath(pathname)} overview`],
    h3: ["Details"],
  };
}

export default SemanticHeadings;
