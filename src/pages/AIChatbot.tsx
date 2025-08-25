import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function AIChatbot() {
  return (
    <>
      <Helmet>
  <title>AI Study Chatbot — Get Help and Explanations | Vertex</title>
  <meta name="description" content="Chat with an AI study helper to understand topics and plan your study sessions." />
  <link rel="canonical" href="https://vertex-ai-rho.vercel.app/chatbot" />
  <meta property="og:title" content="AI Study Chatbot — Vertex" />
  <meta property="og:description" content="Chat with an AI study helper to get explanations and plan." />
  <meta property="og:url" content="https://vertex-ai-rho.vercel.app/chatbot" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://vertex-ai-rho.vercel.app/socialpreview.jpg" />
      </Helmet>
      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>
        <NeumorphicCard className="p-8 h-[70vh] flex flex-col">
          <div className="flex-1 neu-surface inset p-6 rounded-2xl mb-6">
            <p className="opacity-70 text-lg">AI assistant messages will appear here. Ask questions about your studies, get explanations, or request help with assignments.</p>
          </div>
          <div className="neu-input"><input className="neu-input-el" placeholder="Ask me anything about your studies..." /></div>
        </NeumorphicCard>
      </PageSection>
    </>
  );
}
