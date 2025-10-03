import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  FileText,
  Chat,
  Zap,
  Bookmark,
  Play,
  CheckCircle,
  Loader2,
  File,
  Speaker,
  Activity,
  Calculator,
} from "lucide-react";

/**
 * FeaturesInteractive.tsx
 *
 * A long, immersive single-file React page that transforms the original
 * static features grid into an experience-driven, scroll-led tour.
 *
 * Guidelines followed:
 * - Tailwind-based UI (no external CSS files required)
 * - Framer Motion animations for scroll/hover micro-interactions
 * - Single-file export default React component for easy preview
 * - Several interactive mock widgets: calendar + flashcards, smart notes,
 *   audio transcription stub, answer reviewer, paper-maker, chatbot preview,
 *   study zone with activity log + calculator placeholder.
 *
 * NOTE: This component is a demo/experience. Integrations (AI calls, real
 * databases, Desmos embed APIs, past-paper scraping) are represented with
 * interactive mocks and clear placeholders so you can wire them to your APIs.
 */

type Feature = {
  title: string;
  icon: string;
  desc: string;
};

const FEATURES: Feature[] = [
  {
    title: "AI Calendar",
    icon: "/calendar.png",
    desc: "Plan smarter with an AI-powered calendar that adapts to your study needs.",
  },
  {
    title: "Smart Notes",
    icon: "/notes.png",
    desc: "Generate concise notes instantly from your study materials.",
  },
  {
    title: "Adaptive Quizzes",
    icon: "/quiz.png",
    desc: "Test yourself with AI-tailored quizzes that focus on your weak spots.",
  },
  {
    title: "Flashcards",
    icon: "/flashcards.png",
    desc: "Retain information longer with intelligent, spaced-repetition flashcards.",
  },
  {
    title: "Study Hub",
    icon: "/hub.png",
    desc: "All your study resources in one place with seamless organization.",
  },
  {
    title: "Answer Reviewer",
    icon: "/review.png",
    desc: "Get instant feedback and corrections on practice answers.",
  },
];

