// src/pages/AIChatbot.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import SEO from "@/components/SEO";
import { fetchChatbotAnswer } from "@/lib/chatbotApi";

const TABS = ["Chat", "Examples", "How it works"];

const EXAMPLES = [
  "Solve ∫x e^x dx step by step",
  "Explain price elasticity of demand with a real-life example",
  "Derive the quadratic formula",
  "Explain Newton’s Second Law intuitively",
];

/* ---------------- SUBJECT AUTO TAGGING ---------------- */
const detectSubject = (text = "") => {
  const t = text.toLowerCase();

  if (
    t.includes("integral") ||
    t.includes("derivative") ||
    t.includes("solve") ||
    t.includes("equation")
  )
    return { label: "Math", color: "bg-indigo-100 text-indigo-700" };

  if (
    t.includes("force") ||
    t.includes("velocity") ||
    t.includes("newton") ||
    t.includes("energy")
  )
    return { label: "Physics", color: "bg-purple-100 text-purple-700" };

  if (
    t.includes("demand") ||
    t.includes("supply") ||
    t.includes("elasticity") ||
    t.includes("market")
  )
    return { label: "Economics", color: "bg-emerald-100 text-emerald-700" };

  return { label: "General", color: "bg-slate-100 text-slate-700" };
};

/* ---------------- ANIMATIONS ---------------- */
const messageAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

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
    if (!userInput.trim() || loading) return;

    const subject = detectSubject(userInput);

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userInput, subject },
    ]);

    setLoading(true);

    try {
      const data = await fetchChatbotAnswer(userInput);
      const botAnswer =
        data?.answer?.trim() ||
        "Sorry — I couldn't generate a response.";

      let i = 0;
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "", subject },
      ]);

      const interval = setInterval(() => {
        setChatMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1].text += botAnswer[i] ?? "";
          return copy;
        });
        i++;
        if (i >= botAnswer.length) clearInterval(interval);
      }, 18);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "An error occurred while fetching the response.",
          subject: detectSubject(""),
        },
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
        description="Academic AI assistant with reasoning, math rendering, subject detection, and animations."
      />

      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">
            ← Back to Main
          </Link>
        </div>

        <NeumorphicCard className="p-6 bg-white/60 backdrop-blur-md hover:shadow-lg transition">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-sky-700 mb-1">
              AI Study Assistant
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              Step-by-step academic reasoning with subject detection and math
              support.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-2 text-sm transition ${
                  activeTab === tab
                    ? "text-sky-700"
                    : "text-slate-500 hover:text-sky-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.span
                    layoutId="tab"
                    className="absolute left-0 -bottom-[1px] w-full h-0.5 bg-sky-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* CHAT */}
          {activeTab === "Chat" && (
            <div className="h-[65vh] flex flex-col">
              <div
                ref={chatPanelRef}
                className="flex-1 p-4 mb-4 overflow-y-auto space-y-4 rounded-lg scrollbar-thin scrollbar-thumb-sky-300"
              >
                <AnimatePresence>
                  {chatMessages.length === 0 && !loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center text-slate-400"
                    >
                      <h3 className="text-lg font-semibold text-sky-600 mb-2">
                        Ask anything you’re studying
                      </h3>
                      <p className="text-sm max-w-md">
                        Math, Physics, Economics — explained step by step.
                      </p>
                    </motion.div>
                  )}

                  {chatMessages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      variants={messageAnim}
                      initial="hidden"
                      animate="visible"
                      className={`flex ${
                        msg.sender === "bot"
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl border backdrop-blur-md shadow-sm
                          ${
                            msg.sender === "bot"
                              ? "bg-sky-50/60 border-sky-200 rounded-tl-sm"
                              : "bg-emerald-50/60 border-emerald-200 rounded-tr-sm"
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold opacity-70">
                            {msg.sender === "bot" ? "AI" : "You"}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${msg.subject?.color}`}
                          >
                            {msg.subject?.label}
                          </span>
                        </div>

                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          className="prose prose-sm prose-sky"
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && (
                  <div className="flex gap-1 pl-2">
                    <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-150" />
                    <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-300" />
                  </div>
                )}
              </div>

              {/* Input */}
              <motion.div
                layout
                className="flex gap-2 p-3 rounded-xl bg-white/70 backdrop-blur-md border shadow-md"
              >
                <input
                  className="flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-300"
                  placeholder="Ask a math, physics, or economics question…"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className={`px-5 py-3 rounded-lg text-white transition ${
                    loading
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-500 to-blue-600 hover:scale-[1.02]"
                  }`}
                >
                  Send
                </button>
              </motion.div>
            </div>
          )}

          {/* EXAMPLES */}
          {activeTab === "Examples" && (
            <div className="space-y-3">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setUserInput(ex);
                    setActiveTab("Chat");
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-sky-50 border transition"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {/* HOW IT WORKS */}
          {activeTab === "How it works" && (
            <div className="text-sm text-slate-500 max-w-3xl leading-relaxed">
              The assistant auto-detects subjects, explains concepts step by step,
              and renders mathematical notation using LaTeX. Designed for
              academic clarity over short answers.
            </div>
          )}
        </NeumorphicCard>
      </PageSection>
    </>
  );
}
