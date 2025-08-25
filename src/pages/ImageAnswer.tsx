import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function ImageAnswer() {
  return (
    <>
      <Helmet>
  <title>Solve Questions from Images — AI Image Answer | Vertex</title>
  <meta name="description" content="Upload an image of a question to get step-by-step guidance (UI placeholder)." />
  <link rel="canonical" href="https://vertex-ai-rho.vercel.app/image-answer" />
  <meta property="og:title" content="AI Image Answer — Vertex" />
  <meta property="og:description" content="Upload an image of a question to get help." />
  <meta property="og:url" content="https://vertex-ai-rho.vercel.app/image-answer" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://vertex-ai-rho.vercel.app/socialpreview.jpg" />
      </Helmet>
      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>
        <NeumorphicCard className="p-8 min-h-96" title="Image Analysis" info="Upload photos of questions to get step-by-step AI-powered solutions.">
          <div className="neu-input mb-6"><input className="neu-input-el" type="file" aria-label="Upload image" /></div>
          <div className="neu-surface inset p-6 rounded-2xl">
            <p className="opacity-70 text-lg">Upload an image of any question, problem, or text, and our AI will provide detailed explanations, step-by-step solutions, and additional context to help you understand the concept better.</p>
          </div>
        </NeumorphicCard>
      </PageSection>
    </>
  );
}
