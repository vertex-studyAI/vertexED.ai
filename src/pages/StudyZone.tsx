import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import ReactMarkdown from "react-markdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AMBIENT_SOUNDS = [
  { id: "none", name: "None", url: null },
  { id: "rain", name: "Rain", url: "/assets/sounds/rain.mp3" },
  { id: "lofi", name: "Lo‑fi", url: "/assets/sounds/lofi.mp3" },
  { id: "cafe", name: "Café", url: "/assets/sounds/cafe.mp3" },
];

const STORAGE_KEYS = {
  tasks: "vz:tasks:v1",
  activity: "vz:activity:v1",
  notes: "vz:notes:v1",
  flashcards: "vz:flashcards:v1",
  progress: "vz:progress:v1",
  settings: "vz:settings:v1",
};

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }, [key, state]);
  return [state, setState];
}

export default function StudyZone() {
  // ===== Settings =====
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, {
    theme: "auto", // 'light' | 'dark' | 'auto'
    autoDark: true,
    soundVolume: 0.45,
    enableSoundAlerts: true,
  });

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    const preferDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = settings.theme === "auto" ? (settings.autoDark && preferDark ? "dark" : "light") : settings.theme;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings]);

  // ===== Activity log =====
  const [activity, setActivity] = useLocalStorage(STORAGE_KEYS.activity, []);
  function log(type, detail = null) {
    const entry = { id: uuidv4(), ts: new Date().toISOString(), type, detail };
    setActivity((prev) => [entry, ...prev].slice(0, 500));
  }

  // ===== Tasks =====
  const [tasks, setTasks] = useLocalStorage(STORAGE_KEYS.tasks, []);
  const [taskText, setTaskText] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");

  function addTask() {
    if (!taskText.trim()) return;
    const t = { id: uuidv4(), text: taskText.trim(), priority: taskPriority, done: false, createdAt: new Date().toISOString() };
    setTasks((p) => [t, ...p]);
    setTaskText("");
    log("TaskAdded", t.text);
  }
  function toggleTask(id) {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    log("TaskToggled", id);
  }
  function removeTask(id) {
    setTasks((p) => p.filter((t) => t.id !== id));
    log("TaskRemoved", id);
  }

  async function aiPrioritizeTasks() {
    // Send simple list of tasks to /api/aitasks — backend should call OpenAI or Vertex and return an ordered list
    try {
      const res = await axios.post("/api/aitasks", { tasks });
      if (res.data?.tasks) {
        setTasks(res.data.tasks);
        toast.success("Tasks prioritized by AI");
        log("AI", "Prioritized tasks");
      } else {
        toast.error("AI prioritization failed");
      }
    } catch (e) {
      toast.error("AI prioritization error");
    }
  }

  // ===== Notes (Markdown) =====
  const [notes, setNotes] = useLocalStorage(STORAGE_KEYS.notes, `# Notes

Start typing your study notes...
`);

  // ===== Flashcards =====
  const [flashcards, setFlashcards] = useLocalStorage(STORAGE_KEYS.flashcards, []);
  const [qText, setQText] = useState("");
  const [aText, setAText] = useState("");
  const [fcIndex, setFcIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  function addFlashcard() {
    if (!qText.trim()) return;
    const f = { id: uuidv4(), q: qText.trim(), a: aText.trim() };
    setFlashcards((p) => [f, ...p]);
    setQText("");
    setAText("");
    log("FlashcardAdded", f.q);
  }

  // ===== Ambient Sound =====
  const audioRef = useRef(null);
  const [sound, setSound] = useState("none");

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const s = AMBIENT_SOUNDS.find((it) => it.id === sound);
    if (!s || !s.url) return;
    const a = new Audio(s.url);
    a.loop = true;
    a.volume = settings.soundVolume ?? 0.45;
    a.play().catch(() => {});
    audioRef.current = a;
    return () => {
      a.pause();
    };
  }, [sound, settings.soundVolume]);

  // ===== Desmos iframe source (embed) =====
  const desmosSrc = useMemo(() => "https://www.desmos.com/calculator?embed&lang=en", []);

  // ===== Progress data & charts =====
  const [progress, setProgress] = useLocalStorage(STORAGE_KEYS.progress, []); // [{date: '2025-10-17', minutes: 25}]
  function recordProgress(minutes = 25) {
    const today = new Date().toLocaleDateString();
    setProgress((p) => {
      const copy = [...p];
      const idx = copy.findIndex((d) => d.date === today);
      if (idx >= 0) copy[idx].minutes += minutes;
      else copy.push({ date: today, minutes });
      return copy;
    });
  }

  // ===== Export / Import =====
  function exportAll() {
    const payload = { tasks, activity, notes, flashcards, progress, settings };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vertex-studyzone-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    log("Export", "Exported all data");
    toast.success("Exported data");
  }
  async function importAll(file) {
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.activity) setActivity(parsed.activity);
      if (parsed.notes) setNotes(parsed.notes);
      if (parsed.flashcards) setFlashcards(parsed.flashcards);
      if (parsed.progress) setProgress(parsed.progress);
      if (parsed.settings) setSettings(parsed.settings);
      toast.success("Imported data");
      log("Import", "Imported backup");
    } catch (e) {
      toast.error("Invalid backup file");
    }
  }

  // ===== Sync to Vercel (optional) =====
  async function pushSync() {
    try {
      await axios.post("/api/sync", { tasks, activity, notes, flashcards, progress });
      toast.success("Synced to server");
      log("Sync", "Pushed to server");
    } catch (e) {
      toast.error("Sync failed");
    }
  }

  // ===== AI Assistant =====
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  async function askAI() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await axios.post("/api/aiassistant", { prompt: aiPrompt });
      setAiReply(res.data?.reply ?? "(no reply)");
      log("AIQuery", aiPrompt);
      setAiPrompt("");
    } catch (e) {
      toast.error("AI request failed");
    } finally {
      setAiLoading(false);
    }
  }

  // ===== Enhanced Pomodoro Timer =====
  const [sessionMins, setSessionMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [seconds, setSeconds] = useState(sessionMins * 60);
  const timerRef = useRef(null);

  useEffect(() => {
    setSeconds((onBreak ? breakMins : sessionMins) * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionMins, breakMins]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isRunning]);

  useEffect(() => {
    if (seconds <= 0) {
      // play sound alert
      if (settings.enableSoundAlerts) {
        const beep = new Audio("/assets/sounds/notification.mp3");
        beep.volume = settings.soundVolume ?? 0.45;
        beep.play().catch(() => {});
      }
      // record session if ending a focus
      if (!onBreak) {
        recordProgress((sessionMins));
        log("FocusComplete", `${sessionMins}m`);
      }
      setOnBreak((b) => !b);
      setSeconds((prev) => (onBreak ? sessionMins * 60 : breakMins * 60));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  function startStop() {
    setIsRunning((r) => !r);
    log(isRunning ? "TimerPaused" : "TimerStarted");
  }
  function resetTimer() {
    setIsRunning(false);
    setOnBreak(false);
    setSeconds(sessionMins * 60);
    log("TimerReset");
  }

  function fmt(s) {
    const mm = Math.floor(Math.max(0, s) / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(Math.max(0, s) % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // ===== Small helpers =====
  function clearAllData() {
    if (!confirm("Reset all Study Zone data? This cannot be undone.")) return;
    setTasks([]);
    setActivity([]);
    setNotes(`# Notes
`);
    setFlashcards([]);
    setProgress([]);
    log("Reset", "User cleared data");
    toast.info("Data reset");
  }

  // ===== Render =====
  return (
    <>
      <Helmet>
        <title>Vertex — Study Zone</title>
        <meta name="description" content="Vertex Study Zone — Focus timer, tasks, notes, flashcards, AI assistant and more (Vercel-ready)." />
        <link rel="canonical" href="https://www.vertexed.app/study-zone" />
      </Helmet>

      <PageSection>
        <ToastContainer position="top-right" />
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>

        <h1 className="text-2xl font-semibold mb-4">Study Zone — Focus & Flow</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Timer, Desmos */}
          <NeumorphicCard className="p-6 md:col-span-2 h-96 overflow-auto">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-medium">Focus Timer</h2>
                <p className="opacity-70">Customizable Pomodoro with analytics, auto-recording and ambient environment.</p>
              </div>
              <div className="text-sm opacity-60">{onBreak ? "On Break" : "Focus"}</div>
            </div>

            <div className="mt-4 flex items-center gap-6">
              <div className="text-5xl font-mono">{fmt(seconds)}</div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button className="neu-button px-4 py-2" onClick={startStop}>{isRunning ? "Pause" : "Start"}</button>
                  <button className="neu-button px-4 py-2" onClick={resetTimer}>Reset</button>
                </div>
                <div className="flex gap-2 items-center mt-2">
                  <label className="text-sm opacity-70">Session</label>
                  <input type="number" min={5} max={180} value={sessionMins} onChange={(e) => setSessionMins(Number(e.target.value))} className="w-24" />
                  <label className="text-sm opacity-70">Break</label>
                  <input type="number" min={1} max={60} value={breakMins} onChange={(e) => setBreakMins(Number(e.target.value))} className="w-24" />
                </div>
                <div className="text-sm opacity-70 mt-2">Quick presets: <button className="neu-button px-2 py-1 ml-2" onClick={() => { setSessionMins(25); setBreakMins(5); setSeconds(25 * 60); }}>25/5</button>
                  <button className="neu-button px-2 py-1 ml-2" onClick={() => { setSessionMins(50); setBreakMins(10); setSeconds(50 * 60); }}>50/10</button>
                  <button className="neu-button px-2 py-1 ml-2" onClick={() => { setSessionMins(90); setBreakMins(15); setSeconds(90 * 60); }}>90/15</button>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-medium">Ambient</h3>
                <div className="flex gap-2 mt-2">
                  {AMBIENT_SOUNDS.map((s) => (
                    <button key={s.id} className={`neu-button px-3 py-1 ${sound === s.id ? "ring-2" : ""}`} onClick={() => setSound(sound === s.id ? "none" : s.id)}>{s.name}</button>
                  ))}
                </div>
                <div className="text-sm opacity-70 mt-3">Tip: use headphones for best focus. Volume in settings.</div>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Progress (last 14 days)</h3>
                <div className="h-36 mt-2">
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={progress.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="minutes" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="font-medium">Desmos Graphing</h3>
                <div className="border rounded mt-2 h-36 overflow-hidden">
                  <iframe title="Desmos" src={desmosSrc} className="w-full h-full" />
                </div>
                <div className="text-sm opacity-70 mt-2">Direct Desmos integration: to save & load graphs add a Desmos API proxy on your serverless functions.</div>
              </div>
            </div>
          </NeumorphicCard>

          {/* Right column: Tasks + AI Assistant */}
          <NeumorphicCard className="p-6 h-96 overflow-auto">
            <h2 className="text-xl font-medium">Study Tasks</h2>
            <p className="opacity-70">Organize tasks, mark done, and let AI suggest priorities.</p>

            <div className="mt-3 flex gap-2">
              <input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="New task" className="flex-1" />
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button className="neu-button px-3 py-1" onClick={addTask}>Add</button>
            </div>

            <div className="mt-3 space-y-2">
              {tasks.length === 0 ? <div className="opacity-60">No tasks yet — add one.</div> : null}
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
                    <div>
                      <div className={`font-medium ${t.done ? "line-through opacity-60" : ""}`}>{t.text}</div>
                      <div className="text-xs opacity-60">{t.priority} • {new Date(t.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="neu-button px-2 py-1" onClick={() => removeTask(t.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="neu-button px-3 py-1" onClick={() => aiPrioritizeTasks()}>AI Prioritize</button>
              <button className="neu-button px-3 py-1" onClick={() => { exportAll(); }}>Export</button>
              <label className="neu-button px-3 py-1 cursor-pointer">
                Import
                <input type="file" className="hidden" onChange={(e) => importAll(e.target.files?.[0])} />
              </label>
              <button className="neu-button px-3 py-1" onClick={() => pushSync()}>Sync</button>
            </div>

            <hr className="my-3" />

            <h3 className="font-medium">AI Assistant</h3>
            <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ask: e.g. 'Plan a 2-hour revision for Calculus'" className="w-full h-20 p-2" />
            <div className="flex gap-2 mt-2">
              <button className="neu-button px-3 py-1" onClick={() => askAI()} disabled={aiLoading}>{aiLoading ? "Thinking..." : "Ask AI"}</button>
              <button className="neu-button px-3 py-1" onClick={() => { setAiReply(""); setAiPrompt(""); }}>Clear</button>
            </div>
            <div className="mt-3 p-3 border rounded min-h-[80px]">
              <ReactMarkdown>{aiReply || "AI replies will appear here."}</ReactMarkdown>
            </div>
          </NeumorphicCard>
        </div>

        {/* Second row: Activity, Notes, Flashcards */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <NeumorphicCard className="p-6 h-64">
            <h3 className="font-medium mb-2">Activity Log</h3>
            <div className="h-44 overflow-auto text-sm space-y-2">
              {activity.length === 0 ? <div className="opacity-60">No activity yet — start a session or add a task.</div> : null}
              {activity.map((a) => (
                <div key={a.id} className="text-xs">
                  <div className="font-medium">{a.type}</div>
                  <div className="opacity-70">{a.detail}</div>
                  <div className="text-[11px] opacity-50">{new Date(a.ts).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="p-6 h-64">
            <h3 className="font-medium mb-2">Quick Notes (Markdown)</h3>
            <textarea className="w-full h-40 p-2 border rounded" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="mt-2">
              <div className="font-medium">Preview</div>
              <div className="mt-2 p-2 border rounded h-24 overflow-auto bg-white/5">
                <ReactMarkdown>{notes}</ReactMarkdown>
              </div>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="p-6 h-64 overflow-auto">
            <h3 className="font-medium mb-2">Flashcards</h3>
            <div className="flex gap-2">
              <input placeholder="Q" value={qText} onChange={(e) => setQText(e.target.value)} className="flex-1" />
              <input placeholder="A" value={aText} onChange={(e) => setAText(e.target.value)} className="flex-1" />
              <button className="neu-button px-3 py-1" onClick={addFlashcard}>Add</button>
            </div>

            <div className="mt-3">
              {flashcards.length > 0 ? (
                <div>
                  <div className="p-3 border rounded min-h-[60px]">
                    <div className="font-medium">Q: {flashcards[fcIndex]?.q}</div>
                    {showAnswer ? <div className="mt-2 opacity-80">A: {flashcards[fcIndex]?.a}</div> : null}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="neu-button px-3 py-1" onClick={() => setShowAnswer((s) => !s)}>{showAnswer ? "Hide" : "Show"}</button>
                    <button className="neu-button px-3 py-1" onClick={() => setFcIndex((i) => Math.max(0, i - 1))}>Prev</button>
                    <button className="neu-button px-3 py-1" onClick={() => setFcIndex((i) => Math.min(flashcards.length - 1, i + 1))}>Next</button>
                  </div>
                </div>
              ) : (
                <div className="opacity-60 text-sm">No flashcards yet.</div>
              )}
            </div>
          </NeumorphicCard>
        </div>

        {/* Third row: Tools & Settings */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <NeumorphicCard className="p-6 h-64">
            <h3 className="font-medium mb-2">Tools</h3>
            <div className="space-y-2 text-sm opacity-80">
              <div>• Calculator: basic expression eval (use mathjs for safety in production).</div>
              <div>• Export/Import: backup & restore your Study Zone data.</div>
              <div>• Sync: push to serverless `/api/sync` for Vercel/KV or Supabase backup.</div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="neu-button px-3 py-1" onClick={() => exportAll()}>Export All</button>
              <button className="neu-button px-3 py-1" onClick={() => pushSync()}>Sync Now</button>
              <button className="neu-button px-3 py-1" onClick={() => clearAllData()}>Reset Data</button>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="p-6 h-64">
            <h3 className="font-medium mb-2">Settings</h3>
            <div className="space-y-2 text-sm">
              <div>
                <label className="block">Theme</label>
                <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })}>
                  <option value="auto">Auto</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label className="block">Sound volume</label>
                <input type="range" min={0} max={1} step={0.01} value={settings.soundVolume} onChange={(e) => setSettings({ ...settings, soundVolume: Number(e.target.value) })} />
              </div>
              <div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={settings.enableSoundAlerts} onChange={(e) => setSettings({ ...settings, enableSoundAlerts: e.target.checked })} /> Enable sound alerts</label>
              </div>
            </div>
          </NeumorphicCard>
        </div>

      </PageSection>
    </>
  );
}
