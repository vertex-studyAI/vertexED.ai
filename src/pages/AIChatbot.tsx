// AIChatbot.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';
import SEO from "@/components/SEO";

export default function AIChatbot() {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatPanelRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatPanelRef.current?.scrollTo({
      top: chatPanelRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [chatMessages, loading]);

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
        // Dynamic "typing effect" for bot answer
        const botAnswer = data.answer;
        let i = 0;
        setChatMessages(prev => [...prev, { sender: "bot", text: "" }]); // placeholder

        const interval = setInterval(() => {
          setChatMessages(prev => {
            const messagesCopy = [...prev];
            const last = messagesCopy[messagesCopy.length - 1];
            last.text += botAnswer[i];
            return messagesCopy;
          });
          i++;
          if (i >= botAnswer.length) clearInterval(interval);
        }, 20); // 20ms per character
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

        <NeumorphicCard className="p-6 h-[70vh] flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1">AI Study Chatbot</h2>
            <p className="text-gray-500 text-sm">Ask questions and get step-by-step answers. Supports LaTeX.</p>
          </div>

          {/* Messages area */}
          <div
            ref={chatPanelRef}
            className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl mb-4 overflow-y-auto space-y-3"
          >
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
              >
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md
                  ${msg.sender === "bot" ? "bg-blue-100 text-blue-900" : "bg-green-100 text-green-900"}`}
                >
                  <div className="text-xs font-semibold mb-1">
                    {msg.sender === "bot" ? "AI" : "You"}
                  </div>
                  <ReactMarkdown
                    children={msg.text}
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    className="prose prose-sm dark:prose-invert"
                  />
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] px-4 py-2 rounded-2xl shadow-md bg-blue-100 text-blue-900 flex items-center space-x-2 animate-pulse">
                  <span className="dot w-2 h-2 rounded-full bg-blue-700 animate-bounce" />
                  <span className="dot w-2 h-2 rounded-full bg-blue-700 animate-bounce delay-200" />
                  <span className="dot w-2 h-2 rounded-full bg-blue-700 animate-bounce delay-400" />
                  <span className="text-xs font-semibold ml-2">AI is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="flex mt-auto space-x-2">
            <input
              className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Ask me anything..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </NeumorphicCard>
      </PageSection>
    </>
  );
}
