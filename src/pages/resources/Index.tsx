import SEO from "@/components/SEO";
import PageSection from "@/components/PageSection";
import { Link } from "react-router-dom";

export default function ResourcesIndex() {
  return (
    <>
      <SEO
        title="Resources · VertexED AI Study Tools"
        description="Guides and deep dives on VertexED features: AI study planner and calendar, IB/IGCSE paper maker, notes → flashcards workflow, and AI answer reviewer."
        canonical="https://www.vertexed.app/resources"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "VertexED Resources",
          url: "https://www.vertexed.app/resources",
          description: "Guides and deep dives on VertexED features."
        }}
      />

      <PageSection className="max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4">Resources</h1>
        <p className="text-slate-300 mb-8">Practical guides about the tools students use most inside VertexED.</p>

        <div className="grid md:grid-cols-2 gap-5">
          <ArticleLink to="/resources/ai-study-planner" title="AI Study Planner & Calendar" blurb="Schedule smarter with adaptive study blocks and spaced retrieval." />
          <ArticleLink to="/resources/ib-igcse-paper-maker" title="IB/IGCSE Paper Maker" blurb="Generate syllabus-aligned practice papers with authentic phrasing." />
          <ArticleLink to="/resources/notes-to-flashcards" title="From Notes to Flashcards (and Quizzes)" blurb="Turn any topic into active‑recall materials in minutes." />
          <ArticleLink to="/resources/ai-answer-reviewer" title="AI Answer Reviewer" blurb="Teacher‑style feedback and rubric‑aligned suggestions." />
          <ArticleLink to="/resources/active-recall-spaced-repetition" title="Active Recall & Spaced Repetition" blurb="Science-backed study with interleaving and spaced sessions." />
          <ArticleLink to="/resources/exam-strategy-time-management" title="Exam Strategy & Time Management" blurb="Turn mark schemes and timing into routine." />
          <ArticleLink to="/resources/subject-guides-common-mistakes" title="Subject Guides: Common Mistakes" blurb="High-yield fixes for Math, Sciences, and Humanities." />
        </div>

        <div className="mt-10 text-sm text-slate-400">
          Prefer to jump right in? Try the tools: {" "}
          <Link className="underline" to="/planner">Planner</Link>, {" "}
          <Link className="underline" to="/paper-maker">Paper Maker</Link>, {" "}
          <Link className="underline" to="/notetaker">Notetaker</Link>, {" "}
          <Link className="underline" to="/answer-reviewer">Answer Reviewer</Link>.
        </div>

        <div className="mt-6 text-xs text-slate-400">
          About VertexED: an AI study toolkit that combines planning, papers, flashcards, quizzes, and rubric‑style
          feedback. If you searched for VertexED or Vertex ED, you’re in the right place — explore the guides above to
          see how the platform works.
        </div>
      </PageSection>
    </>
  );
}

function ArticleLink({ to, title, blurb }: { to: string; title: string; blurb: string }) {
  return (
    <Link to={to} className="block p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      <h2 className="text-xl font-medium text-white">{title}</h2>
      <p className="text-slate-300 mt-2 text-sm">{blurb}</p>
      <div className="mt-3 text-xs text-slate-400">Read more →</div>
    </Link>
  );
}
