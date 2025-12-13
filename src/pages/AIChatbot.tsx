// src/pages/AIChatbot.jsx
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

const TABS = ["Chat", "Examples", "How it works"];

export default function AIChatbot() {
  const [activeTab, setActiveTab] = useState("Chat");
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatPanelRef = useRef(null);

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

      const botAnswer = data?.answer?.trim() || "Sorry — I couldn't generate a response.";
      let i = 0;

      setChatMessages((prev) => [...prev, { sender: "bot", text: "" }]);

      const interval = setInterval(() => {
        setChatMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1].text += botAnswer[i] ?? "";
          return copy;
        });
        i++;
        if (i >= botAnswer.length) clearInterval(interval);
      }, 18);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "An error occurred while fetching the response." },
      ]);
    } finally {
      setLoading(false);
      setUserInput("");
    }
  };

  return (
    <>
      <SEO
        title="AI Study Chatbot | VertexED"
        description="Ask academic questions and receive structured, step-by-step explanations with math rendering support."
      />

      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">
            ← Back to Main
          </Link>
        </div>

        <NeumorphicCard className="p-6 bg-white/60 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-sky-700 mb-1">
              AI Study Assistant
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              A reasoning-focused academic assistant designed to explain concepts,
              solve problems step-by-step, and support LaTeX-based mathematics.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-xl transition
                  ${
                    activeTab === tab
                      ? "bg-sky-500/20 text-sky-700 shadow-inner"
                      : "text-slate-500 hover:text-sky-600"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          {activeTab === "Chat" && (
            <div className="h-[65vh] flex flex-col">
              {/* Messages */}
              <div
                ref={chatPanelRef}
                className="flex-1 p-4 mb-4 overflow-y-auto space-y-3 rounded-lg"
              >
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === "bot" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl border shadow-sm
                        ${
                          msg.sender === "bot"
                            ? "bg-blue-50/70 text-sky-800 border-blue-100"
                            : "bg-green-50/70 text-green-800 border-green-100"
                        }`}
                    >
                      <div className="text-xs font-semibold mb-1">
                        {msg.sender === "bot" ? "AI" : "You"}
                      </div>
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        className="prose prose-sm"
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="text-sm text-sky-600 italic">
                    AI is thinking…
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-300"
                  placeholder="Ask a question…"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === "Examples" && (
            <div className="text-sm text-slate-500 leading-relaxed">
              This section will contain example prompts and high-quality AI
              responses across subjects (Math, Physics, Economics, etc.).
            </div>
          )}

          {activeTab === "How it works" && (
            <div className="text-sm text-slate-500 leading-relaxed max-w-3xl">
              The AI Study Assistant is optimized for academic reasoning rather
              than short answers. It breaks problems into steps, explains
              assumptions, and renders mathematical notation using LaTeX.
              <br /><br />
              Future updates will include citation-aware answers and syllabus-aligned responses.
            </div>
          )}
        </NeumorphicCard>
      </PageSection>
    </>
  );
}
