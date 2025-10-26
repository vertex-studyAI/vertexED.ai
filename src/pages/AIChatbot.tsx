// AIChatbot.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css'; // <-- Required for KaTeX styling
import SEO from "@/components/SEO";
import "./chat.css"; // <-- new: drop the CSS file next to this component

export default function AIChatbot() {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    setChatMessages(prev => [...prev, { sender: "user", text: userInput }]);
    setLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userInput }),
      });

      const data = await response.json();

      if (data.error) {
        setChatMessages(prev => [...prev, { sender: "bot", text: `Error: ${data.error}` }]);
      } else {
        // Wrap LaTeX output properly in $$ for block or $ for inline if needed
        const botAnswer = data.answer;
        setChatMessages(prev => [...prev, { sender: "bot", text: botAnswer }]);
      }
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { sender: "bot", text: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
      setUserInput("");
    }
  };

  return (
    <>
      <SEO
        title="AI Study Chatbot for Students | VertexED"
        description="Ask questions and get clear, step-by-step explanations with the VertexED AI study chatbot. Supports math, science, and more with LaTeX rendering."
        canonical="https://www.vertexed.app/chatbot"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "AI Study Chatbot",
          url: "https://www.vertexed.app/chatbot",
          description: "Ask questions and get clear, step-by-step explanations with the VertexED AI study chatbot."
        }}
      />
      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>

        <NeumorphicCard className="p-8 h-[70vh] flex flex-col chat-wrapper">
          {/* Header (optional) */}
          <div className="chat-header mb-4">
            <h2 className="chat-title">AI Study Chatbot</h2>
            <p className="chat-sub">Ask questions and get step-by-step answers. Supports LaTeX.</p>
          </div>

          {/* Messages area */}
          <div className="flex-1 neu-surface inset p-6 rounded-2xl mb-4 overflow-y-auto chat-panel" id="chat-panel">
            <div className="messages">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`bubble-row ${msg.sender === "bot" ? "bubble-ai-row" : "bubble-user-row"}`}
                >
                  <div className={`bubble ${msg.sender === "bot" ? "bubble-ai" : "bubble-user"}`}>
                    <div className="bubble-meta">
                      <strong className="meta-label">{msg.sender === "bot" ? "AI" : "You"}</strong>
                    </div>
                    <div className="bubble-content">
                      <ReactMarkdown
                        children={msg.text}
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="bubble-row bubble-ai-row">
                  <div className="bubble bubble-ai typing">
                    <div className="bubble-meta"><strong className="meta-label">AI</strong></div>
                    <div className="bubble-content">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-text">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input area stays fixed at the bottom */}
          <div className="neu-input flex mt-auto chat-input-area">
            <input
              className="neu-input-el flex-grow chat-input"
              placeholder="Ask me anything..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
            />
            <button className="neu-button px-4 ml-2 chat-send" onClick={handleSend} disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </NeumorphicCard>
      </PageSection>
    </>
  );
}
