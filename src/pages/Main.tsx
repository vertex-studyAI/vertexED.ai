import { useEffect, useState } from "react";
import { Link } from "react-router";
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
  Target,
} from "lucide-react";

import ContinueSessionBanner from "@/components/ContinueSessionBanner";
import LiquidGlass from "@/components/LiquidGlass";
import SavedWorkList from "@/components/SavedWorkList";
import TodayPlanPanel from "@/components/dashboard/TodayPlanPanel";
import LearningCommandCenter from "@/components/dashboard/LearningCommandCenter";
import { useAuth } from "@/contexts/AuthContext";
import { buildEcosystemBrief, type EcosystemBrief } from "@/lib/studyEcosystem";
import { buildTodayPlanItems } from "@/lib/todayPlan";
import {
  getLocalArtifactCount,
  listStudyArtifactsDetailed,
  syncLocalStudyArtifacts,
  type StudyArtifact,
} from "@/lib/userContent";
import { getPendingMockReview, type PendingMockReview } from "@/lib/examFlow";
import { getDueRetries, getRetryQueue, type RetryItem } from "@/lib/retryQueue";
import { getWeaknessHeatmap, type TopicHeat } from "@/lib/weaknessTracker";
import { getPendingLearnerStateCount, hydrateLearnerState, syncLearnerState } from "@/lib/learnerStateSync";

type Tool = {
  title: string;
  description: string;
  to: string;
  cta: string;
  icon: typeof CalendarDays;
};

const CORE_TOOLS: Tool[] = [
  { title: "Exam prep", description: "Build today's session from your exam date, subjects, due reviews, and verified weak-topic evidence.", to: "/exam-prep", cta: "Open exam plan", icon: Target },
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
  const [retries, setRetries] = useState<RetryItem[]>([]);
  const [weaknesses, setWeaknesses] = useState<TopicHeat[]>([]);
  const [pendingMock, setPendingMock] = useState<PendingMockReview | null>(null);
  const [localSaveCount, setLocalSaveCount] = useState(0);
  const [cloudUnavailable, setCloudUnavailable] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>();

  useEffect(() => {
    const refresh = () => {
      setBrief(buildEcosystemBrief(user));
      setRetries(getRetryQueue());
      setWeaknesses(getWeaknessHeatmap(6));
      setPendingMock(getPendingMockReview());
      setLocalSaveCount(getLocalArtifactCount() + getPendingLearnerStateCount());
    };
    const refreshArtifacts = () => void listStudyArtifactsDetailed().then((result) => {
      setRecentArtifacts(result.items.slice(0, 4));
      setCloudUnavailable(result.cloudUnavailable === true);
      setLocalSaveCount(getLocalArtifactCount() + getPendingLearnerStateCount());
    });
    refresh();
    refreshArtifacts();
    const onFocus = () => {
      refresh();
      refreshArtifacts();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("vertexed:learner-state-changed", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("vertexed:learner-state-changed", onFocus);
    };
  }, [user]);

  const todayItems = brief ? buildTodayPlanItems(brief.todayTasks, brief.adaptivePlan.recommendations) : [];
  const dueFlashcards = brief?.dueFlashcards ?? 0;
  const dueRetries = getDueRetries().length;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0];

  return (
    <>
      <Helmet>
        <title>Study dashboard | VertexED</title>
        <meta name="description" content="Choose a study task: plan, focus, make notes, practise, get feedback, or ask for help." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="dashboard-shell mx-auto w-full max-w-7xl space-y-7 pb-6">
        <section className="desk-header">
          <div className="desk-header-layout">
          <div className="dashboard-hero-copy">
            <p className="dashboard-kicker">{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</p>
            <h1>Your study desk</h1>
            <p className="dashboard-hero-text">Start with today&apos;s plan, or pick up a piece of saved work.</p>
            <div className="dashboard-hero-actions">
              <Link to="/exam-prep" className="dashboard-primary-action">
                Open today&apos;s exam plan <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/planner" className="dashboard-secondary-action">Open planner</Link>
            </div>
          </div>
          <div className="dashboard-hero-stats" aria-label="Study summary">
            <div><span>Today</span><strong>{todayItems.length || "-"}</strong><small>{todayItems.length === 1 ? "next step" : "next steps"}</small></div>
            <div><span>Review</span><strong>{dueFlashcards + dueRetries || "-"}</strong><small>cards and retries due</small></div>
          </div>
          </div>
        </section>

        <ContinueSessionBanner />

        <section className="desk-recent" aria-labelledby="recent-work-heading">
          <div className="dashboard-section-heading">
            <h2 id="recent-work-heading">Continue studying</h2>
            <Link to="/user-settings" className="dashboard-due-link">All saved work <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          {recentArtifacts.length > 0 ? (
            <SavedWorkList
              items={recentArtifacts}
              compact
              variant="dashboard"
              onChanged={() => void listStudyArtifactsDetailed().then(({ items }) => setRecentArtifacts(items.slice(0, 4)))}
            />
          ) : (
            <div className="desk-first-session">
              <div><h3>Start with something you&apos;re learning.</h3><p>Add your class notes to a notebook, or build a practice session. Your saved work will appear here.</p></div>
              <Link to="/study-notebook" className="btn-glass">Open a notebook <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          )}
        </section>

        <LearningCommandCenter
          retries={retries}
          weaknesses={weaknesses}
          pendingMock={pendingMock}
          localSaveCount={localSaveCount}
          cloudUnavailable={cloudUnavailable}
          syncing={syncing}
          syncMessage={syncMessage}
          onRetrySync={() => {
            setSyncing(true);
            setSyncMessage(undefined);
            void Promise.all([syncLocalStudyArtifacts(), syncLearnerState()])
              .then(async ([artifactResult, stateResult]) => {
                await hydrateLearnerState();
                const refreshed = await listStudyArtifactsDetailed();
                setRecentArtifacts(refreshed.items.slice(0, 4));
                setCloudUnavailable(refreshed.cloudUnavailable === true);
                const synced = artifactResult.synced + stateResult.synced;
                const remaining = artifactResult.remaining + stateResult.remaining;
                setLocalSaveCount(remaining);
                setSyncMessage(remaining === 0
                  ? `${synced} device save${synced === 1 ? '' : 's'} synced.`
                  : `${synced} synced; ${remaining} still safe on this device.`);
              })
              .finally(() => setSyncing(false));
          }}
        />

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

          <div className="desk-tool-list">
            {CORE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.title} to={tool.to} className="desk-tool-row">
                    <Icon className="h-5 w-5" aria-hidden />
                    <div>
                      <h3>{tool.title}</h3>
                      <p>{tool.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4" aria-hidden />
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

      </div>
    </>
  );
}
