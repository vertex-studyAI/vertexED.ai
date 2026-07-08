import SEO from "@/components/SEO";
import PageSection from "@/components/PageSection";
import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <>
      <SEO
        title="What is VertexED (aka Vertex ED)? | Official Brand Page"
        description="VertexED — also written as Vertex ED — is an AI study toolkit for students: planner, notes, flashcards, quizzes, chatbot, answer reviewer, and more."
        canonical="https://www.vertexed.app/vertex-ed"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "VertexED (Vertex ED) Brand",
          url: "https://www.vertexed.app/vertex-ed",
          description: "VertexED, sometimes called Vertex ED, is the official brand for our AI study tools platform.",
        }}
      />
      <PageSection className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-white">VertexED (Vertex ED) — Official Brand Page</h1>
        <p className="text-slate-300 leading-relaxed mb-4">
          VertexED — sometimes written as <strong>Vertex ED</strong> — is the all‑in‑one AI study toolkit for students. Our platform brings
          planning, notes, flashcards, quizzes, an AI chatbot, an answer reviewer, and an IB/IGCSE paper generator into one focused workspace.
        </p>
        <p className="text-slate-300 leading-relaxed mb-4">
          If you searched for “vertexed” or “vertex ed”, you’re in the right place. This is the official site for the VertexED brand at
          <a className="underline ml-1" href="https://www.vertexed.app/">https://www.vertexed.app/</a>.
        </p>
        <div className="flex gap-3 mt-6">
          <Link to="/" className="neu-button">Go to Homepage</Link>
          <Link to="/features" className="neu-button">Explore Features</Link>
        </div>
      </PageSection>
    </>
  );
}
