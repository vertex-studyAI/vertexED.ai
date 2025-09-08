import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function AIChatbot() {
  return (
    <>
      <Helmet>
  <title>AI Chatbot for Homework Help | VertexED</title>
  <meta name="description" content="Get instant AI help with assignments and study questions using VertexED's AI chatbot." />
  <link rel="canonical" href="https://www.vertexed.app/chatbot" />
  <meta property="og:title" content="AI Chatbot for Homework Help | VertexED" />
  <meta property="og:description" content="Get instant AI help with assignments and study questions using VertexED's AI chatbot." />
  <meta property="og:url" content="https://www.vertexed.app/chatbot" />
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
