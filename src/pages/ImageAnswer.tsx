import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function ImageAnswer() {
  return (
    <>
      <Helmet>
        <title>Vertex — Image Answer</title>
        <meta name="description" content="Upload an image of a question to get guided help (placeholder)." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/image-answer'} />
      </Helmet>
      <div className="mb-6">
        <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
      </div>
      
      <NeumorphicCard className="p-8 min-h-96" title="Image Analysis" info="Upload photos of questions to get step-by-step AI-powered solutions.">
        <div className="neu-input mb-6"><input className="neu-input-el" type="file" aria-label="Upload image" /></div>
        <div className="neu-surface inset p-6 rounded-2xl">
          <p className="opacity-70 text-lg">Upload an image of any question, problem, or text, and our AI will provide detailed explanations, step-by-step solutions, and additional context to help you understand the concept better.</p>
        </div>
      </NeumorphicCard>
    </>
  );
}
