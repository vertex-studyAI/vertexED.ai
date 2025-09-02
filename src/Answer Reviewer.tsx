import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function AnswerReviewer() {
  return (
    <>
      <Helmet>
  <title>Get your essays, articles, research papers or long form answers reviewed fully, as if your teachers were here| Vertex</title>
  <meta name="description" content="Type your text here or insert an image." />
  <link rel="canonical" href="https://vertex-ai-rho.vercel.app/image-answer" />
  <meta property="og:title" content="AI Image Answer — Vertex" />
  <meta property="og:description" content="Upload an image and/or enter your prompt." />
  <meta property="og:url" content="https://vertex-ai-rho.vercel.app/image-answer" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://vertex-ai-rho.vercel.app/socialpreview.jpg" />
      </Helmet>
      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>
        <NeumorphicCard className="p-8 min-h-96" title="Answer Reviewer" info="Enter your answers and get a detailed review on what you did well and what you could do better for your curriculums demands">
          <div className="neu-input mb-6"><input className="neu-input-el" type="file" aria-label="Upload image" /></div>
          <div className="neu-surface inset p-6 rounded-2xl">
            <p className="opacity-70 text-lg">Upload an image of any question, problem, or text, and our AI will provide detailed explanations, step-by-step solutions, and additional context to help you understand the concept better.</p>
          </div>
        </NeumorphicCard>
      </PageSection>
    </>
  );
}
