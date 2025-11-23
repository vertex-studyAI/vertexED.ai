// AIChatbot.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import SEO from "@/components/SEO";
import { fetchChatbotAnswer } from "@/lib/chatbotApi";

export default function AIChatbot() {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatPanelRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatPanelRef.current?.scrollTo({
      top: chatPanelRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages, loading]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setLoading(true);

    try {
      const data = await fetchChatbotAnswer(userInput);

      if (data.error) {
        setChatMessages((prev) => [...prev, { sender: "bot", text: `Error: ${data.error}` }]);
      } else {
        const botAnswer = data.answer?.trim() ?? "";
        let i = 0;
        setChatMessages((prev) => [...prev, { sender: "bot", text: "" }]);

        const interval = setInterval(() => {
          setChatMessages((prev) => {
            const messagesCopy = [...prev];
            const lastIndex = messagesCopy.length - 1;
            const last = messagesCopy[lastIndex];
            if (!last) {
              clearInterval(interval);
              return prev;
            }
            messagesCopy[lastIndex] = {
              ...last,
              text: last.text + (botAnswer[i] ?? ""),
            };
            return messagesCopy;
          });
          i++;
          if (i >= botAnswer.length) clearInterval(interval);
        }, 20);
      }
    } catch (error) {
      console.error(error);
      setChatMessages((prev) => [...prev, { sender: "bot", text: `Error: ${error instanceof Error ? error.message : String(error)}` }]);
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
          description: "Ask questions and get clear, step-by-step explanations with the VertexED AI study chatbot.",
        }}
      />

      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>

        <NeumorphicCard className="p-6 h-[70vh] flex flex-col bg-white/60 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-1 text-sky-700">AI Study Chatbot</h2>
            <p className="text-slate-500 text-sm">Ask questions and get step-by-step answers. Supports LaTeX.</p>
          </div>

          {/* Messages area */}
          <div
            ref={chatPanelRef}
            className="flex-1 p-4 mb-4 overflow-y-auto space-y-3 rounded-lg"
          >
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm border
                    ${msg.sender === "bot"
                      ? "bg-gradient-to-b from-blue-50 to-white/60 text-sky-800 border-blue-100"
                      : "bg-gradient-to-b from-green-50 to-white/60 text-green-800 border-green-100"
                    }`}
                >
                  <div className="text-xs font-semibold mb-1 opacity-90">
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
                <div className="max-w-[75%] px-4 py-2 rounded-2xl shadow-sm bg-gradient-to-b from-blue-50 to-white/60 text-sky-800 flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce delay-200" />
                  <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce delay-400" />
                  <span className="text-xs font-semibold ml-2">AI is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="flex mt-auto space-x-2">
            <input
              aria-label="Type your question"
              className="flex-grow px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sky-300 focus:outline-none placeholder:text-sky-300 text-sky-600 placeholder:italic"
              placeholder="Ask me anything..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button
              aria-label="Send message"
              className="px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
