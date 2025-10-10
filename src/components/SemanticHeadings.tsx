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
    // Stable H1 aligned to hero variants
    title: "AI study tools for students",
    // Reflects sections actually present on Home
    h2: ["We hate the way we study", "Explore our features"],
    h3: ["Why is this a problem?", "Ready to get started?"],
  },
  "/home": {
    title: "AI study tools for students",
    h2: ["We hate the way we study", "Explore our features"],
    h3: ["Why is this a problem?", "Ready to get started?"],
  },
  "/features": {
    title: "Deep learning meets exam-ready practice",
    h2: ["AI Calendar — schedule optimizer", "AI Discussion Agent — learn beyond the textbook"],
    h3: ["Personalisation at the core", "Quick metrics"],
  },
  "/about": {
    title: "About VertexED",
    h2: ["Mission", "Team"],
    h3: ["Story", "Contact"],
  },
  "/login": {
    title: "Login",
    h2: ["Access your account", "Security"],
    h3: ["Reset password", "Support"],
  },
  "/signup": {
    title: "Create account",
    h2: ["Get started", "Benefits"],
    h3: ["Pricing", "FAQ"],
  },
  "/main": {
    title: "Dashboard",
    h2: ["Overview", "Recent activity"],
    h3: ["Shortcuts", "Tips"],
  },
  "/notetaker": {
    title: "Notetaker & Quiz",
    h2: ["Notes", "Quizzes"],
    h3: ["Shortcuts", "Export"],
  },
  "/study-zone": {
    title: "Study Zone",
    h2: ["Workspace", "Tools"],
    h3: ["Timers", "Logs"],
  },
  "/chatbot": {
    title: "AI Chatbot",
    h2: ["Ask questions", "Explanations"],
    h3: ["Examples", "Limitations"],
  },
  "/planner": {
    title: "Study Planner",
    h2: ["Schedule", "Calendar"],
    h3: ["Tasks", "Deadlines"],
  },
  "/answer-reviewer": {
    title: "Answer Reviewer",
    h2: ["Feedback", "Improvements"],
    h3: ["Rubrics", "Examples"],
  },
  "/paper-maker": {
    title: "Paper Maker",
    h2: ["IB/IGCSE", "Question bank"],
    h3: ["Difficulty", "Topics"],
  },
  "/vertex-ed": {
    title: "Brand",
    h2: ["Identity", "Usage"],
    h3: ["Logos", "Colors"],
  },
  "/settings": {
    title: "User Settings",
    h2: ["Profile", "Preferences"],
    h3: ["Privacy", "Notifications"],
  },
};

export function getHeadingsForPath(pathname: string): HeadingEntry {
  const mapped = routeHeadingsMap[pathname];
  if (mapped) return mapped;
  return {
    title: deriveTitleFromPath(pathname),
    h2: ["Overview", "Details"],
    h3: ["More information", "Related"],
  };
}

export default SemanticHeadings;
