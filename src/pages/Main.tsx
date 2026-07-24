import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Brain,
  CalendarDays,
  FileCheck2,
  FileText,
  Library,
  MessageCircle,
  PenLine,
  Timer,
} from "lucide-react";

import ContinueSessionBanner from "@/components/ContinueSessionBanner";
import LiquidGlass from "@/components/LiquidGlass";
import SavedWorkList from "@/components/SavedWorkList";
import TodayPlanPanel from "@/components/dashboard/TodayPlanPanel";
import { useAuth } from "@/contexts/AuthContext";
import { buildEcosystemBrief, type EcosystemBrief } from "@/lib/studyEcosystem";
import { buildTodayPlanItems } from "@/lib/todayPlan";
import { listStudyArtifactsDetailed, type StudyArtifact } from "@/lib/userContent";

type Tool = {
  title: string;
  description: string;
  to: string;
  cta: string;
  icon: typeof CalendarDays;
};

const CORE_TOOLS: Tool[] = [
  { title: "Plan your week", description: "Add deadlines and build a realistic revision plan.", to: "/planner", cta: "Open planner", icon: CalendarDays },
  { title: "Focus tools", description: "Run a timer, work through problems, and keep session notes in one place.", to: "/study-zone?focus=timer", cta: "Start a session", icon: Timer },
  { title: "Notes, flashcards & quizzes", description: "Turn a topic or class material into notes and retrieval practice.", to: "/notetaker", cta: "Make study material", icon: Brain },
  { title: "Practice papers", description: "Create a timed practice paper by board, subject, and topic.", to: "/paper-maker", cta: "Create a paper", icon: FileText },
  { title: "Answer feedback", description: "Get practical feedback on a written answer or completed practice question.", to: "/answer-reviewer", cta: "Review an answer", icon: FileCheck2 },
  { title: "AI tutor", description: "Talk through a concept, question, or feedback without leaving the study flow.", to: "/chatbot", cta: "Ask a question", icon: MessageCircle },
  { title: "Study from your materials", description: "Bring together your own sources for grounded chat, guides, and revision outputs.", to: "/study-notebook", cta: "Open notebook", icon: BookOpen },
  { title: "MYP study guides", description: "Browse the complete imported guides for all eight MYP subjects in one reliable reader.", to: "/study-guides", cta: "Open study guides", icon: GraduationCap },
];

export default function Main() {
  const { user } = useAuth();
  const [brief, setBrief] = useState<EcosystemBrief | null>(null);
  const [recentArtifacts, setRecentArtifacts] = useState<StudyArtifact[]>([]);

  useEffect(() => {
    const refresh = () => setBrief(buildEcosystemBrief(user));
    refresh();
    void listStudyArtifactsDetailed().then(({ items }) => setRecentArtifacts(items.slice(0, 4)));
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [user]);

  const todayItems = brief ? buildTodayPlanItems(brief.todayTasks, brief.adaptivePlan.recommendations) : [];
  const dueFlashcards = brief?.dueFlashcards ?? 0;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0];

  return (
    <>
      <Helmet>
        <title>Study dashboard | VertexED</title>
        <meta name="description" content="Choose a study task: plan, focus, make notes, practise, get feedback, or ask for help." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="dashboard-shell mx-auto w-full max-w-7xl space-y-7 pb-6">
        <LiquidGlass as="section" variant="hero" className="dashboard-hero">
          <span className="dashboard-orb dashboard-orb-one" aria-hidden />
          <span className="dashboard-orb dashboard-orb-two" aria-hidden />
          <span className="dashboard-grid-glow" aria-hidden />
          <div className="dashboard-hero-copy">
            <p className="dashboard-kicker">{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</p>
            <h1>Make this study session count.</h1>
            <p className="dashboard-hero-text">Pick one clear task. Plan it, work on it, practise it, or get help with it.</p>
            <div className="dashboard-hero-actions">
              <Link to="/study-zone?focus=timer" className="dashboard-primary-action">
                Start a focus session <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/study-guides" className="dashboard-secondary-action">Open MYP study guides</Link>
              <Link to="/planner" className="dashboard-secondary-action">Open planner</Link>
            </div>
          </div>
          <div className="dashboard-hero-stats" aria-label="Study summary">
            <div><span>Today</span><strong>{todayItems.length || "-"}</strong><small>{todayItems.length === 1 ? "next step" : "next steps"}</small></div>
            <div><span>Review</span><strong>{dueFlashcards || "-"}</strong><small>{dueFlashcards === 1 ? "card due" : "cards due"}</small></div>
            <div><span>Tools</span><strong>{CORE_TOOLS.length}</strong><small>clear workflows</small></div>
          </div>
        </LiquidGlass>

        <ContinueSessionBanner />

        {todayItems.length > 0 && (
          <section className="dashboard-today-wrap" aria-label="Your next study steps">
            <TodayPlanPanel items={todayItems} />
          </section>
        )}

        <section aria-labelledby="study-tools-heading">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-kicker">Your workspace</p>
              <h2 id="study-tools-heading">Choose your next step</h2>
            </div>
            {dueFlashcards > 0 && (
              <Link to="/notetaker" className="dashboard-due-link">
                Review {dueFlashcards} due card{dueFlashcards === 1 ? "" : "s"} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </div>

          <div className="dashboard-tool-grid">
            {CORE_TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.title} to={tool.to} className={`dashboard-tool-link dashboard-tool-${index + 1}`}>
                  <LiquidGlass as="article" variant="tile" className="dashboard-tool-card">
                    <div className="dashboard-tool-icon"><Icon className="h-5 w-5" aria-hidden /></div>
                    <div className="dashboard-tool-copy">
                      <h3>{tool.title}</h3>
                      <p>{tool.description}</p>
                    </div>
                    <span className="dashboard-tool-cta">{tool.cta} <ArrowRight className="h-4 w-4" aria-hidden /></span>
                  </LiquidGlass>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="dashboard-support-grid" aria-label="Additional study resources">
          <LiquidGlass as="article" variant="card" className="dashboard-support-card">
            <Library className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="dashboard-kicker">Reference</p>
              <h2>Board resources</h2>
              <p>Board guides, command terms, formulas, and study articles when you need a fast answer.</p>
            </div>
            <div className="dashboard-support-links">
              <Link to="/resource-library">Board guides</Link>
              <Link to="/study-tools">Formula reference</Link>
              <Link to="/resources">Study articles</Link>
            </div>
          </LiquidGlass>

          <LiquidGlass as="article" variant="card" className="dashboard-support-card">
            <PenLine className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="dashboard-kicker">Personalize</p>
              <h2>Set up your study space</h2>
              <p>Update your board, subjects, goals, and preferences so the tools stay relevant to you.</p>
            </div>
            <Link to="/user-settings" className="dashboard-due-link">Open settings <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </LiquidGlass>
        </section>

        {recentArtifacts.length > 0 && (
          <LiquidGlass as="section" variant="panel" className="dashboard-recent" aria-labelledby="recent-work-heading">
            <div className="dashboard-section-heading">
              <div>
                <p className="dashboard-kicker">Saved work</p>
                <h2 id="recent-work-heading">Pick up where you left off</h2>
              </div>
              <Link to="/user-settings" className="dashboard-due-link">View all <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            <SavedWorkList
              items={recentArtifacts}
              compact
              variant="dashboard"
              onChanged={() => void listStudyArtifactsDetailed().then(({ items }) => setRecentArtifacts(items.slice(0, 4)))}
            />
          </LiquidGlass>
        )}
      </div>
    </>
  );
}
