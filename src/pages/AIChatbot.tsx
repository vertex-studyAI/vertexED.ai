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
import { Copy, Settings, Send, RotateCcw } from "lucide-react";

// Improved AI Chatbot UI (neumorphism, hover effects, settings modal)
// Default export a single React component so it can be dropped into your routes.

export default function AIChatbot() {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [accentColor, setAccentColor] = useState("#0ea5e9"); // sky-500
  const [textEffect, setTextEffect] = useState("typewriter"); // typewriter | fade | instant
  const [bubbleStyle, setBubbleStyle] = useState("neumorphic"); // neumorphic | glass | gradient

  const chatPanelRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatPanelRef.current?.scrollTo({
      top: chatPanelRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages, loading]);

  // helper: add message
  const pushMessage = (msg) => setChatMessages((prev) => [...prev, msg]);

  // handle send with different text effect handling
  const handleSend = async () => {
    if (!userInput.trim() || loading) return;

    pushMessage({ sender: "user", text: userInput, ts: Date.now() });
    setLoading(true);

    try {
      const data = await fetchChatbotAnswer(userInput);

      if (data.error) {
        pushMessage({ sender: "bot", text: `Error: ${data.error}`, ts: Date.now() });
      } else {
        const botAnswer = (data.answer ?? "").trim();

        // insert placeholder bot message that will be filled based on effect
        if (textEffect === "typewriter") {
          pushMessage({ sender: "bot", text: "", full: botAnswer, ts: Date.now(), effect: "typewriter" });

          // incremental reveal handled with interval
          let i = 0;
          const interval = setInterval(() => {
            setChatMessages((prev) => {
              const copy = [...prev];
              const lastIndex = copy.map((m) => m.sender).lastIndexOf("bot");
              if (lastIndex === -1) return prev;
              const last = copy[lastIndex];
              copy[lastIndex] = { ...last, text: (last.text ?? "") + (botAnswer[i] ?? "") };
              return copy;
            });
            i++;
            if (i >= botAnswer.length) clearInterval(interval);
          }, 18);
        } else if (textEffect === "fade") {
          // show empty then fade-in using framer-motion
          pushMessage({ sender: "bot", text: botAnswer, ts: Date.now(), effect: "fade" });
        } else {
          pushMessage({ sender: "bot", text: botAnswer, ts: Date.now(), effect: "instant" });
        }
      }
    } catch (err) {
      console.error(err);
      pushMessage({ sender: "bot", text: `Error: ${err instanceof Error ? err.message : String(err)}`, ts: Date.now() });
    } finally {
      setLoading(false);
      setUserInput("");
    }
  };

  // small helper to copy text
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // small inline success feedback could be added
    } catch (e) {
      console.error("copy failed", e);
    }
  };

  // message bubble component
  const MessageBubble = ({ msg, idx }) => {
    const isBot = msg.sender === "bot";

    const baseStyles = `max-w-[75%] px-4 py-3 rounded-2xl border select-text text-sm`;

    const neumorphic = `bg-white/60 border-white/20 shadow-[8px_8px_20px_rgba(2,6,23,0.6),-5px_-5px_16px_rgba(255,255,255,0.02)]`;
    const glass = `backdrop-blur-md bg-white/6 border border-white/10`;
    const gradient = `bg-gradient-to-b from-[rgba(14,165,233,0.12)] to-[rgba(99,102,241,0.06)] border-transparent`;

    const styleClass = bubbleStyle === "neumorphic" ? neumorphic : bubbleStyle === "glass" ? glass : gradient;

    const botAccent = {
      boxShadow: `0 12px 30px -10px ${hexToRgba(accentColor, 0.35)}`,
      borderColor: hexToRgba(accentColor, 0.18),
    };

    const userAccent = {
      boxShadow: `0 10px 22px -12px ${hexToRgba("#16a34a", 0.28)}`,
    };

    // render markdown content with math support
    const content = (
      <ReactMarkdown
        children={msg.text}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        className="prose prose-sm dark:prose-invert max-w-none"
      />
    );

    // determine animation variant based on message effect
    const variants = {
      initial: { opacity: 0, y: 6 },
      enter: { opacity: 1, y: 0, transition: { duration: 0.35 } },
      hover: { scale: 1.01 },
    };

    return (
      <motion.div
        key={idx}
        initial="initial"
        animate="enter"
        whileHover="hover"
        variants={variants}
        className={`flex ${isBot ? "justify-start" : "justify-end"} group`}
      >
        <div
          className={`${baseStyles} ${isBot ? "text-sky-800" : "text-green-800"} ${isBot ? "rounded-bl-[4px]" : "rounded-br-[4px]"} relative`}
          style={isBot ? { ...botAccent } : { ...userAccent }}
        >
          <div className="text-xs font-semibold mb-1 opacity-95 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isBot && (
                <div style={{ width: 28, height: 28 }} className="rounded-full flex items-center justify-center bg-white/70 border border-white/10 shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke={accentColor} strokeWidth="1.5" />
                    <path d="M8 13l2 2 6-6" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              <span>{isBot ? "AI" : "You"}</span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center space-x-2">
              <button aria-label="copy" onClick={() => copyToClipboard(msg.text)} className="p-1 rounded hover:bg-white/10">
                <Copy size={14} />
              </button>
              <span className="text-[10px] opacity-80">{new Date(msg.ts).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* content area with different effect handling */}
          <div className={`min-h-[26px] ${isBot ? "leading-6" : "leading-6"}`}> 
            {msg.effect === "fade" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
                {content}
              </motion.div>
            ) : (
              // typewriter and instant both just render the text (typewriter is handled by incremental state updates)
              content
            )}
          </div>

          {/* subtle hover actions */}
          <div className="absolute -right-8 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 rounded-full hover:bg-white/6">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <SEO
        title="AI Study Chatbot — VertexED"
        description="A clean, neumorphic AI study chatbot with LaTeX support and interactive UI settings."
        canonical="https://www.vertexed.app/chatbot"
      />

      <PageSection>
        <div className="mb-6 flex items-center justify-between">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(true)}
              aria-label="Open settings"
              className="neu-button px-3 py-2 flex items-center space-x-2"
            >
              <Settings size={14} />
              <span className="text-sm">UI</span>
            </button>

            <div className="text-xs text-slate-400">Accent</div>
            <input
              aria-label="accent color"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-8 h-8 p-0 border-0 bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Chat card */}
          <div className="col-span-5">
            <NeumorphicCard className="p-6 h-[76vh] flex flex-col bg-gradient-to-b from-white/6 to-white/3 backdrop-blur-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-1 text-sky-200">AI Study Chatbot</h2>
                  <p className="text-slate-400 text-sm">Ask concise questions — supports LaTeX & diagrams.</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button title="Reset chat" onClick={() => setChatMessages([])} className="neu-button px-3 py-2">
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              {/* messages */}
              <div ref={chatPanelRef} className="flex-1 p-4 mb-4 overflow-y-auto space-y-3 rounded-lg">
                <AnimatePresence initial={false} mode="popLayout">
                  {chatMessages.map((msg, idx) => (
                    <MessageBubble key={idx} msg={msg} idx={idx} />
                  ))}
                </AnimatePresence>

                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] px-4 py-2 rounded-2xl shadow-sm bg-gradient-to-b from-white/20 to-white/6 text-sky-100 flex items-center space-x-3">
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-200" />
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-400" />
                      <span className="text-xs font-semibold ml-2">AI is typing...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* input area */}
              <div className="flex mt-auto items-end space-x-2">
                <textarea
                  aria-label="Type your question"
                  className="flex-grow px-4 py-3 rounded-lg border border-white/6 focus:ring-2 focus:ring-opacity-60 focus:outline-none placeholder:text-sky-300 text-sky-200 placeholder:italic resize-none h-14"
                  placeholder="Ask me anything..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                  disabled={loading}
                />

                <motion.button
                  aria-label="Send message"
                  className="px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  onClick={handleSend}
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send size={16} />
                  <span className="text-sm">{loading ? "Sending..." : "Send"}</span>
                </motion.button>
              </div>
            </NeumorphicCard>
          </div>

          {/* Right preview / panel to show paper / preview like existing design */}
          <div className="col-span-7">
            <NeumorphicCard className="p-6 h-[76vh] flex flex-col bg-gradient-to-b from-white/4 to-white/2 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-200">Paper Preview</h3>
                <div className="text-sm text-slate-400">Export to PDF or Word after generation</div>
              </div>

              <div className="flex-1 rounded-lg p-6 bg-gradient-to-b from-white/3 to-white/6 border border-white/6 shadow-inner">
                <div className="text-slate-300">Your custom practice paper preview will appear here. While chatting you can ask the AI to convert the conversation into a structured practice paper and export it.</div>

                {/* small floating example of AI highlighted answer */}
                <div className="mt-6">
                  <div className="inline-block p-4 rounded-2xl" style={{ background: `linear-gradient(180deg, ${hexToRgba(accentColor, 0.12)} 0%, ${hexToRgba(accentColor, 0.06)} 100%)`, boxShadow: `0 14px 40px -20px ${hexToRgba(accentColor, 0.35)}` }}>
                    <div className="text-xs font-semibold text-sky-700 mb-1">AI Answer</div>
                    <div className="text-sm text-slate-200">The AI will highlight important parts of an answer — this preview matches your chosen accent color and neumorphic design.</div>
                  </div>
                </div>
              </div>

            </NeumorphicCard>
          </div>
        </div>
      </PageSection>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)} />

            <motion.div className="relative z-10 w-full max-w-xl" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }}>
              <NeumorphicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">UI Settings</h4>
                  <button onClick={() => setShowSettings(false)} className="neu-button px-2 py-1">Close</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Text Effect</label>
                    <div className="flex items-center space-x-2">
                      {[
                        { key: "typewriter", label: "Typewriter" },
                        { key: "fade", label: "Fade" },
                        { key: "instant", label: "Instant" },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setTextEffect(opt.key)}
                          className={`px-3 py-2 rounded-lg ${textEffect === opt.key ? "ring-2 ring-offset-1" : ""} neu-button`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Bubble Style</label>
                    <div className="flex items-center space-x-2">
                      {[
                        { key: "neumorphic", label: "Neumorphic" },
                        { key: "glass", label: "Glass" },
                        { key: "gradient", label: "Gradient" },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setBubbleStyle(opt.key)}
                          className={`px-3 py-2 rounded-lg ${bubbleStyle === opt.key ? "ring-2 ring-offset-1" : ""} neu-button`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Accent Color</label>
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-14 h-10 p-0 border-0" />
                  </div>
                </div>

              </NeumorphicCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// tiny util to convert hex to rgba with opacity
function hexToRgba(hex, alpha = 1) {
  try {
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch (e) {
    return `rgba(14,165,233,${alpha})`;
  }
}