// ------------------------- Helper: tiny utils ---------------------------
function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function formatMinutes(m: number) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm}m`;
  return `${h}h ${mm}m`;
}

// ------------------------- Mini: faux calendar + scheduler -----------------
function useMockSchedule() {
  // A small mock schedule demonstrating optimization suggestions
  const [events, setEvents] = useState(
    () =>
      [
        { id: 1, title: "Math: Past Paper", day: "Mon", duration: 90 },
        { id: 2, title: "Biology: Notes Review", day: "Tue", duration: 45 },
        { id: 3, title: "Physics: Flashcards", day: "Wed", duration: 30 },
        { id: 4, title: "Chemistry: Mock Test", day: "Thu", duration: 120 },
      ] as Array<{ id: number; title: string; day: string; duration: number }>
  );

  function addSuggested() {
    const id = Math.round(Math.random() * 10000);
    setEvents((s) => [
      ...s,
      { id, title: "Suggested: Active Recall", day: "Fri", duration: 25 },
    ]);
  }

  function optimizeAll() {
    // A mock "optimizer" that balances durations
    setEvents((s) => s.map((e) => ({ ...e, duration: clamp(Math.round(e.duration * 0.85), 20, 120) })));
  }

  return { events, addSuggested, optimizeAll, setEvents };
}

// ------------------------- Flashcard mini widget ------------------------
function FlashcardDeck({ onClose }: { onClose?: () => void }) {
  const cards = useMemo(
    () => [
      { q: "When to use spaced repetition?", a: "For durable memory — schedule increasing intervals." },
      { q: "Best time for recall?", a: "Right before you would forget — usually 1-2 days after learning." },
      { q: "Active recall vs passive?", a: "Active recall (self-test) is far more effective than re-reading." },
    ],
    []
  );
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [i]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold">Calendar Flashcards</h4>
        <div className="flex gap-2">
          <button onClick={() => setI((x) => Math.max(0, x - 1))} className="text-xs p-1">
            Prev
          </button>
          <button onClick={() => setI((x) => Math.min(cards.length - 1, x + 1))} className="text-xs p-1">
            Next
          </button>
          <button onClick={onClose} className="text-xs p-1 opacity-70">
            Close
          </button>
        </div>
      </div>

      <motion.div
        key={i}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="relative bg-white/90 p-6 rounded-xl shadow-md border border-slate-200"
      >
        <div
          className={`cursor-pointer select-none transition-transform duration-500 transform-gpu ${
            flipped ? "rotate-y-180" : ""
          }`}
          onClick={() => setFlipped((f) => !f)}
        >
          <div className="min-h-[120px] flex items-center justify-center">
            {!flipped ? (
              <div className="text-left">
                <div className="text-base font-semibold mb-2">{cards[i].q}</div>
                <div className="text-xs text-slate-600">Tap to flip for answer</div>
              </div>
            ) : (
              <div className="text-left">
                <div className="text-base font-semibold mb-2">{cards[i].a}</div>
                <div className="text-xs text-slate-500">Try to recall before flipping ✨</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ------------------------- Smart Notes widget ---------------------------
function SmartNotesCard() {
  const [notes, setNotes] = useState(`Type or paste your lecture notes here.\n- Use headings to separate concepts.\n- Add timestamps for audio summaries.`);
  const [summary, setSummary] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "docx">("pdf");
  const [generating, setGenerating] = useState(false);

  function generateSummary() {
    setGenerating(true);
    // Mock "AI" summary: produce the first sentence + a helpful tip.
    setTimeout(() => {
      const first = notes.split(". ")[0] || notes.slice(0, 80);
      setSummary(`${first}.\n\nTip: Convert key lines into flashcards for active recall.`);
      setGenerating(false);
    }, 900);
  }

  function exportDocument() {
    // Mock export: we don't create a real file here, but in a real app you'd call
    // a serverless function to render PDF/DOCX and return a blob.
    alert(`Exporting as ${exportFormat.toUpperCase()} — wire this to a backend to produce a real file.`);
  }

  return (
    <div className="group relative rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/60 overflow-hidden p-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-slate-100 shadow-sm">
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Smart Notes</h3>
            <div className="text-xs text-slate-500">Adaptive — supports audio transcription</div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-3 w-full min-h-[160px] p-3 rounded-md border border-slate-200 bg-white text-sm"
          />

          <div className="mt-3 flex items-center gap-3 justify-between">
            <div className="flex gap-2 items-center">
              <button onClick={generateSummary} className="px-3 py-1 rounded-md border">
                {generating ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Summarizing</span>
                ) : (
                  "Generate Summary"
                )}
              </button>

              <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as any)} className="px-2 py-1 border rounded">
                <option value="pdf">PDF</option>
                <option value="docx">Word (.docx)</option>
              </select>

              <button onClick={exportDocument} className="px-3 py-1 rounded-md bg-slate-900 text-white">
                Export
              </button>
            </div>

            <div className="text-xs text-slate-500">Supports: markdown, timestamps, audio -> transcript</div>
          </div>

          {summary && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-slate-50 p-3 rounded">
              <div className="text-sm font-semibold">AI Summary</div>
              <div className="text-sm mt-2 whitespace-pre-wrap">{summary}</div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------- Audio Recorder (mock-friendly) -----------------
function AudioRecorder({ onTranscribe }: { onTranscribe?: (t: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true } as any);
      setPermission("granted");
      const media = new MediaRecorder(stream);
      mediaRef.current = media;
      chunksRef.current = [];
      media.ondataavailable = (e) => chunksRef.current.push(e.data);
      media.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // In a real app you'd send blob to an ASR/transcription service.
        const fakeTranscript = "(Mock) This audio was transcribed: key points on spaced repetition and active recall.";
        onTranscribe?.(fakeTranscript);
      };
      media.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      setPermission("denied");
    }
  }

  function stop() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    setRecording(false);
  }

  return (
    <div className="rounded-xl p-4 bg-white/80 border border-slate-200">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-slate-100">
          <Speaker className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Audio Recorder (Demo)</div>
            <div className="text-xs text-slate-500">Press to record, auto-transcribes</div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {!recording ? (
              <button onClick={start} className="px-3 py-1 rounded bg-green-600 text-white text-sm">Start</button>
            ) : (
              <button onClick={stop} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Stop</button>
            )}
            <div className="text-xs text-slate-500">Permission: {permission}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------- Answer Reviewer mock --------------------------
function AnswerReviewerCard() {
  const [answer, setAnswer] = useState(`Write your long-form answer here.\nMake it as detailed as you like.`);
  const [report, setReport] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);

  function grade() {
    setGrading(true);
    setReport(null);
    setTimeout(() => {
      // Mock evaluation: find strengths/weaknesses heuristically
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      if (answer.length > 300) strengths.push("Depth & detail present");
      else weaknesses.push("Expand examples & evidence");
      if (answer.includes("because") || answer.includes("therefore")) strengths.push("Shows causal reasoning");
      if (answer.match(/\bthe\b/g)?.length ?? 0 > 30) weaknesses.push("Watch repetition of filler words");

      const final = `Score: ${Math.round(60 + Math.min(answer.length / 10, 40))}/100\n\nStrengths:\n- ${strengths.join("\n- ") || "Clear topic focus"}\n\nAreas to improve:\n- ${weaknesses.join("\n- ") || "Use more exam-specific command terms & evidence"}\n\nRevision suggestion:\n- Start with a 2-sentence thesis. Use 2 specific examples. Finish with a linking sentence to the question.`;
      setReport(final);
      setGrading(false);
    }, 900 + Math.random() * 700);
  }

  return (
    <div className="group relative rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/60 overflow-hidden p-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-slate-100 shadow-sm">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Answer Reviewer</h3>
            <div className="text-xs text-slate-500">IB / IGCSE-aware rubrics & exam phrasing</div>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="mt-3 w-full min-h-[160px] p-3 rounded-md border border-slate-200 bg-white text-sm"
          />

          <div className="mt-3 flex items-center gap-3 justify-between">
            <div className="flex gap-2 items-center">
              <button onClick={grade} className="px-3 py-1 rounded-md border">
                {grading ? "Analyzing..." : "Review Answer"}
              </button>
              <button
                onClick={() => setAnswer((a) => a + "\n\n(added concrete example to illustrate)")}
                className="px-3 py-1 rounded-md"
              >
                Add Example
              </button>
            </div>
            <div className="text-xs text-slate-500">Reviewer uses curriculum-aware heuristics</div>
          </div>

          {report && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-slate-50 p-3 rounded">
              <div className="text-sm font-semibold">Review Report</div>
              <pre className="text-xs mt-2 whitespace-pre-wrap">{report}</pre>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------- Paper Maker mock -------------------------------
function PaperMakerCard() {
  const [curriculum, setCurriculum] = useState("IB");
  const [subject, setSubject] = useState("Mathematics");
  const [numMarks, setNumMarks] = useState(80);
  const [generating, setGenerating] = useState(false);
  const [paperPreview, setPaperPreview] = useState<string | null>(null);

  function generatePaper() {
    setGenerating(true);
    setPaperPreview(null);
    setTimeout(() => {
      setPaperPreview(`Generated ${curriculum} mock paper — ${subject} — ${numMarks} marks\n\n1. Define key term X. (4 marks)\n2. Answer the extended response on topic Y. (20 marks)\n3. Short structured questions across syllabus.\n\n(Questions adapted from aggregated past paper styles; wire to your database of past papers to produce exam-accurate distributions.)`);
      setGenerating(false);
    }, 1200 + Math.random() * 800);
  }

  return (
    <div className="group relative rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/60 overflow-hidden p-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-slate-100 shadow-sm">
          <File className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Paper Maker</h3>
            <div className="text-xs text-slate-500">Produce mock exams tailored to curricula & learner level</div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <select value={curriculum} onChange={(e) => setCurriculum(e.target.value)} className="p-2 border rounded">
              <option>IB</option>
              <option>IGCSE</option>
              <option>GCSE</option>
              <option>AP</option>
            </select>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="p-2 border rounded">
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
              <option>Economics</option>
            </select>
            <div className="col-span-2 flex items-center gap-2">
              <input type="range" min={20} max={200} value={numMarks} onChange={(e) => setNumMarks(Number(e.target.value))} />
              <div className="text-xs text-slate-600">{numMarks} marks</div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button onClick={generatePaper} className="px-3 py-1 rounded-md bg-slate-900 text-white">
              {generating ? "Generating…" : "Generate Mock Paper"}
            </button>
            <div className="text-xs text-slate-500">Uses question-distribution templates from past papers</div>
          </div>

          {paperPreview && (
            <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-slate-50 rounded text-xs whitespace-pre-wrap">
              {paperPreview}
            </motion.pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------- Chatbot playground (mock) ---------------------
function ChatbotPlayground() {
  const [messages, setMessages] = useState<{ id: number; role: "user" | "bot"; text: string }[]>([
    { id: 1, role: "bot", text: "Hi — I'm your Math tutor. Ask me to explain a concept or generate worked examples." },
  ]);
  const [input, setInput] = useState("");

  function send() {
    if (!input.trim()) return;
    const id = Math.round(Math.random() * 10000);
    setMessages((m) => [...m, { id, role: "user", text: input }]);
    setInput("");

    // Mock bot reply
    setTimeout(() => {
      const reply = {
        id: id + 1,
        role: "bot",
        text: `Nice question. Here's a compact explanation for: "${input}" — Focus on intuition: break the problem into 3 conceptual steps. Use diagram-based reasoning and check limiting cases. (This is a demo reply; wire to your LLM for full conversational intelligence.)`,
      };
      setMessages((m) => [...m, reply]);
    }, 600 + Math.random() * 700);
  }

  return (
    <div className="group relative rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/60 overflow-hidden p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded bg-slate-100">
          <Chat className="w-5 h-5" />
        </div>
        <div className="text-sm font-semibold">Academic Chatbot</div>
        <div className="text-xs ml-auto text-slate-500">Helps build intuition, not rote answers</div>
      </div>

      <div className="max-h-[220px] overflow-auto p-2 border rounded bg-white/70">
        {messages.map((m) => (
          <div key={m.id} className={`mb-2 ${m.role === "bot" ? "text-left" : "text-right"}`}>
            <div className={`inline-block p-2 rounded ${m.role === "bot" ? "bg-slate-100" : "bg-sky-600 text-white"}`}>{m.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Ask about a concept, exam technique, or worked example" />
        <button onClick={send} className="px-3 py-1 rounded bg-slate-900 text-white">Send</button>
      </div>
    </div>
  );
}

// ------------------------- Study Zone: activity log + small tools ------------
function StudyZone() {
  const [activity, setActivity] = useState<string[]>([
    "Logged 45min study — Physics past paper",
    "Generated summary — Smart Notes",
    "Completed quiz — Adaptive Quizzes (84%)",
  ]);

  function pushActivity(a: string) {
    setActivity((s) => [a, ...s].slice(0, 20));
  }

  return (
    <div className="group relative rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/60 overflow-hidden p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-slate-100">
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-sm font-semibold">Study Zone</div>
        </div>
        <div className="text-xs text-slate-500">Activity log & quick tools</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="col-span-1 md:col-span-2">
          <div className="text-xs text-slate-500 mb-2">Activity Log</div>
          <div className="max-h-[160px] overflow-auto p-2 border rounded bg-white/80">
            {activity.map((a, i) => (
              <div key={i} className="text-sm py-1 border-b last:border-b-0">{a}</div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={() => pushActivity("Ran a quick calculator session — 15m")} className="px-2 py-1 rounded border text-sm">Log Quick</button>
            <button onClick={() => pushActivity("Generated flashcards from notes") } className="px-2 py-1 rounded border text-sm">Log Flashcards</button>
          </div>
        </div>

        <div className="col-span-1">
          <div className="text-xs text-slate-500 mb-2">Quick Calculator</div>
          <div className="p-3 border rounded bg-white/80">
            <Calculator className="w-5 h-5 mb-2" />
            <div className="text-sm text-slate-600">A tiny built-in calculator (demo)</div>
            <SmallCalculator onUse={(r) => pushActivity(`Calculator used → ${r}`)} />
          </div>
        </div>
      </div>

      <div className="mt-4 bg-slate-50 p-3 rounded">
        <div className="text-xs text-slate-600">Desmos & Graphing</div>
        <div className="mt-2 border rounded bg-white p-4 min-h-[120px] flex items-center justify-center text-slate-500">Desmos embed placeholder — wire iframe or official SDK here.</div>
      </div>
    </div>
  );
}

function SmallCalculator({ onUse }: { onUse?: (result: string) => void }) {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function run() {
    try {
      // Very small arithmetic evaluator — keep safe
      // eslint-disable-next-line no-eval
      // NOTE: never use eval with untrusted input on servers. Here it's local demo only.
      // We'll restrict to digits, whitespace and math operators.
      if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
        setResult("Invalid characters");
        return;
      }
      // eslint-disable-next-line no-eval
      const r = eval(expr);
      setResult(String(r));
      onUse?.(`${expr} = ${r}`);
    } catch (err) {
      setResult("Error");
    }
  }

  return (
    <div className="mt-2">
      <input value={expr} onChange={(e) => setExpr(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="e.g. (12+5)*3" />
      <div className="flex gap-2 mt-2">
        <button onClick={run} className="px-3 py-1 rounded bg-slate-900 text-white text-sm">Calc</button>
        <button onClick={() => { setExpr(""); setResult(null); }} className="px-3 py-1 rounded border text-sm">Clear</button>
      </div>
      {result && <div className="mt-2 text-sm">Result: <span className="font-mono">{result}</span></div>}
    </div>
  );
}

// ------------------------- Page: layout + sections -----------------------
export default function FeaturesInteractive() {
  const { events, addSuggested, optimizeAll } = useMockSchedule();
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-900">
      <Helmet>
        <title>Features — VertexED (Interactive)</title>
        <meta name="description" content="Interactive tour of VertexED features — personalized study, AI calendar, smart notes, review, paper maker and study zone." />
      </Helmet>

      <header className="py-6 px-8 max-w-[1400px] mx-auto flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/10 w-10 h-10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white/90" />
          </div>
          <div className="text-white font-semibold">Vertex AI</div>
        </div>
        <nav className="ml-auto flex gap-6 text-sm text-white/70">
          <div>Home</div>
          <div>Features</div>
          <div>About</div>
          <div>Login</div>
          <button className="bg-white text-slate-900 px-3 py-1 rounded-full">Try Now</button>
        </nav>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 pb-20">
        {/* HERO */}
        <section className="relative overflow-hidden px-6 py-20 rounded-3xl animate-fade-in bg-gradient-to-b from-slate-50/90 to-slate-100/60 backdrop-blur-xl">
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-semibold leading-tight mb-6 text-neutral-900 tracking-tight">Powerful AI Features that improve learning & exam performance</h1>
            <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto text-neutral-800">We provide the complete toolkit — personalized, evidence-based learning workflows that build intuition and lift exam performance. As you scroll, explore how each part works together: schedule, recall, feedback, and real mock exams.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => window.scrollTo({ top: 620, behavior: 'smooth' })} className="px-4 py-2 rounded bg-slate-900 text-white">Explore features</button>
              <button onClick={() => window.scrollTo({ top: 1100, behavior: 'smooth' })} className="px-4 py-2 rounded border text-slate-900">See demo widgets</button>
            </div>
          </div>
        </section>

        {/* Calendar Showcase */}
        <section id="calendar" className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl p-6 bg-white/80 border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded bg-slate-100">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">AI Calendar — schedule optimized with evidence-based study blocks</h2>
                    <p className="text-sm text-slate-600 mt-1">Our calendar suggests focused sessions, spaced repetition flashcard bursts, and mock tests exactly when they help retention the most.</p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded border bg-slate-50">
                        <div className="text-xs text-slate-500">Upcoming</div>
                        {events.map((e) => (
                          <div key={e.id} className="mt-2 flex items-center justify-between">
                            <div>
                              <div className="font-medium">{e.title}</div>
                              <div className="text-xs text-slate-500">{e.day} · {formatMinutes(e.duration)}</div>
                            </div>
                            <div className="text-xs text-slate-400">{e.id}</div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded border bg-slate-50 flex flex-col gap-2">
                        <div className="text-xs text-slate-500">Calendar actions</div>
                        <div className="flex gap-2">
                          <button onClick={() => addSuggested()} className="px-3 py-1 rounded border text-sm">Add suggestion</button>
                          <button onClick={() => optimizeAll()} className="px-3 py-1 rounded bg-slate-900 text-white text-sm">Auto-optimize</button>
                        </div>
                        <div className="mt-2 text-xs text-slate-600">Tip: click "Auto-optimize" to compress long sessions into higher-effort shorter sessions — better for retention and concentration.</div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">Interactive flashcards</div>
                            <div className="text-xs text-slate-500">Contextual tips</div>
                          </div>
                          <div className="mt-2">
                            <button onClick={() => setShowFlashcards(true)} className="px-3 py-2 rounded border">Open flashcards</button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>

              <AnimatePresence>{showFlashcards && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4"><FlashcardDeck onClose={() => setShowFlashcards(false)} /></motion.div>}</AnimatePresence>
            </div>

            <div className="md:col-span-1">
              <div className="sticky top-24">
                <div className="rounded-2xl bg-white/80 p-4 border">
                  <div className="text-xs text-slate-500">Why this matters</div>
                  <h3 className="text-lg font-semibold mt-2">Evidence-based scheduling</h3>
                  <p className="text-sm text-slate-600 mt-1">Research shows spacing, interleaving and testing-effect lead to better long-term retention. Our calendar schedules these scientifically-proven elements automatically.</p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-slate-50 text-center">Spacing</div>
                    <div className="p-2 rounded bg-slate-50 text-center">Active recall</div>
                    <div className="p-2 rounded bg-slate-50 text-center">Interleaving</div>
                    <div className="p-2 rounded bg-slate-50 text-center">Regular mocks</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Smart Notes section */}
        <section id="smart-notes" className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div className="rounded-3xl p-6 bg-white/80 border" initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded bg-slate-100">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">Smart Notes — adapt to how you learn</h2>
                  <p className="text-sm text-slate-600 mt-1">Our notes tool recognizes structure and converts headings, lists, and highlights into flashcards and quick quizzes. Upload audio, transcribe and summarise in one click.</p>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <SmartNotesCard />
                    <div className="mt-2">
                      <AudioRecorder onTranscribe={(t) => setTranscript(t)} />
                      {transcript && <div className="mt-3 text-xs bg-slate-50 p-2 rounded">Transcription preview: <span className="font-mono block mt-1">{transcript}</span></div>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-2xl bg-white/80 p-4 border">
                <div className="text-xs text-slate-500">From notes → quizzes</div>
                <h3 className="text-lg font-semibold mt-2">One-click active recall</h3>
                <p className="text-sm text-slate-600 mt-1">Convert any highlighted passage into a set of flashcards or a quick quiz to test key points. Add timestamps from recordings to link evidence and context.</p>
                <div className="mt-3"><button className="px-3 py-2 rounded border">Create flashcards</button></div>
              </div>
            </div>
          </div>
        </section>

        {/* Answer Reviewer */}
        <section id="answer-review" className="mt-20">
          <motion.h3 className="text-2xl font-semibold">Answer Reviewer — teacher-level feedback</motion.h3>
          <p className="text-sm text-slate-600 mt-2">Detailed rubric-driven feedback that explains strengths, highlights curriculum-specific gaps, and suggests rewrites to improve both learning and exam performance.</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <AnswerReviewerCard />
            </div>
            <div>
              <div className="rounded-2xl bg-white/80 p-6 border">
                <div className="text-sm font-semibold">How it works</div>
                <ol className="mt-3 text-sm list-decimal list-inside text-slate-600">
                  <li>Analyze answer for structure, command-term alignment, and evidence.</li>
                  <li>Identify mis-interpretations & missing syllabus links.</li>
                  <li>Provide a scored rubric + a rewrite suggestion (thesis, examples, linking sentence).</li>
                </ol>

                <div className="mt-4 text-xs text-slate-500">Note: The reviewer models IB/IGCSE-style expectations, but you can configure it for any syllabus or marking scheme by providing rubric templates.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Paper Maker */}
        <section id="paper-maker" className="mt-20">
          <motion.h3 className="text-2xl font-semibold">Paper Maker — realistic mock exams</motion.h3>
          <p className="text-sm text-slate-600 mt-2">Constructs papers using distributions that mirror past questions, allows you to choose exam board, difficulty and mark allocation.</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <PaperMakerCard />
            </div>
            <div>
              <div className="rounded-2xl bg-white/80 p-6 border">
                <div className="text-sm font-semibold">Why this improves performance</div>
                <p className="mt-2 text-sm text-slate-600">Regular practice under exam-like conditions calibrates time management and exposes recurring question-types. Our paper maker helps you practice with tailored, graded mocks.</p>
                <div className="mt-3 text-xs text-slate-500">You can export papers to PDF and even attach mark schemes for self-marking or teacher review.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Chatbot */}
        <section id="chatbot" className="mt-20">
          <motion.h3 className="text-2xl font-semibold">Academic Chatbot — build intuition, not just memorization</motion.h3>
          <p className="text-sm text-slate-600 mt-2">A conversational tutor that helps students explore concepts, generate worked examples, and encourages active exploration of topics beyond rote learning.</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ChatbotPlayground />
            </div>
            <div>
              <div className="rounded-2xl bg-white/80 p-6 border">
                <div className="text-sm font-semibold">Instructor mode</div>
                <p className="mt-2 text-sm text-slate-600">Teachers can seed the bot with curriculum priorities and example answers to nudge feedback towards assessment objectives.</p>
                <div className="mt-3 text-xs text-slate-500">Use instructor mode to produce model answers, exam-style hints, and scaffolding prompts for students.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Study Zone */}
        <section id="study-zone" className="mt-20">
          <motion.h3 className="text-2xl font-semibold">Study Zone — all your tools in one dashboard</motion.h3>
          <p className="text-sm text-slate-600 mt-2">Activity log, calculators, graphing, quick flashcards and integrated resources so you never break flow while studying.</p>

          <div className="mt-4">
            <StudyZone />
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mt-24 mb-12 text-center">
          <div className="rounded-3xl p-10 bg-white/90 inline-block text-center">
            <h3 className="text-3xl font-semibold">Everything you need to study smarter, in one place</h3>
            <p className="mt-3 text-slate-600">Personalized, evidence-based workflows that help you understand deeply and perform better in exams.</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button className="px-4 py-2 rounded bg-slate-900 text-white">Get started — it's free</button>
              <button className="px-4 py-2 rounded border">See pricing & schools</button>
            </div>
          </div>
        </section>

      </main>

      <footer className="py-10 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} VertexED — Built for learners & teachers
      </footer>
    </div>
  );
}
