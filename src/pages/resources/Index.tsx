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
          <ArticleLink to="/resources/best-ai-study-tools-2025" title="Best AI Study Tools 2025" blurb="The essential guide to the top AI apps for students this year." />
          <ArticleLink to="/resources/automated-note-taking-guide" title="Automated Note Taking Guide" blurb="Stop transcribing and start learning with AI summaries." />
          <ArticleLink to="/resources/how-to-use-ai-for-studying" title="How to Use AI for Studying" blurb="A step-by-step framework for integrating AI into your routine." />
          <ArticleLink to="/resources/ai-chatbot-tutor" title="Your 24/7 AI Tutor" blurb="Get instant homework help and explanations for any subject." />
          <ArticleLink to="/resources/ib-math-aa-ai-guide" title="IB Math AA & AI Study Guide" blurb="Master Calculus, Statistics, and Proofs with AI practice." />
          <ArticleLink to="/resources/igcse-science-revision" title="IGCSE Sciences Revision" blurb="Biology, Chemistry, and Physics revision tips for A* grades." />
          <ArticleLink to="/resources/essay-writing-with-ai" title="Mastering Essay Writing" blurb="Structure perfect essays for History, English, and Psychology." />
          <ArticleLink to="/resources/alevel-ap-exam-prep" title="A-Level & AP Exam Prep" blurb="The ultimate guide for UK and US university entrance exams." />
          <ArticleLink to="/resources/ai-study-planner" title="AI Study Planner & Calendar" blurb="Schedule smarter with adaptive study blocks and spaced retrieval." />
          <ArticleLink to="/resources/ib-igcse-paper-maker" title="IB/IGCSE Paper Maker" blurb="Generate syllabus-aligned practice papers with authentic phrasing." />
          <ArticleLink to="/resources/notes-to-flashcards" title="From Notes to Flashcards (and Quizzes)" blurb="Turn any topic into active‑recall materials in minutes." />
          <ArticleLink to="/resources/ai-answer-reviewer" title="AI Answer Reviewer" blurb="Teacher‑style feedback and rubric‑aligned suggestions." />
          <ArticleLink to="/resources/active-recall-spaced-repetition" title="Active Recall & Spaced Repetition" blurb="Science-backed study with interleaving and spaced sessions." />
          <ArticleLink to="/resources/exam-strategy-time-management" title="Exam Strategy & Time Management" blurb="Turn mark schemes and timing into routine." />
          <ArticleLink to="/resources/subject-guides-common-mistakes" title="Subject Guides: Common Mistakes" blurb="High-yield fixes for Math, Sciences, and Humanities." />
          <ArticleLink to="/resources/is-using-ai-cheating" title="Is Using AI Cheating?" blurb="The student's guide to academic integrity, Turnitin, and ethics." />
          <ArticleLink to="/resources/how-to-cram-effectively" title="How to Cram Effectively" blurb="Emergency protocols for when you have 12 hours left." />
          <ArticleLink to="/resources/ib-tok-guide-ai" title="Using AI for IB TOK" blurb="Brainstorm RLS and Knowledge Questions for Essays & Exhibitions." />
          <ArticleLink to="/resources/best-ai-prompts-for-students" title="50 Best AI Prompts" blurb="Copy-paste prompts for Math, Science, and Essay feedback." />
          <ArticleLink to="/resources/academic-burnout-guide" title="Academic Burnout Guide" blurb="Recover from exhaustion with 'Minimum Viable Studying'." />
          <ArticleLink to="/resources/how-to-memorize-anything-fast" title="How to Memorize Fast" blurb="Memory Palace vs. Spaced Repetition: Which one wins?" />
          <ArticleLink to="/resources/college-essays-with-ai" title="College Essays with AI" blurb="Brainstorm Common App & Personal Statements without losing your voice." />
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
