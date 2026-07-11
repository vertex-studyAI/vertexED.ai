import SEO from "@/components/SEO";
import PageSection from "@/components/PageSection";
import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <>
      <SEO
        title="What is VertexED (aka Vertex ED)? | Official Brand Page"
        description="VertexED (also written Vertex ED) is a study workspace for exam students — planner, Study Zone, board-shaped mocks, rubric feedback, notes, flashcards, and Apex."
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
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">VertexED (Vertex ED) — Official Brand Page</h1>
        <p className="text-muted-foreground leading-relaxed mb-4">
          VertexED — sometimes written as <strong>Vertex ED</strong> — is one workspace for exam preparation: weekly planning,
          timed mocks aligned to your board, mark-scheme feedback, spaced flashcards, and discussion-first AI (Apex).
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you searched for &ldquo;vertexed&rdquo; or &ldquo;vertex ed&rdquo;, this is the official product site at
          <a className="underline ml-1" href="https://www.vertexed.app/">https://www.vertexed.app/</a>.
          We are not affiliated with Google Vertex AI or other unrelated &ldquo;Vertex&rdquo; products.
        </p>
        <div className="flex gap-3 mt-6">
          <Link to="/" className="neu-button">Go to Homepage</Link>
          <Link to="/features" className="neu-button">Explore Features</Link>
        </div>
      </PageSection>
    </>
  );
}
