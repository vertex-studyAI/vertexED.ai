import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageSection from "@/components/PageSection";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { enrichMathInText } from "@/lib/mathText";
import SEO from "@/components/SEO";
import { fetchChatbotAnswer } from "@/lib/chatbotApi";
import { animateTypewriter } from "@/lib/typewriter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SubjectBadge = { label: string; color: string };
type ChatMessage = { sender: "user" | "bot"; text: string; subject: SubjectBadge };

const detectSubject = (text = ""): SubjectBadge => {
  const t = text.toLowerCase();

  if (t.includes("integral") || t.includes("derivative") || t.includes("solve"))
    return {
      label: "Math",
      color: "bg-primary/15 text-primary border-primary/25",
    };

  if (t.includes("force") || t.includes("velocity") || t.includes("newton"))
    return {
      label: "Physics",
      color: "bg-accent/15 text-accent border-accent/25",
    };

  if (t.includes("demand") || t.includes("elasticity") || t.includes("market"))
    return {
      label: "Economics",
      color: "bg-primary/10 text-primary border-primary/20",
    };

  return {
    label: "General",
    color: "bg-white/5 text-white/70 border-white/10",
  };
};

export default function AIChatbot() {
  const [activeTab, setActiveTab] = useState("chat");
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatPanelRef = useRef<HTMLDivElement | null>(null);
  const typingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current !== null) {
        window.clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    chatPanelRef.current?.scrollTo({
      top: chatPanelRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages, loading]);

  const handleSend = async () => {
    const question = userInput.trim();
    if (!question || loading) return;

    if (typingIntervalRef.current !== null) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    const subject = detectSubject(question);
    const botIndex = chatMessages.length + 1;

    setChatMessages((prev) => [...prev, { sender: "user", text: question, subject }]);
    setUserInput("");
    setLoading(true);

    try {
      const data = await fetchChatbotAnswer(question);
      const answer =
        typeof data?.answer === "string" && data.answer.trim()
          ? data.answer.trim()
          : "Sorry — I couldn't generate a response.";

      setChatMessages((prev) => [...prev, { sender: "bot", text: "", subject }]);

      await animateTypewriter(
        answer,
        (nextText) => {
          setChatMessages((prev) => {
            if (botIndex >= prev.length) return prev;
            const next = [...prev];
            const current = next[botIndex];
            if (current?.sender !== "bot") return prev;
            next[botIndex] = { ...current, text: nextText };
            return next;
          });
        },
        { intervalMs: 18, intervalRef: typingIntervalRef },
      );
    } catch (error) {
      console.warn("Chatbot send failed", error);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry — the AI service is temporarily unavailable. Please try again in a moment.",
          subject: detectSubject(""),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="AI Study Chatbot | VertexED"
        description="Step-by-step academic reasoning with math support."
      />

      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">
            ← Back to Main
          </Link>
        </div>

        {/* MAIN CONTAINER (match homepage/dashboard glass theme) */}
        <div className="glass-panel p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1 brand-text-gradient inline-block">
              AI Study Assistant
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Ask anything you're working on — math, essays, concepts — and get step-by-step help, not just the answer.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full justify-start gap-2 bg-white/5 border border-white/10 p-1 h-auto">
              <TabsTrigger value="chat" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                Chat
              </TabsTrigger>
              <TabsTrigger value="examples" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                Examples
              </TabsTrigger>
              <TabsTrigger value="how" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                How it works
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-0">
            <div className="h-[65vh] flex flex-col">
              <div
                ref={chatPanelRef}
                className="flex-1 p-4 mb-4 overflow-y-auto space-y-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
                aria-live="polite"
                aria-relevant="additions text"
                aria-label="Chat messages"
              >
                <AnimatePresence>
                  {chatMessages.length === 0 && !loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center"
                    >
                      <h3 className="text-lg font-semibold mb-2 brand-text-gradient inline-block">
                        Ask anything you’re studying
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Math, physics, economics — we'll walk you through it, one step at a time.
                      </p>
                    </motion.div>
                  )}

                  {chatMessages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.sender === "bot"
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl border shadow-md backdrop-blur-xl ${
                          msg.sender === "user"
                            ? "bg-primary/15 border-primary/25"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white/80">
                            {msg.sender === "bot" ? "AI" : "You"}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${msg.subject?.color}`}
                          >
                            {msg.subject?.label}
                          </span>
                        </div>

                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90"
                        >
                          {enrichMathInText(msg.text)}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && (
                  <div className="flex gap-1 pl-2">
                    <span className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary/80 rounded-full animate-bounce delay-150" />
                    <span className="w-2 h-2 bg-primary/80 rounded-full animate-bounce delay-300" />
                  </div>
                )}
              </div>

              {/* INPUT BAR — FIXED TEXT COLOR + GLASS */}
              <motion.div
                layout
                className="flex gap-2 p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
              >
                <div className="flex-1 neu-input">
                  <input
                    className="neu-input-el placeholder:text-muted-foreground"
                    placeholder="Ask a math, physics, or economics question…"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={loading}
                  className={`neu-button rounded-xl px-5 py-3 text-sm font-semibold ${
                    loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  Send
                </button>
              </motion.div>
            </div>
            </TabsContent>

            <TabsContent value="examples" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  subject: "Math",
                  prompt: "Explain how to solve ∫ x·e^x dx step by step.",
                },
                {
                  subject: "Physics",
                  prompt: "A 2 kg block slides down a 30° incline. Find acceleration ignoring friction.",
                },
                {
                  subject: "Economics",
                  prompt: "What happens to equilibrium price when demand increases and supply stays constant?",
                },
                {
                  subject: "General",
                  prompt: "Give me a 3-day revision plan for IB Biology Unit 2.",
                },
              ].map((example) => (
                <button
                  key={example.prompt}
                  type="button"
                  onClick={() => {
                    setActiveTab("chat");
                    setUserInput(example.prompt);
                  }}
                  className="text-left rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                >
                  <span className="text-xs font-semibold text-primary">{example.subject}</span>
                  <p className="mt-2 text-sm text-muted-foreground">{example.prompt}</p>
                </button>
              ))}
            </div>
            </TabsContent>

            <TabsContent value="how" className="mt-0">
            <div className="space-y-4 max-w-2xl">
              <ol className="list-decimal pl-5 space-y-3 text-sm text-muted-foreground">
                <li>Type your question in plain language — a problem, essay prompt, or concept you're stuck on.</li>
                <li>Vertex figures out the subject and walks you through the reasoning, not just the final answer.</li>
                <li>Math renders with LaTeX. Follow up in the same chat if something still doesn't click.</li>
              </ol>
              <p className="text-sm text-muted-foreground">
                Tip: mention your exam board, grade level, or what you've already tried — you'll get more useful answers.
              </p>
            </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageSection>
    </>
  );
}
