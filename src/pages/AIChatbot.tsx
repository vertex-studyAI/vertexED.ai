import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plus, Trash2, Copy, Send, Settings, Zap, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { fetchChatbotAnswer } from "@/lib/chatbotApi"; // expected to exist in your project

// -----------------------------------------------------------------------------
// Helper utilities
// -----------------------------------------------------------------------------

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

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // ignore
    }
  },
};

// -----------------------------------------------------------------------------
// Main Chat App component (modified: removed accent picker + inner chat box)
// -----------------------------------------------------------------------------

export default function AIChatbotFullRedo() {
  const [chats, setChats] = useState(() => storage.get('chats_list', []));
  const [activeChatId, setActiveChatId] = useState(() => storage.get('active_chat', null));
  const [messages, setMessages] = useState(() => storage.get('messages_' + (storage.get('active_chat') || 'root'), []));
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [widgetsVisible, setWidgetsVisible] = useState(false);
  const [accent, setAccent] = useState('#0ea5e9'); // used for shadow accents

  const panelRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { storage.set('chats_list', chats); }, [chats]);
  useEffect(() => { storage.set('active_chat', activeChatId); }, [activeChatId]);
  useEffect(() => { storage.set('messages_' + (activeChatId || 'root'), messages); }, [messages, activeChatId]);
  useEffect(() => { panelRef.current?.scrollTo({ top: panelRef.current?.scrollHeight || 0, behavior: 'smooth' }); }, [messages, widgetsVisible]);

  function createNewChat(title = 'New Chat') {
    const id = uid('chat');
    const it = { id, title, createdAt: Date.now() };
    setChats(prev => [it, ...prev]);
    setActiveChatId(id);
    setMessages([]);
    setWidgetsVisible(false);
    inputRef.current?.focus();
  }

  function openChat(id) {
    setActiveChatId(id);
    const loaded = storage.get('messages_' + id, []);
    setMessages(loaded);
    setWidgetsVisible(false);
    inputRef.current?.focus();
  }

  function removeChat(id) {
    setChats(prev => prev.filter(c => c.id !== id));
    storage.set('messages_' + id, []);
    if (activeChatId === id) { setActiveChatId(null); setMessages([]); }
  }

  async function sendMessage() {
    const text = userInput.trim();
    if (!text || loading) return;
    const userMsg = { id: uid('m'), sender: 'user', text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setLoading(true);
    setWidgetsVisible(false);

    try {
      await sleep(220);
      const data = await fetchChatbotAnswer(text);
      const answer = data?.answer?.trim() ?? 'Sorry — no response available.';
      const botMsg = { id: uid('m'), sender: 'bot', text: answer, ts: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      setTimeout(() => setWidgetsVisible(true), 360);
    } catch (err) {
      const errText = `Error: ${err instanceof Error ? err.message : String(err)}`;
      setMessages(prev => [...prev, { id: uid('m'), sender: 'bot', text: errText, ts: Date.now() }]);
      setWidgetsVisible(true);
    } finally { setLoading(false); }
  }

  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function clearMessages() { setMessages([]); setWidgetsVisible(false); }
  async function copyText(text) { try { await navigator.clipboard.writeText(text); } catch (e) { console.error(e); } }

  function onKeyDown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

  return (
    <div className="min-h-screen w-full text-white relative" style={{ background: 'radial-gradient(ellipse at 10% 80%, rgba(64,85,102,0.12), transparent 8%), radial-gradient(circle at 92% 20%, rgba(26,35,52,0.12), transparent 8%), linear-gradient(180deg, #08101a 0%, #081018 100%)' }}>

      <BackgroundShimmer accent={accent} />

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/8 to-white/3 flex items-center justify-center text-sm font-semibold">VA</div>
            <div>
              <div className="text-sm text-white/80">Vertex AI</div>
              <div className="text-xs text-white/50">Study Chat</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* top accent picker removed as requested */}
            <button className="neu-btn px-3 py-2" title="Settings">
              <Settings size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">

          {/* LEFT: Chat log drawer */}
          <aside className={`col-span-3 transition-all duration-300 ${drawerOpen ? 'opacity-100 translate-x-0' : '-translate-x-6 opacity-30'}`}>
            <div className="rounded-2xl p-4 bg-white/4 border border-white/6 backdrop-blur-md h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <button onClick={() => setDrawerOpen(s => !s)} className="p-2 rounded-md bg-white/5 hover:bg-white/8">
                    {drawerOpen ? <X size={16} /> : <Menu size={16} />}
                  </button>
                  <h3 className="text-lg font-semibold">Chats</h3>
                </div>
                <div>
                  <button onClick={() => createNewChat('Quick Chat')} className="px-3 py-1 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center space-x-2">
                    <Plus size={14} /> <span className="text-sm">New</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <div className="text-sm text-white/50 mb-4">Select or create a chat — this side panel is your chat log. It's intentionally empty to start.</div>

                <div className="space-y-3">
                  {chats.length === 0 && (
                    /* removed the small boxed card; replaced by plain inline hint as requested */
                    <div className="px-2 text-white/60">No chats yet — create a new chat to get started. Chats will appear here.</div>
                  )}

                  {chats.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-white/3 border border-white/6 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-md bg-white/6 flex items-center justify-center font-semibold text-sm">{c.title.charAt(0)}</div>
                        <div>
                          <button onClick={() => openChat(c.id)} className="font-medium text-left">{c.title}</button>
                          <div className="text-xs text-white/60">{new Date(c.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => removeChat(c.id)} className="p-2 rounded-md hover:bg-white/6"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              <div className="mt-4 text-xs text-white/60 flex items-center justify-between">
                <div>Autosave: on</div>
                <div className="flex items-center space-x-2">
                  <button onClick={clearMessages} className="px-3 py-1 rounded-md bg-white/5">Clear</button>
                </div>
              </div>

            </div>
          </aside>

          {/* MAIN: Big chat area (central) — inner box removed so panel feels single-surface */}
          <main className="col-span-9">
            <div className="rounded-2xl p-6 bg-white/6 border border-white/6 backdrop-blur-md h-[80vh] flex flex-col">

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">AI Chat</h2>
                  <div className="text-sm text-white/60">A focused chat — white text, glassy input. Press Enter to send.</div>
                </div>

                <div className="flex items-center space-x-3 text-sm text-white/60">
                  <div>{messages.length} messages</div>
                  <div className="text-xs">{activeChatId ? 'Chat: ' + activeChatId.slice(-6) : 'No chat open'}</div>
                </div>
              </div>

              {/* <-- REMOVED inner rounded "box" here: make the chat surface one continuous panel --> */}
              <div ref={panelRef} className="flex-1 overflow-auto p-4">

                {/* Empty state centered */}
                <div className="min-h-[40vh] flex flex-col justify-center items-center">
                  {messages.length === 0 ? (
                    <div className="text-center text-white/50 max-w-lg">
                      <div className="mb-3 text-lg font-medium">Start the conversation</div>
                      <div className="text-sm">Ask a question, paste a problem, or press "New" to start a chat. The right-side widgets will appear after each AI response.</div>
                    </div>
                  ) : null}

                </div>

                <div className="space-y-4 mt-2">
                  <AnimatePresence initial={false}>
                    {messages.map((m) => (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.26 }}>
                        <ChatBubble msg={m} accent={accent} onCopy={() => copyText(m.text)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

              </div>

              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Type your question... (Shift+Enter = newline)"
                      className="w-full resize-none min-h-[60px] max-h-40 rounded-xl p-4 bg-white/6 text-white placeholder-white/60 backdrop-blur-md border border-white/8 focus:ring-2 focus:ring-sky-400 outline-none"
                      style={{ caretColor: 'white' }}
                    />

                    <div className="absolute right-3 bottom-3 text-xs text-white/60">Press Enter to send</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => { setUserInput(''); }} className="px-4 py-2 rounded-md bg-white/5">Clear</button>
                    <button onClick={sendMessage} disabled={loading} className="flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md">
                      <Send size={16} />
                      <span className="ml-2">{loading ? 'Sending...' : 'Send'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </main>

        </div>
      </div>

      {/* RIGHT: Floating Widgets column (3x1) that pump in after prompt */}
      <div className="fixed right-8 top-[34%] z-50">
        <AnimatePresence>
          {widgetsVisible && (
            <motion.div initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 200, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }} className="space-y-3">
              <FeatureWidget title="Want a detailed explanation?" subtitle="Expand the selected AI answer into step-by-step detail." icon={<Zap size={16} />} onClick={() => handleWidget('expand')} color={accent} />
              <FeatureWidget title="Test your understanding" subtitle="Generate a 3-question quiz from the last answer." icon={<BookOpen size={16} />} onClick={() => handleWidget('quiz')} color={accent} />
              <FeatureWidget title="Access existing resources" subtitle="Open saved notes, links or flashcards." icon={<Plus size={16} />} onClick={() => handleWidget('resources')} color={accent} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );

  function handleWidget(action) {
    if (action === 'expand') {
      const last = [...messages].reverse().find(m => m.sender === 'bot');
      if (!last) return alert('No AI answer to expand.');
      const expanded = last.text + '

*Expanded explanation:* ' + 'Here is an expanded walkthrough of the above content.';
      setMessages(prev => [...prev, { id: uid('m'), sender: 'bot', text: expanded, ts: Date.now() }]);
    } else if (action === 'quiz') {
      const last = [...messages].reverse().find(m => m.sender === 'bot');
      if (!last) return alert('No answer to quiz from.');
      setMessages(prev => [...prev, { id: uid('m'), sender: 'bot', text: 'Generating a quick 3-question quiz...

1) Q1?
2) Q2?
3) Q3?', ts: Date.now() }]);
    } else if (action === 'resources') {
      alert('Open resources panel — implement your resources viewer here.');
    }
  }
}

// -----------------------------------------------------------------------------
// Subcomponents: ChatBubble, FeatureWidget, BackgroundShimmer
// -----------------------------------------------------------------------------

function ChatBubble({ msg, accent, onCopy }) {
  const isBot = msg.sender === 'bot';
  const container = `max-w-[78%] px-4 py-3 rounded-2xl border select-text text-sm`;
  const botStyle = `bg-gradient-to-b from-[rgba(14,165,233,0.06)] to-[rgba(14,165,233,0.03)] text-white border-[rgba(14,165,233,0.06)]`;
  const userStyle = `bg-white/10 text-white border-white/8`;

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} px-2`}>
      <div className={`${container} ${isBot ? botStyle : userStyle}`} style={{ boxShadow: isBot ? `0 18px 40px -20px ${hexToRgba(accent, 0.28)}` : 'none' }}>
        <div className="flex items-start justify-between">
          <div className="text-xs font-semibold opacity-90">{isBot ? 'AI' : 'You'}</div>
          <div className="flex items-center space-x-2 opacity-70">
            <button onClick={() => onCopy && onCopy()} className="p-1 rounded hover:bg-white/6"><Copy size={14} /></button>
            <div className="text-[10px]">{new Date(msg.ts).toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="mt-2 prose prose-sm text-white/95 max-w-none">
          <ReactMarkdown children={msg.text} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
        </div>
      </div>
    </div>
  );
}

function FeatureWidget({ title, subtitle, icon, onClick, color = '#0ea5e9' }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} className="w-72 p-3 rounded-xl bg-gradient-to-b from-white/4 to-white/3 border border-white/6 backdrop-blur-md shadow-lg text-left">
      <div className="flex items-start">
        <div className="p-2 rounded-md mr-3" style={{ background: hexToRgba(color, 0.12) }}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-medium text-white/95">{title}</div>
          <div className="text-xs text-white/60 mt-1">{subtitle}</div>
        </div>
      </div>
    </motion.button>
  );
}

function BackgroundShimmer({ accent = '#0ea5e9' }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg className="absolute left-[-20%] top-[-10%] opacity-30" width="700" height="700" viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(350 350) rotate(90) scale(350)">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="700" height="700" fill="url(#g1)" />
      </svg>

      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${hexToRgba('#0b1220', 0.6)} 0%, ${hexToRgba('#09101a', 0.5)} 50%, ${hexToRgba('#081018', 0.6)} 100%)`, mixBlendMode: 'overlay', opacity: 0.6 }} />

      <div className="absolute inset-0 animate-shimmer" style={{ background: `linear-gradient(90deg, transparent 0%, ${hexToRgba('#0ea5e9', 0.02)} 50%, transparent 100%)` }} />

      <style>{`@keyframes shimmerMove { 0% { transform: translateX(-30%)} 100% { transform: translateX(30%)} } .animate-shimmer { animation: shimmerMove 12s linear infinite; opacity: 0.6; }`}</style>
    </div>
  );
}
