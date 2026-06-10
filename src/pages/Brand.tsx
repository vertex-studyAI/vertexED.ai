import SEO from "@/components/SEO";
import PageSection from "@/components/PageSection";
import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <>
      <SEO
        title="What is VertexED (aka Vertex ED)? | Official Brand Page"
        description="VertexED AI — also written as Vertex ED — is an AI study toolkit for students: planner, notes, flashcards, quizzes, chatbot, answer reviewer, and more."
        canonical="https://www.vertexed.app/vertex-ed"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "VertexED (Vertex ED) Brand",
          url: "https://www.vertexed.app/vertex-ed",
          description: "VertexED, sometimes called Vertex ED, is the official brand for our AI study tools platform.",
        }}
      />
      <PageSection className="grid gap-6 max-w-4xl" surface="none">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 md:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
            Official brand page
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight brand-text-gradient">
            VertexED (Vertex ED)
          </h1>
          <p className="mt-4 max-w-3xl text-sm md:text-base leading-relaxed text-white/70">
            VertexED is the all‑in‑one AI study toolkit for students. The platform brings planning, notes, flashcards, quizzes, an AI chatbot,
            an answer reviewer, and an IB/IGCSE paper generator into one focused workspace.
          </p>
          <p className="mt-4 max-w-3xl text-sm md:text-base leading-relaxed text-white/70">
            If you searched for “vertexed” or “vertex ed”, you are in the right place. This is the official site for the VertexED brand.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/" className="rounded-3xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/8">
            <div className="text-lg font-semibold text-white">Go to homepage</div>
            <div className="mt-1 text-sm text-white/60">Return to the main study experience</div>
          </Link>
          <Link to="/features" className="rounded-3xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/8">
            <div className="text-lg font-semibold text-white">Explore features</div>
            <div className="mt-1 text-sm text-white/60">See the full toolset in one place</div>
          </Link>
        </div>
      </PageSection>
    </>
  );
}
