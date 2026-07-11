import { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import PageSection from "@/components/PageSection";
import { Link } from "react-router-dom";
import { BookOpen, Brain, GraduationCap, Heart, Search, Wrench } from "lucide-react";

type Article = {
  to: string;
  title: string;
  blurb: string;
  category: "tools" | "methods" | "subjects" | "wellness";
};

const ARTICLES: Article[] = [
  { to: "/resources/best-ai-study-tools-2025", title: "Choosing AI study tools in 2025", blurb: "What to look for in a study stack — rubric feedback, board-shaped mocks, and retrieval — not feature count.", category: "tools" },
  { to: "/resources/automated-note-taking-guide", title: "Automated note taking: capture, then learn", blurb: "Turn lectures and PDFs into summaries you review the same day — then flashcards, not a highlight graveyard.", category: "tools" },
  { to: "/resources/how-to-use-ai-for-studying", title: "How to use AI for studying", blurb: "Five-step framework — plan, learn, retrieve, mock, review — without outsourcing answers you can't reproduce.", category: "tools" },
  { to: "/resources/ai-chatbot-tutor", title: "Using Apex for study help", blurb: "How to get Socratic explanations, rubric sense, and exam technique — without outsourcing your thinking.", category: "tools" },
  { to: "/resources/ai-study-planner", title: "AI study planner and calendar", blurb: "Block mocks, retrieval, and focus sessions around school, sport, and sleep — tasks link to the right tool.", category: "tools" },
  { to: "/resources/ib-igcse-paper-maker", title: "IB/IGCSE Paper Maker", blurb: "Generate syllabus-aligned mocks with command words, mark totals, and topics you choose — then sit them under time.", category: "tools" },
  { to: "/resources/notes-to-flashcards", title: "From Notes to Flashcards (and Quizzes)", blurb: "Same source material → notes → spaced cards → short quizzes. Built for retrieval, not re-reading.", category: "tools" },
  { to: "/resources/ai-answer-reviewer", title: "AI Answer Reviewer", blurb: "Paste or photograph answers; get feedback aligned to mark schemes — structure, evidence, command terms.", category: "tools" },
  { to: "/resources/active-recall-spaced-repetition", title: "Active Recall & Spaced Repetition", blurb: "Why testing beats highlighting, how intervals work, and how VertexED schedules cards before you forget.", category: "methods" },
  { to: "/resources/exam-strategy-time-management", title: "Exam Strategy & Time Management", blurb: "Skim the paper, allocate by marks, watch command terms — routines that survive in the hall.", category: "methods" },
  { to: "/resources/how-to-cram-effectively", title: "How to cram when the exam is tomorrow", blurb: "High-mark topics, timed questions, and sleep — not one more unread chapter.", category: "methods" },
  { to: "/resources/how-to-memorize-anything-fast", title: "Memory techniques for exam revision", blurb: "Memory palace for one-off lists vs spaced repetition for syllabus content — when each earns its time.", category: "methods" },
  { to: "/resources/best-ai-prompts-for-students", title: "AI prompts that help with revision", blurb: "Maths working, essay structure, mark-scheme gaps — prompts that critique your attempt, not copy-paste answers.", category: "methods" },
  { to: "/resources/ib-math-aa-ai-guide", title: "IB Math AA and AI: revision guide", blurb: "Calculus, statistics, and proofs — show-your-working practice and IB command words.", category: "subjects" },
  { to: "/resources/igcse-science-revision", title: "IGCSE Sciences Revision", blurb: "Biology, Chemistry, and Physics — practicals, definitions, and structured answers for top-band marks.", category: "subjects" },
  { to: "/resources/essay-writing-with-ai", title: "Essay writing with AI", blurb: "History, English, Psychology — thesis, evidence, and conclusion under time without losing your voice.", category: "subjects" },
  { to: "/resources/alevel-ap-exam-prep", title: "A-Level and AP exam prep", blurb: "What each qualification demands — FRQs, essays, synoptic questions, and mark-scheme habits.", category: "subjects" },
  { to: "/resources/subject-guides-common-mistakes", title: "Common exam mistakes", blurb: "Repeated mark losses in maths working, science units, and humanities analysis — and how to fix them.", category: "subjects" },
  { to: "/resources/ib-tok-guide-ai", title: "Using AI for IB TOK", blurb: "Brainstorm RLS and knowledge questions for the essay and exhibition — without letting AI write the argument.", category: "subjects" },
  { to: "/resources/is-using-ai-cheating", title: "Is using AI cheating?", blurb: "School policies, Turnitin, and where AI support crosses into work you can't defend orally or in the hall.", category: "wellness" },
  { to: "/resources/academic-burnout-guide", title: "Academic burnout: signs and recovery", blurb: "When you're depleted — minimum viable studying, sleep, and when to stop for the night.", category: "wellness" },
  { to: "/resources/college-essays-with-ai", title: "College Essays with AI", blurb: "Brainstorm Common App angles and structure drafts — keep the story yours for admissions readers.", category: "wellness" },
];

const CATEGORIES = [
  { id: "all" as const, label: "All", icon: BookOpen },
  { id: "tools" as const, label: "Vertex Tools", icon: Wrench },
  { id: "methods" as const, label: "Study Methods", icon: Brain },
  { id: "subjects" as const, label: "Subject Guides", icon: GraduationCap },
  { id: "wellness" as const, label: "Wellness & Ethics", icon: Heart },
];

export default function ResourcesIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTICLES.filter((a) => {
      const matchCat = category === "all" || a.category === category;
      const matchQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.blurb.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, category]);

  return (
    <>
      <SEO
        title="Resources · VertexED AI Study Tools"
        description="Guides and deep dives on VertexED features: AI study planner, paper maker, flashcards, answer reviewer, and study techniques."
        canonical="https://www.vertexed.app/resources"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "VertexED Resources",
          url: "https://www.vertexed.app/resources",
          description: "Guides and deep dives on VertexED features.",
        }}
      />

      <PageSection className="max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-semibold brand-text-gradient inline-block mb-4">
          Resources
        </h1>
        <p className="text-muted-foreground mb-6 max-w-2xl leading-relaxed">
          Guides written for real exam prep — tool walkthroughs, study methods, subject specifics, and integrity.
          Search by topic or filter by category; each article links back into the matching VertexED tool where it applies.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="neu-input-el w-full pl-10"
              placeholder="Search guides…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Link to="/study-tools" className="neu-button px-4 py-2 text-sm text-center shrink-0">
            Formula & Tools Hub →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
                category === cat.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "surface-chip text-muted-foreground hover:text-foreground"
              }`}
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} guide{filtered.length === 1 ? "" : "s"}
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((article) => (
            <ArticleLink key={article.to} {...article} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No guides match your search.</p>
        )}

        <div className="mt-10 glass-panel p-5 rounded-2xl">
          <p className="text-sm font-medium text-foreground mb-2">Jump into tools</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="text-primary hover:underline" to="/planner">Planner</Link>
            <Link className="text-primary hover:underline" to="/paper-maker">Paper Maker</Link>
            <Link className="text-primary hover:underline" to="/notetaker">AI Notes</Link>
            <Link className="text-primary hover:underline" to="/answer-reviewer">Answer Reviewer</Link>
            <Link className="text-primary hover:underline" to="/study-zone">Study Zone</Link>
          </div>
        </div>
      </PageSection>
    </>
  );
}

function ArticleLink({ to, title, blurb }: Pick<Article, "to" | "title" | "blurb">) {
  return (
    <Link
      to={to}
      className="block p-5 rounded-2xl surface-tile hover:bg-foreground/[0.06] hover:border-primary/20 transition-colors"
    >
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{blurb}</p>
      <div className="mt-3 text-xs text-primary">Read more →</div>
    </Link>
  );
}
