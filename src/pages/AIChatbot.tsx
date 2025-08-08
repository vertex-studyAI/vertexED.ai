import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function AIChatbot() {
  return (
    <>
      <Helmet>
        <title>Vertex — AI Chatbot</title>
        <meta name="description" content="Chat with an AI helper to understand topics and plan studies." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/chatbot'} />
      </Helmet>
      <NeumorphicCard className="p-6 h-[60vh] flex flex-col">
        <div className="flex-1 neu-surface inset p-4 rounded-2xl mb-4">Assistant messages will appear here…</div>
        <div className="neu-input"><input className="neu-input-el" placeholder="Type a message…" /></div>
      </NeumorphicCard>
    </>
  );
}
