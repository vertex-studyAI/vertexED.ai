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
  { to: "/resources/best-ai-study-tools-2025", title: "Best AI Study Tools 2025", blurb: "The essential guide to the top AI apps for students this year.", category: "tools" },
  { to: "/resources/automated-note-taking-guide", title: "Automated Note Taking Guide", blurb: "Stop transcribing and start learning with AI summaries.", category: "tools" },
  { to: "/resources/how-to-use-ai-for-studying", title: "How to Use AI for Studying", blurb: "A step-by-step framework for integrating AI into your routine.", category: "tools" },
  { to: "/resources/ai-chatbot-tutor", title: "Your 24/7 AI Tutor", blurb: "Get instant homework help and explanations for any subject.", category: "tools" },
  { to: "/resources/ai-study-planner", title: "AI Study Planner & Calendar", blurb: "Schedule smarter with adaptive study blocks and spaced retrieval.", category: "tools" },
  { to: "/resources/ib-igcse-paper-maker", title: "IB/IGCSE Paper Maker", blurb: "Generate syllabus-aligned practice papers with authentic phrasing.", category: "tools" },
  { to: "/resources/notes-to-flashcards", title: "From Notes to Flashcards (and Quizzes)", blurb: "Turn any topic into active‑recall materials in minutes.", category: "tools" },
  { to: "/resources/ai-answer-reviewer", title: "AI Answer Reviewer", blurb: "Teacher‑style feedback and rubric‑aligned suggestions.", category: "tools" },
  { to: "/resources/active-recall-spaced-repetition", title: "Active Recall & Spaced Repetition", blurb: "Science-backed study with interleaving and spaced sessions.", category: "methods" },
  { to: "/resources/exam-strategy-time-management", title: "Exam Strategy & Time Management", blurb: "Turn mark schemes and timing into routine.", category: "methods" },
  { to: "/resources/how-to-cram-effectively", title: "How to Cram Effectively", blurb: "Emergency protocols for when you have 12 hours left.", category: "methods" },
  { to: "/resources/how-to-memorize-anything-fast", title: "How to Memorize Fast", blurb: "Memory Palace vs. Spaced Repetition: Which one wins?", category: "methods" },
  { to: "/resources/best-ai-prompts-for-students", title: "50 Best AI Prompts", blurb: "Copy-paste prompts for Math, Science, and Essay feedback.", category: "methods" },
  { to: "/resources/ib-math-aa-ai-guide", title: "IB Math AA & AI Study Guide", blurb: "Master Calculus, Statistics, and Proofs with AI practice.", category: "subjects" },
  { to: "/resources/igcse-science-revision", title: "IGCSE Sciences Revision", blurb: "Biology, Chemistry, and Physics revision tips for A* grades.", category: "subjects" },
  { to: "/resources/essay-writing-with-ai", title: "Mastering Essay Writing", blurb: "Structure perfect essays for History, English, and Psychology.", category: "subjects" },
  { to: "/resources/alevel-ap-exam-prep", title: "A-Level & AP Exam Prep", blurb: "The ultimate guide for UK and US university entrance exams.", category: "subjects" },
  { to: "/resources/subject-guides-common-mistakes", title: "Subject Guides: Common Mistakes", blurb: "High-yield fixes for Math, Sciences, and Humanities.", category: "subjects" },
  { to: "/resources/ib-tok-guide-ai", title: "Using AI for IB TOK", blurb: "Brainstorm RLS and Knowledge Questions for Essays & Exhibitions.", category: "subjects" },
  { to: "/resources/is-using-ai-cheating", title: "Is Using AI Cheating?", blurb: "The student's guide to academic integrity, Turnitin, and ethics.", category: "wellness" },
  { to: "/resources/academic-burnout-guide", title: "Academic Burnout Guide", blurb: "Recover from exhaustion with 'Minimum Viable Studying'.", category: "wellness" },
  { to: "/resources/college-essays-with-ai", title: "College Essays with AI", blurb: "Brainstorm Common App & Personal Statements without losing your voice.", category: "wellness" },
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
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Practical guides, subject tips, and tool walkthroughs — searchable and categorized.
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
                  : "bg-white/5 text-muted-foreground border border-white/10 hover:text-foreground"
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
      className="block p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/20 transition-colors"
    >
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{blurb}</p>
      <div className="mt-3 text-xs text-primary">Read more →</div>
    </Link>
  );
}
