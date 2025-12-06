import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FileText, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { fetchChatbotAnswer } from "@/lib/chatbotApi";

// AIChatbot_simple.jsx
// - Single-page focused chatbot
// - White text, translucent typing box
// - Left collapsible chat list (open/close)
// - Main large chat area (center/right)
// - After each user prompt, three small widgets 'pump' in from the right

export default function AIChatbotSimple() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]); // { sender: 'user'|'bot', text, ts }
  const [loading, setLoading] = useState(false);
  const [showChats, setShowChats] = useState(true);
  const [chats, setChats] = useState([
    { id: 1, title: "Math practice" },
    { id: 2, title: "Biology notes" },
    { id: 3, title: "Chemistry quick" },
  ]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showWidgets, setShowWidgets] = useState(false);
  const chatPanelRef = useRef(null);

  // keep panel scrolled to bottom
  useEffect(() => {
    chatPanelRef.current?.scrollTo({ top: chatPanelRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const pushMessage = (m) => setMessages((prev) => [...prev, m]);

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text || loading) return;

    // add user message
    const userMsg = { sender: "user", text, ts: Date.now() };
    pushMessage(userMsg);
    setUserInput("");
    setLoading(true);
    setShowWidgets(false);

    try {
      const data = await fetchChatbotAnswer(text);
      const botText = data?.answer?.trim() ?? "Sorry, I couldn't get a response right now.";

      // simple reveal of bot message (instant)
      pushMessage({ sender: "bot", text: botText, ts: Date.now() });

      // show widgets after bot responds
      setTimeout(() => setShowWidgets(true), 300);
    } catch (err) {
      console.error(err);
      pushMessage({ sender: "bot", text: `Error: ${err instanceof Error ? err.message : String(err)}` , ts: Date.now() });
      setShowWidgets(true);
    } finally {
      setLoading(false);
    }
  };

  // keyboard: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    const id = Date.now();
    setChats((c) => [{ id, title: "New chat" }, ...c]);
    setActiveChatId(id);
    setMessages([]);
  };

  const selectChat = (id) => {
    setActiveChatId(id);
    // In a full app you'd load messages for the chat; here we simply clear
    setMessages([]);
  };

  const deleteChat = (id) => {
    setChats((c) => c.filter((ch) => ch.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
      setMessages([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#09101a] text-white p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Left: Chats drawer (collapsible) */}
        <div className={`col-span-3 transition-all duration-300 ${showChats ? "" : "-ml-64 w-0 opacity-0"}`}>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button aria-label="toggle" onClick={() => setShowChats((s) => !s)} className="p-2 rounded-md bg-white/6 hover:bg-white/8">
                  {showChats ? <X size={18} /> : <Menu size={18} />}
                </button>
                <h3 className="text-lg font-semibold">Chats</h3>
              </div>
              <button onClick={startNewChat} className="flex items-center space-x-2 px-3 py-2 bg-white/6 hover:bg-white/8 rounded-md">
                <Plus size={14} />
                <span className="text-sm">New</span>
              </button>
            </div>

            <div className="overflow-auto max-h-[72vh] space-y-3">
              {chats.map((c) => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/3 border border-white/6`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-md bg-gradient-to-br from-white/6 to-white/3 flex items-center justify-center text-xs font-semibold">{c.title.charAt(0)}</div>
                    <button onClick={() => selectChat(c.id)} className="text-left">
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-white/70">{c.id === activeChatId ? "Active" : "Tap to open"}</div>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => deleteChat(c.id)} className="p-2 rounded-md hover:bg-white/6">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main chat area: big rectangle */}
        <div className="col-span-9">
          <div className="rounded-2xl p-6 h-[80vh] flex flex-col bg-white/4 backdrop-blur-md border border-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold">AI Chat</h1>
                <p className="text-sm text-white/70">A focused chat — white text, translucent input. Use Enter to send.</p>
              </div>

              <div className="flex items-center space-x-3 text-sm text-white/70">
                <div>{messages.length} messages</div>
                <button onClick={() => { setMessages([]); setShowWidgets(false); }} className="px-3 py-2 rounded-md bg-white/6 hover:bg-white/8">Clear</button>
              </div>
            </div>

            {/* Messages panel */}
            <div ref={chatPanelRef} className="flex-1 overflow-y-auto space-y-3 px-1 py-2">
              {messages.length === 0 && (
                <div className="text-center text-white/60 mt-8">Start the conversation — ask a question or paste a problem.</div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "bot" ? "justify-start" : "justify-end"} px-2` }>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.sender === "bot" ? "bg-white/6 text-white" : "bg-white/12 text-white"} backdrop-blur-sm border border-white/6`}>
                    <div className="text-xs opacity-80 mb-1 font-semibold">{m.sender === "bot" ? "AI" : "You"}</div>
                    <div className="prose prose-sm text-white/95 max-w-none">
                      <ReactMarkdown children={m.text} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
                    </div>
                    <div className="text-[11px] text-white/60 mt-2 text-right">{new Date(m.ts).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input area - translucent / transparent */}
            <div className="mt-4">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question... (Shift+Enter for newline)"
                className="w-full min-h-[56px] max-h-40 resize-none rounded-xl p-4 bg-white/6 placeholder-white/50 text-white outline-none border border-white/8 backdrop-blur-sm"
                style={{ caretColor: "white" }}
                disabled={loading}
              />

              <div className="flex items-center justify-end space-x-2 mt-3">
                <button onClick={() => { setUserInput(''); }} className="px-4 py-2 rounded-md bg-white/6 hover:bg-white/8">Clear</button>
                <button onClick={handleSend} disabled={loading} className="px-4 py-2 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right floating widgets - 3 small stacked buttons that pump in after a prompt */}
      <div className="fixed right-6 top-1/3 z-40">
        <AnimatePresence>
          {showWidgets && (
            <motion.div initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 80, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 30 }} className="space-y-3">
              <Widget label="Want a detailed explanation?" onClick={() => alert('Ask the AI to expand on any answer')} />
              <Widget label="Want to test your understanding?" onClick={() => alert('We can generate a short quiz for you')} />
              <Widget label="Access existing resources" onClick={() => alert('Open saved resources or links')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Widget({ label, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} className="w-64 text-left p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/6 shadow-md" onClick={onClick}>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-white/70 mt-1">Tap to quickly use this option</div>
    </motion.button>
  );
}
